# 00 — Executive Summary (Long-Term Operational Sustainability)

**System:** «أرض كنعان» (Ard Kanaan) — single-center Arabic/RTL financial-management app
(Vite + React 19 + TypeScript + Supabase/Postgres). **Repo:** `MaherTaha203/ArdKanaan`,
commit `b6016a0`, branch `claude/21st-magic-mcp-verify-nn04qc`.
**Question answered:** can the system, *as built today*, keep running daily for years while
students, enrollments, fees, receipts, payments and history keep accumulating — **read-only,
evidence-based**. No code/DB/config change; no deploy/PR/merge; no production data touched.

## Baseline used

This audit builds on the prior `audit/full-system-audit-2026-09-24/` but **re-verified** its
material findings first-hand rather than trusting them (see `08-findings-register.md` for the
verification table). The prior conclusion — sound financial core, no P0, one P1 (server
guarantees tested only by SQL text-matching) — **still holds**.

## The one thing measured, not assumed

I ran an **isolated micro-benchmark of the actual client aggregation** (`lib/aggregate.ts`,
synthetic data, Node 22, server CPU — a modest tablet/laptop is 3–8× slower). Full data +
harness in `evidence/`:

| statement lines | students | `aggregateStudents` avg | `studentLedger`(1) | JS heap |
|---|---|---|---|---|
| 1,029 | 84 | 1.9 ms | 0.2 ms | 10 MB |
| 20,825 | 1,700 | 18.3 ms | 0.4 ms | 30 MB |
| 51,450 | 4,200 | 45 ms | 1 ms | 46 MB |
| 102,900 | 8,400 | 105 ms | 2 ms | 67 MB |
| 204,575 | 16,700 | 201 ms | 3.5 ms | 89 MB |

Client aggregation is **linear (~1 ms / 1,000 statement lines on a server CPU)**; opening a
single student statement stays cheap; **the whole-dataset recompute is the cost**, and the
raw data footprint the browser must hold/transfer grows with it.

## Verdict

**The financial engine is sound and its records are durable; the constraint on longevity is
the front-end "load-everything-and-aggregate-in-the-browser" architecture, not the database
or the money logic.** Postgres storage stays small for a decade (audit `03`/`02`); the real
limiter is the client re-loading and re-aggregating the entire history on every workspace
load, plus one unindexed, fully-loaded audit query.

**Answers to the owner's questions (Section XI):**

1. **Can it run daily for years as-is?** Yes for the **records and money** (append-only
   ledger, immutable snapshots, owner-only RLS). **Not comfortably at the UI/performance
   layer without change** — the load-all model sets a ceiling reached in a few years at
   moderate growth (evidence below).
2. **What we know works:** posting/cancellation firewall design, conserved splits,
   single-sourced posted-only aggregation, identical screen/print, correct pagination
   (no silent truncation), fast single-statement open, clean build/tests (`tsc`0, 221 unit,
   25 e2e, 0 audit — all re-run this session).
3. **What is NOT proven:** runtime behavior of the RPCs/triggers/views on real data
   (tested only by SQL text — P1), production schema/RLS state, and real DB performance —
   all **NOT VERIFIED IN LIVE ENVIRONMENT**.
4. **First bottleneck + evidence:** the **audit/activity page** (`audit_log` is the
   fastest-growing table, **unindexed**, and loaded in full) and the **every-load workspace
   transfer + `aggregateStudents`**. At medium growth these reach ~50k–100k statement lines
   in ≈3–5 years → ~0.3–0.8 s aggregation on a modest device *plus* multi-MB cold transfer,
   before any DB limit. Evidence: the benchmark table + `03`/`02`.
5. **Financial/historical risks from reactivation:** no money-corruption found, **but** two
   correctness items interact with re-enrollment/legacy data — fractional external share
   (FIN-001) and a second source of truth for course paid/remaining (CODE-002/FIN-002) that
   can display a wrong number for same-named courses; and history immutability is enforced by
   triggers, not the client — verify on live data (`04`).
6. **Must fix before long-term reliance:** build the executable DB test net (P1), add an
   error boundary + monitoring, an index on `audit_log`, and an automated/offsite/**tested**
   backup+restore. (`09`)
7. **Can defer until a size threshold:** the server-side aggregation / windowed-load rework
   and bundle splitting — needed as data grows past the tens-of-thousands range, not on day
   one. (`09`)
8. **Live data/tests needed for a firm verdict:** production row counts + schema state, an
   isolated Postgres for `EXPLAIN (ANALYZE)` and the RPC/restore behavioral tests, and a
   real restore rehearsal. (`10`, `11`)
9. **Safe operating size today:** cannot be stated as a hard number without live benchmarks;
   from the client benchmark, the app stays snappy up to roughly the **low-tens-of-thousands
   of statement lines** (≈1–2 years medium growth), degrades gradually after, and the
   **audit page degrades first**. This is a modelled estimate, not a measured production limit.
10. **Lowest-risk path to a 10-year system:** (a) test net + monitoring + `audit_log` index +
    tested backups now; (b) then move totals/statements to server-side SQL and windowed
    loading; (c) then the correctness/hardening decisions — each behind parity tests, separate
    from UI. (`09`)

**Do not read "build/tests pass" as "ready for 10 years."** The suites pass, but they do not
execute the server guarantees and no production-scale performance test has been run.

## Risk headline (0 P0 · 1 P1 · … see `08`)

P1: server money-safety tested only by SQL text-matching. P2 sustainability: load-all client
aggregation ceiling; unindexed fully-loaded `audit_log`; no monitoring/error-boundary; manual
untested backups; narrow CI; fractional share & course-paid divergence (governance).
