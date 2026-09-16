begin;

-- Restore is the only controlled bypass of normal financial immutability. It must
-- therefore validate the complete financial graph before deleting live data.
-- In particular, the old restore path used (student_id, course_name), which is
-- no longer the financial identity of an enrollment.
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
  v_id uuid;
  v_student uuid;
  v_course uuid;
  v_enrollment uuid;
  v_receipt uuid;
  v_fee uuid;
  v_amount numeric;
  v_sum numeric;
  v_course_name text;
  v_course_value numeric;
  v_fee_total numeric;
  v_fee_external numeric;
  v_allocation_count int;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null
     or jsonb_typeof(payload->'students') <> 'array'
     or jsonb_typeof(payload->'receipt_vouchers') <> 'array'
     or jsonb_typeof(payload->'payment_vouchers') <> 'array' then
    raise exception 'INVALID_BACKUP_FORMAT';
  end if;

  courses := case when jsonb_typeof(payload->'courses') = 'array' then payload->'courses' else '[]'::jsonb end;
  enrollments := case when jsonb_typeof(payload->'enrollments') = 'array' then payload->'enrollments' else '[]'::jsonb end;
  fee_obligations := case when jsonb_typeof(payload->'fee_obligations') = 'array' then payload->'fee_obligations' else '[]'::jsonb end;
  receipt_allocations := case when jsonb_typeof(payload->'receipt_allocations') = 'array' then payload->'receipt_allocations' else '[]'::jsonb end;

  s_in := jsonb_array_length(payload->'students');
  r_in := jsonb_array_length(payload->'receipt_vouchers');
  p_in := jsonb_array_length(payload->'payment_vouchers');
  if s_in > 200000 or r_in > 1000000 or p_in > 1000000 then raise exception 'RESTORE_TOO_LARGE'; end if;

  select count(*) into s_cur from public.students;
  select count(*) into r_cur from public.receipt_vouchers;
  select count(*) into p_cur from public.payment_vouchers;
  if (s_in + r_in + p_in) = 0 and (s_cur + r_cur + p_cur) > 0 then raise exception 'RESTORE_REFUSED_EMPTY'; end if;
  if not force and (s_in < s_cur or r_in < r_cur or p_in < p_cur) then raise exception 'RESTORE_SHRINKS'; end if;

  -- Validate all referenced identities before the destructive phase.
  for e in select value from jsonb_array_elements(enrollments) loop
    v_student := nullif(e->>'student_id', '')::uuid;
    v_course := nullif(e->>'course_id', '')::uuid;
    if v_student is null or v_course is null or nullif(e->>'course_name', '') is null or (e->>'course_value')::numeric is null then
      raise exception 'INVALID_ENROLLMENT_BACKUP';
    end if;
    select c.name, c.base_fee into v_course_name, v_course_value
    from jsonb_array_elements(courses) c0
    cross join lateral (select c0->>'name' as name, (c0->>'base_fee')::numeric as base_fee) c
    where (c0->>'id')::uuid = v_course;
    if v_course_name is null then raise exception 'RESTORE_ENROLLMENT_COURSE_NOT_FOUND'; end if;
    if e->>'course_name' is distinct from v_course_name or (e->>'course_value')::numeric is distinct from v_course_value then
      raise exception 'ENROLLMENT_FINANCIAL_SNAPSHOT_MISMATCH';
    end if;
  end loop;

  for e in select value from jsonb_array_elements(fee_obligations) loop
    v_student := nullif(e->>'student_id', '')::uuid;
    v_course := nullif(e->>'course_id', '')::uuid;
    v_enrollment := nullif(e->>'enrollment_id', '')::uuid;
    if v_student is null or v_course is null or v_enrollment is null or (e->>'amount')::numeric is null then
      raise exception 'INVALID_FEE_BACKUP';
    end if;
    if not exists (
      select 1 from jsonb_array_elements(enrollments) x
      where (x->>'id')::uuid = v_enrollment
        and (x->>'student_id')::uuid = v_student
        and (x->>'course_id')::uuid = v_course
        and x->>'course_name' = e->>'course_name'
    ) then
      raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH';
    end if;
    v_fee_total := (e->>'amount')::numeric;
    v_fee_external := coalesce((e->>'external_share')::numeric, 0);
    if v_fee_total <= 0 or v_fee_external < 0 or v_fee_external > v_fee_total then raise exception 'INVALID_FEE_BACKUP'; end if;
    if e->>'fee_category' not in ('institute','external','shared') then raise exception 'INVALID_FEE_CATEGORY'; end if;
    if (e->>'fee_category') = 'institute' and v_fee_external <> 0 then raise exception 'INVALID_FEE_EXTERNAL_SHARE'; end if;
    if (e->>'fee_category') = 'external' and v_fee_external <> v_fee_total then raise exception 'INVALID_FEE_EXTERNAL_SHARE'; end if;
    if (e->>'fee_category') = 'shared' and (v_fee_external <= 0 or v_fee_external >= v_fee_total) then raise exception 'INVALID_FEE_EXTERNAL_SHARE'; end if;
  end loop;

  -- Every allocation must point to exactly one valid target belonging to the
  -- receipt's student, and every receipt's allocations must sum to its amount.
  for e in select value from jsonb_array_elements(receipt_allocations) loop
    v_receipt := nullif(e->>'receipt_voucher_id', '')::uuid;
    v_student := null;
    v_enrollment := nullif(e->>'enrollment_id', '')::uuid;
    v_fee := nullif(e->>'fee_obligation_id', '')::uuid;
    v_amount := (e->>'amount')::numeric;
    if v_receipt is null or v_amount is null or v_amount <= 0 then raise exception 'INVALID_RECEIPT_ALLOCATION_BACKUP'; end if;
    if e->>'allocation_type' not in ('course','fee') then raise exception 'INVALID_RECEIPT_ALLOCATION_BACKUP'; end if;
    if e->>'allocation_type' = 'course' then
      if v_enrollment is null or v_fee is not null then raise exception 'INVALID_COURSE_ALLOCATION_BACKUP'; end if;
      select (x->>'student_id')::uuid into v_student from jsonb_array_elements(enrollments) x where (x->>'id')::uuid = v_enrollment;
      if v_student is null then raise exception 'ALLOCATION_ENROLLMENT_NOT_FOUND'; end if;
    else
      if v_fee is null or v_enrollment is not null then raise exception 'INVALID_FEE_ALLOCATION_BACKUP'; end if;
      select (x->>'student_id')::uuid into v_student from jsonb_array_elements(fee_obligations) x where (x->>'id')::uuid = v_fee;
      if v_student is null then raise exception 'ALLOCATION_FEE_NOT_FOUND'; end if;
    end if;
    if not exists (select 1 from jsonb_array_elements(payload->'receipt_vouchers') rv where (rv->>'id')::uuid = v_receipt and (rv->>'student_id')::uuid = v_student) then
      raise exception 'RECEIPT_ALLOCATION_STUDENT_MISMATCH';
    end if;
  end loop;

  for e in select value from jsonb_array_elements(payload->'receipt_vouchers') loop
    v_receipt := (e->>'id')::uuid;
    v_amount := (e->>'amount_received')::numeric;
    select coalesce(sum((a->>'amount')::numeric), 0), count(*) into v_sum, v_allocation_count
    from jsonb_array_elements(receipt_allocations) a
    where (a->>'receipt_voucher_id')::uuid = v_receipt;
    if v_allocation_count = 0 then
      -- Legacy receipts are retained without invented allocations.
      if coalesce((e->>'allocation_mode')::boolean, false) then raise exception 'ALLOCATION_REQUIRED_FOR_MODERN_RECEIPT'; end if;
    elsif v_sum <> v_amount then
      raise exception 'RESTORE_RECEIPT_ALLOCATION_TOTAL_MISMATCH';
    end if;
  end loop;

  before_counts := jsonb_build_object('students', s_cur, 'receipt_vouchers', r_cur, 'payment_vouchers', p_cur);
  perform set_config('app.restoring', 'on', true);
  delete from public.receipt_allocations;
  delete from public.receipt_vouchers;
  delete from public.payment_vouchers;
  delete from public.fee_obligations;
  delete from public.enrollments;
  delete from public.students;
  delete from public.courses;

  insert into public.courses (id, name, base_fee, start_date, end_date, status, notes, created_at, updated_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), e->>'name', nullif(e->>'base_fee', '')::numeric, nullif(e->>'start_date', '')::date, nullif(e->>'end_date', '')::date, coalesce(nullif(e->>'status', ''), 'active'), coalesce(e->>'notes', ''), coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), coalesce((e->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(courses) e;
  get diagnostics c_out = row_count;

  insert into public.students (id, name, id_number, phone, notes, created_at, updated_at)
  select (e->>'id')::uuid, e->>'name', e->>'id_number', e->>'phone', e->>'notes', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), coalesce((e->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(payload->'students') e;
  get diagnostics s_out = row_count;

  insert into public.enrollments (id, student_id, course_id, course_name, course_value, created_at, updated_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'student_id')::uuid, (e->>'course_id')::uuid, e->>'course_name', (e->>'course_value')::numeric, coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), coalesce((e->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(enrollments) e;
  get diagnostics e_out = row_count;

  insert into public.fee_obligations (id, student_id, enrollment_id, course_id, course_name, description, amount, fee_category, external_share, cancelled_at, cancel_reason, created_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'student_id')::uuid, (e->>'enrollment_id')::uuid, (e->>'course_id')::uuid, e->>'course_name', e->>'description', (e->>'amount')::numeric, e->>'fee_category', coalesce((e->>'external_share')::numeric, 0), (e->>'cancelled_at')::timestamptz, e->>'cancel_reason', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(fee_obligations) e;
  get diagnostics f_out = row_count;

  insert into public.receipt_vouchers (id, voucher_number, voucher_date, student_id, student_name_snapshot, course_name, course_value, amount_received, payer_name, notes, cancelled_at, cancel_reason, created_at, fee_category, external_share, allocation_mode, idempotency_key, idempotency_payload_hash)
  overriding system value
  select (e->>'id')::uuid, (e->>'voucher_number')::bigint, (e->>'voucher_date')::date, (e->>'student_id')::uuid, e->>'student_name_snapshot', e->>'course_name', (e->>'course_value')::numeric, (e->>'amount_received')::numeric, coalesce(e->>'payer_name', ''), coalesce(e->>'notes', ''), (e->>'cancelled_at')::timestamptz, e->>'cancel_reason', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), nullif(e->>'fee_category', ''), coalesce((e->>'external_share')::numeric, 0), coalesce((e->>'allocation_mode')::boolean, false), nullif(e->>'idempotency_key', '')::uuid, nullif(e->>'idempotency_payload_hash', '') from jsonb_array_elements(payload->'receipt_vouchers') e;
  get diagnostics r_out = row_count;

  insert into public.receipt_allocations (id, receipt_voucher_id, allocation_type, enrollment_id, fee_obligation_id, amount, external_share, created_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'receipt_voucher_id')::uuid, e->>'allocation_type', nullif(e->>'enrollment_id', '')::uuid, nullif(e->>'fee_obligation_id', '')::uuid, (e->>'amount')::numeric, coalesce((e->>'external_share')::numeric, 0), coalesce((e->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(receipt_allocations) e;
  get diagnostics a_out = row_count;

  insert into public.payment_vouchers (id, voucher_number, voucher_date, expense_type, amount, notes, cancelled_at, cancel_reason, created_at)
  overriding system value
  select (e->>'id')::uuid, (e->>'voucher_number')::bigint, (e->>'voucher_date')::date, e->>'expense_type', (e->>'amount')::numeric, coalesce(e->>'notes', ''), (e->>'cancelled_at')::timestamptz, e->>'cancel_reason', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(payload->'payment_vouchers') e;
  get diagnostics p_out = row_count;

  -- Rebuild missing fingerprints for restored idempotent receipts when the
  -- backup predates the fingerprint column.
  update public.receipt_vouchers rv
  set idempotency_payload_hash = md5((jsonb_build_object(
    'student_id', rv.student_id::text,
    'student_name', rv.student_name_snapshot,
    'voucher_date', rv.voucher_date::text,
    'amount_received', rv.amount_received,
    'payer_name', rv.payer_name,
    'notes', rv.notes,
    'allocations', coalesce((select jsonb_agg(jsonb_build_object(
      'type', ra.allocation_type,
      'enrollment_id', ra.enrollment_id,
      'fee_obligation_id', ra.fee_obligation_id,
      'amount', ra.amount
    ) order by ra.allocation_type, coalesce(ra.enrollment_id::text, ''), coalesce(ra.fee_obligation_id::text, ''), ra.amount) from public.receipt_allocations ra where ra.receipt_voucher_id = rv.id), '[]'::jsonb)
  ))::text)
  where rv.idempotency_key is not null and rv.idempotency_payload_hash is null;

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
