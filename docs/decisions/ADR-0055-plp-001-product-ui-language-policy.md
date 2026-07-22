# ADR-0055 — PLP-001 Product UI Language Policy Adopted (Language-Selection Ownership Gap Filled)

| Field | Value |
|---|---|
| ADR | 0055 |
| Title | PLP-001 Product UI Language Policy Adopted; Language-Selection Ownership Gap Filled |
| Phase | 1 (Product Constitution — post-closure gap-fill) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The UX-005 (Language, RTL & Accessibility) Constitutional Readiness Verification returned **NOT
READY**: five of six Panel reviewers found a Blocking defect — LA-02 captured the decision "which
language(s) the product supports" inside a **UX** atom, contradicting **GOV-012 Appendix C #32**,
which classifies "Support Arabic + RTL (requirement)" as **product scope** (mirroring→UX,
glyphs→Visual, strings→Eng).

A read-only Constitutional Boundary Ownership Investigation confirmed the tension between frozen
authorities (GOV-012 #32 / §5 LOA Q2 / L16 → Product; ADR-0005 §3 and P1-000 → "UI language" to UX;
PC-004 contains no language atom). Per the Owner Constitutional Directive, the ambiguity was
escalated rather than resolved. The **Owner Decision** was:

> **Product owns the decision of which language(s) the product supports. For V1, the product
> supports Arabic only. This is a Product policy decided by the Owner. UX does not own language
> selection; UX owns only how the approved product language is presented (RTL, presentation
> fidelity, and perceivability).**

This established that the situation was a **missing Product ownership** — the selection decision is
Product-scope but no frozen Product atom fixed it. This ADR records that decision as a Product-layer
atom (PLP-001).

## Decision

1. **Adopt PLP-001 — Product UI Language Policy** (`docs/product/PLP-001_PRODUCT_UI_LANGUAGE_POLICY.md`),
   **FROZEN v1.0.0**, atoms **PLP-1…PLP-5**:
   - PLP-1 — ownership of language selection is **Product** (Owner);
   - PLP-2 — V1 supported UI language is **Arabic only**; no localization engine (PA-2 / AP-1);
   - PLP-3 — UX consumes the policy and owns **only** presentation (RTL/mirroring, fidelity,
     perceivability); UX may not select a language;
   - PLP-4 — translation/strings → Engineering; glyphs → Visual;
   - PLP-5 — changing supported language is a Product decision flowing downward (L8), never a UX
     amendment.
2. **Constitutional owner of "which language(s) the product supports" = Product** (GOV-012 §5 LOA
   Q2, L16, Appendix C #32). The "UI language" references in ADR-0005 §3 and P1-000 are hereby read
   (per the Owner Decision) as the **presentation** stratum (UX), distinct from the **selection**
   stratum (Product). No contradiction between the frozen authorities remains once decomposed
   (GOV-012 L2/L16).

## Engineering-vehicle rationale (per Owner Engineering Directive)

The Owner reserved constitutional substance to himself and delegated **engineering packaging** to
the engineer, to be chosen for: (1) existing architecture, (2) minimal change, (3) lowest governance
cost, (4) highest traceability, (5) frozen-document stability. Among the vehicles that preserve the
identical constitutional meaning, a **standalone Product atom backed by its own ADR** was selected
because it: mirrors ADR-0005 §3's own template ("an atom backed by its own ADR"); modifies **no**
locked document (PC-001…PC-008 untouched — criteria 2 & 5); costs **one** ADR with no GOV-004 §5
lock-break or PC-004 re-gating (criterion 3); and yields a **citable** atom for UX-005 to consume
(criterion 4). Amending PC-004 (reopens a locked document) and ADR-only (no citable atom) were both
dominated.

## Governance basis

PLP-001 **records an explicit Owner Decision** (ownership + V1 policy); its constitutional legitimacy
derives directly from that decision under GOV-012 #32, not from independent constitutional design.
It is therefore adopted as a **decision-recording gap-fill atom** by Owner Engineering Order + this
ADR. The GOV-013 multi-agent Panel is **not** invoked for PLP-001 (there is no contested
constitutional design to adversarially review — the substance is Owner-decided); the Owner may order
a Panel over PLP-001 if desired. No separate phase-audit (AUD-P1-NNN) is created: PLP-001 is a
post-closure gap-fill, not a Phase-1 deliverable in the original closed set.

## Adoption gate check (embedded)

- **Scope purity:** PLP-001 defines no UI/screen/component/font/direction-mechanic/locale-mechanism;
  Product-layer only. ✓
- **No frozen-document modification:** PC-001…PC-008 and PC-006 untouched; no locked artifact
  reopened. ✓
- **Consistency:** consumes GOV-012, ADR-0005, PC-004, PC-006 exactly as frozen; introduces no
  Business Rule; reinterprets nothing (the ADR-0005 §3 decomposition is per the Owner Decision, not
  an engineering reinterpretation). ✓
- **Traceability:** every atom cites its frozen authority (GOV-012 #32/Q2/L16/L8; PC-004 §6;
  GOV-004 §5; PA-2/AP-1). ✓

## Consequences

- The language-selection ownership gap is **closed**; Product now carries the authority UX-005 must
  consume.
- **UX-005 becomes eligible for Revision 2**: remove LA-02's selection claim, the §4
  amendment-routing-through-LA-02, and LA-10's language-scope clause; reframe LA-02 as UX
  **presenting** the PLP-001-approved language; retain RTL/direction/fidelity/perceivability; then
  re-run Readiness Verification. (Separate Owner order / GOV-013 stage.)
- Adding a language in any future version is a **Product** decision (PLP-5), never a UX edit.
- Registers updated in this same commit: IDX-001 (PLP-001, ADR-0055; v1.45.0), DEC-000 (ADR-0055;
  next → 0056), GOV-009 (counts + refresh), RDM-001 (Phase-1 post-closure note).
