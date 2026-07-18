# ADR-0029 — PC-002 Product Principles (+ Automation Boundary) Adopted

| Field | Value |
|---|---|
| ADR | 0029 |
| Title | PC-002 Product Principles (+ Automation Boundary) Adopted |
| Phase | 1 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Second Phase-1 document under P1-000 (Checkpoint C1). Authored under Owner
constraints (no restatement of PC-001 axioms; each principle derived from a cited
axiom; each must change PR decisions or be deleted; a constitutional Automation
Boundary; no UX/design/implementation/technical content), presented as a DRAFT, and
approved with two required additions on 2026-07-18. Decision category (GOV-010 §5):
Product.

## Decision

Adopt **PC-002 — Product Principles (+ Automation Boundary)** (FROZEN):

- **Six operating principles** PP-1…PP-6, each derived from cited PC-001 axioms and
  each changing how PRs are written (Record-or-Reveal; one authoring point; correction
  is a new record; prefer the smaller model; no hidden state; owner initiates, system
  reacts).
- **The Automation Boundary** — three mutually exclusive, exhaustive categories:
  **A** automatic (rule-mandated reactions), **B** owner's decision (business
  judgments not fixed by facts), **C** derived (single-valued functions of recorded
  facts; no party may set them) — with a mechanical classification test.

Two Owner-required additions incorporated:
1. **AB-1 (single classification):** every atomic decision in every PR carries
   **exactly one** category (A, B, or C); a decision fitting two is not atomic and is
   decomposed (GOV-012 L2/L14).
2. **Reference table (§4):** A/B/C applied to 19 real financial-domain decisions,
   distinguishing an automatic *action* (A) from the derived *value* it produces (C).

## Interpretation boundaries

- PC-002 is **Product-layer** (GOV-012): it governs requirement authoring, not UX,
  design, or implementation; it introduces no business rule and no ownership theory.
- Principles are **derivations**, not restatements — each cites its origin axiom and
  adds operational content that shapes PRs.
- The Automation Boundary + AB-1 become **acceptance filters** for every PR: each PR
  must classify its decisions and honor the category constraints.

## Consequences

- **New document:** PC-002 (FROZEN, `docs/product/`).
- **P1-000 tracker:** PC-002 → FROZEN; Checkpoint C1 continues with PC-003.
- **Registers:** IDX-001 (PC-002, ADR-0029, AUD-P1-003), DEC-000 (ADR-0029; next
  ADR-0030), GOV-009 refreshed.
- **Audit:** AUD-P1-003 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P1-000 (LIVING). No domain or frozen
  governance changed.
