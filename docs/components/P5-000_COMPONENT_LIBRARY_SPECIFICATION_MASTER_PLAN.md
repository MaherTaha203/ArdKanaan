# P5-000 — Component Library Specification Master Plan

| Field | Value |
|---|---|
| Doc ID | P5-000 |
| Title | Component Library Specification Master Plan |
| Phase | 5 (Component Library Specification) |
| Status | LIVING (Phase 5 opened 2026-07-29, ADR-0069) |
| Version | 1.0.0 |
| Depends on | GOV-011 (§Phase 5 — the only legal phase spec); GOV-012 (layer ownership); GOV-003 (gates); GOV-004 (amendment/review); GOV-006 (traceability); GOV-010 (Owner Decision Protocol); GOV-013 (Multi-Agent Review Protocol); UX-001…UX-006 (frozen); PLP-001 (frozen); PC-001…PC-008 (frozen & locked); BC-000…BC-009 (frozen & locked); DAT-001…DAT-006 (frozen) |
| Answers | "How is Phase 5 — the specification of the product's design language and component contracts — scoped, structured, governed, Owner-approved, and closed?" |
| Governed by | GOV-011 §2 (phase-entry law) · GOV-010 (Owner Decision Protocol) · GOV-013 (Multi-Agent Review Protocol) |

---

> **Nature of this document.** P5-000 is the **LIVING governing plan** of Phase 5 — the Component
> analog of P2-000 / P3-000 / P4-000. It fixes what Phase 5 *is*, the documents it produces, the
> principles every one of them obeys, the Owner-controlled design-approval discipline it runs under,
> and its closure conditions — **without deciding a single visual characteristic** (no colour, type,
> spacing, sizing, radius, border, shadow, component, or state) and **without authoring a single CP
> atom**. Phase 5 specifies the design language and component contracts as **specification**, never
> as code, HTML, or CSS. Every material design decision belongs to the **Owner**, taken one at a time
> (GOV-010; the Owner Engineering Order of 2026-07-29).

## 1. Constitutional position

Phase 5 sits **below** the frozen constitutions and **above** screens and implementation:

```
Business (BC-000…009) ┐
Product  (PC + PLP)   │
Domain   (DOM/DR)     ├─ consumed as frozen ──► Phase 5: Component Library Spec (CMP-NNN / CP atoms)
Data     (DAT/DB)     │                                   │ consumed, never modified
UX       (UX-001…006) ┘  (the direct upstream)            ▼
                                              Phase 6 Screen Blueprints (SCR/SC) ──► Phase 12 Frontend
```

