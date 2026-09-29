# 00 — Executive Summary: Why the Browser Loads So Much Data

**Repo:** `MaherTaha203/ArdKanaan`, commit `cbf7dbb`, branch
`claude/21st-magic-mcp-verify-nn04qc`. **Read-only architecture investigation.** No code, DB,
migration, RPC, trigger, view, RLS, Supabase/CI/CD/deploy, PR, merge, or production data was
changed. No fix was started.

## The answer, directly

**Why does the browser load this data?** Because the app is built around a **single eager
global cache** — `app/src/store/use-workspace-store.ts` fetches **all rows of 7 growing tables**
(`students`, `student_statement_lines`, `financial_movements`, `cancelled_vouchers`,
`courses`, `enrollments`, `fee_obligations`) once on app mount (`app-shell` effect,
`if (!loaded) load()`), each via `fetchAllRows` (paginated to completion — no server filter,
no date scope, no limit). **Every page then derives its view — lists, search, balances,
statements, reports — purely in JavaScript from that in-memory cache.** The activity page
separately loads **all of `audit_log`** the same way.

So the load is caused by three design choices, **not** by a data requirement:
- **(D) store design** — one "load-the-whole-center-into-memory" cache shared by all pages;
- **(C) client aggregation** — balances/totals/statements are computed in the browser
  (`app/src/lib/aggregate.ts`) over the full arrays;
- **(B) client search/filter** — student/report/activity search runs `.filter()` over the
  loaded arrays.

**Should it load all this? Mostly no.** Verified first-hand: **there is no offline capability**
— no IndexedDB, no service worker, no local persistence (only the Supabase auth session +
app settings live in `localStorage`). **So "we load everything for offline" is not true here;
offline is not the reason and cannot justify the full load** (`08`). Only two things
*genuinely* need every row: the **backup export** (correct — it must dump everything) and
**center-wide totals/KPIs** — and even those can be a single **server aggregate** instead of a
full client load. Lists, search, and per-student/per-course/per-period views do **not** need
the whole dataset in the browser.

## Evidence that this is a growth problem, not a today problem

Isolated benchmark of the **actual** `app/src/lib/aggregate.ts` (synthetic data, server CPU; a modest
device is 3–8× slower — full data in `evidence/`):

| statement lines | `aggregateStudents` | `studentLedger` (one student) | JS heap |
|---|---|---|---|
| 1,005 | 4.5 ms | 0.1 ms | 10 MB |
| 25,003 | 35.4 ms | 0.6 ms | 26 MB |
| 50,005 | 50.6 ms | 1.1 ms | 48 MB |
| 99,997 | 100.7 ms | 2.3 ms | 60 MB |
| 200,006 | 211.4 ms | 3.2 ms | 85 MB |

Aggregation is **linear** (~1 ms/1,000 lines); **one student's statement is always cheap**.
The cost is the *whole-dataset* recompute + the multi-MB cold transfer of all history on every
load. **Today (small data) this is not a problem; it becomes one as history accumulates.**

## Answers to the 14 questions (details in `10`–`14`)

1. **Why loaded today?** eager global cache + client aggregation + client search (not offline).
2. **What has no real reason to be fully loaded?** all `student_statement_lines` (only one
   student's are ever needed at once), all `financial_movements` (reports need a period), all
   `audit_log` (a log is inherently paged), `enrollments`/`fee_obligations` at full scope.
3. **What should stay as-is?** the **backup export** (needs all rows); **courses** (small,
   slow-growing); center KPIs *conceptually* need "all" but should become a server aggregate.
4. **Where pagination?** the **activity/audit page** and the **students list** (list + "load
   more"), plus the report movement list.
5. **Where server-side search?** student search, activity search, account/party search.
6. **Where move aggregation to Postgres?** center totals, per-student balance for the
   directory column, per-course rollups, dashboard KPIs — **each only after a parity test**.
7. **Where on-demand loading?** the **student statement** (load the selected student's rows
   on selection), **course detail** (selected course), reports (on date-range apply).
8. **Offline data to keep local?** **None today** — there is no offline layer; the full load
   is not serving offline.
9. **Safe to change without touching money?** the **student statement isolation** (`05`) —
   provably identical output — and the on-demand/list/search/activity paths, which don't
   change any formula.
10. **Needs parity tests first?** every case that moves a **financial** aggregate to SQL
    (totals, per-student/per-course balances, external-share split) — `04`, `14`.
11. **Start now or at a size?** start the **non-financial, zero-result** changes now (statement
    isolation, activity pagination, student search); defer the financial DB-aggregation moves
    until data warrants **and** parity tests exist.
12. **Smallest change, biggest win?** **student-statement isolation** — load one student's
    rows instead of everyone's, with **zero** result change (`05`).
13. **Do not touch:** the financial formulas, the append-only ledger, the posting/cancellation
    firewall, RLS/owner model, the backup completeness guarantee.
14. **Correct order:** `12` — isolation & pagination & search (safe) → server aggregates
    behind parity tests → windowed loading → optional store refactor.

**No P0.** This is an architecture-for-growth finding, not a live defect.
