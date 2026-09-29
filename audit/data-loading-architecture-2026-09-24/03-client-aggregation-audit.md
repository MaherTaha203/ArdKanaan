# 03 — Client Aggregation Audit: what is computed in the browser and how it scales

**Read-only.** Every derived financial/analytic figure is computed in JavaScript from the
in-memory arrays. This report catalogues each aggregation in `app/src/lib/aggregate.ts`, its
input scope, its cost class, and whether it is the *reason* a full load is needed. Tiers:
**[static]** (code) + **[measured]** (this session's isolated benchmark, `evidence/`).

## Catalogue (all in `app/src/lib/aggregate.ts`)

| Function | Lines | Input scope | Cost | Whole-dataset? | Consumers |
|---|---|---|---|---|---|
| `financialTotals` | 26–42 | all `movements` | O(M), one pass | **yes** | home totals; report opening/closing |
| `externalPartyStatement` | 68–95 | all `movements` (report: `viewMovements`) | O(M) + sort | yes (report scopes first) | report external view |
| `studentCourseBreakdown` | 123–179 | **one student** (`filter studentId`, :128) | O(one student's lines) | **no** | ledger, glance owed list, directory |
| `feePaid` / `feeRemaining` | 181–189 | lines of **one fee** | O(lines/fee) | no | aggregateStudents, glance |
| `studentLedger` | 220–265 | **one student** (`filter studentId`, :226–227, :245) | O(one student) | **no** — cheap | selected student, print |
| `aggregateStudents` | 267–303 | **all** students × their lines | **O(Σ lines) — the hot path** | **yes** | directory, students, report, glance |
| `statementFor` | 309–311 | filter by studentId | O(M) filter | no (reads full array) | students list search, print |
| `movementsNewestFirst` | 337–343 | all `movements` | O(M log M) | yes | home recent list (sliced to 8) |
| `attentionList` | 305–307 | aggregate output | O(S log S) | derived | home attention list |

## The single hot path

`aggregateStudents` (267) is the only aggregation whose cost grows with the **whole** history:
it groups every statement line by student (`groupByStudent`, 113), then for each student runs
`studentCourseBreakdown`. It is called on the directory, the students page, the report, and the
home page. **Measured** (isolated, actual code, `evidence/aggregate-benchmark.txt`):

| statement lines | `aggregateStudents` avg | note |
|---|---|---|
| 1,005 | 4.5 ms | today's scale — invisible |
| 10k | 16.3 ms | fine |
| 50k | 50.6 ms | ~Year 3–5 (Medium) — noticeable on a modest device (×3–8) |
| 100k | 100.7 ms | one recompute per interaction begins to stutter |
| 200k | 211.4 ms | clearly sluggish; recomputed on every dependency change |

Growth is **linear** (~1 ms per 1,000 lines on server CPU). The cost is not one call but that
this whole-roster recompute reruns whenever its `useMemo` deps change, on multiple pages.

## The cheap path (important for the treatment)

`studentLedger` and `studentCourseBreakdown` are **already student-scoped by their first line**
and cost **≤ 3.2 ms even at 200k** total lines (they touch only the selected student's rows).
This is the mathematical basis for `05`: feeding these functions *only that student's rows*
(fetched with a server `student_id` filter) changes **nothing** about their output — they
already discard everyone else's rows internally.

## Which aggregations *justify* loading everything — and which do not

- **Justify a whole-dataset input:** `financialTotals`, `externalPartyStatement` (center
  scope), `movementsNewestFirst` — but each is an **aggregate/summary** that a single server
  query could return without shipping every row. → candidates for server-side SUM (`07`,`11`),
  behind parity tests (`04`).
- **Do NOT justify it:** `aggregateStudents` is only whole-roster because the **directory
  needs a balance column**; that column is a per-student number the DB could compute for the
  visible page. `studentLedger`/`studentCourseBreakdown`/`statementFor` are per-student and
  need only one student's rows.

## Firewall note

These functions are **pure read models** — every one is annotated in-source as creating "no
financial fact". Nothing here posts, allocates, or cancels. Moving a computation from JS to
SQL does not change the money; it changes *where the same number is produced*. That is exactly
why any such move is gated on a **parity test proving identical output** (`04`, `10`) — the
concern is a transcription error, not a firewall breach. **No aggregation was modified.**
