# ADR-0030 — PC-003 Product Mental Model Adopted

| Field | Value |
|---|---|
| ADR | 0030 |
| Title | PC-003 Product Mental Model Adopted |
| Phase | 1 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Third Phase-1 document under P1-000; completes **Checkpoint C1** (foundation:
PC-001…PC-003). Authored under Owner constraints (answers only "what does the product
believe exists?"; 1:1 with DOM-002; the five required fields per concept; the
screen-disappearance validation; no UI/UX/DB/implementation/branding language; no
invented concepts), presented as a DRAFT, revised as Revision-1, and approved on
2026-07-18. Decision category (GOV-010 §5): Product.

## Decision

Adopt **PC-003 — Product Mental Model** (FROZEN): 19 product concepts, 1:1 with
DOM-002, each with Definition, Single Responsibility, Conceptual Relationships,
Ownership Boundary, and Reason for Existing.

Revision-1 changes (Owner-directed) incorporated:
1. Added **§0 The Product's World** (an 11-sentence conceptual narrative).
2. Gave **Registration** a philosophical reason for independent existence (a
   commitment between two parties is a first-class thing, belonging to neither alone).
3. Renamed **Party Financial History → Party Financial Standing** (a concept — a
   state of truth — not a produced report).
4. Added **§4 Mental Model Integrity Rules** (MMI-1…MMI-9).

## Interpretation boundaries

- PC-003 is **Product-layer** (GOV-012): concepts only — no presentation, storage, or
  implementation. Guardian is folded into Student; Registration is a flagged
  necessary abstraction; the "account statement" is modeled as *Party Financial
  Standing* (knowledge), its rendering deferred to Phase 3 (UNK-013).
- No business rule is created (Domain frozen); concepts cite DOM-002/DR upstream.
- The MMI rules become integrity filters for any future concept.

## Consequences

- **New document:** PC-003 (FROZEN, `docs/product/`); **Checkpoint C1 complete.**
- **P1-000 tracker:** PC-003 → FROZEN; C1 complete; C2 (PC-004…006) next.
- **Registers:** IDX-001, DEC-000 (next ADR-0031), GOV-009, P1-000 tracker.
- **Audit:** AUD-P1-004 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P1-000 (LIVING). No domain or frozen
  governance changed.
