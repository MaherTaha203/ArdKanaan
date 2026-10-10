begin;
-- Per-enrollment monthly subscription price override. Existing monthly obligations,
-- receipts, allocations, and ledger rows are never rewritten; overrides apply only to
-- future monthly obligations. The restore function preserves override values/reasons.
alter table public.enrollments add column if not exists monthly_fee_override numeric,
  add column if not exists monthly_fee_override_reason text;
alter table public.enrollments add constraint enrollments_monthly_fee_override_valid check (
  monthly_fee_override is null or (billing_model='monthly' and monthly_fee_override>0
    and monthly_fee_override=trunc(monthly_fee_override) and monthly_fee_override<=100000000
    and nullif(btrim(coalesce(monthly_fee_override_reason,'')),'') is not null)
);
create or replace function public.enforce_enrollment_financial_firewall()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_course_name text; v_course_value numeric; v_monthly_fee numeric;
begin
  if current_setting('app.restoring', true) = 'on' then return new; end if;
  if tg_op = 'INSERT' then
    if new.id is null or new.student_id is null or new.course_id is null or new.course_name is null or new.course_value is null then
      raise exception 'ENROLLMENT_FINANCIAL_IDENTITY_REQUIRED';
    end if;
    select c.name, c.base_fee, c.monthly_fee into v_course_name, v_course_value, v_monthly_fee
    from public.courses c where c.id = new.course_id;
    if v_course_name is null then raise exception 'COURSE_NOT_FOUND'; end if;
    if new.billing_model not in ('legacy_total', 'monthly') then
      raise exception 'INVALID_ENROLLMENT_BILLING_MODEL';
    end if;
    if new.billing_model = 'legacy_total' and v_course_value is null then
      raise exception 'COURSE_BASE_FEE_REQUIRED';
    end if;
    if new.billing_model = 'monthly'
       and (v_monthly_fee is null or v_monthly_fee <= 0 or v_monthly_fee <> trunc(v_monthly_fee)) then
      raise exception 'COURSE_MONTHLY_FEE_REQUIRED';
    end if;
    if new.course_name is distinct from v_course_name
       or (new.billing_model = 'monthly' and new.course_value <> 0)
       or (new.billing_model = 'legacy_total' and new.course_value is distinct from v_course_value) then
      raise exception 'ENROLLMENT_FINANCIAL_SNAPSHOT_MISMATCH';
    end if;
    return new;
  end if;
  if new.id is distinct from old.id or new.student_id is distinct from old.student_id
     or new.course_id is distinct from old.course_id or new.course_name is distinct from old.course_name
     or new.billing_model is distinct from old.billing_model
     or new.created_at is distinct from old.created_at then
    raise exception 'ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE';
  end if;
  if old.billing_model = 'monthly' and new.course_value is distinct from 0 then
    raise exception 'MONTHLY_ENROLLMENT_LEGACY_FEE_LOCKED';
  end if;
  if new.course_value is distinct from old.course_value
     and current_setting('app.enrollment_fee_editing', true) is distinct from 'on' then
    raise exception 'ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE';
  end if;
  if (new.monthly_fee_override is distinct from old.monthly_fee_override
      or new.monthly_fee_override_reason is distinct from old.monthly_fee_override_reason)
     and current_setting('app.monthly_enrollment_fee_editing', true) is distinct from 'on' then
    raise exception 'MONTHLY_ENROLLMENT_FEE_OVERRIDE_RPC_REQUIRED';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_enrollment_financial_firewall() from public, anon, authenticated;
