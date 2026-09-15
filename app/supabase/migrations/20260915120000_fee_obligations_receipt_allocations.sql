begin;

-- Student fees are obligations, not financial transactions. A fee is created from
-- the course context and becomes receivable for the student; cash/revenue changes
-- only when it is allocated to an actual receipt voucher.
create table if not exists public.fee_obligations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  course_id uuid references public.courses(id) on delete restrict,
  course_name text not null,
  description text not null,
  amount numeric(12,2) not null,
  fee_category text not null,
  external_share numeric(12,2) not null default 0,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint fee_obligations_amount_whole check (amount = trunc(amount)),
  constraint fee_obligations_amount_positive check (amount > 0),
  constraint fee_obligations_external_whole check (external_share = trunc(external_share)),
  constraint fee_obligations_external_nonnegative check (external_share >= 0),
  constraint fee_obligations_external_within_amount check (external_share <= amount),
  constraint fee_obligations_category_valid check (
    case
      when fee_category = 'institute' then external_share = 0
      when fee_category = 'external' then external_share = amount
      when fee_category = 'shared' then external_share > 0 and external_share < amount
      else false
    end
  )
);

create index if not exists fee_obligations_student_idx
  on public.fee_obligations (student_id, course_id, created_at);

alter table public.fee_obligations enable row level security;
revoke all on public.fee_obligations from anon, authenticated;
grant select, insert on public.fee_obligations to authenticated;

drop policy if exists fee_obligations_owner_select on public.fee_obligations;
create policy fee_obligations_owner_select on public.fee_obligations
  for select to authenticated using (public.is_owner());

drop policy if exists fee_obligations_owner_insert on public.fee_obligations;
create policy fee_obligations_owner_insert on public.fee_obligations
  for insert to authenticated with check (public.is_owner());

-- One physical receipt can settle several obligations. Each allocation is immutable
-- and points back to either an enrolment (course dues) or a fee obligation.
create table if not exists public.receipt_allocations (
  id uuid primary key default gen_random_uuid(),
  receipt_voucher_id uuid not null references public.receipt_vouchers(id) on delete cascade,
  allocation_type text not null,
  enrollment_id uuid references public.enrollments(id) on delete restrict,
  fee_obligation_id uuid references public.fee_obligations(id) on delete restrict,
  amount numeric(12,2) not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint receipt_allocations_type_valid check (
    allocation_type in ('course', 'fee')
  ),
  constraint receipt_allocations_amount_whole check (amount = trunc(amount)),
  constraint receipt_allocations_amount_positive check (amount > 0),
  constraint receipt_allocations_target_valid check (
    (allocation_type = 'course' and enrollment_id is not null and fee_obligation_id is null)
    or
    (allocation_type = 'fee' and fee_obligation_id is not null and enrollment_id is null)
  )
);

create index if not exists receipt_allocations_receipt_idx
  on public.receipt_allocations (receipt_voucher_id, created_at);
create index if not exists receipt_allocations_enrollment_idx
  on public.receipt_allocations (enrollment_id);
create index if not exists receipt_allocations_fee_idx
  on public.receipt_allocations (fee_obligation_id);

alter table public.receipt_allocations enable row level security;
revoke all on public.receipt_allocations from anon, authenticated;
grant select on public.receipt_allocations to authenticated;

drop policy if exists receipt_allocations_owner_select on public.receipt_allocations;
create policy receipt_allocations_owner_select on public.receipt_allocations
  for select to authenticated using (public.is_owner());

-- PR #95 introduced the receipt-level category for simple fees. Keep it backward
-- compatible, but add 'mixed' for a single receipt that contains course + fee and/or
-- multiple fee allocations. external_share remains the aggregate third-party share
-- represented by the receipt; the detailed source is receipt_allocations.
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

alter table public.receipt_vouchers
  add column if not exists allocation_mode boolean not null default false;

-- The financial firewall still freezes the receipt snapshot. Allocated receipts are
-- validated transactionally by post_receipt_with_allocations below; ordinary course
-- receipts keep their existing enrolment/remaining-balance checks.
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
       or new.external_share is distinct from old.external_share
       or new.allocation_mode is distinct from old.allocation_mode then
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

  if new.allocation_mode then
    if current_setting('app.receipt_posting', true) <> 'on' then
      raise exception 'ALLOCATED_RECEIPT_REQUIRES_POSTING_FUNCTION';
    end if;
    return new;
  end if;

  if new.fee_category is not null then
    return new;
  end if;

  lock_key := hashtextextended(new.student_id::text || ':' || new.course_name, 0);
  perform pg_advisory_xact_lock(lock_key);

  select e.course_value into enrollment_fee
  from public.enrollments e
  where e.student_id = new.student_id and e.course_name = new.course_name
  for share;

  if enrollment_fee is null then
    raise exception 'ENROLLMENT_REQUIRED';
  end if;

  if new.course_value is distinct from enrollment_fee then
    raise exception 'COURSE_VALUE_MUST_MATCH_ENROLLMENT';
  end if;

  select coalesce(sum(rv.amount_received), 0) into paid
  from public.receipt_vouchers rv
  where rv.student_id = new.student_id and rv.course_name = new.course_name
    and rv.cancelled_at is null
    and rv.fee_category is null
    and not rv.allocation_mode;

  remaining := enrollment_fee - paid;
  if new.amount_received > remaining then
    raise exception 'RECEIPT_EXCEEDS_REMAINING_BALANCE';
  end if;

  return new;
