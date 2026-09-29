# 05 — Performance Results

**What was actually measured vs what was not.** No production data and no isolated DB were
available, so **no server-side/DB performance and no browser stress test was run** — those are
**NOT VERIFIED IN LIVE ENVIRONMENT** (plan in `10`). One thing **was** measured: the client
aggregation, in isolation, with synthetic data.

## Measured — client aggregation micro-benchmark [real, isolated]

**Method:** copied `app/src/lib/aggregate.ts` unchanged into a scratch dir (removed only its
type-only import), generated synthetic students/enrollments/statement-lines/fees, and timed
the two hot functions with `performance.now()` (5 runs each, warm). Environment: **Node
22.22, server-class CPU, single-threaded.** Harness + raw output in `evidence/`
(`aggregate-benchmark.ts`, `aggregate-benchmark.txt`). **Data is synthetic — these are not
production figures.**

| statement lines | students | enroll | `aggregateStudents` avg/min/max (ms) | `studentLedger`(1) (ms) | JS heapUsed (MB) |
|---|---|---|---|---|---|
| 1,029 | 84 | 252 | 1.9 / 1.5 / 2.2 | 0.2 | 10 |
| 5,145 | 420 | 1,260 | 4.9 / 3.8 / 7.7 | 0.1 | 12 |
| 20,825 | 1,700 | 5,100 | 18.3 / 15.4 / 20.6 | 0.4 | 30 |
| 51,450 | 4,200 | 12,600 | 45 / 43.8 / 46.8 | 1 | 46 |
| 102,900 | 8,400 | 25,200 | 104.6 / 92.1 / 129.1 | 2 | 67 |
| 204,575 | 16,700 | 50,100 | 201.4 / 187.6 / 238.1 | 3.5 | 89 |

**Findings (evidence-based):**
- `aggregateStudents` is **linear**, ≈ **1 ms per 1,000 statement lines** on this CPU.
- `studentLedger` (open one statement) is **near-constant and cheap** (≤ 3.5 ms even at 200k
  lines) → **opening a student account never becomes a bottleneck**, even after a decade.
- JS heap for the **raw arrays alone** reaches ~**89 MB at ~200k lines** — before React/DOM
  overhead; this is the in-memory + over-the-wire footprint that grows with history.

**Extrapolation to devices (stated as estimate, not measured):** a mid/low-range tablet or
laptop is typically **3–8× slower** than this server CPU. So `aggregateStudents` ≈ **0.3–0.7 s
at 90k lines (Medium Year 10)** and **0.6–1.6 s at 225k lines (High Year 10)** — per load,
per mounted tab (OPS-002), re-running on every data change. Perceived latency is **higher
still**, because the cold load must first transfer + JSON-parse tens of MB.

## Not measured (and why) — with the plan

| Operation (Section V list) | Status | Why blocked / how to measure |
|---|---|---|
| Student search, open profile, students-in-a-course | NOT MEASURED | run in a browser against seeded data (search is client-side over the loaded array) |
| Open account statement | Partly (client `studentLedger` measured: fast) | full render needs a browser profile |
| Register student / enrollment / course / reactivate / receipt | NOT MEASURED | requires an isolated Postgres to time the RPCs + triggers |
| Financial report (short / 1-yr / multi-yr) | NOT MEASURED | dominated by full-history transfer + JS filter; measure cold-load size/time at seeded volumes |
| Home dashboard + KPIs | NOT MEASURED (client aggregation cost is the benchmark above) | browser profile + network trace |
| `EXPLAIN (ANALYZE, BUFFERS)` on read queries/views | **NOT VERIFIED IN LIVE ENVIRONMENT** | needs an isolated DB with seeded data; never run on write functions or production |
| Cold-load transfer size/time, Web-Vitals, memory on device | NOT MEASURED | needs a browser + representative dataset |

**No performance target is asserted as a system spec.** If used, targets are **test goals**,
not current guarantees. The `10-test-plan.md` gives the reproducible harness (seed sizes,
runs, P95, what to record) to turn these blanks into measured numbers in an isolated env.

## Conclusion

The one measured dimension confirms the model in `02`: **the client whole-dataset
aggregation is the scaling cost**, linear in statement lines, becoming device-noticeable in
the **50k–100k range (~Year 3–5 Medium)**; **single-record operations stay fast**. DB-side
and end-to-end performance remain **unproven** and require the isolated-environment plan.
