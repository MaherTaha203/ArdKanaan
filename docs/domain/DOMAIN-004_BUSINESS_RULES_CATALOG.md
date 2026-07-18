# DOM-004 — Business Rules Catalog

| Field | Value |
|---|---|
| Doc ID | DOM-004 |
| Title | Business Rules Catalog |
| Phase | 1A |
| Status | FROZEN |
| Version | 3.3.1 |
| Depends on | GOV-001 (F-01…F-09), ADR-0008 (owner decisions D2–D6), ADR-0009 (V1 scope), ADR-0010 (Operations definition), ADR-0013 (Session 3 decisions), ADR-0014 (rounding rule), ADR-0015 (Session 4 teacher payments), ADR-0016 (Session 5 student refunds), ADR-0017 (register restructure), ADR-0018 (Session 6 corrections & cancellations), DOM-001, DOM-002, DOM-003 |
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
- **Possible exceptions:** none — confirmed by S3-D3: a payment covering several
  programs or students MUST be recorded as multiple receipts (→ DR-023).
- **Unknown status:** ~~installments~~ RESOLVED by S3-D3 (→ DR-023);
  ~~payer identity~~ RESOLVED by S3-D1 (→ DR-021).

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
- **Possible exceptions:** none — permanence is absolute. Refunds respect it:
  they reverse revenue via a separate Refund Voucher (DR-041), never by editing
  a past receipt. Corrections respect it too: a financial mistake is fixed by
  cancelling and recreating, never by editing a posted document (DR-044, DR-048).
- **Unknown status:** ~~refund mechanics~~ RESOLVED by S5-D1…D7 (→ DR-036…042);
  ~~correction/cancellation mechanics~~ RESOLVED by S6-D1…D7 (→ DR-043…048).

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
- **Unknown status:** teacher payouts CONFIRMED as Payment Vouchers, one program
  each (→ DR-030, DR-032, ADR-0015); center-expense categories and their
  linkage → UNK-009, UNK-015.

### DR-009 — Teacher balances are derived quantities, per Teacher × Program
- **Description:** Teacher balances are never managed globally: every
  **Teacher × Program** combination is an independent financial relationship
  (→ DR-031). Each such balance is derived from the teacher shares stored in
  that program's posted receipt vouchers, reduced by payments issued for that
  program — never entered by hand.
- **Reason:** The owner must be able to see what each teacher is owed per
  program at any moment without computing; financial separation between
  programs is mandatory. (→ F-05, F-07, F-08; ADR-0015 S4-D4)
- **Dependencies:** DR-005, DR-006, DR-007, DR-008, DR-015, DR-031, DR-034.
- **Possible exceptions:** none stated.
- **Unknown status:** ~~accrual timing~~ RESOLVED by D4 (→ DR-015); ~~negative
  balances/advances~~ RESOLVED by S4-D7 (→ DR-033: advances forbidden);
  departing teachers → UNK-019.

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
- **Dependencies:** DR-005, DR-025.
- **Possible exceptions:** none permitted.
- **Unknown status:** ~~currency~~ RESOLVED by S3-D4 (Shekel, whole numbers —
  → DR-025); ~~rounding direction~~ RESOLVED by ADR-0014 D1 (→ DR-028).

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

### DR-018 — Operations is an activity view that creates no business logic
- **Description:** "Operations" is a chronological, business-friendly activity
  timeline of everything that happened inside the system. It is NOT a business
  entity, financial document, workflow, ledger, or journal. It only *records and
  displays* business events; every business rule belongs to the originating
  entity, never to the timeline.
- **Reason:** The owner needs one place to see the center's history without that
  place becoming a second source of truth. (→ ADR-0010 §1–§4; refines F-05's
  vocabulary)
- **Dependencies:** DR-007 (the view is derived — nothing is entered into it by
  hand).
- **Possible exceptions:** none — logic in the timeline is a defect by
  definition.
- **Unknown status:** —

