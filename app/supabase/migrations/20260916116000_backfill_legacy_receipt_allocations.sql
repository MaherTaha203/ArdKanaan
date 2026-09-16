begin;

-- Legacy receipts predate receipt_allocations. Preserve every voucher, but bind
-- it to its unique enrollment where the historical identity is unambiguous.
-- Receipts that cannot be matched safely remain in the explicit legacy branch
-- of student_statement_lines rather than being guessed or deleted.
with candidates as (
  select
    rv.id as receipt_id,
    rv.amount_received,
    e.id as enrollment_id,
    e.course_value,
    count(*) over (partition by rv.id) as enrollment_matches,
    sum(rv.amount_received) over (
      partition by e.id
      order by rv.voucher_date, rv.voucher_number, rv.created_at, rv.id
      rows between unbounded preceding and current row
    ) as cumulative_paid
  from public.receipt_vouchers rv
  join public.enrollments e
    on e.student_id = rv.student_id
   and e.course_name = rv.course_name
  where not exists (
    select 1
    from public.receipt_allocations ra
    where ra.receipt_voucher_id = rv.id
  )
    and rv.fee_category is null
), safe_rows as (
  select *
  from candidates
  where enrollment_matches = 1
    and cumulative_paid <= course_value
)
insert into public.receipt_allocations
  (receipt_voucher_id, allocation_type, enrollment_id, fee_obligation_id, amount)
select receipt_id, 'course', enrollment_id, null, amount_received
from safe_rows
on conflict do nothing;

commit;
