# ADR-0016 — Session 5 Owner Decisions: Student Refunds

| Field | Value |
|---|---|
| ADR | 0016 |
| Title | Session 5 Owner Decisions: Student Refunds |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner closed Interview Session 5 (Student Refunds) on 2026-07-17 with seven
final decisions (S5-D1…S5-D7), ordering propagation per GOV-010 with no
reinterpretation, redesign, optimization, simplification, generalization,
merging, or extension. Decision categories (GOV-010 §5): Business.

## Decision (the Owner's rulings)

1. **S5-D1 — Business nature.** A Student Refund is NOT a new operating
   expense. It is a **REVERSAL of previously recognized revenue**: the refunded
   amount is treated as though that portion of the revenue had never been
   earned. This is the governing principle for every refund-related workflow.
2. **S5-D2 — Effect on revenue.** A refund reduces **Program Revenue** and the
   **Student Paid Amount**. The financial state must be recalculated after
   every refund.
3. **S5-D3 — Effect on teacher entitlement.** Teacher entitlement must always
   reflect the **net revenue after refunds**. If the teacher has NOT yet been
   paid, the refund immediately reduces the teacher's entitlement — no manual
   adjustment.
4. **S5-D4 — Teacher already paid.** If the teacher already received payment
   for the refunded amount, the refunded teacher share becomes a **debt owed by
   the teacher to the center**, settled by either immediate repayment OR
   deduction from future teacher entitlements. The center does NOT permanently
   absorb the refunded teacher share.
5. **S5-D5 — Allocation.** Refunds are NOT allocated to individual Receipt
   Vouchers — no FIFO, no LIFO, no receipt matching. Refunds reduce the total
   paid amount of the **Student × Program** and are associated with the Student
   and Program only.
6. **S5-D6 — Refund document.** Refunds are recorded using a dedicated,
   independent financial document: the **Refund Voucher (سند استرجاع)**. It is
   NOT a Payment Voucher and NOT an expense voucher; it exists solely to record
   student refunds.
7. **S5-D7 — Refund Voucher responsibilities.** The Refund Voucher references
   the Student and the Program; records the refund amount and the refund
   reason; reverses recognized revenue; affects teacher entitlement; appears in
   the Student Statement; and participates in the full audit trail.

## Interpretation boundaries (what is NOT decided here)

- **Entailed balance effects (propagation, not extension):** by S5-D2/D3/D4
  with DR-016/DR-017 — the refunded cash leaves the center (Cash Balance
  decreases); the center's portion of the reversal reduces Center Net Balance;
  the teacher's portion reduces Teacher Payables (unpaid case) or becomes a
  teacher debt (paid case). A reversal is bounded by previously recognized
  revenue: a refund cannot exceed the Student × Program net paid amount.
- **NOT decided — recorded as UNK-026 (HIGH):** (a) the exact recalculation
  formula for net teacher entitlement after a refund and its interaction with
  nearest-shekel rounding (DR-028); (b) whether teacher debt is tracked per
  Teacher × Program or per teacher, and whether settlement-by-deduction may
  cross programs given program isolation (DR-031); (c) what document records a
  teacher's immediate repayment, and whether Refund Vouchers carry their own
  independent number sequence (DR-026 covers receipt/payment sequences only).
- **UNK-006 reduced, not closed:** the money mechanics of refunds are resolved;
  still unanswered from the Session 5 questions: when a student is *entitled*
  to a refund, how full-vs-partial amounts are determined (or whether that is
  pure Owner discretion entered as the voucher amount), approval/signature
  practice, and the effect on the student's registration. Downgraded HIGH →
  MEDIUM: the Refund Voucher takes amount and reason as Owner inputs (S5-D7),
  so these do not block the money-calculation spec.
- **UNK-021 relationship:** S5-D4's settlement-by-deduction is an explicit
  Owner decision specific to refund debts; the *general* deduction model
  remains postponed (S4-D8) and UNK-021 stays open — no conflict.
- **New entity note:** the Refund Voucher extends the founding entity set
  (F-05) by Owner authority. Extending GOV-002 §7.2's fixed-terminology list
  with "Refund Voucher" would touch the frozen Governance layer (GOV-010 §10);
  this is flagged to the Owner as an explicitly reported impact (GOV-010 §8),
  not silently applied. The canonical term is defined in DOM-002 §13 meanwhile.

## Consequences

- **New domain rules:** DR-036…DR-042. **Updated:** DR-006 (refund path now
  defined), DR-038 interacts with DR-034 (entitlement is net of refunds).
- **Unknowns:** UNK-006 reduced in scope and downgraded to MEDIUM; UNK-026
  opened (HIGH); UNK-021 annotated.
- **Blast radius:** DOM-001 v1.6.0, DOM-002 v5.0.0 (new §13 Refund Voucher;
  net-revenue semantics), DOM-003 v1.6.0 (WF-07 → ESTABLISHED), DOM-004 v3.1.0,
  DOM-005 v1.11.0, GOV-009, IDX-001, DEC-000; audit AUD-P1A-008. GOV-008
  unchanged (business decisions are not engineering lessons). Frozen governance
  untouched.
- Full review pipeline re-run; Domain Discovery re-freezes on all-PASS.
