# ADR-0056 — UX-005 Frozen: Language, RTL & Accessibility of the User Experience Layer

| Field | Value |
|---|---|
| ADR | 0056 |
| Title | UX-005 Frozen — Language, RTL & Accessibility |
| Phase | 3 (UX Constitution) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 3 (UX Constitution) governed by P3-000 requires a Language, RTL & Accessibility document
(Checkpoint UC3) that fixes how the frozen truth is **perceivably presented** — in the product's own
words, in its reading direction, and within reach of the one Owner — without the surface owning the
words, the direction, or the truth. UX-005 was authored and reviewed under **GOV-013** (Multi-Agent
Review Protocol). Its lifecycle exercised the protocol fully, including a mid-course constitutional
boundary correction:

- **Draft → Adversarial Self-Hardening → Revision 1.**
- **Readiness Verification #1: NOT READY** — the independent 6-agent Panel found LA-02 had captured a
  **Product-scope** decision ("which language(s) the product supports"), contradicting **GOV-012
  Appendix C #32** (i18n = product scope; mirroring→UX).
- **Owner Decision + PLP-001 (ADR-0055):** constitutional ownership of language selection is
  **Product**; V1 = Arabic only. UX owns only presentation.
- **Revision 2** relocated selection to PLP-001.
- **Readiness Verification #2: NOT READY** — the Panel found LA-07/LAV-06 over-claimed the **Product
  accessibility guarantee** (GOV-012 Appendix C #30), plus a false invariant-coverage universal.
- **Revision 3** (corrective C1–C5) → **Readiness Verification #3: READY** — 6/6 Panel SOUND, 0
  Blocking / 0 Major; independent Readiness Judge **READY**.
- **Editorial Touch-Up (v0.4.1):** non-blocking citation/wording precision only; constitutional
  meaning unchanged; the READY verdict stands.

## Decision

1. **Adopt UX-005 — Language, RTL & Accessibility** (`docs/ux/UX-005_LANGUAGE_RTL_AND_ACCESSIBILITY.md`),
   **FROZEN v1.0.0**.
2. **Atoms:** ten constitutional rules **LA-01…LA-10** (three facets — Language LA-01…03, Reading
   Direction/RTL LA-04…06, Accessibility/Perceivability LA-07…09 — plus the cross-cutting boundary
   rule LA-10) and six invariants **LAV-01…LAV-06**.
3. **Single responsibility:** *perceivable, faithful presentation.* The surface renders frozen truth
   in the right words, direction, and reach, changing nothing.
4. **Ownership boundaries fixed (consumed, not authored):** language **selection** → Product
   (PLP-001); **terminology** → PC-006; the **accessibility guarantee** → Product (GOV-012 #30). UX
   owns **only presentation** — RTL/mirroring, presentation fidelity, and perceivability — and
   authors no guarantee, no technique, and no localization machinery.
5. **Checkpoint UC3 COMPLETE.**

## Consequences

- UX-005 is the frozen authority every later UX artifact, component (Phase 5), and screen (Phase 6)
  consumes for language presentation, reading direction, and perceivability; amendments only via
  GOV-004 §5.
- The Business→Product→UX layer separation (GOV-012) is preserved end-to-end: UX-005 introduces no
  Business Rule, calculation, workflow, status effect, UI/technique, or localization mechanism.
- Phase 3 remaining work: **UX-006** (UX Traceability sink, UC4), after which Phase 3 may close.
- Registers updated in this same commit: IDX-001 (UX-005, ADR-0056, AUD-P3-006), DEC-000 (ADR-0056;
  next → 0057), GOV-009 (counts + refresh; UC3 COMPLETE), RDM-001 (Phase 3 status).

## Notes

Second document frozen through GOV-013's full independent-Panel lifecycle (after UX-004), and the
first to require an inter-layer boundary correction mid-cycle (the language-selection ownership gap,
resolved by PLP-001 / ADR-0055). The three verification cycles (NOT READY → NOT READY → READY) are
the protocol operating as designed — No Silent Progression (MR-09) held.
