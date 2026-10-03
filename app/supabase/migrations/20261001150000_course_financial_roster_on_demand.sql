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
  with target_course as (
    select c.id, c.name
    from public.courses c
    where c.id = p_course_id
  ),
  target_enrollments as (
    select e.id, e.student_id, e.course_id, e.course_name, e.course_value
    from public.enrollments e
    cross join target_course c
    where e.course_id = c.id
       or (e.course_id is null and e.course_name = c.name)
  ),
  allocated_course_paid as (
    select
      ra.enrollment_id,
      sum(ra.amount)::numeric as paid
    from public.receipt_allocations ra
    join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
    join target_enrollments te on te.id = ra.enrollment_id
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
    join (
      select distinct student_id, course_name
      from target_enrollments
    ) te on te.student_id = rv.student_id
         and te.course_name = rv.course_name
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
    coalesce(e.course_id, p_course_id) as course_id,
    e.course_name,
    e.course_value,
    coalesce(acp.paid, 0) + coalesce(lcp.paid, 0) as paid,
    greatest(0, e.course_value - coalesce(acp.paid, 0) - coalesce(lcp.paid, 0)) as remaining
  from target_enrollments e
  left join allocated_course_paid acp on acp.enrollment_id = e.id
  left join legacy_course_paid lcp
    on lcp.student_id = e.student_id
   and lcp.course_name = e.course_name
  order by e.id;
$$;

revoke all on function public.get_course_financial_roster(uuid) from public, anon;
grant execute on function public.get_course_financial_roster(uuid) to authenticated;

commit;
