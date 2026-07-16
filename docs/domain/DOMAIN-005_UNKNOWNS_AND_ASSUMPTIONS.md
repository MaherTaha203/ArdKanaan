# DOM-005 — Unknowns & Assumptions

| Field | Value |
|---|---|
| Doc ID | DOM-005 |
| Title | Unknowns & Assumptions |
| Phase | 1A |
| Status | LIVING |
| Version | 1.3.0 |
| Depends on | DOM-001…DOM-004, GOV-007 (AI-10, AI-11), ADR-0007 §4 |
| Referenced by | DOM-001…DOM-004; Phase 1 entry criterion (ADR-0007 §7) |

---

## 1. Purpose

The register of every **missing business fact** discovered during Domain
Discovery. Nothing in this repository may answer these questions by invention
(AI-10, AI-11): each unknown stays open until the **owner** answers it. This
document is LIVING (ADR-0007 §5): when an answer arrives, the unknown is marked
RESOLVED with the owner's answer and date, and the affected frozen documents are
updated by amendment (GOV-004 §5).

**Phase 1 (Product Constitution) cannot FREEZE while any HIGH unknown is open**
(ADR-0007 §7).

## 2. Unknowns — HIGH priority

These block the core money logic. Product Constitution cannot be completed
correctly without the owner's answers.

