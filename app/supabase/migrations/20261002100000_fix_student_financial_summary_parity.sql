begin;

create or replace view public.student_financial_summary
with (security_invoker = true)
as
with enrollment_counts as (
  select
    e.student_id,
    e.course_name,
    count(*)::int as enrollment_count
  from public.enrollments e
  group by e.student_id, e.course_name
),
course_lines as (
  select
    l.id,
    l.student_id,
    l.course_name,
    l.voucher_date,
    l.voucher_number,
    l.amount_received,
    l.remaining_balance,
    l.course_value,
    case
      when l.enrollment_id is not null then l.enrollment_id
      when coalesce(ec.enrollment_count, 0) = 1 then en_by_name.id
      else null
    end as resolved_enrollment_id,
    case
      when l.enrollment_id is not null then 'enrollment:' || l.enrollment_id::text
      when coalesce(ec.enrollment_count, 0) = 1 then 'enrollment:' || en_by_name.id::text
      else 'legacy:' || l.course_name
    end as bucket_key,
    case
      when l.enrollment_id is not null then en_by_id.course_name
      when coalesce(ec.enrollment_count, 0) = 1 then en_by_name.course_name
      else l.course_name
    end as resolved_course_name
  from public.student_statement_lines l
  left join public.enrollments en_by_id on en_by_id.id = l.enrollment_id
  left join enrollment_counts ec
    on ec.student_id = l.student_id
   and ec.course_name = l.course_name
  left join public.enrollments en_by_name
    on en_by_name.student_id = l.student_id
   and en_by_name.course_name = l.course_name
   and ec.enrollment_count = 1
  where coalesce(l.entry_type, 'course') = 'course'
),
course_paid as (
  select
    student_id,
    bucket_key,
    sum(amount_received)::numeric as paid
  from course_lines
  group by student_id, bucket_key
),
course_latest as (
  select distinct on (student_id, bucket_key)
    student_id,
    bucket_key,
    resolved_course_name,
    resolved_enrollment_id,
    remaining_balance
  from course_lines
  order by student_id, bucket_key, voucher_date desc, voucher_number desc, id desc
),
course_rows_with_lines as (
  select
    latest.student_id,
    latest.bucket_key,
    latest.resolved_course_name,
    latest.resolved_enrollment_id,
    paid.paid,
    greatest(0, latest.remaining_balance)::numeric as remaining
  from course_latest latest
  join course_paid paid
    on paid.student_id = latest.student_id
   and paid.bucket_key = latest.bucket_key
),
course_rows_without_lines as (
  select
    e.student_id,
    'enrollment:' || e.id::text as bucket_key,
    e.course_name as resolved_course_name,
    e.id as resolved_enrollment_id,
    0::numeric as paid,
    e.course_value::numeric as remaining
  from public.enrollments e
  where not exists (
    select 1
    from course_lines l
    where l.resolved_enrollment_id = e.id
  )
),
course_rows as (
  select * from course_rows_with_lines
  union all
  select * from course_rows_without_lines
),
course_summary as (
  select
    student_id,
    count(*)::int as courses,
    coalesce(sum(remaining), 0)::numeric as course_remaining,
    coalesce(
      array_agg(distinct resolved_course_name order by resolved_course_name)
        filter (where resolved_course_name is not null),
      array[]::text[]
    ) as course_names
  from course_rows
  group by student_id
),
fee_paid as (
  select
    l.student_id,
    l.fee_obligation_id,
    sum(l.amount_received)::numeric as paid
  from public.student_statement_lines l
  where l.entry_type = 'fee'
    and l.fee_obligation_id is not null
  group by l.student_id, l.fee_obligation_id
),
fee_summary as (
  select
    f.student_id,
    coalesce(
      sum(greatest(0, f.amount - coalesce(fp.paid, 0))),
      0
    )::numeric as fee_remaining
  from public.fee_obligations f
  left join fee_paid fp on fp.fee_obligation_id = f.id
  where f.cancelled_at is null
  group by f.student_id
),
student_activity as (
  select
    l.student_id,
    coalesce(sum(l.amount_received), 0)::numeric as paid,
    max(l.voucher_date) as last_activity,
    count(l.id)::bigint as line_count
  from public.student_statement_lines l
  group by l.student_id
)
select
  s.id as student_id,
  coalesce(sa.paid, 0)::numeric as paid,
  greatest(
    0,
    coalesce(cs.course_remaining, 0) + coalesce(fs.fee_remaining, 0)
  )::numeric as remaining,
  coalesce(cs.courses, 0)::int as courses,
  sa.last_activity,
  coalesce(sa.line_count, 0)::bigint as line_count,
  coalesce(cs.course_names, array[]::text[]) as course_names
from public.students s
left join student_activity sa on sa.student_id = s.id
left join course_summary cs on cs.student_id = s.id
left join fee_summary fs on fs.student_id = s.id;

revoke all on public.student_financial_summary from anon;
grant select on public.student_financial_summary to authenticated;

commit;
