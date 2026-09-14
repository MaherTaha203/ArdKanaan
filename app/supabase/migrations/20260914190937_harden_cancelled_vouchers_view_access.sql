-- The cancelled-vouchers read model is security-invoker and must not be exposed to anon.
-- Only the authenticated Owner-facing application can read it; writes are never part
-- of the application contract.
revoke all on table public.cancelled_vouchers from anon, authenticated;
grant select on table public.cancelled_vouchers to authenticated;
