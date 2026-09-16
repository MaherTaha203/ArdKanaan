begin;

-- Restore is a controlled owner-only operation. During that transaction the
-- source documents are replaced, so their derived ledger rows must be replaced
-- with them. Normal UPDATE/DELETE operations remain forbidden.
create or replace function public.prevent_financial_ledger_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return coalesce(new, old);
  end if;
  raise exception 'FINANCIAL_LEDGER_APPEND_ONLY';
end;
$$;

create or replace function public.purge_receipt_ledger_on_restore()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    delete from public.financial_movement_ledger
    where source_type = 'receipt' and source_id = old.id;
  end if;
  return old;
end;
$$;

create or replace function public.purge_payment_ledger_on_restore()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    delete from public.financial_movement_ledger
    where source_type = 'payment' and source_id = old.id;
  end if;
  return old;
end;
$$;

drop trigger if exists receipt_vouchers_purge_ledger_on_restore on public.receipt_vouchers;
create trigger receipt_vouchers_purge_ledger_on_restore
before delete on public.receipt_vouchers
for each row execute function public.purge_receipt_ledger_on_restore();

drop trigger if exists payment_vouchers_purge_ledger_on_restore on public.payment_vouchers;
create trigger payment_vouchers_purge_ledger_on_restore
before delete on public.payment_vouchers
for each row execute function public.purge_payment_ledger_on_restore();

revoke all on function public.prevent_financial_ledger_mutation() from public, anon, authenticated;
revoke all on function public.purge_receipt_ledger_on_restore() from public, anon, authenticated;
revoke all on function public.purge_payment_ledger_on_restore() from public, anon, authenticated;

commit;
