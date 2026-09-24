# 11 — Remediation Roadmap (proposed, NOT executed)

Ordered for **long-term sustainability**: fix what makes future change safe first, then
correctness, then durability. **No fix was implemented.** Financial fixes are kept separate
from UI, and **no financial refactor is safe without tests that first prove identical
outputs** (the audit's own rule).

> **Sequencing rule:** Group 0 lands before most of Groups 1–2, because today there is no
> executable safety net to prove a financial change is behaviour-preserving (P1 TEST-001).
> Do not refactor money code until it exists.

## Group 0 — Make change safe (prerequisite; highest sustainability leverage)

- **R0.1 (resolves P1 TEST-001/FIN-006):** executable DB tests in CI — extend
  `external_share_layers.sh` or add pglite/testcontainers to exercise the posting/
  cancellation/fee/restore RPCs + triggers + views (conservation, overpayment rejection,
  idempotency dedupe, cancellation reversal, RLS denial, restore guards, fractional vs whole).
  Keep the text tests as a secondary signal. *Deps: none. Risk: CI infra only. Verify: fails
  on a deliberately broken WHERE. Rollback: remove job.*
- **R0.2 (TEST-002):** trigger CI on the default branch and all PRs.
- **R0.3 (OPS-005/006):** add an error boundary + remote error tracking.
- **R0.4 (CODE-013/TEST-003, TEST-005):** enable `strict` + `noUncheckedIndexedAccess` and
  `recommendedTypeChecked`, fix fallout incrementally behind R0.1.

## Group 1 — Financial-correctness (money output can be wrong/ambiguous)

*Each needs a governance decision + R0.1 parity tests before code changes.*
- **R1.1 (FIN-001/DB-001):** decide nearest-shekel-with-remainder-to-institute vs formally
  relaxing the whole-shekel rule for derived sub-amounts (ADR). Corrective migration only.
- **R1.2 (CODE-002/TEST-016; adjacent FIN-002):** make `courses.ts` reuse
  `studentCourseBreakdown`; reconcile the `student_statement_lines` legacy/allocated
  partitions. Add same-named-enrollment + fee-name-collision tests; assert Course view ==
  ledger.
- **R1.3 (FIN-003):** revoke direct `INSERT` on `receipt_vouchers`; keep the RPC.

## Group 2 — Access defense-in-depth · DR · data integrity

- **R2.1 (SEC-001/DB-011):** bring lifecycle RPCs to DEFINER + `is_owner()` + revoke.
- **R2.2 (DB-002/DB-004):** align `restore_center_data` with standalone fees; extend the
  shrink guard — before enabling `20260919130000` in production.
- **R2.3 (DB-003, SEC-006, migration drift):** Owner-authorized **read-only** production
  checks — applied migration set, `financial_movements` grant, lifecycle-RPC ACL + `students`
  policy, RLS on every table (Security Advisor), and the DB-003 direct-fee count; re-add the
  missing grant via a corrective migration.
- **R2.4 (OPS-010/011/012):** automated, offsite, encrypted, retained backups; DB-level
  restore test (folds into R0.1).
- **R2.5 (OPS-004/007):** focus/interval revalidation + "stale" cue; surface/queue failed
  audit writes + alert.
- **R2.6 (SEC-002/003/004):** production dashboard — disable public signup, email
  confirmation, server password policy, owner TOTP.

## Group 3 — Code quality, architecture, coverage

R3.1 dedupe financial helpers + `beneficiaryLabel` (CODE-001/010); R3.2 shared row
types/normalizers (CODE-003); R3.3 Zod-parse DB reads (CODE-004); R3.4 coverage thresholds +
CI (TEST-006); R3.5 `isSaving` guard on cancel/update (CODE-009); R3.6 remove dead
files/store surface (CODE-005/006/007); R3.7 index `audit_log` + append-only trigger
(DB-010/DB-009); R3.8 dedupe constraints / unique index (DB-005).

## Group 4 — Performance, reliability, scalability

R4.1 move report/statement totals to SQL views/RPCs + windowed load (OPS-001; **treat as
financial**, parity tests); R4.2 shared memoized aggregate (OPS-002); R4.3 route-level lazy +
vendor split (OPS-003); R4.4 write-path auth retry (OPS-008); R4.5 offline handling (OPS-009);
R4.6 self-host fonts (TEST-009).

## Group 5 — Documentation, deployment, dependencies, minor UX

R5.1 real README + architecture data-flow doc + DR/restore runbook + critical-files list
(OPS-013/014, TEST-012); R5.2 deploy job/config + documented rollback; stop committing
`dist/` (TEST-011); R5.3 remove `tw-animate-css` (TEST-008); R5.4 periodic online audit/
Dependabot (TEST-013); R5.5 CSP + documented session tradeoff (SEC-005); R5.6 words vs 2dp
(TEST-010); R5.7 TabStrip RTL arrows (CODE-008); R5.8 net-vs-closing labels (FIN-005).

**Golden rules for whoever executes this:** land Group 0 first; never refactor financial
code without R0.1 parity tests; keep every financial change in its own PR separate from UI;
all DB corrections are new append-only/corrective migrations (never edit data or rewrite
history); do the live-verification reads (report 12) under explicit Owner authorization.
