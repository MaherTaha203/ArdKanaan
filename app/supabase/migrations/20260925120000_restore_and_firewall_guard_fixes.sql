-- Corrective migration: fix restore + direct-insert firewall guards (F1/F2/F3).
-- Presentation/safety hardening only. No financial formula, ledger, student-statement,
-- voucher, or allocation semantics are changed. Idempotent (create or replace).
-- F1: restore_center_data reused PL/pgSQL var `e` as the jsonb_array_elements(...) alias,
--     aborting every non-empty restore with 'column reference "e" is ambiguous' under the
--     default plpgsql.variable_conflict=error. Fixed by renaming the 7 INSERT aliases to `src`.
-- F2: backup format check was NULL-blind (jsonb_typeof(x) <> 'array' is NULL when a key is
--     absent) and silently coerced four sections to '[]'. Now every required section must be
--     present AND a JSON array, rejected before any destructive statement.
-- F3: direct-insert firewalls used current_setting(...,true) <> 'on' (NULL when the GUC is
--     unset -> never raised). Now `is distinct from 'on'` so an unset/wrong GUC is rejected.

CREATE OR REPLACE FUNCTION public.restore_center_data(payload jsonb, force boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  if payload is null or jsonb_typeof(payload) <> 'object'
     or jsonb_typeof(payload->'students') is distinct from 'array'
     or jsonb_typeof(payload->'courses') is distinct from 'array'
     or jsonb_typeof(payload->'enrollments') is distinct from 'array'
     or jsonb_typeof(payload->'fee_obligations') is distinct from 'array'
     or jsonb_typeof(payload->'receipt_vouchers') is distinct from 'array'
     or jsonb_typeof(payload->'receipt_allocations') is distinct from 'array'
     or jsonb_typeof(payload->'payment_vouchers') is distinct from 'array' then
    raise exception 'INVALID_BACKUP_FORMAT';
  end if;

  courses := payload->'courses';
  enrollments := payload->'enrollments';
  fee_obligations := payload->'fee_obligations';
  receipt_allocations := payload->'receipt_allocations';

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
  select coalesce((src->>'id')::uuid, gen_random_uuid()), src->>'name', nullif(src->>'base_fee', '')::numeric, nullif(src->>'start_date', '')::date, nullif(src->>'end_date', '')::date, coalesce(nullif(src->>'status', ''), 'active'), coalesce(src->>'notes', ''), coalesce((src->>'created_at')::timestamptz, timezone('utc', now())), coalesce((src->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(courses) src;
  get diagnostics c_out = row_count;

  insert into public.students (id, name, id_number, phone, notes, created_at, updated_at)
  select (src->>'id')::uuid, src->>'name', src->>'id_number', src->>'phone', src->>'notes', coalesce((src->>'created_at')::timestamptz, timezone('utc', now())), coalesce((src->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(payload->'students') src;
  get diagnostics s_out = row_count;

  insert into public.enrollments (id, student_id, course_id, course_name, course_value, created_at, updated_at)
  select coalesce((src->>'id')::uuid, gen_random_uuid()), (src->>'student_id')::uuid, (src->>'course_id')::uuid, src->>'course_name', (src->>'course_value')::numeric, coalesce((src->>'created_at')::timestamptz, timezone('utc', now())), coalesce((src->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(enrollments) src;
  get diagnostics e_out = row_count;

  insert into public.fee_obligations (id, student_id, enrollment_id, course_id, course_name, description, amount, fee_category, external_share, cancelled_at, cancel_reason, created_at)
  select coalesce((src->>'id')::uuid, gen_random_uuid()), (src->>'student_id')::uuid, (src->>'enrollment_id')::uuid, (src->>'course_id')::uuid, src->>'course_name', src->>'description', (src->>'amount')::numeric, src->>'fee_category', coalesce((src->>'external_share')::numeric, 0), (src->>'cancelled_at')::timestamptz, src->>'cancel_reason', coalesce((src->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(fee_obligations) src;
  get diagnostics f_out = row_count;

  insert into public.receipt_vouchers (id, voucher_number, voucher_date, student_id, student_name_snapshot, course_name, course_value, amount_received, payer_name, notes, cancelled_at, cancel_reason, created_at, fee_category, external_share, allocation_mode, idempotency_key, idempotency_payload_hash)
  overriding system value
  select (src->>'id')::uuid, (src->>'voucher_number')::bigint, (src->>'voucher_date')::date, (src->>'student_id')::uuid, src->>'student_name_snapshot', src->>'course_name', (src->>'course_value')::numeric, (src->>'amount_received')::numeric, coalesce(src->>'payer_name', ''), coalesce(src->>'notes', ''), (src->>'cancelled_at')::timestamptz, src->>'cancel_reason', coalesce((src->>'created_at')::timestamptz, timezone('utc', now())), nullif(src->>'fee_category', ''), coalesce((src->>'external_share')::numeric, 0), coalesce((src->>'allocation_mode')::boolean, false), nullif(src->>'idempotency_key', '')::uuid, nullif(src->>'idempotency_payload_hash', '') from jsonb_array_elements(payload->'receipt_vouchers') src;
  get diagnostics r_out = row_count;

  insert into public.receipt_allocations (id, receipt_voucher_id, allocation_type, enrollment_id, fee_obligation_id, amount, external_share, created_at)
  select coalesce((src->>'id')::uuid, gen_random_uuid()), (src->>'receipt_voucher_id')::uuid, src->>'allocation_type', nullif(src->>'enrollment_id', '')::uuid, nullif(src->>'fee_obligation_id', '')::uuid, (src->>'amount')::numeric, coalesce((src->>'external_share')::numeric, 0), coalesce((src->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(receipt_allocations) src;
  get diagnostics a_out = row_count;

  insert into public.payment_vouchers (id, voucher_number, voucher_date, expense_type, amount, notes, cancelled_at, cancel_reason, created_at)
  overriding system value
  select (src->>'id')::uuid, (src->>'voucher_number')::bigint, (src->>'voucher_date')::date, src->>'expense_type', (src->>'amount')::numeric, coalesce(src->>'notes', ''), (src->>'cancelled_at')::timestamptz, src->>'cancel_reason', coalesce((src->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(payload->'payment_vouchers') src;
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
$function$;

CREATE OR REPLACE FUNCTION public.enforce_financial_firewall()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  if current_setting('app.receipt_posting', true) is distinct from 'on' then
    raise exception 'RECEIPT_POSTING_RPC_REQUIRED';
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_payment_financial_firewall()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
       or new.expense_type is distinct from old.expense_type
       or new.amount is distinct from old.amount
       or new.idempotency_key is distinct from old.idempotency_key then
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

  if current_setting('app.payment_posting', true) is distinct from 'on' then
    raise exception 'PAYMENT_POSTING_RPC_REQUIRED';
  end if;

  return new;
end;
$function$;
