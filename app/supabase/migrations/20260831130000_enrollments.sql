-- Authoritative course fee per (student, course): the enrollment model.
--
-- Previously each receipt re-entered course_value, and the running balance trusted
-- whichever voucher sorted last — so re-dating a voucher could flip a student's
-- remaining with no change to any amount. The fee is really a property of the
-- student's enrollment in a course, set once; receipts are payments against it.
-- This table holds that single value; the statement view derives remaining from it
-- (constant per partition → order-independent).

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  course_name text not null,
  course_value numeric(12, 2) not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint enrollments_course_value_non_negative check (course_value >= 0),
  constraint enrollments_student_course_unique unique (student_id, course_name)
);

drop trigger if exists enrollments_set_updated_at on public.enrollments;
create trigger enrollments_set_updated_at
  before update on public.enrollments
  for each row execute function public.set_updated_at();

alter table public.enrollments enable row level security;
revoke all on public.enrollments from anon, authenticated;
grant select, insert, update on public.enrollments to authenticated;

drop policy if exists enrollments_auth_select on public.enrollments;
create policy enrollments_auth_select on public.enrollments for select to authenticated using (true);
drop policy if exists enrollments_auth_insert on public.enrollments;
create policy enrollments_auth_insert on public.enrollments for insert to authenticated with check (true);
drop policy if exists enrollments_auth_update on public.enrollments;
create policy enrollments_auth_update on public.enrollments for update to authenticated using (true) with check (true);

-- Index the FK (Postgres does not auto-index it).
create index if not exists enrollments_student_id_idx on public.enrollments (student_id);

-- Backfill: one enrollment per (student, course) from existing receipts, taking the
-- EARLIEST voucher's course_value as the established fee.
insert into public.enrollments (student_id, course_name, course_value)
select distinct on (rv.student_id, rv.course_name)
  rv.student_id, rv.course_name, rv.course_value
from public.receipt_vouchers rv
order by rv.student_id, rv.course_name, rv.voucher_date, rv.voucher_number
on conflict (student_id, course_name) do nothing;

-- Derive remaining from the enrollment fee (constant per student+course), so it no
-- longer depends on which voucher sorts last. coalesce keeps it safe if any receipt
-- ever lacks an enrollment row.
create or replace view public.student_statement_lines as
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
where rv.cancelled_at is null;

alter view public.student_statement_lines set (security_invoker = true);

-- Also index the receipt FK + the columns the window partitions/orders by.
create index if not exists receipt_vouchers_student_course_idx
  on public.receipt_vouchers (student_id, course_name, voucher_date, voucher_number);

-- Restore must now also wipe+restore enrollments, or its `delete from students`
-- fails on the enrollments FK (ON DELETE RESTRICT). Enrollments are optional in the
-- payload so older backups (without them) still restore — the view then falls back
-- to each voucher's course_value.
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
begin
  if payload is null
     or jsonb_typeof(payload->'students') <> 'array'
     or jsonb_typeof(payload->'receipt_vouchers') <> 'array'
     or jsonb_typeof(payload->'payment_vouchers') <> 'array' then
    raise exception 'INVALID_BACKUP_FORMAT';
  end if;

  -- Enrollments optional (older backups lack them).
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

  -- Wipe (children before students).
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

  insert into public.restore_log (restored_by, forced, before_counts, after_counts)
  values (
    auth.uid(), force, before_counts,
    jsonb_build_object('students', s_out, 'enrollments', e_out, 'receipt_vouchers', r_out, 'payment_vouchers', p_out)
  );

  return jsonb_build_object('students', s_out, 'enrollments', e_out, 'receipt_vouchers', r_out, 'payment_vouchers', p_out);
end;
$$;

revoke all on function public.restore_center_data(jsonb, boolean) from public, anon;
grant execute on function public.restore_center_data(jsonb, boolean) to authenticated;