### DR-019 — The activity timeline is append-only and immutable
- **Description:** Operations represent historical events. The timeline is
  append-only: corrections generate NEW operations; existing operations are never
  edited or deleted; history never disappears.
- **Reason:** The owner must always be able to see what actually happened,
  including mistakes and their corrections. (→ ADR-0010 §7; kin to DR-006's
  permanence principle)
- **Dependencies:** DR-018.
- **Possible exceptions:** none permitted.
- **Unknown status:** ~~how voucher corrections/cancellations work~~ RESOLVED by
  S6-D1…D7 (→ DR-043…048): a cancellation is a "Cancelled" status on the
  original, and both cancellations and logged descriptive edits are append-only
  timeline events.

### DR-020 — Every operation belongs to a source and carries a financial-impact flag
- **Description:** An operation never exists by itself: each belongs to a source
  (Receipt Voucher, Payment Voucher, Training Program, Teacher, Settings, Backup,
  System). Some operations affect money (e.g. receipt posted, teacher payment
  posted) and some do not (e.g. settings changed, program name edited); each
  operation is distinguishable accordingly, and each row must let the owner
  understand what happened without opening the source document.
- **Reason:** The timeline is only trustworthy if every event is anchored to what
  caused it and its money effect is unambiguous. (→ ADR-0010 §5, §6, §8)
- **Dependencies:** DR-018, DR-019.
- **Possible exceptions:** none stated.
- **Unknown status:** —

### DR-021 — Student is the core person entity; payer is optional information
- **Description:** The Student is an independent entity: receipt vouchers,
  account statements, and program registrations belong to the student. The payer
  is an optional **Payer Name** field on the voucher (used when a parent,
  company, or other party pays) — never an independent entity in V1.
- **Reason:** In over 95% of cases the payer is the student or irrelevant to
  record; a payer entity would add weight without value (M-08). (→ ADR-0013
  S3-D1; refines F-05's "Students (or Payers)")
- **Dependencies:** DR-004.
- **Possible exceptions:** none in V1.
- **Unknown status:** —

### DR-022 — Registration is an independent event that precedes payment
- **Description:** A student registers in a training program as a recorded
  business event, independent of payment: registration may happen without any
  payment, payment may follow later, and a student may withdraw before paying.
  Order: Registration → Payment.
- **Reason:** This is how the center actually works. (→ ADR-0013 S3-D2)
- **Dependencies:** DR-021, DR-002.
- **Possible exceptions:** withdrawal after payment is a refund question →
  UNK-006.
- **Unknown status:** —

### DR-023 — One receipt voucher = one student + one program + one payment
- **Description:** Program fees may be paid in installments; every payment gets
  its own receipt voucher with its own number and date, split immediately at its
  posting moment by the program's percentage (DR-005, DR-015). A receipt voucher
  may NEVER cover more than one program or more than one student.
- **Reason:** Keeps every money record atomic and the system very simple (M-08).
  (→ ADR-0013 S3-D3)
- **Dependencies:** DR-004, DR-005, DR-013, DR-015.
- **Possible exceptions:** none in V1 (→ DR-027).
- **Unknown status:** —

### DR-024 — Overpayment is prevented
- **Description:** The system MUST prevent recording a payment larger than the
  amount due for the student's registration in the program. Overpayment does not
  exist in V1.
- **Reason:** No money may enter the records without a matching entitlement to
  training. (→ ADR-0013 S3-D3)
- **Dependencies:** DR-022, DR-023.
- **Possible exceptions:** none in V1 (→ DR-027).
- **Unknown status:** structure of the "amount due" (program price, discounts)
  → UNK-005 (signal: a defined due amount must exist for this rule to operate).

### DR-025 — Whole-shekel currency; one payment method per voucher
- **Description:** The base currency is the Shekel (الشيكل); decimals are not
  used — all amounts and operations are whole numbers. Allowed payment methods
  are cash and bank transfer; each voucher uses exactly one method — mixing
  methods in one voucher is forbidden.
- **Reason:** Matches the center's real money practice. (→ ADR-0013 S3-D4;
  confirms ASM-001; instantiates DR-014's currency ownership of rounding)
- **Dependencies:** DR-014.
- **Possible exceptions:** none in V1 (→ DR-027).
- **Unknown status:** ~~rounding direction~~ RESOLVED by ADR-0014 D1 (→ DR-028).

### DR-026 — Independent continuous voucher numbering
- **Description:** Receipt vouchers and payment vouchers carry independent
  sequential numbers. Sequences never reset (not yearly, not ever); each
  sequence starts at go-live from a number the Owner specifies, aligning the
  system with the existing paper vouchers.
- **Reason:** Continuity with the center's current paper records. (→ ADR-0013
  S3-D5)
