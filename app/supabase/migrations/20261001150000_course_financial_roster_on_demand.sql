begin;

create or replace function public.get_course_financial_roster(p_course_id uuid)
returns table (
  enrollment_id uuid,
  student_id uuid,
  course_id uuid,
  course_name text,
  course_value numeric,
  paid numeric,
  remaining numeric
)
language sql
security invoker
set search_path = ''
as $$
  with allocated_course_paid as (
    select
      ra.enrollment_id,
      sum(ra.amount)::numeric as paid
    from public.receipt_allocations ra
    join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
    where rv.cancelled_at is null
      and ra.allocation_type = 'course'
    group by ra.enrollment_id
  ),
  legacy_course_paid as (
    select
      rv.student_id,
      rv.course_name,
      sum(rv.amount_received)::numeric as paid
    from public.receipt_vouchers rv
    where rv.cancelled_at is null
      and rv.allocation_mode = false
      and rv.fee_category is null
      and not exists (
        select 1
        from public.receipt_allocations ra
        where ra.receipt_voucher_id = rv.id
      )
    group by rv.student_id, rv.course_name
  )
  select
    e.id as enrollment_id,
    e.student_id,
    e.course_id,
    e.course_name,
    e.course_value,
    coalesce(acp.paid, 0) + coalesce(lcp.paid, 0) as paid,
    greatest(0, e.course_value - coalesce(acp.paid, 0) - coalesce(lcp.paid, 0)) as remaining
  from public.enrollments e
  left join allocated_course_paid acp on acp.enrollment_id = e.id
  left join legacy_course_paid lcp
    on lcp.student_id = e.student_id
   and lcp.course_name = e.course_name
  where e.course_id = p_course_id
  order by e.created_at, e.id;
$$;

revoke all on function public.get_course_financial_roster(uuid) from public, anon;
grant execute on function public.get_course_financial_roster(uuid) to authenticated;

commit;
