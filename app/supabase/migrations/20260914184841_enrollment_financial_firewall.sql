create or replace function public.enforce_enrollment_financial_firewall()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
       or new.student_id is distinct from old.student_id
       or new.course_name is distinct from old.course_name
       or new.course_value is distinct from old.course_value
       or new.created_at is distinct from old.created_at then
      raise exception 'ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE';
    end if;
    return new;
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_enrollment_financial_firewall() from public, anon, authenticated;
drop trigger if exists enrollments_financial_firewall on public.enrollments;
create trigger enrollments_financial_firewall
before update on public.enrollments
for each row execute function public.enforce_enrollment_financial_firewall();