- **Dependencies:** DR-004, DR-008.
- **Possible exceptions:** none stated.
- **Unknown status:** whether historical paper records are imported → UNK-022.

### DR-027 — V1 Simplicity Principle
- **Description:** The following are NOT part of Version 1: more than one
  student per voucher; more than one program per voucher; more than one payment
  method per voucher; overpayment; manual distribution; editing a distribution
  after the voucher is posted. Any future need for them belongs to V2 or later
  and MUST NOT affect the V1 design.
- **Reason:** The Owner's pre-emptive simplicity ruling, closing this class of
  questions for V1. (→ ADR-0013 S3-D6; M-08, F-09; kin to ADR-0009's
  future-considerations pattern)
- **Dependencies:** DR-023, DR-024, DR-025; reinforces DR-005 (no manual
  distribution) and DR-006 (no post-posting edits).
- **Possible exceptions:** none — that is the point.
- **Unknown status:** —

### DR-028 — Teacher share rounds to nearest shekel; remainder belongs to the center
- **Description:** When a percentage split produces a fraction, the teacher
  share is rounded to the **nearest whole shekel**; any difference created by
  rounding automatically belongs to the center; the two shares MUST always sum
  to exactly the full voucher amount — rounding may never create an independent
  accounting difference. Examples: 1001 × 70% = 700.7 → teacher 701 / center
  300; teacher at 30%: 1001 × 30% = 300.3 → teacher 300 / center 701.
- **Reason:** Whole-shekel operation (DR-025) requires one deterministic integer
  rule, and the voucher amount must be conserved exactly. (→ ADR-0014 D1)
- **Dependencies:** DR-005, DR-013, DR-014, DR-025.
- **Possible exceptions:** none permitted.
- **Unknown status:** exact-half (.5) direction recorded as ASM-004, awaiting
  confirmation — only reachable by percentages that can produce halves.

### DR-029 — Entitlement arises from posted receipts only, unconditionally
- **Description:** Teacher entitlement is created immediately when a Receipt
  Voucher is officially posted, and by posted student payments ONLY. No
  additional entitlement conditions (program completion, attendance completion,
  or any other) exist in Version 1.
- **Reason:** Entitlement follows the money received, nothing else. (→ ADR-0015
  S4-D1; sharpens DR-015)
- **Dependencies:** DR-015, DR-023.
- **Possible exceptions:** none in V1.
- **Unknown status:** —

### DR-030 — Teacher payments are owner-initiated, never automatic
- **Description:** The system never generates a teacher payment. The payment
  date depends entirely on the agreement between the center and the teacher; a
  payment exists only when the Owner decides to issue a Payment Voucher.
- **Reason:** Payment timing is a human agreement, not a system rule.
  (→ ADR-0015 S4-D2)
- **Dependencies:** DR-008, DR-015.
- **Possible exceptions:** none stated.
- **Unknown status:** —

### DR-031 — Every Teacher × Program pair is an independent financial relationship
- **Description:** Teacher balances are never global. Each Teacher × Program
  combination carries its own independent balance, and the center's liability is
  settled per program: clearing Program A's outstanding entitlement affects
  Program A only. Example: Teacher Ahmed with Excel, ICDL, and Accounting
  programs holds three independent balances.
