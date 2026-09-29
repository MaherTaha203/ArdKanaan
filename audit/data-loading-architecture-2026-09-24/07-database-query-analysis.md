# 07 — Database Query Analysis: what the server would need to support scoped reads

**Read-only, static.** Before recommending server-side filtering/aggregation, this report
checks whether the database *can* serve those scoped reads efficiently — i.e. what is a view vs
a table, and which indexes exist. **No query plan was measured**: there is no isolated/live DB
in this session, so every performance claim below is **NOT VERIFIED IN LIVE ENVIRONMENT** and
is marked `[needs EXPLAIN]`. Facts about schema shape are **[static]** (read from
`app/supabase/migrations/*.sql`, 53 migrations).

## Shape of the read surface (verified [static])

- **`student_statement_lines` is a VIEW** (`create or replace view public.student_statement_lines`)
  — not a base table. It is composed over the receipt/allocation/enrolment tables.
- **`financial_movements` is a VIEW** (`create or replace view public.financial_movements`).
- **`audit_log` is a base TABLE** (`create table if not exists public.audit_log (…)`).
- Base tables carry these indexes (verified [static]):
  - `enrollments`: `(student_id)`, `(course_id)`, unique `(student_id, course_name)`, unique
    `(student_id, course_id)`.
  - `fee_obligations`: `(student_id)`, `(enrollment_id)`, `(course_id)`.
  - `receipt_allocations`: `(enrollment_id)`, `(fee_obligation_id)`, `(receipt_id)`.
  - **`audit_log`: no index found** in any migration (confirms prior DB-010 / SUS-03).

## What this means for each proposed scoped read

### Student statement `.eq('student_id', S)` on the view (`05`, `06`)
`student_statement_lines` is a view, so a `student_id` predicate must **push down** to its base
tables. The base rows are reachable via `enrollments(student_id)` (indexed) and
`fee_obligations(student_id)` (indexed); `receipt_allocations` is indexed by `enrollment_id`.
**Whether the planner produces an index scan for a `student_id` filter on the view is
`[needs EXPLAIN]`** — it depends on the exact view definition and join order. *Correctness is
guaranteed regardless* (`05` is a pure-filter equivalence); only the *speed* of the scoped read
is unverified. If a plan turns out to seq-scan, the remedy is an index on the base column the
view exposes as `student_id` — a **corrective, additive migration** (Owner-authorized, not part
of this audit).

### Report date-range `.gte/.lte voucher_date` on `financial_movements` (`06`)
Also a view. A `voucher_date` range predicate must push down to the underlying
`financial_movement`/receipt tables. **`[needs EXPLAIN]`** whether an index supports it; today
there is no evidence of a `voucher_date` index. Per prior roadmap (B3), add such an index
**only once the server-side filter exists** — never speculatively.

### Activity page pagination + search on `audit_log` (`06`, first win)
`audit_log` is an **unindexed table** ordered `changed_at desc`. A paged query
(`order by changed_at desc … range(from,to)`) currently forces a **full sort of the whole
table** every load — this is the single clearest DB inefficiency and it worsens fastest
(`audit_log` grows with every action). The natural fix is the prior **A4** index
`audit_log(changed_at desc)` (+ `(entity, entity_id)` for entity views), a corrective additive
migration. Effect on the plan is **`[needs EXPLAIN]`** but the direction is unambiguous.

### Directory balance column as a server aggregate (`06`, F3)
Would be a per-student `SUM`/breakdown expressed as a view or RPC over the same base tables
(indexed by `student_id`). Cost **`[needs EXPLAIN]`**; correctness gated by the **F3 parity
test** (`04`, `10`). Do **not** implement before that test exists.

## Honest limits of this analysis

- **No `EXPLAIN (ANALYZE)` was run** (no DB access). The plan shapes, buffer counts, and
  timings that would confirm whether each scoped read is index-served are listed as **T1** in
  `audit/long-term-sustainability-2026-09-24/10-test-plan.md` and remain **NOT VERIFIED IN LIVE
  ENVIRONMENT**.
- **No production row counts** are known, so "how slow today" cannot be stated — only the
  growth direction from the schema shape.
- Views-over-tables mean the app's "table" reads are already joins; a scoped predicate's
  efficiency is a planner question, not a guess to assert.

## Rule that follows

Recommend the **index additions and server predicates as corrective, additive migrations** to
be **validated by EXPLAIN in an isolated DB first** (`12`). No index is added here; no query is
changed here. The financial firewall is untouched — these are read-path indexes and read-only
views.
