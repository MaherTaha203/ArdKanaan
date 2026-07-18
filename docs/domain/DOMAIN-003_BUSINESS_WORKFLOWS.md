# DOM-003 — Business Workflows

| Field | Value |
|---|---|
| Doc ID | DOM-003 |
| Title | Business Workflows |
| Phase | 1A |
| Status | FROZEN |
| Version | 1.11.0 |
| Depends on | GOV-001 (F-05…F-08), ADR-0008 (owner decisions D2–D6), ADR-0009 (V1 scope), ADR-0013 (Session 3 decisions), ADR-0014 (rounding rule), ADR-0015 (Session 4 teacher payments), ADR-0016 (Session 5 student refunds), ADR-0017 (register restructure), ADR-0018 (Session 6 corrections & cancellations), ADR-0019 (Session 7 expense categories), ADR-0020 (Session 8 expense returns), ADR-0021 (Session 9 refund entitlement & teacher debt), DOM-001, DOM-002 |
| Referenced by | DOM-004, DOM-005 |

---

Workflows are **descriptive** (`WF-NN`, → GOV-002 §5): they capture how the
business operates as currently understood. Each workflow lists trigger, inputs,
business rules (citing the DR catalog, → DOM-004), outputs, and exceptional cases.
A workflow whose steps are not established cites `UNK-NNN` (→ DOM-005) — nothing is
invented. Knowledge status per workflow: **ESTABLISHED** (grounded in F-atoms),
**PARTIAL**, or **UNKNOWN** (existence implied, content unconfirmed).

---

## WF-01 — Student registers in a program — *ESTABLISHED*

- **Trigger:** a student decides to take a training program (ADR-0013 S3-D2).
- **Inputs:** the student (created as an entity if new, DR-021); the training
  program.
- **Business rules:** DR-021 (student is the core person entity), DR-022
  (registration is an independent recorded event, before and without payment).
- **Outputs:** a recorded registration linking the student to the program;
  payment may follow later — Registration → Payment.
- **Exceptional cases:** the student withdraws before paying (S3-D2 — allowed);
  withdrawal after payment is a refund → UNK-006. What the amount due for a
  registration is based on (program price, discounts) → UNK-005.

## WF-02 — Student pays / Receipt voucher is created — *ESTABLISHED*

- **Trigger:** a registered student (or a payer on their behalf) hands money to
  the center for a specific program.
- **Inputs:** the student and their program registration (DR-021, DR-022); the
  whole-shekel amount (DR-025); the payment method — cash or bank transfer, one
  per voucher (DR-025); date; optional Payer Name (DR-021).
- **Business rules:** DR-004/DR-023 (one voucher = one student + one program +
  one payment), DR-005 (automatic split at posting), DR-006 (split stored
  permanently), DR-007 (owner never computes anything), DR-015/DR-017 (posting
  creates the teacher receivable and the three ledger effects), DR-024
  (overpayment prevented), DR-026 (continuous receipt numbering).
- **Outputs:** a posted, sequentially-numbered receipt voucher holding amount +
  applied teacher share + applied center share; automatically: Cash Balance
  +full amount, Teacher Payables +teacher share (entitlement begins now, D4),
  Center Net Balance +center share (D6).
- **Exceptional cases:** installments — each payment is its own voucher, split
  at its own moment (DR-023); amounts exceeding the due amount are rejected
  (DR-024); multi-program/multi-student/multi-method vouchers do not exist in V1
  (DR-027).

## WF-03 — Revenue is distributed — *ESTABLISHED*

- **Trigger:** occurs automatically as part of WF-02 — never a separate manual
  step (F-07, F-08).
- **Inputs:** receipt amount; the program's percentage policy (teacher % +
  center % = 100%, DR-013).
- **Business rules:** DR-003 (one policy per program), DR-005 (automatic
  calculation), DR-006 (permanence of the applied split), DR-013 (V1: percentage
  of posted receipts, summing to 100%), DR-014 (rounding is currency-owned: exact
  decimals stored when the currency supports them, otherwise official currency
  rounding — never custom logic).
- **Outputs:** teacher share and center share, both recorded inside the voucher.
- **Exceptional cases:** percentages not summing to 100% are invalid (DR-013);
  fractional results follow DR-028 — teacher share to nearest whole shekel,
  rounding difference to the center, shares always summing to the exact voucher
  amount.

## WF-04 — Teacher balance changes — *ESTABLISHED*

- **Trigger:** a receipt voucher on the teacher's program is posted — the teacher
  receivable is created at that moment, from posted receipts only, with no
  additional conditions (increase, DR-015, DR-029); an owner-issued teacher
  payment voucher for that program settles owed amounts later (decrease,
  DR-030). Entitlement and payment are two different business events (D4).
- **Inputs:** stored shares from posted vouchers of that program; payment
  vouchers issued for that program.
- **Business rules:** DR-009/DR-031 (independent balance per Teacher × Program,
  derived, never entered by hand — F-08), DR-015/DR-029 (entitlement at
  posting), DR-016 (feeds Teacher Payables, never merged), DR-034 (Outstanding
  = Total Entitlement − Total Payments, per program; no receipt allocation).
