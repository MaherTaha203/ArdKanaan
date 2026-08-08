-- Sprint 3 — Financial Report (derived presentation only)
-- A unified, read-only movements feed derived from the two sources of truth:
--   receipt_vouchers (money in) and payment_vouchers (money out).
-- It creates no new financial fact, stores no balance, and owns no truth.
-- Totals (receipts, payments, net) are derived by the presentation layer from
-- these rows; nothing here is persisted as an independent balance.

create or replace view public.financial_movements as
select
  rv.id,
  'receipt'::text as movement_type,
  rv.voucher_number,
  rv.voucher_date,
  rv.amount_received as amount,
  rv.student_name_snapshot as party_name,
  rv.course_name as context,
  rv.created_at
from public.receipt_vouchers rv
union all
select
  pv.id,
  'payment'::text as movement_type,
  pv.voucher_number,
  pv.voucher_date,
  pv.amount as amount,
  null::text as party_name,
  pv.expense_type as context,
  pv.created_at
from public.payment_vouchers pv;
