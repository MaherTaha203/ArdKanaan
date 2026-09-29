# 11 — Remediation Roadmap (proposed, NOT executed)

Ordered by priority and dependency. **No fix in this audit was implemented.** Financial
fixes are kept strictly separate from UI/design, and **no financial refactor is safe without
tests that first prove the financial outputs stay identical** (the audit's own rule). Every
item lists: problem · files · why · dependencies · change-risk · tests to add first ·
regression tests · how to verify · rollback.

> **Sequencing rule:** Group 0 (test/observability infrastructure) should land **before**
> most Group 1–2 fixes, because today there is no executable safety net to prove a financial
> change is behaviour-preserving (P1 TEST-001). Do not refactor money code until it exists.

---

## Group 0 — Make change safe first (prerequisite infrastructure)

**R0.1 — Executable DB tests for the financial firewall (resolves P1 TEST-001/FIN-006).**
Problem: server money guarantees are only text-matched. Files: new CI job + a Postgres
harness (extend `supabase/tests/external_share_layers.sh` or add pglite/testcontainers);
targets the posting/cancellation/fee/restore RPCs + triggers + the two views. Why: without
this, no financial fix can be proven safe. Dependencies: none (enables everything below).
Risk: CI time/infra only — no production impact. Tests to add: runtime conservation
(`Σalloc=amount`, `Σext=external`), overpayment rejection, idempotency dedupe, cancellation
reversal, RLS denial for a non-owner, restore guards, fractional-vs-whole external.
Regression: keep the existing text tests as a secondary signal. Verify: the suite executes
real RPCs against an ephemeral PG17 and fails on a deliberately broken WHERE clause.
Rollback: remove the job (no app change).

**R0.2 — Fix CI triggers (P2 TEST-002).** Trigger on the default branch and all PRs
(`pull_request:` with no branch allow-list). Verify: open a PR on any branch → CI runs.
Rollback: revert `ci.yml`.

**R0.3 — Add an error boundary + remote error tracking (P2 OPS-005/OPS-006).** Wrap the
shell in an error boundary with a reload/report fallback; add a lightweight error/telemetry
sink. Risk: presentation-only. Verify: throw in a child → fallback renders, event reported.

**R0.4 — Enable `strict` TypeScript + type-aware lint (P2 CODE-013/TEST-003, TEST-005).**
Turn on `strict` (+ `noUncheckedIndexedAccess`) and `recommendedTypeChecked`, fix fallout
incrementally behind the green suite. Dependency: do after R0.1 so any surfaced null-bug in
money code is caught with tests. Verify: `tsc -b` clean under strict. Rollback: revert
tsconfig/eslint.

---

## Group 1 — Critical financial-correctness risks (money output can be wrong/ambiguous)

> Each requires an approving governance decision (frozen whole-shekel rule / ADR) and R0.1
> parity tests **before** code changes.

**R1.1 — Resolve fractional `external_share` vs whole-shekel (P2 FIN-001/DB-001).** Problem:
derived external split can be fractional, contradicting DR-025/ADR-0014. Files:
`post_receipt_with_allocations` rounding (`…124000`), the dropped CHECK, `format` where
shown. Why: frozen-rule divergence in a financial figure. **Decision required (Owner/ADR):**
nearest-shekel with remainder-to-institute (mirroring ADR-0014) **or** formally relax the
rule for derived sub-amounts. Dependency: R0.1 (prove totals conserve either way). Risk:
touches money math — highest care; parity tests mandatory. Regression: center-funds +
external-party suites extended with fractional cases. Verify: reproduce amount 100/ext 30,
pay 33; confirm the chosen policy. Rollback: single migration revert (append-only, so a new
corrective migration, never a data edit).

**R1.2 — Single source of truth for course paid/remaining (P2 CODE-002/TEST-016; adjacent
FIN-002).** Problem: `courses.ts paidFor` diverges from `studentCourseBreakdown`. Files:
`lib/courses.ts` → reuse `studentCourseBreakdown`; investigate the `student_statement_lines`
legacy vs allocated partitions (FIN-002). Why: Course Detail can disagree with the ledger.
Dependency: R0.1 + a seeded legacy dataset. Risk: display-only (books balance), but it is a
financial *number* — treat as financial. Tests: add a fee-line-sharing-course-name case and
a two-same-named-enrollments case; assert Course view == ledger. Verify: numbers reconcile.
Rollback: revert the read-model change (pure function, no data).

**R1.3 — Route all receipt inserts through the RPC (P3 FIN-003, enables R1.2/R0.1
guarantees).** Revoke direct `INSERT` on `receipt_vouchers`; keep the RPC. Risk: could break
a legitimate non-UI path (confirm none exists). Verify: direct insert now rejected; UI
unaffected. Rollback: corrective migration re-granting.

---

## Group 2 — Access defense-in-depth, DR, and data-integrity hardening

**R2.1 — Bring lifecycle RPCs to the standard guard (P2 SEC-001/DB-011).**
`complete_student`/`reactivate_student`: add `is_owner()` gate, `revoke from public,anon`,
`search_path=''`. Verify (live): `\df+` shows `prosecdef` + revoked ACL; a non-owner call is
denied. Rollback: corrective migration.

**R2.2 — Fix restore vs standalone-fee contradiction before shipping the feature (P2
DB-002).** Update `restore_center_data` fee validation to accept course-less/enrollment-less
obligations; extend the shrink guard to child tables (DB-004). Dependency: R0.1 restore
test. Verify: a backup with a standalone fee round-trips. Rollback: corrective migration.

**R2.3 — Confirm & remediate production drift (P2 DB-003, SEC-006, deploy/migration).**
Read-only against production (owner-authorized): the applied migration set
(`schema_migrations`), the `financial_movements` grant, the lifecycle-RPC ACL + `students`
UPDATE policy, RLS on every table (Supabase Security Advisor / `get_advisors`), and whether
any `receipt_vouchers` row has `fee_category not null and allocation_mode=false`. Then
re-add the missing `grant select` (SEC-006) via a corrective migration. Verify: advisors
clean; report read model works from a clean reset.

**R2.4 — Backup resilience (P2 OPS-010/011/012).** Add automated, offsite, encrypted,
retained backups (scheduled Supabase dump), independent of the operator's browser; add the
DB-level restore test (folds into R0.1). Verify: a restore from an offsite copy succeeds in
an isolated env. Rollback: n/a (additive).

**R2.5 — Data-staleness + audit-trail reliability (P2 OPS-004/OPS-007).** Add
focus/interval revalidation (or realtime) + a "may be stale" cue; surface/queue failed audit
writes and alert on gaps. Verify: second-device edit becomes visible; a forced audit-RPC
failure is surfaced.

**R2.6 — Auth config hardening (P2/P3 SEC-002/003/004).** In the **production** Supabase
dashboard: disable public signup (single-owner), require email confirmation if kept, raise
password length/requirements to mirror the client policy, enable owner TOTP. Verify: dashboard
settings; a signup attempt is refused. (Config, not code.)

---

## Group 3 — Code quality, architecture, and test coverage

R3.1 dedupe financial helpers into `aggregate.ts` (CODE-001) and `beneficiaryLabel`/options
(CODE-010); R3.2 extract shared row types + normalizers (CODE-003); R3.3 Zod-parse DB reads
(CODE-004); R3.4 add coverage thresholds + widen scope + run in CI (TEST-006); R3.5 add the
`isSaving` guard to cancel/update (CODE-009); R3.6 remove dead files/store surface
(CODE-005/006/007); R3.7 index `audit_log` + add its append-only trigger (DB-010/DB-009);
R3.8 dedupe constraints / reconcile the unique index (DB-005). Each: pure/local, behind the
green suite; verify tsc+lint+tests; rollback = revert commit.

## Group 4 — Performance, reliability, scalability

R4.1 move report/statement totals to server-side SQL views/RPCs and windowed loading
(OPS-001) — **treat as financial** (parity tests required); R4.2 hoist a shared memoized
aggregate slice (OPS-002); R4.3 route-level `React.lazy` + vendor split (OPS-003); R4.4
auth-refresh retry on write stores (OPS-008); R4.5 offline detection + reconnect banner
(OPS-009); R4.6 self-host fonts (TEST-009). Verify: measured load/aggregation improvement
(see report 07 measurement plan); rollback = revert.

## Group 5 — Documentation, deployment, dependencies, minor UX

R5.1 real README (run/env/DB/deploy/backup) + architecture data-flow doc + DR/restore
runbook + critical-files list (OPS-013/014, TEST-012); R5.2 add a deploy job/config + a
documented rollback; stop committing `dist/` (TEST-011); R5.3 remove `tw-animate-css`
(TEST-008); R5.4 periodic online `npm audit`/Dependabot (TEST-013); R5.5 CSP + keep session
tradeoff documented (SEC-005); R5.6 amount-in-words vs 2dp reconciliation (TEST-010); R5.7
TabStrip RTL arrow keys (CODE-008); R5.8 clarify net-vs-closing labels (FIN-005). Each:
docs/config/UI-only; rollback = revert.

---

**Golden rules for whoever executes this roadmap:** (1) land Group 0 first; (2) never
refactor financial code without R0.1 parity tests proving identical outputs; (3) keep every
financial change in its own PR, separate from UI/design; (4) all DB corrections are new
append-only/corrective migrations — never edit data or rewrite history; (5) do the
live-verification reads (report 12) under explicit Owner authorization before assuming the
production schema matches the repo.
