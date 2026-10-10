begin;

-- Allow cancelled historical monthly obligations to remain immutable while a
-- replacement active obligation exists for the same enrollment/month.
drop index if exists public.fee_obligations_monthly_enrollment_month_unique;
create unique index fee_obligations_monthly_enrollment_month_unique
  on public.fee_obligations (enrollment_id, due_month)
  where fee_kind = 'monthly_course' and cancelled_at is null;

create or replace function public.update_monthly_enrollment_fee(p_enrollment_id uuid,p_amount numeric,p_reason text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_student_id uuid; v_course_id uuid; v_course_name text; v_old_amount numeric;
  v_old_override numeric; v_reason text := btrim(coalesce(p_reason, '')); v_audit_id uuid;
  v_fee public.fee_obligations%rowtype;
  v_paid numeric;
  v_new_external_share numeric;
  v_repriced integer := 0;
  v_preserved integer := 0;
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

  -- Shared fees cannot be repriced below the external party's fixed share.
  if exists (
    select 1
    from public.fee_obligations f
    where f.enrollment_id = p_enrollment_id
      and f.fee_kind = 'monthly_course'
      and f.cancelled_at is null
      and f.fee_category = 'shared'
      and p_amount <= f.external_share
      and not exists (
        select 1
        from public.receipt_allocations ra
        join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
        where ra.fee_obligation_id = f.id and rv.cancelled_at is null
      )
  ) then raise exception 'INVALID_MONTHLY_FEE_RECIPIENT_SPLIT'; end if;

  if p_amount is distinct from v_old_amount or v_old_override is null then
    perform set_config('app.monthly_enrollment_fee_editing','on',true);
    update public.enrollments set monthly_fee_override=p_amount, monthly_fee_override_reason=v_reason where id=p_enrollment_id;
    perform set_config('app.monthly_enrollment_fee_editing','off',true);
  end if;

  -- Reprice only open obligations with no live allocations. Their prior rows remain
  -- in the database as cancelled audit history; receipts, allocations and ledger rows
  -- are never moved or rewritten. Partially/fully paid obligations remain untouched.
  for v_fee in
    select f.*
    from public.fee_obligations f
    where f.enrollment_id = p_enrollment_id
      and f.fee_kind = 'monthly_course'
      and f.cancelled_at is null
    order by f.due_month
    for update
  loop
    select coalesce(sum(ra.amount), 0)
      into v_paid
    from public.receipt_allocations ra
    join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
    where ra.fee_obligation_id = v_fee.id
      and rv.cancelled_at is null;

    if v_paid = 0 and v_fee.amount is distinct from p_amount then
      v_new_external_share := case
        when v_fee.fee_category = 'external' then p_amount
        else v_fee.external_share
      end;
      update public.fee_obligations
      set cancelled_at = now(),
          cancel_reason = 'استبدال بسبب تعديل الاشتراك الشهري: ' || v_reason
      where id = v_fee.id;

      insert into public.fee_obligations (
        student_id, enrollment_id, course_id, course_name, description, notes,
        amount, fee_category, external_share, fee_kind, due_month
      ) values (
        v_fee.student_id, v_fee.enrollment_id, v_fee.course_id, v_fee.course_name,
        v_fee.description, v_fee.notes, p_amount, v_fee.fee_category,
        v_new_external_share, 'monthly_course', v_fee.due_month
      );
      v_repriced := v_repriced + 1;
    elsif v_paid > 0 and v_fee.amount is distinct from p_amount then
      v_preserved := v_preserved + 1;
    end if;
  end loop;

  if p_amount is distinct from v_old_amount or v_old_override is null or v_repriced > 0 then
    v_audit_id := public.record_activity_event('enrollment','monthly_fee_adjustment','تعديل الاشتراك الشهري للطالب',v_reason,
      jsonb_build_object('enrollment_id',p_enrollment_id,'student_id',v_student_id,'course_id',v_course_id,
        'course_name',v_course_name,'old_amount',v_old_amount,'new_amount',p_amount,
        'repriced_unpaid_obligations',v_repriced,'preserved_obligations_with_payments',v_preserved));
  end if;
  return jsonb_build_object('enrollment_id',p_enrollment_id,'student_id',v_student_id,'course_id',v_course_id,
    'monthly_fee',p_amount,'changed',true,'audit_id',v_audit_id,
    'repriced_unpaid_obligations',v_repriced,'preserved_obligations_with_payments',v_preserved,
    'applies_to','unpaid_and_future_monthly_obligations');
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
            and fo.cancelled_at is null
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
  on conflict (enrollment_id, due_month) where fee_kind = 'monthly_course' and cancelled_at is null do nothing;

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

commit;
