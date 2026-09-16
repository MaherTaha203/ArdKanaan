begin;

-- Financial integrity hardening: the receipt RPC is the sole normal posting path.
-- Direct client inserts must never bypass allocation/enrollment validation.
create or replace function public.enforce_financial_firewall()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  enrollment_fee numeric;
  paid numeric;
  remaining numeric;
  lock_key bigint;
begin
  if current_setting('app.restoring', true) = 'on' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.cancelled_at is not null then
      raise exception 'CANCELLED_VOUCHER_IS_IMMUTABLE';
    end if;

    if new.voucher_number is distinct from old.voucher_number
       or new.voucher_date is distinct from old.voucher_date
       or new.student_id is distinct from old.student_id
       or new.student_name_snapshot is distinct from old.student_name_snapshot
       or new.course_name is distinct from old.course_name
       or new.course_value is distinct from old.course_value
       or new.amount_received is distinct from old.amount_received
       or new.fee_category is distinct from old.fee_category
       or new.external_share is distinct from old.external_share then
      raise exception 'FINANCIAL_FIELDS_IMMUTABLE';
    end if;

    if new.cancelled_at is not null
       and nullif(btrim(new.cancel_reason), '') is null then
      raise exception 'CANCELLATION_REASON_REQUIRED';
    end if;

    return new;
  end if;

  if new.cancelled_at is not null
     and nullif(btrim(new.cancel_reason), '') is null then
    raise exception 'CANCELLATION_REASON_REQUIRED';
  end if;

  -- Normal receipt creation is allowed only from the atomic posting RPC.
  -- That RPC validates student -> enrollment/obligation -> allocation before
  -- inserting the voucher and then inserts its allocations in the same tx.
  if current_setting('app.receipt_posting', true) <> 'on' then
    raise exception 'RECEIPT_POSTING_RPC_REQUIRED';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_financial_firewall() from public, anon, authenticated;

-- Mixed receipts are valid: a single receipt may contain course allocations,
-- institute fees, external fees, or shared fees. external_share is the
-- portion of this receipt held for others. A course + institute-only fee can
-- legitimately have external_share = 0; external-share conservation is checked
-- by the allocation-level split in the final posting RPC.
alter table public.receipt_vouchers
  drop constraint if exists receipt_vouchers_fee_distribution_valid;

alter table public.receipt_vouchers
  add constraint receipt_vouchers_fee_distribution_valid check (
    case
      when fee_category is null then external_share = 0
      when fee_category = 'institute' then external_share = 0
      when fee_category = 'external' then external_share = amount_received
      when fee_category = 'shared' then external_share > 0 and external_share < amount_received
      when fee_category = 'mixed' then external_share >= 0 and external_share <= amount_received
      else false
    end
  );

