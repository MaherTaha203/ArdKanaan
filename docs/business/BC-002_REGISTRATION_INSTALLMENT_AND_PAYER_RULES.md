# BC-002 — Registration, Installment & Payer Rules

| Field | Value |
|---|---|
| Doc ID | BC-002 |
| Title | Registration, Installment & Payer Rules |
| Phase | 2 (Business Constitution) |
| Status | FROZEN |
| Version | 1.0.1 |
| Depends on | BC-000 (framework, Dual Authority); BC-001 (pricing, consumed); P2-000; DOM-004 (DR-021/022/023/024/086/087/089); PC-003/004/005/006/007/008 (frozen); GOV-006/011/012 |
| Answers | "How are Registrations, Installments, and Payers governed as Business Rules?" |

---

## 1. Purpose

BC-002 formalizes the frozen Domain truth about **registration, installment payment, the
payer, and the guardian** into atomic Business Rules. It builds directly on BC-001
(which fixed program pricing and the Final Registration Price) and prepares the ground
for BC-003 (receipts). It defines **only** Business Rules — no implementation, UI,
technology, or test.

## 2. Scope

**BC-002 governs:** registration as an independent event and its precedence over payment;
the registration↔program link; the optional Payer (Payer Name); the Guardian as
student-level contact; that a registration may be paid in installments; overpayment
prevention against the Final Registration Price; and the registration lifecycle
(Active / Ended-Withdrawn, reversibility, and what constitutes a new registration).

**BC-002 does NOT govern:** the Receipt Voucher's own mechanics, atomicity, and numbering
(BC-003); revenue split (BC-001/BC-003); refund behavior and refund↔registration effects
(BC-005); entitlement/balances (BC-004/BC-007); any UX, data, engineering, or test
concern. It consumes BC-001's pricing rules and modifies none.

## 3. Business Rule Principles

- **RP-6 — Registration precedes money.** Registration is a business event in its own
  right; no rule makes payment a precondition of registration.
- **RP-7 — The student is the anchor person.** Receipts, statements, and registrations
  belong to the Student; the Payer and Guardian are attributes, never financial entities.
- **RP-8 — Settlement is bounded by the Final Registration Price.** All collection on a
  registration is measured against BC-001's Final Registration Price; the sum of receipts
  may never exceed it.
- **RP-9 — Lifecycle preserves history.** Ending or reactivating a registration changes
  only future collection, never a prior financial fact.
- **RP-10 — Dual Authority.** Every BR cites both an Authority of Truth (DR) and an
  Authority of Constitutional Legitimacy (PC) — BC-000 §4.0.

## 4. Business Rule Catalog

### Category — Registration Identity & Precedence

**BR-019 — Registration is an independent business event that precedes payment**
- **Rule Statement:** A student's registration in a program is a recorded business event
  independent of payment: it may occur with no payment, payment may follow later, and a
  student may withdraw before paying. The order is Registration → Payment.
- **Business Rationale:** this is how the center actually operates.
- **Preconditions:** a Student and an open Program exist.
- **Trigger:** the Owner records a registration.
- **Required Outcome:** a registration exists independent of any payment; no payment is
  required to create it.
- **Exceptions:** withdrawal after payment is a refund (BC-005); ending/reactivating a
  registration is a separate Owner action (BR-025…BR-027).
- **Authority of Truth:** DR-022 (DR-021/002 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Registration as first-class
  obligation); PC-004 §1.
- **Affected Product Concepts:** Registration; Student; Training Program.
- **Affected Future Documents:** BC-003; BC-005; Phase 3; Phase 4; Testing.
- **Verification Method:** create a registration with no receipt; confirm it exists and is
  valid.

### Category — Registration–Program Link

**BR-020 — A registration links exactly one Student to exactly one Program**
- **Rule Statement:** Each registration binds one Student to one Program; that student's
  receipts and statements reference this registration. A registration never spans two
  students or two programs.
- **Business Rationale:** the enrolment obligation is *this* student in *this* program;
  atomicity keeps every balance unambiguous.
- **Preconditions:** one Student, one Program.
- **Trigger:** registration creation.
- **Required Outcome:** the registration references exactly one Student and one Program.
- **Exceptions:** none — a second program is a second registration (BR-027).
- **Authority of Truth:** DR-022, DR-021 (DR-023 "one student + one program" supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Registration links one Student to
  one Program); PC-004 §1.
- **Affected Product Concepts:** Registration; Student; Training Program.
- **Affected Future Documents:** BC-003; BC-007; Phase 4; Testing.
- **Verification Method:** inspect any registration — exactly one student and one program.

### Category — Payer