end;
$$;

-- Atomic posting function for one receipt with one or more course/fee allocations.
-- The caller supplies the student and allocation list; all checks and both inserts
-- happen in the same transaction. No second voucher, no payment voucher, no later
-- settlement.
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
  v_fee_category text := null;
  v_external numeric := 0;
  v_course_name text;
  v_course_value numeric;
  v_sum numeric := 0;
  v_receipt_id uuid;
  v_voucher_number bigint;
  a jsonb;
  v_type text;
  v_amount numeric;
  v_enrollment_id uuid;
  v_fee_id uuid;
  v_course_fee numeric;
  v_course_paid numeric;
  v_fee_total numeric;
  v_fee_paid numeric;
  v_lock bigint;
begin
  if not public.is_owner() then
    raise exception 'OWNER_ONLY';
  end if;

  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'INVALID_RECEIPT_PAYLOAD';
  end if;

  p_student_id := nullif(payload->>'student_id', '')::uuid;
  p_student_name := btrim(coalesce(payload->>'student_name', ''));
  p_date := (payload->>'voucher_date')::date;
  p_amount := (payload->>'amount_received')::numeric;
  p_payer_name := btrim(coalesce(payload->>'payer_name', ''));
  p_notes := btrim(coalesce(payload->>'notes', ''));
  p_allocations := payload->'allocations';

  if p_student_id is null or p_student_name = '' or p_date is null
     or p_amount is null or p_amount <= 0 or p_amount <> trunc(p_amount)
     or jsonb_typeof(p_allocations) <> 'array'
     or jsonb_array_length(p_allocations) = 0 then
    raise exception 'INVALID_RECEIPT_PAYLOAD';
  end if;

  if p_amount > 1000000 then
    raise exception 'RECEIPT_AMOUNT_TOO_LARGE';
  end if;

  select e.course_name, e.course_value into v_course_name, v_course_value
  from public.enrollments e
  where e.student_id = p_student_id
  order by e.created_at asc
  limit 1;

  if v_course_name is null then
    v_course_name := 'تحصيل متعدّد';
    v_course_value := p_amount;
  end if;

  for a in select value from jsonb_array_elements(p_allocations)
  loop
    v_type := a->>'type';
    v_amount := (a->>'amount')::numeric;
    v_sum := v_sum + coalesce(v_amount, 0);

    if v_amount is null or v_amount <= 0 or v_amount <> trunc(v_amount) then
      raise exception 'INVALID_RECEIPT_ALLOCATION';
    end if;

    if v_type = 'course' then
      v_enrollment_id := nullif(a->>'enrollment_id', '')::uuid;
      if v_enrollment_id is null then
        raise exception 'COURSE_ALLOCATION_REQUIRES_ENROLLMENT';
      end if;

      v_lock := hashtextextended('enrollment:' || v_enrollment_id::text, 0);
      perform pg_advisory_xact_lock(v_lock);

      select e.course_value into v_course_fee
      from public.enrollments e
      where e.id = v_enrollment_id and e.student_id = p_student_id
      for share;
      if v_course_fee is null then
        raise exception 'ENROLLMENT_NOT_FOUND';
      end if;

      select coalesce(sum(ra.amount), 0) into v_course_paid
      from public.receipt_allocations ra
      join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
      where ra.enrollment_id = v_enrollment_id
        and rv.cancelled_at is null;

      if v_amount > (v_course_fee - v_course_paid) then
        raise exception 'COURSE_ALLOCATION_EXCEEDS_REMAINING_BALANCE';
      end if;

    elsif v_type = 'fee' then
      v_fee_id := nullif(a->>'fee_obligation_id', '')::uuid;
      if v_fee_id is null then
        raise exception 'FEE_ALLOCATION_REQUIRES_OBLIGATION';
      end if;

      v_lock := hashtextextended('fee:' || v_fee_id::text, 0);
      perform pg_advisory_xact_lock(v_lock);

      select f.amount, f.external_share, f.fee_category into v_fee_total, v_fee_paid, v_fee_category
      from public.fee_obligations f
      where f.id = v_fee_id
        and f.student_id = p_student_id
        and f.cancelled_at is null;
      if v_fee_total is null then
        raise exception 'FEE_OBLIGATION_NOT_FOUND';
      end if;

      select coalesce(sum(ra.amount), 0) into v_fee_paid
      from public.receipt_allocations ra
      join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
      where ra.fee_obligation_id = v_fee_id
        and rv.cancelled_at is null;

      -- Fees are one-time assessments in this model: they are settled in full.
      if v_amount <> (v_fee_total - v_fee_paid) then
        raise exception 'FEE_MUST_BE_SETTLED_IN_FULL';
      end if;

      v_external := v_external + (v_fee_total - v_fee_paid) * 0 + (select f.external_share from public.fee_obligations f where f.id = v_fee_id);
    else
      raise exception 'INVALID_RECEIPT_ALLOCATION';
    end if;
  end loop;

  if v_sum <> p_amount then
    raise exception 'RECEIPT_ALLOCATION_TOTAL_MISMATCH';
  end if;

  if not exists (
    select 1 from jsonb_array_elements(p_allocations) a where a->>'type' = 'fee'
  ) then
    v_fee_category := null;
    v_external := 0;
  elsif exists (select 1 from jsonb_array_elements(p_allocations) a where a->>'type' = 'course') then
    v_fee_category := 'mixed';
  elsif (select count(distinct a->>'type') from jsonb_array_elements(p_allocations) a where a->>'type' = 'fee') = 1 then
    select case
      when bool_and(f.fee_category = 'institute') then 'institute'
      when bool_and(f.fee_category = 'external') then 'external'
      when bool_and(f.fee_category = 'shared') then 'shared'
      else 'mixed'
    end into v_fee_category
    from jsonb_array_elements(p_allocations) a
    join public.fee_obligations f on f.id = (a->>'fee_obligation_id')::uuid;
  else
    v_fee_category := 'mixed';
  end if;

  if v_fee_category is null then
    v_external := 0;
  end if;

  perform set_config('app.receipt_posting', 'on', true);

  insert into public.receipt_vouchers
    (student_id, student_name_snapshot, voucher_date, course_name, course_value,
     amount_received, payer_name, notes, fee_category, external_share, allocation_mode)
  values
    (p_student_id, p_student_name, p_date, v_course_name, v_course_value,
     p_amount, p_payer_name, p_notes, v_fee_category, v_external, true)
  returning id, voucher_number into v_receipt_id, v_voucher_number;

  for a in select value from jsonb_array_elements(p_allocations)
  loop
    insert into public.receipt_allocations
      (receipt_voucher_id, allocation_type, enrollment_id, fee_obligation_id, amount)
    values
      (v_receipt_id,
       a->>'type',
       nullif(a->>'enrollment_id', '')::uuid,
       nullif(a->>'fee_obligation_id', '')::uuid,
       (a->>'amount')::numeric);
  end loop;

  return jsonb_build_object(
    'id', v_receipt_id,
    'voucher_number', v_voucher_number,
    'amount_received', p_amount
  );
