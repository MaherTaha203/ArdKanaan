# ADR-0019 — Session 7 Owner Decisions: Expense Categories

| Field | Value |
|---|---|
| ADR | 0019 |
| Title | Session 7 Owner Decisions: Expense Categories |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner closed Interview Session 7 (Expense Categories, target UNK-009) on
2026-07-17 and authorized propagation per GOV-010 with two refinements (see
below). Decision categories (GOV-010 §5): Business, Scope.

## Decision (the Owner's rulings)

1. **S7-D1 — Expense boundary.** An expense is money the center pays for a good,
   service, or obligation **to operate the center itself**, that does **not**
   settle a pre-existing financial right of another party. Teacher payments
   (settlement of entitlement, DR-030) and student refunds (reversal of
   recognized revenue, DR-036) are therefore **NOT** expenses.
2. **S7-D2 — No fixed-asset distinction in V1.** Durable purchases (furniture,
   equipment) are recorded the same way as consumables; V1 does not distinguish
   Fixed Assets from ordinary expenses. *(Refinement 2: this is version scope,
   not a permanent classification — the fixed-asset distinction may be
   introduced in a later version; see DOM-004 §Future considerations.)*
3. **S7-D3 — Categories.** Every expense is assigned **exactly one** category,
   chosen from a **named, owner-expandable list**. Categories exist so the owner
   can see per-category spending totals plus the detail of each expense.
4. **S7-D4 — Center-borne in V1.** Every V1 expense is borne by the center:
   recording it reduces the **Cash Balance** and the **Center Net Balance**, and
   **never** touches any teacher's entitlement. *(Program-account allocation and
   proportional center/teacher splitting were discussed and **postponed** —
   Owner chose to keep V1 expenses center-borne only; they would deduct from
   teachers, which remains postponed under S4-D8 / UNK-021.)*
5. **S7-D5 — Recorded when paid, from center money.** An expense is recorded
   only when the cash has **actually left** the center, always paid from the
   **center's own money**. V1 has no unpaid/accrued expense and no
   owner-personal-money payment path.
6. **S7-D6 — No approval.** The owner records an expense directly; V1 has no
   approval/review step.

## Refinements applied (Owner-directed)

- **Refinement 1:** the new unknown is registered as the **governing business
  concept — "Money Returning to the Center After an Expense"** (covering purchase
  returns, supplier refunds, supplier credit notes, and any money returned after
  a previously recorded expense) — **UNK-028**, registered only, not answered.
- **Refinement 2:** the furniture/equipment ruling is expressed as a business
  rule about **uniform recording** (DR-050), with the "no fixed-asset
  distinction" stated as **version scope**, not a permanent classification.

## Interpretation boundaries (what is NOT decided here)

- A center expense is recorded as a **Payment Voucher** (DR-008) carrying an
  expense category and a center-borne effect; no separate "expense voucher"
  document type was requested and none is invented (contrast the Refund Voucher,
  S5-D6, which the Owner explicitly created).
- **New vocabulary:** "Expense" and "Expense Category" extend the founding term
  set. Adding them to GOV-002 §7.2's fixed-terminology list would touch the
  frozen Governance layer (GOV-010 §10); this is **reported to the Owner**
  (GOV-010 §8), not silently applied — the canonical terms are defined in
  DOM-002 meanwhile.

## Consequences

- **New domain rules:** DR-049…DR-054. **Updated status:** DR-008 (expense
  linkage now defined).
- **Unknowns:** UNK-009 CLOSED; UNK-015 CLOSED; **UNK-028 opened** (registered,
  unanswered). UNK-021 remains open (teacher deductions still postponed).
- **Workflows:** WF-06 (center expense) becomes ESTABLISHED.
- **Future Considerations added:** fixed-asset distinction; program-account /
  proportional expense allocation.
- **New entity:** Expense Category (DOM-002 §14); Payment Voucher (§8) now
  covers two kinds — teacher payments and center expenses.
- **Blast radius:** DOM-001 v1.8.0, DOM-002 v7.0.0, DOM-003 v1.9.0,
  DOM-004 v3.4.0, DOM-005 v1.14.0, GOV-008 (LES-014), GOV-009, IDX-001, DEC-000;
  audit AUD-P1A-011. Frozen governance untouched.
- Full review pipeline re-run; Domain Discovery re-freezes on all-PASS.
