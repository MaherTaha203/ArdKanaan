# ADR-0043 — BC-005 Refund & Adjustment Rules Adopted

| Field | Value |
|---|---|
| ADR | 0043 |
| Title | BC-005 Refund & Adjustment Rules Adopted |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Fifth business-rule document of Phase 2 under P2-000 (Checkpoint C3). BC-005 was authored
in the DRAFT → Review methodology answering exactly one question — *"How are refunds and
adjustments governed, additively and without loss of history?"* — then revised (Revision-1:
BR-054 scoped to the document's own effects, not a full-system rewind; BR-055 example made
implementation-neutral, no forward reference to unwritten BC-006; BR-057 gains "field
classification is constitutional and cannot vary by implementation"; Constitutional
Boundary gains "BC-005 never authorizes settlement"). Approved on 2026-07-19. Decision
category (GOV-010 §5): Business.

## Decision

Adopt **BC-005 — Refund & Adjustment Rules** (FROZEN): **9 Business Rules** (BR-049…BR-057)
across 9 categories (Refund Nature, Document, Financial Effect, Association, Independence;
Cancellation Effect, Dependency, Record; Correction Method); principles RP-21…RP-25;
Business Invariants INV-21…INV-25; a Constitutional Boundary (refund/adjustment only;
*BC-005 never authorizes settlement*). Every BR dual-cited — Authority of Truth (frozen
Domain DR-036/037/040/041/042/045/046/047/048/085) + Authority of Constitutional
Legitimacy (frozen PC-003/004/006/007/008).

## Interpretation boundaries

- Business-layer only: BR-049…057 state the refund event and adjustment mechanism; they
  introduce no entitlement/debt definition, no settlement, no balances aggregation.
- BC-005 **consumes** BC-003 (posting/immutability/lifecycle), BC-004 (entitlement
  reduction & debt definition), BC-002 (registration lifecycle) with meaning intact; it
  holds **forward dependencies** (not consumption) on BC-006 (settlement) and BC-007
  (balances).
- The constitutional pattern is confirmed: **BC-003 creates facts · BC-004 derives rights ·
  BC-005 reverses facts** — each document governs one financial transformation.

## Consequences

- **New document:** BC-005 (FROZEN, `docs/business/`); Checkpoint C3 continues (BC-006
  next).
- **P2-000 tracker:** BC-005 → FROZEN; BC-006 NEXT. Option A unchanged.
- **Registers:** IDX-001, DEC-000 (next ADR-0044), GOV-009, RDM-001, P2-000 tracker.
- **Audit:** AUD-P2-007 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, RDM-001, P2-000 (LIVING). No domain,
  product, or frozen governance changed.
