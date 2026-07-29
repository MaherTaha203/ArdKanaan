# ADR-0070 — Phase 5 Visual Exploration Mechanism Authorized (Non-Authoritative Design-Evaluation Vehicles)

| Field | Value |
|---|---|
| ADR | 0070 |
| Title | Phase 5 Visual Exploration Mechanism Authorized |
| Phase | 5 (Component Library Specification) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 5 is OPEN (ADR-0069; P5-000 LIVING). In the Owner Engineering Order of 2026-07-29 the Owner
**accepted** Phase 5 commencement and **explicitly authorized** the temporary Visual Exploration
mechanism that ADR-0069 §Notes / P5-000 §5 had raised as a proposal (and deliberately left *not
adopted*). The mechanism exists because material visual decisions — beginning with the general visual
direction — cannot be approved responsibly from prose alone; the Owner must be able to **see and
compare** alternatives.

Phase 5 governance is **specification-only**: authoritative Phase-5 outputs are CMP-NNN documents /
CP-NNN atoms with **no code, no HTML, no CSS** (GOV-011 §Phase 5; P5-000 P5-1), and the implementation
track (the HTML prototype is **Phase 7**) is gated until Documentation Freeze (RDM-001 §3). This ADR
authorizes a **narrow, non-authoritative** exception for design evaluation **without** weakening either
guarantee. It is the "minimum governance amendment" the Owner requested, completed cleanly and
separately from any design decision.

## Decision

1. **Authorize the Visual Exploration Mechanism (VEM)** for Phase 5. A *visual exploration* is a
   temporary, explicitly **NON-AUTHORITATIVE** artifact produced solely to help the Owner see and
   compare design alternatives during the Owner-controlled design-decision protocol (P5-000 §4).
2. **Rules (VEM-1…VEM-6)** — the Owner's constraints, made testable:
   - **VEM-1 — Outside authoritative specs.** An exploration is never part of the authoritative CMP/CP
     specification set; it carries no Doc-ID, is not registered in IDX-001, and is not CMP/CP/SC
     content.
   - **VEM-2 — Never authority by itself.** No exploration is a design decision; nothing is approved by
     being shown, and no element of an exploration binds anything.
   - **VEM-3 — Never frozen truth.** No exploration is cited as frozen truth by any atom or document.
   - **VEM-4 — Never production.** Explorations are not implementation; they neither open nor advance
     the implementation track (Phase 7+ remain gated). Every value they carry — colour, typography,
     size, spacing, radius, shadow, shell, navigation, component, state — is a **placeholder only**.
   - **VEM-5 — Purpose-bound & visibly labeled.** An exploration exists only to help the Owner see and
     compare; every exploration is clearly and visibly marked **NON-AUTHORITATIVE**.
   - **VEM-6 — Authority only via transcription.** An exploration's ideas become authoritative **only**
     through an explicit Owner-approved design decision that is subsequently **transcribed** into
     Phase-5 CMP/CP specifications (recorded by an ADR + the relevant CMP/CP atom). The exploration
     itself never becomes authority.
3. **Placement & lifecycle.** Explorations are **ephemeral decision-support artifacts** delivered or
   rendered for the Owner; they are **not committed into the authoritative `docs/` specification
   tree**. Any exploration retained for reference must sit in a clearly-marked non-authoritative
   location established by a separate decision and remain labeled per VEM-5. Explorations are archived
   or discarded once the decision they served is taken.
4. **Preserved guarantees (unchanged by this ADR).** Authoritative Phase-5 outputs remain
   specification-only — no code/HTML/CSS in any CMP/CP document (P5-1); the implementation track (Phase
   7 HTML prototype; Phase 12 frontend) remains gated by GOV-011 §2 and Documentation Freeze. The VEM
   changes neither.
5. **Amend P5-000 §5** (v1.0.0 → **v1.1.0**): from "OPEN, NOT YET AUTHORIZED" to **authorized under
   this ADR**, recording VEM-1…VEM-6.

## Consequences

- The **first Phase-5 design decision** (general visual direction / design character) may now be
  supported by **non-authoritative visual explorations** for Owner evaluation, per the Owner Design
  Direction.
- **Administrative / governance only:** **no design decision is taken, no CP atom is authored, no
  visual token is frozen**; no UX (UX/IA/WA/IX/LA), Product (PC/PLP), Business (BC), Domain (DOM), or
  Data (DAT) document is modified.
- **Registers updated in this commit (blast radius):** P5-000 (§5 → v1.1.0), DEC-000 (this ADR
  appended; next → ADR-0071), IDX-001 (v1.53.0; ADR-0070 registered under Phase 5), GOV-009 (Phase-5
  VEM-authorized refresh + ACCEPTED-ADR 69→70).

## Notes

The VEM is a deliberately **scoped** exception, narrow to Owner design evaluation. It does **not** relax
the specification-only nature of authoritative Phase-5 content, does **not** open the implementation
track, and creates no design authority. Authority arrives only when the Owner approves a specific
design decision and it is transcribed into a CMP/CP specification (VEM-6) — the exploration is a lens
for the Owner's eye, never a source of truth.
