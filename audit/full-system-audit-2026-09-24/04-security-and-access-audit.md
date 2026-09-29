# 04 — Security & Access Audit

**Phases covered:** 6 (auth / authorization / security) · 7 (API / RPC contracts)
**Basis:** all 53 migrations, auth/client layer, env/config, every RPC call site (static). No live pentest; no secrets printed.

## Access model (proven from code)

**Single-owner, server-enforced.** The security boundary is Postgres, not the UI.
`public.is_owner()` (SECURITY DEFINER, `search_path=''`) is true only for `auth.uid()` =
the singleton `public.owner_identity.id` (seeded from the earliest `auth.users` row). Every
`public` table has RLS enabled with owner-only policies; **all financial writes are funneled
through SECURITY DEFINER RPCs** that begin with `if not public.is_owner() then raise
'OWNER_ONLY'`, and direct financial-table writes are additionally blocked by `BEFORE`
triggers unless a transaction-local GUC set *inside* the RPC is present. No edge functions;
the whole backend is Postgres + PostgREST. Early authenticated-only (`using(true)`) policies
were superseded/dropped by `owner_only_rls_reconciled` and later migrations.

## Access-control matrix (final repo state)

Roles: **anon**, **auth¬owner** (signed-in non-owner), **owner**.

| Resource | Type | anon | auth¬owner | owner | Enforcement |
|---|---|---|---|---|---|
| students | table | ✗ | ✗ | SELECT/INSERT/UPDATE (no DELETE) | RLS `is_owner()`; DELETE no policy/grant |
| courses | table | ✗ | ✗ | S/I/U/D | RLS owner; FK `on delete restrict` |
| enrollments | table | ✗ | ✗ | SELECT (writes RPC-only) | INSERT/UPDATE grant revoked; DELETE trigger-blocked |
| receipt_vouchers | table | ✗ | ✗ | SELECT + UPDATE(cancel); INSERT RPC-only | firewall trigger needs `app.receipt_posting`; DELETE blocked |
| payment_vouchers | table | ✗ | ✗ | SELECT + UPDATE(cancel); INSERT RPC-only | `app.payment_posting` |
| fee_obligations | table | ✗ | ✗ | SELECT (create/cancel RPC-only) | immutable + delete-blocked triggers |
| receipt_allocations | table | ✗ | ✗ | SELECT | writes via DEFINER RPC; update/delete blocked |
| financial_movement_ledger | table | ✗ | ✗ | SELECT | append-only trigger; no update/delete policy |
| audit_log / restore_log | table | ✗ | ✗ | SELECT | inserts via DEFINER only |
| owner_identity | table | ✗ | ✗ | ✗ | `revoke all`; **RLS not enabled** (SEC-007) |
| student_statement_lines / financial_movements / cancelled_vouchers / active_students | views | ✗ | ✗ | SELECT (owner via underlying RLS) | `security_invoker=true`; `financial_movements` grant gap (SEC-006) |

No table lacks RLS **except `owner_identity`** (protected by absence of grants). No
permissive (`using(true)`) policy survives.

## RPC contract inventory (Phase 7)

All are `SECURITY DEFINER, search_path=''`, `revoke all from public, anon`, `grant execute
to authenticated`, starting with an `is_owner()` gate — **except the two flagged in SEC-001.**

| RPC | Authz | Validation | Atomic / Idempotent | Notes |
|---|---|---|---|---|
| `post_receipt_with_allocations(jsonb)` | is_owner | types, whole-shekel, amount≤1e6, per-alloc enrollment/fee + remaining-balance, external-share conservation, dup-alloc guard | tx + advisory locks + `for share`; **idempotent** (UUID key + MD5 payload fingerprint, reuse-mismatch rejected) | strongest path |
| `post_payment_voucher(jsonb)` | is_owner | types, whole-shekel, ≤1e6 | tx + advisory lock; idempotent | |
| `create_fee_obligations(jsonb)` | is_owner | category/external arithmetic, course existence, student dedupe | validate-all-before-write | additive |
| `cancel_fee_obligation(uuid,text)` | is_owner | reason required; blocks if allocation paid | row lock | |
| `create_enrollment(jsonb)` | is_owner | student/course exist, base_fee, uniqueness | tx; dup→coded error | |
| `restore_center_data(jsonb,bool)` | is_owner | format, size caps, empty-refuse, shrink-guard, **full graph validation before destructive delete** | single tx; `app.restoring` GUC | heavily guarded |
| `record_activity_event(...)` | is_owner | length-clamped | single insert | |
| `archive_student` / `unarchive_student` | is_owner | blocks archive while active-course enrolment | single update; idempotent | |
| **`complete_student` / `reactivate_student`** | **RLS only — no is_owner, SECURITY INVOKER, not revoked** | update only | single update | **SEC-001** |

Internal trigger/ledger functions are all `revoke all from public, anon, authenticated`
(not callable as RPCs). **Server-side identity is not UI-dependent:** the receipt RPC
re-derives + re-validates the student-name snapshot, reads enrollment fee/course_value from
the catalog (never client), validates amounts against remaining balances, and the
posting GUCs make the RPC the only insert path. **No RPC trusts client-supplied identity or
amounts.** **No SQL-injection surface** (all values via `jsonb->>`, typed casts, parameters;
no string-concatenated SQL).

