# DOM-001 — Business Overview

| Field | Value |
|---|---|
| Doc ID | DOM-001 |
| Title | Business Overview |
| Phase | 1A |
| Status | FROZEN |
| Version | 1.1.0 |
| Depends on | GOV-000 (M-01…M-08), GOV-001 (F-01…F-09), ADR-0008 (owner decisions D1–D6) |
| Referenced by | DOM-002…DOM-005 |

---

This document describes the **business itself, not the software**. It records only
what the frozen facts (F-01…F-09), the manifesto (M-01…M-10), and the owner's
statements establish. Every gap is cited as `UNK-NNN` (→ DOM-005) — nothing here is
invented (AI-10, AI-11).

## 1. What the training center does

Ard Kanaan (أرض كنعان) is a single training center (F-02). It offers **training
programs** — structured instruction delivered to students. Each program is taught
by exactly one **teacher** (F-06). Students (or the persons paying on their behalf
— "payers") pay money for these programs (F-05, F-06).

What subjects the center teaches, how many programs run at once, how long programs
last, and whether programs repeat in cohorts is not yet stated → UNK-016.

## 2. Who participates

| Participant | Role in the business |
|---|---|
| **The Owner** | The single person who runs the center, handles its money, and is the sole user of the future system (F-02, M-01). |
| **Teachers** | Deliver training programs. Each program belongs to exactly one teacher (F-06). Teachers are entitled to a share of the revenue their programs generate (F-07). |
| **Students / Payers** | Receive training and pay for it. Whether the business tracks students as persons with ongoing records, or only as the payer named on a payment, is not yet stated → UNK-011. |

No other participants (employees, partners, external accountants) have been
mentioned → UNK-017.

## 3. How money flows

Money enters and leaves the center along these paths, as currently established:

```
Students/Payers ──payment for a program──►  ┌────────────────┐
                                            │ TRAINING CENTER │
                                            │  (the Owner)    │
        Teacher share (per policy) ◄────────│                 │
        Center expenses ◄───────────────────│                 │
                                            └────────────────┘
```

1. **Money in:** a student/payer pays for a training program. The payment is
   recorded as a **receipt voucher (سند قبض)** that belongs to exactly one program
   (F-06).
2. **The split:** at the moment a receipt is posted, the money is divided between
   a **teacher share** and a **center share** according to the program's **revenue
   distribution policy** (F-07). Policies follow one of the owner's compensation
   models — percentage of each receipt (most common), fixed per student, fixed
   per program, fixed monthly, or custom agreement (ADR-0008 D1; per-model
   semantics → UNK-024). Example given by the owner: receipt 1000 → teacher 700,
   center 300. The split is computed automatically — never by hand (F-08) — the
   teacher's entitlement begins at that same moment (ADR-0008 D4), rounding
   follows the currency's own rules, never custom logic (ADR-0008 D3), and the
   applied split is preserved inside that voucher forever, even if the policy
   later changes (F-07).
3. **Money out:** outgoing money is recorded as **payment vouchers (سند صرف)**
   (F-05). What categories of outgoing money exist, and whether paying a teacher
   their accumulated share is itself a payment voucher, is not yet stated →
   UNK-008, UNK-009.

Payment methods (cash, bank, other), currency, and whether amounts can be received
in installments are not yet stated → UNK-004, UNK-010.

## 4. What creates revenue

The only revenue source established so far is **student/payer payments for
training programs** (F-05, F-06). Whether the center has any other income (renting
rooms, selling materials, registration fees) is not stated → UNK-018.

## 5. What creates expenses

Established only in outline: the center has outgoing money recorded as payment
vouchers (F-05). Known candidates from the entity list are payments to teachers
(settling teacher balances) and center operating expenses — but their categories,
approval, and timing are not stated → UNK-008, UNK-009, UNK-015.

## 6. Why the system exists

The owner currently must track programs, teachers, payments, splits, and balances
manually. The system exists to remove that burden (M-01): every receipt is split
automatically (F-07, F-08), and the owner can see — at any moment, without
calculating — the three never-merged balances (**Cash Balance**, **Teacher
Payables**, **Center Net Balance** — ADR-0008 D5), each **teacher balance**, and
**account statements** (F-05, M-07). The business is intentionally small and must
stay that way: one center, one owner, one database; never an ERP (F-02, F-03,
M-03, M-08).