create or replace function public.update_monthly_enrollment_fee(p_enrollment_id uuid,p_amount numeric,p_reason text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_student_id uuid; v_course_id uuid; v_course_name text; v_old_amount numeric;
  v_old_override numeric; v_reason text := btrim(coalesce(p_reason, '')); v_audit_id uuid;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if p_enrollment_id is null then raise exception 'MONTHLY_ENROLLMENT_NOT_FOUND'; end if;
  if v_reason = '' then raise exception 'MONTHLY_FEE_ADJUSTMENT_REASON_REQUIRED'; end if;
  if p_amount is null or p_amount = 'NaN'::numeric or p_amount <= 0
     or p_amount <> trunc(p_amount) or p_amount > 100000000 then raise exception 'INVALID_MONTHLY_FEE_AMOUNT'; end if;
  perform pg_advisory_xact_lock(hashtextextended('monthly-enrollment:' || p_enrollment_id::text, 0));
  select e.student_id,e.course_id,e.course_name,e.monthly_fee_override,coalesce(e.monthly_fee_override,c.monthly_fee)
    into v_student_id,v_course_id,v_course_name,v_old_override,v_old_amount
  from public.enrollments e join public.courses c on c.id=e.course_id
  where e.id=p_enrollment_id and e.billing_model='monthly' for update of e;
  if v_student_id is null then raise exception 'MONTHLY_ENROLLMENT_NOT_FOUND'; end if;
  if p_amount is distinct from v_old_amount or v_old_override is null then
    perform set_config('app.monthly_enrollment_fee_editing','on',true);
    update public.enrollments set monthly_fee_override=p_amount, monthly_fee_override_reason=v_reason where id=p_enrollment_id;
    perform set_config('app.monthly_enrollment_fee_editing','off',true);
    v_audit_id := public.record_activity_event('enrollment','monthly_fee_adjustment','تعديل الاشتراك الشهري للطالب',v_reason,
      jsonb_build_object('enrollment_id',p_enrollment_id,'student_id',v_student_id,'course_id',v_course_id,
        'course_name',v_course_name,'old_amount',v_old_amount,'new_amount',p_amount));
  end if;
  return jsonb_build_object('enrollment_id',p_enrollment_id,'student_id',v_student_id,'course_id',v_course_id,
    'monthly_fee',p_amount,'changed',true,'audit_id',v_audit_id,'applies_to','future_monthly_obligations_only');
end;
$$;
revoke all on function public.update_monthly_enrollment_fee(uuid,numeric,text) from public, anon;
grant execute on function public.update_monthly_enrollment_fee(uuid,numeric,text) to authenticated;

create or replace function public.preview_monthly_course_obligations(
  p_course_id uuid,
  p_due_month date,
  p_fee_category text default 'institute',
  p_external_share numeric default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_month date;
  v_course_name text;
  v_amount numeric;
  v_students jsonb;
  v_external numeric;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if p_course_id is null or p_due_month is null then raise exception 'INVALID_MONTHLY_FEE_REQUEST'; end if;

  v_month := date_trunc('month', p_due_month)::date;

  select c.name, c.monthly_fee
    into v_course_name, v_amount
  from public.courses c
  where c.id = p_course_id and c.status = 'active';

  if v_course_name is null then raise exception 'COURSE_NOT_FOUND_OR_INACTIVE'; end if;
  if v_amount is null or v_amount <= 0 or v_amount <> trunc(v_amount) then
    raise exception 'COURSE_MONTHLY_FEE_REQUIRED';
  end if;

  v_external := p_external_share;
  if p_fee_category is null or p_fee_category not in ('institute', 'external', 'shared')
     or v_external is null or v_external < 0 or v_external <> trunc(v_external)
     or (p_fee_category = 'institute' and v_external <> 0)
     or (p_fee_category = 'external' and v_external <> v_amount)
     or (p_fee_category = 'shared' and (v_external <= 0 or v_external >= v_amount)) then
    raise exception 'INVALID_MONTHLY_FEE_RECIPIENT_SPLIT';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'student_id', s.id,
        'student_name', s.name,
        'enrollment_id', e.id,
        'amount', coalesce(e.monthly_fee_override, v_amount),
        'due_month', v_month,
        'already_exists', exists (
          select 1
          from public.fee_obligations fo
          where fo.enrollment_id = e.id
            and fo.fee_kind = 'monthly_course'
            and fo.due_month = v_month
        )
      )
      order by s.name, s.id
    ),
    '[]'::jsonb
  )
  into v_students
  from public.enrollments e
  join public.students s on s.id = e.student_id
  where e.course_id = p_course_id
    and e.billing_model = 'monthly'
    and coalesce(s.status, 'active') = 'active'
    and e.created_at < (v_month + interval '1 month');

  if p_fee_category = 'shared' and exists (
    select 1 from public.enrollments e
    join public.students s on s.id = e.student_id
    where e.course_id = p_course_id and e.billing_model = 'monthly'
      and coalesce(s.status, 'active') = 'active'
      and coalesce(e.monthly_fee_override, v_amount) <= v_external
      and coalesce(e.created_at, now()) < (v_month + interval '1 month')
  ) then raise exception 'INVALID_MONTHLY_FEE_RECIPIENT_SPLIT'; end if;

  return jsonb_build_object(
    'course_id', p_course_id,
    'course_name', v_course_name,
    'due_month', v_month,
    'monthly_amount', v_amount,
    'fee_category', p_fee_category,
    'external_share', v_external,
    'eligible_count', jsonb_array_length(v_students),
    'already_exists_count', (
      select count(*) from jsonb_array_elements(v_students) x
      where (x->>'already_exists')::boolean
    ),
    'to_create_count', (
      select count(*) from jsonb_array_elements(v_students) x
      where not (x->>'already_exists')::boolean
    ),
    'students', v_students
  );
