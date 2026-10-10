begin;

-- Updating a student's monthly rate must immediately flow through existing
-- monthly obligations, the statement view, and the balance calculation.
-- Receipts, allocations, cancelled obligations, and ledger rows stay untouched.

create or replace function public.enforce_fee_obligation_financial_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then return new; end if;

  if new.enrollment_id is not null then
    if not exists (
      select 1 from public.enrollments e
      where e.id = new.enrollment_id
        and e.student_id = new.student_id
        and (new.course_id is null or e.course_id = new.course_id)
        and (new.course_name is null or e.course_name = new.course_name)
    ) then raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH'; end if;
  elsif new.course_id is not null then
    if not exists (select 1 from public.courses c where c.id = new.course_id) then
      raise exception 'FEE_OBLIGATION_COURSE_NOT_FOUND';
    end if;
  end if;

  if new.fee_kind not in ('additional', 'monthly_course')
     or (new.fee_kind = 'monthly_course' and (new.due_month is null
       or new.due_month <> date_trunc('month', new.due_month)::date
       or new.enrollment_id is null or new.course_id is null))
     or (new.fee_kind = 'additional' and new.due_month is not null) then
    raise exception 'INVALID_FEE_OBLIGATION_KIND';
  end if;

  if tg_op = 'UPDATE' then
    if old.cancelled_at is not null then raise exception 'CANCELLED_FEE_OBLIGATION_IS_IMMUTABLE'; end if;
    if new.id is distinct from old.id or new.student_id is distinct from old.student_id
       or new.enrollment_id is distinct from old.enrollment_id or new.course_id is distinct from old.course_id
       or new.course_name is distinct from old.course_name or new.description is distinct from old.description
       or new.fee_kind is distinct from old.fee_kind or new.due_month is distinct from old.due_month
       or new.created_at is distinct from old.created_at then
      raise exception 'FEE_OBLIGATION_FINANCIAL_FIELDS_IMMUTABLE';
    end if;

    if (new.amount is distinct from old.amount or new.external_share is distinct from old.external_share
        or new.fee_category is distinct from old.fee_category)
       and current_setting('app.monthly_fee_obligation_editing', true) is distinct from 'on' then
      raise exception 'FEE_OBLIGATION_FINANCIAL_FIELDS_IMMUTABLE';
    end if;

    if old.cancelled_at is null and new.cancelled_at is not null
       and nullif(btrim(new.cancel_reason), '') is null then
      raise exception 'FEE_CANCELLATION_REASON_REQUIRED';
    end if;
    if old.cancelled_at is not null and new.cancelled_at is distinct from old.cancelled_at then
      raise exception 'CANCELLED_FEE_OBLIGATION_IS_IMMUTABLE';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_fee_obligation_financial_identity() from public, anon, authenticated;