| ID | Missing fact | Why it matters | Blocks |
|---|---|---|---|
| UNK-001 | **What is an "Operation" (عملية)?** F-05 lists Operations as a core entity but never defines them. Candidate readings for the owner to confirm or reject: (a) any recorded money movement (receipt or payment) viewed as one ledger line; (b) a broader event log including non-money actions; (c) a synonym for vouchers collectively. | A core entity cannot remain undefined; statements likely display "operations". | Entity model, statements (DOM-002 §9, §10) |
| UNK-002 | **RESOLVED (2026-07-16, ADR-0008 D1–D3):** compensation is not percentage-only — five models (percentage of receipt, fixed per student, fixed per program, fixed monthly, custom agreement), extensible; the policy belongs to the program (one per program, one teacher may have many programs each with its own policy); rounding is owned exclusively by the currency definition (exact decimals stored when supported, otherwise official currency rounding). → DR-013, DR-014. Residual precision gap spun off as UNK-024. | The split calculation is the heart of the system (F-07). | resolved |
| UNK-004 | **Partial payments and installments.** Can a student pay a program fee across several payments? Can one payment cover several programs or several students? Is overpayment possible? | Determines what a receipt voucher represents and how program income is tracked. | DR-004, WF-02 |
| UNK-006 | **Refunds.** Do refunds happen in this business? If money is returned after the split was stored (and possibly after the teacher was paid), how does the business handle the teacher's share and the center's share? | Money can flow backwards; DR-006 makes stored splits permanent, so the business's real practice must be captured, not guessed. | WF-07, DR-006, DR-009, DR-010 |
| UNK-007 | **Cancellation and corrections.** Can a wrongly recorded voucher be cancelled or corrected? What mistakes actually occur (wrong amount, wrong program, wrong payer)? What trace must a correction leave? | Every real bookkeeping practice needs a correction path that respects DR-006. | WF-08, WF-09, DR-006 |
| UNK-008 | **Teacher payment mechanics.** How and when are teachers paid what they are owed — on demand, on schedule, in full or partially? Are advances (paying before it is owed) possible, creating negative balances? | Defines the decrease side of teacher balances. | WF-05, DR-009 |
| UNK-009 | **Payment voucher scope and categories.** What kinds of outgoing money exist? Is a teacher payout recorded as a payment voucher? What categories of center expenses exist (rent, supplies, salaries…)? | Defines the payment voucher entity and expense recording. | DR-008, WF-05, WF-06 |
| UNK-020 | **RESOLVED (2026-07-16, ADR-0008 D4–D6):** teacher entitlement begins immediately when a receipt voucher is posted (a teacher receivable is created; entitlement and payment are two different business events). Three balances exist and must never be merged: Cash Balance (all cash held, e.g. 1000), Teacher Payables (owed to teachers, e.g. 700), Center Net Balance (the center's earned share, e.g. 300); every posted receipt automatically increases all three (business ledger, not an accounting journal). → DR-015, DR-016, DR-017. | Determines the exact meaning of the most-read numbers in the system. | resolved |
| UNK-024 | **Per-receipt semantics of non-percentage compensation models.** Under fixed-per-student, fixed-per-program, fixed-monthly, or custom agreements: what teacher share (if any) does each posted receipt store (DR-006), and how/when does the teacher's entitlement accrue for models not tied to receipts (D4 ties entitlement to posting — what does a fixed monthly amount post against)? How do the three ledger effects (DR-017) apply? | The five models (DR-013) must each have exact money semantics before Product Constitution can specify calculations. | DR-013, DR-015, DR-017, WF-02, WF-03 |

## 3. Unknowns — MEDIUM priority

Needed before or during Product Constitution; do not block its start.

| ID | Missing fact | Why it matters | Blocks |
|---|---|---|---|
| UNK-003 | How and when does a program's distribution policy change — renegotiation with the teacher? Does a change need a record of its own? | Policy lifecycle; history of agreements. | DR-003 |
| UNK-005 | Do programs have a set price per student, variable pricing, or discounts? | Whether expected income exists as a concept (vs. only recorded receipts). | DOM-002 §3 |
| UNK-010 | Currency and payment methods — single currency? cash only, or bank/transfer too? | Recording detail on every voucher. | WF-02 |
| UNK-011 | Are students/payers tracked as persons with continuing records, or only as a name on each voucher? F-05's wording "Students (or Payers)" suggests the payer matters more than the student — unconfirmed. | Entity depth; statements per student. | DOM-002 §5 |
| UNK-012 | Is "joining a program" a recorded business event separate from paying? | Whether enrollment exists in the domain at all. | WF-01 |
| UNK-013 | Account statements — for which parties (teacher, center, program, payer?), over which periods, showing what lines? | The main reading surface of the system. | DR-011, WF-10 |
| UNK-014 | Do vouchers carry official sequential numbers (per type? per year?), and must numbering match an existing paper practice? | Continuity with the center's current records. | DOM-002 §7, §8 |
| UNK-015 | Are any center expenses attributed to a specific program or teacher, or are all expenses general? | Expense linkage. | WF-06 |
| UNK-016 | Program lifecycle — do programs have start/end dates, cohorts/batches, capacity? Do they repeat? | Program entity depth. | DOM-002 §3 |
| UNK-019 | What happens when a teacher leaves — their open balance, their running programs? | Teacher lifecycle edge. | DOM-002 §4, WF-04 |

## 4. Unknowns — LOW priority

Can be answered any time before the phase that consumes them.

| ID | Missing fact | Why it matters | Blocks |
|---|---|---|---|
| UNK-017 | Are there any participants besides the owner, teachers, and students/payers (assistant, accountant, partner)? F-02 fixes a single system user; this asks about the business, not the software. | Completeness of the participant model. | DOM-001 §2 |
| UNK-018 | Any revenue besides program payments (registration fees, materials, room rental)? | Revenue completeness. | DOM-001 §4 |
| UNK-021 | Are there ever deductions from a teacher's share (fees, penalties, materials costs)? | Edge of DR-012. | DR-012 |
| UNK-022 | Does existing historical data (past vouchers, current balances) need to be brought into the system at start? | Opening balances at go-live. | future phases |
| UNK-023 | Do receipts/payments carry any tax obligations or official receipt requirements? | Legal/format constraints on vouchers. | DOM-002 §7, §8 |

## 5. Working assumptions (ASM)

Explicitly labeled, **carrying no normative force** (ADR-0007 §4). Each awaits
owner confirmation; on confirmation it becomes a rule via amendment, on rejection
the affected documents are amended instead.

| ID | Assumption | Tied to | Status |
|---|---|---|---|
| ASM-001 | All amounts are in a single currency and positive. | UNK-010 | AWAITING CONFIRMATION |
| ASM-002 | The 1000 → 700/300 example generalizes to proportional (percentage) policies, e.g. 70/30. | UNK-002 | **REJECTED (2026-07-16, ADR-0008 D1):** percentage is only the *most common* of five compensation models |
| ASM-003 | Paying a teacher reduces that teacher's balance by the paid amount. | UNK-008 | AWAITING CONFIRMATION |

## 6. Interview workshop plan (Phase 1A.1)

Unknowns are resolved through focused interview sessions with the owner — one
business area per session, 3–6 questions each, general → specific, never asking a
question that depends on an unanswered one. Sessions are ordered so foundational
areas (how money splits and accrues) come before dependent areas (refunds,
corrections, the meaning of "operations").

| Session | Business area | Unknowns targeted | Status |
|---|---|---|---|
| 1 | Revenue Distribution & Balances | UNK-002, UNK-020 (+ ASM-002) | **COMPLETE** — answers recorded as ADR-0008 (D1–D6); UNK-002/UNK-020 resolved, ASM-002 rejected, UNK-024 opened |
| 1-FU | Session 1 follow-up: per-model money semantics | UNK-024 | **ASKED — awaiting owner answers** |
| 2 | Student Payments & Receipt Vouchers | UNK-004 (+ UNK-010, UNK-011, UNK-012, UNK-014) | pending |
| 3 | Teacher Payments | UNK-008 (+ UNK-019, UNK-021, ASM-003) | pending |
| 4 | Expenses & Payment Vouchers | UNK-009, UNK-015 | pending |
| 5 | Refunds, Cancellations & Corrections | UNK-006, UNK-007 | pending (depends on Sessions 1–3) |
| 6 | Operations & Account Statements | UNK-001, UNK-013 | pending (depends on Sessions 1–4) |
| 7 | Training Programs | UNK-016, UNK-005, UNK-003 | pending |

Each completed session updates: DOM-002, DOM-003, DOM-004, this register (unknowns
marked `RESOLVED (date): answer`), IDX-001 statuses if needed, cross-references,
GOV-009, GOV-008 (if a permanent lesson emerged), and the phase audit trail —
per the Consistency Rule (GOV-001 §6). Answers that remain uncertain keep their
unknown OPEN (AI-11) — nothing is closed by inference.

## 7. Register discipline

1. Unknown IDs are permanent; a resolved unknown is marked
   `RESOLVED (YYYY-MM-DD): <owner's answer>` in place — never deleted (mirrors
   GOV-006 §6).
2. Every resolution triggers the Consistency Rule (GOV-001 §6) across DOM-001…004
   and any later documents.
3. Next available IDs: **UNK-025**, **ASM-004**.
4. Current tally (2026-07-16, post-Session 1): **22 open** (7 HIGH, 10 MEDIUM,
   5 LOW), 2 resolved (UNK-002, UNK-020), 1 assumption rejected (ASM-002),
   2 assumptions awaiting confirmation (ASM-001, ASM-003).
