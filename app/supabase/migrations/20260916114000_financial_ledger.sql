begin;

-- ---------------------------------------------------------------------------
-- True financial ledger
-- ---------------------------------------------------------------------------
-- receipt_vouchers/payment_vouchers remain the operational source documents.
-- This append-only table records the cash movement created by each document and
-- the compensating movement created when a document is cancelled. The existing
-- financial_movements view remains the application read model and exposes only
-- active original movements, preserving its current API shape.
create table if not exists public.financial_movement_ledger (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('receipt', 'payment')),
  source_id uuid not null,
  entry_kind text not null check (entry_kind in ('original', 'reversal')),
  amount numeric(14,2) not null check (amount > 0),
  external_share numeric(14,2) not null default 0 check (external_share >= 0 and external_share <= amount),
  voucher_number bigint not null,
  voucher_date date not null,
  party_name text,
  context text,
  created_at timestamptz not null default now(),
  reversed_at timestamptz,
  reversal_of uuid references public.financial_movement_ledger(id) on delete restrict,
  metadata jsonb not null default '{}'::jsonb,
  unique (source_type, source_id, entry_kind)
);

create index if not exists financial_movement_ledger_date_idx
  on public.financial_movement_ledger (voucher_date, created_at);
create index if not exists financial_movement_ledger_source_idx
  on public.financial_movement_ledger (source_type, source_id);

alter table public.financial_movement_ledger enable row level security;
revoke all on public.financial_movement_ledger from anon, authenticated;

create policy financial_movement_ledger_owner_select
on public.financial_movement_ledger
for select to authenticated
using (public.is_owner());

-- No UPDATE/DELETE policies are intentionally provided. Ledger rows are
-- append-only; cancellation is represented by a reversal row.

create or replace function public.record_receipt_ledger_movement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ledger_id uuid;
begin
  insert into public.financial_movement_ledger
    (source_type, source_id, entry_kind, amount, external_share, voucher_number,
     voucher_date, party_name, context, metadata)
  values
    ('receipt', new.id, 'original', new.amount_received, new.external_share,
     new.voucher_number, new.voucher_date, new.student_name_snapshot,
     new.course_name, jsonb_build_object('allocation_mode', new.allocation_mode))
  on conflict (source_type, source_id, entry_kind) do nothing
  returning id into v_ledger_id;

  if new.cancelled_at is not null then
    update public.financial_movement_ledger
    set reversed_at = coalesce(reversed_at, new.cancelled_at)
    where source_type = 'receipt' and source_id = new.id and entry_kind = 'original';

    select id into v_ledger_id
    from public.financial_movement_ledger
    where source_type = 'receipt' and source_id = new.id and entry_kind = 'original';

    insert into public.financial_movement_ledger
      (source_type, source_id, entry_kind, amount, external_share, voucher_number,
       voucher_date, party_name, context, reversal_of, metadata, created_at)
    values
      ('receipt', new.id, 'reversal', new.amount_received, new.external_share,
       new.voucher_number, new.voucher_date, new.student_name_snapshot,
       new.course_name, v_ledger_id,
       jsonb_build_object('reason', new.cancel_reason), new.cancelled_at)
    on conflict (source_type, source_id, entry_kind) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists receipt_vouchers_ledger on public.receipt_vouchers;
create trigger receipt_vouchers_ledger
after insert on public.receipt_vouchers
for each row execute function public.record_receipt_ledger_movement();