-- Re-posting function: fee obligations may now be paid partially and repeatedly.
-- The final authoritative implementation is replaced by the later idempotency
-- migration; this definition remains here for migration-order safety.
create or replace function public.post_receipt_with_allocations(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_student_id uuid;
  p_student_name text;
  p_date date;
  p_amount numeric;
  p_payer_name text;
  p_notes text;
  p_allocations jsonb;
  v_sum numeric := 0;
  v_external numeric := 0;
  v_fee_count int := 0;
  v_course_count int := 0;
  v_institute_fee_count int := 0;
  v_external_fee_count int := 0;
  v_shared_fee_count int := 0;
  v_receipt_id uuid;
  v_voucher_number bigint;
  v_summary_name text := 'تحصيل متعدّد';
  v_summary_value numeric := 0;
  a jsonb;
  v_type text;
  v_amount numeric;
  v_enrollment_id uuid;
  v_fee_id uuid;
  v_course_fee numeric;
  v_course_paid numeric;
  v_fee_total numeric;
  v_fee_paid numeric;
  v_fee_external numeric;
  v_fee_category text;
  v_lock bigint;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object' then raise exception 'INVALID_RECEIPT_PAYLOAD'; end if;

  p_student_id := nullif(payload->>'student_id', '')::uuid;
  p_student_name := btrim(coalesce(payload->>'student_name', ''));
  p_date := nullif(payload->>'voucher_date', '')::date;
  p_amount := (payload->>'amount_received')::numeric;
  p_payer_name := btrim(coalesce(payload->>'payer_name', ''));
  p_notes := btrim(coalesce(payload->>'notes', ''));
  p_allocations := payload->'allocations';

  if p_student_id is null or p_student_name = '' or p_date is null
     or p_amount is null or p_amount <= 0 or p_amount <> trunc(p_amount)
     or jsonb_typeof(p_allocations) <> 'array' or jsonb_array_length(p_allocations) = 0 then
    raise exception 'INVALID_RECEIPT_PAYLOAD';
  end if;
  if p_amount > 1000000 then raise exception 'RECEIPT_AMOUNT_TOO_LARGE'; end if;

  for a in select value from jsonb_array_elements(p_allocations) loop
    v_type := a->>'type';
    v_amount := (a->>'amount')::numeric;
    if v_amount is null or v_amount <= 0 or v_amount <> trunc(v_amount) then
      raise exception 'INVALID_RECEIPT_ALLOCATION';
    end if;
    v_sum := v_sum + v_amount;

    if v_type = 'course' then
      v_course_count := v_course_count + 1;
      v_enrollment_id := nullif(a->>'enrollment_id', '')::uuid;
      if v_enrollment_id is null then raise exception 'COURSE_ALLOCATION_REQUIRES_ENROLLMENT'; end if;
      v_lock := hashtextextended('enrollment:' || v_enrollment_id::text, 0);
      perform pg_advisory_xact_lock(v_lock);

      select e.course_value into v_course_fee
      from public.enrollments e
      where e.id = v_enrollment_id and e.student_id = p_student_id
      for share;
      if v_course_fee is null then raise exception 'ENROLLMENT_NOT_FOUND'; end if;

      select coalesce(sum(ra.amount), 0) into v_course_paid
      from public.receipt_allocations ra
      join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
      where ra.enrollment_id = v_enrollment_id and rv.cancelled_at is null;
      if v_amount > (v_course_fee - v_course_paid) then
        raise exception 'COURSE_ALLOCATION_EXCEEDS_REMAINING_BALANCE';
      end if;

      if v_summary_value = 0 then
        select e.course_name, e.course_value into v_summary_name, v_summary_value
        from public.enrollments e where e.id = v_enrollment_id;
      end if;

    elsif v_type = 'fee' then
      v_fee_count := v_fee_count + 1;
      v_fee_id := nullif(a->>'fee_obligation_id', '')::uuid;
      if v_fee_id is null then raise exception 'FEE_ALLOCATION_REQUIRES_OBLIGATION'; end if;
      v_lock := hashtextextended('fee:' || v_fee_id::text, 0);
      perform pg_advisory_xact_lock(v_lock);

      select f.amount, f.external_share, f.fee_category
      into v_fee_total, v_fee_external, v_fee_category
      from public.fee_obligations f
      where f.id = v_fee_id and f.student_id = p_student_id and f.cancelled_at is null;
      if v_fee_total is null then raise exception 'FEE_OBLIGATION_NOT_FOUND'; end if;

      select coalesce(sum(ra.amount), 0) into v_fee_paid
      from public.receipt_allocations ra
      join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
      where ra.fee_obligation_id = v_fee_id and rv.cancelled_at is null;
      if v_amount > (v_fee_total - v_fee_paid) then
        raise exception 'FEE_ALLOCATION_EXCEEDS_REMAINING_BALANCE';
      end if;

      if v_fee_total <= 0 then raise exception 'INVALID_FEE_OBLIGATION'; end if;
      v_external := v_external + round(v_amount * v_fee_external / v_fee_total, 2);

      if v_fee_category = 'institute' then v_institute_fee_count := v_institute_fee_count + 1;
      elsif v_fee_category = 'external' then v_external_fee_count := v_external_fee_count + 1;
      else v_shared_fee_count := v_shared_fee_count + 1;
      end if;

      if v_summary_value = 0 then
        select f.description, f.amount into v_summary_name, v_summary_value
        from public.fee_obligations f where f.id = v_fee_id;
      end if;
    else
      raise exception 'INVALID_RECEIPT_ALLOCATION';
    end if;
  end loop;

  if v_sum <> p_amount then raise exception 'RECEIPT_ALLOCATION_TOTAL_MISMATCH'; end if;

  if v_fee_count = 0 then
    v_fee_category := null;
    v_external := 0;
  elsif v_course_count > 0
     or (v_institute_fee_count > 0 and v_external_fee_count > 0)
     or (v_external_fee_count > 0 and v_shared_fee_count > 0)
     or (v_institute_fee_count > 0 and v_shared_fee_count > 0) then
    v_fee_category := 'mixed';
  elsif v_external_fee_count > 0 then
    v_fee_category := 'external';
  elsif v_shared_fee_count > 0 then
    v_fee_category := 'shared';
  else
    v_fee_category := 'institute';
  end if;

  if v_external > p_amount then raise exception 'INVALID_EXTERNAL_SHARE'; end if;
  if v_fee_category = 'external' and v_external <> p_amount then
    raise exception 'EXTERNAL_SHARE_MISMATCH';
  end if;
  if v_summary_value = 0 then v_summary_value := p_amount; end if;

  perform set_config('app.receipt_posting', 'on', true);

  insert into public.receipt_vouchers
    (student_id, student_name_snapshot, voucher_date, course_name, course_value,
     amount_received, payer_name, notes, fee_category, external_share, allocation_mode)
  values
    (p_student_id, p_student_name, p_date, v_summary_name, v_summary_value,
     p_amount, p_payer_name, p_notes, v_fee_category, v_external, true)
  returning id, voucher_number into v_receipt_id, v_voucher_number;

  for a in select value from jsonb_array_elements(p_allocations) loop
    insert into public.receipt_allocations
      (receipt_voucher_id, allocation_type, enrollment_id, fee_obligation_id, amount)
    values
      (v_receipt_id, a->>'type', nullif(a->>'enrollment_id', '')::uuid,
       nullif(a->>'fee_obligation_id', '')::uuid, (a->>'amount')::numeric);
  end loop;

  return jsonb_build_object('id', v_receipt_id, 'voucher_number', v_voucher_number,
                           'amount_received', p_amount);
end;
$$;

revoke all on function public.post_receipt_with_allocations(jsonb) from public, anon;
grant execute on function public.post_receipt_with_allocations(jsonb) to authenticated;

-- The financial identity of a fee remains the enrollment, not the course name.
-- Existing fee obligations are already linked by enrollment_id; enforce that
-- relationship on every subsequent update as well.
create or replace function public.enforce_fee_obligation_financial_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.enrollment_id is null then raise exception 'FEE_OBLIGATION_ENROLLMENT_REQUIRED'; end if;
  if not exists (
    select 1 from public.enrollments e
    where e.id = new.enrollment_id
      and e.student_id = new.student_id
      and e.course_id = new.course_id
  ) then
    raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH';
  end if;
  return new;
end;
$$;

drop trigger if exists fee_obligations_financial_identity on public.fee_obligations;
create trigger fee_obligations_financial_identity
before insert or update on public.fee_obligations
for each row execute function public.enforce_fee_obligation_financial_identity();

commit;
