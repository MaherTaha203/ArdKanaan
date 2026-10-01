begin;
create or replace view public.student_statement_lines as
with allocated as (
  select
    ra.id, rv.voucher_number, rv.voucher_date, rv.student_id,
    rv.student_name_snapshot as student_name,
    case when ra.allocation_type='course' then en.course_name else fo.description end as course_name,
    case when ra.allocation_type='course' then en.course_value else fo.amount end as course_value,
    ra.amount as amount_received, rv.notes, rv.payer_name, rv.created_at,
    case
      when ra.allocation_type='course' then
        en.course_value - sum(ra.amount) over (
          partition by rv.student_id, ra.enrollment_id
          order by rv.voucher_date, rv.voucher_number, ra.created_at, ra.id
          rows between unbounded preceding and current row)
      else
        fo.amount - sum(ra.amount) over (
          partition by rv.student_id, ra.fee_obligation_id
          order by rv.voucher_date, rv.voucher_number, ra.created_at, ra.id
          rows between unbounded preceding and current row)
    end as remaining_balance,
    ra.allocation_type as entry_type, ra.fee_obligation_id, ra.enrollment_id
  from public.receipt_allocations ra
  join public.receipt_vouchers rv on rv.id=ra.receipt_voucher_id
  left join public.enrollments en on en.id=ra.enrollment_id
  left join public.fee_obligations fo on fo.id=ra.fee_obligation_id
  where rv.cancelled_at is null
),
legacy as (
  select
    rv.id,rv.voucher_number,rv.voucher_date,rv.student_id,
    rv.student_name_snapshot as student_name,rv.course_name,
    coalesce(en.course_value,rv.course_value) as course_value,
    rv.amount_received,rv.notes,rv.payer_name,rv.created_at,
    coalesce(en.course_value,rv.course_value)-sum(rv.amount_received) over (
      partition by rv.student_id,rv.course_name
      order by rv.voucher_date,rv.voucher_number
      rows between unbounded preceding and current row) as remaining_balance,
    'course'::text as entry_type,null::uuid as fee_obligation_id,en.id as enrollment_id
  from public.receipt_vouchers rv
  left join public.enrollments en on en.student_id=rv.student_id and en.course_name=rv.course_name
  where rv.cancelled_at is null
    and not exists (select 1 from public.receipt_allocations ra where ra.receipt_voucher_id=rv.id)
)
select * from allocated
union all
select * from legacy;
alter view public.student_statement_lines set (security_invoker=true);
commit;