# 01 — Data Flow Map: from database to browser to page

**Read-only.** Traces the exact path a byte of financial data takes from Postgres to a
rendered figure, so the *cause* of the large load is located before any treatment is named.
Evidence tier: **[static]** (code read first-hand at commit `cbf7dbb`).

## The one entry point

```
app mount
  └─ app/src/components/shell/app-shell.tsx   effect:  if (!loaded) load()
       └─ useWorkspaceStore.load()            app/src/store/use-workspace-store.ts:77
            ├─ Promise.all #1  (lines 86–91)
            │    ├─ loadStudents(supabase)                         → students          (order name)
            │    ├─ fetchAllRows(student_statement_lines …)        → statementLines    (order voucher_date, voucher_number)
            │    ├─ fetchAllRows(financial_movements …)            → movements         (order voucher_date, created_at)
            │    └─ fetchAllRows(cancelled_vouchers …)             → cancelledVouchers (order cancelled_at desc)
            └─ Promise.all #2  (lines 98–102)
                 ├─ fetchAllRows(courses …)                        → courses           (order name)
                 ├─ fetchAllRows(enrollments …)                    → enrollments       (no order)
                 └─ fetchAllRows(fee_obligations …)                → feeObligations    (order created_at)
```

Every arm calls `fetchAllRows` (`app/src/lib/fetch-all.ts`), which loops `.range(from, to)` in
1000-row pages **until a short page** — i.e. it reads **the whole table**. **No `.eq`, no
`.gte`/date window, no `.limit`, no `.filter` is applied to any of the seven queries.** The
only scoping that exists is **RLS at the database** (owner-only rows) — which, for a
single-owner center, is *the entire dataset*. The result is normalized (`normalizeStudent`,
`normalizeStatementLine`, …) and placed in a single Zustand store shared by all pages.

## What each page then does (no page re-fetches; all derive from the store)

| Page (`app/src/features/…`) | Store slices read | Derivation (all in `useMemo`) |
|---|---|---|
| `glance/glance-workspace` (home) | students, statementLines, enrollments, feeObligations, movements | `financialTotals(movements)`, `aggregateStudents(…)`→`attentionList`, `studentCourseBreakdown` per owed student, `movementsNewestFirst(movements).slice(0,RECENT_LIMIT)` |
| `students/student-directory-workspace` | students, statementLines, enrollments, feeObligations | `aggregateStudents(roster,…)` then client `.filter()` on name/phone/id (`query`) |
| `students/students-workspace` | same + activeId | `aggregateStudents(…)` for the list; `studentLedger(activeId,…)` + `statementFor` for the **selected** student |
| `financial-report/financial-report-workspace` | movements, students, statementLines, enrollments, feeObligations | client `movements.filter(date/account)`→`financialTotals(scoped)`, `externalPartyStatement(viewMovements)`, `financialTotals(before start)` for opening; `studentLedger`/`aggregateStudents` for print |
| `courses/courses-workspace` | courses, enrollments, students, statementLines | client `courses.filter(name query)` + per-course rollups |
| `courses/course-detail-workspace` | courses, enrollments, students, statementLines, feeObligations | roster + stats for the **selected** course (client filter by `course.id`) |
| `activity/activity-workspace` | **its own** `fetchAllRows(audit_log …)** (not the store)** | client `rows.filter()` on source + free-text `query` |

## The two independent "load-everything" sites

1. **The workspace store** — 7 tables, on mount, for every page. (`use-workspace-store.ts`)
2. **The activity page** — all of `audit_log`, on its own mount, ordered `changed_at desc`,
   then filtered in JS. (`activity-workspace.tsx:76`)

## What this map proves about the *cause*

- The load is **architectural, not per-feature**: no screen asks for "this student" or "this
  month" from the server. The store hands every screen the whole center, and each screen
  narrows in JavaScript.
- The load is **not driven by a data requirement** of most screens: the directory needs a
  page of students, the statement needs one student, the report needs a date range, the
  activity page needs a page of log — yet all receive everything.
- The **only** consumers that genuinely read across the whole dataset are **center-wide
  totals** (`financialTotals` on the home/report) and the **backup export** (`04`, `08`).
- Therefore the correct question per path is *"what does this screen actually need from the
  server?"* — answered path-by-path in `06` and `11`, not with one blanket verb.

**Nothing here was changed. This is a description of the current wiring only.**
