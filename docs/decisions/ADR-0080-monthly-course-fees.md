# ADR-0080 — Monthly course fees for future enrollments

- **Status:** IN-REVIEW; isolated implementation only, not approved for Production.
- **Decision:** For future registrations, stop treating `enrollments.course_value` as a new total course charge. Keep existing enrollment snapshots and their receipt allocations unchanged. Future monthly charges are separate, student-anchored `fee_obligations`.
- **Catalog-price separation:** `courses.monthly_fee` is a new, separate nullable field. Existing `courses.base_fee` retains its legacy total-registration meaning and is never copied automatically into `monthly_fee`. A course must have a valid `monthly_fee` before new monthly enrollments or monthly obligation generation are allowed.
- **Effective boundary:** This change does not rewrite, cancel, reprice, or reallocate any existing enrollment, receipt voucher, receipt allocation, or ledger movement. Existing outstanding balances remain historical obligations. Monthly obligations are created only for the month explicitly selected by the owner; no historical months are backfilled automatically.

## Monthly obligation identity

A monthly course obligation is identified by `(enrollment_id, due_month)`, where `due_month` is the first calendar day of the month. A database unique index prevents duplicate generation, including after cancellation, backup/restore, retries, or concurrent requests.

Monthly fees use the existing fee-obligation and receipt-allocation path. `fee_category` continues to mean who receives the money (`institute`, `external`, `shared`); a separate `fee_kind` means why the amount is owed (`monthly_course` versus `additional`). The monthly price is snapshotted into each obligation at generation time. Changing the course's default monthly price later must not change previously generated obligations.

## Generation workflow

1. Owner chooses an active course and month.
2. Preview returns each eligible student/enrollment, the month's price, and whether the obligation already exists.
3. Owner confirms one atomic bulk action.
4. The database inserts only missing obligations, all-or-nothing; a concurrent or repeated request cannot create duplicates.
5. Old unpaid months remain outstanding; paying an older month does not block a new month.
6. A student enrolled during the selected month is charged the full month. For historical month selection, enrollments created after that month are excluded.

## Backup/restore and compatibility

- Current backup export uses full row snapshots, so new fee columns will be exported automatically.
- Restore must explicitly validate and restore `fee_kind` and `due_month`; old backups missing those fields are interpreted as `additional` fees with no due month.
- Existing fee obligations default to `additional`, preserving their meaning.
- Legacy course receipts continue to settle their original enrollment snapshots. Monthly course receipts use fee allocations and do not consume the legacy enrollment total.
- Do not change historical balances, receipt snapshots, allocation rows, or append-only ledger entries.

## Acceptance gates

- Migration applies cleanly on a disposable PostgreSQL database.
- Preview is read-only and owner-only.
- Generation is owner-only, atomic, idempotent, and protected by a unique database constraint.
- Re-running the same course/month inserts zero duplicates.
- A failed bulk insert leaves no partial obligations.
- Legacy enrollments and all existing receipt/fee allocations produce identical balances before and after migration.
- A new enrollment has no legacy total-course charge; its monthly amount is charged only when the owner generates that month.
- Additional fees remain distinguishable from monthly course fees, while recipient category remains independent.
- Backup → restore → backup preserves `courses.monthly_fee`, enrollment `billing_model`, monthly fee identity, and due month. Old backups missing these fields restore with safe legacy defaults.
- UI uses Western digits (0–9) for month and monetary values.
- All relevant unit, SQL integration, typecheck, lint, build, and e2e tests pass.