**BR-021 — The Payer is an optional Payer Name on a receipt, never an entity**
- **Rule Statement:** Payment may be made by someone other than the student; this is
  captured only as an optional Payer Name on the receipt. The Payer is never an
  independent entity, holds no balance, and may differ from receipt to receipt.
- **Business Rationale:** in most cases the payer is the student or irrelevant; a payer
  entity would add weight without value (M-08).
- **Preconditions:** a receipt is being recorded on a registration.
- **Trigger:** a payment is recorded with a non-student payer.
- **Required Outcome:** the payer is stored as a Payer Name on that receipt; no payer
  entity or balance is created.
- **Exceptions:** none in V1.
- **Authority of Truth:** DR-021.
- **Authority of Constitutional Legitimacy:** PC-006 (canonical "Payer Name"); PC-003
  (Student is the anchor); PC-004 §2 (no payer entity).
- **Affected Product Concepts:** Payer Name; Receipt Voucher; Student.
- **Affected Future Documents:** BC-003; Phase 3; Phase 4; Testing.
- **Verification Method:** record a receipt with a different payer; confirm only a Payer
  Name is stored, no entity.

### Category — Guardian

**BR-022 — A Guardian is student-level contact data, not a user or financial entity**
- **Rule Statement:** A student may carry Guardian/Parent contact information (name,
  relationship, phone, other contact means) stored on the student. The Guardian is not a
  system user, not a financial entity, holds no permissions or role, and is distinct from
  the per-receipt Payer Name — it is standing contact data, unchanged by payments.
- **Business Rationale:** the center often communicates with a minor's family; this is
  contact data, never a money relationship.
- **Preconditions:** a Student exists.
- **Trigger:** the Owner records guardian contact data.
- **Required Outcome:** guardian data is stored on the student; no user, permission,
  balance, or financial role is created; it remains distinct from Payer Name.
- **Exceptions:** the sole system user remains the Owner (F-02); no other participant
  exists in V1.
- **Authority of Truth:** DR-089 (DR-021 supporting).
- **Authority of Constitutional Legitimacy:** PC-005 AX-3 (no operating capability to
  parties/contacts); PC-003; PC-006 ("Guardian" vs "Payer Name").
- **Affected Product Concepts:** Guardian; Student; Payer Name.
- **Affected Future Documents:** BC-003; Phase 3; Phase 4; Testing.
- **Verification Method:** add guardian data; confirm no user/permission/balance arises
  and it is separate from any Payer Name.

### Category — Installments

**BR-023 — A registration's Final Registration Price may be paid in installments (installments divide settlement, not the obligation)**
- **Rule Statement:** The Final Registration Price is a **single, indivisible obligation**
  (BC-001 BR-008). A registration may be **settled** by one or more payments
  (installments); each payment is recorded as its own receipt, and the registration's
  collected total is the sum of its receipts, measured against the Final Registration
  Price. **Installments divide only the settlement of the obligation — how and when it is
  collected — never the obligation itself, which remains one amount due.**
- **Business Rationale:** students commonly pay a single program fee over several
  payments; the amount owed is unchanged by how it is collected.
- **Preconditions:** a registration with a Final Registration Price (BC-001 BR-008).
- **Trigger:** a payment is recorded on the registration.
- **Required Outcome:** each payment is one installment of **settlement** against the
  unchanged single obligation; the collected total accumulates toward the Final
  Registration Price.
- **Exceptions:** none — the receipt's own mechanics/numbering are governed by BC-003.
- **Authority of Truth:** DR-023.
- **Authority of Constitutional Legitimacy:** PC-003 (Registration holds the amount due;
  Receipt records money-in); PC-004 §1.
- **Affected Product Concepts:** Registration; Receipt Voucher; Final Registration Price.
- **Affected Future Documents:** BC-003; BC-007; Phase 4; Testing.
- **Verification Method:** record two installments on one registration; confirm both are
  valid receipts summing toward the price, and the amount due is unchanged by the split.

### Category — Overpayment Prevention

**BR-024 — The sum of a registration's receipts may never exceed its Final Registration Price**
- **Rule Statement:** Recording a payment that would make the registration's total
  receipts exceed its Final Registration Price is prevented; overpayment does not exist in
  V1.
- **Business Rationale:** no money may enter the records without a matching entitlement to
  training.
- **Preconditions:** a registration with a Final Registration Price and its prior receipts.
- **Trigger:** a new payment is attempted on the registration.
- **Required Outcome:** the payment is accepted only if it keeps the receipt total ≤ Final
  Registration Price; otherwise it is prevented.
