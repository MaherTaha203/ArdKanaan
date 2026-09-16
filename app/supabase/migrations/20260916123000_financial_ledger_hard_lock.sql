begin;

-- The ledger is append-only at the database boundary, not merely by RLS policy.
-- No application role may UPDATE or DELETE a ledger row. Cancellation is always
-- represented by a new reversal row.
create or replace function public.prevent_financial_ledger_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return case when tg_op = 'DELETE' then old else new end;
  end if;
  raise exception 'FINANCIAL_LEDGER_APPEND_ONLY';
end;
$$;

drop trigger if exists financial_movement_ledger_append_only on public.financial_movement_ledger;
create trigger financial_movement_ledger_append_only
before update or delete on public.financial_movement_ledger
for each row execute function public.prevent_financial_ledger_mutation();

revoke all on function public.prevent_financial_ledger_mutation() from public, anon, authenticated;

commit;
