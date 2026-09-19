begin;

-- ============================================================================
-- Student archive lifecycle (ADR-0076).
--
-- Adds an INDEPENDENT student-level `archived` state alongside the existing
-- `active` and `completed`. `archived` is NOT a relabelling of `completed`:
--   * active ⇄ completed  — unchanged (complete_student/reactivate_student).
--   * active ⇄ archived   — new, via archive_student/unarchive_student below.
-- `completed` is never converted to `archived`, and complete_student /
-- reactivate_student are NOT modified.
--
-- Archiving is PURELY ADMINISTRATIVE on the students table. It touches ONLY
-- students.status / students.archived_at / students.archive_reason, and NO
-- financial object whatsoever: no receipt_vouchers, receipt_allocations,
-- fee_obligations, payment_vouchers, financial_movement_ledger, balances,
-- statements, or historical records. Financial difference across an
-- archive/restore is provably zero.
--
-- Eligibility: a student with any enrollment on an ACTIVE course cannot be
-- archived. An outstanding balance does NOT block archiving (the UI warns);
-- archiving never settles or changes a balance.
--
-- Authorization: owner-only, enforced inside the functions via public.is_owner()
-- (SECURITY DEFINER, empty search_path, fully-qualified names). The existing
-- students_activity -> log_activity trigger audits the UPDATE with the acting
-- owner.
--
-- Every statement is idempotent/additive; on a database that already has these
-- objects it is a safe no-op. Not applied to production by this migration.
-- ============================================================================

-- Archive metadata (mirrors the completed_at / completion_reason convention).
alter table public.students
  add column if not exists archived_at timestamptz,
  add column if not exists archive_reason text;

-- Widen the lifecycle domain to include the new independent `archived` state.
-- Widening a CHECK never rejects existing rows (all are active/completed).
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.students'::regclass and conname = 'students_status_check'
  ) then
    alter table public.students drop constraint students_status_check;
  end if;
  alter table public.students
    add constraint students_status_check
    check (status = any (array['active', 'completed', 'archived']));
end $$;

-- archive_student — active -> archived, administrative only, owner-only,
-- blocked while the student has any enrollment on an active course.
create or replace function public.archive_student(p_student_id uuid, p_reason text default null::text)
returns public.students
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_student public.students;
  v_active_courses integer;
begin
  if not public.is_owner() then
    raise exception 'not_authorized';
  end if;

  select * into v_student from public.students where id = p_student_id;
  if not found then
    raise exception 'student_not_found';
  end if;

  -- Idempotent: already archived is a no-op success.
  if v_student.status = 'archived' then
    return v_student;
  end if;

  -- `completed` is a separate concept and is never converted to `archived`.
  if v_student.status <> 'active' then
    raise exception 'student_not_active';
  end if;

  -- Eligibility: no enrollment on an active course.
  select count(*) into v_active_courses
  from public.enrollments e
  join public.courses c on c.id = e.course_id
  where e.student_id = p_student_id and c.status = 'active';

  if v_active_courses > 0 then
    raise exception 'student_has_active_course';
  end if;

  -- Administrative status change only. No financial row is touched.
  update public.students
  set status = 'archived',
      archived_at = coalesce(archived_at, timezone('utc', now())),
      archive_reason = nullif(trim(coalesce(p_reason, '')), '')
  where id = p_student_id
  returning * into v_student;

  return v_student;
end;
$function$;

-- unarchive_student — archived -> active, restoring the student to the roster.
-- Clears only the archive metadata; it does NOT touch completed_at /
-- completion_reason (the separate completion lifecycle).
create or replace function public.unarchive_student(p_student_id uuid)
returns public.students
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_student public.students;
begin
  if not public.is_owner() then
    raise exception 'not_authorized';
  end if;

  select * into v_student from public.students where id = p_student_id;
  if not found then
    raise exception 'student_not_found';
  end if;

  -- Idempotent: already active is a no-op success.
  if v_student.status = 'active' then
    return v_student;
  end if;

  if v_student.status <> 'archived' then
    raise exception 'student_not_archived';
  end if;

  update public.students
  set status = 'active',
      archived_at = null,
      archive_reason = null
  where id = p_student_id
  returning * into v_student;

  return v_student;
end;
$function$;

-- Least privilege: not callable by anon; authenticated may call, but the
-- is_owner() guard inside each function is the real authorization boundary.
revoke all on function public.archive_student(uuid, text) from public, anon;
revoke all on function public.unarchive_student(uuid) from public, anon;
grant execute on function public.archive_student(uuid, text) to authenticated;
grant execute on function public.unarchive_student(uuid) to authenticated;

commit;
