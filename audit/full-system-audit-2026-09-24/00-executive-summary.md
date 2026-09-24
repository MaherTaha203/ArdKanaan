# 00 — Executive Summary

**System:** «أرض كنعان» (Ard Kanaan) — a single-operator Arabic/RTL financial-management app
for a learning center (Vite + React 19 + TypeScript + Supabase/Postgres).
**Audit:** full-system structural audit, 16 phases + cross-verification, **read-only**.
**Date:** 2026-09-24. **Auditor branch:** `claude/21st-magic-mcp-verify-nn04qc` (clean; the
audit modified **no** tracked file, DB, or config — only the `audit/` folder was created).

---

## Overall verdict

**The system is well-engineered and, in its financial core, sound.** No P0 (critical)
finding and **no proven money-corruption, secret leak, or data-loss defect** was found in
static analysis. The financial design is genuinely strong: **RPC-only writes**, an
**append-only ledger** with enforced immutability and reversal-not-mutation, **owner-only
RLS** on every table, conserved receipt splits, **posted-only** aggregation, and **identical
screen/print** formulas. The anon-key-only client with Postgres RLS as the boundary is the
correct Supabase security posture, and no service-role secret, XSS sink, or SQL-injection
surface exists. Code is clean (strict-clean `tsc`/lint, small typed files, 77 ADRs of
decision provenance).

**But "green build" overstates verified safety, and the weaknesses cluster in three areas:**

1. **Test integrity (the one P1).** The server-enforced money guarantees — posting
   firewall, overpayment ceilings, idempotency, external-share rounding, cancellation,
   restore — are **"tested" by grepping the migration SQL text**, not by executing it (15/40
   unit files). A logic error in that SQL passes CI undetected. For a financial system this
   is the highest-priority risk (TEST-001 / FIN-006). The one real DB test isn't in CI.
2. **Operational resilience & recovery.** No React error boundary (one throw white-screens
   the app), no error monitoring/alerting/tracing, no realtime/staleness handling,
   fire-and-forget audit writes, and a backup that is a **manual, local, unencrypted browser
   download** with an **untested server restore path**. CI runs on only two hard-coded
   branches (the current and default branches get **no CI**). No deploy config or rollback.
3. **Operational documentation.** The README is the stock Vite template and `docs/` (rich in
   governance/ADRs) has **no** run/deploy/backup/DR/data-flow runbook — high code-handover
   readiness, low operational-handover readiness.

Two **financial-correctness** items warrant a governance decision (not urgent, no money
lost): a deliberately **fractional `external_share`** that diverges from the frozen
whole-shekel rule (FIN-001/DB-001), and a **second source of truth for course paid/remaining**
(`courses.ts` vs `aggregate.ts`) that can display a wrong number for same-named enrollments
or fee-name collisions (CODE-002; adjacent FIN-002). One **security defense-in-depth** gap:
two student-lifecycle RPCs lack the `is_owner()` guard every other mutation has (SEC-001).

## Findings at a glance

| Severity | Count | Examples |
|---|---|---|
| **P0** | **0** | — |
| **P1** | **1** | TEST-001/FIN-006 — money-safety SQL verified only by text-matching |
| **P2** | 24 | FIN-001 fractional share · CODE-002 course paid/remaining divergence · SEC-001 lifecycle RPC guard · DB-002 restore vs standalone fees · OPS-005 no error boundary · OPS-006 no monitoring · OPS-010/011 backup manual/untested · TEST-002 narrow CI · CODE-013 strict off |
| **P3** | 33 | duplicated labels/normalizers, dead code, `audit_log` indexing, localStorage session, unused dep, README, TabStrip RTL keys, … |

Full register: `10-findings-register.md`. Remediation plan: `11-remediation-roadmap.md`.

## Critical proven results (evidence-backed)

- ✅ **Money stored correctly** as `numeric(x,2)` everywhere — **no float** for any amount;
  timestamps `timestamptz` (report 02).
- ✅ **Financial firewall holds against presentation work:** no UI/nav/icon change can reach
  the ledger or totals (immutable financial fields; edits touch only notes/payer) — directly
  validating the current UI work stream (report 03 isolation matrix).
- ✅ **Owner-only, server-enforced access;** no client-trusted identity/amounts; no
  service-role secret in the bundle (report 04).
- ✅ **Suites pass:** 221 unit, 25 e2e, `tsc -b` + lint clean, offline `npm audit` 0 vulns —
  but see the P1 on what those tests actually exercise.
- ⚠️ **The most important negative result:** the tests do **not** execute the server money
  logic, so passing tests are **not** proof the financial engine is correct at runtime.

## Scope limitations (must be closed with Owner-authorized live access)

The live production database, Supabase Auth dashboard, and hosting were **not accessible**,
so all DB/RLS/financial-runtime checks are **static**. Nothing in a blocked area is treated
as proven-sound. The consolidated live-verification list (applied migrations, runtime RPC
behavior, row-level integrity, applied RLS/ACL + Security Advisor, production Auth settings,
`owner_identity` seeding, perf benchmarks, a real restore rehearsal) is in
`12-audit-completion-matrix.md`.

## Recommended first moves (do **not** start with financial refactors)

1. **Build the executable safety net** (real-Postgres DB tests in CI) — R0.1. Nothing money-
   related should be refactored until this exists.
2. **Fix CI triggers**, add an **error boundary + monitoring**, enable **`strict`** — R0.2–R0.4.
3. **Run the Owner-authorized live-verification reads** (report 12) to close the static-only gaps.
4. Only then take the financial-correctness decisions (FIN-001, CODE-002) and the SEC-001 /
   DB-002 hardening — each in its own PR, separate from UI, behind parity tests.

Reports: `01`–`09` (per-domain), `10` (register), `11` (roadmap), `12` (completion),
`13` (handover).
