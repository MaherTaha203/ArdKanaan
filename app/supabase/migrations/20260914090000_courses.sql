-- Courses catalog (additive — no change to the financial model).
--
-- Introduces a Courses entity as a management/catalog layer WITHOUT touching the
-- money logic. The authoritative financial link stays the ENROLLMENT
-- (student_id + course_name + snapshot course_value) and the financial firewall
-- (enforce_financial_firewall on receipt_vouchers) is unchanged. A nullable
-- enrollments.course_id links an enrollment to a catalog course when one exists;
-- legacy enrollments/receipts with no matching course row remain fully valid
-- (course_id stays null). `base_fee` here is only the DEFAULT fee proposed when
-- registering a student; each enrollment keeps its own snapshot fee, so editing a
-- course's base_fee never changes already-registered students' fees.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_fee numeric(12, 2),
  start_date date,
  end_date date,
  status text not null default 'active',
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint courses_name_unique unique (name),
  constraint courses_status_valid check (status in ('active', 'ended')),
  constraint courses_base_fee_whole_shekel
    check (base_fee is null or (base_fee >= 0 and base_fee = trunc(base_fee)))
);

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- Owner-only, mirroring the source-of-truth tables (public.is_owner()).
alter table public.courses enable row level security;
revoke all on public.courses from anon, authenticated;
grant select, insert, update, delete on public.courses to authenticated;

drop policy if exists courses_owner_select on public.courses;
create policy courses_owner_select on public.courses
  for select to authenticated using (public.is_owner());
drop policy if exists courses_owner_insert on public.courses;
create policy courses_owner_insert on public.courses
  for insert to authenticated with check (public.is_owner());
drop policy if exists courses_owner_update on public.courses;
create policy courses_owner_update on public.courses
  for update to authenticated using (public.is_owner()) with check (public.is_owner());
drop policy if exists courses_owner_delete on public.courses;
create policy courses_owner_delete on public.courses
  for delete to authenticated using (public.is_owner());

-- Link an enrollment to a catalog course. Nullable so legacy enrollments (and any
-- created before a course row exists) stay valid. ON DELETE SET NULL: removing a
-- course never deletes enrollments or their financial history — it only unlinks.
alter table public.enrollments
  add column if not exists course_id uuid references public.courses(id) on delete set null;

create index if not exists enrollments_course_id_idx on public.enrollments (course_id);
