begin;

-- Financial-domain identity hardening.
-- A course name is display data; enrollment.id is the financial identity of a
-- student's participation in a specific course. New financial obligations must
-- therefore resolve to an enrollment, not to a student/course-name pair.

-- 1) Complete the course relation on enrollments before making it authoritative.
update public.enrollments e
set course_id = c.id
from public.courses c
where e.course_id is null
  and c.name = e.course_name;

if exists (select 1 from public.enrollments where course_id is null) then
  raise exception 'ENROLLMENT_COURSE_LINK_MISSING';
end if;

alter table public.enrollments
  alter column course_id set not null;

create unique index if not exists enrollments_student_course_id_unique
  on public.enrollments(student_id, course_id);

-- The financial firewall must also freeze the course relation itself.
create or replace function public.enforce_enrollment_financial_firewall()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
     or new.student_id is distinct from old.student_id
     or new.course_id is distinct from old.course_id
     or new.course_name is distinct from old.course_name
     or new.course_value is distinct from old.course_value
     or new.created_at is distinct from old.created_at then
    raise exception 'ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

-- 2) Give every fee obligation the exact enrollment that created the obligation.
alter table public.fee_obligations
  add column if not exists enrollment_id uuid references public.enrollments(id) on delete restrict;

update public.fee_obligations f
set enrollment_id = e.id
from public.enrollments e
where f.enrollment_id is null
  and e.student_id = f.student_id
  and e.course_id = f.course_id;

if exists (select 1 from public.fee_obligations where enrollment_id is null) then
  raise exception 'FEE_OBLIGATION_ENROLLMENT_LINK_MISSING';
end if;

-- Ensure the historical student/course columns cannot disagree with the
-- authoritative enrollment identity.
if exists (
  select 1
  from public.fee_obligations f
  join public.enrollments e on e.id = f.enrollment_id
  where f.student_id is distinct from e.student_id
     or f.course_id is distinct from e.course_id
) then
  raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH';
end if;

alter table public.fee_obligations
  alter column enrollment_id set not null;

create index if not exists fee_obligations_enrollment_idx
  on public.fee_obligations(enrollment_id, created_at);

-- 3) New inserts may still arrive from older restore/client code with only the
-- legacy student/course columns. Resolve the authoritative enrollment at the
-- database boundary instead of trusting the caller's duplicated identity.
create or replace function public.resolve_fee_obligation_enrollment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrollment_id uuid;
begin
  if new.enrollment_id is null then
    select e.id into v_enrollment_id
    from public.enrollments e
    where e.id is not null
      and e.student_id = new.student_id
      and e.course_id = new.course_id;
    if v_enrollment_id is null then
      raise exception 'ENROLLMENT_REQUIRED_FOR_FEE_OBLIGATION';
    end if;
    new.enrollment_id := v_enrollment_id;
  end if;

  if not exists (
    select 1
    from public.enrollments e
    where e.id = new.enrollment_id
      and e.student_id = new.student_id
      and e.course_id = new.course_id
  ) then
    raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH';
  end if;

  return new;
end;
$$;

drop trigger if exists fee_obligations_resolve_enrollment on public.fee_obligations;
create trigger fee_obligations_resolve_enrollment
before insert on public.fee_obligations
for each row execute function public.resolve_fee_obligation_enrollment();

-- 4) Rebuild the allocation posting contract around enrollment identity.
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

  for a in select value from jsonb_array_elements(p_allocations)
  loop
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
      if v_amount > (v_course_fee - v_course_paid) then raise exception 'COURSE_ALLOCATION_EXCEEDS_REMAINING_BALANCE'; end if;

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
      where f.id = v_fee_id
        and f.student_id = p_student_id
        and f.cancelled_at is null;
      if v_fee_total is null then raise exception 'FEE_OBLIGATION_NOT_FOUND'; end if;

      select coalesce(sum(ra.amount), 0) into v_fee_paid
      from public.receipt_allocations ra
      join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
      where ra.fee_obligation_id = v_fee_id and rv.cancelled_at is null;
      if v_amount <> (v_fee_total - v_fee_paid) then raise exception 'FEE_MUST_BE_SETTLED_IN_FULL'; end if;

      v_external := v_external + v_fee_external;
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

  if v_summary_value = 0 then v_summary_value := p_amount; end if;
  perform set_config('app.receipt_posting', 'on', true);

  insert into public.receipt_vouchers
    (student_id, student_name_snapshot, voucher_date, course_name, course_value,
     amount_received, payer_name, notes, fee_category, external_share, allocation_mode)
  values
    (p_student_id, p_student_name, p_date, v_summary_name, v_summary_value,
     p_amount, p_payer_name, p_notes, v_fee_category, v_external, true)
  returning id, voucher_number into v_receipt_id, v_voucher_number;

  for a in select value from jsonb_array_elements(p_allocations)
  loop
    insert into public.receipt_allocations
      (receipt_voucher_id, allocation_type, enrollment_id, fee_obligation_id, amount)
    values
      (v_receipt_id, a->>'type', nullif(a->>'enrollment_id', '')::uuid,
       nullif(a->>'fee_obligation_id', '')::uuid, (a->>'amount')::numeric);
  end loop;

  return jsonb_build_object('id', v_receipt_id, 'voucher_number', v_voucher_number, 'amount_received', p_amount);
end;
$$;

revoke all on function public.post_receipt_with_allocations(jsonb) from public, anon;
grant execute on function public.post_receipt_with_allocations(jsonb) to authenticated;

commit;