- **Outputs:** current outstanding balance per Teacher × Program.
- **Exceptional cases:** negative balances cannot exist — advances are forbidden
  and payments are capped at the outstanding balance (DR-033); departing
  teacher with open balance → UNK-019.

## WF-05 — Teacher payment (paying out the teacher's share) — *ESTABLISHED*

- **Trigger:** the Owner decides to pay a teacher, on whatever date the
  center-teacher agreement dictates — never automatically (DR-030).
- **Inputs:** the teacher; ONE program (DR-032); an amount up to that program's
  outstanding balance (DR-033); date; the payment voucher from the continuous
  payment sequence (DR-026).
- **Business rules:** DR-030 (owner-initiated only), DR-032 (one program per
  payment voucher), DR-033 (partial allowed, ceiling = outstanding, no
  advances), DR-034 (associates with the program only — no receipt-allocation algorithm; voucher
  permanently recorded), DR-035 (entitlement breakdown fully traceable).
- **Outputs:** a posted payment voucher; that Teacher × Program outstanding
  balance decreases; Cash Balance and Teacher Payables decrease; other programs
  unaffected (S4-D6).
- **Exceptional cases:** an amount exceeding the outstanding balance is
  rejected (DR-033); deductions are intentionally postponed — no behavior
  exists (S4-D8 → UNK-021).

## WF-06 — Center expense is paid — *ESTABLISHED*

- **Trigger:** the center pays money from its own cash for an operating need —
  rent, utilities, stationery, cleaning, maintenance, furniture/equipment,
  government fees, subscriptions (DR-049); recorded only when the cash has
  actually left (DR-053). Teacher payments and refunds are NOT expenses (DR-049).
- **Inputs:** the amount; exactly one **Expense Category** from the expandable
  list (DR-051); date. Recorded directly by the owner — no approval (DR-054).
- **Business rules:** DR-049 (expense boundary), DR-050 (recorded uniformly,
  no fixed-asset distinction in V1), DR-051 (one category, expandable list),
  DR-052 (center-borne — reduces Cash Balance and Center Net Balance, never a
  teacher), DR-053 (recorded when cash leaves; from center money only), DR-054
  (no approval), DR-008 (recorded as a Payment Voucher).
- **Outputs:** a posted center-expense Payment Voucher; Cash Balance and Center
  Net Balance both decrease; per-category totals and expense detail available
  to the owner (DR-051); an append-only event on the activity timeline (DR-019).
- **Exceptional cases:** money returning to the center after an expense (cash
  returns, supplier refunds) is handled as an **expense return** — see WF-11
  (DR-055…DR-061); charging an expense to a program/teacher or splitting it
  proportionally is postponed (Future Considerations, UNK-021).

## WF-07 — Student refund — *ESTABLISHED (mechanics), PARTIAL (conditions)*

- **Trigger:** the Owner grants a student a refund (when a student is entitled
  and how the amount is determined remain the Owner's practice → UNK-006,
  reduced).
- **Inputs:** the Student and the Program (DR-040); the refund amount (bounded
  by the Student × Program net paid amount, DR-036); the refund reason (S5-D7);
  date.
- **Business rules:** DR-036 (reversal of recognized revenue — never an
  expense), DR-037 (reduces Program Revenue and Student Paid Amount; financial
  state recalculated), DR-038 (teacher entitlement reflects net revenue),
  DR-062 (entitlement reduced by the original program percentage, cumulative
  per Teacher × Program), DR-063 (reduction rounded per DR-028), DR-064
  (unpaid entitlement floors at zero — never negative), DR-039/DR-065
  (already-paid case beyond final entitlement becomes a teacher debt; never
  absorbed by the center), DR-040 (no receipt allocation), DR-041 (dedicated
  Refund Voucher), DR-042 (full responsibilities and ledger effects). DR-006
  untouched — stored splits are never edited.
- **Outputs:** a recorded Refund Voucher; recalculated Student × Program paid
  amount, Program Revenue, teacher entitlement (per the original percentage,
  rounded per DR-028), and the three balances (DR-042); a teacher debt when the
  already-paid amount exceeds the final entitlement (DR-065 → WF-12); a line in
  the Student Statement; audit-trail participation.
- **Exceptional cases:** teacher already paid beyond final entitlement → a
  teacher debt arises and is settled via WF-12 (DR-065…DR-070); refund-voucher
  numbering is a deferred design decision (ADR-0017 §2).

## WF-08 — Voucher cancellation — *ESTABLISHED*

- **Trigger:** the owner must void a Posted financial document (a mistake, a
  duplicate, a voucher entered by error).
- **Inputs:** the Posted document to cancel; a mandatory cancellation reason
  (DR-047); date; the actor (the owner, F-02).
- **Business rules:** DR-044 (Posted documents are never edited or deleted),
  DR-046 (may not cancel while dependents exist — remove dependents newest →
  original; no automatic debts), DR-045 (a permitted cancellation reverses all
  financial effects automatically, returning to the prior state), DR-047
  (cancellation is a "Cancelled" status on the original — no separate document —
  preserved and visible, with date, reason, actor). DR-006 untouched — stored
  splits are never edited.
