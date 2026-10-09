begin;

-- ADR-0080 follow-up: legacy total-fee enrollments must not receive monthly
-- obligations merely because a monthly price is later configured on their course.
-- Only enrollments explicitly created under the monthly billing model are eligible.

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
        'amount', v_amount,
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

revoke all on function public.preview_monthly_course_obligations(uuid, date, text, numeric) from public, anon;
grant execute on function public.preview_monthly_course_obligations(uuid, date, text, numeric) to authenticated;

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

  insert into public.fee_obligations (
    student_id, enrollment_id, course_id, course_name, description,
    amount, fee_category, external_share, fee_kind, due_month
  )
  select
    s.id, e.id, c.id, c.name,
    'رسوم الدورة الشهرية — ' || to_char(v_month, 'YYYY-MM'),
    v_amount, p_fee_category, v_external, 'monthly_course', v_month
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

revoke all on function public.create_monthly_course_obligations(uuid, date, text, numeric) from public, anon;
grant execute on function public.create_monthly_course_obligations(uuid, date, text, numeric) to authenticated;

commit;
