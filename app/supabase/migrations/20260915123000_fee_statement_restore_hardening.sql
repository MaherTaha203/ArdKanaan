begin;

-- Statement metadata is appended to preserve the existing view column order while
-- allowing the application to distinguish course allocations from fee allocations.
create or replace view public.student_statement_lines as
with allocated as (
  select
    ra.id,
    rv.voucher_number,
    rv.voucher_date,
    rv.student_id,
    rv.student_name_snapshot as student_name,
    case when ra.allocation_type = 'course' then en.course_name else fo.description end as course_name,
    case when ra.allocation_type = 'course' then en.course_value else fo.amount end as course_value,
    ra.amount as amount_received,
    rv.notes,
    rv.payer_name,
    rv.created_at,
    case
      when ra.allocation_type = 'course' then en.course_value - sum(ra.amount) over (
        partition by ra.enrollment_id
        order by rv.voucher_date, rv.voucher_number, ra.created_at, ra.id
        rows between unbounded preceding and current row
      )
      else fo.amount - sum(ra.amount) over (
        partition by ra.fee_obligation_id
        order by rv.voucher_date, rv.voucher_number, ra.created_at, ra.id
        rows between unbounded preceding and current row
      )
    end as remaining_balance,
    ra.allocation_type as entry_type,
    ra.fee_obligation_id,
    ra.enrollment_id
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
    ) as remaining_balance,
    'course'::text as entry_type,
    null::uuid as fee_obligation_id,
    en.id as enrollment_id
  from public.receipt_vouchers rv
  left join public.enrollments en on en.student_id = rv.student_id and en.course_name = rv.course_name
  where rv.cancelled_at is null
    and not exists (select 1 from public.receipt_allocations ra where ra.receipt_voucher_id = rv.id)
)
select * from allocated
union all
select * from legacy;

alter view public.student_statement_lines set (security_invoker = true);

-- Replace the posting function with a cleaner, deterministic implementation. In
-- particular, the third-party share is read directly from each fee obligation and
-- is never confused with paid amount. Fee allocations must settle an obligation in
-- full, while course allocations may be partial.
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
  v_summary_value numeric;
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
      if v_summary_name = 'تحصيل متعدّد' then
        select e.course_name, e.course_value into v_summary_name, v_summary_value from public.enrollments e where e.id = v_enrollment_id;
      end if;

    elsif v_type = 'fee' then
      v_fee_count := v_fee_count + 1;
      v_fee_id := nullif(a->>'fee_obligation_id', '')::uuid;
      if v_fee_id is null then raise exception 'FEE_ALLOCATION_REQUIRES_OBLIGATION'; end if;
      v_lock := hashtextextended('fee:' || v_fee_id::text, 0);
      perform pg_advisory_xact_lock(v_lock);

      select f.amount, f.external_share, f.fee_category into v_fee_total, v_fee_external, v_fee_category
      from public.fee_obligations f
      where f.id = v_fee_id and f.student_id = p_student_id and f.cancelled_at is null;
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
      if v_summary_name = 'تحصيل متعدّد' then
        select f.description, f.amount into v_summary_name, v_summary_value from public.fee_obligations f where f.id = v_fee_id;
      end if;
    else
      raise exception 'INVALID_RECEIPT_ALLOCATION';
    end if;
  end loop;

  if v_sum <> p_amount then raise exception 'RECEIPT_ALLOCATION_TOTAL_MISMATCH'; end if;
  if v_fee_count = 0 then
    v_fee_category := null;
    v_external := 0;
  elsif v_course_count > 0 or v_institute_fee_count > 0 and v_external_fee_count > 0 or v_external_fee_count > 0 and v_shared_fee_count > 0 or v_institute_fee_count > 0 and v_shared_fee_count > 0 then
    v_fee_category := 'mixed';
  elsif v_external_fee_count > 0 then
    v_fee_category := 'external';
  elsif v_shared_fee_count > 0 then
    v_fee_category := 'shared';
  else
    v_fee_category := 'institute';
  end if;

  if v_summary_name = 'تحصيل متعدّد' then v_summary_value := p_amount; end if;
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
      (v_receipt_id, a->>'type', nullif(a->>'enrollment_id', '')::uuid, nullif(a->>'fee_obligation_id', '')::uuid, (a->>'amount')::numeric);
  end loop;

  return jsonb_build_object('id', v_receipt_id, 'voucher_number', v_voucher_number, 'amount_received', p_amount);
