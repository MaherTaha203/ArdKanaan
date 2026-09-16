begin;

-- ---------------------------------------------------------------------------
-- Receipt external-share precision
-- Partial fee payments can legitimately produce fractional third-party shares
-- (e.g. 33/100 of a 40-shekel external share = 13.20). The receipt stores
-- money to 2 decimals, so do not reject these valid derived values.
-- ---------------------------------------------------------------------------
alter table public.receipt_vouchers
  drop constraint if exists receipt_vouchers_external_share_whole_shekel;

-- Preserve the existing non-negative and within-receipt guards.

-- ---------------------------------------------------------------------------
-- Preserve the fee-level external allocation on every receipt allocation.
-- This removes ambiguity when one physical receipt contains several fees.
-- ---------------------------------------------------------------------------
alter table public.receipt_allocations
  add column if not exists external_share numeric(12,2) not null default 0;

alter table public.receipt_allocations
  drop constraint if exists receipt_allocations_external_share_nonnegative,
  drop constraint if exists receipt_allocations_external_share_within_amount;

alter table public.receipt_allocations
  add constraint receipt_allocations_external_share_nonnegative
    check (external_share >= 0),
  add constraint receipt_allocations_external_share_within_amount
    check (external_share <= amount),
  add constraint receipt_allocations_external_share_course_zero
    check (allocation_type <> 'course' or external_share = 0);

-- Existing allocation rows predate the per-allocation split and are legacy
-- records. Keep them intact; new fee postings always populate this field.

-- ---------------------------------------------------------------------------
-- Idempotent receipt posting.
-- The caller supplies one UUID per logical receipt attempt. A retry with the
-- same key returns the original receipt instead of creating duplicate cash.
-- ---------------------------------------------------------------------------
alter table public.receipt_vouchers
  add column if not exists idempotency_key uuid;

create unique index if not exists receipt_vouchers_idempotency_key_uidx
  on public.receipt_vouchers (idempotency_key)
  where idempotency_key is not null;

-- ---------------------------------------------------------------------------
-- Financial obligations are snapshots. Once created, their identity, amount,
-- category and description cannot be edited. Cancellation is the only normal
-- mutation; a replacement obligation must be created instead.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_fee_obligation_financial_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return new;
  end if;

  if new.enrollment_id is null then
    raise exception 'FEE_OBLIGATION_ENROLLMENT_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.enrollments e
    where e.id = new.enrollment_id
      and e.student_id = new.student_id
      and e.course_id = new.course_id
      and e.course_name = new.course_name
  ) then
    raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH';
  end if;

  if tg_op = 'UPDATE' then
    if old.cancelled_at is not null then
      raise exception 'CANCELLED_FEE_OBLIGATION_IS_IMMUTABLE';
    end if;

    if new.id is distinct from old.id
       or new.student_id is distinct from old.student_id
       or new.enrollment_id is distinct from old.enrollment_id
       or new.course_id is distinct from old.course_id
       or new.course_name is distinct from old.course_name
       or new.description is distinct from old.description
       or new.amount is distinct from old.amount
       or new.fee_category is distinct from old.fee_category
       or new.external_share is distinct from old.external_share
       or new.created_at is distinct from old.created_at then
      raise exception 'FEE_OBLIGATION_FINANCIAL_FIELDS_IMMUTABLE';
    end if;

    if old.cancelled_at is null and new.cancelled_at is not null
       and nullif(btrim(new.cancel_reason), '') is null then
      raise exception 'FEE_CANCELLATION_REASON_REQUIRED';
    end if;

    if old.cancelled_at is not null and new.cancelled_at is distinct from old.cancelled_at then
      raise exception 'CANCELLED_FEE_OBLIGATION_IS_IMMUTABLE';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists fee_obligations_financial_identity on public.fee_obligations;
create trigger fee_obligations_financial_identity
before insert or update on public.fee_obligations
for each row execute function public.enforce_fee_obligation_financial_identity();

-- Fees are obligations, not deletable transactions. Cancellation is the audit
-- preserving reversal mechanism; hard deletion is reserved for controlled restore.
create or replace function public.prevent_financial_obligation_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return old;
  end if;
  raise exception 'FINANCIAL_OBLIGATION_DELETE_FORBIDDEN';
end;
$$;

drop trigger if exists fee_obligations_prevent_delete on public.fee_obligations;
create trigger fee_obligations_prevent_delete
before delete on public.fee_obligations
for each row execute function public.prevent_financial_obligation_delete();

