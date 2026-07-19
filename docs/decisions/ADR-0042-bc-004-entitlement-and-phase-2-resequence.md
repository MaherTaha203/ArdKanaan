# ADR-0042 — BC-004 Teacher Entitlement & Debt Rules Adopted; Phase 2 Resequenced (Option A)

| Field | Value |
|---|---|
| ADR | 0042 |
| Title | BC-004 Teacher Entitlement & Debt Rules Adopted; Phase 2 Resequenced (Option A) |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |
| Amends | BC-001 (v1.0.1), BC-002 (v1.0.1), BC-003 (v1.0.1) — forward-reference numbers only |

## Context

Fourth business-rule document of Phase 2 under P2-000 (Checkpoint C3). BC-004 was authored
in the DRAFT → Review methodology answering exactly one question — *"When does teacher
entitlement arise, what changes it, and how is teacher debt defined?"* — scope confirmed
by the Owner (entitlement, never settlement), then revised (Revision-1: BR-046 made neutral
— a debt is *revealed when settlement exceeds final entitlement*, not pre-defining
"Payments"; BR-045 gains the BR-045→BR-046 hand-off sentence; Constitutional Boundary gains
"BC-004 never authorizes payment"). Approved on 2026-07-19. The same order adopted the
Owner's **Entitlement/Settlement separation** and the **Option A** Phase-2 resequence.
Decision category (GOV-010 §5): Business (+ Governance planning; + a documented amendment).

## Decision

1. Adopt **BC-004 — Teacher Entitlement & Debt Rules** (FROZEN): **8 Business Rules**
   (BR-041…BR-048) across 5 categories (Entitlement Origin, Basis, Independence, Reduction,
   Teacher Debt Definition); principles RP-16…RP-20; Business Invariants INV-16…INV-20; a
   **Constitutional Boundary** (entitlement only; payment/settlement excluded; settlement
   governed by BC-006; *BC-004 never authorizes payment*). Every BR dual-cited — Authority
   of Truth (frozen Domain DR-015/029/031/062/063/064/065/066/067/069) + Authority of
   Constitutional Legitimacy (frozen PC-003/004/006/007/008).
2. **Resequence Phase 2 (Option A)** in P2-000, establishing the constitutional principle
   *Entitlement creates a right; Settlement discharges a right — never merged*: BC-004
   Entitlement & Debt · BC-005 Refund & Adjustment · **BC-006 Teacher Payment & Settlement
   (new)** · BC-007 Balances · BC-008 Non-Program · BC-009 Traceability. Checkpoints
   updated (C3 = BC-004/005/006; C4 = BC-007/008; C5 = BC-009).

### Renumbering table (planning refinement)

| Old | New | Document |
|---|---|---|
| BC-006 | **BC-007** | Balances & Party Financial Standing Rules |
| BC-007 | **BC-008** | Non-Program Revenue, Expense & Lifecycle Rules |
| BC-008 | **BC-009** | Phase 2 Traceability Matrix & Coverage |

*(BC-006 is newly assigned to Teacher Payment & Settlement Rules.)*

> **Numbering only changed. Constitutional meaning unchanged.**

3. **Apply the documented forward-reference amendment** to the previously frozen BC-001,
   BC-002, BC-003 (bumped to v1.0.1): every forward-reference to old BC-006 (balances) →
   BC-007, and old BC-007 (non-program) → BC-008, in the same commit. **Only document
   pointer numbers changed; no business rule, statement, scope, or meaning was altered**
   (verified: every DR-/PC-/PR- token is byte-for-byte unchanged). This is reference
   hygiene under GOV-004 §5 / BC-000 §BCG-3, not semantic drift.

## Interpretation boundaries

- Business-layer only: BR-041…048 state entitlement and the *definition* of debt; they
  introduce no settlement, payment, refund-event, or balances-aggregation rule.
- BC-004 **consumes** BC-001 (split) and BC-003 (posting) with meaning intact; it holds
  **forward dependencies** (not consumption) on BC-005 (refund event) and BC-006
  (settlement facts).
- The amendment to BC-001/002/003 is numeric only; the constitution's meaning is preserved.

## Consequences

- **New document:** BC-004 (FROZEN, `docs/business/`); Checkpoint C3 open (BC-004 of
  BC-004/005/006).
- **Amended (v1.0.1, numbers only):** BC-001, BC-002, BC-003.
- **P2-000:** §5 document set + §6 (BC-009 matrix) + §7 sequence/checkpoints resequenced;
  tracker → BC-004 FROZEN, BC-005 NEXT, BC-006 new.
- **Registers:** IDX-001, DEC-000 (next ADR-0043), GOV-009, RDM-001, P2-000 tracker.
- **Audit:** AUD-P2-006 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, RDM-001, P2-000 (LIVING); BC-001/002/003
  amended (numeric). No domain or frozen governance content changed.
