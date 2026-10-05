begin;

-- Security hardening: financial_movements is an authenticated-only read model.
-- Restore the intended least-privilege Data API grant after production drift.
revoke all on table public.financial_movements from anon, authenticated;
grant select on table public.financial_movements to authenticated;

commit;
