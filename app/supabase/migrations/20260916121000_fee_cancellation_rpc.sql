begin;

create or replace function public.cancel_fee_obligation(p_fee_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fee public.fee_obligations%rowtype;
  v_paid numeric;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if p_fee_id is null or nullif(btrim(p_reason), '') is null then
    raise exception 'FEE_CANCELLATION_REASON_REQUIRED';
  end if;

  select * into v_fee
  from public.fee_obligations
  where id = p_fee_id
  for update;
  if not found then raise exception 'FEE_OBLIGATION_NOT_FOUND'; end if;
  if v_fee.cancelled_at is not null then raise exception 'FEE_ALREADY_CANCELLED'; end if;

  select coalesce(sum(ra.amount), 0)
  into v_paid
  from public.receipt_allocations ra
  join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id
  where ra.fee_obligation_id = p_fee_id
    and rv.cancelled_at is null;

  if v_paid > 0 then
    raise exception 'PAID_FEE_REQUIRES_REVERSAL_BEFORE_CANCELLATION';
  end if;

  update public.fee_obligations
  set cancelled_at = now(), cancel_reason = btrim(p_reason)
  where id = p_fee_id;

  return jsonb_build_object('id', p_fee_id, 'cancelled', true);
end;
$$;

revoke all on function public.cancel_fee_obligation(uuid, text) from public, anon;
grant execute on function public.cancel_fee_obligation(uuid, text) to authenticated;

commit;
