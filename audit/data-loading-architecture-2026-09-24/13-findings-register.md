# 13 — Findings Register: data-loading architecture

**Read-only.** Findings specific to *why the browser loads so much* and how to treat it.
Severity: **P0** stop-the-line · **P1** fix before long-term reliance · **P2** plan/needed at
scale · **P3** low. Tiers: **[static]** code/SQL · **[measured]** this session ·
**[LIVE]/NOT VERIFIED** would need production/isolated DB. **Totals: 0 P0 · 0 P1 · 6 P2 · 3
P3.** No live defect — this is an architecture-for-growth finding set.

| ID | Finding | Evidence | Impact as data grows | Sev | Tier | Treatment (not done) |
|---|---|---|---|---|---|---|
| **DL-01** | **Eager global cache**: `use-workspace-store` loads 7 full tables on mount, unscoped (RLS only) | `use-workspace-store.ts:86–102`; `01`,`02` | every page holds the whole center; transfer + heap scale with total history | **P2** | [static]+[measured] | scope reads per path; slim store last (`11`,`12`) |
| **DL-02** | **Whole-roster client aggregation**: `aggregateStudents` recomputes all balances in JS on several pages | `aggregate.ts:267`; `03`,`09` | linear ~1 ms/1k lines; device-noticeable ~50k–100k (`09`) | **P2** | [measured] | server per-student/center aggregates behind parity tests (`04`) |
| **DL-03** | **Activity page loads all `audit_log` + filters in JS; table is unindexed** | `activity-workspace.tsx:76,106`; `07` (no index found) | **first** path to degrade (fastest grower, full sort each load) | **P2** | [static] | server pagination+search + `changed_at desc` index (`12` Ph1) |
| **DL-04** | **Report loads all movements; date/account filter + sums run in JS** | `financial-report-workspace.tsx:64,70–75`; `01` | report cost scales with all-time vouchers, not the chosen range | **P2** | [static] | server date-range + pagination; totals as server SUM (parity, `04`) |
| **DL-05** | **Statement/detail derive one entity from the full array** (no server per-entity read) | `students-workspace.tsx:72`, `course-detail`; `05` | holds entire ledger to show one student | **P2** | [static] | on-demand `.eq('student_id',…)` — **zero result change, proven** (`05`) |
| **DL-06** | **List search over full in-memory arrays** (students, courses, activity, report account) | `student-directory:53`, `courses-workspace:35`, `activity:106`, `financial-report:67` | search needs the whole table resident | **P2** | [static] | server-side search (`06`) |
| DL-07 | **No offline layer exists** — the full load is *not* serving offline; "for offline" cannot justify it | grep: no IndexedDB/SW/persist (`08`) | n/a (removes a false justification) | **P3** | [static] | none — informational; offline is a separate future project, not recommended |
| DL-08 | **Fractional `external_share`** must be honored to the cent by any server SUM (whole-shekel CHECK was added then dropped) | migrations `20260915093000`/`20260916110000` (prior audit, first-hand); `04` | server aggregate could diverge by fractions if it rounds mid-sum | **P3** | [static] | parity-test case; same numeric precision as the column (`04`) |
| DL-09 | **Views over base tables**: `student_statement_lines`/`financial_movements` are views; scoped-predicate speed is unproven | `07` [static]; plans **NOT VERIFIED** | a scoped read could seq-scan if the predicate doesn't push down | **P3** | [static]→[LIVE] | `EXPLAIN` in isolated DB (T1); add base-column index only if needed (`07`,`12`) |

## Relationship to the prior audits (consistent, not duplicated)

DL-01/02/03/04 restate, from the **loading** angle, what the sustainability audit filed as
**SUS-02** (load-all + client aggregation) and **SUS-03** (`audit_log` unindexed + fully
loaded). This register adds the **per-path treatment** and the **`05` zero-change proof** that
the earlier audits did not spell out. No finding here contradicts the earlier ones; severities
match (all P2/P3, **no P0/P1** for *loading* specifically — the earlier **P1** was the
test-assurance gap SUS-01, which is a separate concern).

## Verification honesty

- **Measured:** the aggregation cost curve and the per-student cheapness (`09`, `evidence/`).
- **Static:** all code/query/schema facts (quoted with file:line).
- **NOT VERIFIED IN LIVE ENVIRONMENT:** query plans/timings (`07`), network transfer sizes,
  on-device browser timings, and today's real row counts — all listed as tests **T0-ext/T1/T8**
  in `audit/long-term-sustainability-2026-09-24/10-test-plan.md`, none run this session.
- **No tests were added or run against a database.** No fix was implemented.
