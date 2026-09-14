-- Enrollment Financial Firewall
--
-- An enrollment is the authoritative financial snapshot for a student's course:
--   (student_id + course_name) identifies the financial enrollment;
--   course_value is the fee snapshot established at enrollment time.
--
-- The existing receipt firewall already trusts this snapshot. Without a database
-- guard here, an owner-level update could rewrite the enrollment itself and thereby
-- rewrite the historical meaning of future statements. This trigger freezes the
-- financial identity and fee after creation while deliberately leaving the catalog
-- linkage (`course_id`) editable because it is a management/catalog reference and
-- is not part of the financial truth.

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
