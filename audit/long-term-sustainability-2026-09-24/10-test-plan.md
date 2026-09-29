# 10 — Test Plan (reproducible, isolated environment)

Turns this audit's **NOT VERIFIED IN LIVE ENVIRONMENT** blanks into measured evidence,
**without touching production**. All of it runs in an **isolated** environment (a throwaway
Supabase/Postgres project or `supabase db reset` locally + seeded data). Proposed success
criteria are **test goals, not current system specs**.

## Prerequisites (Owner decisions / access)

1. Read-only access to **production row counts** per table (to pick realistic seed sizes) and
   the applied migration/RLS state (`supabase_migrations`, `get_advisors`). **No production
   writes.**
2. An **isolated Postgres 17** with the repo migrations applied (`supabase db reset`).
3. Seed generator producing the `02` scenario volumes (Low/Medium/High at Year 1/5/10).

## T0 — Client aggregation (DONE, reproducible)

Already executed this session (`05`, `evidence/`). Re-run: copy `aggregate.ts`, strip its
type import, concat with `evidence/aggregate-benchmark-harness.ts`, run
`node --experimental-strip-types run.ts`. **Extend** with a browser profile (Chromium
DevTools) to add DOM/React render cost and real-device timing. *Goal: keep whole-dataset
pages < ~1 s at the target volume on the operator's real device.*

## T1 — Database read performance `[real-PG]`

Seed Medium Year 5 & Year 10. Run `EXPLAIN (ANALYZE, BUFFERS)` on the **read** queries/views
only (never on write functions): the 7 workspace-load selects, `student_statement_lines`,
`financial_movements`, and the `audit_log` activity query (before/after the proposed
`(changed_at desc)` index). Record: plan, rows, buffers, time. *Goal: no whole-table sort on
the activity page; index scan after A4.*

## T2 — Financial invariants `[real-PG]` (this is the P1 fix, R-A1)

Against the isolated DB, **execute** (not text-match): allocation sum = amount; external-share
conservation incl. fractional split; overpayment rejection (course + fee); idempotency
replay (same key + fingerprint → no duplicate; changed payload → reject); cancellation
reversal nets to zero; direct-insert rejection; RLS denies a non-owner. *Goal: 100% pass;
suite fails when a guard is deliberately broken.*

## T3 — Concurrency `[real-PG]`

Fire N parallel `post_receipt_with_allocations` on the **same enrollment/last balance**, and
duplicate submits with the same idempotency key. *Goal: exactly one succeeds per balance; no
double-post; no deadlock.*

## T4 — Lifecycle & accumulation `[real-PG]`

Seed a decade of activity, then: archive→reactivate a student, re-enroll into a same-named new
course, cancel + re-issue a receipt. Assert prior balances/statement lines are **unchanged**
and the new course's paid/remaining match the ledger (targets SUS-08/FIN-A2). *Goal: old
records immutable; new figures reconcile.*

## T5 — Report/total completeness at scale `[real-PG + browser]`

Seed > 1000 rows per table; verify report/statement totals equal a direct SQL `SUM` (guards
against a future `.select()` dropping `fetchAllRows` → truncated totals, FIN-A4). *Goal:
UI totals == SQL totals exactly.*

## T6 — Backup & restore rehearsal `[isolated]`

Export a backup from a seeded isolated DB; restore into a **second** clean isolated DB via
`restore_center_data`; diff row counts + financial totals. Include a standalone-fee backup to
confirm/repro DB-002. *Goal: byte-for-financial-total restore; documented RPO/RTO.*

## T7 — Resilience `[browser + isolated]`

Simulate offline mid-save, session expiry mid-save, and a post-write network failure with
retry. *Goal: no duplicate/lost financial entry; clear user feedback; safe retry.*

## T8 — Load/egress `[isolated + network trace]`

Measure cold-load transfer size + time at each seed volume (the tens-of-MB full-history
transfer). *Goal: quantify the egress curve to decide the B1 threshold.*

## Test data & tooling

A seed script (in the isolated env only — **not** added to the app repo per the audit
constraint), pgTAP or a shell/psql harness for T2–T4 (extend the existing
`supabase/tests/external_share_layers.sh`), Playwright + a real seeded backend for T5/T7,
Chromium DevTools for T0/T8. Record for every run: data volume, environment, runs, avg, P95,
errors, resource use.

**None of T1–T8 has been run** (no isolated DB/access this session). T0 is done and in
`evidence/`.
