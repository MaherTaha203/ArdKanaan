# DOM-004 — Business Rules Catalog

| Field | Value |
|---|---|
| Doc ID | DOM-004 |
| Title | Business Rules Catalog |
| Phase | 1A |
| Status | FROZEN |
| Version | 3.9.0 |
| Depends on | GOV-001 (F-01…F-09), ADR-0008 (owner decisions D2–D6), ADR-0009 (V1 scope), ADR-0010 (Operations definition), ADR-0013 (Session 3 decisions), ADR-0014 (rounding rule), ADR-0015 (Session 4 teacher payments), ADR-0016 (Session 5 student refunds), ADR-0017 (register restructure), ADR-0018 (Session 6 corrections & cancellations), ADR-0019 (Session 7 expense categories), ADR-0020 (Session 8 expense returns), ADR-0021 (Session 9 refund entitlement & teacher debt), ADR-0022 (Session 10 program definition, pricing & policy), ADR-0023 (Session 11 business boundary & operational completeness), ADR-0024 (Session 12 final boundary confirmations), DOM-001, DOM-002, DOM-003 |
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
  domain as described (one teacher per program confirmed for V1 — ADR-0022 S10-D3).
- **Unknown status:** ~~program lifecycle details~~ RESOLVED by S10-D1/D9…D14
  (→ DR-071: a Program is a single Program Run; DR-077: documentary dates;
  DR-078/DR-079: Open/Closed lifecycle).

### DR-003 — Every program has exactly one revenue distribution policy
- **Description:** Each training program carries one policy that defines how its
  receipts split between teacher and center.
- **Reason:** Every receipt must be divisible automatically without asking anyone.
  (→ F-06, F-08)
- **Dependencies:** DR-002.
- **Possible exceptions:** none stated.
- **Unknown status:** ~~policy form and scope~~ RESOLVED by D2 and the V1 scope
  decision (→ DR-013, ADR-0009); ~~how/when a policy changes~~ RESOLVED by
  S10-D8 (→ DR-076: the percentage is fixed for the program's life; a changed
  agreement is a new program, never an in-place change).

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
  each (→ DR-030, DR-032, ADR-0015); ~~center-expense categories and linkage~~
  RESOLVED by S7-D1…D6 (→ DR-049…054): a center expense is a Payment Voucher,
  general and center-borne, carrying one expense category.

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
  ~~departing teachers~~ RESOLVED by S11-D4/D5 (→ DR-083: Active/Inactive-Left
  status blocks only new assignment; DR-084: all balance operations remain
  available regardless of status).

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
- **Possible exceptions:** withdrawal after payment is a refund (DR-036…DR-042);
  a refund never changes registration status automatically (DR-085). Ending or
  reactivating a registration is a separate Owner action (DR-086, DR-087).
- **Unknown status:** ~~refund/registration relationship~~ RESOLVED by S11-D6…D8
  (→ DR-085, DR-086, DR-087).

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
- **Unknown status:** ~~structure of the "amount due" (program price, discounts)~~
  RESOLVED by S10-D4…D7 (→ DR-072: a program base price; DR-073: per-registration
  override; DR-074: a single stored Final Registration Price, no discount concept;
  DR-075: locked at the first receipt). The amount due is the Final Registration
  Price.

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
  accounting difference. On an **exact half shekel (.5)** the teacher share
  rounds **up** to the whole shekel (**round-half-up**, standard commercial
  rounding), the difference again going to the center. Examples: 1001 × 70% =
  700.7 → teacher 701 / center 300; teacher at 30%: 1001 × 30% = 300.3 → teacher
  300 / center 701; 1001 @ 50/50 = 500.5 each → teacher 501 / center 500.
- **Reason:** Whole-shekel operation (DR-025) requires one deterministic integer
  rule, and the voucher amount must be conserved exactly; the exact-half
  direction is fixed to round-half-up so the rule is fully predictable.
  (→ ADR-0014 D1; ADR-0024 S12-D6 confirming ASM-004)
- **Dependencies:** DR-005, DR-013, DR-014, DR-025.
- **Possible exceptions:** none permitted.
- **Unknown status:** ~~exact-half (.5) direction~~ RESOLVED by S12-D6 —
  round-half-up (ASM-004 CONFIRMED). Only ever reachable by percentages that can
  produce halves (e.g. 50% of an odd amount); never for 70/30.

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
  mirroring DR-023 on the receipt side. (→ ADR-0015 S4-D5) This rule scopes
  **teacher** payment vouchers only; center-expense payment vouchers are general
  and carry no program (DR-052).
