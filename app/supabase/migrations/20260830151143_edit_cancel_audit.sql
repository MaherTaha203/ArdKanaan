-- Phase 6 — editable + cancellable vouchers with an audit trail.
alter table public.receipt_vouchers add column if not exists cancelled_at timestamptz;
alter table public.receipt_vouchers add column if not exists cancel_reason text;
alter table public.payment_vouchers add column if not exists cancelled_at timestamptz;
alter table public.payment_vouchers add column if not exists cancel_reason text;

create table if not exists public.voucher_audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  voucher_id uuid not null,
  voucher_number bigint,
  action text not null,
  changed_by uuid,
  changed_at timestamptz not null default timezone('utc', now()),
  old_data jsonb,
  new_data jsonb
);

alter table public.voucher_audit_log enable row level security;
revoke all on public.voucher_audit_log from anon, authenticated;
grant select on public.voucher_audit_log to authenticated;
drop policy if exists audit_auth_select on public.voucher_audit_log;
create policy audit_auth_select on public.voucher_audit_log for select to authenticated using (true);

create or replace function public.log_voucher_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  act text;
begin
  if (old.cancelled_at is null and new.cancelled_at is not null) then
    act := 'cancel';
  elsif (old.cancelled_at is not null and new.cancelled_at is null) then
    act := 'uncancel';
  else
    act := 'edit';
  end if;

  insert into public.voucher_audit_log
    (table_name, voucher_id, voucher_number, action, changed_by, old_data, new_data)
  values
    (tg_table_name, new.id, new.voucher_number, act, auth.uid(), to_jsonb(old), to_jsonb(new));

  return new;
end;
$$;

drop trigger if exists receipt_vouchers_audit on public.receipt_vouchers;
create trigger receipt_vouchers_audit
  after update on public.receipt_vouchers
  for each row execute function public.log_voucher_change();

drop trigger if exists payment_vouchers_audit on public.payment_vouchers;
create trigger payment_vouchers_audit
  after update on public.payment_vouchers
  for each row execute function public.log_voucher_change();

grant update on public.receipt_vouchers to authenticated;
grant update on public.payment_vouchers to authenticated;

drop policy if exists receipts_auth_update on public.receipt_vouchers;
create policy receipts_auth_update on public.receipt_vouchers
  for update to authenticated using (true) with check (true);
drop policy if exists payments_auth_update on public.payment_vouchers;
create policy payments_auth_update on public.payment_vouchers
  for update to authenticated using (true) with check (true);

create or replace view public.student_statement_lines as
select
  rv.id,
  rv.voucher_number,
  rv.voucher_date,
  rv.student_id,
  rv.student_name_snapshot as student_name,
  rv.course_name,
  rv.course_value,
  rv.amount_received,
  rv.notes,
  rv.payer_name,
  rv.created_at,
  rv.course_value - sum(rv.amount_received) over (
    partition by rv.student_id, rv.course_name
    order by rv.voucher_date, rv.voucher_number
    rows between unbounded preceding and current row
  ) as remaining_balance
from public.receipt_vouchers rv
where rv.cancelled_at is null;

create or replace view public.financial_movements as
select
  rv.id,
  'receipt'::text as movement_type,
  rv.voucher_number,
  rv.voucher_date,
  rv.amount_received as amount,
  rv.student_name_snapshot as party_name,
  rv.course_name as context,
  rv.created_at
from public.receipt_vouchers rv
where rv.cancelled_at is null
union all
select
  pv.id,
  'payment'::text as movement_type,
  pv.voucher_number,
  pv.voucher_date,
  pv.amount as amount,
  null::text as party_name,
  pv.expense_type as context,
  pv.created_at
from public.payment_vouchers pv
where pv.cancelled_at is null;

alter view public.student_statement_lines set (security_invoker = true);
alter view public.financial_movements set (security_invoker = true);

create or replace view public.cancelled_vouchers as
select
  rv.id,
  'receipt'::text as movement_type,
  rv.voucher_number,
  rv.voucher_date,
  rv.amount_received as amount,
  rv.student_name_snapshot as party_name,
  rv.course_name as context,
  rv.cancelled_at,
  rv.cancel_reason
from public.receipt_vouchers rv
where rv.cancelled_at is not null
union all
select
  pv.id,
  'payment'::text as movement_type,
  pv.voucher_number,
  pv.voucher_date,
  pv.amount as amount,
  null::text as party_name,
  pv.expense_type as context,
  pv.cancelled_at,
  pv.cancel_reason
from public.payment_vouchers pv
where pv.cancelled_at is not null;

alter view public.cancelled_vouchers set (security_invoker = true);
grant select on public.cancelled_vouchers to authenticated;