- **Reason:** Financial separation between programs is mandatory. (→ ADR-0015
  S4-D4, S4-D6)
- **Dependencies:** DR-002, DR-009.
- **Possible exceptions:** none permitted.
- **Unknown status:** —

### DR-032 — A teacher Payment Voucher belongs to exactly one program
- **Description:** Every Payment Voucher issued to a teacher belongs to exactly
  one Program; a single Payment Voucher must never cover multiple programs.
- **Reason:** Program isolation (DR-031) requires atomic per-program payments,
  mirroring DR-023 on the receipt side. (→ ADR-0015 S4-D5; whether
  center-expense payment vouchers also attach to a program is NOT decided —
  UNK-009)
- **Dependencies:** DR-008, DR-031.
- **Possible exceptions:** none in V1.
- **Unknown status:** expense-voucher linkage → UNK-009, UNK-015.

### DR-033 — Partial payments up to outstanding; advances forbidden
- **Description:** A teacher may receive any amount up to the outstanding
  balance of the selected program; the remainder stays outstanding. Advance
  payments before entitlement are forbidden — no payment may exceed the
  program's outstanding balance, so negative balances cannot exist in V1.
- **Reason:** Money owed is the ceiling of money paid. (→ ADR-0015 S4-D3,
  S4-D7)
- **Dependencies:** DR-031, DR-034.
- **Possible exceptions:** none in V1.
- **Unknown status:** —

### DR-034 — Program-level balance arithmetic; no allocation algorithms
- **Description:** Payments associate with a Program only — never with specific
  receipts; no receipt-allocation algorithm of any kind exists. Outstanding
  Balance = Total Teacher Entitlement − Total Payments issued for that Program.
  Every Payment Voucher remains permanently recorded and payment history is
  always available for auditing.
- **Reason:** One simple subtraction per program replaces an entire allocation
  machine (M-08). (→ ADR-0015 S4-D10, S4-D11)
- **Dependencies:** DR-031, DR-006, DR-019.
- **Possible exceptions:** none permitted.
- **Unknown status:** —

### DR-035 — Teacher entitlement is fully traceable
- **Description:** The system must provide a complete entitlement breakdown:
  every component of a teacher's entitlement is inspectable — the Receipt
  Voucher, the Student, the Program, the payment amount, the distribution
  percentage, and the teacher share. A teacher balance must always be fully
  traceable to its components.
- **Reason:** A balance the owner cannot decompose is a balance the owner
  cannot trust. (→ ADR-0015 S4-D9; M-10, DR-007)
- **Dependencies:** DR-006, DR-009, DR-028.
- **Possible exceptions:** none permitted.
- **Unknown status:** presentation scope of statements → UNK-013.

### DR-036 — A refund is a reversal of recognized revenue
- **Description:** A Student Refund is NOT a new operating expense. It is a
  REVERSAL of previously recognized revenue: the refunded amount is treated as
  though that portion of the revenue had never been earned. This is the
  governing principle for every refund-related workflow, and a reversal is
  necessarily bounded by previously recognized revenue — a refund cannot exceed
  the Student × Program net paid amount.
- **Reason:** Refunded money was never truly earned; treating it as an expense
  would distort every downstream number. (→ ADR-0016 S5-D1)
- **Dependencies:** DR-017, DR-023.
- **Possible exceptions:** none — governing principle.
- **Unknown status:** —

### DR-037 — A refund reduces Program Revenue and the Student Paid Amount
- **Description:** Every refund reduces the Program Revenue and the
  Student × Program paid amount, and the financial state MUST be recalculated
  after every refund.
- **Reason:** Reversal semantics (DR-036) applied to the two quantities the
  money touched. (→ ADR-0016 S5-D2)
- **Dependencies:** DR-036, DR-024.
- **Possible exceptions:** none stated.
- **Unknown status:** —

### DR-038 — Teacher entitlement reflects net revenue after refunds
- **Description:** Teacher entitlement always reflects the net revenue after
  refunds. If the teacher has NOT yet been paid, a refund immediately and
  automatically reduces the teacher's entitlement — no manual adjustment. The
  outstanding-balance arithmetic of DR-034 operates on this net entitlement.