- **Exceptions:** none in V1.
- **Authority of Truth:** DR-024 (DR-023 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Registration owns the amount due);
  consumes BC-001 BR-009 (Final Registration Price = sole amount-due reference);
  PC-004 §1.
- **Affected Product Concepts:** Registration; Receipt Voucher; Final Registration Price.
- **Affected Future Documents:** BC-003; BC-005; Phase 4; Testing.
- **Verification Method:** attempt a payment beyond the price; confirm it is prevented.

### Category — Registration Lifecycle

**BR-025 — A registration's Active / Ended-Withdrawn status blocks new receipts while preserving history**
- **Rule Statement:** A registration carries an Owner-controlled status, Active or
  Ended-Withdrawn. Setting it Ended-Withdrawn blocks new receipts on that registration
  while all prior records (receipts, refunds, history) remain visible and unchanged, and
  refunds tied to earlier receipts remain allowed. Ending closes the registration to
  future collection only and changes no prior financial effect.
- **Business Rationale:** an ended registration no longer represents an open obligation to
  collect against, but its history and legitimate reversals must be preserved.
- **Preconditions:** a registration exists.
- **Trigger:** the Owner sets the registration to Ended-Withdrawn.
- **Required Outcome:** new receipts are blocked; all prior records remain; refunds on
  earlier receipts remain allowed; no prior financial effect changes.
- **Exceptions:** operations on pre-existing records (refunds) stay allowed; only new
  receipts are blocked. A refund never changes registration status automatically
  (DR-085; BC-005).
- **Authority of Truth:** DR-086 (DR-022/023/024 supporting; mirrors DR-078).
- **Authority of Constitutional Legitimacy:** PC-003 (Operational Status on Registration);
  PC-004 §1; PC-002 PP-3 (history preserved).
- **Affected Product Concepts:** Registration; Operational Status; Receipt Voucher.
- **Affected Future Documents:** BC-003; BC-005; Phase 3; Phase 4; Testing.
- **Verification Method:** end a registration; confirm new receipts blocked but an
  earlier-receipt refund still allowed and history intact.

**BR-026 — Ended-Withdrawn is reversible; reactivation resumes the same registration**
- **Rule Statement:** An Ended-Withdrawn registration may be reactivated by the Owner back
  to Active; the same registration resumes, keeping its full history and its Final
  Registration Price (not re-set — it remains locked per BC-001 BR-013).
- **Business Rationale:** returning to the same program continues the same relationship.
- **Preconditions:** an Ended-Withdrawn registration.
- **Trigger:** the Owner reactivates the registration.
- **Required Outcome:** the same registration returns to Active with unchanged history and
  its locked Final Registration Price.
- **Exceptions:** none.
- **Authority of Truth:** DR-087 (DR-075 supporting; mirrors DR-079).
- **Authority of Constitutional Legitimacy:** consumes BC-001 BR-013 (price-lock); PC-003
  (Operational Status "reversible"); PC-004 §1.
- **Affected Product Concepts:** Registration; Operational Status; Final Registration
  Price.
- **Affected Future Documents:** BC-003; Phase 3; Phase 4; Testing.
- **Verification Method:** reactivate an ended registration; confirm history and price are
  unchanged.

**BR-027 — A new registration exists only for a new Student×Program obligation, per Domain truth**
- **Rule Statement:** Whether a registration is "new" is determined by the frozen Domain,
  not by wording. Per DR-087, a new registration is created only for **(a)** a **different
  Program** — always an independent financial unit (DR-071; BC-001 BR-001), therefore
  always a new registration — or **(b)** within the same Program, a **new financial
  obligation that does not continue the previous one**. A return to the **same** Program
  continuing the **same** obligation is a reactivation (BR-026 / DR-087), never a new
  registration.
- **Business Rationale:** the discriminator is the objective Domain criterion —
  continuation of the same Student×Program obligation vs. a distinct one — not a
  linguistic judgment.
- **Preconditions:** an existing registration and a decision to continue vs. start anew.
- **Trigger:** the Owner enrols a student in a new program or a distinct new obligation.
- **Required Outcome:** a new registration exists **iff** the Domain criterion (different
  program, or a non-continuing obligation) holds; otherwise reactivation applies.
- **Exceptions:** none.
- **Authority of Truth:** DR-087 (DR-071 program independence, DR-022 registration = one
  obligation, supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Registration = one enrolment
  obligation); PC-004 §1.
- **Affected Product Concepts:** Registration; Training Program.
- **Affected Future Documents:** BC-003; BC-007; Phase 4; Testing.
- **Verification Method:** confirm a same-program return reactivates, while another program
  yields a new registration.

## 5. Rule Categories

