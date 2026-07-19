# ADR-0036 — Phase 1 Closure: Product Constitution Frozen & Locked

| Field | Value |
|---|---|
| ADR | 0036 |
| Title | Phase 1 Closure: Product Constitution Frozen & Locked |
| Phase | 1 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 1 (Product Constitution) was authorized by ADR-0027 and governed by P1-000.
Its eight-document set was authored one at a time, each DRAFT → Owner review →
propagation: PC-001 (ADR-0028), PC-002 (ADR-0029), PC-003 (ADR-0030), PC-004
(ADR-0031), PC-005 (ADR-0032), PC-006 (ADR-0033), PC-007 (ADR-0034), PC-008
(ADR-0035). PC-008 §8 defines the Constitution Exit Criteria (EX-1…EX-5) and §9 the
Constitutional Lock. On 2026-07-18 the Owner approved PC-008 with the Constitutional
Lock addition and authorized the Phase-1 closure step (ADR-0036, AUD-P1-FINAL,
Phase 1 declared CLOSED). Decision category (GOV-010 §5): Governance (phase-lifecycle).

## Decision

Declare **Phase 1 (Product Constitution) CLOSED**. All eight documents PC-001…PC-008
are **FROZEN** and, per PC-008 §9, **LOCKED** as the single, immutable Product
Constitution:

- **PC-001** Product Manifesto — axioms PA-1…PA-7.
- **PC-002** Product Principles — PP-1…PP-6, Automation Boundary (A/B/C), AB-1.
- **PC-003** Product Mental Model — 19 concepts, MMI-1…MMI-9.
- **PC-004** Scope, Non-Scope & Anti-Patterns — SC/NS/AP/BT, Extension Classification, Tiers.
- **PC-005** Actors & Access Model — AX-1…AX-5.
- **PC-006** Product Language & Glossary — NR-1…NR-4, GG-1…GG-4, canonical glossary.
- **PC-007** Product Requirements & Traceability — PR-001…PR-033, coverage report.
- **PC-008** Product Validation & Acceptance Criteria — AC-01…AC-22, Exit Criteria, Lock.

The Constitution Exit Criteria (PC-008 §8) are all satisfied (AUD-P1-FINAL): EX-1
(all frozen), EX-2 (every PR covered by an AC), EX-3 (every AC traceable), EX-4 (no
constitutional decision unrepresented), EX-5 (next phase needs no further
constitutional interpretation).

## Interpretation boundaries

- Closure is a governance act, not a product decision: it introduces no new
  constitutional statement; it certifies the eight existing documents.
- The Constitutional Lock (PC-008 §9) takes effect from this closure: no later phase,
  document, or decision may reinterpret, weaken, or override a constitutional
  statement; any change requires an explicit constitutional amendment (GOV-004 §5;
  PC-004 Tier 3), never an ad-hoc reading.
- **Phase 2 (Business Constitution) is NOT opened by this ADR.** It remains NEXT and
  requires an explicit Owner Engineering Order per the universal phase-entry law
  (GOV-011 §2). This ADR only certifies that the Phase-1 precondition (previous phase
  frozen, all gates passed) will hold for that future authorization.

## Consequences

- **Phase 1 CLOSED**; the Product Constitution is the sole product reference for all
  later phases and is accepted-against, not reinterpreted (PC-008 §9).
- **Registers:** RDM-001 (Phase 1 → CLOSED), DEC-000 (next ADR-0037), IDX-001,
  GOV-009, P1-000 tracker (all PC frozen; C1…C4 complete; phase complete).
- **Audit:** AUD-P1-FINAL — Product Constitution Completion Report; EX-1…EX-5 all met.
- **Blast radius:** RDM-001, IDX-001, DEC-000, GOV-009, P1-000 (all LIVING). No domain
  or frozen governance content changed.
- **Next:** await an explicit Owner Engineering Order to authorize Phase 2 (GOV-011 §2).
