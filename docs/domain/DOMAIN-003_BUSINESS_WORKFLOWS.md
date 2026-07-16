# DOM-003 — Business Workflows

| Field | Value |
|---|---|
| Doc ID | DOM-003 |
| Title | Business Workflows |
| Phase | 1A |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | GOV-001 (F-05…F-08), DOM-001, DOM-002 |
| Referenced by | DOM-004, DOM-005 |

---

Workflows are **descriptive** (`WF-NN`, → GOV-002 §5): they capture how the
business operates as currently understood. Each workflow lists trigger, inputs,
business rules (citing the DR catalog, → DOM-004), outputs, and exceptional cases.
A workflow whose steps are not established cites `UNK-NNN` (→ DOM-005) — nothing is
invented. Knowledge status per workflow: **ESTABLISHED** (grounded in F-atoms),
**PARTIAL**, or **UNKNOWN** (existence implied, content unconfirmed).

---

## WF-01 — Student joins a program — *UNKNOWN*

- **Trigger:** a student decides to take a training program.
- **Inputs / Business rules / Outputs:** whether "joining" is a recorded business
  event at all — separate from paying — is not established → UNK-012; student
  identity handling → UNK-011.
- **Exceptional cases:** unknown (UNK-012).

## WF-02 — Student pays / Receipt voucher is created — *ESTABLISHED (core), PARTIAL (edges)*

- **Trigger:** a student/payer hands money to the center for a specific program.
- **Inputs:** the amount; the training program it belongs to; the payer
  (identity depth → UNK-011); date. Payment method and currency → UNK-010, UNK-004.
- **Business rules:** DR-004 (one receipt ↔ one program), DR-005 (automatic split
  at receipt), DR-006 (split stored permanently in the voucher), DR-007 (owner
  never computes anything).
- **Outputs:** a receipt voucher holding amount + applied teacher share + applied
  center share; teacher balance and center balance reflect the new shares
  (timing → UNK-020).
- **Exceptional cases:** partial payment/installments → UNK-004; overpayment →
  UNK-004; payment covering multiple programs at once → UNK-004.

## WF-03 — Revenue is distributed — *ESTABLISHED*

- **Trigger:** occurs automatically as part of WF-02 — never a separate manual
  step (F-07, F-08).
- **Inputs:** receipt amount; the program's revenue distribution policy.
- **Business rules:** DR-003 (one policy per program), DR-005 (automatic
  calculation), DR-006 (permanence of the applied split). Policy form → UNK-002.
- **Outputs:** teacher share and center share, both recorded inside the voucher.
- **Exceptional cases:** a program with no policy, or amounts the policy cannot
  divide evenly (rounding) → UNK-002.

## WF-04 — Teacher balance changes — *PARTIAL*

- **Trigger:** a receipt voucher on the teacher's program records a teacher share
  (increase, F-07); a teacher payment settles owed amounts (decrease → UNK-008).
- **Inputs:** stored shares from vouchers; teacher payments.
- **Business rules:** DR-009 (balance derives from recorded shares and payments,
  never entered by hand — F-08); accrual timing → UNK-020.
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
  DR-010 (balances are derived quantities); statement scope and periods → UNK-013.
- **Outputs:** center balance, teacher balances, account statements.
- **Exceptional cases:** statement for a period with corrections → UNK-007,
  UNK-013.
