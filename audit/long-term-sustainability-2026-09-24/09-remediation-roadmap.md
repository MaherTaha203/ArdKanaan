# 09 — Remediation Roadmap (proposed, NOT executed)

Three tiers by trigger: **A — before relying on the system long-term** (do soon, low data
dependence); **B — as data grows** (needed once volume crosses a threshold); **C — future /
optional**. No fix was implemented. **Golden rules:** never refactor financial code without
[real-PG] parity tests proving identical outputs; keep every financial change in its own PR,
separate from UI; all DB corrections are new corrective/append-only migrations (never edit
data or rewrite history); do the [LIVE] reads under Owner authorization first.

## Tier A — before long-term reliance (foundational; mostly data-independent)

| # | Fix | Addresses | Dependencies | Change risk | Tests to add first / verify |
|---|---|---|---|---|---|
| A1 | **Executable [real-PG] tests in CI** for posting/cancellation/fee/restore RPCs + triggers + views (conservation, overpayment reject, idempotency dedupe, reversal, RLS denial, restore guards, fractional-vs-whole) | **SUS-01 (P1)** | none — **do first** | CI infra only | Suite fails on a deliberately broken WHERE; keep text tests as secondary |
| A2 | Broaden CI triggers (default branch + all PRs) | SUS-07 | none | none | a PR on any branch runs CI |
| A3 | Add a React **error boundary** + remote **error tracking/uptime alerting** | SUS-04, SUS-05 | none | presentation/infra only | throw in a child → fallback + event reported |
| A4 | Index **`audit_log (changed_at desc)`** (+ `(entity,entity_id)`) | SUS-03, DB-010 | corrective migration | tiny write overhead | activity page query planned as index scan (verify via EXPLAIN in isolated DB) |
| A5 | **Automated, offsite, encrypted, retained** backup + a **tested restore** in an isolated env; extend restore validation for standalone fees (SUS-11) before enabling that feature | SUS-06, SUS-11, DB-004 | A1 (restore test) | additive | restore from an offsite copy succeeds in isolation |
| A6 | Enable **TS `strict`** (+ `noUncheckedIndexedAccess`) and type-aware lint, fix fallout incrementally behind A1 | SUS-12, TEST-005 | A1 | code churn | `tsc -b` clean under strict |
| A7 | Bring **lifecycle RPCs** to gate+revoke; run **Supabase Security Advisor**; reconcile repo↔prod drift (re-add the dropped view grant) | SUS-10, SUS-13, SEC-006 | [LIVE] read access | corrective migration | Advisor clean; non-owner call denied |
| A8 | Write the **operational docs**: real README, architecture/data-flow, DR/restore runbook, critical-files list | SUS-14 | none | docs only | a new dev can run/restore from docs |

## Tier B — as data grows (needed once volume crosses a threshold)

| # | Fix | Trigger threshold (from `02`/`05`) | Notes |
|---|---|---|---|
| B1 | Move report totals/statements to **server-side SQL** (parameterized views/RPCs) + **windowed/lazy loading**; keep the dashboard on server aggregates | ~50k statement lines / activity page feeling slow (~Yr3–5 Medium) | **Treat as financial** — parity tests (A1) mandatory; biggest single longevity fix (SUS-02) |
| B2 | Paginate the activity page + `backup-history` (fetchAllRows or limit + "load more") | audit_log > ~1000 rows (immediately for backup-history) | SUS-03; cheap |
| B3 | Add composite indexes **only after B1** introduces server-side filters that need them (e.g. `financial_movement_ledger (voucher_date)`) | when the filtered query exists | avoid unused indexes now |
| B4 | Hoist a shared memoized aggregate slice; route-level `React.lazy` + vendor split | when multiple report/student tabs feel heavy / bundle matters | OPS-002/003 |
| B5 | Move to a paid Supabase tier + watch egress | storage/egress approaching plan limits (High growth) | verify plan limits [LIVE] |

## Tier C — future / optional

Single source of truth for course paid/remaining (SUS-08 — do behind A1 parity tests before
name-reuse accumulates); fractional-share governance decision (SUS-09); coverage thresholds
(TEST-006); write-path auth retry (OPS-008); offline handling (OPS-009); self-host fonts
(TEST-009); dedupe financial helpers/normalizers/labels (CODE-001/003/010); remove dead
code + unused dep (CODE-005/006/007, TEST-008); `audit_log` append-only trigger (DB-009);
constraint/index dedupe (DB-005); words-vs-2dp (TEST-010); TabStrip RTL keys (CODE-008);
net-vs-closing labels (FIN-005).

## Sequencing

**A1 first** (it makes every later financial change provably safe), then the rest of Tier A
(all low-risk, mostly data-independent), then **B1 when data warrants**. Tier C anytime.
Financial-correctness items (SUS-08/09) wait behind A1's parity net and a governance decision.
