begin;

create or replace view public.student_financial_summary
with (security_invoker = true)
as
with active_receipts as (
  select rv.id, rv.student_id, rv.voucher_date, rv.amount_received, rv.course_name, rv.fee_category, rv.course_value, rv.allocation_mode
  from public.receipt_vouchers rv
  where rv.cancelled_at is null
),
allocated_course_paid as (
  select ra.enrollment_id, sum(ra.amount) as paid
  from public.receipt_allocations ra
  join active_receipts rv on rv.id = ra.receipt_voucher_id
  where ra.allocation_type = 'course'
  group by ra.enrollment_id
),
legacy_course_paid as (
  select rv.student_id, rv.course_name, sum(rv.amount_received) as paid
  from active_receipts rv
  where not rv.allocation_mode
    and rv.fee_category is null
    and not exists (
      select 1 from public.receipt_allocations ra
      where ra.receipt_voucher_id = rv.id
    )
  group by rv.student_id, rv.course_name
),
enrollment_rows as (
  select
    e.student_id,
    e.course_name,
    e.id as enrollment_id,
    greatest(0, e.course_value - coalesce(acp.paid, 0) - coalesce(lcp.paid, 0)) as remaining
  from public.enrollments e
  left join allocated_course_paid acp on acp.enrollment_id = e.id
  left join legacy_course_paid lcp
    on lcp.student_id = e.student_id
   and lcp.course_name = e.course_name
),
legacy_only_rows as (
  select
    lcp.student_id,
    lcp.course_name,
    null::uuid as enrollment_id,
    greatest(0, coalesce(rv.course_value, 0) - lcp.paid) as remaining
  from legacy_course_paid lcp
  left join public.enrollments e
    on e.student_id = lcp.student_id
   and e.course_name = lcp.course_name
  left join lateral (
    select rv.course_value
    from active_receipts rv
    where rv.student_id = lcp.student_id
      and rv.course_name = lcp.course_name
      and not rv.allocation_mode
      and rv.fee_category is null
      and not exists (
        select 1 from public.receipt_allocations ra
        where ra.receipt_voucher_id = rv.id
      )
    order by rv.voucher_date, rv.id
    limit 1
  ) rv on true
  where e.id is null
),
fee_paid as (
  select ra.fee_obligation_id, sum(ra.amount) as paid
  from public.receipt_allocations ra
  join active_receipts rv on rv.id = ra.receipt_voucher_id
  where ra.allocation_type = 'fee'
  group by ra.fee_obligation_id
),
fee_rows as (
  select
    f.student_id,
    greatest(0, f.amount - coalesce(fp.paid, 0)) as remaining
  from public.fee_obligations f
  left join fee_paid fp on fp.fee_obligation_id = f.id
  where f.cancelled_at is null
),
student_rows as (
  select
    s.id as student_id,
    coalesce(sum(ar.amount_received), 0)::numeric as paid,
    max(ar.voucher_date) as last_activity
  from public.students s
  left join active_receipts ar on ar.student_id = s.id
  group by s.id
),
course_rows as (
  select student_id, course_name, remaining from enrollment_rows
  union all
  select student_id, course_name, remaining from legacy_only_rows
),
course_summary as (
  select
    student_id,
    count(*)::int as courses,
    coalesce(sum(remaining), 0)::numeric as course_remaining,
    array_agg(distinct course_name order by course_name) as course_names
  from course_rows
  group by student_id
),
fee_summary as (
  select student_id, coalesce(sum(remaining), 0)::numeric as fee_remaining
  from fee_rows
  group by student_id
),
statement_line_counts as (
  select
    s.id as student_id,
    (
      select count(*)
      from public.receipt_allocations ra
      join active_receipts ar on ar.id = ra.receipt_voucher_id
      where ar.student_id = s.id
    )
    +
    (
      select count(*)
      from active_receipts ar
      where ar.student_id = s.id
        and not ar.allocation_mode
        and not exists (
          select 1 from public.receipt_allocations ra
          where ra.receipt_voucher_id = ar.id
        )
    ) as line_count
  from public.students s
)
select
  s.id as student_id,
  coalesce(sr.paid, 0)::numeric as paid,
  greatest(0, coalesce(cs.course_remaining, 0) + coalesce(fs.fee_remaining, 0))::numeric as remaining,
  coalesce(cs.courses, 0)::int as courses,
  sr.last_activity,
  coalesce(slc.line_count, 0)::bigint as line_count,
  coalesce(cs.course_names, array[]::text[]) as course_names
from public.students s
left join student_rows sr on sr.student_id = s.id
left join course_summary cs on cs.student_id = s.id
left join fee_summary fs on fs.student_id = s.id
left join statement_line_counts slc on slc.student_id = s.id;

revoke all on public.student_financial_summary from anon;
grant select on public.student_financial_summary to authenticated;

commit;