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

alter table public.enrollments
  add column if not exists course_id uuid references public.courses(id) on delete set null;

create index if not exists enrollments_course_id_idx on public.enrollments (course_id);