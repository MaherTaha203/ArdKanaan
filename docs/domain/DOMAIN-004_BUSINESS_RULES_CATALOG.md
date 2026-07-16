# DOM-004 — Business Rules Catalog

| Field | Value |
|---|---|
| Doc ID | DOM-004 |
| Title | Business Rules Catalog |
| Phase | 1A |
| Status | FROZEN |
| Version | 2.0.0 |
| Depends on | GOV-001 (F-01…F-09), ADR-0008 (owner decisions D2–D6), ADR-0009 (V1 scope), DOM-001, DOM-002, DOM-003 |
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
- **Unknown status:** ~~policy form and scope~~ RESOLVED by D2 and the V1 scope
  decision (→ DR-013, ADR-0009); how/when a policy changes → UNK-003.

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
- **Unknown status:** ~~rounding~~ RESOLVED by D3 (→ DR-014).

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
- **Dependencies:** DR-005, DR-006, DR-007, DR-008, DR-015.
- **Possible exceptions:** unknown.
- **Unknown status:** ~~accrual timing~~ RESOLVED by D4 (→ DR-015); negative
  balances/advances → UNK-008; departing teachers → UNK-019.

### DR-010 — Center balances are derived quantities
- **Description:** The center-side balances (Cash Balance, Center Net Balance,
  Teacher Payables in aggregate) are derived from recorded receipts and payments —
  never maintained by hand.
- **Reason:** Same as DR-009, for the center. (→ F-05, F-08)
- **Dependencies:** DR-005…DR-008, DR-016.
- **Possible exceptions:** unknown.
- **Unknown status:** ~~composition~~ RESOLVED by D5 (→ DR-016).

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

### DR-013 — V1 compensation is a percentage of posted receipts
- **Description:** In Version 1, every program's distribution policy is a
  **percentage split** of each posted receipt: a teacher percentage and a center
  percentage that MUST always sum to exactly 100%. No other compensation model is
  valid in V1.
- **Reason:** The owner's strategic V1 scope decision after architectural review.
  (→ ADR-0009; examples: English → Teacher 70% / Center 30%, Mathematics →
  Teacher 60% / Center 40%)
- **Dependencies:** DR-003, DR-005.
- **Possible exceptions:** none — percentages that do not sum to 100% are
  invalid.
- **Unknown status:** —

### DR-014 — Rounding belongs exclusively to the currency
- **Description:** Distribution rules never define rounding. If the currency
  supports decimals, the exact decimal value is stored; if not, the currency's
  official rounding rules apply. No custom rounding logic exists in the business.
- **Reason:** Rounding is a property of money itself, not of any agreement.
  (→ Owner decision D3, ADR-0008)
- **Dependencies:** DR-005.
- **Possible exceptions:** none permitted.
- **Unknown status:** which currency the business uses → UNK-010.

### DR-015 — Teacher entitlement begins at receipt posting
- **Description:** The moment a receipt voucher is posted, a teacher receivable
  is created: the teacher's share is owed from that moment. Entitlement and
  payment are two different business events — payment happens later.
- **Reason:** The teacher's right arises from the money being received, not from
  the owner's later cash decision. (→ Owner decision D4, ADR-0008)
- **Dependencies:** DR-005, DR-006, DR-012.
- **Possible exceptions:** none stated.
- **Unknown status:** —

### DR-016 — Three balances, never merged
- **Description:** The business distinguishes three balances that must never be
  merged: **Cash Balance** (all cash currently held), **Teacher Payables** (money
  currently owed to teachers), and **Center Net Balance** (the center's own
  earned share). Owner's worked example: after one 1000 receipt at 70/30 —
  Cash 1000, Teacher Payables 700, Center Net 300.
- **Reason:** Merging them hides what the owner actually needs to know: what is
  in the box, what is owed, and what is earned. (→ Owner decision D5, ADR-0008;
  refines F-05's "Center Balance / Teacher Balances", see ADR-0008 interpretation
  boundaries)
- **Dependencies:** DR-009, DR-010, DR-012, DR-015.
- **Possible exceptions:** none — separation is absolute.
- **Unknown status:** —

### DR-017 — Posting a receipt drives the automatic revenue ledger
- **Description:** Every posted receipt voucher automatically creates three
  business effects: increase Cash Balance (full amount), increase Teacher
  Payables (teacher share), increase Center Net Balance (center share). This is a
  business ledger, NOT an accounting journal.
- **Reason:** The three balances must always reflect reality without any manual
  step. (→ Owner decision D6, ADR-0008; F-07, F-08)
- **Dependencies:** DR-005, DR-006, DR-015, DR-016.
- **Possible exceptions:** none stated.
- **Unknown status:** —

---

## Future considerations — NOT part of Version 1

The following compensation models were raised during Session 1 (ADR-0008 D1) and
**postponed — not cancelled — by the owner's V1 scope decision (ADR-0009)**. They
are recorded here only so they are not forgotten or re-invented. They are NOT
active business rules, have NO workflows, generate NO interview questions, and
NOTHING in V1 may depend on them:

- Fixed amount per student
- Fixed amount per training program
- Fixed monthly salary
- Custom compensation agreements defined by the owner

Reintroducing any of them is a future-version decision requiring its own ADR and
its own domain discovery of per-receipt money semantics (the questions formerly
tracked as UNK-024).
