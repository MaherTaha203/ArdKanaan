-- Preventive FK index for financial ledger reversal lookups and future cancellation/reversal growth.
-- Production applied as migration 20260929101917 / add_financial_ledger_reversal_of_index.
create index if not exists financial_movement_ledger_reversal_of_idx
  on public.financial_movement_ledger (reversal_of);