Phase 5 **specifies** the surface vocabulary (a design language + component contracts) that the frozen
UX rules require in order to be screened in Phase 6 and built in Phase 12. It **implements nothing**.
Per GOV-012, the visual/component layer sits below UX and above engineering: Phase 5 records the
component contracts as specification and **consumes UX/PLP/PC/BC/DAT exactly as frozen, modifying
nothing upstream** (Consume-Don't-Change).

## 2. Mission & the one question

> **Specify the product's design language and a complete set of component contracts — such that every
> frozen UX rule that needs a surface vocabulary has a contract, every Phase-6 screen need is
> expressible from the contracts, no component element lacks an upstream citation, and no code, HTML,
> or CSS is authored.**

## 3. Governing principles (Phase-5 law — each testable at freeze)

- **P5-1 — Specification, never code.** Phase 5 produces *documents* (design language + component
  contracts), never HTML, CSS, JavaScript, framework, or runtime code. No markup, no stylesheet, no
  library. (GOV-011 §Phase 5.)
- **P5-2 — Upstream-cited or it does not exist.** Every **CP atom** (a component, its structure, a
  state, a behaviour, a consumed design token) **cites** the frozen authority it serves — a UX atom
  (UXP/UXV/IA/WA/IX/LA…) and, through it, a BR/PR. No component element without a citation (GOV-006).
- **P5-3 — Compositional completeness.** Every frozen UX rule that requires a surface vocabulary has a
  component contract; every Phase-6 screen need must be **expressible** from the component contracts
  alone (GOV-011 §Phase 5 success criteria).
- **P5-4 — No new truth.** Phase 5 introduces **no** Business, Product, Domain, Data, or UX rule and
  **redefines none**. It specifies the presentation vocabulary that already-frozen truth requires
  (the representational-non-creation principle).
- **P5-5 — Intentional simplicity.** One owner, one training center, single-user (AX-1/AX-2/AX-4): no
  role-based components, no permission states, no multi-tenant theming. Arabic-only / RTL default
  (PLP-001; UX-005 LA-04…06). The component set is as small as the frozen constitutions require and no
  larger.
- **P5-6 — Technology-neutral.** The specification names no framework, CSS methodology, component
  library, design-tool, icon set implementation, or rendering technology; it fixes *what a component
  must be and guarantee*, not *how it is built* (implementation = Phases 7 and 12).
- **P5-7 — Owner-controlled design authority.** Per the Owner Engineering Order (2026-07-29), **every
  material design decision** — visual identity, colour, typography (incl. Arabic typography), spacing,
  sizing, radii, borders, shadow/elevation, application shell, navigation appearance, and every
  component's visual and state characteristics — is **decided by the Owner**, one at a time (§4). A
  recommendation is never authority (GOV-001 §7.2); **nothing becomes a frozen Phase-5 rule or CP
  atom until the Owner explicitly approves it.**

## 4. Owner-controlled design-decision protocol (Phase-5 operating rule)

Phase-5 design decisions are surfaced to the Owner **one at a time**, most-upstream-first. For each
decision, the executor:

1. **A.** States what the frozen authorities require or constrain (cite UX/PLP/PC/BC/DAT).
2. **B.** States what remains genuinely open for design.
3. **C.** Explains the decision in simple language (Arabic for Owner-facing presentation, PLP-001).
4. **D.** Presents a small number of coherent alternatives.
5. **E.** Gives a recommendation and explains why.
6. **F.** When the decision is materially visual, provides or prepares a visual comparison (subject to
   §5 governance) rather than relying only on prose.
7. **G.** Asks for explicit Owner approval.
8. **H.** **STOPS.**
9. **I.** Does not proceed to the next design decision until the Owner responds.

Owner approval may **accept** an option, **reject all**, **combine** alternatives, **request
modifications**, or **request new alternatives**. Only after explicit approval is a decision recorded
(an ADR and the corresponding CMP/CP atom). This protocol is the Phase-5 expression of GOV-010.

## 5. Visual exploration under specification-only governance — **OPEN, NOT YET AUTHORIZED**

- **The constraint (exact).** GOV-011 §Phase 5 and `docs/components/README.md` fix Phase 5 as
  specification with **no code, no HTML, no CSS**; RDM-001 §3 forbids the entire implementation track
  (the HTML prototype is **Phase 7**) until Documentation Freeze (all of Phases 1–6 frozen).
- **The tension.** Step 4.F (visual comparison for materially-visual decisions) may require
  non-production visual artifacts, which the specification-only rule does not currently permit.
- **Stance (per the Owner Engineering Order's Visual Exploration Rule).** This document does **not**
  create that exception. A **minimum governance-compliant mechanism** for temporary,
  explicitly-non-authoritative visual exploration is presented to the Owner as a **separate governance
  proposal** (ADR-0069 §Notes). Until the Owner authorizes it, materially-visual decisions are
  evaluated by structured description only; any exploratory visual remains non-authoritative and is
  **never cited by a CP or SC atom**. The exception is created **only** on explicit Owner
  authorization (GOV-004 §5 / GOV-011 §Conflict rule).

## 6. Document map *(indicative — refined per a Stage-1 Architectural Discovery under GOV-013)*

| Doc | Working title | Responsibility |
|---|---|---|
| **P5-000** | Component Library Specification Master Plan | this governing plan (LIVING) |
| **CMP-001** | Design Language Constitution | the framework (the Component analog of BC-000 / UX-001 / DAT-001): the design-token taxonomy, the CP-atom taxonomy, and the consumption boundary — *its concrete values are supplied by Owner-approved design decisions (§4), not authored here* |
| **CMP-00N** | Component-family contracts | per-family contracts (structure · states · behaviour · consumed tokens) for the families the frozen UX rules require |
| **CMP-final** | Component Traceability Matrix & Coverage (the CP sink) | proof: every CP atom → its UX/BR authority; every UX rule needing a surface → its CP atom; 0 orphan / 0 gap (the Component analog of BC-009 / UX-006 / the DDL sink) |

*(The exact document count and boundaries are fixed by a Stage-1 Architectural Discovery before
drafting, per GOV-013 — this plan does not pre-commit the decomposition, and no CMP document above is
authored until its upstream Owner design decisions are approved.)*

## 7. ID scheme

Phase-5 documents = **CMP-NNN**; atoms = **CP-NNN** (GOV-011 §Phase 5 outputs). Every CP atom cites its
UX (and through it BR/PR) authority.

## 8. Checkpoints

- **CC1 — Design-language framework:** CMP-001 (token taxonomy, CP-atom taxonomy, consumption
  boundary), fed by the Owner-approved upstream design decisions.
- **CC2 — Component contracts:** the component-family contracts (structure · states · behaviour).
- **CC3 — Composition & coverage:** every UX rule needing a surface, and every Phase-6 screen need,
  expressible from the contracts.
- **CC4 — Traceability + phase audit:** the CP sink (proof precedes authorization).

## 9. Governance & review

- **Review under GOV-013** — every Phase-5 *constitutional document* (CMP-001 onward) runs the full
  Multi-Agent Review Protocol lifecycle (Discovery → Draft → Self-Hardening → Revision → Readiness
  Verification → Gate → Owner Approval → Propagation → Freeze). P5-000 itself is a **LIVING governing
  plan**, adopted directly per the P2-000 / P3-000 / P4-000 precedent.
- **Eight quality gates (GOV-003)** — Gate 4 gains visual-design-language scope; a phase-closure audit
  (`docs/audits/phase-5/`) and **AUD-P5-FINAL** on closure.
- **Proof precedes Authorization** — the CP sink demonstrates coverage; a *separate* Owner order closes
  Phase 5.

## 10. Dependencies & boundaries

- **Consumes (as frozen, modifies nothing):** UX-001…UX-006; PLP-001; PC-001…PC-008; BC-000…BC-009;
  DAT-001…DAT-006; DOM/DR; GOV-011/012/010/003/004/006/013.
- **Produces:** CMP-NNN specification documents carrying **CP-NNN** atoms + the Component traceability
  sink.
- **Out of scope (other phases):** screen blueprints (Phase 6); the HTML prototype (Phase 7); the
  frontend (Phase 12); any framework/CSS/library/design-tool choice; any new business, product,
  domain, data, or UX truth.

## 11. Phase-entry record (GOV-011 §2)

Entry conditions **met**: **Phase 4 is FROZEN & CLOSED** (ADR-0068 / AUD-P4-FINAL — DAT-001…DAT-006
frozen, DB-001…DB-159 complete); **all eight gates passed**; explicit **Owner authorization** to open
Phase 5 granted (Owner Engineering Order, 2026-07-29). On adoption, `docs/components/` opens as an
active phase directory and `docs/audits/phase-5/` is reserved for Phase-5 audit reports; P5-000 becomes
the LIVING governing plan.

---

*LIVING (v1.0.0, ADR-0069). The Component Library Specification Master Plan — the governing plan of
Phase 5, subordinate to GOV-011. It decides no design characteristic and authors no CP atom; it governs
the CMP-NNN documents (CP atoms) that will — each only after its upstream Owner design decision is
approved — and the Component traceability sink that proves them. No code, HTML, or CSS, in this document
or the phase it plans. Updated as Phase-5 design decisions are approved and checkpoints open and close
(GOV-005).*
