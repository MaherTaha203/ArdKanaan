# 11 — Recommended Target Architecture: the right treatment per data path

**Read-only, proposed (NOT executed).** The per-path end-state, derived from the evidence in
`01`–`10`. It is **not** a blanket redesign: most paths keep exactly what they have, a few move
their *filter* to the server, and only the true whole-set summaries become server aggregates
behind parity tests. The eager store is slimmed **last**, and only if data warrants.

## Principle

> Ask the server for **what the screen shows**: one student, one course, one page, one date
> range, or one summary number — and keep loading everything **only** where everything is the
> answer (backup).

## Target per path

| Path | Today | Target | Result change | Gate |
|---|---|---|---|---|
| **Student statement** | derive one student from full array | fetch `.eq('student_id', S)` on selection; same `studentLedger`/`statementFor` | **none (proven, `05`)** | none — safe now |
| **Course detail** | derive one course from full arrays | fetch the selected course's enrolments/lines on open | none (same filter, server-side) | none — safe now |
| **Activity / audit log** | load all `audit_log`, filter in JS | server pagination (`changed_at desc` + range) + server search; add `audit_log(changed_at desc)` index | none (same rows, paged) | additive index migration, EXPLAIN in isolated DB |
| **Students directory list** | `aggregateStudents(all)` + JS search | server search + list pagination; **balance column = server per-student aggregate** | rows: none; **balance: parity-tested** | F3 parity test (`04`) before the balance move |
| **Financial report** | load all movements, JS date/account filter + JS sums | server `voucher_date` range + account filter + pagination; **totals = server SUM** | rows: none; **totals: parity-tested** | F1/F2 parity tests (`04`) |
| **Home KPIs** | `financialTotals(all)` + `aggregateStudents(all)` | server aggregate for totals/attention counts; keep `recent` as `limit 8` at source | parity-tested for the money figures | F1/F3 parity tests |
| **Courses list** | load all courses (small) | **keep as-is** (optional server search later) | none | none |
| **Cancelled vouchers** | load all (small/slow) | keep as-is for now; paginate only if it grows | none | none |
| **Backup export** | read every row | **keep — must read all** | none | never scope/paginate |
| **The eager store** | 7 full tables on mount | **slim last**: hold roster + summaries (from server aggregates); pages fetch details on demand | none if summaries are parity-tested | after the above; optional |

## What the store becomes (end-state, optional/last)

`use-workspace-store` stops being "the whole center in memory." It holds: the **roster** (a page
at a time, or lightweight rows + server-provided balances), **center summary figures** (from
server aggregates), and small slow-growing sets (courses). Detail views
(`students-workspace` selected student, `course-detail`, report by range) **fetch on demand**.
`fetchAllRows` remains the correct tool for the **backup** path (its comment — "a financial
system must never silently operate on the first 1000 rows" — stays true exactly there).

## What must NOT change (firewall)

- The **financial formulas** (`04`) — a server version must be **proven identical**, never
  "improved."
- The **append-only ledger**, the **posting/allocation/cancellation RPCs**, **RLS/owner model**,
  and the **backup completeness guarantee**.
- Scoping a **read** to one student/date/page only *narrows within the owner's own RLS-scoped
  rows*; it grants no new access and removes no safety.

## Why this is "correct long-term treatment," not just faster

Each screen's cost stops scaling with **total history** and starts scaling with **what it
shows** (one student, one page, one range) — a bounded quantity. The only paths that still scale
with history are the ones that *must* (backup) or that return a single number cheaply (server
aggregates). That is the durable shape; the store slim-down is the finishing move, not the
prerequisite.

**Proposed only. No code, query, index, or store was changed.**
