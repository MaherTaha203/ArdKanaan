# ADR-0021 — Session 9 Owner Decisions: Refund Effects on Teacher Entitlement & Debt

| Field | Value |
|---|---|
| ADR | 0021 |
| Title | Session 9 Owner Decisions: Refund Effects on Teacher Entitlement & Debt |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner closed Interview Session 9 (Refund Effects on Teacher Entitlement &
Debt, targeting UNK-027 then UNK-026) on 2026-07-18 and authorized propagation
per GOV-010, with a pre-propagation refinement on the teacher-debt rule (below).
Decision categories (GOV-010 §5): Business.

Session 9 completes the refund model begun in Session 5 (ADR-0016): Session 5
fixed the money mechanics of a refund (reversal of recognized revenue, DR-036…
DR-042) but left two HIGH unknowns open — how the teacher's entitlement is
recalculated after a refund (UNK-027, DR-038) and how a teacher debt that results
is calculated and managed (UNK-026, DR-039). These are the last two HIGH unknowns
in the register.

## Decision (the Owner's rulings)

1. **S9-D1 — Entitlement reduced by the original percentage.** A refund reduces
   the teacher's entitlement on that program by the **same percentage originally
   applied** to the enrollment (the program's teacher percentage), computed on the
   refunded amount. Worked example: 1000 at 70/30, refund 400 → teacher
   entitlement −280 (→ 420), center −120 (→ 180).
2. **S9-D2 — Rounding follows DR-028 exactly.** The teacher's share of a refund is
   rounded to the **nearest whole shekel**, the remainder belongs to the center,
   and the teacher and center reductions sum exactly to the refunded amount —
   identical to the receipt-side rule (DR-028). Example: refund 401 at 70% →
   teacher reduction 281, center 120.
3. **S9-D3 — Percentage constant and cumulative; unpaid entitlement floors at
   zero.** (a) The percentage is a property of the program, constant regardless of
   which receipt the money came from; entitlement is **cumulative across the
   Teacher × Program**, not tied to any single receipt. (b) While the teacher has
   **not** yet been paid, a refund reduces entitlement directly and entitlement
   **never displays negative** — it floors at zero; a reduction that would push it
   below zero is the **signal that a teacher debt arises** (S9-D4).
4. **S9-D4 — When a teacher debt exists (refined).** *A teacher debt exists only
   when the total amount already paid to the teacher for a program exceeds that
   teacher's final entitlement for the program after all refund recalculations.*
   The excess is the debt; if payments do not exceed the final entitlement, there
   is no debt. (Explanatory arithmetic: Teacher Debt = Total Teacher Payments −
   Final Teacher Entitlement, recognized only when positive.)
5. **S9-D5 — Debt is per Teacher × Program, never merged or offset.** A teacher
   debt is calculated and tracked for each **Teacher × Program** independently.
   Debts and entitlements are **never merged or offset across different
   programs** — a debt on Excel is never cleared using entitlements owed on ICDL,
   Accounting, or any other program (program isolation, DR-031).
6. **S9-D6 — Two settlement paths, Owner-chosen, never automatic.** A teacher debt
   is settled by **either** (a) **direct repayment** by the teacher to the center,
   **or** (b) **deduction from the teacher's future entitlements on the same
   program**. The choice of method is an administrative decision the Owner makes
   case by case — it is **never** an automatic system action. Deduction draws
   **only** on the same program's entitlements; cross-program deduction is
   forbidden.
7. **S9-D7 — Partial, multiple, and mixed settlements allowed.** A teacher debt is
   a **settleable balance** that only decreases: partial repayments are allowed,
   settlement may occur over several steps (days or months), and the two methods
   may be **combined** on one debt (e.g. 100 repaid directly, the remaining 180
   deducted from the next entitlement on that program). The balance **never
   becomes negative**; each settlement reduces the remaining balance only; when it
   reaches **zero** the debt is fully settled and closed.
8. **S9-D8 — No expiry.** A teacher debt has **no time limit**; it stays open
   until it is actually settled. Elapsed time never writes it off.
9. **S9-D9 — No future entitlement on the program.** If the teacher has **no
   further entitlement** on that program (for example, they no longer run it), so
   same-program deduction is impossible, the debt simply **stays open** as an
   outstanding balance owed to the center, and the **only** remaining way to clear
   it is **direct repayment**. There is no other mechanism and no cross-program
   settlement.
10. **S9-D10 — Edge cases validated; model complete for V1.** The Owner confirmed
    the outcomes of the standard edge cases (full refund before payment → no debt;
    full refund after payment → full teacher share becomes debt; partial refund
    after payment → partial debt; cumulative multiple refunds; fractional refunds
    rounded per DR-028) and declared the refund → entitlement recalculation →
    teacher debt → settlement model **complete for V1**. No new unknowns opened.

## Refinement applied (Owner-directed, teacher-debt rule)

Per the pre-propagation instruction, the teacher-debt rule is expressed as
**business behavior** — "a teacher debt exists only when total teacher payments
exceed the teacher's final entitlement after all refund recalculations"
(DR-065) — rather than as a bare formula. The arithmetic (payments − final
entitlement, when positive) is retained only in explanatory text, examples, and
this ADR's rationale. Owner intent is unchanged.

## Interpretation boundaries

- **No new entity type is invented.** A "teacher debt" is a **derived per-program
  balance** (like the Teacher Balance, DOM-002 §12), not a new voucher. It is
  surfaced as its own concept (DOM-002 §16) because it now has a fully specified
  lifecycle (arises from a refund of already-paid revenue, is settled, closes at
  zero).
- **Settlement recording (entailed, not invented):** a direct repayment brings
  cash back to the center (raising the Cash Balance) and reduces the debt; a
  deduction reduces both a future entitlement on that program and the debt. The
  exact voucher/record used to capture a settlement is a deferred design decision
  (as with Refund Voucher numbering, ADR-0017 §2), not a domain unknown — the
  business behavior is fully specified here.
- **Relationship to postponed deductions (UNK-021):** the refund-debt settlement
  by same-program deduction (S9-D6) is the specific mechanism the Owner authorized
  in Session 5 (S5-D4) and detailed here. It does **not** open the general
  teacher-deduction model (fees, penalties, materials) that remains intentionally
  postponed (S4-D8 → UNK-021).
- **No contradiction with program isolation:** debt tracking and deduction are
  strictly per Teacher × Program (S9-D5), preserving DR-031.

## Consequences

- **New domain rules:** DR-062…DR-070 (nine rules). **Updated status:** DR-038
  (UNK-027 resolved → DR-062/DR-063/DR-064), DR-039 (UNK-026 resolved →
  DR-065…DR-070).
- **Unknowns:** UNK-026 CLOSED, UNK-027 CLOSED. No new unknowns opened. **No HIGH
  unknowns remain open.**
- **New concept section:** Teacher Debt (DOM-002 §16). **New workflow:** WF-12
  (teacher-debt settlement), ESTABLISHED. WF-07 (student refund) exceptional cases
  updated (UNK-026/UNK-027 pointers replaced by the new rules).
- **Repository repair (found during propagation):** GOV-008 (Engineering Memory)
  had been silently truncated to an empty file since the Session 7 commit
  (68429e3); it is restored from its last-good content (LES-001…LES-013) and
  advanced with LES-014 (state rules as business behavior, not formulas) and
  LES-015 (verify LIVING governance files retain content, not merely exist).
- **Blast radius:** DOM-001 v1.10.0, DOM-002 v8.1.0, DOM-003 v1.11.0,
  DOM-004 v3.6.0, DOM-005 v1.16.0, GOV-008 (restored), GOV-009, IDX-001 v1.16.0,
  DEC-000; audit AUD-P1A-013. Frozen governance untouched.
- Full review pipeline re-run; Domain Discovery re-freezes on all-PASS.
