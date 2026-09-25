# 01 — System Inventory & Data-Lifecycle Map

**Read-only.** Commit `b6016a0`. Confirms the component map and traces the day-to-day data
lifecycle (students, courses/enrollments, financial obligations) that must survive years.

## Component map (condensed)

- **UI:** `components/shell/` (app-shell, tab-strip, page-registry), `features/*`
  (students, courses, financial-report, glance, receipt-voucher, payment-voucher, settings,
  activity, auth), print components.
- **State (Zustand, 15 stores):** `use-workspace-store` (the single read cache — loads all
  rows), command stores (`use-money-in/out-store`, `use-voucher-admin-store`,
  `use-course-admin-store`, `use-student-admin-store`, `use-student-archive-store`,
  `use-fee-obligation-store`), plus auth/settings/backup/shell.
- **Domain logic:** `lib/aggregate.ts` (all balances/statements), `statement-rows.ts`,
  `courses.ts`, `voucher.ts`, `fetch-all.ts` (pagination), `backup.ts`, `activity-log.ts`.
- **DB:** 53 migrations; 11 base tables; 4 invoker views; owner-gated SECURITY DEFINER RPCs;
  firewall/immutability/append-only triggers.
- **Write path:** form → command store → `supabase.rpc(...)` → Postgres (RLS + firewall) →
  on success `useWorkspaceStore.load()` re-fetches **all** rows.
- **Read path:** `useWorkspaceStore` raw rows → pure selectors in `lib/aggregate.ts` → render.

## Data lifecycle (Section III) — evidence

### A. Students
- **Create/identity:** `use-student-admin-store` → insert; identity disambiguation exists
  (`lib/student-identity.ts` + e2e `student-identity`) so duplicate names force selection at
  receipt time. No DB `UNIQUE` on name (by design — real duplicates exist); `id_number`
  optional. **Sustainability:** identity is resolved at point-of-use, not by a unique key →
  correct for real-world duplicates, but relies on the operator picking the right person.
- **Reactivation without duplication:** archive/complete/reactivate flip `students.status`
  (`archive_student`/`unarchive_student`/`complete_student`/`reactivate_student` RPCs) — they
  **mutate status in place**, never create a new student row → **no duplication on
  reactivation** (confirmed: `20260919120000`, `20260916116500`). History (receipts, ledger,
  statement lines) is keyed by `student_id` and is untouched by status changes → **prior debts
  and payments are retained**. ⚠️ `complete_student`/`reactivate_student` lack the `is_owner()`
  guard (SEC-001 — see `07`).
- **Edit/archive risk:** receipts store an immutable `student_name_snapshot`
  (`enforce_receipt_student_snapshot` trigger), so renaming a student does **not** rewrite
  historical vouchers — good for historical integrity.

### B. Courses & enrollments
- **New course:** `use-course-admin-store` → insert `courses` (name UNIQUE, base_fee nullable).
- **Reactivate a course:** `courses.status` flips active/ended in place (no new row).
- **Same program, new course vs same course:** modelled at the **enrollment** level.
  `enrollments` has a **partial-then-full unique** on `(student_id, course_id)` (DB-005 drift)
  → a student cannot be enrolled twice in the **same course**, but **can** enroll in a
  **different** course (incl. a new run of the same program, which is a distinct `courses`
  row). This matches the requirement.
- **Overlap risk:** `studentCourseBreakdown` resolves by `enrollmentId` first, `courseName`
  only as a fallback for legacy rows → **two courses with the same NAME are the divergence
  point** (CODE-002/FIN-002). As new runs reuse a program name, this legacy-name path is the
  main historical-accuracy risk to watch (`04`).
- **History:** enrollments + their statement lines persist; `course_value` is snapshotted on
  the enrollment (immutable) so later price changes don't rewrite old dues.

### C. Financial obligations
- **Creation/link:** `create_fee_obligations` RPC links a fee to a student (and optionally a
  course/enrollment; standalone allowed since `20260919130000`, **repo-only**). Amount +
  category + external_share validated server-side; immutable after create.
- **Paid/remaining:** derived on read — fee paid = Σ statement lines with
  `entryType='fee' & feeObligationId=fee.id`; remaining = `max(0, amount − paid)`
  (`aggregate.ts:181-189`). Course dues likewise derived from `course_value` − allocations.
- **Re-enroll/adjust/cancel/reactivate/refund:** cancellation is **append-only**
  (`cancel_fee_obligation` sets `cancelled_at`, blocked if any allocation is paid); vouchers
  cancel via a **reversal** ledger row, never a delete or edit of the original. **No refund
  entity** in the implemented schema (the frozen constitution has one; not built — DB-008).
- **Old records don't change on new activity:** enforced by immutability triggers + snapshots
  + append-only ledger → a new registration or a new course **cannot rewrite** prior dues,
  payments, or balances. This is the strongest long-term-integrity property of the system.

**Net:** the lifecycle is built for longevity — reactivation reuses rows, history is
immutable and snapshotted, balances are derived. The residual lifecycle risks are the
**same-course-name legacy path** (accuracy) and the **lifecycle-RPC guard gap** (access) —
both carried into the findings register.
