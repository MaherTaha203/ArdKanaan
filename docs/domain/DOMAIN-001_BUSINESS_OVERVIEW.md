# DOM-001 — Business Overview

| Field | Value |
|---|---|
| Doc ID | DOM-001 |
| Title | Business Overview |
| Phase | 1A |
| Status | FROZEN |
| Version | 1.12.0 |
| Depends on | GOV-000 (M-01…M-08), GOV-001 (F-01…F-09), ADR-0008 (owner decisions D2–D6), ADR-0009 (V1 scope), ADR-0013 (Session 3 decisions), ADR-0014 (rounding rule), ADR-0015 (Session 4 teacher payments), ADR-0016 (Session 5 student refunds), ADR-0018 (Session 6 corrections & cancellations), ADR-0019 (Session 7 expense categories), ADR-0020 (Session 8 expense returns), ADR-0021 (Session 9 refund entitlement & teacher debt), ADR-0022 (Session 10 program definition, pricing & policy), ADR-0023 (Session 11 business boundary & operational completeness) |
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

In V1 a **Program** is a single **run (offering)** of a service: the same service
name (e.g. "ICDL") may run many times, and each run is a **separate, fully
independent program** — its own teacher, price, distribution percentage, students,
and money (DR-071, ADR-0022). A program carries a base price and documentary
start/end dates, and the Owner controls whether it is **Open or Closed** to new
business; any number of programs, including same-named ones, may run at once. V1
has no student-capacity limit and no internal cohorts (each batch is its own
program) — both are future enhancements (DOM-004 §Future considerations).

## 2. Who participates

| Participant | Role in the business |
|---|---|
| **The Owner** | The single person who runs the center, handles its money, and is the sole user of the future system (F-02, M-01). |
| **Teachers** | Deliver training programs. Each program belongs to exactly one teacher (F-06). Teachers are entitled to a share of the revenue their programs generate (F-07). |
| **Students** | Receive training and pay for it. The Student is the core person entity: registration precedes payment, receipts and statements belong to the student, and when someone else pays (parent, company) their name is recorded on the voucher as optional Payer Name information — never a separate entity in V1 (ADR-0013 S3-D1/S3-D2, DR-021, DR-022). |

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

1. **Money in:** a student pays for a training program they registered in
   (registration is its own earlier event, DR-022). Each registration has a
   **Final Registration Price** — the program's base price by default, which the
   Owner may override for that student; it is a single stored amount (no separate
   discount) that locks once the first receipt is recorded (DR-072…DR-075). The
   payment is recorded as a **receipt voucher (سند قبض)** that belongs to exactly
   one student and one program and represents exactly one payment (F-06, DR-023);
   installments each get their own voucher. Amounts are whole Shekels, paid in cash
   or by bank transfer — one method per voucher (DR-025); overpayment beyond the
   Final Registration Price is prevented (DR-024, DR-074); vouchers are numbered in
   a continuous sequence (DR-026).
2. **The split:** at the moment a receipt is posted, the money is divided between
   a **teacher share** and a **center share** according to the program's **revenue
   distribution policy** (F-07). In Version 1 every policy is a **percentage
   split** summing to 100% (DR-013, ADR-0009); other compensation models are
   postponed Future Considerations (→ DOM-004). Example given by the owner:
   receipt 1000 at 70/30 → teacher 700, center 300. The split is computed
   automatically — never by hand (F-08) — the teacher's entitlement begins at
   that same moment (ADR-0008 D4), rounding follows the currency's own rules,
   never custom logic (ADR-0008 D3), and the applied split is preserved inside
   that voucher forever, even if the policy later changes (F-07).
3. **Money out:** outgoing money is recorded as **payment vouchers (سند صرف)**
   (F-05). Paying a teacher IS a payment voucher: owner-initiated on the agreed
   date (never automatic), one program per voucher, partial or full up to that
   program's outstanding balance, never in advance — each Teacher × Program is
   an independent balance settled separately (DR-030…DR-034, ADR-0015). Center
   expenses are also payment vouchers — general, center-borne, each under one
   expense category (DR-049…DR-054).
