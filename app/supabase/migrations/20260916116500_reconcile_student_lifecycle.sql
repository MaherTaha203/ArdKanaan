begin;

-- ============================================================================
-- Reconcile the student lifecycle with production (migration-drift repair).
--
-- Production already runs an `active <-> completed` student lifecycle, but the
-- objects that define it were applied out-of-band and never committed to this
-- migration history. Two later migrations depend on them and therefore cannot be
-- reproduced by `supabase db reset`:
--   * 20260916117000_security_advisor_cleanup.sql  -> ALTER VIEW public.active_students ...
--   * 20260916130000_security_hardening.sql        -> CREATE VIEW public.active_students
--                                                     (selects students.status/completed_at/completion_reason)
--
-- This migration ADDS those exact objects so the repository reproduces production.
-- It is placed just before 20260916117000 so the view exists before that ALTER.
--
-- It changes NO semantics, introduces NO new state, renames nothing, deletes
-- nothing, and touches NO financial data. Every statement is idempotent, so on a
-- database that already has these objects (production) it is a safe no-op.
-- Verified against production read-only on 2026-09-19 (columns, constraint,
-- view definition, function bodies, grants).
-- ============================================================================

-- Lifecycle columns on students (production shape, exact).
alter table public.students
  add column if not exists status text not null default 'active',
  add column if not exists completed_at timestamptz,
  add column if not exists completion_reason text;

-- Status domain: exactly {active, completed} — no `archived` is introduced here.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.students'::regclass and conname = 'students_status_check'
  ) then
    alter table public.students
      add constraint students_status_check check (status = any (array['active', 'completed']));
  end if;
end $$;

-- Read model of active students (security_invoker so it obeys the caller's RLS).
-- Recreated verbatim from production; 20260916130000 later recreates it identically.
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

-- Lifecycle RPCs — verbatim reproduction of the production definitions.
-- SECURITY INVOKER (default): the UPDATE runs under the caller, so owner-only RLS
-- on public.students already governs who may complete/reactivate a student.
create or replace function public.complete_student(p_student_id uuid, p_reason text default null::text)
returns public.students
language plpgsql
set search_path to 'public'
as $function$
declare
  v_student public.students;
begin
  update public.students
  set status = 'completed',
      completed_at = coalesce(completed_at, timezone('utc', now())),
      completion_reason = nullif(trim(coalesce(p_reason, '')), '')
  where id = p_student_id
  returning * into v_student;

  if not found then
    raise exception 'student_not_found';
  end if;

  return v_student;
end;
$function$;

create or replace function public.reactivate_student(p_student_id uuid)
returns public.students
language plpgsql
set search_path to 'public'
as $function$
declare
  v_student public.students;
begin
  update public.students
  set status = 'active',
      completed_at = null,
      completion_reason = null
  where id = p_student_id
  returning * into v_student;

  if not found then
    raise exception 'student_not_found';
  end if;

  return v_student;
end;
$function$;

commit;