- **Reason:** The teacher's share follows the revenue that actually stands.
  (→ ADR-0016 S5-D3)
- **Dependencies:** DR-036, DR-037, DR-009, DR-034.
- **Possible exceptions:** teacher already paid → DR-039.
- **Unknown status:** exact net-recalculation formula and its interaction with
  nearest-shekel rounding (DR-028) → UNK-027.

### DR-039 — A refunded, already-paid teacher share becomes a teacher debt
- **Description:** If the teacher has already received payment for the refunded
  amount, the refunded teacher share becomes a debt owed by the teacher to the
  center, settled by either immediate repayment by the teacher OR deduction
  from future teacher entitlements. The center does NOT permanently absorb the
  refunded teacher share. Teacher debt is its own concept — it is not a
  negative program balance (DR-033 stands).
- **Reason:** Money already handed over for revenue that was reversed must come
  back. (→ ADR-0016 S5-D4; this refund-debt settlement is distinct from the
  general deduction model postponed by S4-D8 — UNK-021 remains open)
- **Dependencies:** DR-036, DR-038, DR-030.
- **Possible exceptions:** none stated.
- **Unknown status:** debt calculation and management (tracking scope,
  cross-program deduction vs DR-031, settlement recording) → UNK-026.

### DR-040 — Refunds attach to Student × Program only; no receipt allocation
- **Description:** Refunds are never allocated to individual Receipt Vouchers —
  no receipt-matching or receipt-allocation algorithm of any kind. A refund
  reduces the total paid amount
  of the Student × Program and is associated with the Student and the Program
  only.
- **Reason:** Mirrors DR-034's rejection of allocation machinery on the payment
  side (M-08). (→ ADR-0016 S5-D5)
- **Dependencies:** DR-023, DR-034, DR-037.
- **Possible exceptions:** none permitted.
- **Unknown status:** —

### DR-041 — Refunds are recorded by the dedicated Refund Voucher
- **Description:** Refunds are recorded using a dedicated, independent
  financial document: the **Refund Voucher (سند استرجاع)**. It is NOT a Payment
  Voucher and NOT an expense voucher; it exists solely to record student
  refunds.
- **Reason:** A revenue reversal must never masquerade as outgoing expense
  documentation (DR-036 vs DR-008). (→ ADR-0016 S5-D6)
- **Dependencies:** DR-036, DR-008 (by contrast).
- **Possible exceptions:** none permitted.
- **Unknown status:** — (Refund Voucher numbering is a deferred design
  decision, removed from Domain Discovery by ADR-0017 §2 — not a domain
  unknown.)

### DR-042 — Refund Voucher responsibilities and ledger effects
- **Description:** Every Refund Voucher references the Student and the Program,
  records the refund amount and the refund reason, reverses recognized revenue,
  affects teacher entitlement, appears in the Student Statement, and
  participates in the full audit trail. Entailed balance effects (S5-D2/D3/D4
  with DR-016/DR-017): Cash Balance decreases by the refunded amount; Center
  Net Balance decreases by the center's portion of the reversal; Teacher
  Payables decreases by the teacher's portion (unpaid case) or a teacher debt
  arises instead (paid case, DR-039).
- **Reason:** The refund's full footprint must be visible and auditable.
  (→ ADR-0016 S5-D7; M-10)
- **Dependencies:** DR-036…DR-041, DR-016, DR-017, DR-019.
- **Possible exceptions:** none stated.
- **Unknown status:** —

### DR-043 — Saving a financial document immediately posts it
- **Description:** Recording (saving) a financial voucher IS posting it: every
  financial document (Receipt, Payment, Refund Voucher) becomes Posted
  immediately on save.
- **Reason:** Recording and posting are one act in the center's daily practice —
  enter → quick review → save. (→ ADR-0018 S6-D6)
- **Dependencies:** DR-001.
- **Possible exceptions:** none.
- **Unknown status:** —