end;
$$;

revoke all on function public.post_receipt_with_allocations(jsonb) from public, anon;
grant execute on function public.post_receipt_with_allocations(jsonb) to authenticated;

-- Extend restore fidelity to include obligations and receipt allocations. Older
-- backups remain valid because the new arrays are optional.
create or replace function public.restore_center_data(payload jsonb, force boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s_in int; r_in int; p_in int;
  s_cur int; r_cur int; p_cur int;
  s_out int; r_out int; p_out int; e_out int; c_out int; f_out int; a_out int;
  courses jsonb; enrollments jsonb; fee_obligations jsonb; receipt_allocations jsonb;
  before_counts jsonb; after_counts jsonb;
  e jsonb;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null or jsonb_typeof(payload->'students') <> 'array' or jsonb_typeof(payload->'receipt_vouchers') <> 'array' or jsonb_typeof(payload->'payment_vouchers') <> 'array' then raise exception 'INVALID_BACKUP_FORMAT'; end if;

  courses := case when jsonb_typeof(payload->'courses') = 'array' then payload->'courses' else '[]'::jsonb end;
  enrollments := case when jsonb_typeof(payload->'enrollments') = 'array' then payload->'enrollments' else '[]'::jsonb end;
  fee_obligations := case when jsonb_typeof(payload->'fee_obligations') = 'array' then payload->'fee_obligations' else '[]'::jsonb end;
  receipt_allocations := case when jsonb_typeof(payload->'receipt_allocations') = 'array' then payload->'receipt_allocations' else '[]'::jsonb end;

  s_in := jsonb_array_length(payload->'students'); r_in := jsonb_array_length(payload->'receipt_vouchers'); p_in := jsonb_array_length(payload->'payment_vouchers');
  if s_in > 200000 or r_in > 1000000 or p_in > 1000000 then raise exception 'RESTORE_TOO_LARGE'; end if;
  select count(*) into s_cur from public.students; select count(*) into r_cur from public.receipt_vouchers; select count(*) into p_cur from public.payment_vouchers;
  if (s_in + r_in + p_in) = 0 and (s_cur + r_cur + p_cur) > 0 then raise exception 'RESTORE_REFUSED_EMPTY'; end if;
  if not force and (s_in < s_cur or r_in < r_cur or p_in < p_cur) then raise exception 'RESTORE_SHRINKS'; end if;

  before_counts := jsonb_build_object('students', s_cur, 'receipt_vouchers', r_cur, 'payment_vouchers', p_cur);
  perform set_config('app.restoring', 'on', true);
  delete from public.receipt_allocations; delete from public.receipt_vouchers; delete from public.payment_vouchers; delete from public.fee_obligations; delete from public.enrollments; delete from public.students; delete from public.courses;

  insert into public.courses (id, name, base_fee, start_date, end_date, status, notes, created_at, updated_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), e->>'name', nullif(e->>'base_fee', '')::numeric, nullif(e->>'start_date', '')::date, nullif(e->>'end_date', '')::date, coalesce(nullif(e->>'status', ''), 'active'), coalesce(e->>'notes', ''), coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), coalesce((e->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(courses) e;
  get diagnostics c_out = row_count;

  insert into public.students (id, name, id_number, phone, notes, created_at, updated_at)
  select (e->>'id')::uuid, e->>'name', e->>'id_number', e->>'phone', e->>'notes', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), coalesce((e->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(payload->'students') e;
  get diagnostics s_out = row_count;

  insert into public.enrollments (id, student_id, course_id, course_name, course_value, created_at, updated_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'student_id')::uuid, (select c.id from public.courses c where c.id = nullif(e->>'course_id', '')::uuid), e->>'course_name', (e->>'course_value')::numeric, coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), coalesce((e->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(enrollments) e on conflict (student_id, course_name) do nothing;
  get diagnostics e_out = row_count;

  insert into public.fee_obligations (id, student_id, course_id, course_name, description, amount, fee_category, external_share, cancelled_at, cancel_reason, created_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'student_id')::uuid, (select c.id from public.courses c where c.id = nullif(e->>'course_id', '')::uuid), e->>'course_name', e->>'description', (e->>'amount')::numeric, e->>'fee_category', coalesce((e->>'external_share')::numeric, 0), (e->>'cancelled_at')::timestamptz, e->>'cancel_reason', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(fee_obligations) e;
  get diagnostics f_out = row_count;

  insert into public.receipt_vouchers (id, voucher_number, voucher_date, student_id, student_name_snapshot, course_name, course_value, amount_received, payer_name, notes, cancelled_at, cancel_reason, created_at, fee_category, external_share, allocation_mode)
  overriding system value
  select (e->>'id')::uuid, (e->>'voucher_number')::bigint, (e->>'voucher_date')::date, (e->>'student_id')::uuid, e->>'student_name_snapshot', e->>'course_name', (e->>'course_value')::numeric, (e->>'amount_received')::numeric, coalesce(e->>'payer_name', ''), coalesce(e->>'notes', ''), (e->>'cancelled_at')::timestamptz, e->>'cancel_reason', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), nullif(e->>'fee_category', ''), coalesce((e->>'external_share')::numeric, 0), coalesce((e->>'allocation_mode')::boolean, false) from jsonb_array_elements(payload->'receipt_vouchers') e;
  get diagnostics r_out = row_count;

  insert into public.receipt_allocations (id, receipt_voucher_id, allocation_type, enrollment_id, fee_obligation_id, amount, created_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'receipt_voucher_id')::uuid, e->>'allocation_type', nullif(e->>'enrollment_id', '')::uuid, nullif(e->>'fee_obligation_id', '')::uuid, (e->>'amount')::numeric, coalesce((e->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(receipt_allocations) e;
  get diagnostics a_out = row_count;

  insert into public.payment_vouchers (id, voucher_number, voucher_date, expense_type, amount, notes, cancelled_at, cancel_reason, created_at)
  overriding system value
  select (e->>'id')::uuid, (e->>'voucher_number')::bigint, (e->>'voucher_date')::date, e->>'expense_type', (e->>'amount')::numeric, coalesce(e->>'notes', ''), (e->>'cancelled_at')::timestamptz, e->>'cancel_reason', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(payload->'payment_vouchers') e;
  get diagnostics p_out = row_count;

  perform setval(pg_get_serial_sequence('public.receipt_vouchers', 'voucher_number'), coalesce((select max(voucher_number) from public.receipt_vouchers), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.payment_vouchers', 'voucher_number'), coalesce((select max(voucher_number) from public.payment_vouchers), 0) + 1, false);
  after_counts := jsonb_build_object('students', s_out, 'courses', c_out, 'enrollments', e_out, 'fee_obligations', f_out, 'receipt_vouchers', r_out, 'receipt_allocations', a_out, 'payment_vouchers', p_out);
  insert into public.restore_log (restored_by, forced, before_counts, after_counts) values (auth.uid(), force, before_counts, after_counts);
  insert into public.audit_log (entity, action, label, changed_by, old_data, new_data) values ('restore', 'restore', 'استعادة نسخة احتياطيّة', auth.uid(), before_counts, after_counts);
  return after_counts;
end;
$$;

revoke all on function public.restore_center_data(jsonb, boolean) from public, anon;
grant execute on function public.restore_center_data(jsonb, boolean) to authenticated;

commit;
