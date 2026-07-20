# ADR-0047 — BC-009 Phase 2 Traceability Matrix & Coverage Adopted

| Field | Value |
|---|---|
| ADR | 0047 |
| Title | BC-009 Phase 2 Traceability Matrix & Coverage Adopted |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Final constitutional document of Phase 2 (**Checkpoint C5**) and the **constitutional sink** of
BC-001…BC-008. BC-009 is **not** a Business Rules document and **not** an Observation document in
the sense of BC-007; its responsibility is **proof, never production**. It creates, modifies,
interprets, narrows, broadens, and legitimizes nothing — it demonstrates that the frozen
constitutional rule set satisfies the Phase-2 closure criteria (BC-000 §8, BX-1…BX-6).

BC-009 was authored as a DRAFT, then revised (Revision-1): §7 made an explicit constitutional
distinction between **Covered** and **Refined Forward / Superseded** (a Domain Rule whose
responsibility was absorbed into later frozen DRs is never presented as "covered"); §9 reinforced
the separation of **Proof from Authorization** (BC-009 demonstrates satisfaction but never
declares closure); §8 recorded a **verbatim-reproduction verification** of all 87 traceability
entries; and a derivational meta-invariant **INV-41 (Constitutional Reproducibility)** was added.
Approved for propagation on 2026-07-20. Decision category (GOV-010 §5): Business.

## Decision

Adopt **BC-009 — Phase 2 Traceability Matrix & Coverage** (FROZEN v1.0.0). BC-009 introduces
**no** Business Rule and **no** Domain Rule; it publishes the closure artifacts of Phase 2:

- **Final DR → BR coverage matrix** (§6): **76** in-scope frozen Domain Rules, each covered by ≥1
  frozen Business Rule.
- **Final BR → DR / PC traceability matrix** (§8): all **87** Business Rules (BR-001…BR-087),
  each dual-cited (Authority of Truth + Authority of Constitutional Legitimacy); **0 orphans**;
  every entry reproduces **verbatim** from the frozen §6 matrices.
- **Completeness** (§7): 90 frozen DR = 76 Covered + **3 Refined Forward** (DR-008, DR-038,
  DR-039) + **11 out-of-scope by citable disposition**; **no gap; no Amendment candidate**.
- **Closure** (§9): BX-1…BX-6 each objectively demonstrated, except the two residuals that
  constitutionally require BC-009's own propagation (its freeze; the closure audit).
- **Validation** (§10) + **INV-41**: every statement is reproducible from frozen artifacts.

## Interpretation boundaries

- **Proof, not production:** BC-009 defines no BR/DR/terminology and introduces no behavior,
  workflow, lifecycle, responsibility, implementation, UX, or reporting.
- **Proof separate from Authorization:** freezing BC-009 completes Checkpoint C5 and satisfies
  BX-5's matrix requirement, but **does not declare Phase 2 closed**. Constitutional closure and
  the opening of Phase 3 require a **separate** Owner Engineering Order issued after this
  propagation is verified.
- **INV-41** is derivational (restates the sink principle); it adds no constitutional truth.
- No frozen document (BC-000…BC-008, Domain, Product, governance) is modified by this adoption.

## Consequences

- **New document:** BC-009 (FROZEN, `docs/business/`); **Checkpoint C5 COMPLETE**; every planned
  P2-000 §5 document is now FROZEN.
- **P2-000 tracker:** BC-009 → FROZEN; Phase 2 awaiting a separate closure-authorization order.
- **Registers:** IDX-001, DEC-000 (next ADR-0048), GOV-009, RDM-001, P2-000 tracker.
- **Audit:** AUD-P2-011 — eight gates PASS; coverage/traceability/completeness/closure
  verification PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, RDM-001, P2-000 (LIVING). No domain, product, or
  frozen governance/business content changed.
