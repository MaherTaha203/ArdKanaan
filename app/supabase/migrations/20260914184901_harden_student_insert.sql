grant select, insert on public.students to authenticated;
drop policy if exists students_auth_insert on public.students;
drop policy if exists students_owner_insert on public.students;
create policy students_owner_insert on public.students
  for insert to authenticated
  with check (public.is_owner());