*(Version-scope note, not part of the business rule: whether a separate Draft
stage exists is product/version scope, not business behavior — V1 has no Draft
stage; see ADR-0018 S6-D6 and §Future considerations.)*

### DR-044 — Posted financial documents are immutable
- **Description:** A Posted financial document is never edited and never
  deleted; it is preserved permanently. Financial errors are handled by
  cancellation (DR-045…DR-047), never by altering or removing the posted
  document.
- **Reason:** A complete, tamper-evident audit trail — always able to answer
  what happened, who did it, when, and which document corrected the error.
  (→ ADR-0018 S6-D1; extends DR-006, DR-019)
- **Dependencies:** DR-006, DR-019, DR-043.
- **Possible exceptions:** descriptive (non-financial) fields may be edited with
  logging — DR-048.
- **Unknown status:** —

### DR-045 — A permitted cancellation reverses all financial effects automatically
- **Description:** When cancellation is permitted (DR-046), all financial
  effects generated by that document are automatically reversed and the system
  returns to the state immediately before that document existed — Cash Balance,
  teacher entitlement, Center Net Balance, and all derived balances and reports
  update with no further user action.
- **Reason:** Cancellation must be a single, complete, self-correcting act.
  (→ ADR-0018 S6-D2; worded to hold independently of the dependency rule)
- **Dependencies:** DR-016, DR-017, DR-046.
- **Possible exceptions:** none — the reversal is total.
- **Unknown status:** —

### DR-046 — No document may be cancelled while later documents depend on it
- **Description:** A document cannot be cancelled while later financial documents
  depend on it. Dependent documents must be removed beginning with the newest
  dependent document until the original document becomes independent (e.g. cancel
  a teacher Payment Voucher before the receipt it drew from; cancel a Refund
  Voucher before the receipt it depends on). Cancellation never creates automatic
  debts or open items — the user removes dependents first.
- **Reason:** Preserve the financial timeline — no document may reference a
  source that no longer exists — while keeping a single-operator system simple.
  (→ ADR-0018 S6-D3; M-08)
- **Dependencies:** DR-044, DR-030, DR-039, DR-041.
- **Possible exceptions:** none permitted.
- **Unknown status:** —

### DR-047 — Cancellation is a status on the original document, fully preserved
- **Description:** Cancelling a Posted document creates no separate cancellation
  document; the original keeps its place and carries a **"Cancelled"** status —
  never deleted, never hidden. It remains visible in the voucher log, the
  student (member) statement, financial-history reports, and the activity
  timeline, clearly shown as cancelled. Each cancellation records its date, its
  reason (mandatory), and the actor who cancelled it (the owner, the single
  user — F-02).
- **Reason:** Preserve the full history without adding extra document types
  (M-08, M-10). (→ ADR-0018 S6-D4)
- **Dependencies:** DR-044, DR-045, DR-019.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-048 — Financial fields cancel-and-recreate; descriptive fields edit-with-log
- **Description:** Fields that affect money — amount, student, program, payment
  method, or anything affecting balances, entitlements, or financial reports —
  are never edited after posting; correcting them is always cancel the original
  + create a new correct document. Descriptive fields that affect no money —
  notes, Payer Name, extra description — may be edited after posting, provided
  the change is recorded in the activity log with date, user, and old value →
  new value; such an edit triggers no financial recalculation.
- **Reason:** Lock what money depends on; allow harmless descriptive fixes
  without the weight of cancellation, but never silently. (→ ADR-0018 S6-D5)
- **Dependencies:** DR-044, DR-021, DR-019.
- **Possible exceptions:** none beyond the financial/descriptive split itself.
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

Additionally postponed (Session 6, ADR-0018 S6-D6):

- **Draft / posting lifecycle** (`Draft → Review → Posted`). V1 has no Draft
  stage — saving a financial document posts it immediately (DR-043). A Draft
  stage is a possible future development, not an active V1 behavior; nothing in
  V1 may depend on it.
