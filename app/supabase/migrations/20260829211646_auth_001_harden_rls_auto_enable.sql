-- Harden the project's built-in auto-RLS helper: it must not be callable from
-- the public API by anon or signed-in users (event-trigger use is unaffected).
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;