- **Dependencies:** DR-008, DR-031.
- **Possible exceptions:** none in V1.
- **Unknown status:** — (center-expense linkage RESOLVED by S7-D4 → DR-052:
  expenses stand alone, no program).

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
- **Unknown status:** ~~exact net-recalculation formula and its interaction with
  nearest-shekel rounding~~ RESOLVED by S9-D1…D3 (→ DR-062: reduce by the
  original program percentage; DR-063: rounding per DR-028; DR-064: unpaid
  entitlement floors at zero).

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
- **Unknown status:** ~~debt calculation and management (tracking scope,
  cross-program deduction vs DR-031, settlement recording)~~ RESOLVED by
  S9-D4…D9 (→ DR-065: when a debt exists; DR-066: per Teacher × Program, never
  merged; DR-067: settleable balance, never negative, closes at zero; DR-068:
  two settlement paths, Owner-chosen; DR-069: no expiry; DR-070: repayment-only
  when no future entitlement).

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
  Voucher before the receipt it depends on; cancel an expense return before the
  expense it reduces). Cancellation never creates automatic debts or open items —
  the user removes dependents first.
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

### DR-049 — What is (and is not) an expense
- **Description:** An expense is money the center pays for a good, service, or
  obligation **to operate the center itself**, that does **not** settle a
  pre-existing financial right of another party. Settlements of pre-existing
  rights are NOT expenses: teacher payments settle teacher entitlement (DR-030)
  and student refunds reverse recognized revenue (DR-036) — neither is an
  expense.
- **Reason:** Operating costs must be separated from settlements and reversals
  so each balance means what it should. (→ ADR-0019 S7-D1)
- **Dependencies:** DR-008, DR-030, DR-036.
- **Possible exceptions:** none stated.
- **Unknown status:** ~~money returning to the center after an expense~~ RESOLVED
  by S8-D1…D9 (→ DR-055…DR-061).

### DR-050 — Expenses are recorded uniformly, regardless of what is bought
- **Description:** Every expense is recorded the same way — by category and
  amount — whether it buys a consumable (electricity, stationery) or a durable
  item (furniture, a device). The nature of the purchased item does not change
  how the expense is recorded.
- **Reason:** The center records what it spent, not what it owns. (→ ADR-0019
  S7-D2)
- **Dependencies:** DR-049, DR-051.
- **Possible exceptions:** none in V1.
- **Unknown status:** —

  *(Version-scope note, not part of the business rule: V1 does not distinguish
  Fixed Assets from ordinary expenses; a fixed-asset/capitalization distinction
  is a Future Consideration and may be introduced in a later version — see
  §Future considerations. This does not permanently classify durable purchases
  as expenses for all future versions.)*

### DR-051 — Expenses are classified by a single category from an expandable list
- **Description:** Every expense is assigned **exactly one** category, chosen
  from a named list of expense categories that the owner can extend by adding
  new categories when needed. Categories exist so the owner can see per-category
  spending totals alongside the detail of each expense.
- **Reason:** The owner wants to see what was spent — by category and in detail.
  (→ ADR-0019 S7-D3)
- **Dependencies:** DR-049.
- **Possible exceptions:** an expense never belongs to more than one category.
- **Unknown status:** —

### DR-052 — In V1 every expense is center-borne
- **Description:** In Version 1, every expense is borne by the center: recording
  it reduces the **Cash Balance** (money out) and the **Center Net Balance** (the
  center bears the cost from its own earnings), and never touches any teacher's
  entitlement.
- **Reason:** Expenses are the center's operating costs, not the teachers'.
  (→ ADR-0019 S7-D4; consistent with S4-D8 / UNK-021 — no teacher deductions in
  V1)
- **Dependencies:** DR-016, DR-049.
- **Possible exceptions:** allocating an expense to a program (and thereby to its
  teacher), or splitting it proportionally, is postponed to a later version
  (→ §Future considerations) — it would deduct from teachers (UNK-021).
- **Unknown status:** —

### DR-053 — An expense is recorded only when cash has left the center
- **Description:** An expense is recorded at the moment the cash actually leaves
  the center, always paid from the center's own money. Version 1 has no
  unpaid/accrued expense (no owed-but-unpaid bill) and no owner-personal-money
  payment path.
- **Reason:** The center records money it has actually spent from its own box.
  (→ ADR-0019 S7-D5)
- **Dependencies:** DR-008, DR-052.
- **Possible exceptions:** none in V1.
- **Unknown status:** —

### DR-054 — Expenses require no approval step
- **Description:** The owner records an expense directly; V1 has no approval or
  review step before an expense is recorded.
- **Reason:** Single owner-operator (F-02); an approval step would serve no one.
  (→ ADR-0019 S7-D6; M-08)
- **Dependencies:** DR-052.
- **Possible exceptions:** none in V1.
- **Unknown status:** —

