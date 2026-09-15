begin;

-- Direct fee fields must never bypass the obligation/allocation path. This keeps the
-- approved model strict: creating a fee is an obligation, and collecting it requires
-- a receipt_allocations row created atomically by post_receipt_with_allocations().
alter table public.receipt_vouchers
  add constraint receipt_vouchers_fee_requires_allocation_mode
  check (fee_category is null or allocation_mode = true);

commit;
