begin;

-- ADR-0078 — Owner-adjustable per-enrollment registration price.
--
-- Narrow, non-forgeable exception to the enrollment financial firewall: the Owner
-- may change ONLY public.enrollments.course_value (the Final Registration Price
-- snapshot), and ONLY from inside the owner-only public.update_enrollment_fee RPC,
-- which sets the transaction-local GUC app.enrollment_fee_editing = 'on'. Every
-- other enrollment identity field (id, student_id, course_id, course_name,
-- created_at) stays immutable, and every other financial-firewall protection
-- (receipts, allocations, payments, fee obligations, the append-only ledger, and
-- all delete guards) is unchanged. The GUC alone is inert: `authenticated` holds no
-- UPDATE grant on public.enrollments, so only this SECURITY DEFINER, is_owner()-gated
-- RPC can reach the firewall's course_value branch — it cannot be forged by ordinary
-- authenticated SQL/API calls.
--
-- Crosses the frozen BR-013 / DAT-003 DB-047 (post-receipt price lock); recorded as a
-- tracked divergence reconciled at Documentation Freeze (ADR-0078; GOV-004 §5; frozen
-- BC-001/DAT-003 text left unedited). Created in-repo only; NOT applied to Production.

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

  -- UPDATE branch. The enrollment's financial IDENTITY is always immutable.
  if new.id is distinct from old.id
     or new.student_id is distinct from old.student_id
     or new.course_id is distinct from old.course_id
     or new.course_name is distinct from old.course_name
     or new.created_at is distinct from old.created_at then
    raise exception 'ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE';
  end if;

  -- course_value (the Final Registration Price snapshot) is immutable EXCEPT under
  -- the owner-only fee-edit RPC (ADR-0078), which sets app.enrollment_fee_editing='on'
  -- inside its own transaction. NULL-safe check: an unset/other GUC value blocks.
  if new.course_value is distinct from old.course_value
     and current_setting('app.enrollment_fee_editing', true) is distinct from 'on' then
    raise exception 'ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_enrollment_financial_firewall() from public, anon, authenticated;