| # | Category | Rules |
|---|---|---|
| 1 | Registration Identity & Precedence | BR-019 |
| 2 | Registration–Program Link | BR-020 |
| 3 | Payer | BR-021 |
| 4 | Guardian | BR-022 |
| 5 | Installments | BR-023 |
| 6 | Overpayment Prevention | BR-024 |
| 7 | Registration Lifecycle | BR-025, BR-026, BR-027 |

## 6. Business Rule Traceability Matrix

| BR | Frozen Domain | Product Constitution | Consumes (BC) | Future BC | Future UX | Future Eng | Future Testing |
|---|---|---|---|---|---|---|---|
| BR-019 | DR-022 | PC-003/004 | — | BC-003/005 | ✓ | ✓ | ✓ |
| BR-020 | DR-022/021 | PC-003/004 | — | BC-003/007 | — | ✓ | ✓ |
| BR-021 | DR-021 | PC-003/004/006 | — | BC-003 | ✓ | ✓ | ✓ |
| BR-022 | DR-089 | PC-005 AX-3 / PC-003/006 | — | BC-003 | ✓ | ✓ | ✓ |
| BR-023 | DR-023 | PC-003/004 | BC-001 (FRP) | BC-003/007 | ✓ | ✓ | ✓ |
| BR-024 | DR-024 | PC-003/004 | BC-001 BR-009 | BC-003/005 | ✓ | ✓ | ✓ |
| BR-025 | DR-086 | PC-003/004 / PP-3 | — | BC-003/005 | ✓ | ✓ | ✓ |
| BR-026 | DR-087 | PC-003/004 | BC-001 BR-013 | BC-003 | ✓ | ✓ | ✓ |
| BR-027 | DR-087/071/022 | PC-003/004 | BC-001 BR-001 | BC-003/007 | — | ✓ | ✓ |

## 7. Coverage Report

| Frozen DR | Covered by | Frozen DR | Covered by |
|---|---|---|---|
| DR-021 | BR-021 (BR-020/022 supporting) | DR-086 | BR-025 |
| DR-022 | BR-019, BR-020 | DR-087 | BR-026, BR-027 |
| DR-023 | BR-023 (installment aspect) | DR-089 | BR-022 |
| DR-024 | BR-024 | | |

**Uncovered in-scope rules:** none. **Deliberately deferred:** DR-023's receipt atomicity
and numbering (one receipt = one student + one program + one payment; per-voucher
number/date/split-at-posting) belong to **BC-003** — represented here only as the
installment permission (BR-023). DR-085 (refund never auto-changes registration status)
belongs to **BC-005**; referenced as an exception in BR-025, not formalized here.
Supporting DR-002/004/072–075 are consumed, not re-formalized.

## 8. Business Invariants *(derivational, not generative — per BC-001 §8 doctrine)*

- **INV-7 — Registration can exist without any payment.** *(entails BR-019; DR-022)*
- **INV-8 — A registration's collected total never exceeds its Final Registration
  Price.** *(entails BR-024; DR-024)*
- **INV-9 — Ending or reactivating a registration never alters a prior financial fact, and
  never re-sets the locked Final Registration Price.** *(entails BR-025, BR-026;
  DR-086/087)*
- **INV-10 — The Payer and the Guardian are never financial entities and hold no
  balance.** *(entails BR-021, BR-022; DR-021/089)*

## 9. Cross-Document Consistency Review

- **Depends on (existing BC rules):** BC-001 — BR-006 (base-price default), BR-007
  (per-registration override), BR-008/BR-009 (Final Registration Price: single stored
  value and sole amount-due reference), BR-013 (price-lock at first receipt); and the
  BC-000 framework (Dual Authority, governance).
- **Modifies / narrows / reinterprets any prior BR?** **Consumes only. No modification.
  No reinterpretation.** BC-002 uses BC-001's pricing rules with their frozen meaning
  intact — it neither changes them, narrows them, nor re-reads them. *(Any modification,
  narrowing, or reinterpretation of a prior BR would be raised as an Amendment per
  GOV-004 §5 / BC-000 §BCG-3, not authored as a new document.)*

---

## Strict-scope self-check

BC-002 defines **only** Business Rules (BR-019…BR-027) in the 13-field normal form, each
atomic, observable, business-only, and dual-cited. It creates no UI, engineering, API,
schema, algorithm, validation logic, screen flow, component, code, test, report, or
accounting implementation; it duplicates no prior BR, expands no product scope, and
contradicts no Product Constitution statement.

---

*Amendment — ADR-0042 (Option A renumbering): forward-reference document numbers updated (BC-006→BC-007 balances; BC-007→BC-008 non-program). Numbering only changed; constitutional meaning unchanged; no business rule altered.*
