-- Phase 7 — atomic restore.
--
-- Restore replaces ALL center data from a backup payload. A plpgsql function runs
-- inside a single implicit transaction, so it is atomic: if any row is malformed
-- the whole restore rolls back and the existing data is left untouched. Voucher
-- numbers are preserved (OVERRIDING SYSTEM VALUE on the GENERATED ALWAYS identity),
-- and the identity sequences are re-seeded past the restored maximum so new
-- vouchers continue correctly. SECURITY DEFINER + grant to authenticated only.

create or replace function public.restore_center_data(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s_count int;
  r_count int;
  p_count int;
begin
  if payload is null
     or jsonb_typeof(payload->'students') <> 'array'
     or jsonb_typeof(payload->'receipt_vouchers') <> 'array'
     or jsonb_typeof(payload->'payment_vouchers') <> 'array' then
    raise exception 'INVALID_BACKUP_FORMAT';
  end if;

  -- Wipe in FK-safe order (vouchers reference students).
  delete from public.receipt_vouchers;
  delete from public.payment_vouchers;
  delete from public.students;

  insert into public.students (id, name, id_number, phone, notes, created_at, updated_at)
  select
    (e->>'id')::uuid,
    e->>'name',
    e->>'id_number',
    e->>'phone',
    e->>'notes',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now())),
    coalesce((e->>'updated_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'students') e;
  get diagnostics s_count = row_count;

  insert into public.receipt_vouchers
    (id, voucher_number, voucher_date, student_id, student_name_snapshot, course_name,
     course_value, amount_received, payer_name, notes, cancelled_at, cancel_reason, created_at)
  overriding system value
  select
    (e->>'id')::uuid,
    (e->>'voucher_number')::bigint,
    (e->>'voucher_date')::date,
    (e->>'student_id')::uuid,
    e->>'student_name_snapshot',
    e->>'course_name',
    (e->>'course_value')::numeric,
    (e->>'amount_received')::numeric,
    coalesce(e->>'payer_name', ''),
    coalesce(e->>'notes', ''),
    (e->>'cancelled_at')::timestamptz,
    e->>'cancel_reason',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'receipt_vouchers') e;
  get diagnostics r_count = row_count;

  insert into public.payment_vouchers
    (id, voucher_number, voucher_date, expense_type, amount, notes, cancelled_at, cancel_reason, created_at)
  overriding system value
  select
    (e->>'id')::uuid,
    (e->>'voucher_number')::bigint,
    (e->>'voucher_date')::date,
    e->>'expense_type',
    (e->>'amount')::numeric,
    coalesce(e->>'notes', ''),
    (e->>'cancelled_at')::timestamptz,
    e->>'cancel_reason',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'payment_vouchers') e;
  get diagnostics p_count = row_count;

  -- Re-seed identity sequences so the next voucher continues past the restored max.
  perform setval(
    pg_get_serial_sequence('public.receipt_vouchers', 'voucher_number'),
    coalesce((select max(voucher_number) from public.receipt_vouchers), 0) + 1,
    false
  );
  perform setval(
    pg_get_serial_sequence('public.payment_vouchers', 'voucher_number'),
    coalesce((select max(voucher_number) from public.payment_vouchers), 0) + 1,
    false
  );

  return jsonb_build_object(
    'students', s_count,
    'receipt_vouchers', r_count,
    'payment_vouchers', p_count
  );
end;
$$;

revoke all on function public.restore_center_data(jsonb) from public, anon;
grant execute on function public.restore_center_data(jsonb) to authenticated;
