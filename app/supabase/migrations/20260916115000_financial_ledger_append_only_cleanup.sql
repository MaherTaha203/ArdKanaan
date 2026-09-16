begin;

-- The first ledger migration used reversed_at as a convenience marker. The
-- final contract is stricter: no ledger row is ever updated. A reversal row is
-- the sole evidence that an original movement was cancelled.
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
     voucher_date, party_name, context, metadata, created_at)
  values
    ('receipt', new.id, 'original', new.amount_received, new.external_share,
     new.voucher_number, new.voucher_date, new.student_name_snapshot,
     new.course_name, jsonb_build_object('allocation_mode', new.allocation_mode), new.created_at)
  on conflict (source_type, source_id, entry_kind) do nothing
  returning id into v_ledger_id;

  if new.cancelled_at is not null then
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
         voucher_date, party_name, context, metadata, created_at)
      values
        ('receipt', new.id, 'original', new.amount_received, new.external_share,
         new.voucher_number, new.voucher_date, new.student_name_snapshot,
         new.course_name, jsonb_build_object('recovered_original', true), new.created_at)
      on conflict (source_type, source_id, entry_kind) do nothing;
      select id into v_ledger_id
      from public.financial_movement_ledger
      where source_type = 'receipt' and source_id = new.id and entry_kind = 'original';
    end if;

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
     voucher_date, party_name, context, metadata, created_at)
  values
    ('payment', new.id, 'original', new.amount, 0, new.voucher_number,
     new.voucher_date, null, new.expense_type, '{}'::jsonb, new.created_at)
  on conflict (source_type, source_id, entry_kind) do nothing
  returning id into v_ledger_id;

  if new.cancelled_at is not null then
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
         voucher_date, party_name, context, metadata, created_at)
      values
        ('payment', new.id, 'original', new.amount, 0, new.voucher_number,
         new.voucher_date, null, new.expense_type, jsonb_build_object('recovered_original', true), new.created_at)
      on conflict (source_type, source_id, entry_kind) do nothing;
      select id into v_ledger_id
      from public.financial_movement_ledger
      where source_type = 'payment' and source_id = new.id and entry_kind = 'original';
    end if;

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

-- Remove the mutation-oriented marker from the read model. Existing historical
-- values are retained for forensic compatibility but are no longer written.
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
  and not exists (
    select 1
    from public.financial_movement_ledger r
    where r.source_type = l.source_type
      and r.source_id = l.source_id
      and r.entry_kind = 'reversal'
  );

revoke all on function public.record_receipt_ledger_movement() from public, anon, authenticated;
revoke all on function public.record_receipt_cancellation_ledger() from public, anon, authenticated;
revoke all on function public.record_payment_ledger_movement() from public, anon, authenticated;
revoke all on function public.record_payment_cancellation_ledger() from public, anon, authenticated;

commit;
