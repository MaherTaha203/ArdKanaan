begin;

-- ============================================================================
-- Student fee distribution snapshot on the receipt voucher.
--
-- Owner-authorized, tightly-scoped financial expansion (student-fees feature).
-- A "fee" (e.g. رسوم تخريج) is recorded as an ORDINARY receipt voucher that
-- additionally carries an immutable institute/external split captured at posting
-- in the SAME row. There is NO second voucher, NO payment voucher, and NO later
-- settlement — the third-party portion is recognised as "held for others"
-- (لصالح الغير) at the moment of collection, in this one row.
--
--   fee_category IS NULL  => an ordinary course-fee receipt — behaviour UNCHANGED.
--   fee_category set       => a fee. external_share is the portion held for the
--                             third party; the institute's share is DERIVED as
--                             (amount_received - external_share), so the split
--                             always conserves the receipt amount exactly.
--
-- Every existing row keeps fee_category = NULL and external_share = 0, so old
-- vouchers are byte-for-byte unaffected and continue to compute identically.
-- ============================================================================

alter table public.receipt_vouchers
  add column if not exists fee_category text,
  add column if not exists external_share numeric(12, 2) not null default 0;

-- Same money discipline as every other amount column: whole shekels, non-negative,
-- and never more than what was actually received.
alter table public.receipt_vouchers
  add constraint receipt_vouchers_external_share_whole_shekel
    check (external_share = trunc(external_share)),
  add constraint receipt_vouchers_external_share_nonnegative
    check (external_share >= 0),
  add constraint receipt_vouchers_external_share_within_amount
    check (external_share <= amount_received),
  -- Category domain + per-category split arithmetic (institute + external = amount,
  -- always). This is the declarative half of the firewall: it can never be bypassed.
  add constraint receipt_vouchers_fee_distribution_valid check (
    case
      when fee_category is null then external_share = 0
      when fee_category = 'institute' then external_share = 0
      when fee_category = 'external' then external_share = amount_received
      when fee_category = 'shared' then external_share > 0 and external_share < amount_received
      else false
    end
  );

-- ----------------------------------------------------------------------------
-- Financial firewall — extend, do not weaken.
--   * A fee is NOT a payment toward a course enrolment, so the enrolment-match
--     and remaining-balance guards do not apply to it; its arithmetic is fully
--     enforced by the CHECK constraints above. Everything else is unchanged.
--   * The two new columns join the immutable financial-field set on UPDATE, so a
--     posted fee's split can never be tampered with (only cancellation is allowed).
--   * fees never count against a course's remaining balance.
-- ----------------------------------------------------------------------------
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
       or new.amount_received is distinct from old.amount_received
       or new.fee_category is distinct from old.fee_category
       or new.external_share is distinct from old.external_share then
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

  -- A fee is a self-contained money-in line: its institute/external split lives
  -- immutably on THIS row and is validated by the CHECK constraints. It does not
  -- settle a course enrolment, so the enrolment guards below are skipped.
  if new.fee_category is not null then
    return new;
  end if;

  lock_key := hashtextextended(new.student_id::text || ':' || new.course_name, 0);
  perform pg_advisory_xact_lock(lock_key);

  select e.course_value into enrollment_fee
  from public.enrollments e
  where e.student_id = new.student_id and e.course_name = new.course_name
  for share;

  if enrollment_fee is null then
    raise exception 'ENROLLMENT_REQUIRED';
  end if;

  if new.course_value is distinct from enrollment_fee then
    raise exception 'COURSE_VALUE_MUST_MATCH_ENROLLMENT';
  end if;

  select coalesce(sum(rv.amount_received), 0) into paid
  from public.receipt_vouchers rv
  where rv.student_id = new.student_id and rv.course_name = new.course_name
    and rv.cancelled_at is null
    and rv.fee_category is null;

  remaining := enrollment_fee - paid;
  if new.amount_received > remaining then
    raise exception 'RECEIPT_EXCEEDS_REMAINING_BALANCE';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_financial_firewall() from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- Expose the third-party share on the financial-movements read model so the
