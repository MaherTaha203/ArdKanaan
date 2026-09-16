begin;

create or replace function public.enforce_receipt_student_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_name text;
begin
  if current_setting('app.restoring', true) = 'on' then
    return new;
  end if;

  select s.name into v_student_name
  from public.students s
  where s.id = new.student_id;

  if v_student_name is null then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  if new.student_name_snapshot is distinct from v_student_name then
    raise exception 'STUDENT_NAME_SNAPSHOT_MISMATCH';
  end if;

  return new;
end;
$$;

drop trigger if exists receipt_vouchers_student_snapshot on public.receipt_vouchers;
create trigger receipt_vouchers_student_snapshot
before insert on public.receipt_vouchers
for each row execute function public.enforce_receipt_student_snapshot();

revoke all on function public.enforce_receipt_student_snapshot() from public, anon, authenticated;

commit;
