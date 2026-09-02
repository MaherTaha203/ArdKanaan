-- Financial firewall: enforce whole-shekel money, preserve enrollment as the
-- authoritative course fee, block receipt overpayment, and keep posted financial
-- fields immutable. Descriptive fields may still be edited; cancellation is final.

alter table public.enrollments
  add constraint enrollments_course_value_whole_shekel
  check (course_value = trunc(course_value));

alter table public.receipt_vouchers
  add constraint receipt_vouchers_course_value_whole_shekel
  check (course_value = trunc(course_value)),
  add constraint receipt_vouchers_amount_received_whole_shekel
  check (amount_received = trunc(amount_received));

alter table public.payment_vouchers
  add constraint payment_vouchers_amount_whole_shekel
  check (amount = trunc(amount));

create or replace function public.enforce_financial_firewall()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  enrollment_fee numeric;
  paid numeric;
  remaining numeric;
  lock_key bigint;
begin
  if tg_op = 'UPDATE' then
    if new.voucher_number is distinct from old.voucher_number
       or new.voucher_date is distinct from old.voucher_date
       or new.student_id is distinct from old.student_id
       or new.student_name_snapshot is distinct from old.student_name_snapshot
       or new.course_name is distinct from old.course_name
       or new.course_value is distinct from old.course_value
       or new.amount_received is distinct from old.amount_received then
      raise exception 'FINANCIAL_FIELDS_IMMUTABLE';
    end if;

    if old.cancelled_at is not null and new.cancelled_at is null then
      raise exception 'CANCELLED_VOUCHER_CANNOT_BE_REOPENED';
    end if;

    if old.cancelled_at is null and new.cancelled_at is not null
       and nullif(btrim(new.cancel_reason), '') is null then
      raise exception 'CANCELLATION_REASON_REQUIRED';
    end if;

    return new;
  end if;

  lock_key := hashtextextended(new.student_id::text || ':' || new.course_name, 0);
  perform pg_advisory_xact_lock(lock_key);

  select e.course_value
    into enrollment_fee
  from public.enrollments e
  where e.student_id = new.student_id
    and e.course_name = new.course_name
  for share;

  if enrollment_fee is null then
    raise exception 'ENROLLMENT_REQUIRED';
  end if;

  if new.course_value is distinct from enrollment_fee then
    raise exception 'COURSE_VALUE_MUST_MATCH_ENROLLMENT';
  end if;

  select coalesce(sum(rv.amount_received), 0)
    into paid
  from public.receipt_vouchers rv
  where rv.student_id = new.student_id
    and rv.course_name = new.course_name
    and rv.cancelled_at is null;

  remaining := enrollment_fee - paid;
  if new.amount_received > remaining then
    raise exception 'RECEIPT_EXCEEDS_REMAINING_BALANCE';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_financial_firewall() from public, anon, authenticated;

drop trigger if exists receipt_vouchers_financial_firewall on public.receipt_vouchers;
create trigger receipt_vouchers_financial_firewall
before insert or update on public.receipt_vouchers
for each row execute function public.enforce_financial_firewall();
