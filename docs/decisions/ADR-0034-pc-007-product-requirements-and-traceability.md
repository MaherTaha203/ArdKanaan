# ADR-0034 — PC-007 Product Requirements & Traceability Adopted

| Field | Value |
|---|---|
| ADR | 0034 |
| Title | PC-007 Product Requirements & Traceability Adopted |
| Phase | 1 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Seventh Phase-1 document under P1-000; completes **Checkpoint C3** (requirements).
Authored under the phase constraints (every PR derived from PC-001…PC-006; no
invention; atomic/verifiable/traceable; technology/UI/implementation/DB-independent),
presented as a DRAFT, revised as Revision-1 (added PR-033 and the Constitutional
Coverage Report), and approved on 2026-07-18. Decision category (GOV-010 §5): Product.

## Decision

Adopt **PC-007 — Product Requirements & Traceability** (FROZEN): **33 Product
Requirements** (PR-001…PR-033) across nine categories, each with ID, statement, type,
constitutional source, affected phases, and verification method; a full traceability
matrix; a coverage review; and the **Constitutional Coverage Report** (each PC-001…
PC-006 at 100%) with the completeness declaration — "no constitutional statement
remains without at least one derived Product Requirement."

Revision-1 (Owner-directed): added **PR-033** (MMI-3 screen-independence) to make
coverage caveat-free, and the mandatory **§6 Constitutional Coverage Report**.

## Interpretation boundaries

- Product-layer only: PRs state what must hold; they create no BR/UX/engineering/schema/
  workflow/API/test artifact (those are later phases).
- Every PR cites a frozen constitutional source; no orphan PR, no uncovered
  constitutional decision.
- The 33 PRs become the requirement basis PC-008 validates and every later phase
  satisfies.

## Consequences

- **New document:** PC-007 (FROZEN, `docs/product/`); **Checkpoint C3 complete.**
- **P1-000 tracker:** PC-007 → FROZEN.
- **Registers:** IDX-001, DEC-000 (next ADR-0035), GOV-009, P1-000 tracker.
- **Audit:** AUD-P1-008 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P1-000 (LIVING). No domain or frozen
  governance changed.
