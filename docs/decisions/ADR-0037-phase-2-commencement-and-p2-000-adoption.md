# ADR-0037 — Phase 2 Commencement & P2-000 Master Plan Adoption

| Field | Value |
|---|---|
| ADR | 0037 |
| Title | Phase 2 Commencement & P2-000 Master Plan Adoption |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 1 (Product Constitution) is CLOSED and locked (ADR-0036 / AUD-P1-FINAL). On
2026-07-19 the Owner ordered opening **Phase 2 — Business Constitution**, first
authoring BC-000 as a framework DRAFT, then — after two review revisions — approving
the adoption of P2-000 and BC-000 and the opening of Phase 2. The three GOV-011 §2
entry conditions hold (Phase 1 frozen, all gates passed, explicit Owner authorization).
The Owner directed that **P2-000 — not BC-000 — open the phase**, so BC-000 is a member
document under P2-000. Decision categories (GOV-010 §5): Governance, Business
(planning).

## Decision

1. **Open Phase 2 — Business Constitution** under GOV-011 §2; create `docs/business/`
   and `docs/audits/phase-2/`.
2. **Adopt P2-000 — Business Constitution Master Plan** (LIVING) as the governing
   roadmap for Phase 2: the planned document set BC-000 + BC-001…BC-008, the continuous
   **BR-NNN** rule series, checkpoints C1…C5, and the freeze criterion (BC-000
   BX-1…BX-6). P2-000 §3 fixes the **Constitutional Position**: Phase 2 does not
   redefine the Product Constitution; it operationalizes permitted business behavior
   grounded in the frozen Domain; its authority is constitutional, not
   implementation-oriented.
3. **GOV-012 is the operative ownership reference**; every BR is a Business-layer atom.
4. **Author BC documents one at a time** under P2-000 §7 (DRAFT → review → approval →
   propagation). BC-000 is adopted separately (ADR-0038); no BR content is authored by
   this ADR.

## Interpretation boundaries

- **No domain, product, or frozen governance is modified.** DOM-001…005, PC-001…008,
  GOV-010/011/012 remain untouched; Phases 1A and 1 stay frozen and locked.
- **No business rule yet.** Only the plan and its governance are established; the
  `docs/business/` directory now holds P2-000 (and BC-000 via ADR-0038).
- The Product Constitution lock (PC-008 §9) is honored: Phase 2 derives from and is
  legitimate under it, never reinterpreting it.

## Consequences

- **New documents:** P2-000 (LIVING, `docs/business/`); this ADR; AUD-P2-001
  (`docs/audits/phase-2/`).
- **RDM-001 updated:** Phase 2 status → IN PROGRESS (P2-000 adopted).
- **Registers:** IDX-001 (P2-000, ADR-0037, AUD-P2-001; new §2.3; `docs/business/`
  IN PROGRESS), DEC-000 (ADR-0037; next ADR-0039 after ADR-0038), GOV-009 refreshed.
- **Blast radius:** IDX-001, RDM-001, DEC-000, GOV-009 (LIVING); new P2-000 + audit.
  Frozen material untouched.
