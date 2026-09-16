begin;

-- active_students is a plain read model and must honor the querying user's
-- permissions/RLS rather than the view owner's permissions.
alter view public.active_students set (security_invoker = true);

-- These functions are internal helpers. They are called by triggers/server-side
-- security-definer routines and must not be exposed as arbitrary PostgREST RPCs.
revoke all on function public.resolve_fee_obligation_enrollment() from public, anon, authenticated;
revoke all on function public.is_owner() from public, anon, authenticated;

commit;
