-- P1 — comprehensive activity audit + student-record editing.
--
-- Two related changes:
--  (9) One general audit_log replaces the voucher-only log. Every mutation of a
--      source-of-truth row — create/edit/cancel/uncancel on vouchers, create/edit on
--      students and enrollments — is recorded server-side by a SECURITY DEFINER
--      trigger, with the exact fields that changed on an edit. A restore logs ONE
--      'restore' event (per-row noise is suppressed while it runs).
--  (7) Students become correctable: an UPDATE grant + RLS policy (still never a
--      delete). Editing a student is itself audited by the same trigger.
--
-- The financial truth is untouched: no calculation, view, or balance derivation
-- changes here. Auditing is orthogonal to the numbers.

-- 1) General audit log. Written only by the trigger; readable by the operator.
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  entity text not null,          -- receipt_voucher | payment_voucher | student | enrollment | restore
  entity_id uuid,
  action text not null,          -- create | edit | cancel | uncancel | restore
  label text,                    -- human hint: voucher number, student name, course
  changed_by uuid,               -- auth.uid()
  changed_at timestamptz not null default timezone('utc', now()),
  changed_fields text[],         -- keys that differ (edits only)
  old_data jsonb,
  new_data jsonb
);

alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;
drop policy if exists audit_log_auth_select on public.audit_log;
create policy audit_log_auth_select on public.audit_log for select to authenticated using (true);

-- 2) Carry the existing voucher audit history over, then retire the old table.
insert into public.audit_log (id, entity, entity_id, action, label, changed_by, changed_at, old_data, new_data)
select
  al.id,
  case al.table_name
    when 'receipt_vouchers' then 'receipt_voucher'
    when 'payment_vouchers' then 'payment_voucher'
    else al.table_name
  end,
  al.voucher_id,
  al.action,
  (case al.table_name
     when 'receipt_vouchers' then 'سند قبض رقم '
     when 'payment_vouchers' then 'سند صرف رقم '
     else ''
   end) || coalesce(al.voucher_number::text, ''),
  al.changed_by,
  al.changed_at,
  al.old_data,
  al.new_data
from public.voucher_audit_log al
on conflict (id) do nothing;

-- 3) The audit trigger — one function, shared across the audited tables.
create or replace function public.log_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity text;
  v_action text;
  v_label text;
  v_id uuid;
  v_changed text[];
begin
  -- A bulk restore replaces everything atomically and records its own single event;
  -- skip per-row logging while it runs so the log is not flooded.
  if current_setting('app.restoring', true) = 'on' then
    return coalesce(new, old);
  end if;

  if tg_table_name = 'receipt_vouchers' then
    v_entity := 'receipt_voucher'; v_id := new.id;
    v_label := 'سند قبض رقم ' || new.voucher_number;
  elsif tg_table_name = 'payment_vouchers' then
    v_entity := 'payment_voucher'; v_id := new.id;
    v_label := 'سند صرف رقم ' || new.voucher_number;
  elsif tg_table_name = 'students' then
    v_entity := 'student'; v_id := new.id; v_label := new.name;
  elsif tg_table_name = 'enrollments' then
    v_entity := 'enrollment'; v_id := new.id; v_label := new.course_name;
  else
    v_entity := tg_table_name; v_id := new.id;
  end if;

  if tg_op = 'INSERT' then
    insert into public.audit_log (entity, entity_id, action, label, changed_by, new_data)
    values (v_entity, v_id, 'create', v_label, auth.uid(), to_jsonb(new));
    return new;
  end if;

  -- UPDATE. Default is an edit; vouchers refine it by their cancellation transition.
  v_action := 'edit';
  if v_entity in ('receipt_voucher', 'payment_voucher') then
    if old.cancelled_at is null and new.cancelled_at is not null then
      v_action := 'cancel';
    elsif old.cancelled_at is not null and new.cancelled_at is null then
      v_action := 'uncancel';
    end if;
  end if;

  -- Exactly which columns changed (updated_at is bookkeeping, not a business change).
  select array_agg(key order by key) into v_changed
  from jsonb_object_keys(to_jsonb(new)) as k(key)
  where to_jsonb(old)->key is distinct from to_jsonb(new)->key
    and key <> 'updated_at';

  insert into public.audit_log
    (entity, entity_id, action, label, changed_by, changed_fields, old_data, new_data)
  values (v_entity, v_id, v_action, v_label, auth.uid(), v_changed, to_jsonb(old), to_jsonb(new));
  return new;
