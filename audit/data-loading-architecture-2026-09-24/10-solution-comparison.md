# 10 — Solution Comparison: the candidate treatments, weighed honestly

**Read-only.** Compares the realistic ways to treat the load, so the recommendation in `11`
is a *chosen* option, not a reflex. Each is judged on result-safety (does any figure change?),
size of change, firewall exposure, and the growth headroom it buys. **Nothing is implemented.**

## The options

| Option | What it does | Result change? | Firewall exposure | Effort | Headroom bought |
|---|---|---|---|---|---|
| **0. Do nothing** | keep eager full load + client aggregation | none | none | none | none — cost grows linearly (`09`) |
| **1. Statement/detail on-demand** | fetch one student's / one course's rows on selection (`.eq`) | **none — proven** (`05`) | none (read filter within owner's RLS) | **small** | removes the statement/detail dependence on full statement-lines |
| **2. Activity pagination + server search** | page + filter `audit_log` at the server; add `changed_at` index | none (same rows, paged) | none | small–med | fixes the **first** bottleneck; unbounded log stops loading whole |
| **3. Server-side list search + list pagination** | student/report/course search & lists as server queries | none (same matches) | none (unless the list's balance column is server-aggregated → option 5) | med | roster/report lists stop needing whole tables |
| **4. Windowed / lazy report** | report loads by applied date range + paginates rows | none (same predicate, moved to SQL) | none for the row list; **totals** = option 5 | med | report stops loading all movements |
| **5. Server-side financial aggregates** | center totals, per-student/-course balances, KPIs as SQL views/RPCs | **must be proven identical** (parity, `04`) | **yes — formula move**; needs [real-PG] parity tests + separate PR | **med–high** | removes the whole-dataset recompute entirely |
| **6. Slim the eager store** | store holds roster + summaries; pages fetch details | none if summaries come from option 5 (parity) | inherits option 5's | high (touches the core store) | structural end-state; biggest memory/transfer cut |
| **7. Full rewrite to a server-state lib (e.g. query cache) + offline** | replace the store model; add IndexedDB/sync | large surface; offline adds **write-safety** questions | **high** (offline writes touch money UX) | very high | not warranted by current evidence (`08`) — **rejected** |

## How they combine (they are layers, not rivals)

Options **1–4** are *pure relocations of a filter that already runs in JS* — they change **where**
the narrowing happens (browser → server), not **what** is computed, so they are result-safe by
construction and carry **no firewall risk**. Option **5** is the only one that *reproduces a
formula* elsewhere and therefore the only one behind the **parity gate**. Option **6** is the
clean structural end-state that depends on **5**. Option **7** is a different product and is
**not** recommended — the evidence (`08`) shows no offline need and the write-safety cost is
disproportionate.

## Result-safety tiers (the ordering principle for `12`)

- **Tier S (zero result change, provable now):** 1, 2, 3 (list rows), 4 (row list). Start here.
- **Tier P (parity-test required first):** 5, and the balance columns inside 3, and the totals
  inside 4.
- **Tier X (do not do on this evidence):** 7.

## Why not "just paginate everything"

Pagination is right for **lists and logs** (2, 3, 4-rows) and **wrong** for **single-entity
details** (use on-demand, option 1) and **true whole-set summaries** (use a server aggregate,
option 5; or keep full for backup). Applying one verb everywhere would either fail to fix the
aggregation cost (paging the directory still recomputes balances in JS) or needlessly complicate
small/whole-set paths. The comparison is what lets `11` assign the *right* mechanism per path.

**No option was executed. This is a decision aid only.**