end;
$$;

revoke all on function public.post_receipt_with_allocations(jsonb) from public, anon;
grant execute on function public.post_receipt_with_allocations(jsonb) to authenticated;

-- Rebuild the statement read model. New allocated receipts expand into one line per
-- allocation so the student sees every purpose and the full total. Legacy receipts
-- keep the exact historical one-row-per-voucher semantics.
create or replace view public.student_statement_lines as
with allocated as (
  select
    ra.id,
    rv.voucher_number,
    rv.voucher_date,
    rv.student_id,
    rv.student_name_snapshot as student_name,
    case
      when ra.allocation_type = 'course' then en.course_name
      else fo.description
    end as course_name,
    case
      when ra.allocation_type = 'course' then en.course_value
      else fo.amount
    end as course_value,
    ra.amount as amount_received,
    rv.notes,
    rv.payer_name,
    rv.created_at,
    case
      when ra.allocation_type = 'course' then
        en.course_value - sum(ra.amount) over (
          partition by ra.enrollment_id
          order by rv.voucher_date, rv.voucher_number, ra.created_at, ra.id
          rows between unbounded preceding and current row
        )
      else
        fo.amount - sum(ra.amount) over (
          partition by ra.fee_obligation_id
          order by rv.voucher_date, rv.voucher_number, ra.created_at, ra.id
          rows between unbounded preceding and current row
        )
    end as remaining_balance
  from public.receipt_allocations ra
  join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
  left join public.enrollments en on en.id = ra.enrollment_id
  left join public.fee_obligations fo on fo.id = ra.fee_obligation_id
  where rv.cancelled_at is null
),
legacy as (
  select
    rv.id,
    rv.voucher_number,
    rv.voucher_date,
    rv.student_id,
    rv.student_name_snapshot as student_name,
    rv.course_name,
    coalesce(en.course_value, rv.course_value) as course_value,
    rv.amount_received,
    rv.notes,
    rv.payer_name,
    rv.created_at,
    coalesce(en.course_value, rv.course_value) - sum(rv.amount_received) over (
      partition by rv.student_id, rv.course_name
      order by rv.voucher_date, rv.voucher_number
      rows between unbounded preceding and current row
    ) as remaining_balance
  from public.receipt_vouchers rv
  left join public.enrollments en
    on en.student_id = rv.student_id and en.course_name = rv.course_name
  where rv.cancelled_at is null
    and not exists (
      select 1 from public.receipt_allocations ra where ra.receipt_voucher_id = rv.id
    )
)
select * from allocated
union all
select * from legacy;

alter view public.student_statement_lines set (security_invoker = true);

commit;