end;
$$;

revoke all on function public.log_activity() from public, anon, authenticated;

-- 4) Retire the old voucher-only trigger/function/table (history preserved above).
drop trigger if exists receipt_vouchers_audit on public.receipt_vouchers;
drop trigger if exists payment_vouchers_audit on public.payment_vouchers;
drop function if exists public.log_voucher_change();
drop table if exists public.voucher_audit_log;

-- 5) Attach the audit trigger to every source-of-truth table (insert + update).
drop trigger if exists receipt_vouchers_activity on public.receipt_vouchers;
create trigger receipt_vouchers_activity
  after insert or update on public.receipt_vouchers
  for each row execute function public.log_activity();

drop trigger if exists payment_vouchers_activity on public.payment_vouchers;
create trigger payment_vouchers_activity
  after insert or update on public.payment_vouchers
  for each row execute function public.log_activity();

drop trigger if exists students_activity on public.students;
create trigger students_activity
  after insert or update on public.students
  for each row execute function public.log_activity();

drop trigger if exists enrollments_activity on public.enrollments;
create trigger enrollments_activity
  after insert or update on public.enrollments
  for each row execute function public.log_activity();

-- 6) Student records become editable — correcting name / id_number / phone / notes.
--    Still NO delete, ever. Every edit is audited by students_activity above.
--    Column-scoped grant (least privilege): the operator may change only the identity
--    fields — never id or created_at; updated_at is set by the set_updated_at trigger.
grant update (name, id_number, phone, notes) on public.students to authenticated;
drop policy if exists students_auth_update on public.students;
create policy students_auth_update on public.students
  for update to authenticated using (true) with check (true);

-- 7) Restore: suppress per-row audit while wiping/reloading, and log one 'restore'.
--    Identical to the prior version except for those two additions.
create or replace function public.restore_center_data(payload jsonb, force boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s_in int; r_in int; p_in int;
  s_cur int; r_cur int; p_cur int;
  s_out int; r_out int; p_out int; e_out int;
  enrollments jsonb;
  before_counts jsonb;
  after_counts jsonb;
begin
  if payload is null
     or jsonb_typeof(payload->'students') <> 'array'
     or jsonb_typeof(payload->'receipt_vouchers') <> 'array'
     or jsonb_typeof(payload->'payment_vouchers') <> 'array' then
    raise exception 'INVALID_BACKUP_FORMAT';
  end if;

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

  -- Silence the per-row audit trigger for the duration of this transaction.
  perform set_config('app.restoring', 'on', true);

  delete from public.receipt_vouchers;
  delete from public.payment_vouchers;
  delete from public.enrollments;
  delete from public.students;

  insert into public.students (id, name, id_number, phone, notes, created_at, updated_at)
  select
    (e->>'id')::uuid, e->>'name', e->>'id_number', e->>'phone', e->>'notes',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now())),
    coalesce((e->>'updated_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'students') e;
  get diagnostics s_out = row_count;

  insert into public.enrollments (id, student_id, course_name, course_value, created_at, updated_at)
  select
    coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'student_id')::uuid,
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

  after_counts := jsonb_build_object('students', s_out, 'enrollments', e_out, 'receipt_vouchers', r_out, 'payment_vouchers', p_out);

  insert into public.restore_log (restored_by, forced, before_counts, after_counts)
  values (auth.uid(), force, before_counts, after_counts);

  -- One audit entry for the whole restore (per-row logging was suppressed above).
  insert into public.audit_log (entity, action, label, changed_by, old_data, new_data)
  values ('restore', 'restore', 'استعادة نسخة احتياطيّة', auth.uid(), before_counts, after_counts);

  return after_counts;
end;
$$;

revoke all on function public.restore_center_data(jsonb, boolean) from public, anon;
grant execute on function public.restore_center_data(jsonb, boolean) to authenticated;
