# ADR-0028 — PC-001 Product Manifesto Adopted

| Field | Value |
|---|---|
| ADR | 0028 |
| Title | PC-001 Product Manifesto Adopted |
| Phase | 1 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 1 (Product Constitution) is in progress under P1-000. PC-001 (Product
Manifesto) is the first document in the P1-000 §9 sequence and Checkpoint C1's
foundation. It was authored under Owner constraints (every statement decision-bearing;
each axiom testable/traceable; no UX/UI/visual/technology/implementation content; build
on — not repeat — Domain Discovery and GOV-012), presented as a DRAFT, revised as
Revision-1 on Owner instruction, and approved on 2026-07-18. Decision category
(GOV-010 §5): Product.

## Decision

Adopt **PC-001 — Product Manifesto** (FROZEN) as the product's supreme law: seven
Product Axioms, each an invariant that constrains every downstream PR, phase, and ADR.

Revision-1 changes (Owner-directed) incorporated:
1. **PA-2 Scope Singularity** reworded so its binding scope is the **product's
   identity**, not the company's future (the absolute "permanently … never acquire"
   replaced by identity-scoped language; expansion beyond one center defines a
   *different* product, not a forbidden future).
2. **Simplicity Ceiling** moved to **PA-1** (the governing filter).
3. New **PA-4 Non-Interrogation** added — the product never asks for information it
   already possesses or can determine from recorded facts — distinguished from PA-3
   Derivation (knowledge vs computation).
4. **Purpose** refocused on *knowability* ("always knowable"), removing the
   UX/latency-adjacent "instantly visible."

## The seven axioms

PA-1 Simplicity Ceiling · PA-2 Scope Singularity · PA-3 Derivation Supremacy ·
PA-4 Non-Interrogation · PA-5 Non-Destruction · PA-6 Non-Authority · PA-7 Total
Auditability. Each carries a Law, the decision it Forces, a mechanical Test, and the
upstream atom it Builds on (never a restatement).

## Interpretation boundaries

- PC-001 is **Product-layer** (GOV-012): every axiom binds every UI and implementation
  identically and survives redesign — no axiom contains UX, visual, or engineering
  content.
- PC-001 introduces **no** business rule (Domain is frozen) and **no** ownership theory
  (GOV-012 is the authority); it elevates cited atoms into testable product invariants.
- The axioms are **acceptance filters** for all later PC documents and PR atoms; a
  requirement that violates an axiom is out of scope by construction (PA-1).

## Consequences

- **New document:** PC-001 (FROZEN, `docs/product/`).
- **P1-000 tracker:** PC-001 → FROZEN; Checkpoint C1 in progress (PC-002, PC-003 next).
- **Registers:** IDX-001 (PC-001, ADR-0028, AUD-P1-002), DEC-000 (ADR-0028; next
  ADR-0029), GOV-009 refreshed.
- **Audit:** AUD-P1-002 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P1-000 (LIVING). No domain or frozen
  governance changed.
