# 09 — Performance Evidence: what was measured, and what it does and does not prove

**Read-only.** Quantifies the cost of the current load-everything + client-aggregate design
using a **real, isolated micro-benchmark of the actual `app/src/lib/aggregate.ts`**. States
plainly what is **[measured]** and what is **NOT VERIFIED IN LIVE ENVIRONMENT**. Raw output:
`evidence/aggregate-benchmark.txt`; harness: `evidence/aggregate-benchmark-harness.ts`.

## Method (reproducible)

Copied `aggregate.ts`, stripped its type-only import, concatenated the harness, and ran under
Node (`--experimental-strip-types`) on this session's **server CPU**. Synthetic data at the
task's requested volumes (1k, 5k, 10k, 25k, 50k, 100k, 200k statement lines) with proportional
students/enrolments/fees. Each aggregation run repeatedly; average/min/max recorded; JS heap
sampled via `process.memoryUsage().heapUsed`. This exercises the **exact production
aggregation code** — not a re-implementation.

## Results (measured, server CPU)

| statement lines | students | `aggregateStudents` avg/min/max (ms) | `studentLedger` one student (ms) | JS heap (MB) |
|---|---|---|---|---|
| 1,005 | 82 | 4.5 / 1.2 / 7.8 | 0.1 | 10 |
| 4,998 | 408 | 7.7 / 3.6 / 23.3 | 0.1 | 12 |
| 9,996 | 816 | 16.3 / 7.5 / 33.3 | 0.2 | 13 |
| 25,003 | 2,041 | 35.4 / 19.4 / 84.6 | 0.6 | 26 |
| 50,005 | 4,082 | 50.6 / 47.9 / 51.8 | 1.1 | 48 |
| 99,997 | 8,163 | 100.7 / 93.7 / 111 | 2.3 | 60 |
| 200,006 | 16,327 | 211.4 / 186 / 232.4 | 3.2 | 85 |

## What this proves [measured]

1. **`aggregateStudents` is linear** in total statement lines — ~**1 ms per 1,000 lines** on
   server CPU. It is the whole-roster recompute and the dominant client cost (`03`).
2. **Per-student work is cheap and stays cheap** — `studentLedger` is **≤ 3.2 ms at 200k**
   total lines, because it filters to one student first (`05`). This is the quantitative basis
   for the statement-isolation and on-demand recommendations.
3. **Heap grows with the cache** — ~10 MB at today's scale to ~85 MB at 200k lines, i.e. the
   browser holds the whole center in memory (plus the arrays' transfer). This is the memory
   cost of the eager store (`01`).
4. The design is **fine today (small data)** and degrades **gradually**, not suddenly.

## What this does NOT prove (explicit limits)

- **Not on-device / in-browser.** Numbers are Node on server CPU. A real operator device
  (mid-range laptop/phone) is typically **3–8× slower**, and React reconciliation, DOM paint,
  and RTL layout add cost **not** captured here. So real "feels slow" thresholds are **earlier**
  than these ms suggest — **NOT VERIFIED IN LIVE ENVIRONMENT** (browser profiling is test **T0
  extension** / **T8** in the prior test plan).
- **Not the network transfer.** The multi-MB cold download of full history on every load is
  **not measured** here (no egress trace). Its size at each volume is **T8**, unrun — **NOT
  VERIFIED**.
- **Not the DB side.** No `EXPLAIN`/query timing (`07`) — **NOT VERIFIED**.
- **Not today's real volume.** No production row counts, so where the center *is* on this curve
  is unknown — **NOT VERIFIED**. The table is a *shape*, not a claim about the live system.

## Reading the evidence against the task

- It confirms the problem is **growth-driven**, not a live defect (**no P0**): the cost is
  invisible now and becomes device-noticeable in the **~50k–100k line** band (prior model:
  ~Year 3–5 at Medium growth), with the **activity page degrading first** because `audit_log`
  grows fastest and is unindexed (`07`, `08`).
- It confirms **which treatments pay off**: cutting the per-page input to *one student* / *one
  page* / *one date range* removes the linear term for those screens, while center totals and
  backup (true whole-set needs) are handled by a **server aggregate** / **kept full**, not by
  shipping every row.

**No production system was touched; the benchmark ran only against a copy of the pure
aggregation code in an isolated process.**
