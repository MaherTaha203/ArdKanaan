# ADR-0046 — BC-008 Non-Program Revenue, Expense & Lifecycle Rules Adopted

| Field | Value |
|---|---|
| ADR | 0046 |
| Title | BC-008 Non-Program Revenue, Expense & Lifecycle Rules Adopted |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Second and final document of **Checkpoint C4** under P2-000, and the last **Creation-layer**
document of Phase 2. BC-008 governs the center-only financial facts that sit alongside the
program-fee facts of BC-001…BC-003: **non-program revenue** (exam, certificate,
book/material), **expenses** (the center's operating costs), and **expense returns** — and,
within that frame, the shared Owner-controlled operational-status lifecycle carried by
Program, Teacher, and Registration.

BC-008 was presented as a DRAFT, then revised (Revision-1): its **primary constitutional
responsibility** was clarified as the **creation of center-only financial facts**, with the
lifecycle pattern reframed as a **supporting element governed within that frame** rather than
an independent responsibility; BR-086 was generalized so Inactive-Left **blocks only future
business creation** (its instance being a new program assignment); and BR-087 was scoped to
govern **only the three current operational statuses**, imposing no rule on any future entity.
Approved for propagation on 2026-07-20. Decision category (GOV-010 §5): Business.

## Decision

Adopt **BC-008 — Non-Program Revenue, Expense & Lifecycle Rules** (FROZEN): **14 Business
Rules** (BR-074…BR-087) across 7 categories (Revenue Source, Non-Program Revenue, Expense
Definition, Expense Recording, Expense Effect, Expense Return, Peripheral Lifecycle);
principles RP-36…RP-40; Constitutional Principle #1 and the Constitutional Boundary; Business
Invariants INV-36…INV-40. Every BR dual-cited — Authority of Truth (frozen Domain
DR-049/050/051/052/053/054/055/056/057/058/059/060/061/080/081/082/083/084/088) + Authority
of Constitutional Legitimacy (frozen PC-001…PC-008).

BC-008 answers *"How are center-only financial facts (non-program revenue and expenses)
created and governed, and how are peripheral lifecycles maintained?"* under Principle #1
(center-only facts touch **only** the center's Cash and Center Net balances and **never** a
teacher's entitlement, balance, or debt; peripheral operational statuses never rewrite prior
financial effects).

## Interpretation boundaries

- Business-layer only: BR-074…087 **create** center-only facts and govern the peripheral
  lifecycle within that frame; they define no program-fee distribution, entitlement,
  settlement, balance revelation, UI, reporting, or analytics.
- BC-008 **consumes** BC-003 (posting/immutability/numbering) and BC-005 (cancellation
  mechanics) with meaning intact and **never touches a teacher's rights**.
- **Self-contained forward-wise:** BC-008 has **no forward dependency**. It creates facts that
  BC-007 already reveals (BC-007 is self-contained); the dependency direction stays strictly
  Creation → Transformation → Observation, with BC-008 in the Creation layer.
- An expense return is a **smaller cost, never income**; revenue distribution applies
  **exclusively** to program fees.

## Consequences

- **New document:** BC-008 (FROZEN, `docs/business/`); **Checkpoint C4 COMPLETE** (Creation
  layer closed; only BC-009 traceability remains).
- **P2-000 tracker:** BC-008 → FROZEN; BC-009 NEXT (Checkpoint C5).
- **Registers:** IDX-001, DEC-000 (next ADR-0047), GOV-009, RDM-001, P2-000 tracker.
- **Audit:** AUD-P2-010 — eight gates PASS; center-only isolation and lifecycle self-check PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, RDM-001, P2-000 (LIVING). No domain, product,
  or frozen governance content changed.
