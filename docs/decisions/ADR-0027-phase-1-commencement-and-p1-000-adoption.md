# ADR-0027 — Phase 1 Commencement & P1-000 Master Plan Adoption

| Field | Value |
|---|---|
| ADR | 0027 |
| Title | Phase 1 Commencement & P1-000 Master Plan Adoption |
| Phase | 1 |
| Status | ACCEPTED |
| Supersedes | — (supersedes the earlier *presented* P1-000 draft, which was never committed) |
| Superseded by | — |

## Context

On 2026-07-18 the Owner ordered resuming **Phase 1 — Product Constitution** per
P1-000, with **GOV-012 as the sole official authority** for the ownership of any new
decision. Phase 1 was authorized to open by ADR-0025; the three GOV-011 §2 entry
conditions hold (Phase 1A frozen, gates passed, explicit Owner authorization). This
ADR commences Phase 1 work by adopting its governing plan. Decision categories
(GOV-010 §5): Governance, Product (planning).

## Decision

1. **Adopt P1-000 — Product Constitution Master Plan** (LIVING) as the governing
   roadmap for Phase 1.
2. **Adopt the GOV-012-conformant form** of P1-000 (Product-layer-pure, eight
   documents PC-001…PC-008). This **supersedes the earlier presented draft**, whose
   UX-layer documents (Information Architecture, Navigation, Interaction design,
   Workspace, UI-language) GOV-012 Appendix B objectively assigns to **UX (Phase 3)**.
   Adopting the leaky draft would violate the ownership authority just mandated.
3. **GOV-012 is the operative ownership reference** for the phase; every planned
   document is classified Product by its tests (P1-000 §8).
4. **Author PC documents one at a time** under P1-000 §9 (DRAFT → Owner review →
   approval → propagation), in the sequence PC-001 → … → PC-008. No PC content is
   authored by this ADR.

## Interpretation boundaries

- **No domain or frozen governance is modified.** DOM-001…005, GOV-011, GOV-010,
  GOV-012, the constitution documents remain untouched. Phase 1A stays frozen.
- **No Phase 1 content yet.** Only the plan and its governance are established; the
  `docs/product/` directory now holds P1-000 and will receive PC docs on Owner order.
- The deferred UX documents are recorded as Phase-3 inputs, not lost.

## Consequences

- **New documents:** P1-000 (LIVING, `docs/product/`); this ADR; AUD-P1-001
  (`docs/audits/phase-1/`).
- **RDM-001 updated:** Phase 1 status → IN PROGRESS (P1-000 adopted; authoring PC
  documents).
- **Registers:** IDX-001 (P1-000, ADR-0027, AUD-P1-001; §2.2 updated), DEC-000
  (ADR-0027; next ADR-0028), GOV-009 refreshed.
- **Blast radius:** IDX-001, RDM-001, DEC-000, GOV-009 (LIVING); new P1-000 + audit.
  Frozen material untouched.
