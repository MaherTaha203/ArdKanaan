# ADR-0035 — PC-008 Product Validation & Acceptance Criteria Adopted

| Field | Value |
|---|---|
| ADR | 0035 |
| Title | PC-008 Product Validation & Acceptance Criteria Adopted |
| Phase | 1 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Eighth and final Phase-1 document under P1-000 (Checkpoint C4). Authored under the
phase constraints (every AC derived from PC-007; objective, pass/fail-decidable,
technology/UI/implementation/DB-independent; no invented test cases or QA procedures),
presented as a DRAFT, and approved on 2026-07-18 with one required addition
(Constitutional Lock). Decision category (GOV-010 §5): Product.

## Decision

Adopt **PC-008 — Product Validation & Acceptance Criteria** (FROZEN): **22 Acceptance
Criteria** (AC-01…AC-22), each traced to PC-007 requirements and the constitution, with
verification method and Pass/Fail conditions; an acceptance matrix; a coverage review;
a mandatory 100% completeness table with the declaration "no Product Requirement remains
without at least one constitutional Acceptance Criterion"; a Constitution Completion
Statement; the **Constitution Exit Criteria** (EX-1…EX-5); and the **Constitutional
Lock** (Owner-required addition).

Owner-required addition incorporated: **§9 Constitutional Lock** — upon closure,
PC-001…PC-008 are locked as the immutable Product Constitution; changes require an
explicit amendment (GOV-004 §5; PC-004 Tier 3); every downstream artifact is accepted
only against these criteria.

## Interpretation boundaries

- Product-layer only: ACs are acceptance conditions, not test cases/QA/BR/UX/engineering
  artifacts.
- Every AC traces to a PR; every PR is covered by ≥1 AC (no orphans).
- PC-008 is the constitutional verification and formal closure document for Phase 1.

## Consequences

- **New document:** PC-008 (FROZEN, `docs/product/`); **Checkpoint C4 complete.**
- Enables the Phase-1 closure (ADR-0036 + AUD-P1-FINAL) once EX-1…EX-5 hold.
- **Registers:** IDX-001, DEC-000 (next ADR-0036), GOV-009, P1-000 tracker.
- **Audit:** AUD-P1-009 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P1-000 (LIVING). No domain or frozen
  governance changed.
