# ADR-0049 — Phase 3 Commencement & P3-000 UX Constitution Master Plan Adoption

| Field | Value |
|---|---|
| ADR | 0049 |
| Title | Phase 3 Commencement & P3-000 UX Constitution Master Plan Adoption |
| Phase | 3 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 2 (Business Constitution) is CLOSED and locked (ADR-0048 / AUD-P2-FINAL). The same Owner
Engineering Order that closed Phase 2 authorized Phase 3 (Part III) and directed authoring the
Phase-3 master document, **P3-000 — UX Constitution Master Plan** (Part V), and nothing beyond it.
The three GOV-011 §2 entry conditions hold (Phase 2 frozen & locked, all gates passed, explicit
Owner authorization). Decision categories (GOV-010 §5): Governance, UX (planning).

## Decision

1. **Commence Phase 3 — UX Constitution** under GOV-011 §2; open `docs/ux/` for content and
   create `docs/audits/phase-3/`.
2. **Adopt P3-000 — UX Constitution Master Plan** (LIVING) as the governing roadmap for Phase 3:
   phase scope, responsibilities, document map (mission only), constitutional boundaries, phase
   checkpoints, quality gates, and the traceability model. P3-000 fixes the **Constitutional
   Position**: Phase 3 does not redefine the Business Constitution; it explains and presents the
   behavior that BC-000…BC-009 already fix, consuming them exactly as frozen.
3. **GOV-012 is the operative ownership reference** (Business ▷ UX): UX may determine only
   interaction, navigation, information architecture, workspace architecture, forms, visual
   hierarchy, accessibility, usability, and presentation. Business behavior remains exclusively
   owned by the Business Constitution.
4. **Author Phase-3 documents one at a time** under P3-000 (DRAFT → review → approval →
   propagation). **No Phase-3 content beyond P3-000 is authored by this ADR** — screens,
   components, layouts, colors, interactions, and design language belong to subsequent documents.

## Interpretation boundaries

- **No Business, Domain, Product, or frozen Governance content is modified.** BC-000…BC-009,
  DOM-001…005, PC-001…008, and frozen governance remain untouched and locked.
- **No UX rule yet.** Only the plan and its governance are established; `docs/ux/` now holds P3-000.
- The Business Constitution lock (ADR-0048 Part II) is honored: Phase 3 derives from and is
  legitimate under it, never reinterpreting a Business Rule. If UX cannot be produced without
  changing business behavior, work STOPS and a Constitutional Amendment is raised (GOV-004 §5) —
  UX never compensates.

## Consequences

- **New documents:** P3-000 (LIVING, `docs/ux/`); this ADR; AUD-P3-001 (`docs/audits/phase-3/`).
- **RDM-001 updated:** Phase 3 status → IN PROGRESS (P3-000 adopted).
- **Registers:** IDX-001 (P3-000, ADR-0048, ADR-0049, AUD-P2-FINAL, AUD-P3-001; new §2.4;
  `docs/ux/` IN PROGRESS; Phase 2 → CLOSED & LOCKED), DEC-000 (ADR-0048, ADR-0049; next ADR-0050),
  GOV-009 refreshed.
- **Blast radius:** IDX-001, RDM-001, DEC-000, GOV-009 (LIVING); new P3-000 + audits. Frozen
  material untouched.
