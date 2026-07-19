# ADR-0039 — BC-001 Programs, Pricing & Distribution Policy Rules Adopted

| Field | Value |
|---|---|
| ADR | 0039 |
| Title | BC-001 Programs, Pricing & Distribution Policy Rules Adopted |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

First business-rule document of Phase 2 under P2-000 (Checkpoint C2). BC-001 was authored
in STRICT MODE answering exactly one question — *"How are Training Programs, Pricing, and
Revenue Distribution governed as Business Rules?"* — presented as a DRAFT, then revised
(Revision-1: clarify Business Invariants as derived-not-generative; add "Closing never
invalidates existing business facts." to BR-016; reorder Rule Categories for flow with
BR IDs kept stable). Approved on 2026-07-19. Decision category (GOV-010 §5): Business.

## Decision

Adopt **BC-001 — Programs, Pricing & Distribution Policy Rules** (FROZEN): **18 Business
Rules** (BR-001…BR-018) in the mandated 13-field normal form across 11 categories
(Program Identity, Ownership, Lifecycle, Program Pricing, Registration Pricing, Price
Immutability, Revenue Distribution Policy, Teacher Share, Center Share, Distribution
Immutability, Operational Constraints); five Business Rule Principles (RP-1…RP-5); a
Business Rule Traceability Matrix; a Coverage Report; and a **§8 Business Invariants**
section (INV-1…INV-6) explicitly derivational, not generative.

Under BC-000 Dual Authority, every BR cites both an **Authority of Truth** (frozen
Domain — DR-016/028/031/071–079 + supporting) and an **Authority of Constitutional
Legitimacy** (frozen Product Constitution — PC-003/004/006/007/008).

## Interpretation boundaries

- Business-layer only: BR-001…018 state business behavior; they create no UI,
  engineering, schema, API, algorithm, validation, or test artifact.
- Every in-scope frozen Domain rule is represented (§7); capacity and cohorts remain
  Future Considerations (no BR — no scope expansion).
- Business Invariants are derived consequences that every later artifact must preserve;
  they are never a rule source (§8).
- BC-001 is the frozen foundation for BC-002 (registration), BC-003 (receipts),
  BC-004 (entitlement), BC-005 (refunds), and BC-006 (balances).

## Consequences

- **New document:** BC-001 (FROZEN, `docs/business/`); **Checkpoint C2 opened** (first
  of BC-001/002/003).
- **P2-000 tracker:** BC-001 → FROZEN.
- **Registers:** IDX-001, DEC-000 (next ADR-0040), GOV-009, P2-000 tracker.
- **Audit:** AUD-P2-003 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P2-000 (LIVING). No domain, product, or
  frozen governance changed.
