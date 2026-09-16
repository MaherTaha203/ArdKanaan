begin;

create or replace function public.create_enrollment(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_student_id uuid;
  p_course_id uuid;
  v_course_name text;
  v_course_value numeric;
  v_id uuid;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object' then raise exception 'INVALID_ENROLLMENT_PAYLOAD'; end if;

  p_student_id := nullif(payload->>'student_id', '')::uuid;
  p_course_id := nullif(payload->>'course_id', '')::uuid;
  if p_student_id is null or p_course_id is null then raise exception 'INVALID_ENROLLMENT_PAYLOAD'; end if;

  perform 1 from public.students s where s.id = p_student_id;
  if not found then raise exception 'STUDENT_NOT_FOUND'; end if;

  select c.name, c.base_fee
  into v_course_name, v_course_value
  from public.courses c
  where c.id = p_course_id;
  if v_course_name is null then raise exception 'COURSE_NOT_FOUND'; end if;
  if v_course_value is null then raise exception 'COURSE_BASE_FEE_REQUIRED'; end if;

  if exists (
    select 1 from public.enrollments e
    where e.student_id = p_student_id and e.course_id = p_course_id
  ) then
    raise exception 'ENROLLMENT_ALREADY_EXISTS';
  end if;

  insert into public.enrollments
    (student_id, course_id, course_name, course_value)
  values
    (p_student_id, p_course_id, v_course_name, v_course_value)
  returning id into v_id;

  return jsonb_build_object(
    'id', v_id,
    'student_id', p_student_id,
    'course_id', p_course_id,
    'course_name', v_course_name,
    'course_value', v_course_value
  );
end;
$$;

revoke all on function public.create_enrollment(jsonb) from public, anon;
grant execute on function public.create_enrollment(jsonb) to authenticated;

-- The financial identities are now created only by their authoritative RPCs.
-- Existing reads remain available; update/delete are intentionally not granted.
revoke insert, update on public.enrollments from authenticated;
revoke insert on public.fee_obligations from authenticated;
revoke insert on public.receipt_vouchers from authenticated;
revoke insert on public.payment_vouchers from authenticated;

commit;