end;
$$;
revoke all on function public.preview_monthly_course_obligations(uuid,date,text,numeric) from public, anon;
grant execute on function public.preview_monthly_course_obligations(uuid,date,text,numeric) to authenticated;
create or replace function public.create_monthly_course_obligations(
  p_course_id uuid,
  p_due_month date,
  p_fee_category text default 'institute',
  p_external_share numeric default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_month date;
  v_course_name text;
  v_amount numeric;
  v_external numeric;
  v_created int := 0;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if p_course_id is null or p_due_month is null then raise exception 'INVALID_MONTHLY_FEE_REQUEST'; end if;

  v_month := date_trunc('month', p_due_month)::date;

  select c.name, c.monthly_fee
    into v_course_name, v_amount
  from public.courses c
  where c.id = p_course_id and c.status = 'active'
  for share;

  if v_course_name is null then raise exception 'COURSE_NOT_FOUND_OR_INACTIVE'; end if;
  if v_amount is null or v_amount <= 0 or v_amount <> trunc(v_amount) then
    raise exception 'COURSE_MONTHLY_FEE_REQUIRED';
  end if;

  v_external := p_external_share;
  if p_fee_category is null or p_fee_category not in ('institute', 'external', 'shared')
     or v_external is null or v_external < 0 or v_external <> trunc(v_external)
     or (p_fee_category = 'institute' and v_external <> 0)
     or (p_fee_category = 'external' and v_external <> v_amount)
     or (p_fee_category = 'shared' and (v_external <= 0 or v_external >= v_amount)) then
    raise exception 'INVALID_MONTHLY_FEE_RECIPIENT_SPLIT';
  end if;

  if p_fee_category = 'shared' and exists (
    select 1 from public.enrollments e
    join public.students s on s.id = e.student_id
    where e.course_id = p_course_id and e.billing_model = 'monthly'
      and coalesce(s.status, 'active') = 'active'
      and coalesce(e.monthly_fee_override, v_amount) <= v_external
      and coalesce(e.created_at, now()) < (v_month + interval '1 month')
  ) then raise exception 'INVALID_MONTHLY_FEE_RECIPIENT_SPLIT'; end if;

  insert into public.fee_obligations (
    student_id, enrollment_id, course_id, course_name, description,
    amount, fee_category, external_share, fee_kind, due_month
  )
  select
    s.id, e.id, c.id, c.name,
    'رسوم الدورة الشهرية — ' || to_char(v_month, 'YYYY-MM'),
    coalesce(e.monthly_fee_override, v_amount), p_fee_category,
    case when p_fee_category = 'external' then coalesce(e.monthly_fee_override, v_amount) else v_external end,
    'monthly_course', v_month
  from public.enrollments e
  join public.students s on s.id = e.student_id
  join public.courses c on c.id = e.course_id
  where e.course_id = p_course_id
    and e.billing_model = 'monthly'
    and c.status = 'active'
    and coalesce(s.status, 'active') = 'active'
    and e.created_at < (v_month + interval '1 month')
  on conflict (enrollment_id, due_month) where fee_kind = 'monthly_course' do nothing;

  get diagnostics v_created = row_count;

  return jsonb_build_object(
    'course_id', p_course_id,
    'due_month', v_month,
    'created', v_created,
    'fee_category', p_fee_category,
    'external_share', v_external
  );
end;
$$;
revoke all on function public.create_monthly_course_obligations(uuid,date,text,numeric) from public, anon;
grant execute on function public.create_monthly_course_obligations(uuid,date,text,numeric) to authenticated;
CREATE OR REPLACE FUNCTION public.restore_center_data(payload jsonb, force boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  v_external_sum numeric;
  v_receipt_external numeric;
  v_active_cancelled boolean;
  v_fee_json jsonb;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object'
     or jsonb_typeof(payload->'students') is distinct from 'array'
     or jsonb_typeof(payload->'courses') is distinct from 'array'
     or jsonb_typeof(payload->'enrollments') is distinct from 'array'
     or jsonb_typeof(payload->'fee_obligations') is distinct from 'array'
     or jsonb_typeof(payload->'receipt_vouchers') is distinct from 'array'
     or jsonb_typeof(payload->'receipt_allocations') is distinct from 'array'
     or jsonb_typeof(payload->'payment_vouchers') is distinct from 'array' then
    raise exception 'INVALID_BACKUP_FORMAT';
  end if;

  courses := payload->'courses';
  enrollments := payload->'enrollments';
  fee_obligations := payload->'fee_obligations';
  receipt_allocations := payload->'receipt_allocations';

  s_in := jsonb_array_length(payload->'students');
  r_in := jsonb_array_length(payload->'receipt_vouchers');
  p_in := jsonb_array_length(payload->'payment_vouchers');
  if s_in > 200000 or r_in > 1000000 or p_in > 1000000 then raise exception 'RESTORE_TOO_LARGE'; end if;

  select count(*) into s_cur from public.students;
  select count(*) into r_cur from public.receipt_vouchers;
  select count(*) into p_cur from public.payment_vouchers;
  if (s_in + r_in + p_in) = 0 and (s_cur + r_cur + p_cur) > 0 then raise exception 'RESTORE_REFUSED_EMPTY'; end if;

  -- R2.2 corrective guard: a non-forced restore must not shrink any
  -- independently restorable section. Parent-count checks alone are unsafe
  -- because child rows can disappear while students/receipts/payments stay
  -- unchanged or increase.
  if not force and (
    s_in < s_cur
    or jsonb_array_length(courses) < (select count(*) from public.courses)
    or jsonb_array_length(enrollments) < (select count(*) from public.enrollments)
    or jsonb_array_length(fee_obligations) < (select count(*) from public.fee_obligations)
    or r_in < r_cur
    or jsonb_array_length(receipt_allocations) < (select count(*) from public.receipt_allocations)
    or p_in < p_cur
  ) then
    raise exception 'RESTORE_SHRINKS';
  end if;

  -- Validate all referenced identities before the destructive phase.
  for e in select value from jsonb_array_elements(enrollments) loop
    v_student := nullif(e->>'student_id', '')::uuid;
    v_course := nullif(e->>'course_id', '')::uuid;
    if v_student is null or v_course is null or nullif(e->>'course_name', '') is null or (e->>'course_value')::numeric is null then
      raise exception 'INVALID_ENROLLMENT_BACKUP';
    end if;
    if coalesce(e->>'billing_model', 'legacy_total') not in ('legacy_total', 'monthly')
       or (coalesce(e->>'billing_model', 'legacy_total') = 'monthly' and (e->>'course_value')::numeric <> 0) then
      raise exception 'INVALID_ENROLLMENT_BILLING_MODEL_BACKUP';
    end if;
    if nullif(e->>'monthly_fee_override', '') is not null and (
      coalesce(e->>'billing_model', 'legacy_total') <> 'monthly'
      or (e->>'monthly_fee_override')::numeric <= 0
      or (e->>'monthly_fee_override')::numeric <> trunc((e->>'monthly_fee_override')::numeric)
      or (e->>'monthly_fee_override')::numeric > 100000000
      or nullif(btrim(coalesce(e->>'monthly_fee_override_reason', '')), '') is null
    ) then raise exception 'INVALID_MONTHLY_FEE_OVERRIDE_BACKUP'; end if;
    select c.name, c.base_fee into v_course_name, v_course_value
    from jsonb_array_elements(courses) c0
    cross join lateral (select c0->>'name' as name, (c0->>'base_fee')::numeric as base_fee) c
    where (c0->>'id')::uuid = v_course;
    if v_course_name is null then raise exception 'RESTORE_ENROLLMENT_COURSE_NOT_FOUND'; end if;
    -- ADR-0078: course_value is the owner-adjustable final registration price.
    -- Restore must preserve a legitimate post-creation fee adjustment; only the
    -- immutable course-name identity is checked against the restored course.
    if e->>'course_name' is distinct from v_course_name then
      raise exception 'ENROLLMENT_FINANCIAL_SNAPSHOT_MISMATCH';
    end if;
  end loop;

  for e in select value from jsonb_array_elements(fee_obligations) loop
    v_student := nullif(e->>'student_id', '')::uuid;
    v_course := nullif(e->>'course_id', '')::uuid;
    v_enrollment := nullif(e->>'enrollment_id', '')::uuid;
    if v_student is null or (e->>'amount')::numeric is null then
      raise exception 'INVALID_FEE_BACKUP';
    end if;

    -- Fee obligations are student-anchored; course/enrollment context is optional.
    if v_enrollment is not null then
      if not exists (
        select 1 from jsonb_array_elements(enrollments) x
        where (x->>'id')::uuid = v_enrollment
          and (x->>'student_id')::uuid = v_student
          and (v_course is null or (x->>'course_id')::uuid = v_course)
          and ((e->>'course_name') is null or x->>'course_name' = e->>'course_name')
      ) then
        raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH';
      end if;
    elsif v_course is not null then
      if not exists (
        select 1 from jsonb_array_elements(courses) x
        where (x->>'id')::uuid = v_course
          and ((e->>'course_name') is null or x->>'name' = e->>'course_name')
      ) then
        raise exception 'FEE_OBLIGATION_COURSE_MISMATCH';
      end if;
    elsif nullif(e->>'course_name', '') is not null then
      raise exception 'INVALID_FEE_BACKUP';
    end if;

    v_fee_total := (e->>'amount')::numeric;
    v_fee_external := coalesce((e->>'external_share')::numeric, 0);
    if v_fee_total <= 0 or v_fee_external < 0 or v_fee_external > v_fee_total then raise exception 'INVALID_FEE_BACKUP'; end if;
    if e->>'fee_category' not in ('institute','external','shared') then raise exception 'INVALID_FEE_CATEGORY'; end if;
    if (e->>'fee_category') = 'institute' and v_fee_external <> 0 then raise exception 'INVALID_FEE_EXTERNAL_SHARE'; end if;
    if (e->>'fee_category') = 'external' and v_fee_external <> v_fee_total then raise exception 'INVALID_FEE_EXTERNAL_SHARE'; end if;
    if (e->>'fee_category') = 'shared' and (v_fee_external <= 0 or v_fee_external >= v_fee_total) then raise exception 'INVALID_FEE_EXTERNAL_SHARE'; end if;
    if coalesce(e->>'fee_kind', 'additional') not in ('additional', 'monthly_course') then raise exception 'INVALID_FEE_KIND'; end if;
    if coalesce(e->>'fee_kind', 'additional') = 'monthly_course' then
      if nullif(e->>'due_month', '') is null
         or (e->>'due_month')::date <> date_trunc('month', (e->>'due_month')::date)::date
         or v_enrollment is null or v_course is null then
        raise exception 'INVALID_MONTHLY_COURSE_FEE_BACKUP';
      end if;
    elsif nullif(e->>'due_month', '') is not null then
      raise exception 'INVALID_ADDITIONAL_FEE_DUE_MONTH';
    end if;
  end loop;

  -- Every allocation must point to exactly one valid target belonging to the
  -- receipt's student, and every receipt's allocations must sum to its amount.
  for e in select value from jsonb_array_elements(receipt_allocations) loop
    v_receipt := nullif(e->>'receipt_voucher_id', '')::uuid;
    v_student := null;
    v_enrollment := nullif(e->>'enrollment_id', '')::uuid;
    v_fee := nullif(e->>'fee_obligation_id', '')::uuid;
    v_amount := (e->>'amount')::numeric;
    v_fee_external := coalesce((e->>'external_share')::numeric, 0);
    if v_receipt is null or v_amount is null or v_amount <= 0 or v_fee_external < 0 or v_fee_external > v_amount then raise exception 'INVALID_RECEIPT_ALLOCATION_BACKUP'; end if;
    if e->>'allocation_type' not in ('course','fee') then raise exception 'INVALID_RECEIPT_ALLOCATION_BACKUP'; end if;
    if e->>'allocation_type' = 'course' then
      if v_enrollment is null or v_fee is not null or v_fee_external <> 0 then raise exception 'INVALID_COURSE_ALLOCATION_BACKUP'; end if;
      select (x->>'student_id')::uuid into v_student from jsonb_array_elements(enrollments) x where (x->>'id')::uuid = v_enrollment;
      if v_student is null then raise exception 'ALLOCATION_ENROLLMENT_NOT_FOUND'; end if;
    else
      if v_fee is null or v_enrollment is not null then raise exception 'INVALID_FEE_ALLOCATION_BACKUP'; end if;
      if not exists (select 1 from jsonb_array_elements(fee_obligations) x where (x->>'id')::uuid = v_fee and v_fee_external <= coalesce((x->>'external_share')::numeric, 0)) then raise exception 'FEE_ALLOCATION_EXTERNAL_SHARE_MISMATCH'; end if;
      select (x->>'student_id')::uuid into v_student from jsonb_array_elements(fee_obligations) x where (x->>'id')::uuid = v_fee;
      if v_student is null then raise exception 'ALLOCATION_FEE_NOT_FOUND'; end if;
    end if;
    if not exists (select 1 from jsonb_array_elements(payload->'receipt_vouchers') rv where (rv->>'id')::uuid = v_receipt and (rv->>'student_id')::uuid = v_student) then
      raise exception 'RECEIPT_ALLOCATION_STUDENT_MISMATCH';
    end if;
  end loop;

  -- Validate fee allocations set-wise. Aggregate allocations once per fee
  -- instead of joining the complete allocation array once per fee obligation.
  for v_fee_json, v_sum, v_external_sum, v_active_cancelled in
    select f.value,
           coalesce(q.active_total, 0),
           coalesce(q.active_external, 0),
           (f.value->>'cancelled_at' is not null and coalesce(q.active_count, 0) > 0)
    from jsonb_array_elements(fee_obligations) f
    left join (
      select
        (a.value->>'fee_obligation_id')::uuid as fee_id,
        sum((a.value->>'amount')::numeric)
          filter (where rv.value->>'cancelled_at' is null) as active_total,
        sum(coalesce((a.value->>'external_share')::numeric, 0))
          filter (where rv.value->>'cancelled_at' is null) as active_external,
        count(*) filter (where rv.value->>'cancelled_at' is null) as active_count
      from jsonb_array_elements(receipt_allocations) a
      join jsonb_array_elements(payload->'receipt_vouchers') rv
        on (rv.value->>'id')::uuid = (a.value->>'receipt_voucher_id')::uuid
      where (a.value->>'fee_obligation_id') is not null
      group by (a.value->>'fee_obligation_id')::uuid
    ) q on q.fee_id = (f.value->>'id')::uuid
    where coalesce(q.active_count, 0) > 0
       or (f.value->>'cancelled_at' is not null and coalesce(q.active_count, 0) > 0)
  loop
    if v_active_cancelled then
      raise exception 'ACTIVE_ALLOCATION_TO_CANCELLED_FEE';
    end if;

    if v_sum > (v_fee_json->>'amount')::numeric
       or v_external_sum > coalesce((v_fee_json->>'external_share')::numeric, 0) then
      raise exception 'FEE_ALLOCATION_TOTAL_MISMATCH';
    end if;
  end loop;

  -- Course allocations must not exceed the enrollment's course value.
  -- Aggregate active course allocations once per enrollment; cancelled receipts
  -- remain historical and do not count toward the active ceiling.
  for e, v_sum in
    select e.value, coalesce(q.active_total, 0)
    from jsonb_array_elements(enrollments) e
    left join (
      select
        (a.value->>'enrollment_id')::uuid as enrollment_id,
        sum((a.value->>'amount')::numeric) as active_total
      from jsonb_array_elements(receipt_allocations) a
      join jsonb_array_elements(payload->'receipt_vouchers') rv
        on (rv.value->>'id')::uuid = (a.value->>'receipt_voucher_id')::uuid
      where a.value->>'allocation_type' = 'course'
        and (a.value->>'enrollment_id') is not null
        and rv.value->>'cancelled_at' is null
      group by (a.value->>'enrollment_id')::uuid
    ) q on q.enrollment_id = (e.value->>'id')::uuid
    where coalesce(q.active_total, 0) > (e.value->>'course_value')::numeric
  loop
    raise exception 'COURSE_ALLOCATION_TOTAL_MISMATCH';
  end loop;

  for e in select value from jsonb_array_elements(payload->'receipt_vouchers') loop
    v_receipt := (e->>'id')::uuid;
    v_amount := (e->>'amount_received')::numeric;
    v_receipt_external := coalesce((e->>'external_share')::numeric, 0);
    if v_amount is null or v_amount < 0 or v_receipt_external < 0 or v_receipt_external > v_amount then
      raise exception 'INVALID_RECEIPT_BACKUP';
    end if;
    select coalesce(sum((a->>'amount')::numeric), 0),
           coalesce(sum(coalesce((a->>'external_share')::numeric, 0)), 0),
           count(*)
      into v_sum, v_external_sum, v_allocation_count
    from jsonb_array_elements(receipt_allocations) a
    where (a->>'receipt_voucher_id')::uuid = v_receipt;
    if v_allocation_count = 0 then
      -- Legacy receipts are retained without invented allocations; their
      -- receipt-level external split must therefore be zero.
      if coalesce((e->>'allocation_mode')::boolean, false) then raise exception 'ALLOCATION_REQUIRED_FOR_MODERN_RECEIPT'; end if;
      if v_receipt_external <> 0 then raise exception 'RESTORE_RECEIPT_EXTERNAL_SHARE_MISMATCH'; end if;
    elsif v_sum <> v_amount or v_external_sum <> v_receipt_external then
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

  insert into public.courses (id, name, base_fee, monthly_fee, start_date, end_date, status, notes, created_at, updated_at)
  select coalesce((src->>'id')::uuid, gen_random_uuid()), src->>'name', nullif(src->>'base_fee', '')::numeric, nullif(src->>'monthly_fee', '')::numeric, nullif(src->>'start_date', '')::date, nullif(src->>'end_date', '')::date, coalesce(nullif(src->>'status', ''), 'active'), coalesce(src->>'notes', ''), coalesce((src->>'created_at')::timestamptz, timezone('utc', now())), coalesce((src->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(courses) src;
  get diagnostics c_out = row_count;

  insert into public.students (id, name, id_number, phone, notes, status, completed_at, completion_reason, archived_at, archive_reason, created_at, updated_at)
  select (src->>'id')::uuid, src->>'name', src->>'id_number', src->>'phone', src->>'notes',
         coalesce(nullif(src->>'status', ''), 'active'),
         (src->>'completed_at')::timestamptz,
         src->>'completion_reason',
         (src->>'archived_at')::timestamptz,
         src->>'archive_reason',
         coalesce((src->>'created_at')::timestamptz, timezone('utc', now())),
         coalesce((src->>'updated_at')::timestamptz, timezone('utc', now()))
  from jsonb_array_elements(payload->'students') src;
  get diagnostics s_out = row_count;

  insert into public.enrollments (id, student_id, course_id, course_name, course_value, billing_model, monthly_fee_override, monthly_fee_override_reason, created_at, updated_at)
  select coalesce((src->>'id')::uuid, gen_random_uuid()), (src->>'student_id')::uuid, (src->>'course_id')::uuid, src->>'course_name', (src->>'course_value')::numeric, coalesce(nullif(src->>'billing_model', ''), 'legacy_total'), nullif(src->>'monthly_fee_override', '')::numeric, nullif(btrim(coalesce(src->>'monthly_fee_override_reason', '')), ''), coalesce((src->>'created_at')::timestamptz, timezone('utc', now())), coalesce((src->>'updated_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(enrollments) src;
  get diagnostics e_out = row_count;

  insert into public.fee_obligations (id, student_id, enrollment_id, course_id, course_name, description, notes, amount, fee_category, external_share, cancelled_at, cancel_reason, created_at, fee_kind, due_month)
  select coalesce((src->>'id')::uuid, gen_random_uuid()), (src->>'student_id')::uuid, (src->>'enrollment_id')::uuid, (src->>'course_id')::uuid, src->>'course_name', src->>'description', src->>'notes', (src->>'amount')::numeric, src->>'fee_category', coalesce((src->>'external_share')::numeric, 0), (src->>'cancelled_at')::timestamptz, src->>'cancel_reason', coalesce((src->>'created_at')::timestamptz, timezone('utc', now())), coalesce(nullif(src->>'fee_kind', ''), 'additional'), nullif(src->>'due_month', '')::date from jsonb_array_elements(fee_obligations) src;
  get diagnostics f_out = row_count;

  insert into public.receipt_vouchers (id, voucher_number, voucher_date, student_id, student_name_snapshot, course_name, course_value, amount_received, payer_name, notes, cancelled_at, cancel_reason, created_at, fee_category, external_share, allocation_mode, idempotency_key, idempotency_payload_hash)
  overriding system value
  select (src->>'id')::uuid, (src->>'voucher_number')::bigint, (src->>'voucher_date')::date, (src->>'student_id')::uuid, src->>'student_name_snapshot', src->>'course_name', (src->>'course_value')::numeric, (src->>'amount_received')::numeric, coalesce(src->>'payer_name', ''), coalesce(src->>'notes', ''), (src->>'cancelled_at')::timestamptz, src->>'cancel_reason', coalesce((src->>'created_at')::timestamptz, timezone('utc', now())), nullif(src->>'fee_category', ''), coalesce((src->>'external_share')::numeric, 0), coalesce((src->>'allocation_mode')::boolean, false), nullif(src->>'idempotency_key', '')::uuid, nullif(src->>'idempotency_payload_hash', '') from jsonb_array_elements(payload->'receipt_vouchers') src;
  get diagnostics r_out = row_count;

  insert into public.receipt_allocations (id, receipt_voucher_id, allocation_type, enrollment_id, fee_obligation_id, amount, external_share, created_at)
  select coalesce((src->>'id')::uuid, gen_random_uuid()), (src->>'receipt_voucher_id')::uuid, src->>'allocation_type', nullif(src->>'enrollment_id', '')::uuid, nullif(src->>'fee_obligation_id', '')::uuid, (src->>'amount')::numeric, coalesce((src->>'external_share')::numeric, 0), coalesce((src->>'created_at')::timestamptz, timezone('utc', now())) from jsonb_array_elements(receipt_allocations) src;
  get diagnostics a_out = row_count;

  -- Preserve payment idempotency identity across backup/restore.
  insert into public.payment_vouchers (id, voucher_number, voucher_date, expense_type, amount, notes, cancelled_at, cancel_reason, created_at, idempotency_key)
  overriding system value
  select (src->>'id')::uuid, (src->>'voucher_number')::bigint, (src->>'voucher_date')::date, src->>'expense_type', (src->>'amount')::numeric, coalesce(src->>'notes', ''), (src->>'cancelled_at')::timestamptz, src->>'cancel_reason', coalesce((src->>'created_at')::timestamptz, timezone('utc', now())), nullif(src->>'idempotency_key', '')::uuid from jsonb_array_elements(payload->'payment_vouchers') src;
  get diagnostics p_out = row_count;

  -- Rebuild missing fingerprints for restored idempotent receipts when the
  -- backup predates the fingerprint column.
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
$function$;
commit;