-- Owner-only RPC: adjust ONE enrollment's total course fee (course_value / FRP),
-- floored at the valid collected total for that enrollment. Atomic; concurrency-safe
-- with post_receipt_with_allocations via the same advisory-lock key + FOR UPDATE.
create or replace function public.update_enrollment_fee(
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
  v_lock bigint;
  v_old_fee numeric;
  v_student_id uuid;
  v_paid numeric;
  v_reason text := btrim(coalesce(p_reason, ''));
  v_audit_id uuid;
  v_changed boolean;
begin
  if not public.is_owner() then
    raise exception 'OWNER_ONLY';
  end if;

  if p_enrollment_id is null then
    raise exception 'ENROLLMENT_NOT_FOUND';
  end if;
  if v_reason = '' then
    raise exception 'FEE_ADJUSTMENT_REASON_REQUIRED';
  end if;
  -- amount must be a finite, positive-or-zero, whole-shekel value within limits.
  if p_amount is null or p_amount = 'NaN'::numeric then
    raise exception 'INVALID_FEE_AMOUNT';
  end if;
  if p_amount < 0 or p_amount <> trunc(p_amount) then
    raise exception 'INVALID_FEE_AMOUNT';
  end if;
  if p_amount > 100000000 then
    raise exception 'FEE_AMOUNT_TOO_LARGE';
  end if;

  -- Serialize with concurrent receipt posting / fee edits on the SAME enrollment.
  v_lock := hashtextextended('enrollment:' || p_enrollment_id::text, 0);
  perform pg_advisory_xact_lock(v_lock);

  select e.course_value, e.student_id
    into v_old_fee, v_student_id
  from public.enrollments e
  where e.id = p_enrollment_id
  for update;

  if v_old_fee is null then
    raise exception 'ENROLLMENT_NOT_FOUND';
  end if;

  -- Canonical valid collected total for this enrollment: course allocations on
  -- non-cancelled receipts (identical to post_receipt_with_allocations).
  select coalesce(sum(ra.amount), 0)
    into v_paid
  from public.receipt_allocations ra
  join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
  where ra.enrollment_id = p_enrollment_id
    and rv.cancelled_at is null;

  -- The new fee may never fall below what has already been validly collected.
  if p_amount < v_paid then
    raise exception 'FEE_BELOW_COLLECTED';
  end if;

  v_changed := p_amount is distinct from v_old_fee;

  if v_changed then
    perform set_config('app.enrollment_fee_editing', 'on', true);
    update public.enrollments
       set course_value = p_amount
     where id = p_enrollment_id;
    perform set_config('app.enrollment_fee_editing', 'off', true);

    -- Immutable audit row: old, new, reason, actor, timestamp (via the owner-only,
    -- client-immutable audit sink). No spurious record when nothing changed.
    v_audit_id := public.record_activity_event(
      'enrollment',
      'fee_adjustment',
      'تعديل رسوم التسجيل',
      v_reason,
      jsonb_build_object(
        'enrollment_id', p_enrollment_id,
        'student_id', v_student_id,
        'old_amount', v_old_fee,
        'new_amount', p_amount,
        'paid', v_paid
      )
    );
  end if;

  return jsonb_build_object(
    'enrollment_id', p_enrollment_id,
    'fee', p_amount,
    'paid', v_paid,
    'remaining', p_amount - v_paid,
    'old_fee', v_old_fee,
    'changed', v_changed,
    'audit_id', v_audit_id
  );
end;
$$;

revoke all on function public.update_enrollment_fee(uuid, numeric, text) from public, anon;
grant execute on function public.update_enrollment_fee(uuid, numeric, text) to authenticated;

-- ADR-0078 — restore compatibility. An enrollment's course_value (FRP) may now
-- legitimately diverge from its course base_fee (owner-adjusted per enrollment).
-- The restore pre-validation must therefore stop requiring course_value = base_fee;
-- only the course-name identity is validated, and the backup's course_value is
-- restored exactly as stored. Every other restore validation and behaviour is
-- reproduced unchanged from 20260916125000.
create or replace function public.restore_center_data(payload jsonb, force boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
-- The insert...select statements alias jsonb_array_elements(...) as `e`, which also
-- names the loop variable declared below. Resolve that collision toward the row alias
-- so the inserts read backup columns (a pre-existing latent ambiguity surfaced only by
-- a backup carrying a non-empty courses array; harmless for the fee-edit relaxation).
#variable_conflict use_column
declare
  s_in int; r_in int; p_in int;
  s_cur int; r_cur int; p_cur int;
  s_out int; r_out int; p_out int; e_out int; c_out int; f_out int; a_out int;
  courses jsonb; enrollments jsonb; fee_obligations jsonb; receipt_allocations jsonb;
  before_counts jsonb; after_counts jsonb;
  e jsonb;
  v_id uuid;
  v_student uuid;
  v_course uuid;
  v_enrollment uuid;
  v_receipt uuid;
  v_fee uuid;
  v_amount numeric;
  v_sum numeric;
  v_course_name text;
  v_course_value numeric;
  v_fee_total numeric;
  v_fee_external numeric;
  v_allocation_count int;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null
     or jsonb_typeof(payload->'students') <> 'array'
     or jsonb_typeof(payload->'receipt_vouchers') <> 'array'
     or jsonb_typeof(payload->'payment_vouchers') <> 'array' then
    raise exception 'INVALID_BACKUP_FORMAT';
  end if;

  courses := case when jsonb_typeof(payload->'courses') = 'array' then payload->'courses' else '[]'::jsonb end;
  enrollments := case when jsonb_typeof(payload->'enrollments') = 'array' then payload->'enrollments' else '[]'::jsonb end;
  fee_obligations := case when jsonb_typeof(payload->'fee_obligations') = 'array' then payload->'fee_obligations' else '[]'::jsonb end;
  receipt_allocations := case when jsonb_typeof(payload->'receipt_allocations') = 'array' then payload->'receipt_allocations' else '[]'::jsonb end;

  s_in := jsonb_array_length(payload->'students');
  r_in := jsonb_array_length(payload->'receipt_vouchers');
  p_in := jsonb_array_length(payload->'payment_vouchers');
  if s_in > 200000 or r_in > 1000000 or p_in > 1000000 then raise exception 'RESTORE_TOO_LARGE'; end if;

  select count(*) into s_cur from public.students;
  select count(*) into r_cur from public.receipt_vouchers;
  select count(*) into p_cur from public.payment_vouchers;
  if (s_in + r_in + p_in) = 0 and (s_cur + r_cur + p_cur) > 0 then raise exception 'RESTORE_REFUSED_EMPTY'; end if;
  if not force and (s_in < s_cur or r_in < r_cur or p_in < p_cur) then raise exception 'RESTORE_SHRINKS'; end if;

  -- Validate all referenced identities before the destructive phase.
  for e in select value from jsonb_array_elements(enrollments) loop
    v_student := nullif(e->>'student_id', '')::uuid;
    v_course := nullif(e->>'course_id', '')::uuid;
    if v_student is null or v_course is null or nullif(e->>'course_name', '') is null or (e->>'course_value')::numeric is null then
      raise exception 'INVALID_ENROLLMENT_BACKUP';
    end if;
    select c.name, c.base_fee into v_course_name, v_course_value
    from jsonb_array_elements(courses) c0
    cross join lateral (select c0->>'name' as name, (c0->>'base_fee')::numeric as base_fee) c
    where (c0->>'id')::uuid = v_course;
    if v_course_name is null then raise exception 'RESTORE_ENROLLMENT_COURSE_NOT_FOUND'; end if;
    -- ADR-0078: course_value (FRP) may diverge from base_fee; validate only the
    -- course-name identity here. The backup's course_value is restored as-is.
    if e->>'course_name' is distinct from v_course_name then
      raise exception 'ENROLLMENT_FINANCIAL_SNAPSHOT_MISMATCH';
    end if;
  end loop;

  for e in select value from jsonb_array_elements(fee_obligations) loop
    v_student := nullif(e->>'student_id', '')::uuid;
    v_course := nullif(e->>'course_id', '')::uuid;
    v_enrollment := nullif(e->>'enrollment_id', '')::uuid;
    if v_student is null or v_course is null or v_enrollment is null or (e->>'amount')::numeric is null then
      raise exception 'INVALID_FEE_BACKUP';
    end if;
    if not exists (
      select 1 from jsonb_array_elements(enrollments) x
      where (x->>'id')::uuid = v_enrollment
        and (x->>'student_id')::uuid = v_student
        and (x->>'course_id')::uuid = v_course
        and x->>'course_name' = e->>'course_name'
    ) then
      raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH';
    end if;
    v_fee_total := (e->>'amount')::numeric;
    v_fee_external := coalesce((e->>'external_share')::numeric, 0);
    if v_fee_total <= 0 or v_fee_external < 0 or v_fee_external > v_fee_total then raise exception 'INVALID_FEE_BACKUP'; end if;
    if e->>'fee_category' not in ('institute','external','shared') then raise exception 'INVALID_FEE_CATEGORY'; end if;
    if (e->>'fee_category') = 'institute' and v_fee_external <> 0 then raise exception 'INVALID_FEE_EXTERNAL_SHARE'; end if;
    if (e->>'fee_category') = 'external' and v_fee_external <> v_fee_total then raise exception 'INVALID_FEE_EXTERNAL_SHARE'; end if;
    if (e->>'fee_category') = 'shared' and (v_fee_external <= 0 or v_fee_external >= v_fee_total) then raise exception 'INVALID_FEE_EXTERNAL_SHARE'; end if;
  end loop;

  -- Every allocation must point to exactly one valid target belonging to the
  -- receipt's student, and every receipt's allocations must sum to its amount.
  for e in select value from jsonb_array_elements(receipt_allocations) loop
    v_receipt := nullif(e->>'receipt_voucher_id', '')::uuid;
    v_student := null;
    v_enrollment := nullif(e->>'enrollment_id', '')::uuid;
    v_fee := nullif(e->>'fee_obligation_id', '')::uuid;
    v_amount := (e->>'amount')::numeric;
    if v_receipt is null or v_amount is null or v_amount <= 0 then raise exception 'INVALID_RECEIPT_ALLOCATION_BACKUP'; end if;
    if e->>'allocation_type' not in ('course','fee') then raise exception 'INVALID_RECEIPT_ALLOCATION_BACKUP'; end if;
    if e->>'allocation_type' = 'course' then
      if v_enrollment is null or v_fee is not null then raise exception 'INVALID_COURSE_ALLOCATION_BACKUP'; end if;
      select (x->>'student_id')::uuid into v_student from jsonb_array_elements(enrollments) x where (x->>'id')::uuid = v_enrollment;
      if v_student is null then raise exception 'ALLOCATION_ENROLLMENT_NOT_FOUND'; end if;
    else
      if v_fee is null or v_enrollment is not null then raise exception 'INVALID_FEE_ALLOCATION_BACKUP'; end if;
      select (x->>'student_id')::uuid into v_student from jsonb_array_elements(fee_obligations) x where (x->>'id')::uuid = v_fee;
      if v_student is null then raise exception 'ALLOCATION_FEE_NOT_FOUND'; end if;
    end if;
    if not exists (select 1 from jsonb_array_elements(payload->'receipt_vouchers') rv where (rv->>'id')::uuid = v_receipt and (rv->>'student_id')::uuid = v_student) then
      raise exception 'RECEIPT_ALLOCATION_STUDENT_MISMATCH';
    end if;
  end loop;

  for e in select value from jsonb_array_elements(payload->'receipt_vouchers') loop
    v_receipt := (e->>'id')::uuid;
    v_amount := (e->>'amount_received')::numeric;
    select coalesce(sum((a->>'amount')::numeric), 0), count(*) into v_sum, v_allocation_count
    from jsonb_array_elements(receipt_allocations) a
    where (a->>'receipt_voucher_id')::uuid = v_receipt;
    if v_allocation_count = 0 then
      if coalesce((e->>'allocation_mode')::boolean, false) then raise exception 'ALLOCATION_REQUIRED_FOR_MODERN_RECEIPT'; end if;
    elsif v_sum <> v_amount then
      raise exception 'RESTORE_RECEIPT_ALLOCATION_TOTAL_MISMATCH';
    end if;
  end loop;

  before_counts := jsonb_build_object('students', s_cur, 'receipt_vouchers', r_cur, 'payment_vouchers', p_cur);
  perform set_config('app.restoring', 'on', true);
  delete from public.receipt_allocations;
  delete from public.receipt_vouchers;
  delete from public.payment_vouchers;
  delete from public.fee_obligations;
  delete from public.enrollments;
  delete from public.students;
  delete from public.courses;

  insert into public.courses (id, name, base_fee, start_date, end_date, status, notes, created_at, updated_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), e->>'name', nullif(e->>'base_fee', '')::numeric, nullif(e->>'start_date', '')::date, nullif(e->>'end_date', '')::date, coalesce(nullif(e->>'status', ''), 'active'), coalesce(e->>'notes', ''), coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), coalesce((e->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(courses) e;
  get diagnostics c_out = row_count;

  insert into public.students (id, name, id_number, phone, notes, created_at, updated_at)
  select (e->>'id')::uuid, e->>'name', e->>'id_number', e->>'phone', e->>'notes', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), coalesce((e->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(payload->'students') e;
  get diagnostics s_out = row_count;

  insert into public.enrollments (id, student_id, course_id, course_name, course_value, created_at, updated_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'student_id')::uuid, (e->>'course_id')::uuid, e->>'course_name', (e->>'course_value')::numeric, coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), coalesce((e->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(enrollments) e;
  get diagnostics e_out = row_count;

  insert into public.fee_obligations (id, student_id, enrollment_id, course_id, course_name, description, amount, fee_category, external_share, cancelled_at, cancel_reason, created_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'student_id')::uuid, (e->>'enrollment_id')::uuid, (e->>'course_id')::uuid, e->>'course_name', e->>'description', (e->>'amount')::numeric, e->>'fee_category', coalesce((e->>'external_share')::numeric, 0), (e->>'cancelled_at')::timestamptz, e->>'cancel_reason', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(fee_obligations) e;
  get diagnostics f_out = row_count;

  insert into public.receipt_vouchers (id, voucher_number, voucher_date, student_id, student_name_snapshot, course_name, course_value, amount_received, payer_name, notes, cancelled_at, cancel_reason, created_at, fee_category, external_share, allocation_mode, idempotency_key, idempotency_payload_hash)
  overriding system value
  select (e->>'id')::uuid, (e->>'voucher_number')::bigint, (e->>'voucher_date')::date, (e->>'student_id')::uuid, e->>'student_name_snapshot', e->>'course_name', (e->>'course_value')::numeric, (e->>'amount_received')::numeric, coalesce(e->>'payer_name', ''), coalesce(e->>'notes', ''), (e->>'cancelled_at')::timestamptz, e->>'cancel_reason', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())), nullif(e->>'fee_category', ''), coalesce((e->>'external_share')::numeric, 0), coalesce((e->>'allocation_mode')::boolean, false), nullif(e->>'idempotency_key', '')::uuid, nullif(e->>'idempotency_payload_hash', '') from jsonb_array_elements(payload->'receipt_vouchers') e;
  get diagnostics r_out = row_count;

  insert into public.receipt_allocations (id, receipt_voucher_id, allocation_type, enrollment_id, fee_obligation_id, amount, external_share, created_at)
  select coalesce((e->>'id')::uuid, gen_random_uuid()), (e->>'receipt_voucher_id')::uuid, e->>'allocation_type', nullif(e->>'enrollment_id', '')::uuid, nullif(e->>'fee_obligation_id', '')::uuid, (e->>'amount')::numeric, coalesce((e->>'external_share')::numeric, 0), coalesce((e->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(receipt_allocations) e;
  get diagnostics a_out = row_count;

  insert into public.payment_vouchers (id, voucher_number, voucher_date, expense_type, amount, notes, cancelled_at, cancel_reason, created_at)
  overriding system value
  select (e->>'id')::uuid, (e->>'voucher_number')::bigint, (e->>'voucher_date')::date, e->>'expense_type', (e->>'amount')::numeric, coalesce(e->>'notes', ''), (e->>'cancelled_at')::timestamptz, e->>'cancel_reason', coalesce((e->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(payload->'payment_vouchers') e;
  get diagnostics p_out = row_count;

  update public.receipt_vouchers rv
  set idempotency_payload_hash = md5((jsonb_build_object(
    'student_id', rv.student_id::text,
    'student_name', rv.student_name_snapshot,
    'voucher_date', rv.voucher_date::text,
    'amount_received', rv.amount_received,
    'payer_name', rv.payer_name,
    'notes', rv.notes,
    'allocations', coalesce((select jsonb_agg(jsonb_build_object(
      'type', ra.allocation_type,
      'enrollment_id', ra.enrollment_id,
      'fee_obligation_id', ra.fee_obligation_id,
      'amount', ra.amount
    ) order by ra.allocation_type, coalesce(ra.enrollment_id::text, ''), coalesce(ra.fee_obligation_id::text, ''), ra.amount) from public.receipt_allocations ra where ra.receipt_voucher_id = rv.id), '[]'::jsonb)
  ))::text)
  where rv.idempotency_key is not null and rv.idempotency_payload_hash is null;

  perform setval(pg_get_serial_sequence('public.receipt_vouchers', 'voucher_number'), coalesce((select max(voucher_number) from public.receipt_vouchers), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.payment_vouchers', 'voucher_number'), coalesce((select max(voucher_number) from public.payment_vouchers), 0) + 1, false);
  after_counts := jsonb_build_object('students', s_out, 'courses', c_out, 'enrollments', e_out, 'fee_obligations', f_out, 'receipt_vouchers', r_out, 'receipt_allocations', a_out, 'payment_vouchers', p_out);
  insert into public.restore_log (restored_by, forced, before_counts, after_counts) values (auth.uid(), force, before_counts, after_counts);
  insert into public.audit_log (entity, action, label, changed_by, old_data, new_data) values ('restore', 'restore', 'استعادة نسخة احتياطيّة', auth.uid(), before_counts, after_counts);
  return after_counts;
end;
$$;

revoke all on function public.restore_center_data(jsonb, boolean) from public, anon;
grant execute on function public.restore_center_data(jsonb, boolean) to authenticated;

commit;
