# 02 — Full-Load Inventory: every query that reads a whole table

**Read-only.** The complete list of client queries that fetch an entire table with no server
filter/scope/limit, each with its exact `select`/`order`, why it is currently full, and
whether it *needs* to be. Tier: **[static]** (queries quoted from source at `cbf7dbb`).
Row-count figures are **NOT VERIFIED IN LIVE ENVIRONMENT** (no production access this
session); growth reasoning is from `audit/long-term-sustainability-2026-09-24/02`.

## Inventory

| # | Table | Site | `select` (columns) | `order` | Server filter? | Grows with |
|---|---|---|---|---|---|---|
| 1 | `students` | `use-workspace-store.ts:57` (`loadStudents`, with a fallback select at :59) | id, name, id_number, phone, notes, status, archived_at, archive_reason | name ↑ | **none** | # students |
| 2 | `student_statement_lines` | `use-workspace-store.ts:88` | 11 cols incl. amount_received, remaining_balance, entry_type, fee_obligation_id, enrollment_id | voucher_date ↑, voucher_number ↑ | **none** | **every receipt allocation** (fastest financial grower) |
| 3 | `financial_movements` | `use-workspace-store.ts:89` | id, movement_type, voucher_number, voucher_date, amount, party_name, context, external_share | voucher_date ↑, created_at ↑ | **none** | # vouchers |
| 4 | `cancelled_vouchers` | `use-workspace-store.ts:90` | id, movement_type, voucher_number, voucher_date, amount, party_name, context, cancelled_at, cancel_reason | cancelled_at ↓ | **none** | # cancellations (slow) |
| 5 | `courses` | `use-workspace-store.ts:99` | id, name, base_fee, start_date, end_date, status, notes | name ↑ | **none** | # courses (slow) |
| 6 | `enrollments` | `use-workspace-store.ts:100` | id, student_id, course_id, course_name, course_value, created_at | none | **none** | # student×course |
| 7 | `fee_obligations` | `use-workspace-store.ts:101` | 12 cols incl. amount, fee_category, external_share, cancelled_at | created_at ↑ | **none** | # fee obligations |
| 8 | `audit_log` | `activity-workspace.tsx:76` | 13 cols incl. changed_at, actor_email, ip_address, device_id | changed_at ↓ | **none** | **every action in the system (fastest of all)** |

All eight go through `fetchAllRows` → read to completion. Scoping is **RLS only**.

## Why each is *currently* full (the real reason, per path)

- **(1) students** — full because the directory/report/pickers want the whole roster in
  memory for client search and for the per-student balance column. *Needed fully?* No — a
  list needs a page; search should be a server query (`06`).
- **(2) statement_lines** — full because `aggregateStudents` recomputes **every** student's
  balance in JS, and the statement view filters by student in JS. *Needed fully?* Only for
  center totals and backup. A single statement needs **one student's** lines (`05`).
- **(3) movements** — full because `financialTotals` and the report sum/scope them in JS.
  *Needed fully?* Center totals need an aggregate, not the rows; the report needs a **date
  range**. (`04`)
- **(4) cancelled_vouchers** — full for a cancelled-list display; small and slow-growing, but
  still unscoped.
- **(5) courses** — full; **small and slow-growing → legitimately fine to keep** (`03`,`11`).
- **(6) enrollments / (7) fee_obligations** — full because the aggregates join them in JS per
  student. Needed fully only for center totals/backup; per-student views need one student's.
- **(8) audit_log** — full because the activity page sorts+filters the whole log in JS. *Needed
  fully?* **No — a log is inherently paged.** This is the first path to hurt (`08`, `09`).

## Read this against the firewall

Every row here is **read-only presentation input**. None of these queries writes, and the
*posting/allocation/cancellation* path (the money-moving RPCs) is **not** in this inventory —
it is server-side and out of scope for any loading change. Reducing what these **reads** pull
cannot alter a stored figure; it can only alter *how much is transferred and recomputed in the
browser*. The one exception where care is mandatory is when a **client aggregate** (totals,
per-student balance) is replaced by a **server aggregate** — that is a formula move and needs
parity tests (`04`, `10`), even though the underlying money data is untouched.

## Not in scope of "full load"

Per-selection reads already exist implicitly (the statement view *derives* one student from the
full array) — the finding is that the **server** is never asked to do that narrowing. No query
here was modified.
