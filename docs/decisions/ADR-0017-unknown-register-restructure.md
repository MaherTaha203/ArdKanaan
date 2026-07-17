# ADR-0017 — Unknown Register Restructure: Split of UNK-026

| Field | Value |
|---|---|
| ADR | 0017 |
| Title | Unknown Register Restructure: Split of UNK-026 |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Reviewing the Session 5 closure, the Owner found UNK-026's composite form
unsatisfactory: it bundled distinct business questions with a non-business item.
The Owner ruled on 2026-07-17. Decision categories (GOV-010 §5): Governance,
Scope.

## Decision (the Owner's rulings)

1. **Cancel UNK-026 in its composite form** and split it into independent
   unknowns only where genuinely needed:
   - **UNK-026 (refocused, HIGH)** — how the teacher debt arising from refunds
     is calculated and managed (احتساب وإدارة دين المدرّب الناتج عن الاسترجاع):
     tracking scope (per Teacher × Program vs per teacher), whether
     settlement-by-deduction may cross programs given program isolation
     (DR-031), and how a settlement/repayment is recorded.
   - **UNK-027 (new, HIGH)** — the entitlement recalculation and rounding rules
     after refunds (قواعد إعادة احتساب المستحقات والتقريب), which remain
     genuinely unresolved: the exact formula for net teacher entitlement and
     its interaction with nearest-shekel rounding (DR-028).
2. **Refund Voucher numbering is NOT a business unknown.** It is a later design
   decision and is removed from Domain Discovery entirely.
3. Session 5 is confirmed successfully closed; the refund area is sufficiently
   defined to proceed — when the Owner so orders — to one of the remaining
   major topics (Corrections & Cancellations, or Expense Categories).

## Consequences

- **Register:** UNK-026 rewritten (refocused); UNK-027 opened; the numbering
  item leaves the register as an explicitly deferred design decision — recorded
  here so its removal is not a silent drop (GOV-010 §8).
- **Blast radius:** DOM-003 v1.7.0 (WF-07 exceptional cases), DOM-004 v3.2.0
  (DR-038/DR-039/DR-041 unknown-status lines), DOM-005 v1.12.0, GOV-009,
  IDX-001, DEC-000; audit AUD-P1A-009. GOV-008 unchanged (register bookkeeping,
  no engineering lesson). Frozen governance untouched.
- Open HIGH unknowns become 4 (UNK-007, UNK-009, UNK-026, UNK-027) — a more
  precise, not larger, question space.
