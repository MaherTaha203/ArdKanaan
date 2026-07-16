# DOM-004 — Business Rules Catalog

| Field | Value |
|---|---|
| Doc ID | DOM-004 |
| Title | Business Rules Catalog |
| Phase | 1A |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | GOV-001 (F-01…F-09), DOM-001, DOM-002, DOM-003 |
| Referenced by | DOM-005; Phase 1+ documents MUST reconcile with this catalog (ADR-0007 §3) |

---

Every domain rule (`DR-NNN`) below is grounded in the frozen facts (F-atoms) or in
an explicit owner statement — no rule is invented (AI-10). Where a rule's edges are
unconfirmed, its **Unknown status** cites `UNK-NNN` (→ DOM-005). Rules are unique;
no duplicates.

---

### DR-001 — One center, one owner
- **Description:** The business is exactly one training center, operated by
  exactly one owner, with one set of records.
- **Reason:** This is the business's actual shape; the system must never grow past
  it. (→ F-02, F-03, M-02, M-03)
- **Dependencies:** none (root rule).
- **Possible exceptions:** none permitted.
- **Unknown status:** —

### DR-002 — Every program has exactly one teacher
- **Description:** Each training program belongs to one teacher; a teacher may
  have any number of programs.
- **Reason:** Revenue from a program must flow to an unambiguous teacher. (→ F-06)
- **Dependencies:** DR-001.
- **Possible exceptions:** none stated; co-taught programs are not part of the
  domain as described.
- **Unknown status:** program lifecycle details → UNK-016.

### DR-003 — Every program has exactly one revenue distribution policy
- **Description:** Each training program carries one policy that defines how its
  receipts split between teacher and center.
- **Reason:** Every receipt must be divisible automatically without asking anyone.
  (→ F-06, F-08)
- **Dependencies:** DR-002.
- **Possible exceptions:** none stated.
- **Unknown status:** policy form (percentage/fixed/tiered) and whether policies
  are shared across programs → UNK-002; how/when a policy changes → UNK-003.

### DR-004 — Every receipt belongs to exactly one program
- **Description:** Money received is recorded as a receipt voucher tied to exactly
  one training program.
- **Reason:** The program connects the money to its teacher and policy. (→ F-06)
- **Dependencies:** DR-002, DR-003.
- **Possible exceptions:** a payment intended to cover several programs would have
  to be recorded as multiple receipts — unconfirmed. (→ UNK-004)
- **Unknown status:** installments/partial payments → UNK-004; payer identity
  depth → UNK-011.

### DR-005 — The split is calculated automatically at receipt
- **Description:** When a receipt is recorded, the teacher share and center share
  are computed from the program's policy with no manual arithmetic.
- **Reason:** The owner must never calculate manually. (→ F-07, F-08; owner's
  example: 1000 → 700 teacher / 300 center)
- **Dependencies:** DR-003, DR-004.
- **Possible exceptions:** none — this rule is absolute.
- **Unknown status:** rounding behavior for indivisible amounts → UNK-002.

### DR-006 — The applied split is stored in the voucher permanently
- **Description:** Each receipt voucher permanently holds the split that was
  applied to it; later policy changes never affect existing vouchers.
- **Reason:** Historical money records must be immune to future agreements. (→ F-07)
- **Dependencies:** DR-005.
- **Possible exceptions:** none — permanence is absolute. Corrections, if the
  business allows them, must work around this rule, not through it. (→ UNK-007)
- **Unknown status:** correction/cancellation/refund mechanics → UNK-006, UNK-007.

### DR-007 — Nothing computable is ever entered by hand
- **Description:** Any value derivable from existing records — shares, balances,
  totals, statements — is derived, never requested from the owner.
- **Reason:** The Absolute Rule of the business. (→ F-08, M-07)
- **Dependencies:** applies across all rules.
- **Possible exceptions:** none permitted.
- **Unknown status:** —

### DR-008 — Outgoing money is recorded as a payment voucher
- **Description:** Money leaving the center is documented as a payment voucher.
- **Reason:** All money movement must be recorded. (→ F-05; M-10's auditability
  principle applied to the business's own records)
- **Dependencies:** DR-001.
- **Possible exceptions:** unknown.
- **Unknown status:** payment voucher categories and linkage (teacher payments?
  expenses? programs?) → UNK-008, UNK-009, UNK-015.

### DR-009 — Teacher balance is a derived quantity
- **Description:** A teacher's balance is derived from the teacher shares stored
  in receipt vouchers of their programs, reduced by payments made to that teacher.
- **Reason:** The owner must be able to see what each teacher is owed at any
  moment without computing. (→ F-05, F-07, F-08)
- **Dependencies:** DR-005, DR-006, DR-007, DR-008.
- **Possible exceptions:** unknown.
- **Unknown status:** accrual timing (does the share become owed at receipt?) →
  UNK-020; negative balances/advances → UNK-008; departing teachers → UNK-019.

### DR-010 — Center balance is a derived quantity
- **Description:** The center's balance is derived from recorded receipts and
  payments — never maintained by hand.
- **Reason:** Same as DR-009, for the center. (→ F-05, F-08)
- **Dependencies:** DR-005…DR-008.
- **Possible exceptions:** unknown.
- **Unknown status:** exact composition — center share only, or all cash held
  including unpaid teacher shares → UNK-020.

### DR-011 — Account statements are views, not records
- **Description:** A statement presents existing recorded activity; producing one
  records nothing new and requires no input that the records already contain.
- **Reason:** Follows from DR-007. (→ F-05, F-08)
- **Dependencies:** DR-007, DR-009, DR-010.
- **Possible exceptions:** none identified.
- **Unknown status:** statement scopes and periods → UNK-013.

### DR-012 — The teacher share never belongs to the center
- **Description:** From the moment a receipt is split, the teacher share is owed
  to the teacher; the center may hold the cash but never treats that portion as
  its own.
- **Reason:** This is the meaning of the split and of separate balances. (→ F-05,
  F-07)
- **Dependencies:** DR-005, DR-006, DR-009.
- **Possible exceptions:** none stated.
- **Unknown status:** whether any deductions from teacher shares exist (fees,
  penalties) → UNK-021.