### DR-055 — An expense return is a financial value returning because of a prior expense
- **Description:** An **expense return** is a financial value that returns to the
  center **because of a specific prior expense**. It references exactly one prior
  expense (DR-058); with no prior expense to reference, it is not an expense
  return but a different financial situation handled separately.
- **Reason:** The concept is defined by its link to a prior expense, not by any
  one mechanism of return. (→ ADR-0020 S8-D1)
- **Dependencies:** DR-049.
- **Possible exceptions:** none — the link to a prior expense is definitional.
- **Unknown status:** —

### DR-056 — An expense return reduces the original expense; never income
- **Description:** An expense return reduces/reverses the original expense — the
  center's real cost falls by the returned amount (1000 spent, 300 back → real
  expense 700; a full return zeroes the expense). It is never recorded as new
  income or revenue.
- **Reason:** Money back for a cost is a smaller cost, not earnings. (→ ADR-0020
  S8-D2; mirrors DR-036 on the revenue side)
- **Dependencies:** DR-055, DR-052.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-057 — Partial and multiple returns, bounded by the original amount
- **Description:** One expense may receive partial returns and several returns
  over time; the **total returned may never exceed the original expense** (a full
  return is the ceiling). Any amount beyond the original is not an expense
  return — it is a different transaction outside this concept.
- **Reason:** You cannot reverse more cost than was incurred. (→ ADR-0020 S8-D3;
  mirrors the bounds of DR-024 and DR-036)
- **Dependencies:** DR-055, DR-056.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-058 — One return references exactly one expense
- **Description:** Each expense return references exactly one original expense. A
  lump-sum supplier refund covering several expenses is split at entry into
  several independent returns, each referencing one expense. One expense may
  accumulate several returns; one return never spans multiple expenses.
- **Reason:** Atomic, auditable per-expense history (M-08); mirrors DR-023 and
  DR-032. (→ ADR-0020 S8-D4)
- **Dependencies:** DR-055.
- **Possible exceptions:** none in V1.
- **Unknown status:** —

### DR-059 — A return requires a standing (Posted, non-cancelled) expense
- **Description:** An expense return may be recorded only against an original
  expense that exists, is Posted, and is not cancelled. A cancelled expense can
  carry no return (nothing remains to reduce); cash arriving after a cancelled
  expense is a different situation, outside this concept. Because a return
  depends on its expense, that expense cannot be cancelled while a return is
  attached — the return is cancelled first (DR-046).
- **Reason:** A reversal needs a standing thing to reverse. (→ ADR-0020 S8-D5;
  consistent with DR-044, DR-046)
- **Dependencies:** DR-055, DR-044, DR-046.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-060 — In V1 an expense return is realized by actual cash returning
- **Description:** In Version 1, an expense return is realized by **actual cash
  returning** to the center — increasing the Cash Balance and, by reversing the
  center-borne expense, increasing the Center Net Balance; it never touches any
  teacher. A **credit note** is not an expense return: it returns no financial
  value now, only a future credit right. **Goods replacement** returns no cash.
  Non-cash settlements are outside V1.
- **Reason:** The concept is "a financial value returns because of a prior
  expense" (DR-055); V1 realizes it through cash. Credit notes create a future
  credit (no value returned now); goods replacement returns no cash. (→ ADR-0020
  S8-D6, S8-D7)
- **Dependencies:** DR-055, DR-016, DR-052.
- **Possible exceptions:** non-cash returns (credit notes, goods replacement,
  any settlement without cash inflow) are postponed → §Future considerations.
- **Unknown status:** —

  *(Version-scope note, not part of the business rule: the enduring concept is
  "a financial value returns to the center because of a prior expense" (DR-055);
  V1 realizes it only through cash. Non-cash realizations — credit notes /
  supplier balances, goods replacement — are Future Considerations.)*

### DR-061 — No time limit on expense returns
- **Description:** There is no time limit for recording an expense return;
  acceptance depends only on the link to the original expense (Posted,
  non-cancelled, ceiling not exceeded), not on how much time has passed.
- **Reason:** Time does not change the nature of the transaction. (→ ADR-0020
  S8-D8)
