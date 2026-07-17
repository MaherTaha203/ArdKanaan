# ADR-0014 — Integer Rounding Rule; Session-Closing Discipline

| Field | Value |
|---|---|
| ADR | 0014 |
| Title | Integer Rounding Rule; Session-Closing Discipline |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner answered UNK-025 (integer rounding of fractional percentage splits,
HIGH) directly, without a dedicated interview session, and added an engineering
note correcting the executor's session-closing language. Decision categories
(GOV-010 §5): Business (D1), Engineering (D2).

## Decision (the Owner's rulings)

1. **D1 — Rounding rule.** When a percentage split produces a fraction:
   - The **teacher share is rounded to the nearest whole shekel**.
   - **Any difference created by rounding automatically belongs to the center.**
   - The **sum of the two shares MUST always equal the full receipt voucher
     amount** — no independent accounting difference may ever be created by
     rounding.
   - Owner's examples: 1001 × 70% = 700.7 → teacher 701, center 300.
     With a 30% teacher share: 1001 × 30% = 300.3 → teacher 300, center 701.
2. **D2 — Session-closing discipline.** The executor's session-ending language
   must not imply that it leads execution. Phrases like "Next per the frozen
   plan: Session 4…" are replaced by a compliance-first formula:

   > Repository state: Domain Discovery frozen.
   > No further work is authorized.
   > Awaiting explicit Owner Engineering Order.

   Reason (Owner's words): the roadmap defines only the **order** of work; it
   never grants permission to begin. This is captured permanently as LES-011 in
   the Engineering Memory (GOV-008), which every session must read at start
   (AI-02).

## Interpretation boundaries (what is NOT decided here)

- **Exact half (X.5):** "nearest whole shekel" does not state the direction for
  an exact .5 fraction (possible only for percentages that can produce halves,
  e.g. 50% of an odd amount — not for 70/30). Standard commercial rounding
  (half up, toward the teacher) is recorded as **ASM-004, AWAITING
  CONFIRMATION** — not asserted (AI-11). It can be confirmed or corrected in
  one word alongside any future decision.

## Consequences

- **Resolved:** UNK-025 (HIGH). **Opened:** ASM-004 (low-stakes assumption).
- **New domain rule:** DR-028.
- **Blast radius:** DOM-001 v1.4.0, DOM-003 v1.4.0 (WF-03), DOM-004 v2.3.0
  (DR-028; DR-014/DR-025 unknown-status), DOM-005 v1.9.0, GOV-008 (LES-011),
  GOV-009, IDX-001, DEC-000; audit AUD-P1A-006. DOM-002 verified unaffected
  (no UNK-025 references). Frozen governance untouched.
- V1's split calculation is now fully specified end-to-end: percentage →
  nearest-shekel teacher share → remainder to center → sum equals voucher
  amount exactly.
