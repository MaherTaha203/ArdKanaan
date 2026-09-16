begin;

-- RLS policies in the existing schema call is_owner() directly. Keep EXECUTE for
-- authenticated so those policies continue to evaluate; internal helpers such as
-- resolve_fee_obligation_enrollment remain non-callable.
grant execute on function public.is_owner() to authenticated;
revoke all on function public.resolve_fee_obligation_enrollment() from public, anon, authenticated;

commit;
