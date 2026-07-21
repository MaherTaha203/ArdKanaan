# ADR-0050 — UX-001 Frozen — Constitutional Philosophy of the User Experience Layer

| Field | Value |
|---|---|
| ADR | 0050 |
| Title | UX-001 Frozen — Constitutional Philosophy of the User Experience Layer |
| Phase | 3 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 3 (UX Constitution) was authorized and commenced by ADR-0048/ADR-0049 and is governed by
P3-000. UX-001 — the framework document of Phase 3, the UX analog of BC-000 — was authored as a
DRAFT, then revised twice under Owner constitutional review: **Revision-1** (a strong opening
definition of what the UX is and why it exists; principles reduced from 11 to 5; a sharp separation
of Principles from Invariants; invariants reduced from 7 to 5; removal of design-guidance) and
**Revision-2** (clarify that UX *presents* the product's language but does not own it; narrow
UXV-02 to elements that present business information or initiate a business action; simplify and
rename §8 to a Propagation Rule). Approved for propagation on 2026-07-20. Decision category
(GOV-010 §5): UX.

## Decision

**Approve and freeze UX-001 — UX Constitutional Philosophy & Layer Responsibility** (FROZEN
v1.0.0). UX-001 answers exactly one constitutional question — *"What is the constitutional
responsibility of the User Experience layer?"* — and fixes:

- **What the UX is:** the single surface through which one Owner sees and operates the center's
  frozen reality — *the window and the hand* — never the author of that truth.
- **Constitutional responsibility:** UX owns the *presentation* of frozen facts/rights/vouchers/
  balances/statuses, the *operation* of frozen actions as surfaces over Business Rules, and the
  *presentation* of the product's language (owned by PC-006). UX never owns a Business Rule,
  calculation, workflow meaning, status effect, lifecycle, product scope/actors/glossary, domain
  truth, concrete components/screens/visuals, or engineering.
- **Five principles (UXP-01…05)** — the permanent stance; and **five invariants (UXV-01…05)** — the
  binding, testable guarantees; separated by altitude (stance vs pass/fail check).
- **Layer boundaries** (Business ▷ UX ▷ Components ▷ Screens ▷ Engineering) and the propagation rule
  binding later UX documents to the five invariants.

## Interpretation boundaries

- **Philosophy only.** UX-001 introduces **no** screen, component, visual language, layout,
  navigation, interaction design, usability technique, Business Rule, or Product Rule, and makes no
  engineering decision.
- **No upstream modification.** BC-000…BC-009, PC-001…008, DOM, and frozen governance are consumed
  exactly as frozen; nothing upstream is changed (CDC honored).
- UX-001 is now the frozen authority every later UX document (UX-002…UX-007) consumes and cites; it
  is released only by a Constitutional Amendment (GOV-004 §5).

## Consequences

- **UX-001 FROZEN** (`docs/ux/`); it is the constitutional philosophy of the UX layer and the first
  frozen document of Phase 3 (Checkpoint UC1 begun).
- **P3-000 tracker:** UX-001 → FROZEN; UX-002 next (pending a separate Owner order).
- **Registers:** IDX-001, DEC-000 (next ADR-0051), GOV-009, RDM-001, P3-000.
- **Audit:** AUD-P3-002 — eight gates PASS; boundary/scope/separation/immutability verified.
- **Blast radius:** IDX-001, DEC-000, GOV-009, RDM-001, P3-000 (LIVING). No Business, Product,
  Domain, or frozen Governance content changed.
