-- Harden restore against data loss.
--
-- The previous restore_center_data accepted any arrays — including empty ones —
-- and wiped everything before re-inserting, with no trace. On a real financial
-- system that is an unrecoverable-data-loss footgun. This version:
--   * refuses an empty payload outright (never wipe-to-empty via "restore"),
--   * refuses a payload that SHRINKS any table unless the caller passes force=true
--     (so the client can show an explicit "this backup has fewer records" prompt),
--   * caps payload size to prevent resource-exhaustion abuse,
--   * records every restore (actor, before/after counts, forced) in restore_log.
-- It stays a single atomic transaction: any failure rolls back with data intact.

create table if not exists public.restore_log (
  id uuid primary key default gen_random_uuid(),
  restored_by uuid,
  restored_at timestamptz not null default timezone('utc', now()),
  forced boolean not null default false,
  before_counts jsonb,
  after_counts jsonb
);

alter table public.restore_log enable row level security;
revoke all on public.restore_log from anon, authenticated;
grant select on public.restore_log to authenticated;
drop policy if exists restore_log_select on public.restore_log;
create policy restore_log_select on public.restore_log for select to authenticated using (true);

-- Replace the RPC with a guarded, logged, force-aware version.
drop function if exists public.restore_center_data(jsonb);

create or replace function public.restore_center_data(payload jsonb, force boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s_in int; r_in int; p_in int;
  s_cur int; r_cur int; p_cur int;
  s_out int; r_out int; p_out int;
  before_counts jsonb;
begin
  if payload is null
     or jsonb_typeof(payload->'students') <> 'array'
     or jsonb_typeof(payload->'receipt_vouchers') <> 'array'
     or jsonb_typeof(payload->'payment_vouchers') <> 'array' then
    raise exception 'INVALID_BACKUP_FORMAT';
  end if;

  s_in := jsonb_array_length(payload->'students');
  r_in := jsonb_array_length(payload->'receipt_vouchers');
  p_in := jsonb_array_length(payload->'payment_vouchers');

  -- Size ceiling (abuse / accidental huge payload).
  if s_in > 200000 or r_in > 1000000 or p_in > 1000000 then
    raise exception 'RESTORE_TOO_LARGE';
  end if;

  select count(*) into s_cur from public.students;
  select count(*) into r_cur from public.receipt_vouchers;
  select count(*) into p_cur from public.payment_vouchers;

  -- Never let a "restore" empty a non-empty system.
  if (s_in + r_in + p_in) = 0 and (s_cur + r_cur + p_cur) > 0 then
    raise exception 'RESTORE_REFUSED_EMPTY';
  end if;

  -- Shrinking any table needs an explicit force (the client confirms first).
  if not force and (s_in < s_cur or r_in < r_cur or p_in < p_cur) then
    raise exception 'RESTORE_SHRINKS students=%->% receipts=%->% payments=%->%',
      s_cur, s_in, r_cur, r_in, p_cur, p_in;
  end if;

  before_counts := jsonb_build_object('students', s_cur, 'receipt_vouchers', r_cur, 'payment_vouchers', p_cur);

  -- Wipe (FK-safe order) then re-insert (students first).
  delete from public.receipt_vouchers;
  delete from public.payment_vouchers;
  delete from public.students;

  insert into public.students (id, name, id_number, phone, notes, created_at, updated_at)
  select
    (e->>'id')::uuid, e->>'name', e->>'id_number', e->>'phone', e->>'notes',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now())),
    coalesce((e->>'updated_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'students') e;
  get diagnostics s_out = row_count;

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

  insert into public.restore_log (restored_by, forced, before_counts, after_counts)
  values (
    auth.uid(), force, before_counts,
    jsonb_build_object('students', s_out, 'receipt_vouchers', r_out, 'payment_vouchers', p_out)
  );

  return jsonb_build_object('students', s_out, 'receipt_vouchers', r_out, 'payment_vouchers', p_out);
end;
$$;

revoke all on function public.restore_center_data(jsonb, boolean) from public, anon;
grant execute on function public.restore_center_data(jsonb, boolean) to authenticated;
