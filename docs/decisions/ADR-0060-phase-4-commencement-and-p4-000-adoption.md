# ADR-0060 — Phase 4 Commencement & P4-000 DDL Specification Master Plan Adoption

| Field | Value |
|---|---|
| ADR | 0060 |
| Title | Phase 4 Commencement & P4-000 Master Plan Adoption |
| Phase | 4 (DDL Specification) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phases 1 (Product), 2 (Business), and 3 (UX) are FROZEN & CLOSED, each with all eight gates passed
(ADR-0036 / ADR-0048 / ADR-0059). The Owner has authorized proceeding to Phase 4. The universal
phase-entry law (GOV-011 §2) is therefore satisfied: previous phase frozen, all gates passed, explicit
Owner authorization.

Phase 4 (DDL Specification) documents the product's complete data model **as specification** —
entities, attributes, keys, constraints, integrity rules — **not** executable SQL (GOV-011 §Phase 4).

## Decision

1. **Open Phase 4.** `docs/data/` and `docs/audits/phase-4/` are opened; the documentation pipeline
   advances to Phase 4.
2. **Adopt P4-000 — DDL Specification Master Plan** (`docs/data/P4-000_DDL_SPECIFICATION_MASTER_PLAN.md`)
   as **LIVING v1.0.0** — the governing plan of Phase 4, subordinate to GOV-011.
3. **ID scheme:** Phase-4 documents = **DAT-NNN**; atoms = **DB-NNN** (per GOV-011 outputs). The
   document map (DAT-001 framework → entity/attribute specs → constraints/integrity → DDL
   traceability sink) is *indicative*; the exact decomposition is fixed by a Stage-1 Architectural
   Discovery under GOV-013 before drafting.
4. **Governing principles fixed by P4-000 §3:** P4-1 specification-never-SQL; P4-2 every DB atom cites
   its BR/PR/DR; P4-3 representational completeness (every BR representable; three balances derived,
   receipt splits stored & immutable, timeline append-only); P4-4 no new truth; P4-5 intentional
   simplicity (one owner/center/database); P4-6 technology-neutral.
5. **Review discipline:** every Phase-4 *constitutional document* (DAT-001 onward) runs the full
   **GOV-013** Multi-Agent Review Protocol lifecycle. P4-000 itself is a **LIVING governing plan** and
   is adopted directly, following the P2-000 (ADR-0037) / P3-000 (ADR-0049) precedent — a plan, not a
   rule-document introducing constitutional atoms.

## Consequences

- Phase 4 is OPEN; the next deliverable is **DAT-001 Stage-1 Architectural Discovery** (awaiting a
  separate explicit Owner order).
- Administrative only: **no** constitutional truth is introduced; no Business (BC), Product (PC/PLP),
  Domain (DOM), or UX document is modified. P4-000 introduces no data structure.
- Registers updated in this commit: IDX-001 (P4-000 + ADR-0060; Phase-4 section OPEN), DEC-000
  (next → ADR-0061), GOV-009 (counts + Phase-4 OPENED refresh), RDM-001 (Phase 4 → IN PROGRESS).

## Notes

Phase 4 is the first **specification-of-structure** phase (as opposed to the three constitutions of
behavior). Proof precedes Authorization: a DDL traceability sink (the DB analog of BC-009 / UX-006)
will demonstrate coverage before any Phase-4 closure, and executable DDL remains deferred to the
implementation track (Phase 10), never authored here.