## Findings (SEC-001 … SEC-009)

| ID | Sev | Conf | Status | Location | Evidence / impact | Recommendation (not implemented) |
|---|---|---|---|---|---|---|
| **SEC-001** | **P2** | High | **PROVEN (code)** | `20260916116500_reconcile_student_lifecycle.sql:68-112` | `complete_student`/`reactivate_student` are SECURITY INVOKER with **no `is_owner()` gate and no `revoke from public,anon`** (unlike every other mutation). Authz depends solely on the `students` UPDATE RLS staying owner-only; the defense-in-depth layer is absent and anon can invoke them (no-op probe today) | Add `is_owner()` gate, `revoke all from public,anon`, `search_path=''` to match the established pattern |
| SEC-002 | P2/P3 | Med | SUSPECTED (needs live) | `supabase/config.toml:176,221,226` | Local config: `enable_signup=true`, `enable_confirmations=false`; anon key ships in bundle → anyone can `signUp` (a self-registered JWT still fails `is_owner()`, so no data access) | Disable public signup for a single-owner product; require email confirmation if kept — **verify production dashboard** |
| SEC-003 | P3 | Med | SUSPECTED (needs live) | `config.toml:182,185` vs `features/auth/password-policy.ts:8-23` | Server `minimum_password_length=6`, `password_requirements=""`; strong policy is **client-only** | Mirror the client policy server-side — verify production |
| SEC-004 | P3 | Med | IMPROVEMENT (needs live) | `config.toml:302-303` | No MFA/TOTP on the sole owner account | Enable TOTP for the owner — verify production |
| SEC-005 | P3 | High | IMPROVEMENT (PROVEN) | `src/lib/supabase.ts:41-50` | Session JWT in `localStorage` (Supabase default) — trips the project's own rule; low exploitability today (no XSS sinks found) | Accept as documented residual risk; add a CSP; keep the sink-free posture |
| SEC-006 | P3 | High | IMPROVEMENT / needs live | `20260916115000_financial_ledger_append_only_cleanup.sql:166-188` | `drop+create view financial_movements` without re-adding `grant select to authenticated` → a from-scratch reset breaks the report read model (fails **safe**, no exposure); signals repo↔prod drift | Re-add `grant select ... to authenticated`; verify `\dp` on production |
| SEC-007 | P3 | High | IMPROVEMENT (PROVEN) | `20260903182312_stabilize_owner_identity.sql:1-7` | `owner_identity` never `enable row level security` (safe via revoke-only today) | Enable RLS with no permissive policy (belt-and-suspenders) |
| SEC-008 | P3 (info) | High | IMPROVEMENT | e.g. `…124000:59` | `voucher_date` has no range check; free-text descriptive fields only `btrim` (not an injection/authz risk; all financial fields are validated) | Add `voucher_date` bounds if business rules require |
| SEC-009 | P3 (info) | High | PROVEN | RPCs; `use-money-*-store.ts` | Error hygiene good (stable coded errors, generic Arabic UI messages); `RESTORE_SHRINKS` discloses counts but only to the owner | None required |

**Positive confirmations (no finding):** no service-role key/secret in client or bundle
(only the two public `VITE_*` keys; `.env.production:6` warns *not* to add service_role);
no XSS sinks / unsafe URL schemes / `eval`; backup-restore file is untrusted-then-validated
(server re-validates the whole graph, client validation not load-bearing); financial writes
RPC-only, atomic, idempotent; ledger append-only, vouchers/enrollments/obligations
immutable-after-post + delete-blocked.

## Proven-from-code vs needs-live-verification

**Proven (repo state):** owner-only RLS model + reconciliation; each RPC's
authz/validation/atomicity/idempotency; RPC-only insert enforcement via triggers+GUCs;
immutability/append-only/delete-block triggers; no service-role secret / XSS / SQLi;
localStorage session; SEC-001, 005, 006, 007, 008, 009.

**Needs live verification (code cannot prove applied state; repo itself documents drift —
last two migrations are marked "REPO ONLY, not applied to Production"):**
1. Actual applied RLS/policies/grants on production — esp. SEC-006 grant, SEC-001 ACL + the
   `students` UPDATE policy, and RLS-enabled on every table (Supabase Security Advisor /
   `get_advisors` would surface any gap).
2. Production Auth settings (dashboard, not `config.toml`): signup, email confirmation,
   password policy, MFA (SEC-002/003/004).
3. That a client cannot set the `app.*` posting GUCs via PostgREST request settings (default
   PostgREST blocks this; worth a live check as it underpins the write-path firewall).
4. `owner_identity` seeding — exactly one row = the intended owner, no earlier stray user.

**Net:** an unusually well-hardened, server-enforced, owner-only design. Only **SEC-001**
warrants prompt code attention; the rest are auth-config hardening to verify against the
live project plus low-risk defense-in-depth.