-- financial report can recognise INSTITUTE revenue (= amount - external_share)
-- separately from cash-in. The new column is appended (CREATE OR REPLACE VIEW
-- requires existing columns to keep their name/type/order); the student
-- statement view is deliberately NOT touched — the student always sees the full
-- amount.
-- ----------------------------------------------------------------------------
create or replace view public.financial_movements as
select
  rv.id,
  'receipt'::text as movement_type,
  rv.voucher_number,
  rv.voucher_date,
  rv.amount_received as amount,
  rv.student_name_snapshot as party_name,
  rv.course_name as context,
  rv.created_at,
  rv.external_share as external_share
from public.receipt_vouchers rv
where rv.cancelled_at is null
union all
select
  pv.id,
  'payment'::text as movement_type,
  pv.voucher_number,
  pv.voucher_date,
  pv.amount as amount,
  null::text as party_name,
  pv.expense_type as context,
  pv.created_at,
  0::numeric as external_share
from public.payment_vouchers pv
where pv.cancelled_at is null;

alter view public.financial_movements set (security_invoker = true);

-- ----------------------------------------------------------------------------
-- Backup/restore fidelity for the fee split (additive). Redefines
-- restore_center_data so a restored receipt carries its fee_category and
-- external_share; both stay OPTIONAL so older backups (without the keys) restore
-- unchanged (fee_category NULL, external_share 0). This is the ONLY change vs the
-- prior definition — the two columns are appended to the receipt insert; the rest
-- of the function is byte-for-byte the reconciled production version.
-- ----------------------------------------------------------------------------
create or replace function public.restore_center_data(payload jsonb, force boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s_in int; r_in int; p_in int;
  s_cur int; r_cur int; p_cur int;
  s_out int; r_out int; p_out int; e_out int; c_out int;
  courses jsonb;
  enrollments jsonb;
  before_counts jsonb;
  after_counts jsonb;
begin
  if not public.is_owner() then
    raise exception 'OWNER_ONLY';
  end if;

  if payload is null
     or jsonb_typeof(payload->'students') <> 'array'
     or jsonb_typeof(payload->'receipt_vouchers') <> 'array'
     or jsonb_typeof(payload->'payment_vouchers') <> 'array' then
    raise exception 'INVALID_BACKUP_FORMAT';
  end if;

  courses := case when jsonb_typeof(payload->'courses') = 'array'
                  then payload->'courses' else '[]'::jsonb end;
  enrollments := case when jsonb_typeof(payload->'enrollments') = 'array'
                      then payload->'enrollments' else '[]'::jsonb end;

  s_in := jsonb_array_length(payload->'students');
  r_in := jsonb_array_length(payload->'receipt_vouchers');
  p_in := jsonb_array_length(payload->'payment_vouchers');

  if s_in > 200000 or r_in > 1000000 or p_in > 1000000 then
    raise exception 'RESTORE_TOO_LARGE';
  end if;

  select count(*) into s_cur from public.students;
  select count(*) into r_cur from public.receipt_vouchers;
  select count(*) into p_cur from public.payment_vouchers;

  if (s_in + r_in + p_in) = 0 and (s_cur + r_cur + p_cur) > 0 then
    raise exception 'RESTORE_REFUSED_EMPTY';
  end if;

  if not force and (s_in < s_cur or r_in < r_cur or p_in < p_cur) then
    raise exception 'RESTORE_SHRINKS students=%->% receipts=%->% payments=%->%',
      s_cur, s_in, r_cur, r_in, p_cur, p_in;
  end if;

  before_counts := jsonb_build_object('students', s_cur, 'receipt_vouchers', r_cur, 'payment_vouchers', p_cur);

  perform set_config('app.restoring', 'on', true);

  delete from public.receipt_vouchers;
  delete from public.payment_vouchers;
  delete from public.enrollments;
  delete from public.students;
  delete from public.courses;

  insert into public.courses (id, name, base_fee, start_date, end_date, status, notes, created_at, updated_at)
  select
    coalesce((e->>'id')::uuid, gen_random_uuid()), e->>'name',
    nullif(e->>'base_fee', '')::numeric,
    nullif(e->>'start_date', '')::date, nullif(e->>'end_date', '')::date,
    coalesce(nullif(e->>'status', ''), 'active'), coalesce(e->>'notes', ''),
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now())),
    coalesce((e->>'updated_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(courses) e;
  get diagnostics c_out = row_count;

  insert into public.students (id, name, id_number, phone, notes, created_at, updated_at)
  select
    (e->>'id')::uuid, e->>'name', e->>'id_number', e->>'phone', e->>'notes',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now())),
    coalesce((e->>'updated_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'students') e;
  get diagnostics s_out = row_count;

  insert into public.enrollments (id, student_id, course_id, course_name, course_value, created_at, updated_at)
  select
    coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'student_id')::uuid,
    (select c.id from public.courses c where c.id = nullif(e->>'course_id', '')::uuid),
    e->>'course_name', (e->>'course_value')::numeric,
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now())),
    coalesce((e->>'updated_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(enrollments) e
  on conflict (student_id, course_name) do nothing;
  get diagnostics e_out = row_count;

  insert into public.receipt_vouchers
    (id, voucher_number, voucher_date, student_id, student_name_snapshot, course_name,
     course_value, amount_received, payer_name, notes, cancelled_at, cancel_reason, created_at,
     fee_category, external_share)
  overriding system value
  select
    (e->>'id')::uuid, (e->>'voucher_number')::bigint, (e->>'voucher_date')::date,
    (e->>'student_id')::uuid, e->>'student_name_snapshot', e->>'course_name',
    (e->>'course_value')::numeric, (e->>'amount_received')::numeric,
    coalesce(e->>'payer_name', ''), coalesce(e->>'notes', ''),
    (e->>'cancelled_at')::timestamptz, e->>'cancel_reason',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now())),
    nullif(e->>'fee_category', ''), coalesce((e->>'external_share')::numeric, 0)
  from jsonb_array_elements(payload->'receipt_vouchers') e;
  get diagnostics r_out = row_count;

  insert into public.payment_vouchers
    (id, voucher_number, voucher_date, expense_type, amount, notes, cancelled_at, cancel_reason, created_at)
  overriding system value
  select
    (e->>'id')::uuid, (e->>'voucher_number')::bigint, (e->>'voucher_date')::date,
    e->>'expense_type', (e->>'amount')::numeric, coalesce(e->>'notes', ''),
    (e->>'cancelled_at')::timestamptz, e->>'cancel_reason',
    coalesce((e->>'created_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'payment_vouchers') e;
  get diagnostics p_out = row_count;

  perform setval(
    pg_get_serial_sequence('public.receipt_vouchers', 'voucher_number'),
    coalesce((select max(voucher_number) from public.receipt_vouchers), 0) + 1, false);
  perform setval(
    pg_get_serial_sequence('public.payment_vouchers', 'voucher_number'),
    coalesce((select max(voucher_number) from public.payment_vouchers), 0) + 1, false);

  after_counts := jsonb_build_object(
    'students', s_out, 'courses', c_out, 'enrollments', e_out,
    'receipt_vouchers', r_out, 'payment_vouchers', p_out);

  insert into public.restore_log (restored_by, forced, before_counts, after_counts)
  values (auth.uid(), force, before_counts, after_counts);

  insert into public.audit_log (entity, action, label, changed_by, old_data, new_data)
  values ('restore', 'restore', 'استعادة نسخة احتياطيّة', auth.uid(), before_counts, after_counts);

  return after_counts;
end;
$$;

revoke all on function public.restore_center_data(jsonb, boolean) from public, anon;
grant execute on function public.restore_center_data(jsonb, boolean) to authenticated;

commit;

