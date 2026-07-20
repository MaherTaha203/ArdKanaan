# ADR-0045 — BC-007 Balances & Party Financial Standing Rules Adopted

| Field | Value |
|---|---|
| ADR | 0045 |
| Title | BC-007 Balances & Party Financial Standing Rules Adopted |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

First document of the **Observation** layer (Layer 3), opening Checkpoint C4 under P2-000.
BC-007 was authored under a fully pre-specified constitutional frame (central question,
Principle #1, Observation definition, INV-31, and the four mandatory review filters),
presented as a DRAFT, then revised (Revision-1: remove all constitutional dependency on
BC-008 so BC-007 is self-contained — it reveals from all constitutional financial facts
available to the system and references no later document; BR-067 derives balances from
constitutional truths rather than operation categories; BR-070 defines Party Financial
Standing as a principle rather than enumerating components). Approved on 2026-07-19.
Decision category (GOV-010 §5): Business.

## Decision

Adopt **BC-007 — Balances & Party Financial Standing Rules** (FROZEN): **7 Business Rules**
(BR-067…BR-073) across 7 categories (The Three Balances, Teacher Balance, Teacher Debt
Standing, Party Financial Standing, Statement as View, Full Derivability, Read-Only
Separation); principles RP-31…RP-35; the Observation constitutional definition; Business
Invariants INV-31…INV-35. Every BR dual-cited — Authority of Truth (frozen Domain
DR-009/010/011/012/016/035) + Authority of Constitutional Legitimacy (frozen
PC-003/004/006/007/008).

BC-007 answers *"How are existing constitutional truths revealed without modifying them?"*
under Principle #1 (Observation reveals; it never creates, modifies, reverses, discharges,
or legitimizes) and the founding principle of the layer — *"Aggregation is a mechanism of
revelation, never a source of truth."* It passes all four review filters (Rule, Document,
Set, Constitutional Independence — AUD-P2-009).

## Interpretation boundaries

- Business-layer only: BR-067…073 **reveal** derived truths; they create, modify, reverse,
  discharge, or legitimize nothing.
- BC-007 **consumes** BC-001…BC-006 with meaning intact and **originates no foundational
  truth** (INV-31; Constitutional Independence).
- **Self-contained:** BC-007 has **no forward dependency** on BC-008 or any future document;
  the dependency direction stays strictly Creation → Transformation → Observation.
- Aggregation is demoted to a mechanism of revelation; presentation/UI/analytics are out of
  scope.

## Consequences

- **New document:** BC-007 (FROZEN, `docs/business/`); **Checkpoint C4 OPEN** (Observation
  layer begun; BC-008 next).
- **P2-000 tracker:** BC-007 → FROZEN; BC-008 NEXT.
- **Registers:** IDX-001, DEC-000 (next ADR-0046), GOV-009, RDM-001, P2-000 tracker.
- **Audit:** AUD-P2-009 — eight gates PASS; four-filter review PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, RDM-001, P2-000 (LIVING). No domain, product,
  or frozen governance content changed.
