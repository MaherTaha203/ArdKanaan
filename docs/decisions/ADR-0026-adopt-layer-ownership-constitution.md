# ADR-0026 — Adopt GOV-012 Layer Ownership Constitution

| Field | Value |
|---|---|
| ADR | 0026 |
| Title | Adopt GOV-012 Layer Ownership Constitution |
| Phase | 0 (governance extension) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Across the Phase-1 architecture reviews the project developed a general ownership
theory (Layer Ownership Algorithm, Minimal Perturbation, Decomposition Rule,
Determinism/Totality, Invariance) that outgrew its original purpose. On 2026-07-18 the
Owner authorized adopting it as a permanent governance constitution — **GOV-012 —
after adding two laws** and requiring that they integrate **without conflict** with the
LOA and Minimal Perturbation:

- **Capability Decomposition Law** (Capability → Behavior → Implementation).
- **Behavior Separation Law** (existence of a feature ≠ how it is used ≠ how it is
  built).

This is a Phase-0 governance extension, following the precedent of ADR-0006 (platform
extension), ADR-0011 (GOV-011), and ADR-0012 (GOV-010) — adding governance after
Phase 0 by explicit Owner order, with an ADR and an audit. Decision category
(GOV-010 §5): Governance.

## Decision

1. **Adopt GOV-012 — Layer Ownership Constitution** (FROZEN) as the permanent,
   mechanical authority for classifying which layer owns any engineering decision,
   applying to every phase, ADR, and future governance document.
2. **Integrate the two Owner-mandated laws** as **L16 (Capability Decomposition)** and
   **L17 (Behavior Separation)**.
3. **Certify no conflict** with the existing method: L16 is a specialization of the
   Decomposition Rule (L2); L17 is a corollary of Edit-Locality (L3), Single-Owner
   (L14), and No-Upward-Invention (L15). Both preserve Minimal Perturbation (L4) —
   existence, usage, and construction have three distinct minimal perturbations and
   three distinct edit localities. Proof recorded in GOV-012 §4.1.
4. **GOV-012 is amendable only by the Owner** (GOV-004 §5); practice gaps become
   amendments, never ad-hoc rulings.

## Interpretation boundaries

- GOV-012 is a **Governance-plane** artifact; it governs *how ownership is decided*,
  not *what the product is*. It creates no business rule, product requirement, or UX
  decision.
- **No frozen document is modified.** GOV-011 (Master Roadmap), GOV-010, the
  constitution documents, and P1-000 are untouched. GOV-012 stands alongside them and
  is referenced, not merged.
- GOV-012 does not itself reclassify any existing document or recommend moving any
  work between phases; it supplies the *method* future orders may invoke.

## Consequences

- **New governance document:** GOV-012 (FROZEN).
- **Registers updated:** IDX-001 (GOV-012, ADR-0026, AUD-P0-005), DEC-000 (ADR-0026;
  next ADR-0027), GOV-009 refreshed.
- **Audit:** AUD-P0-005 (governance extension) — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009 (LIVING). No stack document, no frozen
  governance, no domain document changed.
