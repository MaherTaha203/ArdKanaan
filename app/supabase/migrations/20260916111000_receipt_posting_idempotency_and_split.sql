begin;

-- Replace the posting RPC with the final transaction contract:
-- 1) idempotent by client-supplied UUID,
-- 2) enrollment-scoped course allocations,
-- 3) partial/repeated fee payments,
-- 4) exact per-fee external-share conservation,
-- 5) atomic receipt + allocations.
create or replace function public.post_receipt_with_allocations(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_student_id uuid;
  p_student_name text;
  p_date date;
  p_amount numeric;
  p_payer_name text;
  p_notes text;
  p_idempotency_key uuid;
  p_allocations jsonb;
  v_existing public.receipt_vouchers%rowtype;
  v_sum numeric := 0;
  v_external numeric := 0;
  v_fee_count int := 0;
  v_course_count int := 0;
  v_institute_fee_count int := 0;
  v_external_fee_count int := 0;
  v_shared_fee_count int := 0;
  v_receipt_id uuid;
  v_voucher_number bigint;
  v_summary_name text := 'تحصيل متعدّد';
  v_summary_value numeric := 0;
  a jsonb;
  v_type text;
  v_amount numeric;
  v_enrollment_id uuid;
  v_fee_id uuid;
  v_course_fee numeric;
  v_course_paid numeric;
  v_fee_total numeric;
  v_fee_paid numeric;
  v_fee_external numeric;
  v_fee_category text;
  v_prior_external numeric;
  v_remaining_external numeric;
  v_allocation_external numeric;
  v_lock bigint;
  v_seen_enrollments uuid[] := array[]::uuid[];
  v_seen_fees uuid[] := array[]::uuid[];
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object' then raise exception 'INVALID_RECEIPT_PAYLOAD'; end if;

  p_student_id := nullif(payload->>'student_id', '')::uuid;
  p_student_name := btrim(coalesce(payload->>'student_name', ''));
  p_date := nullif(payload->>'voucher_date', '')::date;
  p_amount := (payload->>'amount_received')::numeric;
  p_payer_name := btrim(coalesce(payload->>'payer_name', ''));
  p_notes := btrim(coalesce(payload->>'notes', ''));
  p_idempotency_key := nullif(payload->>'idempotency_key', '')::uuid;
  p_allocations := payload->'allocations';

  if p_student_id is null or p_student_name = '' or p_date is null
     or p_amount is null or p_amount <= 0 or p_amount <> trunc(p_amount)
     or p_idempotency_key is null
     or jsonb_typeof(p_allocations) <> 'array' or jsonb_array_length(p_allocations) = 0 then
    raise exception 'INVALID_RECEIPT_PAYLOAD';
  end if;
  if p_amount > 1000000 then raise exception 'RECEIPT_AMOUNT_TOO_LARGE'; end if;

  -- Serialize on the idempotency key so two concurrent retries cannot both pass
  -- the existence check before either inserts the receipt.
  v_lock := hashtextextended('receipt-idempotency:' || p_idempotency_key::text, 0);
  perform pg_advisory_xact_lock(v_lock);

  select * into v_existing
  from public.receipt_vouchers
  where idempotency_key = p_idempotency_key
  limit 1;

  if found then
    if v_existing.student_id is distinct from p_student_id
       or v_existing.amount_received is distinct from p_amount
       or v_existing.voucher_date is distinct from p_date then
      raise exception 'IDEMPOTENCY_KEY_REUSE_MISMATCH';
    end if;
    return jsonb_build_object(
      'id', v_existing.id,
      'voucher_number', v_existing.voucher_number,
      'amount_received', v_existing.amount_received,
      'idempotent_replay', true
    );
  end if;

  for a in select value from jsonb_array_elements(p_allocations) loop
    v_type := a->>'type';
    v_amount := (a->>'amount')::numeric;
    if v_amount is null or v_amount <= 0 or v_amount <> trunc(v_amount) then
      raise exception 'INVALID_RECEIPT_ALLOCATION';
    end if;
    v_sum := v_sum + v_amount;

    if v_type = 'course' then
      v_course_count := v_course_count + 1;
      v_enrollment_id := nullif(a->>'enrollment_id', '')::uuid;
      if v_enrollment_id is null then raise exception 'COURSE_ALLOCATION_REQUIRES_ENROLLMENT'; end if;
      if v_enrollment_id = any(v_seen_enrollments) then
        raise exception 'DUPLICATE_ENROLLMENT_ALLOCATION';
      end if;
      v_seen_enrollments := array_append(v_seen_enrollments, v_enrollment_id);

      v_lock := hashtextextended('enrollment:' || v_enrollment_id::text, 0);
      perform pg_advisory_xact_lock(v_lock);

      select e.course_value into v_course_fee
      from public.enrollments e
      where e.id = v_enrollment_id and e.student_id = p_student_id
      for share;
      if v_course_fee is null then raise exception 'ENROLLMENT_NOT_FOUND'; end if;

      select coalesce(sum(ra.amount), 0) into v_course_paid
      from public.receipt_allocations ra
      join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
      where ra.enrollment_id = v_enrollment_id and rv.cancelled_at is null;
      if v_amount > (v_course_fee - v_course_paid) then
        raise exception 'COURSE_ALLOCATION_EXCEEDS_REMAINING_BALANCE';
      end if;

      if v_summary_value = 0 then
        select e.course_name, e.course_value into v_summary_name, v_summary_value
        from public.enrollments e where e.id = v_enrollment_id;
      end if;

    elsif v_type = 'fee' then
      v_fee_count := v_fee_count + 1;
      v_fee_id := nullif(a->>'fee_obligation_id', '')::uuid;
      if v_fee_id is null then raise exception 'FEE_ALLOCATION_REQUIRES_OBLIGATION'; end if;
      if v_fee_id = any(v_seen_fees) then
        raise exception 'DUPLICATE_FEE_ALLOCATION';
      end if;
      v_seen_fees := array_append(v_seen_fees, v_fee_id);

      v_lock := hashtextextended('fee:' || v_fee_id::text, 0);
      perform pg_advisory_xact_lock(v_lock);

      select f.amount, f.external_share, f.fee_category
      into v_fee_total, v_fee_external, v_fee_category
      from public.fee_obligations f
      where f.id = v_fee_id and f.student_id = p_student_id and f.cancelled_at is null;
      if v_fee_total is null then raise exception 'FEE_OBLIGATION_NOT_FOUND'; end if;
      if v_fee_total <= 0 then raise exception 'INVALID_FEE_OBLIGATION'; end if;

      select coalesce(sum(ra.amount), 0), coalesce(sum(ra.external_share), 0)
      into v_fee_paid, v_prior_external
      from public.receipt_allocations ra
      join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
      where ra.fee_obligation_id = v_fee_id and rv.cancelled_at is null;

      if v_amount > (v_fee_total - v_fee_paid) then
        raise exception 'FEE_ALLOCATION_EXCEEDS_REMAINING_BALANCE';
      end if;
      if v_prior_external > v_fee_external then
        raise exception 'FEE_EXTERNAL_SHARE_ALREADY_EXCEEDED';
      end if;

      v_remaining_external := v_fee_external - v_prior_external;
      if v_amount = (v_fee_total - v_fee_paid) then
        -- Final payment receives the exact remaining external amount, avoiding
        -- cumulative rounding drift across partial payments.
        v_allocation_external := v_remaining_external;
      else
        v_allocation_external := round(v_amount * v_fee_external / v_fee_total, 2);
        v_allocation_external := least(v_allocation_external, v_remaining_external);
      end if;

      v_external := v_external + v_allocation_external;

      if v_fee_category = 'institute' then v_institute_fee_count := v_institute_fee_count + 1;
      elsif v_fee_category = 'external' then v_external_fee_count := v_external_fee_count + 1;
      else v_shared_fee_count := v_shared_fee_count + 1;
      end if;

      if v_summary_value = 0 then
        select f.description, f.amount into v_summary_name, v_summary_value
        from public.fee_obligations f where f.id = v_fee_id;
      end if;
    else
      raise exception 'INVALID_RECEIPT_ALLOCATION';
    end if;
  end loop;

  if v_sum <> p_amount then raise exception 'RECEIPT_ALLOCATION_TOTAL_MISMATCH'; end if;

  if v_fee_count = 0 then
    v_fee_category := null;
    v_external := 0;
  elsif v_course_count > 0
     or (v_institute_fee_count > 0 and v_external_fee_count > 0)
     or (v_external_fee_count > 0 and v_shared_fee_count > 0)
     or (v_institute_fee_count > 0 and v_shared_fee_count > 0) then
    v_fee_category := 'mixed';
  elsif v_external_fee_count > 0 then
    v_fee_category := 'external';
  elsif v_shared_fee_count > 0 then
    v_fee_category := 'shared';
  else
    v_fee_category := 'institute';
  end if;

  if v_external > p_amount then raise exception 'INVALID_EXTERNAL_SHARE'; end if;
  if v_fee_category = 'external' and v_external <> p_amount then
    raise exception 'EXTERNAL_SHARE_MISMATCH';
  end if;
  if v_fee_category in ('shared', 'mixed') and v_external <= 0 then
    raise exception 'INVALID_EXTERNAL_SHARE';
  end if;
  if v_summary_value = 0 then v_summary_value := p_amount; end if;

  perform set_config('app.receipt_posting', 'on', true);

  insert into public.receipt_vouchers
    (student_id, student_name_snapshot, voucher_date, course_name, course_value,
     amount_received, payer_name, notes, fee_category, external_share,
     allocation_mode, idempotency_key)
  values
    (p_student_id, p_student_name, p_date, v_summary_name, v_summary_value,
     p_amount, p_payer_name, p_notes, v_fee_category, v_external, true,
     p_idempotency_key)
  returning id, voucher_number into v_receipt_id, v_voucher_number;

  for a in select value from jsonb_array_elements(p_allocations) loop
    v_type := a->>'type';
    v_amount := (a->>'amount')::numeric;
    if v_type = 'course' then
      v_allocation_external := 0;
    else
      v_fee_id := nullif(a->>'fee_obligation_id', '')::uuid;
      v_lock := hashtextextended('fee:' || v_fee_id::text, 0);
      perform pg_advisory_xact_lock(v_lock);
      select coalesce(sum(ra.external_share), 0)
        into v_prior_external
      from public.receipt_allocations ra
      join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
      where ra.fee_obligation_id = v_fee_id and rv.cancelled_at is null;
      select f.amount, f.external_share into v_fee_total, v_fee_external
      from public.fee_obligations f where f.id = v_fee_id;
      select coalesce(sum(ra.amount), 0) into v_fee_paid
      from public.receipt_allocations ra
      join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
      where ra.fee_obligation_id = v_fee_id and rv.cancelled_at is null;
      if v_amount = (v_fee_total - v_fee_paid) then
        v_allocation_external := v_fee_external - v_prior_external;
      else
        v_allocation_external := least(round(v_amount * v_fee_external / v_fee_total, 2), v_fee_external - v_prior_external);
      end if;
    end if;

    insert into public.receipt_allocations
      (receipt_voucher_id, allocation_type, enrollment_id, fee_obligation_id, amount, external_share)
    values
      (v_receipt_id, v_type, nullif(a->>'enrollment_id', '')::uuid,
       nullif(a->>'fee_obligation_id', '')::uuid, v_amount, v_allocation_external);
  end loop;

  return jsonb_build_object('id', v_receipt_id, 'voucher_number', v_voucher_number,
                           'amount_received', p_amount, 'idempotent_replay', false);
end;
$$;

revoke all on function public.post_receipt_with_allocations(jsonb) from public, anon;
grant execute on function public.post_receipt_with_allocations(jsonb) to authenticated;

-- Fee creation must deduplicate selected students so one student cannot receive
-- the same obligation twice because the UI supplied duplicate IDs.
create or replace function public.create_fee_obligations(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_course_id uuid;
  p_student_ids jsonb;
  p_description text;
  p_amount numeric;
  p_category text;
  p_external numeric;
  v_student_id uuid;
  v_enrollment_id uuid;
  v_course_name text;
  v_count int := 0;
  v_missing int := 0;
  item jsonb;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object' then raise exception 'INVALID_FEE_PAYLOAD'; end if;

  p_course_id := nullif(payload->>'course_id', '')::uuid;
  p_student_ids := payload->'student_ids';
  p_description := btrim(coalesce(payload->>'description', ''));
  p_amount := (payload->>'amount')::numeric;
  p_category := payload->>'fee_category';
  p_external := coalesce((payload->>'external_share')::numeric, 0);

  if p_course_id is null or jsonb_typeof(p_student_ids) <> 'array' or jsonb_array_length(p_student_ids) = 0
     or p_description = '' or p_amount is null or p_amount <= 0 or p_amount <> trunc(p_amount)
     or p_category not in ('institute','external','shared') or p_external < 0 or p_external > p_amount
     or (p_category = 'institute' and p_external <> 0)
     or (p_category = 'external' and p_external <> p_amount)
     or (p_category = 'shared' and (p_external <= 0 or p_external >= p_amount)) then
    raise exception 'INVALID_FEE_PAYLOAD';
  end if;

  perform 1 from public.courses c where c.id = p_course_id;
  if not found then raise exception 'COURSE_NOT_FOUND'; end if;

  -- Validate the distinct target set before writing anything.
  for item in
    select to_jsonb(s.student_id)
    from (
      select distinct value as student_id
      from jsonb_array_elements_text(p_student_ids)
      where btrim(value) <> ''
    ) s
  loop
    v_student_id := nullif(item #>> '{}', '')::uuid;
    select e.id, e.course_name into v_enrollment_id, v_course_name
    from public.enrollments e
    where e.student_id = v_student_id and e.course_id = p_course_id
    for share;
    if v_enrollment_id is null then v_missing := v_missing + 1; end if;
  end loop;

  if v_missing > 0 then raise exception 'ENROLLMENT_REQUIRED_FOR_SELECTED_STUDENTS'; end if;

  for item in
    select to_jsonb(s.student_id)
    from (
      select distinct value as student_id
      from jsonb_array_elements_text(p_student_ids)
      where btrim(value) <> ''
    ) s
  loop
    v_student_id := nullif(item #>> '{}', '')::uuid;
    select e.id, e.course_name into v_enrollment_id, v_course_name
    from public.enrollments e
    where e.student_id = v_student_id and e.course_id = p_course_id;

    insert into public.fee_obligations
      (student_id, enrollment_id, course_id, course_name, description, amount, fee_category, external_share)
    values
      (v_student_id, v_enrollment_id, p_course_id, v_course_name, p_description, p_amount, p_category, p_external);
    v_count := v_count + 1;
  end loop;

  return jsonb_build_object('created', v_count);
end;
$$;

revoke all on function public.create_fee_obligations(jsonb) from public, anon;
grant execute on function public.create_fee_obligations(jsonb) to authenticated;

commit;
