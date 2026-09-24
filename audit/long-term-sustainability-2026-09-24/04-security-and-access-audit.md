# 04 — Security & Access Audit

**Phases 6–7.** Static, from all migrations + auth/client layer + env (keys only). No live
pentest; no secrets printed. Auth-config items are from local `config.toml` → BLOCKED —
ACCESS REQUIRED against the production dashboard.

## Access model (proven from code)

**Single-owner, server-enforced.** `public.is_owner()` (SECURITY DEFINER, `search_path=''`)
is true only for `auth.uid()` = the singleton `owner_identity.id`. Every public table has
RLS; **all financial writes go through SECURITY DEFINER RPCs** that begin
`if not public.is_owner() then raise 'OWNER_ONLY'`; direct financial-table writes are
trigger-blocked unless a transaction-local GUC set *inside* the RPC is present. All direct
INSERT/UPDATE grants are revoked → RPCs are the sole write path. **No service-role key in the
client/bundle; no XSS sink; no SQL-injection surface** (all values via `jsonb->>`/typed
casts/params). This is a **durable** security foundation — the boundary is Postgres, not the
UI, so UI changes cannot weaken it.

## Access-control matrix (final repo state)

| Resource | anon | auth¬owner | owner | Enforcement |
|---|---|---|---|---|
| all financial tables/views | ✗ | ✗ | SELECT (+ RPC-only writes / cancel UPDATE) | owner-only RLS + revoked grants + firewall triggers |
| ledger | ✗ | ✗ | SELECT | append-only trigger, no update/delete policy |
| audit_log / restore_log | ✗ | ✗ | SELECT | inserts via DEFINER only |
| owner_identity | ✗ | ✗ | ✗ | revoke-only; **RLS not enabled** (SEC-007) |

RPC contracts: all owner-gated, atomic, and idempotent where it matters (receipt/payment
posting use a UUID key + MD5 payload fingerprint); receipt RPC re-derives + re-validates the
student snapshot and reads fee/course_value from the catalog — **no RPC trusts client
identity or amounts**.

## Findings

| ID | Sev | Status | Location | Finding / recommendation (not implemented) |
|---|---|---|---|---|
| **SEC-001** (=DB-011) | P2 | PROVEN | `20260916116500:68,91` | `complete_student`/`reactivate_student` lack `is_owner()` + not revoked from public/anon (safe today only via `students` UPDATE RLS). → Bring to the DEFINER + gate + revoke pattern |
| SEC-002 | P2/P3 | SUSPECTED · BLOCKED — ACCESS REQUIRED | `config.toml:176,221,226` | Local config enables public signup + no email confirmation (self-registered JWT still fails `is_owner()`). → Verify/disable in production dashboard |
| SEC-003 | P3 | SUSPECTED · BLOCKED — ACCESS REQUIRED | `config.toml:182,185` | Server password policy weak (len 6); strong policy client-only. → Mirror server-side; verify prod |
| SEC-004 | P3 | IMPROVEMENT · BLOCKED — ACCESS REQUIRED | `config.toml:302-303` | No MFA on the sole owner account. → Enable TOTP; verify prod |
| SEC-005 (=TEST-015) | P3 | PROVEN | `supabase.ts:41-50` | Session JWT in `localStorage` (Supabase default; XSS-reachable; low today, no sinks). → Accept as documented tradeoff; add CSP |
| SEC-006 | P3 | PROVEN · needs live | `20260916115000:166-188` | `financial_movements` view recreated without re-`grant select` → a from-scratch reset breaks the report read (fails safe); drift signal. → Re-add grant; verify `\dp` on prod |
| SEC-007 (=DB-006) | P3 | PROVEN | `20260903182312:1-14` | `owner_identity` no RLS (revoke-only). → Enable RLS, no permissive policy |
| SEC-008 | P3 (info) | IMPROVEMENT | posting RPCs | `voucher_date` unbounded; descriptive fields only `btrim` (not injection/authz). → Add date bounds if business requires |
| SEC-009 | P3 (info) | PROVEN | RPCs / stores | Error hygiene good (coded errors, generic UI messages); `RESTORE_SHRINKS` count disclosure owner-only |

## Long-term security sustainability

**Strong core, thin defense-in-depth in two spots.** The owner-only, RPC-only, append-only
design ages well and is UI-change-proof. The durable risks are: (1) **SEC-001** pattern
drift (a future migration touching the `students` policy could open the lifecycle RPCs);
(2) the **repo↔production drift** the repo itself documents (SEC-006 + "repo only" tail
migrations) — over time the applied state and the repo can diverge unless reconciled; and
(3) auth-config hygiene (signup/MFA/password) that must be governed at the dashboard. Run
Supabase Security Advisor (`get_advisors`) periodically.

## BLOCKED — ACCESS REQUIRED

Applied RLS/policies/grants on production (SEC-006 grant, SEC-001 ACL + `students` policy,
RLS on every table, Security Advisor); production Auth settings (SEC-002/003/004); PostgREST
cannot-set-`app.*`-GUC check; `owner_identity` seeding.
