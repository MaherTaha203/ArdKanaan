-- Student creation is an Owner action. Reassert the table privilege and policy
-- explicitly after the owner-only RLS hardening so an existing remote schema cannot
-- leave the UI with a generic "تعذّر إضافة الطالب" despite a valid authenticated Owner.
-- No delete privilege is granted; identity updates remain column-scoped elsewhere.

grant select, insert on public.students to authenticated;

drop policy if exists students_auth_insert on public.students;
drop policy if exists students_owner_insert on public.students;
create policy students_owner_insert on public.students
  for insert to authenticated
  with check (public.is_owner());
