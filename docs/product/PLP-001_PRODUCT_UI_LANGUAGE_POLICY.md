# PLP-001 — Product UI Language Policy

| Field | Value |
|---|---|
| Doc ID | PLP-001 |
| Title | Product UI Language Policy |
| Phase | 1 (Product Constitution — post-closure gap-fill) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | Owner Decision (constitutional ownership of language selection); GOV-012 (layer ownership — Appendix C #32, §5 LOA, L16); ADR-0005 §3 (UI-language deferral); PC-004 (scope framework); PC-006 (terminology, frozen); PA-2 / AP-1 (single-owner simplicity) |
| Answers | "Which language(s) does the product support, and who constitutionally owns that decision?" |
| Adopted by | ADR-0055 |

---

> **Nature of this document.** PLP-001 records a **Product-layer ownership and policy decision**
> made by the Owner: *who owns the choice of the product's UI language, and what that choice is for
> V1.* It fills a constitutional **ownership gap** — the decision "which language(s) the product
> supports" is Product-scope under GOV-012 (Appendix C #32, §5 LOA Q2, L16), but no frozen Product
> atom had fixed it. PLP-001 is authored **post-closure** of Phase 1 and **modifies no locked
> document** (PC-001…PC-008 are untouched). It defines **no** UI, layout, font, direction mechanic,
> or engineering detail — those belong to UX (presentation) and Phases 5–6 / Engineering.

## 1. Constitutional basis

The decision **"which language(s) does the product support?"** is a **capability / scope** decision:
every possible UI and every correct implementation must honor it identically. By GOV-012 §5 LOA
**STEP 3 Q2** (*"…capability / scope / … → PRODUCT"*), **L16** (a capability's *existence* → the
declaring layer, i.e. Product), and **Appendix C #32** (*"Support Arabic + RTL (requirement) →
product scope → Product; mirroring→UX, glyphs→Visual, strings→Eng"*), this decision is owned by the
**Product Constitution**. ADR-0005 §3 deferred the *UI-language* decision to a later phase; the
**presentation** stratum of that deferral is UX-owned, while the **selection/scope** stratum is
Product-owned. The Owner has decided this ownership and the V1 policy; PLP-001 records it.

## 2. Policy atoms

- **PLP-1 — Ownership of language selection.** The decision of **which language(s) the product
  supports**, and **how many**, is a **Product-scope policy owned by the Owner**. It is **not** a UX,
  Visual, or Engineering decision. *(GOV-012 #32 / Q2 / L16; Owner Decision.)*

- **PLP-2 — V1 supported language.** The product's V1 UI language is **Arabic (only)**. The product
  supports no other UI language in V1, and provides **no** locale switching, translation-management,
  or per-user language setting. A localization / internationalization engine is **out of scope** (it
  would be **AP-1 ERP creep** against **PA-2** single-owner simplicity). *(Owner Decision; PA-2 /
  AP-1.)*

- **PLP-3 — Downward allocation to UX.** UX **consumes** this policy exactly as frozen and owns
  **only the presentation** of the approved language: reading direction (**RTL / mirroring**),
  **presentation fidelity**, and **perceivability**. UX may **not** select, add, or remove a
  supported language. *(GOV-012 #32 mirroring→UX; L8 downward dependency; Owner Decision.)*

- **PLP-4 — Non-Product strata.** **Translation / strings / encoding → Engineering**; **glyphs /
  typography → Visual (Phase 5)**. None are required in V1 (Arabic-only, no translation).
  *(GOV-012 #32.)*

- **PLP-5 — Change control.** Adding, removing, or changing a supported UI language is a **Product**
  decision (Owner + the applicable PC-004 §6 tier / GOV-004 §5), which then flows **downward** to UX
  (L8). It is **never** effected by amending a UX atom. *(PC-004 §6; GOV-004 §5; GOV-012 L8.)*

## 3. Boundary with PC-006 (terminology)

PLP-001 governs **which language the UI speaks**; **PC-006** governs the **canonical terms** (the
words) regardless of language. They do not overlap: PC-006 NR-3 already fixes Arabic names as
**communication aliases**, not a second locale; PLP-001 adds no term and renames none. Terminology
authority remains entirely with PC-006.

## 4. Scope

**In scope:** the ownership of language selection (PLP-1), the V1 language policy (PLP-2), the
downward allocation of presentation to UX (PLP-3), the non-Product strata (PLP-4), and change
control (PLP-5).

**Out of scope (owned elsewhere):** presentation of the language — RTL/direction, fidelity,
perceivability (UX, e.g. UX-005); canonical terminology (PC-006); glyphs/typography (Visual);
strings/encoding and any rendering mechanism (Engineering); all UI, layout, and screen decisions
(Phases 5–6).

## 5. Strict-scope self-check

PLP-001 records **only** a Product ownership + policy decision. It defines **no** UI, screen,
component, font, colour, direction mechanic, locale mechanism, or engineering detail. It introduces
**no** Business Rule and reinterprets no frozen document; PC-001…PC-008 and PC-006 are consumed
exactly as frozen and **modified in nothing**. It fills a Product-scope ownership gap under an
explicit Owner Decision, authorized by ADR-0055, without disturbing any locked artifact.

---

*FROZEN (v1.0.0, ADR-0055). PLP-001 is the Product-layer authority that fixes the product's UI
language policy (V1: Arabic only) and its ownership. Later layers — UX (presentation), Visual
(glyphs), Engineering (strings) — consume it and modify nothing upstream. No further modification is
permitted except through the Constitutional Amendment process (GOV-004 §5).*
