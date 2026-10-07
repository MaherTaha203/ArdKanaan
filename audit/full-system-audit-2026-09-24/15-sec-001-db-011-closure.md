# SEC-001 / DB-011 Closure Record

**Closure date:** 2026-10-07  
**Finding:** `complete_student` / `reactivate_student` were SECURITY INVOKER lifecycle RPCs with public/anon EXECUTE, relying on the `students` RLS policy alone for owner authorization.

## Resolution

PR #141 was merged with:

- explicit `public.is_owner()` authorization inside both lifecycle RPCs;
- `SECURITY DEFINER` with `search_path = ''`;
- `EXECUTE` revoked from `public`, `anon`, and `authenticated`, then granted explicitly to `authenticated`;
- a throwaway PostgreSQL runtime harness covering function security mode, grants, non-owner rejection, and owner lifecycle transitions;
- CI integration of the runtime harness on PostgreSQL 17.

## Verification

CI run **#681** completed successfully across all jobs, including the new **DB Runtime · Student Lifecycle Access** job.

Production verification after migration application confirmed:

- `complete_student(uuid,text)`: SECURITY DEFINER, `search_path=""`, anon EXECUTE=false, authenticated EXECUTE=true.
- `reactivate_student(uuid)`: SECURITY DEFINER, `search_path=""`, anon EXECUTE=false, authenticated EXECUTE=true.
- A rollback-only Production probe using an authenticated non-owner rejected both RPCs with `OWNER_ONLY`.
- No Production data was mutated by the verification probe.

Supabase Security Advisor still reports the expected authenticated SECURITY DEFINER warning for these RPCs. This is intentional: authenticated users need to call the operations, while the RPC body now performs the owner authorization itself. The unrelated `owner_identity` INFO and leaked-password-protection WARN remain open separately.

## Status

**SEC-001 / DB-011: CLOSED.**

The original 2026-09-24 audit reports remain historical snapshots and are intentionally not rewritten. This record is the follow-up closure evidence.
