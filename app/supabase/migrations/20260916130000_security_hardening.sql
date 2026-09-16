begin;

-- SECURITY DEFINER trigger helpers are not application RPC endpoints.
-- The fee-enrollment resolver is invoked only by the database trigger.
revoke all on function public.resolve_fee_obligation_enrollment() from public, anon, authenticated;

-- active_students contains ordinary student data and must obey the caller's
-- RLS policies rather than the view owner's privileges.
drop view if exists public.active_students;
create view public.active_students
with (security_invoker = true)
as
select
  id,
  name,
  phone,
  notes,
  created_at,
  updated_at,
  id_number,
  status,
  completed_at,
  completion_reason
from public.students
where status = 'active';

revoke all on public.active_students from anon;
grant select on public.active_students to authenticated;

commit;
