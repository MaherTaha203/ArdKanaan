# DOM-003 — Business Workflows

| Field | Value |
|---|---|
| Doc ID | DOM-003 |
| Title | Business Workflows |
| Phase | 1A |
| Status | FROZEN |
| Version | 1.4.0 |
| Depends on | GOV-001 (F-05…F-08), ADR-0008 (owner decisions D2–D6), ADR-0009 (V1 scope), ADR-0013 (Session 3 decisions), ADR-0014 (rounding rule), DOM-001, DOM-002 |
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

## WF-04 — Teacher balance changes — *PARTIAL*

- **Trigger:** a receipt voucher on the teacher's program is posted — the teacher
  receivable is created at that moment (increase, DR-015, D4); a teacher payment
  settles owed amounts later (decrease → UNK-008). Entitlement and payment are
  two different business events (D4).
- **Inputs:** stored shares from posted vouchers; teacher payments.
- **Business rules:** DR-009 (balance derives from recorded shares and payments,
  never entered by hand — F-08), DR-015 (entitlement at posting), DR-016 (feeds
  Teacher Payables, never merged with the other balances).
- **Outputs:** current amount owed to the teacher.
- **Exceptional cases:** negative balance (teacher paid more than owed) →
  UNK-008; departing teacher with open balance → UNK-019.

## WF-05 — Teacher payment (paying out the teacher's share) — *UNKNOWN*

- **Trigger:** the owner pays a teacher some or all of what they are owed.
- **Inputs / Business rules / Outputs:** whether this is recorded as a payment
  voucher, whether partial payouts are allowed, on what schedule, and with what
  effect on statements → UNK-008, UNK-009.
- **Exceptional cases:** paying more than owed; advances → UNK-008.

## WF-06 — Center expense is paid — *UNKNOWN*

- **Trigger:** the center pays money for its own needs.
- **Inputs / Business rules / Outputs:** expense categories, whether any expense
  relates to a program or teacher, approval and recording specifics → UNK-009,
  UNK-015. Established only: outgoing money is recorded as a payment voucher
  (DR-008).
- **Exceptional cases:** unknown (UNK-009).

## WF-07 — Refund — *UNKNOWN*

- **Trigger:** a student/payer asks for money back.
- **Inputs / Business rules / Outputs:** whether refunds exist in this business at
  all, and if so how a refund affects the already-stored split, the teacher's
  balance, and the center's balance → **UNK-006**. Constraint that any answer must
  respect: the original voucher's stored split is permanent (DR-006); therefore a
  refund cannot be implemented by *editing* a past voucher — how the business
  actually handles it is for the owner to state.
- **Exceptional cases:** partial refund; refund after the teacher was already
  paid → UNK-006.

## WF-08 — Voucher cancellation — *UNKNOWN*

- **Trigger:** a voucher was recorded and must be voided.
- **Inputs / Business rules / Outputs:** whether cancellation is permitted, how it
  differs from a refund, and what trace it must leave → **UNK-007**. Same standing
  constraint as WF-07: stored splits are permanent (DR-006).
- **Exceptional cases:** cancelling after balances were settled → UNK-007.

## WF-09 — Workflow corrections (fixing a recording mistake) — *UNKNOWN*

- **Trigger:** the owner discovers a wrongly recorded amount, program, or payer.
- **Inputs / Business rules / Outputs:** correction mechanism (reversal entry?
  amended voucher? delete?) → **UNK-007**; which mistakes occur in practice →
  UNK-007.
- **Exceptional cases:** corrections spanning periods already reviewed → UNK-013.

## WF-10 — Owner reads balances / account statements — *PARTIAL*

- **Trigger:** the owner wants to know the current state (any moment).
- **Inputs:** recorded vouchers (and their stored splits).
- **Business rules:** DR-007 (everything derivable is derived — F-08), DR-009,
  DR-010, DR-016 (the three balances — Cash, Teacher Payables, Center Net — are
  shown distinctly, never merged); statement scope and periods → UNK-013.
- **Outputs:** Cash Balance, Teacher Payables, Center Net Balance, per-teacher
  balances, account statements.
- **Exceptional cases:** statement for a period with corrections → UNK-007,
  UNK-013.
