# ADR-0013 — Session 3 Owner Decisions: Student Entity, Registration, Installments, Currency, Numbering, V1 Simplicity

| Field | Value |
|---|---|
| ADR | 0013 |
| Title | Session 3 Owner Decisions: Student Entity, Registration, Installments, Currency, Numbering, V1 Simplicity |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner answered Interview Session 3 (Student Payments & Receipt Vouchers,
DOM-005 §6) on 2026-07-17 with six formal business decisions (S3-D1…S3-D6) and
ordered their adoption as-is, propagation per the Owner Decision Protocol
(GOV-010), and re-freeze of Domain Discovery before the next session. Decision
categories (GOV-010 §5): Business, Product, Scope, Naming.

## Decision (the Owner's rulings)

1. **S3-D1 — Student is the core person entity; payer is optional information.**
   The Student (الطالب) is an independent entity in the system. Receipt vouchers
   belong to the student; the account statement belongs to the student; programs
   are linked to the student. The payer is an optional field (**Payer Name**)
   recorded on the voucher when someone else (parent, company, other party)
   pays — in over 95% of cases the payer is the student or recording them is
   irrelevant. The payer is NOT an independent entity in V1.
2. **S3-D2 — Registration precedes payment.** Student registration
   (التسجيل) is an independent recorded event: a student may register without
   paying, pay a week later, or withdraw before paying. Order: Registration →
   Payment.
3. **S3-D3 — Installments; one voucher = one student + one program + one
   payment.** Program fees may be paid in several payments. Each payment gets
   its own receipt voucher with its own number and its own date, and is split
   immediately by the program's percentage at the moment the voucher is posted.
   A single receipt voucher may NEVER cover more than one program or more than
   one student. **No overpayment:** the system prevents entering an amount
   larger than what is due.
4. **S3-D4 — Currency and payment methods.** The base currency is the **Shekel
   (الشيكل)**; decimals are not used in practice — all operations are whole
   numbers. Allowed payment methods: **cash** and **bank transfer**; mixing
   methods in one voucher is forbidden — exactly one method per voucher.
5. **S3-D5 — Voucher numbering.** Receipt vouchers and payment vouchers have
   **independent continuous sequences**; numbering never resets yearly. The new
   system starts each sequence from a number the Owner specifies at go-live, to
   align with the existing paper vouchers.
6. **S3-D6 — V1 Simplicity Principle (pre-emptive).** The following are NOT part
   of Version 1: more than one student per voucher; more than one program per
   voucher; more than one payment method per voucher; overpayment; manual
   distribution; editing a distribution after the voucher is posted. If needed
   in the future they belong to V2 or later and must not affect the V1 design.

## Interpretation boundaries (what is NOT decided here)

- **Implied concept surfaced, not specified:** S3-D3's overpayment prevention
  presupposes a defined **amount due** per student per program — its structure
  (fixed program price, discounts, variability) remains open → signal logged on
  UNK-005.
- **Whole-number splits:** S3-D4 fixes whole-shekel operation, but when a
  percentage split of a whole amount is fractional (e.g. 70% of 1001), the
  rounding direction and who receives the remainder are NOT stated → new
  unknown **UNK-025** (HIGH). Not guessed (AI-11).
- **Statements:** "the account statement belongs to the student" establishes
  student statements; whether teacher/center statements also exist, with what
  periods and content, remains open → signal logged on UNK-013.
- **Numbering continuity ≠ data migration:** starting sequences from paper
  numbers does not decide whether historical records are imported → signal
  logged on UNK-022.
- F-05's "Students (or Payers)" is refined, not contradicted: the entity is the
  Student; "payer" survives as the optional Payer Name field.

## Consequences

- **Resolved:** UNK-004 (HIGH), UNK-010, UNK-011, UNK-012, UNK-014.
  **Confirmed:** ASM-001. **Opened:** UNK-025 (HIGH).
- **New domain rules:** DR-021…DR-027 (DOM-004).
- **Blast radius:** DOM-001 v1.3.0, DOM-002 v3.0.0 (Student entity
  restructured), DOM-003 v1.3.0 (WF-01 becomes ESTABLISHED), DOM-004 v2.2.0,
  DOM-005 v1.8.0, GOV-008 (LES-010), GOV-009, IDX-001, DEC-000; audit
  AUD-P1A-005. Frozen governance documents untouched.
- Full review pipeline re-run; Domain Discovery re-freezes on all-PASS
  (GOV-010 §4).
