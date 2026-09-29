# 03 — Database Scalability

**Static** (migrations + code). Live `EXPLAIN (ANALYZE)` is **NOT VERIFIED IN LIVE
ENVIRONMENT** — see the plan in `10`. No index was created; recommendations are tied to
actual queries below, not to "a column exists."

## Growth-table inventory & index adequacy

| Table | Growth class | Read patterns (from code) | Indexes present | Gap |
|---|---|---|---|---|
| students | steady | full load; name/phone/id search **in JS** after load | PK | none needed for load; search is client-side |
| enrollments | steady | full load; grouped by student/course in JS | `(student_id)`, `(course_id)`, unique `(student_id,course_id)` (partial/full drift DB-005) | adequate |
| receipt_vouchers | fast | full load via view; edit/cancel by `id` | `(student_id)`, `(voucher_date)`, composite `(student_id,course_name,voucher_date,voucher_number)`, partial-unique `idempotency_key` | adequate |
| receipt_allocations | fast (≈ statement lines) | joined in `student_statement_lines` view | `(receipt_voucher_id,created_at)`, `(enrollment_id)`, `(fee_obligation_id)`, unique target | adequate |
| fee_obligations | moderate | full load; grouped in JS | `(student_id,course_id,created_at)`, `(enrollment_id,created_at)`, `(course_id)` | adequate |
| financial_movement_ledger | fast | full load via `financial_movements` view; report filters **in JS** | `(voucher_date,created_at)`, `(source_type,source_id)` | adequate for load; date-range is client-side |
| payment_vouchers | steady | full load; cancel by id | `(voucher_date)` (+ idempotency) | adequate |
| **audit_log** | **fastest** | **full load, ordered `changed_at desc`, filtered by entity/source in JS** (`activity-workspace.tsx`) | **NONE** | **missing** `(changed_at desc)` and `(entity, entity_id)` — DB-010 |

**Key insight:** because the app **loads whole tables and filters/sorts/aggregates in JS**,
most per-column indexes are not exercised by the read path — the DB mostly does *sequential
full-table returns*, which PostgREST paginates. So index tuning helps **only** the queries
that actually filter server-side. Today the only server-side `order`/filter on a fast-growing
table without an index is **`audit_log` ORDER BY `changed_at`** → a sort of the whole table on
every activity-page load. That is the one clearly justified index (cost: one b-tree, modest
write overhead on an append-only log).

## Query-pattern risks (evidence)

1. **Load-everything-to-the-browser** (`use-workspace-store.ts` → `fetchAllRows` on 7 tables):
   the dominant scalability limiter. Not a DB-plan problem — a transfer + client-memory +
   client-aggregation problem (quantified in `02`/`05`). **No N+1** (bulk queries, not
   per-row).
2. **Correct pagination, no silent truncation** (verified first-hand, `fetch-all.ts`): loops
   `.range(from, from+999)` until a short page; `MAX_PAGES=10_000` guard. Its own comment:
   *"A financial system must never silently operate on the first 1000 rows."* → **totals do
   not under-count** as data grows, as long as `fetchAllRows` is used. ✅
3. **Un-paginated `.select()` scan:** most are single-row lookups by `id`/`student` (bounded)
   — `use-money-in-store` (statement line/student lookup), `use-voucher-admin-store`
   (`.eq('id')`), `use-money-out-store`. The exceptions worth noting: **`backup-history.tsx:41`**
   (`.select(...).order(...)` on `audit_log`-backed events without `fetchAllRows`) → capped at
   PostgREST's 1000-row default, so the backup-history list silently shows only the newest
   ~1000 events over time (cosmetic, not financial). Activity page **does** use `fetchAllRows`
   (paginated).
4. **Report period/account filters run in JS** over the fully-loaded array
   (`financial-report-workspace.tsx`) — so a "last-year report" still transfers and scans the
   entire history. Server-side filtered report queries would cut transfer dramatically as
   data grows.
5. **Views:** `student_statement_lines` uses window functions (running `remaining_balance`)
   over allocations; `financial_movements` filters unreversed originals. Their cost scales
   with the table; because they are `SELECT *`-loaded, the window computation runs across the
   whole set each load. Server-side, per-student parameterization would bound it.

## Postgres / Supabase limits

Storage stays small for a decade (`02`); the relevant platform limits (connection pool,
statement timeout, egress) are **NOT VERIFIED IN LIVE ENVIRONMENT** — they depend on the plan
and are checkable only against the live project (`config.toml` reflects local CLI, not the
hosted plan). Egress is the one to watch: repeatedly transferring the full history (tens of
MB) on every cold load multiplies bandwidth as data + user-sessions grow.

## Recommendations (evidence-tied, NOT implemented)

| # | Recommendation | Justified by | Write/storage cost |
|---|---|---|---|
| I1 | Index `audit_log (changed_at desc)` (+ optional `(entity, entity_id)`) | activity page sorts the whole table (query #… above); DB-010 | one b-tree; modest overhead on an append-only log |
| S1 | Move report totals/statements to **server-side SQL** (parameterized views/RPCs) + windowed/lazy loading | queries #1, #4, #5; `02` benchmark | app change, no schema change; removes the ceiling |
| S2 | Paginate `backup-history` (use `fetchAllRows` or an explicit limit + "load more") | query #3 | none |
| I2 | Add composite indexes **only after** S1 introduces server-side filters that need them (e.g. `financial_movement_ledger (voucher_date)` for date-range reports) | avoid unused indexes now | defer until the query exists |

> Do **not** add indexes speculatively today: with the load-all pattern they would sit
> unused while still taxing writes. Indexes become valuable **after** S1 moves filtering to
> the server.