create or replace function public.update_monthly_enrollment_fee(
  p_enrollment_id uuid,
  p_amount numeric,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_course_id uuid;
  v_course_name text;
  v_old_amount numeric;
  v_old_override numeric;
  v_reason text := btrim(coalesce(p_reason, ''));
  v_audit_id uuid;
  v_updated_count integer := 0;
  v_paid_total numeric := 0;
  v_blocked_month date;
  v_blocked_amount numeric;
  v_blocked_paid numeric;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if p_enrollment_id is null then raise exception 'MONTHLY_ENROLLMENT_NOT_FOUND'; end if;
  if v_reason = '' then raise exception 'MONTHLY_FEE_ADJUSTMENT_REASON_REQUIRED'; end if;
  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0
     or p_amount <> trunc(p_amount) or p_amount > 100000000 then
    raise exception 'INVALID_MONTHLY_FEE_AMOUNT';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('monthly-enrollment:' || p_enrollment_id::text, 0));
  select e.student_id, e.course_id, e.course_name, e.monthly_fee_override,
         coalesce(e.monthly_fee_override, c.monthly_fee)
    into v_student_id, v_course_id, v_course_name, v_old_override, v_old_amount
  from public.enrollments e
  join public.courses c on c.id = e.course_id
  where e.id = p_enrollment_id and e.billing_model = 'monthly'
  for update of e;

  if v_student_id is null then raise exception 'MONTHLY_ENROLLMENT_NOT_FOUND'; end if;

  -- Never lower a charge below what has already been allocated/paid, and never
  -- rewrite cancelled obligations. This avoids negative balances and preserves
  -- the immutable receipt/ledger history.
  select fo.due_month, fo.amount, coalesce(sum(ra.amount), 0)
    into v_blocked_month, v_blocked_amount, v_blocked_paid
  from public.fee_obligations fo
  left join public.receipt_allocations ra on ra.fee_obligation_id = fo.id
  left join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id and rv.cancelled_at is null
  where fo.enrollment_id = p_enrollment_id
    and fo.fee_kind = 'monthly_course'
    and fo.cancelled_at is null
  group by fo.id
  having p_amount < coalesce(sum(ra.amount) filter (where rv.id is not null), 0)
  order by fo.due_month
  limit 1;

  if v_blocked_month is not null then
    raise exception 'MONTHLY_FEE_BELOW_ALREADY_PAID: month %, charge %, paid %',
      v_blocked_month, v_blocked_amount, v_blocked_paid;
  end if;

  if exists (
    select 1 from public.fee_obligations fo
    where fo.enrollment_id = p_enrollment_id
      and fo.fee_kind = 'monthly_course'
      and fo.cancelled_at is null
      and fo.fee_category = 'shared'
      and fo.external_share >= p_amount
  ) then
    raise exception 'MONTHLY_FEE_BELOW_EXTERNAL_SHARE';
  end if;

  if p_amount is distinct from v_old_amount
     or v_old_override is null
     or exists (
       select 1 from public.fee_obligations fo
       where fo.enrollment_id = p_enrollment_id
         and fo.fee_kind = 'monthly_course'
         and fo.cancelled_at is null
         and (
           fo.amount is distinct from p_amount
           or (fo.fee_category = 'external' and fo.external_share is distinct from p_amount)
           or (fo.fee_category = 'institute' and fo.external_share is distinct from 0)
         )
     ) then
    perform set_config('app.monthly_enrollment_fee_editing', 'on', true);
    update public.enrollments
      set monthly_fee_override = p_amount, monthly_fee_override_reason = v_reason
    where id = p_enrollment_id;
    perform set_config('app.monthly_enrollment_fee_editing', 'off', true);

    perform set_config('app.monthly_fee_obligation_editing', 'on', true);
    update public.fee_obligations fo
      set amount = p_amount,
          external_share = case
            when fo.fee_category = 'external' then p_amount
            when fo.fee_category = 'institute' then 0
            else fo.external_share
          end
    where fo.enrollment_id = p_enrollment_id
      and fo.fee_kind = 'monthly_course'
      and fo.cancelled_at is null
      and (
        fo.amount is distinct from p_amount
        or (fo.fee_category = 'external' and fo.external_share is distinct from p_amount)
        or (fo.fee_category = 'institute' and fo.external_share is distinct from 0)
      );
    get diagnostics v_updated_count = row_count;
    perform set_config('app.monthly_fee_obligation_editing', 'off', true);

    select coalesce(sum(ra.amount), 0) into v_paid_total
    from public.receipt_allocations ra
    join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
    join public.fee_obligations fo on fo.id = ra.fee_obligation_id
    where fo.enrollment_id = p_enrollment_id
      and fo.fee_kind = 'monthly_course'
      and fo.cancelled_at is null
      and rv.cancelled_at is null;

    v_audit_id := public.record_activity_event(
      'enrollment', 'monthly_fee_adjustment', 'تعديل الاشتراك الشهري للطالب', v_reason,
      jsonb_build_object(
        'enrollment_id', p_enrollment_id, 'student_id', v_student_id,
        'course_id', v_course_id, 'course_name', v_course_name,
        'old_amount', v_old_amount, 'new_amount', p_amount,
        'existing_obligations_updated', v_updated_count, 'allocated_payments_preserved', v_paid_total
      )
    );
  end if;

  return jsonb_build_object(
    'enrollment_id', p_enrollment_id, 'student_id', v_student_id, 'course_id', v_course_id,
    'monthly_fee', p_amount, 'changed', true, 'audit_id', v_audit_id,
    'existing_obligations_updated', v_updated_count,
    'applies_to', 'existing_unpaid_or_safely_adjustable_and_future_monthly_obligations'
  );
end;
$$;
revoke all on function public.update_monthly_enrollment_fee(uuid, numeric, text) from public, anon;
grant execute on function public.update_monthly_enrollment_fee(uuid, numeric, text) to authenticated;

commit;