-- ---------------------------------------------------------------------------
-- Receipt allocations are immutable facts. They may not be edited or deleted
-- independently of their parent receipt.
-- ---------------------------------------------------------------------------
create or replace function public.prevent_receipt_allocation_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;
  raise exception 'RECEIPT_ALLOCATION_IMMUTABLE';
end;
$$;

drop trigger if exists receipt_allocations_prevent_update on public.receipt_allocations;
create trigger receipt_allocations_prevent_update
before update on public.receipt_allocations
for each row execute function public.prevent_receipt_allocation_mutation();

drop trigger if exists receipt_allocations_prevent_delete on public.receipt_allocations;
create trigger receipt_allocations_prevent_delete
before delete on public.receipt_allocations
for each row execute function public.prevent_receipt_allocation_mutation();

-- Prevent direct hard deletion of receipts. Existing cancellation remains the
-- supported operational reversal and keeps the audit trail intact.
create or replace function public.prevent_receipt_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return old;
  end if;
  raise exception 'RECEIPT_DELETE_FORBIDDEN';
end;
$$;

drop trigger if exists receipt_vouchers_prevent_delete on public.receipt_vouchers;
create trigger receipt_vouchers_prevent_delete
before delete on public.receipt_vouchers
for each row execute function public.prevent_receipt_delete();

-- ---------------------------------------------------------------------------
-- Owner-only, enrollment-scoped fee creation. The client never supplies the
-- financial identity by itself: the database resolves each selected student to
-- the existing enrollment for this exact course.
-- ---------------------------------------------------------------------------
create or replace function public.create_fee_obligations(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_course_id uuid;
  p_student_ids jsonb;
  p_description text;
  p_amount numeric;
  p_category text;
  p_external numeric;
  v_student_id uuid;
  v_enrollment_id uuid;
  v_course_name text;
  v_count int := 0;
  v_missing int := 0;
  item jsonb;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object' then raise exception 'INVALID_FEE_PAYLOAD'; end if;

  p_course_id := nullif(payload->>'course_id', '')::uuid;
  p_student_ids := payload->'student_ids';
  p_description := btrim(coalesce(payload->>'description', ''));
  p_amount := (payload->>'amount')::numeric;
  p_category := payload->>'fee_category';
  p_external := coalesce((payload->>'external_share')::numeric, 0);

  if p_course_id is null
     or jsonb_typeof(p_student_ids) <> 'array'
     or jsonb_array_length(p_student_ids) = 0
     or p_description = ''
     or p_amount is null or p_amount <= 0 or p_amount <> trunc(p_amount)
     or p_category not in ('institute','external','shared')
     or p_external < 0 or p_external > p_amount
     or (p_category = 'institute' and p_external <> 0)
     or (p_category = 'external' and p_external <> p_amount)
     or (p_category = 'shared' and (p_external <= 0 or p_external >= p_amount)) then
    raise exception 'INVALID_FEE_PAYLOAD';
  end if;

  perform 1 from public.courses c where c.id = p_course_id;
  if not found then raise exception 'COURSE_NOT_FOUND'; end if;

  -- Lock and validate the entire target set before inserting any obligation.
  for item in select value from jsonb_array_elements(p_student_ids) loop
    v_student_id := nullif(item #>> '{}', '')::uuid;
    if v_student_id is null then raise exception 'INVALID_STUDENT_ID'; end if;

    select e.id, e.course_name into v_enrollment_id, v_course_name
    from public.enrollments e
    where e.student_id = v_student_id and e.course_id = p_course_id
    for share;

    if v_enrollment_id is null then
      v_missing := v_missing + 1;
    end if;
  end loop;

  if v_missing > 0 then
    raise exception 'ENROLLMENT_REQUIRED_FOR_SELECTED_STUDENTS';
  end if;

  for item in select value from jsonb_array_elements(p_student_ids) loop
    v_student_id := nullif(item #>> '{}', '')::uuid;
    select e.id, e.course_name into v_enrollment_id, v_course_name
    from public.enrollments e
    where e.student_id = v_student_id and e.course_id = p_course_id;

    insert into public.fee_obligations
      (student_id, enrollment_id, course_id, course_name, description, amount,
       fee_category, external_share)
    values
      (v_student_id, v_enrollment_id, p_course_id, v_course_name, p_description,
       p_amount, p_category, p_external);
    v_count := v_count + 1;
  end loop;

  return jsonb_build_object('created', v_count);
end;
$$;

revoke all on function public.create_fee_obligations(jsonb) from public, anon;
grant execute on function public.create_fee_obligations(jsonb) to authenticated;

commit;