- **Outputs:** the original marked **Cancelled** (still visible everywhere); all
  its financial effects reversed automatically (Cash, teacher entitlement,
  Center Net, derived balances/reports); an append-only cancellation event on
  the activity timeline (DR-019).
- **Exceptional cases:** dependents present → cancellation is refused until they
  are cancelled first, newest → original (DR-046).

## WF-09 — Correction of a recording mistake — *ESTABLISHED*

- **Trigger:** the owner discovers a wrongly recorded value on a Posted
  document.
- **Inputs:** the Posted document; whether the wrong field is financial or
  descriptive (DR-048).
- **Business rules:** DR-048 — a **financial** field (amount, student, program,
  payment method) is corrected by **cancel + recreate** (WF-08 then WF-02/…);
  a **descriptive** field (notes, Payer Name, extra description) may be **edited
  in place** with the change logged (activity log, date, user, old value → new
  value) and no financial recalculation.
- **Outputs:** for financial fields, a cancelled original plus a new correct
  document; for descriptive fields, an edited document with a logged change
  event on the activity timeline (DR-019).
- **Exceptional cases:** correcting a financial field of a document that has
  dependents requires unwinding the dependents first (DR-046).

## WF-10 — Owner reads balances / account statements — *PARTIAL*

- **Trigger:** the owner wants to know the current state (any moment).
- **Inputs:** recorded vouchers (and their stored splits).
- **Business rules:** DR-007 (everything derivable is derived — F-08), DR-009,
  DR-010, DR-016 (the three balances — Cash, Teacher Payables, Center Net — are
  shown distinctly, never merged); statement scope and periods → UNK-013.
- **Outputs:** Cash Balance, Teacher Payables, Center Net Balance, per-teacher
  balances, account statements.
- **Exceptional cases:** a statement showing a cancelled document displays it as
  **Cancelled** (never hidden, DR-047); statement scope/periods → UNK-013.

## WF-11 — Money returns to the center after an expense (expense return) — *ESTABLISHED*

- **Trigger:** cash comes back to the center because of a prior expense — a
  purchase return, a supplier refund (invoice error/overpayment), a cancelled
  subscription refund, or a returned deposit/security (DR-055; ADR-0020 S8-D1).
- **Inputs:** the one original expense being reduced — Posted and not cancelled
  (DR-058, DR-059); the returned cash amount, not exceeding the remaining
  original value (DR-057); date. No time limit (DR-061).
- **Business rules:** DR-055 (concept: value returns because of a prior
  expense), DR-056 (reduces the expense, never income), DR-057 (partial/multiple,
  bounded by the original), DR-058 (one return ↔ one expense), DR-059 (original
  must be Posted, non-cancelled), DR-060 (V1 realizes it by actual cash; credit
  notes and goods replacement excluded), DR-061 (no time limit). A cash return
  follows the posted/immutable/cancel model (DR-043…DR-048).
- **Outputs:** a recorded Expense Return referencing one expense; the expense's
  real cost falls by the returned amount; Cash Balance +amount and Center Net
  Balance +amount (DR-060); an append-only event on the activity timeline
  (DR-019).
- **Exceptional cases:** a lump-sum supplier refund covering several expenses is
  split at entry into several returns, one per expense (DR-058); non-cash
  outcomes (credit notes, goods replacement) are not expense returns in V1
  (DR-060, Future Considerations); cash after a cancelled expense is out of
  concept (DR-059).

## WF-12 — Teacher debt settlement — *ESTABLISHED*

- **Trigger:** a teacher owes a debt on a program because a refund of
  already-paid revenue pushed their final entitlement below what was paid
  (DR-065, arising from WF-07), and the Owner acts to settle it.
- **Inputs:** the Teacher × Program debt balance; the settlement method chosen by
  the Owner — direct repayment by the teacher, deduction from a future
  entitlement on the **same** program, or a mix (DR-068); the amount settled
  (up to the remaining balance); date.
- **Business rules:** DR-065 (a debt exists only when payments exceed final
  entitlement), DR-066 (per Teacher × Program; never merged/offset across
  programs), DR-067 (settleable balance — partial/multiple, never negative,
  closes at zero), DR-068 (two paths, Owner-chosen, never automatic; deduction
  stays within the same program), DR-069 (no expiry), DR-070 (repayment-only
  when the program has no future entitlement).
- **Outputs:** the debt balance decreases by the settled amount; a direct
  repayment raises the Cash Balance; a deduction reduces a future entitlement on
  that same program; when the balance reaches zero the debt is closed; an
  append-only event on the activity timeline (DR-019).
- **Exceptional cases:** the program has no future entitlement → only direct
  repayment can clear the debt, which otherwise stays open indefinitely (DR-070);
  cross-program settlement is never allowed (DR-066); the general teacher-deduction
  model (fees, penalties, materials) remains out of scope (S4-D8 → UNK-021). The
  record used to capture a settlement is a deferred design decision, not a domain
  unknown.
