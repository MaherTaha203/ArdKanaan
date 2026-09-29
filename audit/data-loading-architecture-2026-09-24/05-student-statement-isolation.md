# 05 — Student-Statement Isolation: the smallest change with a proof of zero result difference

**Read-only.** This is the headline finding: the student statement can load **one student's
rows** instead of the whole center, with output that is **provably identical** — because the
statement functions already discard every other student's rows internally. No blanket redesign,
no formula change, no money touched. Tier: **[static]** (proof by construction from
`app/src/lib/aggregate.ts`) + **[measured]** (cost, `evidence/`).

## The proof

The three functions that render a single student's statement each **begin** by filtering the
full array down to that student, and never read outside that student again:

- `studentLedger(studentId, lines, enrollments, feeObligations)` — line **226**:
  `const studentLines = lines.filter((line) => line.studentId === studentId)`; line **227**
  filters `enrollments` to `enrollment.studentId === studentId`; the fee loop **skips**
  everything else — line **245**: `if (fee.studentId !== studentId || fee.cancelledAt) continue`.
  → Its output is a pure function of *(that student's lines, that student's enrolments, that
  student's non-cancelled fees)*. Rows of other students are dead input.
- `studentCourseBreakdown(studentId, lines, enrollments)` — line **128**:
  `lines.filter((line) => line.studentId === studentId && …)`; line **129** filters enrolments
  the same way. Same property.
- `statementFor(lines, studentId)` — line **310**: `lines.filter((line) => line.studentId === studentId)`.

**Therefore:** for any student S, `f(S, allRows) === f(S, rowsWhere student_id = S)` for all
three functions — the extra rows are removed by the function's own first statement. Passing a
**server-filtered** slice (`… .eq('student_id', S)`) yields **byte-identical** entries, totals,
debit/credit, and balance. There is **no formula to move to SQL** — only *where the filter
runs* changes (browser → server). Result difference: **exactly zero, by construction.**

## Why this is the biggest win for the smallest change

- It removes the statement view's dependence on `student_statement_lines` being fully loaded —
  the fastest-growing financial table (`02`).
- It touches **no** aggregation logic, no money, no RLS (RLS already scopes to the owner; adding
  `.eq('student_id', …)` only narrows *within* the owner's own rows).
- Measured cost of the per-student compute is already trivial (`studentLedger` ≤ 3.2 ms at
  200k total lines) — so the win is the **transfer and the memory**, not CPU: the browser stops
  holding the entire ledger to show one student.

## What it does NOT do (honesty about scope)

- It does not, by itself, remove the full `statementFor`/`aggregateStudents` load used by the
  **directory list** — that path still wants a roster with balances (treated separately in
  `06`/`11`).
- If the app keeps the eager store *and* adds an on-demand per-student fetch, both exist until
  the store is slimmed; the clean end state (store holds roster + summaries, statement fetched
  on selection) is in `11`.

## Verification that would confirm it in practice (not run — no isolated DB this session)

A test that (a) computes `studentLedger`/`statementFor`/`studentCourseBreakdown` over the full
array and (b) over the server-filtered slice, then asserts deep-equality of the results, for a
seeded student with name-reuse, fees, and cancellations. This is a **pure-function unit test**
(no DB needed) plus one **[real-PG]** test that the `.eq('student_id', …)` query returns exactly
those rows. Marked **NOT YET RUN** (reason: this is a read-only audit; no code/tests added).

**Nothing was changed. This report establishes that the change, when authorized, is safe by
proof — it does not perform it.**
