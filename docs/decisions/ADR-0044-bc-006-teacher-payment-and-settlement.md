# ADR-0044 — BC-006 Teacher Payment & Settlement Rules Adopted; Checkpoint C3 Complete

| Field | Value |
|---|---|
| ADR | 0044 |
| Title | BC-006 Teacher Payment & Settlement Rules Adopted; Checkpoint C3 Complete |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Sixth business-rule document of Phase 2 under P2-000, completing **Checkpoint C3**
(Entitlement → Adjustment → Settlement). BC-006 was authored under a fully pre-specified
constitutional frame (central question, Principle #1, Settlement definition, INV-26, and
four mandatory review filters), presented as a DRAFT, then revised (Revision-1: BR-059
purified of numbering — numbering consumed; BR-062 recast so Partially/Fully Settled are
derived readings of Outstanding, not created states; BR-064 separates the Owner decision
from the settlement paths; BR-066 states Principle #1 explicitly; INV-27 made testable —
"every settlement leaves Total Entitlement unchanged"). Approved on 2026-07-19. Decision
category (GOV-010 §5): Business.

## Decision

Adopt **BC-006 — Teacher Payment & Settlement Rules** (FROZEN): **9 Business Rules**
(BR-058…BR-066) across 6 categories (Settlement Event, Teacher Payment Instrument,
Outstanding Reduction, Settlement Lifecycle, Teacher Debt Discharge, Settlement
Cancellation); principles RP-26…RP-30; the Settlement constitutional definition;
Business Invariants INV-26…INV-30. Every BR dual-cited — Authority of Truth (frozen Domain
DR-030/032/033/034/068/070) + Authority of Constitutional Legitimacy (frozen
PC-003/004/006/007/008).

BC-006 answers *"How is an already-defined financial right constitutionally discharged?"*
under Principle #1 (settlement never creates, modifies, or recalculates a right; it only
discharges), and passes all four mandatory review filters (Rule, Document, Set,
Constitutional Independence — AUD-P2-008).

## Interpretation boundaries

- Business-layer only: BR-058…066 describe settlement **state transitions**; the Teacher
  Payment Voucher appears only as the settlement instrument, and its numbering is consumed
  from the frozen numbering constitution, not defined here.
- BC-006 **consumes** BC-004 (Entitlement, Outstanding, Teacher Debt), BC-005 (cancellation
  mechanics), and BC-003 (immutable facts) with meaning intact; it **originates no new
  foundational truth** (Constitutional Independence).
- **Checkpoint C3 is COMPLETE**; the Transformation layer (BC-004 rights · BC-005 reversals
  · BC-006 discharge) is self-contained — every settlement transition is explicable using
  only BC-003…BC-006.

## Consequences

- **New document:** BC-006 (FROZEN, `docs/business/`); **Checkpoint C3 COMPLETE**;
  **Checkpoint C4 OPEN** (BC-007 next).
- **Governance memory:** GOV-008 gains **LES-020 — Architectural Saturation Principle**
  (practice-verified; BC-006 as Reference Case).
- **P2-000 tracker:** BC-006 → FROZEN; BC-007 NEXT.
- **Registers:** IDX-001, DEC-000 (next ADR-0045), GOV-009, RDM-001, P2-000 tracker.
- **Audit:** AUD-P2-008 — eight gates PASS; four-filter review PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-008, GOV-009, RDM-001, P2-000 (LIVING). No domain,
  product, or frozen governance content changed.
