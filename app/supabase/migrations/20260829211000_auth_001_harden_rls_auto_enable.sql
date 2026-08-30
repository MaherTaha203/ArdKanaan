-- AUTH-001 (hardening) — some Supabase projects ship a built-in `rls_auto_enable()`
-- helper that is callable via the public API. It must not be reachable by anon or
-- signed-in users. Guarded so this migration is a no-op on projects without it.

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
  ) then
    execute 'revoke execute on function public.rls_auto_enable() from anon, authenticated, public';
  end if;
end $$;
