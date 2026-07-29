# ADR-0072 — Phase 5 CC1: CMP-001 Design Language Constitution Adoption & Freeze (v1.0.0); ADR-0071 Palette-Descriptor Amendment

| Field | Value |
|---|---|
| ADR | 0072 |
| Title | CMP-001 Adoption & Freeze; ADR-0071 Palette-Descriptor Amendment |
| Phase | 5 (Component Library Specification) |
| Status | ACCEPTED |
| Supersedes | ADR-0071 (partial — palette *descriptors* reclassified non-authoritative; its structural direction + LIGHT constraint remain live) |
| Superseded by | — |

## Context

Phase 5 checkpoint **CC1** (the design-language framework). The **Stage-1 Architectural Discovery** for
CMP-001 was approved by the Owner with **10 amendments**. CMP-001 was then drafted and run through the
full **GOV-013** lifecycle: an adversarial **four-lens Panel** (amendment-fidelity → READY;
boundary/no-value, taxonomy/traceability, and frozen-consistency → NOT-READY with genuine BLOCKING/MAJOR
findings) → **revision** (v0.2.x) → an **independent Judge → READY** (all findings resolved, no residual
blocker). The Owner reviewed the outcome and **approved the freeze and this reconciliation**.

During review a **Consume-Don't-Change** tension surfaced: the Owner's amendments 4–5 (the palette
descriptors are non-authoritative; only LIGHT is carried) narrow **ADR-0071's own point-2 palette
characterization**. ADR-0071 is a live ACCEPTED Owner decision, so the lawful path (GOV-004 §5) is an
**amending ADR**, not an inline override inside CMP-001. This ADR is that instrument, and it also adopts
and freezes CMP-001 in one governance operation.

## Decision

1. **Adopt & FREEZE CMP-001 — Design Language Constitution v1.0.0** (`docs/components/CMP-001_DESIGN_LANGUAGE_CONSTITUTION.md`),
   the Phase-5 **framework** (CC1) and the Component-layer analog of BC-000 / UX-001 / DAT-001. It fixes:
   the **Presentation Boundary** (what the component layer may specify vs. consumes as frozen); the
   **five-kind CP-atom taxonomy** (Design-Token · Component-Structure · Component-State ·
   Component-Behaviour · Grammar/Relationship, the last widened to component-**or-token** laws); the
   **token architecture** (primitive→semantic→component) and traceability chain (incl. the frozen
   **UXV-02** pure-presentation-chrome disposition); the **component-contract architecture**; the
   **cross-component grammar**; the **desktop-first, responsively-resilient** stance; the
   **outputs-first-class** principle; the **design-decision process** (research → curated references →
   principles → original alternatives → VEM comparison → Owner review → Owner approval → CP
   transcription); and the invariants **CMV-01…CMV-12**. **CMP-001 decides no visual value and authors
   no CP atom.**
2. **Record the Stage-1 Architectural Discovery approval and the Owner's 10 amendments** as the basis of
   the frozen framework (five-kind taxonomy with Structure/State/Behaviour kept separate;
   primitive→semantic→component traceability; no premature visual decisions; LIGHT as the only carried
   visual constraint; desktop-first/responsively-resilient; neutral CMP document names; the
   research→…→CP-transcription process; a flexible foundation-first decision order; outputs first-class).
3. **Amend ADR-0071 (GOV-004 §5 — partial).** The palette **descriptors** used to *characterize* the
   approved direction — **monochrome · black primary action · single blue accent · "Vercel-style"** and
   any equivalent visual descriptor — are reclassified **NON-AUTHORITATIVE** exploratory
   characterization. What **remains approved and live** from ADR-0071:
   1. **Sophisticated Operational Simplicity** as the structural direction / design discipline;
   2. **LIGHT** as the high-level visual constraint;
   3. **all exact visual values and details are DEFERRED** to later Phase-5 design decisions.
   This is a **partial amendment, not a full supersession**: ADR-0071's structural direction and LIGHT
   constraint stand.
4. **No CP atom, no frozen value.** Concrete tokens, component contracts, and visual values are authored
   in **CMP-002…CMP-009** only after their one-at-a-time Owner design decisions (P5-000 §4; VEM-6). The
   VEM remains exploratory evidence only.

## Consequences

- **Phase-5 CC1 is complete** — CMP-001 is frozen. The next step (the family documents, beginning at the
  first detailed design decision **D0**) is **pending a separate explicit Owner order — not begun by
  this ADR.**
- **Administrative to the constitutions:** no UX (UX/IA/WA/IX/LA), Product (PC/PLP), Business (BC),
  Domain (DOM), or Data (DAT) constitutional truth is modified. ADR-0071's structural direction and
  LIGHT constraint remain authoritative; **only its palette descriptors are reclassified.**
- **Specification-only** — CMP-001 contains no code/HTML/CSS; the implementation track (Phase 7 HTML
  prototype; Phase 12 frontend) remains gated (GOV-011 §2 / Documentation Freeze).
- **Registers updated in this commit (blast radius):** IDX-001 (CMP-001 FROZEN v1.0.0 + ADR-0072
  registered under Phase 5; version bump), DEC-000 (ADR-0072 appended; ADR-0071 row annotated
  partially-amended; next → ADR-0073), GOV-009 (CC1-frozen refresh + history row; frozen-doc count +1;
  ACCEPTED-ADR 71 → 72), RDM-001 (Phase-5 CC1 note).

## Notes

The amendment honours the Owner's explicit CMP-001 framework review (amendments 4–5). ADR-0071 remains
**ACCEPTED and live** for its structural direction and LIGHT constraint; the partial amendment is
recorded here and annotated on ADR-0071's DEC-000 register row, following the ADR-0008 / ADR-0009
partial-supersession precedent. Authority over the concrete design language arrives only when CMP-00N
transcribes the Owner-approved granular values into CP atoms (VEM-6) — the one-at-a-time Owner-approval
discipline (P5-000 §4) continues for every material value that follows.
