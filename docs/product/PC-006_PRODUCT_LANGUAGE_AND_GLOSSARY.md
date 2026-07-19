# PC-006 — Product Language & Glossary

| Field | Value |
|---|---|
| Doc ID | PC-006 |
| Title | Product Language & Glossary |
| Phase | 1 (Product Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | PC-003 (concepts), PC-004 (anti-patterns), GOV-002 §7.2 (founding term set), ADR-0005 (documentation language), DOM-002 |
| Answers | "What are the product's canonical terms, and which words are forbidden?" |

---

## 1. Purpose & authority

This is the product's **naming authority**: the canonical term for each concept, a
one-line meaning, and the **banned synonyms** that must never be used in its place. It
carries the *words*; **PC-003** carries the *concepts* (meaning and relationships) —
this document does not re-explain relationships. It is built on GOV-002 §7.2 (the
founding term set) and consolidates every term introduced by frozen ADRs since. **UI
wording, microcopy, and language-direction (RTL) are out of scope** — they are Phase-3
(UX) decisions (ADR-0005 §3); PC-006 governs product terminology only.

## 2. Naming rules

- **NR-1** — Exactly one canonical term per concept; no concept has two names. *Test:*
  every PC-003 concept appears once in §4.
- **NR-2** — A banned synonym is never used in any product document or PR. *Test:* zero
  banned-synonym occurrences outside this glossary (Gate 6).
- **NR-3 — Canonical Product Term vs aliases (constitutional).** Every Product Concept
  owns **exactly one Canonical Product Term.** Business Names, Arabic names,
  translations, and localized terminology are **aliases for communication only** —
  they never create additional canonical terminology. (Where an Arabic name appears in
  the glossary in parentheses, it is a business **alias**, not a second canonical
  term.) This rule belongs to **Product terminology, not UI.**
- **NR-4** — No term here is a UI label, message, or tone choice (those are Phase 3).

## 3. Glossary Governance

Defines how the canonical glossary evolves over time.

- **GG-1** — Every Product Concept shall have **exactly one** Canonical Product Term.
- **GG-2** — Whenever a new Product Concept is admitted into PC-003, its Canonical
  Product Term **must be added to PC-006 before propagation.**
- **GG-3** — Renaming a Canonical Product Term requires: **(a)** an ADR, **(b)**
  updating every dependent Product document, and **(c)** updating traceability.
- **GG-4** — A banned synonym shall **never** become Canonical without explicit
  **constitutional approval** (Owner amendment, GOV-004 §5).

## 4. The glossary

| Canonical term | Meaning | Banned synonyms | Why banned | Source |
|---|---|---|---|---|
| Training Center | the single context all records belong to | company, branch, organization, tenant | imply plurality/organizational structure — violate Scope Singularity (PA-2) | DOM-002 §1 |
| Owner | the sole system user and origin of all records | user, admin, operator (as a role) | imply a role system; the product has no roles (AX-2) | DOM-002 §2; F-02 |
| Teacher (المدرّب) | a party who delivers a program and earns a share | instructor-as-user, staff | imply the teacher operates the product or is an employee-user (AX-3) | DOM-002 §4 |
| Student (الطالب) | the party who receives training and to whom revenue attaches | customer, client, member | import commercial/CRM framing foreign to the domain | DOM-002 §5 |
| Guardian | contact information on a student (esp. minors) | parent-as-payer, payer | conflate standing contact with the per-voucher Payer — two distinct concepts | DR-089 |
| Training Program (Program) | one independent training offering (a single run) | course template, class, catalog item | imply a reusable template; a program is one independent run (PC-003) | DOM-002 §3 |
| Revenue Distribution Policy (Policy) | a program's fixed teacher/center percentage split | commission, pay rate | import a compensation-scheme framing; the policy is a fixed split, not a rate | DOM-002 §6 |
| Registration | a student's enrolment in a program, holding its price and status | enrollment record (as a report), booking | reduce a first-class obligation to a report or a reservation | PC-003; DR-022 |
| Final Registration Price | the single stored amount due for a registration | discounted price, net price | imply a discount computation; no discount concept exists (DR-074) | DR-074 |
| Receipt Voucher (سند قبض) | the permanent record of one program-fee payment | invoice, bill, tax invoice | imply a tax/billing document; vouchers are internal, no tax (ADR-0024) | DOM-002 §7 |
| Payment Voucher (سند صرف) | the permanent record of money paid out | expense receipt, bill payment | conflate the outflow record with billing / accounts-payable concepts | DOM-002 §8 |
| Refund Voucher (سند استرجاع) | the permanent record of a student refund | credit note, reversal invoice | a credit note is a distinct, excluded concept (ADR-0020); imports billing framing | DOM-002 §13 |
| Expense Return (استرداد مصروف) | value returning because of a prior expense | supplier credit, rebate | imply a credit/marketing device rather than cash returning (DR-060) | DOM-002 §15 |
| Non-Program Educational Revenue | center-only, student-linked exam/certificate/book income | miscellaneous income, other revenue | violate the defined-revenue-source rule; no generic income (DR-080) | DOM-002 §15a |
| Expense Category | the named kind an expense belongs to | account, ledger code | import accounting/ledger framing — ERP creep (AP-1) | DOM-002 §14 |
| Cash Balance | all cash currently held | balance, total balance | a bare "balance" merges the three, which are never merged (DR-016; AP-7) | DOM-002 §11a |
| Teacher Payables | money currently owed to teachers (aggregate) | teacher balance (singular), liabilities | collide with the per-program Teacher Balance; import accounting terms | DOM-002 §11b |
| Center Net Balance | the center's own earned share | profit, net income, center balance | import P&L accounting terms and the forbidden merged "center balance" | DOM-002 §11c |
| Teacher Balance | what one teacher is owed for one program | teacher account | imply an account/ledger rather than a derived per-program amount | DOM-002 §12 |
| Teacher Debt | what a teacher owes the center after a refund of paid revenue | negative balance, overpayment | a debt is not a negative balance — balances never go negative (DR-064) | DOM-002 §16 |
| Party Financial Standing | a party's complete, knowable financial position | account statement, statement (as the concept) | name a produced report, not the derived standing (concept ≠ report) | DOM-002 §10; PC-003 |
| Activity Record | the append-only chronological knowledge of every event | audit log, operations (as an entity), event feed | "operations" is a view, not an entity (DR-018); "audit log" is technical framing | DOM-002 §9 |
| Operational Status | the Owner-controlled open/closed (active/ended/inactive) state | workflow state, stage | imply a workflow engine / approval stages; there is no gating (PA-6, NS-8) | DOM-002 §17 |
| Split (teacher share / center share) | the division of a receipt by the program's policy | commission, cut, allocation | "commission/cut" import compensation framing; "allocation" implies an allocation algorithm (LES-012) | DR-005 |
| Outstanding Balance | total entitlement minus total payments, per program | remaining, due-to-teacher | lose the precise per-program derived meaning; ambiguous | DR-034 |

## 5. Global banned terms (cross-cutting)

Never used anywhere in the product, in any concept:

| Banned term | Why | Use instead |
|---|---|---|
| LIFO / FIFO / "allocation algorithm" | no receipt-allocation exists (LES-012) | plain program-level arithmetic |
| "Center Balance" (single merged) | the three balances are never merged (DR-016; AP-7) | Cash Balance / Teacher Payables / Center Net Balance |
| "Draft" (as a status) | saving posts immediately (DR-043; NS-8) | Posted |
| "Discount" | no discount concept (DR-074) | Final Registration Price |
| "Invoice" / "Tax invoice" / VAT | no tax dimension; internal vouchers (DR-090; ADR-0024) | Receipt/Payment/Refund Voucher |
| "Role" / "Permission" / "Login user (2nd)" | single user, no roles (AX-1/AX-2) | Owner |
| "Delete" / "Edit" a posted record | records are permanent (PA-5; AP-3) | Cancel + recreate |
| "Operations" as an entity | it is a view, not an entity (DR-018) | Activity Record |

## 6. Integrity & traceability

- **1:1 with DOM-002:** every DOM-002 concept and PC-003 concept has exactly one
  canonical term here (NR-1).
- **Zero drift:** §5 consolidates every banned term from frozen decisions; Gate 6
  asserts none appears outside this glossary.
- **UI-language explicitly out:** wording, microcopy, tone, and RTL/direction are
  Phase-3 (UX) decisions (ADR-0005 §3); PC-006 fixes only the canonical product
  vocabulary.
- **Effect:** PC-006 is the naming authority every later document, PR, BR, and UX label
  must obey.
