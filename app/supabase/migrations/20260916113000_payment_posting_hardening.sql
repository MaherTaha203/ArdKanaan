begin;

-- Payment vouchers are financial facts too: post them through one atomic,
-- idempotent RPC rather than allowing arbitrary direct client inserts.
alter table public.payment_vouchers
  add column if not exists idempotency_key uuid;

create unique index if not exists payment_vouchers_idempotency_key_uidx
  on public.payment_vouchers (idempotency_key)
  where idempotency_key is not null;

create or replace function public.enforce_payment_financial_firewall()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.cancelled_at is not null then
      raise exception 'CANCELLED_VOUCHER_IS_IMMUTABLE';
    end if;

    if new.voucher_number is distinct from old.voucher_number
       or new.voucher_date is distinct from old.voucher_date
       or new.expense_type is distinct from old.expense_type
       or new.amount is distinct from old.amount
       or new.idempotency_key is distinct from old.idempotency_key then
      raise exception 'FINANCIAL_FIELDS_IMMUTABLE';
    end if;

    if new.cancelled_at is not null
       and nullif(btrim(new.cancel_reason), '') is null then
      raise exception 'CANCELLATION_REASON_REQUIRED';
    end if;
    return new;
  end if;

  if new.cancelled_at is not null
     and nullif(btrim(new.cancel_reason), '') is null then
    raise exception 'CANCELLATION_REASON_REQUIRED';
  end if;

  if current_setting('app.payment_posting', true) <> 'on' then
    raise exception 'PAYMENT_POSTING_RPC_REQUIRED';
  end if;

  return new;
end;
$$;

drop trigger if exists payment_vouchers_financial_firewall on public.payment_vouchers;
create trigger payment_vouchers_financial_firewall
before insert or update on public.payment_vouchers
for each row execute function public.enforce_payment_financial_firewall();

revoke all on function public.enforce_payment_financial_firewall() from public, anon, authenticated;

create or replace function public.post_payment_voucher(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_date date;
  p_expense_type text;
  p_amount numeric;
  p_notes text;
  p_idempotency_key uuid;
  v_existing public.payment_vouchers%rowtype;
  v_id uuid;
  v_number bigint;
  v_lock bigint;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object' then raise exception 'INVALID_PAYMENT_PAYLOAD'; end if;

  p_date := nullif(payload->>'voucher_date', '')::date;
  p_expense_type := btrim(coalesce(payload->>'expense_type', ''));
  p_amount := (payload->>'amount')::numeric;
  p_notes := btrim(coalesce(payload->>'notes', ''));
  p_idempotency_key := nullif(payload->>'idempotency_key', '')::uuid;

  if p_date is null or p_expense_type = '' or p_amount is null or p_amount <= 0
     or p_amount <> trunc(p_amount) or p_amount > 1000000 or p_idempotency_key is null then
    raise exception 'INVALID_PAYMENT_PAYLOAD';
  end if;

  v_lock := hashtextextended('payment-idempotency:' || p_idempotency_key::text, 0);
  perform pg_advisory_xact_lock(v_lock);

  select * into v_existing
  from public.payment_vouchers
  where idempotency_key = p_idempotency_key
  limit 1;

  if found then
    if v_existing.voucher_date is distinct from p_date
       or v_existing.expense_type is distinct from p_expense_type
       or v_existing.amount is distinct from p_amount then
      raise exception 'IDEMPOTENCY_KEY_REUSE_MISMATCH';
    end if;
    return jsonb_build_object(
      'id', v_existing.id,
      'voucher_number', v_existing.voucher_number,
      'amount', v_existing.amount,
      'idempotent_replay', true
    );
  end if;

  perform set_config('app.payment_posting', 'on', true);

  insert into public.payment_vouchers
    (voucher_date, expense_type, amount, notes, idempotency_key)
  values
    (p_date, p_expense_type, p_amount, p_notes, p_idempotency_key)
  returning id, voucher_number into v_id, v_number;

  return jsonb_build_object(
    'id', v_id,
    'voucher_number', v_number,
    'amount', p_amount,
    'idempotent_replay', false
  );
end;
$$;

revoke all on function public.post_payment_voucher(jsonb) from public, anon;
grant execute on function public.post_payment_voucher(jsonb) to authenticated;

create or replace function public.prevent_payment_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return old;
  end if;
  raise exception 'PAYMENT_DELETE_FORBIDDEN';
end;
$$;

drop trigger if exists payment_vouchers_prevent_delete on public.payment_vouchers;
create trigger payment_vouchers_prevent_delete
before delete on public.payment_vouchers
for each row execute function public.prevent_payment_delete();

revoke all on function public.prevent_payment_delete() from public, anon, authenticated;

commit;
