begin;

-- The enrollment financial firewall must protect creation as well as updates.
-- course_name/course_value are captured from the course catalog exactly once;
-- subsequent catalog edits cannot rewrite an existing enrollment snapshot.
create or replace function public.enforce_enrollment_financial_firewall()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course_name text;
  v_course_value numeric;
begin
  if current_setting('app.restoring', true) = 'on' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.id is null or new.student_id is null or new.course_id is null
       or new.course_name is null or new.course_value is null then
      raise exception 'ENROLLMENT_FINANCIAL_IDENTITY_REQUIRED';
    end if;

    select c.name, c.base_fee into v_course_name, v_course_value
    from public.courses c
    where c.id = new.course_id;

    if v_course_name is null then
      raise exception 'COURSE_NOT_FOUND';
    end if;
    if v_course_value is null then
      raise exception 'COURSE_BASE_FEE_REQUIRED';
    end if;
    if new.course_name is distinct from v_course_name
       or new.course_value is distinct from v_course_value then
      raise exception 'ENROLLMENT_FINANCIAL_SNAPSHOT_MISMATCH';
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.student_id is distinct from old.student_id
     or new.course_id is distinct from old.course_id
     or new.course_name is distinct from old.course_name
     or new.course_value is distinct from old.course_value
     or new.created_at is distinct from old.created_at then
    raise exception 'ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE';
  end if;

  return new;
end;
$$;

drop trigger if exists enrollments_financial_firewall on public.enrollments;
create trigger enrollments_financial_firewall
before insert or update on public.enrollments
for each row execute function public.enforce_enrollment_financial_firewall();

revoke all on function public.enforce_enrollment_financial_firewall() from public, anon, authenticated;

-- Enrollment is a financial identity. It must be cancelled/replaced at the
-- business layer, never physically deleted after creation.
create or replace function public.prevent_enrollment_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return old;
  end if;
  raise exception 'ENROLLMENT_DELETE_FORBIDDEN';
end;
$$;

drop trigger if exists enrollments_prevent_delete on public.enrollments;
create trigger enrollments_prevent_delete
before delete on public.enrollments
for each row execute function public.prevent_enrollment_delete();

revoke all on function public.prevent_enrollment_delete() from public, anon, authenticated;

commit;