create or replace function public.record_receipt_cancellation_ledger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ledger_id uuid;
begin
  if old.cancelled_at is null and new.cancelled_at is not null then
    select id into v_ledger_id
    from public.financial_movement_ledger
    where source_type = 'receipt' and source_id = new.id and entry_kind = 'original';

    if v_ledger_id is null then
      insert into public.financial_movement_ledger
        (source_type, source_id, entry_kind, amount, external_share, voucher_number,
         voucher_date, party_name, context, metadata)
      values
        ('receipt', new.id, 'original', new.amount_received, new.external_share,
         new.voucher_number, new.voucher_date, new.student_name_snapshot,
         new.course_name, jsonb_build_object('recovered_original', true))
      on conflict (source_type, source_id, entry_kind) do nothing;
      select id into v_ledger_id
      from public.financial_movement_ledger
      where source_type = 'receipt' and source_id = new.id and entry_kind = 'original';
    end if;

    update public.financial_movement_ledger
    set reversed_at = new.cancelled_at
    where id = v_ledger_id;

    insert into public.financial_movement_ledger
      (source_type, source_id, entry_kind, amount, external_share, voucher_number,
       voucher_date, party_name, context, reversal_of, metadata, created_at)
    values
      ('receipt', new.id, 'reversal', new.amount_received, new.external_share,
       new.voucher_number, new.voucher_date, new.student_name_snapshot,
       new.course_name, v_ledger_id,
       jsonb_build_object('reason', new.cancel_reason), new.cancelled_at)
    on conflict (source_type, source_id, entry_kind) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists receipt_vouchers_cancellation_ledger on public.receipt_vouchers;
create trigger receipt_vouchers_cancellation_ledger
after update of cancelled_at on public.receipt_vouchers
for each row execute function public.record_receipt_cancellation_ledger();

create or replace function public.record_payment_ledger_movement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ledger_id uuid;
begin
  insert into public.financial_movement_ledger
    (source_type, source_id, entry_kind, amount, external_share, voucher_number,
     voucher_date, party_name, context, metadata)
  values
    ('payment', new.id, 'original', new.amount, 0, new.voucher_number,
     new.voucher_date, null, new.expense_type, '{}'::jsonb)
  on conflict (source_type, source_id, entry_kind) do nothing
  returning id into v_ledger_id;

  if new.cancelled_at is not null then
    update public.financial_movement_ledger
    set reversed_at = coalesce(reversed_at, new.cancelled_at)
    where source_type = 'payment' and source_id = new.id and entry_kind = 'original';

    select id into v_ledger_id
    from public.financial_movement_ledger
    where source_type = 'payment' and source_id = new.id and entry_kind = 'original';

    insert into public.financial_movement_ledger
      (source_type, source_id, entry_kind, amount, external_share, voucher_number,
       voucher_date, party_name, context, reversal_of, metadata, created_at)
    values
      ('payment', new.id, 'reversal', new.amount, 0, new.voucher_number,
       new.voucher_date, null, new.expense_type, v_ledger_id,
       jsonb_build_object('reason', new.cancel_reason), new.cancelled_at)
    on conflict (source_type, source_id, entry_kind) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists payment_vouchers_ledger on public.payment_vouchers;
create trigger payment_vouchers_ledger
after insert on public.payment_vouchers
for each row execute function public.record_payment_ledger_movement();

create or replace function public.record_payment_cancellation_ledger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ledger_id uuid;
begin
  if old.cancelled_at is null and new.cancelled_at is not null then
    select id into v_ledger_id
    from public.financial_movement_ledger
    where source_type = 'payment' and source_id = new.id and entry_kind = 'original';

    if v_ledger_id is null then
      insert into public.financial_movement_ledger
        (source_type, source_id, entry_kind, amount, external_share, voucher_number,
         voucher_date, party_name, context, metadata)
      values
        ('payment', new.id, 'original', new.amount, 0, new.voucher_number,
         new.voucher_date, null, new.expense_type, jsonb_build_object('recovered_original', true))
      on conflict (source_type, source_id, entry_kind) do nothing;
      select id into v_ledger_id
      from public.financial_movement_ledger
      where source_type = 'payment' and source_id = new.id and entry_kind = 'original';
    end if;

    update public.financial_movement_ledger
    set reversed_at = new.cancelled_at
    where id = v_ledger_id;

    insert into public.financial_movement_ledger
      (source_type, source_id, entry_kind, amount, external_share, voucher_number,
       voucher_date, party_name, context, reversal_of, metadata, created_at)
    values
      ('payment', new.id, 'reversal', new.amount, 0, new.voucher_number,
       new.voucher_date, null, new.expense_type, v_ledger_id,
       jsonb_build_object('reason', new.cancel_reason), new.cancelled_at)
    on conflict (source_type, source_id, entry_kind) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists payment_vouchers_cancellation_ledger on public.payment_vouchers;
