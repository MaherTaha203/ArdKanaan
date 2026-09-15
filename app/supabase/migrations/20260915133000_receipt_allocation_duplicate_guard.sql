begin;

-- A single receipt must not allocate the same course enrollment or fee obligation
-- more than once. Use sentinel UUIDs because PostgreSQL UNIQUE indexes otherwise
-- treat NULL values as distinct and would allow duplicate targets.
create unique index if not exists receipt_allocations_receipt_target_unique
on public.receipt_allocations (
  receipt_voucher_id,
  allocation_type,
  coalesce(enrollment_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(fee_obligation_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

commit;
