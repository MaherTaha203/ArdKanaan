# BC-003 — Receipt, Voucher & Numbering Rules

| Field | Value |
|---|---|
| Doc ID | BC-003 |
| Title | Receipt, Voucher & Numbering Rules |
| Phase | 2 (Business Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | BC-000 (framework, Dual Authority); BC-001 (pricing/distribution, consumed); BC-002 (registration/installment, consumed); P2-000 + CDC; DOM-004 (DR-006/017/019/023/025/026/043/044/090); PC-003/004/006/007/008 (frozen); GOV-006/011/012 |
| Answers | "How is money formally recorded?" |

---

## 1. Purpose

BC-003 formalizes the frozen Domain truth about the **Receipt Voucher** — the center's
official internal document that records incoming program-fee money — into atomic Business
Rules. It governs how a receipt comes into being, is identified, numbered, dated, owned,
posted, made effective, kept atomic, and preserved immutably. It **consumes** BC-001
(pricing, the distribution split) and BC-002 (registration, installments, overpayment)
exactly as frozen, and re-formalizes neither. It defines **only** Business Rules — no
implementation, UI, technology, or test.

## 2. Scope

**BC-003 governs:** Receipt Voucher identity; Receipt Voucher purpose; voucher numbering;
voucher dating; voucher ownership; voucher posting; the financial effect of posting;
receipt atomicity; receipt immutability; and the receipt lifecycle.

**BC-003 does NOT govern:** Registration, Student lifecycle, Guardian, Payer semantics,
the Final Registration Price, installment permission (all BC-001/BC-002, consumed); the
distribution *calculation* (BC-001, consumed); refund behavior, teacher entitlement,
payments to teachers, balances derivation, correction/cancellation *mechanics*
(BC-004/BC-005/BC-006); any engineering, database, UI, API, validation implementation, or
test.

## 3. Business Rule Principles

- **RP-11 — The receipt is the atom of money-in.** One incoming program-fee payment is
  recorded by exactly one Receipt Voucher; nothing smaller or larger.
- **RP-12 — Recording is posting.** A receipt takes effect the instant it is saved; there
  is no intermediate uncommitted state in V1.
- **RP-13 — A posted receipt is permanent.** Once posted, a receipt is never edited or
  deleted; every correction is a new fact beside it.
- **RP-14 — Every receipt is officially numbered.** Each receipt bears a unique,
  sequential, never-reused number in the receipt series.
- **RP-15 — Dual Authority.** Every BR cites both an Authority of Truth (DR) and an
  Authority of Constitutional Legitimacy (PC) — BC-000 §4.0.

## 4. Business Rule Catalog

### Category — Receipt Voucher Identity

**BR-028 — A Receipt Voucher is a first-class financial document with its own identity**
- **Rule Statement:** A Receipt Voucher is a distinct financial document — the center's
  official **internal** record of incoming money (not a tax invoice) — with its own
  identity given by its own number and date, separate from the registration it settles.
- **Business Rationale:** the money record is a thing in itself, referenced and audited
  independently of the enrolment it pays toward.
- **Preconditions:** an incoming program-fee payment is to be recorded.
- **Trigger:** the Owner records a receipt.
- **Required Outcome:** a distinct Receipt Voucher exists with its own identity
  (number + date).
- **Exceptions:** none — the receipt is internal, never a government tax invoice (V1 has
  no tax dimension).
- **Authority of Truth:** DR-023, DR-090 (internal record).
- **Authority of Constitutional Legitimacy:** PC-003 (Receipt Voucher records divisible
  money-in); PC-006 (canonical "Receipt Voucher / سند قبض"; bans "invoice/tax invoice");
  PC-004 §1.
- **Affected Product Concepts:** Receipt Voucher.
- **Affected Future Documents:** BC-006; Phase 4; Testing.
- **Verification Method:** inspect any receipt — it is an independent document with its own
  number and date.

### Category — Receipt Voucher Purpose

**BR-029 — A Receipt Voucher records exactly one incoming program-fee payment against one registration**
- **Rule Statement:** The Receipt Voucher is the sole instrument by which program-fee
  money-in enters the records; each records one payment made toward one registration.
- **Business Rationale:** every incoming program fee must have exactly one official record.
- **Preconditions:** a registration exists (BC-002) and a payment is made toward it.
- **Trigger:** the Owner records a payment on the registration.
- **Required Outcome:** one Receipt Voucher records that payment; program-fee money-in
  enters the records only through a receipt.
- **Exceptions:** non-program income is not a program-fee receipt (BC-007); refunds are a
  separate Refund Voucher (BC-005).
- **Authority of Truth:** DR-023.
- **Authority of Constitutional Legitimacy:** PC-003 (Receipt Voucher; Registration);
  consumes BC-002 BR-023 (installments); PC-004 §1.
- **Affected Product Concepts:** Receipt Voucher; Registration.
- **Affected Future Documents:** BC-005; BC-006; Phase 4; Testing.
- **Verification Method:** confirm each program-fee payment corresponds to exactly one
  receipt on one registration.

### Category — Voucher Numbering

**BR-030 — Every Receipt Voucher carries an official, unique, sequential number that is never reused**
- **Rule Statement:** Each Receipt Voucher bears an official, sequential, unique,
  non-duplicated number in the receipt series; no number is ever reused or duplicated.
- **Business Rationale:** trustworthy, auditable numbering of every financial document is
  V1's sole regulatory obligation.
- **Preconditions:** a receipt is being posted.
- **Trigger:** receipt posting.
- **Required Outcome:** the receipt receives the next unique sequential receipt number.
- **Exceptions:** the exact numbering scheme and go-live starting number are a
  design/go-live detail, not a business rule.
- **Authority of Truth:** DR-090 (DR-026 receipt instance).
- **Authority of Constitutional Legitimacy:** PC-004 SC-12 / PC-007 PR-018 / PC-008 AC-14
  (unique sequential series per voucher type).
- **Affected Product Concepts:** Receipt Voucher.
- **Affected Future Documents:** BC-005; BC-007; Phase 4; Testing.
- **Verification Method:** inspect the receipt series — unique, sequential, no reuse or
  duplication.

**BR-031 — The receipt number series is independent and continuous, never resetting**
- **Rule Statement:** The receipt-voucher number series is its own independent sequence
  that never resets (not yearly, not ever) and begins at go-live from an Owner-specified
  starting number.
- **Business Rationale:** continuity with the center's existing paper vouchers.
- **Preconditions:** the receipt series exists.
- **Trigger:** each new receipt.
- **Required Outcome:** numbers advance continuously within the independent receipt series,
  without reset.
- **Exceptions:** the go-live starting number is Owner-specified (design/go-live detail).
- **Authority of Truth:** DR-026 (DR-090 supporting).
- **Authority of Constitutional Legitimacy:** PC-004 SC-12 / PC-007 PR-018; PC-006 (Receipt
  Voucher).
- **Affected Product Concepts:** Receipt Voucher.
- **Affected Future Documents:** BC-005; BC-007; Phase 4; Testing.
- **Verification Method:** confirm the series never resets and each type has its own
  sequence.

### Category — Voucher Dating

**BR-032 — Every Receipt Voucher carries its own date, fixed at posting**
- **Rule Statement:** Each Receipt Voucher records its own date, set when it is posted, and
  belonging to that receipt alone.
- **Business Rationale:** every money record must state when it occurred.
- **Preconditions:** a receipt is being posted.
- **Trigger:** receipt posting.
- **Required Outcome:** the receipt holds its own posting date.
- **Exceptions:** none.
- **Authority of Truth:** DR-023 (DR-043 posting).
- **Authority of Constitutional Legitimacy:** PC-003 (Receipt Voucher); PC-004 §1.
- **Affected Product Concepts:** Receipt Voucher.
- **Affected Future Documents:** BC-006; Phase 4; Testing.
- **Verification Method:** inspect any receipt — it carries its own date.

### Category — Voucher Ownership

**BR-033 — A Receipt Voucher belongs to exactly one Student and one Program**
- **Rule Statement:** Each Receipt Voucher belongs to exactly one Student and one Program
  (via that student's one Registration); these references are fixed at posting and
  identify whose payment, toward which offering, the receipt records.
- **Business Rationale:** every money-in record must attach unambiguously to one student
  and one program so balances stay clear.
- **Preconditions:** a registration linking one Student to one Program (BC-002 BR-020).
- **Trigger:** receipt posting.
- **Required Outcome:** the receipt references exactly one Student, one Program, and one
  Registration.
- **Exceptions:** none — see atomicity (BR-036).
- **Authority of Truth:** DR-023.
- **Authority of Constitutional Legitimacy:** PC-003 (Receipt references one Student, one
  Program, one Registration); consumes BC-002 BR-020; PC-004 §1.
- **Affected Product Concepts:** Receipt Voucher; Student; Training Program; Registration.
- **Affected Future Documents:** BC-006; Phase 4; Testing.
- **Verification Method:** inspect any receipt — exactly one student and one program.

### Category — Voucher Posting

**BR-034 — Saving a Receipt Voucher IS posting it**
- **Rule Statement:** Recording (saving) a Receipt Voucher posts it: it becomes Posted
  immediately on save. V1 has no Draft stage.
- **Business Rationale:** entering and posting are one act in the center's daily practice —
  enter → quick review → save.
- **Preconditions:** the payment is within the registration's remaining amount due
  (BC-002 BR-024 overpayment prevention).
- **Trigger:** the Owner saves the receipt.
- **Required Outcome:** the receipt is Posted at the moment of save; no uncommitted receipt
  state exists.
- **Exceptions:** none in V1 — a Draft/posting lifecycle is a postponed future concept;
  nothing in V1 depends on it.
- **Authority of Truth:** DR-043.
- **Authority of Constitutional Legitimacy:** consumes BC-002 BR-024 (overpayment
  prevention); PC-003 (Receipt Voucher); PC-004 §1.
- **Affected Product Concepts:** Receipt Voucher.
- **Affected Future Documents:** BC-006; Phase 4; Testing.
- **Verification Method:** save a receipt; confirm it is immediately Posted with no draft
  state.

### Category — Financial Effect of Posting

**BR-035 — Posting a Receipt Voucher gives rise to all business effects defined by the frozen Business Constitution**
- **Rule Statement:** Posting a Receipt Voucher **immediately gives rise to all business
  effects defined by the frozen Business Constitution.** These effects include raising the
  three balances — Cash Balance, Teacher Payables, Center Net Balance (never merged) — and
  storing the applied split permanently in the voucher. The **amounts** of the split are
  governed by the rules **consumed from BC-001 (BR-011/BR-012)** and are **not
  re-described here**: BC-003 governs *that* these effects arise at posting, never *how*
  they are computed.
- **Business Rationale:** posting is the moment the business's financial reality takes
  hold; the *when/that* of the effect is BC-003's responsibility, the *how* of the split
  is BC-001's.
- **Preconditions:** a posted receipt on a program with a Revenue Distribution Policy
  (BC-001 BR-010).
- **Trigger:** receipt posting.
- **Required Outcome:** at posting, every constitutionally-defined effect takes hold — the
  three balances rise (per BC-001) and the applied split is stored permanently; BC-003
  asserts the effect arises, not its computation.
- **Exceptions:** none — the distribution *calculation* is consumed from BC-001, not
  redefined here; the three balances are never merged.
- **Authority of Truth:** DR-017, DR-006.
- **Authority of Constitutional Legitimacy:** consumes BC-001 BR-011/BR-012; PC-004 AP-7 /
  PC-007 PR-014 / PC-008 AC-10 (never merge); PC-006 (Cash / Teacher Payables /
  Center Net).
- **Affected Product Concepts:** Receipt Voucher; The Three Balances; Revenue Distribution
  Policy.
- **Affected Future Documents:** BC-004; BC-006; Phase 4; Testing.
- **Verification Method:** post a receipt; confirm the constitutionally-defined effects
  arise at posting and the stored split never changes afterward.

### Category — Receipt Atomicity

**BR-036 — A Receipt Voucher records exactly one payment, by one method, and never spans more than one student, program, or payment**
- **Rule Statement:** Each Receipt Voucher records exactly one payment made by exactly one
  payment method (cash or bank transfer); it may never cover more than one student, more
  than one program, more than one payment, or mix payment methods.
- **Business Rationale:** atomic money records keep the system simple and unambiguous.
- **Preconditions:** a single payment is being recorded.
- **Trigger:** receipt posting.
- **Required Outcome:** the receipt holds one payment, one method, one student, one
  program.
- **Exceptions:** none in V1.
- **Authority of Truth:** DR-023, DR-025 (one payment method per voucher).
- **Authority of Constitutional Legitimacy:** PC-003 (Receipt records one payment);
  PC-004 §1.
- **Affected Product Concepts:** Receipt Voucher.
- **Affected Future Documents:** BC-006; Phase 4; Testing.
- **Verification Method:** confirm no receipt spans two students/programs/payments or mixes
  methods.

### Category — Receipt Immutability

**BR-037 — Receipt Immutability Principle**
- **Rule Statement:** A Posted Receipt Voucher is never edited and never deleted; it is
  preserved permanently. A financial error is corrected by cancelling and recreating
  (governed by BC-005), never by altering or removing the posted receipt.
- **Business Rationale:** a complete, tamper-evident audit trail must always answer what
  happened, when, and which document corrected an error.
- **Preconditions:** a posted receipt.
- **Trigger:** an attempt to change or remove a posted receipt.
- **Required Outcome:** the posted receipt is unchanged and undeletable; correction happens
  as a separate cancellation (BC-005).
- **Exceptions:** descriptive (non-financial) fields may be edited with logging
  (correction/edit mechanics governed by BC-005).
- **Authority of Truth:** DR-044 (extends DR-006, DR-019).
- **Authority of Constitutional Legitimacy:** PC-002 PP-3 / PC-004 AP-3 / PC-007 PR-004 /
  PC-008 AC-03 (no edit/delete of a posted fact; additive correction).
- **Affected Product Concepts:** Receipt Voucher.
- **Affected Future Documents:** BC-005; Phase 4; Testing.
- **Verification Method:** attempt to edit/delete a posted receipt; confirm it is preserved
  and only cancellation is available.

**BR-038 — The distribution split stored in a receipt is permanent and immune to later policy change**
- **Rule Statement:** The split applied to a receipt at posting is held in the voucher
  permanently; a later change to any distribution policy never alters an existing receipt's
  stored split.
- **Business Rationale:** historical money records must be immune to future agreements.
- **Preconditions:** a posted receipt with a stored split.
- **Trigger:** any later policy change.
- **Required Outcome:** the receipt's stored split is unchanged.
- **Exceptions:** none — permanence is absolute; refunds reverse via a separate Refund
  Voucher (BC-005), never by editing the receipt.
- **Authority of Truth:** DR-006 (consistent with BC-001 BR-014).
- **Authority of Constitutional Legitimacy:** PC-002 PP-3 / PC-007 PR-017 (permanence);
  PC-003.
- **Affected Product Concepts:** Receipt Voucher; Revenue Distribution Policy.
- **Affected Future Documents:** BC-005; BC-006; Phase 4; Testing.
- **Verification Method:** change a policy after a receipt is posted; confirm the receipt's
  stored split is untouched.

**BR-039 — Every posted receipt is an append-only fact on the immutable activity timeline**
- **Rule Statement:** A posted receipt is a historical event on an append-only, immutable
  timeline; it is never edited or deleted, history never disappears, and any correction is
  recorded as a new event.
- **Business Rationale:** the Owner must always see what actually happened, including
  mistakes and their corrections.
- **Preconditions:** a posted receipt.
- **Trigger:** posting; any subsequent correction.
- **Required Outcome:** the receipt persists on the timeline; corrections are new appended
  events, never overwrites.
- **Exceptions:** none permitted.
- **Authority of Truth:** DR-019 (kin to DR-006).
- **Authority of Constitutional Legitimacy:** PC-007 PR-031/PR-032 / PC-008 AC-21 (full
  audit; append-only; no hidden state).
- **Affected Product Concepts:** Receipt Voucher; Activity Record.
- **Affected Future Documents:** BC-005; Phase 4; Testing.
- **Verification Method:** confirm posted receipts and their corrections appear as
  append-only timeline events.

### Category — Receipt Lifecycle

**BR-040 — Receipt lifecycle**
- **Rule Statement:** A Receipt Voucher's lifecycle is: **Posted** immediately on save
  (BR-034), and thereafter it may only become **Cancelled** — a status on the original that
  reverses the receipt's effect through new events while the original is preserved **under
  the Immutability Principle (BR-037)**. The mechanics of cancellation and its ledger
  reversal are governed by BC-005.
- **Business Rationale:** the receipt has a simple, auditable life — it exists as posted,
  and any undoing is an explicit, preserved cancellation, not an erasure.
- **Preconditions:** a posted receipt.
- **Trigger:** the Owner cancels a posted receipt.
- **Required Outcome:** the receipt moves Posted → Cancelled with the original preserved
  per BR-037; BC-003 owns only the lifecycle states and transitions.
- **Exceptions:** cancellation/correction *mechanics* (reversal effects, cancellation
  numbering) are defined in BC-005, not here.
- **Authority of Truth:** DR-043, DR-044, DR-019.
- **Authority of Constitutional Legitimacy:** PC-002 PP-3 / PC-004 AP-3 / PC-008 AC-03
  (additive, non-destructive); PC-003 (Receipt Voucher).
- **Affected Product Concepts:** Receipt Voucher; Operational Status.
- **Affected Future Documents:** BC-005; Phase 4; Testing.
- **Verification Method:** cancel a posted receipt; confirm the original is preserved with a
  Cancelled status and nothing is deleted.

## 5. Rule Categories

| # | Category | Rules |
|---|---|---|
| 1 | Receipt Voucher Identity | BR-028 |
| 2 | Receipt Voucher Purpose | BR-029 |
| 3 | Voucher Numbering | BR-030, BR-031 |
| 4 | Voucher Dating | BR-032 |
| 5 | Voucher Ownership | BR-033 |
| 6 | Voucher Posting | BR-034 |
| 7 | Financial Effect of Posting | BR-035 |
| 8 | Receipt Atomicity | BR-036 |
| 9 | Receipt Immutability | BR-037, BR-038, BR-039 |
| 10 | Receipt Lifecycle | BR-040 |

## 6. Business Rule Traceability Matrix

| BR | Frozen Domain | Product Constitution | Consumes (BC) | Future BC | Future UX | Future Eng | Future Testing |
|---|---|---|---|---|---|---|---|
| BR-028 | DR-023/090 | PC-003/006/004 | — | BC-006 | ✓ | ✓ | ✓ |
| BR-029 | DR-023 | PC-003/004 | BC-002 BR-023 | BC-005/006 | ✓ | ✓ | ✓ |
| BR-030 | DR-090/026 | SC-12 / PR-018 / AC-14 | — | BC-005/007 | — | ✓ | ✓ |
| BR-031 | DR-026 | SC-12 / PR-018 | — | BC-005/007 | — | ✓ | ✓ |
| BR-032 | DR-023/043 | PC-003/004 | — | BC-006 | ✓ | ✓ | ✓ |
| BR-033 | DR-023 | PC-003/004 | BC-002 BR-020 | BC-006 | — | ✓ | ✓ |
| BR-034 | DR-043 | PC-003/004 | BC-002 BR-024 | BC-006 | ✓ | ✓ | ✓ |
| BR-035 | DR-017/006 | AP-7 / PR-014 / AC-10 / PC-006 | BC-001 BR-011/012 | BC-004/006 | — | ✓ | ✓ |
| BR-036 | DR-023/025 | PC-003/004 | — | BC-006 | — | ✓ | ✓ |
| BR-037 | DR-044 | PP-3 / AP-3 / PR-004 / AC-03 | — | BC-005 | ✓ | ✓ | ✓ |
| BR-038 | DR-006 | PP-3 / PR-017 | BC-001 BR-014 | BC-005/006 | — | ✓ | ✓ |
| BR-039 | DR-019 | PR-031/032 / AC-21 | — | BC-005 | — | ✓ | ✓ |
| BR-040 | DR-043/044/019 | PP-3 / AP-3 / AC-03 | — | BC-005 | ✓ | ✓ | ✓ |

## 7. Coverage Report

| Frozen DR | Covered by | Frozen DR | Covered by |
|---|---|---|---|
| DR-006 | BR-035, BR-038 | DR-025 | BR-036 (one method) |
| DR-017 | BR-035 | DR-026 | BR-030, BR-031 |
| DR-019 | BR-039 | DR-043 | BR-034 |
| DR-023 | BR-028/029/032/033/036 | DR-044 | BR-037, BR-040 |
| DR-090 | BR-028, BR-030 | | |

**Uncovered in-scope rules:** none. **Deliberately deferred:** the distribution
*calculation* (DR-005/013/015) is consumed from BC-001, not re-formalized;
cancellation/correction *mechanics* (DR-045…048) and refund reversal (DR-036…042) belong
to **BC-005**; teacher entitlement from posted receipts (DR-015/029) belongs to **BC-004**;
balances derivation to **BC-006**. Non-program-revenue receipts (DR-080…082) are **BC-007**.

**Scope intentionally closed.** No additional frozen Domain Rules belong to this document.

## 8. Business Invariants *(derivational, not generative — per BC-001 §8 doctrine)*

- **INV-11 — Every Receipt Voucher's number is unique within the receipt series and is
  never reused.** *(entails BR-030, BR-031; DR-090/026)*
- **INV-12 — A posted receipt is permanent — never edited or deleted — and its stored split
  never changes.** *(entails BR-037, BR-038; DR-044/006)*
- **INV-13 — Every posted receipt records exactly one payment, for one student and one
  program, by one method.** *(entails BR-036; DR-023/025)*
- **INV-14 — Posting a receipt raises the three balances by full / teacher / center and
  never merges them.** *(entails BR-035; DR-017/016; consumes BC-001)*
- **INV-15 — Recording a receipt is posting it; V1 has no uncommitted receipt state.**
  *(entails BR-034; DR-043)*

## 9. Cross-Document Consistency Review

- **Depends on (existing BC rules):** BC-001 — BR-010 (Revenue Distribution Policy),
  BR-011/BR-012 (the teacher/center split the posting applies), BR-014 (distribution
  immutability); BC-002 — BR-020 (registration ↔ one student/one program), BR-023
  (installments), BR-024 (overpayment prevention); and the BC-000 framework.
- **Modifies / narrows / reinterprets any prior BR?** **Consumes only. No modification. No
  narrowing. No reinterpretation.** BC-003 records money-in *around* BC-001's distribution
  and BC-002's registration/installment rules, using them with their frozen meaning intact
  — it neither changes, narrows, nor re-reads any prior BR. *(Had any prior BR needed
  changing, this would STOP and be raised as an Amendment per GOV-004 §5 / BC-000 §BCG-3,
  never authored as a new document.)*

## 10. Strict-Scope Self-Check

BC-003 defines **only** Business Rules (BR-028…BR-040) in the 13-field normal form, each
atomic, observable, business-only, and dual-cited. It creates no UI, engineering, API,
schema, algorithm, validation logic, screen flow, component, code, test, report, or
accounting implementation. It re-formalizes no Registration, Pricing, Installment,
Guardian, Payer, distribution-calculation, refund, entitlement, or balance rule — all are
consumed exactly as frozen. It duplicates no prior BR, expands no product scope, and
contradicts no Product Constitution statement.