4. **Money back (refunds):** a student refund is a **reversal of previously
   recognized revenue** — never an expense — recorded by the dedicated **Refund
   Voucher (سند استرجاع)**: it reduces Program Revenue and the student's paid
   amount, and the teacher's entitlement falls by the **same original program
   percentage** (rounded like every split, DR-028/DR-063), never dropping below
   zero (DR-036…DR-042, DR-062…DR-064, ADR-0016, ADR-0021). If the teacher had
   already been paid more than their final entitlement, the excess becomes a
   **teacher debt** — tracked per Teacher × Program, never merged across programs,
   settled by direct repayment or by same-program future-entitlement deduction at
   the Owner's choice, never automatically, never expiring, and cleared only by
   repayment when the program has no future entitlement (DR-065…DR-070, ADR-0021).

Currency, methods, and installments were fixed by ADR-0013 S3-D3/S3-D4 (see
point 1 above); fractional splits round the teacher share to the nearest whole
shekel with any difference going to the center, and the two shares always sum
to the exact voucher amount (DR-028).

**Fixing mistakes:** every financial document is Posted the moment it is saved
(no Draft stage in V1) and is then immutable. A financial error is fixed by
**cancellation** — the original keeps a "Cancelled" status that reverses all its
effects automatically and stays visible for audit — followed by recreating the
correct document; a document cannot be cancelled while later documents depend on
it (remove dependents newest → original first). Non-financial descriptive fields
may be edited in place with a full change log (DR-043…DR-048, ADR-0018).

## 4. What creates revenue

The main revenue source is **student/payer payments for training programs**
(F-05, F-06) — recognized net of refunds (DR-036, DR-037) and split with the
teacher. V1 also records three **center-only** educational revenues charged
separately from the program: **exam fees, certificate-issuance fees, and
book/material sales** (DR-080…DR-082). These carry **no teacher share** — revenue
distribution applies **exclusively to program fees** — and each is **always tied
to a student** (program link optional), raising only the Cash Balance and Center
Net Balance. Every receipt names a defined revenue source; there are no generic
receipts (DR-080). **Room rental, consulting, and other services are out of scope**
for V1 (DOM-004 §Future considerations). Whether these non-program revenues are
refundable, and how their amount is bounded, are open questions (→ UNK-029,
UNK-030).

## 5. What creates expenses

Teacher payments are established (ADR-0015): owner-initiated payment vouchers,
one program each, settling Teacher × Program balances. **Center expenses** are
established (ADR-0019): money the center pays to operate itself (rent, utilities,
stationery, maintenance, furniture/equipment, government fees, subscriptions —
not teacher payments or refunds, which are settlements/reversals). Each expense
is a center-borne Payment Voucher under exactly one expandable **Expense
Category**, recorded when the cash actually leaves, reducing Cash Balance and
Center Net Balance and never touching any teacher (DR-049…DR-054). **Expense
returns** are established (ADR-0020): when cash comes back because of a prior
expense (a purchase return, supplier refund, cancelled subscription, or returned
deposit), it is recorded as an **Expense Return** that reduces/reverses that one
expense — never new income — bounded by the original amount, with Cash Balance
and Center Net Balance both rising again (DR-055…DR-061). Non-cash returns
(credit notes, goods replacement) are outside V1.

## 6. Why the system exists

The owner currently must track programs, teachers, payments, splits, and balances
manually. The system exists to remove that burden (M-01): every receipt is split
automatically (F-07, F-08), and the owner can see — at any moment, without
calculating — the three never-merged balances (**Cash Balance**, **Teacher
Payables**, **Center Net Balance** — ADR-0008 D5), each **teacher balance**, and
**account statements** (F-05, M-07). The business is intentionally small and must
stay that way: one center, one owner, one database; never an ERP (F-02, F-03,
M-03, M-08).
