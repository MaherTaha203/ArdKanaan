-- Restore runs inside a single transaction and marks the transaction with app.restoring.
-- Financial insert guards must honor that controlled restore path so historical
-- voucher numbers/facts can be replayed exactly as stored in the backup.

create or replace function public.enforce_payment_financial_firewall()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.cancelled_at is not null then
      raise exception 'CANCELLED_VOUCHER_IS_IMMUTABLE';
    end if;

    if new.voucher_number is distinct from old.voucher_number
       or new.voucher_date is distinct from old.voucher_date
       or new.expense_type is distinct from old.expense_type
       or new.amount is distinct from old.amount then
      raise exception 'FINANCIAL_FIELDS_IMMUTABLE';
    end if;

    if new.cancelled_at is not null
       and nullif(btrim(new.cancel_reason), '') is null then
      raise exception 'CANCELLATION_REASON_REQUIRED';
    end if;

    return new;
  end if;

  if new.cancelled_at is not null
     and nullif(btrim(new.cancel_reason), '') is null then
    raise exception 'CANCELLATION_REASON_REQUIRED';
  end if;

  return new;
end;
$$;

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
  if current_setting('app.restoring', true) = 'on' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.cancelled_at is not null then
      raise exception 'CANCELLED_VOUCHER_IS_IMMUTABLE';
    end if;

    if new.voucher_number is distinct from old.voucher_number
       or new.voucher_date is distinct from old.voucher_date
       or new.student_id is distinct from old.student_id
       or new.student_name_snapshot is distinct from old.student_name_snapshot
       or new.course_name is distinct from old.course_name
       or new.course_value is distinct from old.course_value
       or new.amount_received is distinct from old.amount_received then
      raise exception 'FINANCIAL_FIELDS_IMMUTABLE';
    end if;

    if new.cancelled_at is not null
       and nullif(btrim(new.cancel_reason), '') is null then
      raise exception 'CANCELLATION_REASON_REQUIRED';
    end if;

    return new;
  end if;

  if new.cancelled_at is not null
     and nullif(btrim(new.cancel_reason), '') is null then
    raise exception 'CANCELLATION_REASON_REQUIRED';
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

revoke all on function public.enforce_payment_financial_firewall() from public, anon, authenticated;
revoke all on function public.enforce_financial_firewall() from public, anon, authenticated;