create trigger payment_vouchers_cancellation_ledger
after update of cancelled_at on public.payment_vouchers
for each row execute function public.record_payment_cancellation_ledger();

-- Backfill existing source documents, including cancellation reversals where
-- required. ON CONFLICT makes this safe to re-run during controlled recovery.
insert into public.financial_movement_ledger
  (source_type, source_id, entry_kind, amount, external_share, voucher_number,
   voucher_date, party_name, context, metadata, created_at)
select 'receipt', rv.id, 'original', rv.amount_received, rv.external_share,
       rv.voucher_number, rv.voucher_date, rv.student_name_snapshot, rv.course_name,
       jsonb_build_object('backfill', true), rv.created_at
from public.receipt_vouchers rv
on conflict (source_type, source_id, entry_kind) do nothing;

insert into public.financial_movement_ledger
  (source_type, source_id, entry_kind, amount, external_share, voucher_number,
   voucher_date, party_name, context, reversal_of, metadata, created_at)
select 'receipt', rv.id, 'reversal', rv.amount_received, rv.external_share,
       rv.voucher_number, rv.voucher_date, rv.student_name_snapshot, rv.course_name,
       l.id, jsonb_build_object('backfill', true, 'reason', rv.cancel_reason), rv.cancelled_at
from public.receipt_vouchers rv
join public.financial_movement_ledger l
  on l.source_type = 'receipt' and l.source_id = rv.id and l.entry_kind = 'original'
where rv.cancelled_at is not null
on conflict (source_type, source_id, entry_kind) do nothing;

insert into public.financial_movement_ledger
  (source_type, source_id, entry_kind, amount, external_share, voucher_number,
   voucher_date, party_name, context, metadata, created_at)
select 'payment', pv.id, 'original', pv.amount, 0,
       pv.voucher_number, pv.voucher_date, null, pv.expense_type,
       jsonb_build_object('backfill', true), pv.created_at
from public.payment_vouchers pv
on conflict (source_type, source_id, entry_kind) do nothing;

insert into public.financial_movement_ledger
  (source_type, source_id, entry_kind, amount, external_share, voucher_number,
   voucher_date, party_name, context, reversal_of, metadata, created_at)
select 'payment', pv.id, 'reversal', pv.amount, 0,
       pv.voucher_number, pv.voucher_date, null, pv.expense_type,
       l.id, jsonb_build_object('backfill', true, 'reason', pv.cancel_reason), pv.cancelled_at
from public.payment_vouchers pv
join public.financial_movement_ledger l
  on l.source_type = 'payment' and l.source_id = pv.id and l.entry_kind = 'original'
where pv.cancelled_at is not null
on conflict (source_type, source_id, entry_kind) do nothing;

update public.financial_movement_ledger l
set reversed_at = rv.cancelled_at
from public.receipt_vouchers rv
where l.source_type = 'receipt' and l.source_id = rv.id and l.entry_kind = 'original'
  and rv.cancelled_at is not null;

update public.financial_movement_ledger l
set reversed_at = pv.cancelled_at
from public.payment_vouchers pv
where l.source_type = 'payment' and l.source_id = pv.id and l.entry_kind = 'original'
  and pv.cancelled_at is not null;

-- Keep the existing application-facing shape. Only unreversed originals are
-- visible here; the ledger itself retains the complete audit history.
drop view if exists public.financial_movements;
create view public.financial_movements
with (security_invoker = true)
as
select
  l.source_id as id,
  l.source_type::text as movement_type,
  l.voucher_number,
  l.voucher_date,
  l.amount,
  l.party_name,
  l.context,
  l.created_at,
  l.external_share
from public.financial_movement_ledger l
where l.entry_kind = 'original'
  and l.reversed_at is null;

revoke all on public.financial_movements from anon, authenticated;
grant select on public.financial_movements to authenticated;

commit;
