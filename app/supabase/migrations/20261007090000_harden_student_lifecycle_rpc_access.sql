begin;

-- Defense-in-depth: lifecycle transitions are owner-only operations.
-- SECURITY DEFINER is paired with an explicit is_owner() gate and a locked
-- search_path so the RPC itself cannot become a privilege-escalation path.
create or replace function public.complete_student(
  p_student_id uuid,
  p_reason text default null::text
)
returns public.students
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_student public.students;
begin
  if not public.is_owner() then
    raise exception 'OWNER_ONLY';
  end if;

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

create or replace function public.reactivate_student(
  p_student_id uuid
)
returns public.students
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_student public.students;
begin
  if not public.is_owner() then
    raise exception 'OWNER_ONLY';
  end if;

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

revoke all on function public.complete_student(uuid, text) from public, anon, authenticated;
revoke all on function public.reactivate_student(uuid) from public, anon, authenticated;
grant execute on function public.complete_student(uuid, text) to authenticated;
grant execute on function public.reactivate_student(uuid) to authenticated;

commit;
