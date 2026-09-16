begin;

-- The ledger is the immutable financial history. Source documents may be
-- cancelled, but ledger rows are never edited or deleted; a reversal row is
-- the only representation of cancellation.
create or replace function public.prevent_financial_ledger_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'FINANCIAL_LEDGER_APPEND_ONLY';
end;
$$;

revoke all on function public.prevent_financial_ledger_mutation() from public, anon, authenticated;

drop trigger if exists financial_movement_ledger_append_only on public.financial_movement_ledger;
create trigger financial_movement_ledger_append_only
before update or delete on public.financial_movement_ledger
for each row execute function public.prevent_financial_ledger_mutation();

commit;
