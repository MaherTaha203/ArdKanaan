-- Backup/restore fidelity for the courses catalog (additive).
-- Redefines restore_center_data to also restore `courses` and to carry
-- `enrollments.course_id` through. Both stay OPTIONAL so older backups restore
-- unchanged. Courses are NOT in the RESTORE_SHRINKS guard (that guard protects
-- financial records; a smaller catalog must not block a valid financial backup).

create or replace function public.restore_center_data(payload jsonb, force boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s_in int; r_in int; p_in int;
  s_cur int; r_cur int; p_cur int;
  s_out int; r_out int; p_out int; e_out int; c_out int;
  courses jsonb;
  enrollments jsonb;
  before_counts jsonb;
  after_counts jsonb;
begin
  if not public.is_owner() then
    raise exception 'OWNER_ONLY';
  end if;

  if payload is null
     or jsonb_typeof(payload->'students') <> 'array'
     or jsonb_typeof(payload->'receipt_vouchers') <> 'array'
     or jsonb_typeof(payload->'payment_vouchers') <> 'array' then
    raise exception 'INVALID_BACKUP_FORMAT';
  end if;

  courses := case when jsonb_typeof(payload->'courses') = 'array'
                  then payload->'courses' else '[]'::jsonb end;
  enrollments := case when jsonb_typeof(payload->'enrollments') = 'array'
                      then payload->'enrollments' else '[]'::jsonb end;

  s_in := jsonb_array_length(payload->'students');
  r_in := jsonb_array_length(payload->'receipt_vouchers');
  p_in := jsonb_array_length(payload->'payment_vouchers');

  if s_in > 200000 or r_in > 1000000 or p_in > 1000000 then
    raise exception 'RESTORE_TOO_LARGE';
  end if;

  select count(*) into s_cur from public.students;
  select count(*) into r_cur from public.receipt_vouchers;
  select count(*) into p_cur from public.payment_vouchers;

  if (s_in + r_in + p_in) = 0 and (s_cur + r_cur + p_cur) > 0 then
    raise exception 'RESTORE_REFUSED_EMPTY';
  end if;

  if not force and (s_in < s_cur or r_in < r_cur or p_in < p_cur) then
    raise exception 'RESTORE_SHRINKS students=%->% receipts=%->% payments=%->%',
      s_cur, s_in, r_cur, r_in, p_cur, p_in;
  end if;

  before_counts := jsonb_build_object('students', s_cur, 'receipt_vouchers', r_cur, 'payment_vouchers', p_cur);

  perform set_config('app.restoring', 'on', true);

  delete from public.receipt_vouchers;
  delete from public.payment_vouchers;
  delete from public.enrollments;
  delete from public.students;
  delete from public.courses;

  insert into public.courses (id, name, base_fee, start_date, end_date, status, notes, created_at, updated_at)
  select
    coalesce((e->>'id')::uuid, gen_random_uuid()), e->>'name',
    nullif(e->>'base_fee', '')::numeric,
    nullif(e->>'start_date', '')::date, nullif(e->>'end_date', '')::date,
    coalesce(nullif(e->>'status', ''), 'active'), coalesce(e->>'notes', ''),
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now())),
    coalesce((e->>'updated_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(courses) e;
  get diagnostics c_out = row_count;

  insert into public.students (id, name, id_number, phone, notes, created_at, updated_at)
  select
    (e->>'id')::uuid, e->>'name', e->>'id_number', e->>'phone', e->>'notes',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now())),
    coalesce((e->>'updated_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'students') e;
  get diagnostics s_out = row_count;

  insert into public.enrollments (id, student_id, course_id, course_name, course_value, created_at, updated_at)
  select
    coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'student_id')::uuid,
    (select c.id from public.courses c where c.id = nullif(e->>'course_id', '')::uuid),
    e->>'course_name', (e->>'course_value')::numeric,
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now())),
    coalesce((e->>'updated_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(enrollments) e
  on conflict (student_id, course_name) do nothing;
  get diagnostics e_out = row_count;

  insert into public.receipt_vouchers
    (id, voucher_number, voucher_date, student_id, student_name_snapshot, course_name,
     course_value, amount_received, payer_name, notes, cancelled_at, cancel_reason, created_at)
  overriding system value
  select
    (e->>'id')::uuid, (e->>'voucher_number')::bigint, (e->>'voucher_date')::date,
    (e->>'student_id')::uuid, e->>'student_name_snapshot', e->>'course_name',
    (e->>'course_value')::numeric, (e->>'amount_received')::numeric,
    coalesce(e->>'payer_name', ''), coalesce(e->>'notes', ''),
    (e->>'cancelled_at')::timestamptz, e->>'cancel_reason',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'receipt_vouchers') e;
  get diagnostics r_out = row_count;

  insert into public.payment_vouchers
    (id, voucher_number, voucher_date, expense_type, amount, notes, cancelled_at, cancel_reason, created_at)
  overriding system value
  select
    (e->>'id')::uuid, (e->>'voucher_number')::bigint, (e->>'voucher_date')::date,
    e->>'expense_type', (e->>'amount')::numeric, coalesce(e->>'notes', ''),
    (e->>'cancelled_at')::timestamptz, e->>'cancel_reason',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'payment_vouchers') e;
  get diagnostics p_out = row_count;

  perform setval(
    pg_get_serial_sequence('public.receipt_vouchers', 'voucher_number'),
    coalesce((select max(voucher_number) from public.receipt_vouchers), 0) + 1, false);
  perform setval(
    pg_get_serial_sequence('public.payment_vouchers', 'voucher_number'),
    coalesce((select max(voucher_number) from public.payment_vouchers), 0) + 1, false);

  after_counts := jsonb_build_object(
    'students', s_out, 'courses', c_out, 'enrollments', e_out,
    'receipt_vouchers', r_out, 'payment_vouchers', p_out);

  insert into public.restore_log (restored_by, forced, before_counts, after_counts)
  values (auth.uid(), force, before_counts, after_counts);

  insert into public.audit_log (entity, action, label, changed_by, old_data, new_data)
  values ('restore', 'restore', 'استعادة نسخة احتياطيّة', auth.uid(), before_counts, after_counts);

  return after_counts;
end;
$$;

revoke all on function public.restore_center_data(jsonb, boolean) from public, anon;
grant execute on function public.restore_center_data(jsonb, boolean) to authenticated;