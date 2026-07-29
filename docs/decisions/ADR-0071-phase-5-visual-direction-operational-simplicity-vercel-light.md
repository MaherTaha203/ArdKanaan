# ADR-0071 — First Phase-5 Design Decision: General Visual Direction Approved (Operational-Simplicity structure + Vercel-style light monochrome palette, light-only)

| Field | Value |
|---|---|
| ADR | 0071 |
| Title | First Phase-5 Design Decision — General Visual Direction |
| Phase | 5 (Component Library Specification) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Under the Owner-controlled design-decision protocol (P5-000 §4 / GOV-010) and the authorized Visual
Exploration Mechanism (ADR-0070), the **first** Phase-5 design decision — the **general visual
direction / design character** — was presented to the Owner through non-authoritative visual
explorations: five treatments of one representative workspace (WS-03 "Money In / سندات القبض"). The
Owner reviewed them and, in this session (2026-07-29), decided.

This ADR **records that Owner decision**. It follows the "Owner Decision" ADR precedent (PLP-001 /
ADR-0055; DR-091 / ADR-0062): it captures an Owner-approved decision rather than a contested
constitutional document, so the GOV-013 Panel is not invoked. It changes no upstream constitution.

## Decision (Owner-approved)

1. **Structural direction — "Sophisticated Operational Simplicity" (exploration Direction ④).** The UI
   recedes behind the work — no visible design metaphor (not a ledger, building, courtyard, heritage
   interface, or SaaS dashboard). Its adopted characteristics: **balanced density** (compact where
   daily repetition needs speed; calm where comprehension needs it — not maximal density, not maximal
   spaciousness); **one unified component grammar** whose relationships are predictable across shell,
   headers, navigation, forms, inputs, selectors, buttons, action hierarchy, tables, filters, search,
   dialogs, validation, loading, empty states, summaries, and printable outputs; **slim page headers**;
   **quiet inline summaries** (not large dashboard cards); a form flow of
   **context → required input → derived info → consequence → action** with derived values revealed
   read-only (IX-08) and permanence surfaced before the act (C2); **compact-yet-calm financial tables**
   whose hierarchy comes from typography, alignment, spacing, grouping, and restrained separators —
   **not** from taller rows; and **print/output parity** through one grammar.
2. **Colour direction — Vercel-style light monochrome, LIGHT MODE ONLY.** A high-contrast monochrome
   palette family: white / near-black + neutral greys, with a **single functional blue accent**
   (focus, links, selection) and a **black primary action**. **Light mode only** for V1 — no dark mode.
3. **Altitude — what this fixes vs. defers.** This decision fixes only the **direction**: the
   Direction-④ structural character (point 1) and the **Vercel-style light monochrome palette family**
   (point 2). It **does not** freeze any exact design token. The precise per-role values — exact colour
   hex and the accent's role scope, the typography family and weight scale, the spacing/rhythm scale,
   radii, borders, and elevation — and **all component contracts (CP atoms)** remain **DEFERRED** to
   subsequent, one-at-a-time Owner-approved decisions, transcribed into CMP-001 (Design Language
   Constitution) and later CMP/CP atoms (VEM-6). **No CP atom is authored and no token is
   constitutionally frozen by this ADR.**
4. **The explorations remain NON-AUTHORITATIVE.** The five exploration treatments (VEM, ADR-0070) that
   informed this decision are a lens, not authority; nothing specific shown in them (a particular
   shell, rail, table, field, button, badge, colour, type, or dimension) is approved by this decision.

## Consequences

- **Next checkpoint — CC1 (Design-Language framework, CMP-001).** The next step is a Stage-1
  Architectural Discovery (GOV-013) scoping **CMP-001**, which will transcribe this direction into the
  design-token taxonomy and the approved palette / typography / spacing / component contracts — each
  granular value confirmed with the Owner per P5-000 §4, one at a time. CMP-001 is authored only after
  that discovery and its upstream Owner decisions (P5-000 §6). Not started by this ADR.
- **Recorded trade-off (Owner's explicit choice governs).** The Vercel-style monochrome palette is
  cool and neutral: it sets aside the earlier "heritage-warmth / brand-derived palette" direction and
  is close to the developer-SaaS aesthetic the Owner earlier wished to avoid. The Owner reviewed this
  trade-off and chose the Vercel light palette regardless; the Owner's explicit decision governs
  (GOV-001 §7.2 — a recommendation is never authority, and neither is a prior recommendation a veto).
  Light-only avoids dark-mode dense-table legibility work in V1.
- **Administrative to the constitutions:** no UX (UX/IA/WA/IX/LA), Product (PC/PLP), Business (BC),
  Domain (DOM), or Data (DAT) document is modified; no constitutional truth changes.
- **Registers updated in this commit (blast radius):** DEC-000 (this ADR appended; next → ADR-0072),
  IDX-001 (v1.54.0; ADR-0071 registered under Phase 5), GOV-009 (first-design-decision refresh +
  ACCEPTED-ADR 70→71), RDM-001 (Phase-5 note: first design decision approved; CC1/CMP-001 next).

## Notes

This is the first authoritative Phase-5 **decision of direction**, not a specification: authority over
the concrete design language arrives only when CMP-001 transcribes the Owner-approved granular values
into CP atoms (VEM-6). The one-at-a-time Owner-approval discipline (P5-000 §4) continues for every
material value that follows.