- **Dependencies:** DR-055, DR-059.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-062 — A refund reduces teacher entitlement by the original program percentage
- **Description:** When a student refund reverses revenue, the teacher's
  entitlement on that program is reduced by the **same percentage that was
  originally applied** to the enrollment (the program's teacher percentage),
  computed on the refunded amount. The percentage is a property of the program,
  constant regardless of which receipt the money came from; teacher entitlement
  is **cumulative across the Teacher × Program**, never tied to a single receipt.
  Example: 1000 at 70/30, refund 400 → teacher entitlement falls by 280 (to 420),
  center by 120 (to 180).
- **Reason:** A reversal must unwind the same split that recognized the revenue,
  or the balances stop reflecting reality. (→ ADR-0021 S9-D1, S9-D3a; applies
  DR-038's net-revenue principle)
- **Dependencies:** DR-038, DR-013, DR-031.
- **Possible exceptions:** none — the reversal always uses the original
  percentage.
- **Unknown status:** —

### DR-063 — Refund entitlement reductions follow the currency rounding rule
- **Description:** When a refund's teacher share produces a fraction, it is
  rounded to the **nearest whole shekel**, any rounding difference belongs to the
  center, and the teacher and center reductions **sum exactly to the refunded
  amount** — the same deterministic rule the receipt side uses (DR-028). Example:
  refund 401 at 70% → teacher reduction 281, center reduction 120.
- **Reason:** One rounding rule governs every split in the system, in both
  directions; the refunded amount must be conserved exactly. (→ ADR-0021 S9-D2)
- **Dependencies:** DR-028, DR-062.
- **Possible exceptions:** none permitted.
- **Unknown status:** —

### DR-064 — Unpaid teacher entitlement never displays negative; a shortfall signals a debt
- **Description:** While the teacher has **not** yet been paid for the refunded
  portion, a refund reduces the teacher's entitlement directly, and that
  entitlement **never displays a negative value** — it floors at zero. A
  reduction that would push it below zero is the **signal that a teacher debt
  arises** (DR-065), not a negative balance.
- **Reason:** Entitlement is money still owed to the teacher; you cannot owe less
  than nothing. A shortfall is a different concept — money the teacher must return
  — and is modelled as a debt, not as a negative entitlement. (→ ADR-0021 S9-D3b;
  keeps DR-033's no-negative-balance discipline)
- **Dependencies:** DR-038, DR-062, DR-065.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-065 — A teacher debt exists only when payments exceed the final entitlement
- **Description:** A **teacher debt exists only when the total amount already paid
  to the teacher for a program exceeds that teacher's final entitlement for the
  program after all refund recalculations.** The excess is the debt. If the amount
  paid does not exceed the final entitlement, there is no debt — the refund simply
  reduces the outstanding entitlement (DR-064). *(Explanatory arithmetic, not part
  of the rule: Teacher Debt = Total Teacher Payments − Final Teacher Entitlement,
  recognized only when positive. Example: paid 700, final entitlement 420 → debt
  280.)*
- **Reason:** Money already handed over for revenue that was later reversed must
  come back; but only the part that exceeds what the teacher has truly earned is a
  debt. (→ ADR-0021 S9-D4; sharpens DR-039)
- **Dependencies:** DR-039, DR-062, DR-034.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-066 — Teacher debt is per Teacher × Program; never merged or offset across programs
- **Description:** A teacher debt is calculated and tracked for each
  **Teacher × Program** independently. Debts and entitlements are **never merged
  or offset between different programs**: a debt arising on one program is never
  cleared using entitlements owed on another program, even for the same teacher.
  Example: an Excel debt of 280 stays entirely separate from any amount the
  teacher is owed on ICDL or Accounting.
- **Reason:** Financial separation between programs is mandatory (DR-031); debt
  management must obey the same isolation as entitlement. (→ ADR-0021 S9-D5)
- **Dependencies:** DR-031, DR-065.
- **Possible exceptions:** none permitted.
- **Unknown status:** —

### DR-067 — A teacher debt is a settleable balance: never negative, closed at zero
- **Description:** A teacher debt is a balance that **only decreases** as it is
  settled. Partial settlements are allowed and settlement may take several steps
  over time; each settlement reduces the remaining balance only. The balance
  **never becomes negative**; when it reaches **zero** the debt is fully settled
  and closed.
- **Reason:** A debt represents a finite amount to be returned; it converges to
  zero and cannot overshoot into a credit. (→ ADR-0021 S9-D7)
- **Dependencies:** DR-065.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-068 — Two settlement paths, Owner-chosen; deduction stays within the same program
- **Description:** A teacher debt is settled by **either** (a) **direct
  repayment** by the teacher to the center, **or** (b) **deduction from the
  teacher's future entitlements on the same program**, and the two may be
  **combined** on one debt (e.g. 100 repaid directly and the remaining 180
  deducted from the next entitlement on that program). The choice of method is an
  **administrative decision the Owner makes case by case — never an automatic
  system action.** Deduction draws only on the same program's entitlements;
  cross-program deduction is forbidden (DR-066).
- **Reason:** Both paths occur in real life; the Owner decides which fits each
  case; program isolation constrains deduction to the program that generated the
  debt. (→ ADR-0021 S9-D6, S9-D7; details the settlement authorized in S5-D4 —
  distinct from the postponed general deduction model, UNK-021)
- **Dependencies:** DR-065, DR-066, DR-030, DR-034.
- **Possible exceptions:** none in V1.
- **Unknown status:** —

### DR-069 — A teacher debt has no expiry
- **Description:** A teacher debt carries **no time limit**; it stays open until
  it is actually settled. Elapsed time never writes it off or reduces it.
- **Reason:** Time does not change the fact that the money is owed. (→ ADR-0021
  S9-D8; mirrors DR-061 on the expense-return side)
- **Dependencies:** DR-065, DR-067.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-070 — With no future entitlement on the program, a debt is settled only by direct repayment
- **Description:** If the teacher has **no further entitlement** on the program
  that generated the debt (for example, they no longer run that program), so
  same-program deduction (DR-068 path b) is impossible, the debt simply **stays
  open** as an outstanding balance owed to the center, and the **only** remaining
  way to clear it is **direct repayment** by the teacher. There is no other
  mechanism, and cross-program settlement remains forbidden (DR-066).
- **Reason:** Program isolation (DR-066) rules out drawing on another program, so
  a program with no future entitlement leaves repayment as the sole path; the
  debt does not disappear (DR-069). (→ ADR-0021 S9-D9)
- **Dependencies:** DR-066, DR-068, DR-069.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-071 — In V1 a Program is a single Program Run; runs are independent
- **Description:** In Version 1 a **Program** represents a single **Program Run
  (Offering)** — an independent training offering with its own financial identity.
  Each Program Run is fully independent: its own teacher, distribution percentage,
  price, students, receipts, refunds, entitlements, payments, balances, and debts.
  A run that carries the same service name as another (e.g. "ICDL — Jan 2026" and
  "ICDL — Sep 2026") is a **distinct Program**; the shared name is only a **label**
  for the service type and creates **no financial link**. Any number of Programs,
  including same-named ones, may be open at the same time. Settings copied from a
  prior run at creation are **initial values only**, never a live link.
- **Reason:** Each offering has its own agreement, price, and students; treating it
  as an independent unit keeps every balance unambiguous. (→ ADR-0022 S10-D1, S10-D2,
  S10-D14; entity name kept stable per the pre-propagation refinement)
- **Dependencies:** DR-002, DR-003, DR-004.
- **Possible exceptions:** none — independence is absolute; the only shared thing is
  the service-name label.
- **Unknown status:** —

### DR-072 — A Program carries a base price inherited as each registration's default
- **Description:** Each Program (run) carries **one base price**, set at creation.
  When a student registers, the registration takes that base price as its **default**
  amount due.
- **Reason:** The price is a property of the offering, applied automatically at
  registration. (→ ADR-0022 S10-D4)
- **Dependencies:** DR-071, DR-022.
- **Possible exceptions:** the default may be overridden per registration (DR-073).
- **Unknown status:** —

### DR-073 — A registration's price may be overridden per registration
- **Description:** The Owner may set an individual registration's price to a value
  **different from the program base price**. The override applies to **that
  registration only** and changes neither the base price nor any other student's
  registration.
- **Reason:** A student may be admitted at a different agreed amount without
  disturbing the program's price or anyone else's. (→ ADR-0022 S10-D5)
- **Dependencies:** DR-072.
- **Possible exceptions:** none in V1.
- **Unknown status:** —

### DR-074 — The Final Registration Price is a single stored value; no discount concept
- **Description:** The amount due for a registration is a **single stored value —
  the Final Registration Price**. It is **not derived** from `base price − discount`.
  Version 1 has **no discount** entity, field, percentage, or reason; whatever the
  agreed final price is, it is stored directly. This Final Registration Price is the
  **sole amount-due reference** for receipts, refunds, and overpayment prevention
  (DR-024).
- **Reason:** One clear figure keeps pricing simple and unambiguous; the reason a
  price differs from the base is an administrative matter the system need not model
  (M-08). (→ ADR-0022 S10-D6; pre-propagation pricing refinement)
- **Dependencies:** DR-072, DR-073, DR-024.
- **Possible exceptions:** none in V1 — no discount modelling.
- **Unknown status:** —

### DR-075 — The Final Registration Price locks at the first receipt
- **Description:** A registration's Final Registration Price may be edited **until
  the first receipt voucher for that registration is recorded**; once the first
  receipt exists the price is **locked** and never changed. Corrections needed
  afterward are made through financial operations (e.g. a refund), never by altering
  the amount due.
- **Reason:** The first receipt begins the financial record built on that amount;
  changing it afterward would distort outstanding balance, receipts, refunds, and
  overpayment prevention. (→ ADR-0022 S10-D7; kin to DR-044's immutability
  principle)
- **Dependencies:** DR-074, DR-023, DR-024.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-076 — A Program's distribution percentage is fixed for the program's life
- **Description:** Once set at creation, a Program's teacher/center percentage is
  **immutable for the whole life of that program**. A different agreement (e.g.
  70/30 → 75/25) is realized by creating a **new Program (run)** with the new
  percentage — never by editing an existing program.
- **Reason:** The percentage is part of the program's financial identity; changing
  it mid-life would complicate entitlement, past receipts, refunds, balances, and
  audit. A new agreement is a new offering. (→ ADR-0022 S10-D8; consistent with
  DR-006 permanence, DR-013)
- **Dependencies:** DR-003, DR-013, DR-071, DR-006.
- **Possible exceptions:** none permitted.
- **Unknown status:** —

### DR-077 — A Program records documentary start and end dates that drive no behavior
- **Description:** Each Program records a **start date** and an **end date**,
  captured at creation. In V1 these are **documentary/administrative only**: the
  system never auto-closes a program, never blocks registration or receipts by
  date, and creates no date-driven operations. Reaching the end date changes
  nothing on its own.
- **Reason:** The dates aid organization and reporting; actual operation is governed
  by the Open/Closed status, not the calendar. (→ ADR-0022 S10-D9)
- **Dependencies:** DR-071, DR-078.
- **Possible exceptions:** none — dates never trigger automatic behavior in V1.
- **Unknown status:** —

### DR-078 — A Program's Open/Closed status governs new business
- **Description:** Each Program has an **Owner-controlled status, Open or Closed**,
  that governs actual operation. **Closing** a Program blocks **new business** — no
  new registrations and no new receipt vouchers on it — while all existing records
  (registrations, receipts, refunds, teacher entitlements and balances) remain fully
  visible, and **legitimate financial operations on already-existing records** (e.g.
  a refund against an existing receipt) remain allowed. Closing deletes nothing and
  alters no entitlement, balance, or prior financial effect.
- **Reason:** The Owner needs to stop new activity on a finished offering without
  freezing the legitimate lifecycle of records already created. (→ ADR-0022 S10-D10)
- **Dependencies:** DR-071, DR-022, DR-023.
- **Possible exceptions:** management/correction of pre-existing records (refunds,
  cancellations) is not "new business" and stays allowed on a closed program.
- **Unknown status:** —

### DR-079 — Open/Closed is a reversible operational status
- **Description:** A **Closed** Program may be **reopened** by the Owner at any time,
  restoring new business (new registrations and receipts). Open/Closed is a
  **reversible operational status** that never changes the program's identity, its
  dates, its price, its distribution percentage, or any historical data.
- **Reason:** A program may legitimately need to reopen (a late student, an extended
  registration period); reopening is a status change, not a new program. (→ ADR-0022
  S10-D11)
- **Dependencies:** DR-078.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-080 — Every receipt is tied to a defined revenue source
- **Description:** Every amount the center receives is recorded against a **clear,
  defined revenue source**. V1's revenue sources are: **program fees**, **exam
  fees**, **certificate-issuance fees**, and **book/material sales**. No generic or
  unattributed receipt exists — each carries the revenue source it represents.
- **Reason:** The Owner must always know what each incoming amount was for; a
  receipt without a stated source is not allowed. (→ ADR-0023 S11-D1)
- **Dependencies:** DR-004, DR-008.
- **Possible exceptions:** none — every receipt names its source.
- **Unknown status:** whether non-program revenues are refundable → UNK-029; their
  amount-due/overpayment handling → UNK-030. (The record/document structure that
  holds the revenue source is an architectural decision, not a domain unknown.)

### DR-081 — Non-program revenue is entirely center revenue
- **Description:** **Exam fees, certificate-issuance fees, and book/material sales**
  are **entirely the center's revenue**. They carry **no teacher share, no
  entitlement, no teacher balance effect, and no teacher debt effect**. Revenue
  distribution (DR-013) applies **exclusively to program fees**. Recording one of
  these increases the **Cash Balance** and the **Center Net Balance** only; it
  never touches any teacher.
- **Reason:** These are services/products the center provides independently of
  delivering a training program, so no teacher earned a share of them. (→ ADR-0023
  S11-D2; consistent with DR-012, DR-016)
- **Dependencies:** DR-013, DR-016, DR-080.
- **Possible exceptions:** none — program fees remain the only distributed revenue.
- **Unknown status:** refundability → UNK-029; amount/overpayment → UNK-030.

### DR-082 — All educational revenue is tied to a student; program link optional
- **Description:** Every educational revenue in V1 — program fees, exam fees,
  certificate fees, and book/material sales — is **always tied to a specific
  student**. A link to a **program is optional**, present when the revenue relates
  to a particular program and absent otherwise. **No** general, non-student
  educational revenue is recorded in V1 (a sale to someone not in the system is out
  of scope).
- **Reason:** These are services delivered to a student, so every one belongs to a
  student and appears in that student's record. (→ ADR-0023 S11-D3)
- **Dependencies:** DR-021, DR-080.
- **Possible exceptions:** none in V1 — no student, no educational-revenue record.
- **Unknown status:** —

### DR-083 — Teacher status: Active / Inactive-Left, blocking only new assignment
- **Description:** A teacher carries an Owner-controlled status, **Active** or
  **Inactive-Left**, set manually by the Owner. Setting a teacher Inactive-Left
  blocks **assigning new programs** to that teacher and has **no automatic
  financial or historical effect**: all prior programs, vouchers, entitlements,
  payments, balances, debts, and history persist unchanged.
- **Reason:** The end of a teacher's engagement is a recorded fact, but it must not
  disturb any money already recorded. (→ ADR-0023 S11-D4)
- **Dependencies:** DR-002, DR-009.
- **Possible exceptions:** none — the only thing blocked is new program assignment.
- **Unknown status:** —

### DR-084 — Teacher status never freezes existing-balance operations
- **Description:** A teacher's status never closes their financial account. Regardless
  of Active or Inactive-Left, all operations on **existing** balances remain fully
  available: paying out remaining entitlement (DR-030…DR-034), refunds on past
  programs with entitlement recalculation (DR-062…DR-064), and creating/settling a
  teacher debt (DR-065…DR-070), plus full reporting and history — until every
  obligation is settled.
- **Reason:** Obligations outlive the engagement; the system must let the Owner
  settle them after a teacher leaves. (→ ADR-0023 S11-D5)
- **Dependencies:** DR-083, DR-030, DR-039, DR-065.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-085 — Refund and registration status are independent
- **Description:** A refund (partial or full) **never** automatically changes a
  student's registration status. There is no rule linking the two in either
  direction ("full refund ⇒ cancelled" and "partial ⇒ active" both do NOT exist).
  Ending or continuing a registration is a **separate administrative decision**.
- **Reason:** The financial act (a refund) and the academic act (ending a
  registration) are distinct; coupling them would force outcomes the Owner does not
  intend. (→ ADR-0023 S11-D6)
- **Dependencies:** DR-036, DR-086.
- **Possible exceptions:** none — the two are always decided independently.
- **Unknown status:** —

### DR-086 — Registration status: Active / Ended-Withdrawn, blocking new receipts
- **Description:** A registration carries an Owner-controlled status, **Active** or
  **Ended-Withdrawn**. Setting it Ended-Withdrawn **blocks new receipts** on that
  registration while all prior records (receipts, refunds, history) remain visible
  and unchanged, and **refunds tied to earlier receipts remain allowed** (DR-040,
  DR-085). Ending closes the registration to **future collection only** and changes
  no prior financial effect.
- **Reason:** An ended registration no longer represents an open obligation to
  collect against, but its history and legitimate reversals must be preserved.
  (→ ADR-0023 S11-D7; mirrors the program Open/Closed effect, DR-078)
- **Dependencies:** DR-022, DR-023, DR-024.
- **Possible exceptions:** operations on pre-existing records (refunds) stay
  allowed; only new receipts are blocked.
- **Unknown status:** —

### DR-087 — Ended registration is reversible; a new registration is a new relationship
- **Description:** An Ended-Withdrawn registration may be **reactivated** by the
  Owner back to Active; the **same** registration resumes, keeping its full history
  and its **Final Registration Price** (which is not re-set — it remains locked per
  DR-075). A **new registration** is created only for a genuinely **new
  relationship** — another program, or a new financial obligation that is not a
  continuation of the previous one.
- **Reason:** Returning to the same program continues the same relationship;
  starting something genuinely new is a new registration. (→ ADR-0023 S11-D8;
  mirrors the reversible program status, DR-079)
- **Dependencies:** DR-086, DR-075.
- **Possible exceptions:** none.
- **Unknown status:** —

### DR-088 — Shared operational-status lifecycle pattern
- **Description:** The entities that carry an operational lifecycle — **Program**
  (Open/Closed, DR-078/DR-079), **Teacher** (Active/Inactive-Left,
  DR-083/DR-084), and **Registration** (Active/Ended-Withdrawn, DR-086/DR-087) —
  all follow **one shared pattern**: the status is **Owner-controlled** and
  **reversible**, it **preserves full history**, it **blocks only new business**,
  and it **never rewrites prior financial effects**. Any future operational status
  in V1 follows this same pattern.
- **Reason:** A single consistent lifecycle model keeps the system predictable and
  simple (M-08) and prevents any status from silently altering recorded money.
  (→ ADR-0023 S11-D9)
- **Dependencies:** DR-078, DR-079, DR-083, DR-084, DR-086, DR-087.
- **Possible exceptions:** none — the pattern is uniform.
- **Unknown status:** —

### DR-089 — Guardian/Parent is student-level contact data, not a user or financial entity
- **Description:** A student may carry **Guardian/Parent** contact information —
  name, relationship, phone, and other contact means — stored on the **student**
  for administrative communication (many students are minors). The Guardian is
  **not** a system user, **not** a financial entity, and holds **no** permissions
  or role in any operation. It is **distinct** from the per-voucher **Payer Name**
  (DR-021): the Guardian is standing contact information on the student, unchanged
  by payments, whereas the Payer Name records who paid on one specific receipt and
  may vary from receipt to receipt.
- **Reason:** The center often communicates with a minor's family, not the student;
  this is contact data, never a money relationship. (→ ADR-0024 S12-D1, S12-D2)
- **Dependencies:** DR-021.
- **Possible exceptions:** the sole system user remains the Owner (F-02); no other
  participant exists in V1 (S12-D3).
- **Unknown status:** —

### DR-090 — Official unique sequential numbering per financial voucher type
- **Description:** Every **financial voucher type** carries an **official,
  sequential, unique, non-duplicated** number in its **own independent series**,
  preserved for audit. No number is ever reused or duplicated within a type. This
  is the general regulatory-numbering requirement; DR-026 is its receipt/payment
  instance, and it extends to every other financial voucher type (Refund Voucher,
  Expense Return, and non-program-revenue receipts). The vouchers are the center's
  **internal** records — **not** government tax invoices (V1 has no tax dimension).
- **Reason:** The only regulatory obligation in V1 is a trustworthy, auditable
  numbering of every financial document; taxes and tax invoices are out of scope.
  (→ ADR-0024 S12-D4, S12-D5; generalizes DR-026)
- **Dependencies:** DR-026, DR-008, DR-004.
- **Possible exceptions:** the exact per-type numbering scheme and go-live starting
  numbers are a design/go-live detail (as with Refund Voucher numbering,
  ADR-0017 §2), not a domain rule.
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

Additionally postponed (Session 7, ADR-0019):

- **Fixed-asset / capitalization distinction.** V1 records durable purchases
  (furniture, equipment) as ordinary expenses (DR-050); distinguishing Fixed
  Assets from expenses is a possible later-version concept. Nothing in V1 may
  depend on it, and this does not permanently classify durable purchases as
  expenses for future versions.
- **Program-account / proportional expense allocation.** V1 expenses are
  center-borne only (DR-052). Charging an expense to a program (and thereby its
  teacher), or splitting it proportionally between center and teacher, is
  postponed — it would deduct from teachers and belongs with the postponed
  teacher-deduction model (UNK-021).

Additionally postponed (Session 8, ADR-0020):

- **Non-cash expense returns.** V1 realizes an expense return only through cash
  returning (DR-060). Non-cash outcomes — supplier **credit notes** / supplier
  balances (payables), and **goods replacement** without cash — are outside V1
  and belong to a fuller purchase cycle in a later version. Nothing in V1 may
  depend on them.

Additionally postponed (Session 11, ADR-0023):

- **Non-educational revenue services.** V1 supports only educational, student-linked
  revenue (program fees, exam fees, certificate fees, book/material sales — DR-080…
  DR-082). **Room rental, consulting, and other services** are out of scope and are
  a possible later-version addition. Nothing in V1 may depend on them.

Additionally postponed (Session 12, ADR-0024):

- **Tax / VAT / tax invoices / tax reporting.** V1 has **no** tax dimension: no VAT,
  no tax computation, no tax reports, and no government tax invoices. The system's
  vouchers are the center's internal records (DR-090). Any future tax obligation is
  a later-version concern; nothing in V1 may depend on it.

Additionally postponed (Session 10, ADR-0022):

- **Program capacity.** V1 has no maximum-student-capacity concept and never
  blocks registration by student count (ADR-0022 S10-D12). Capacity management —
  a maximum, remaining-seats display, full-capacity blocking, waiting lists — is a
  possible later-version feature. Nothing in V1 may depend on it.
- **Internal cohorts / sections.** V1 programs have no internal cohorts, batches,
  groups, sections, or schedules; each batch is its own independent Program
  (ADR-0022 S10-D13). Internal grouping is a possible later-version feature.
  Nothing in V1 may depend on it.
- **Multiple teachers per program.** V1 keeps one teacher per program (ADR-0022
  S10-D3, DR-002); supporting more than one teacher per program — with its own
  share-splitting decisions — is a later-version concern.
