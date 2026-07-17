# DOM-005 — Unknowns & Assumptions

| Field | Value |
|---|---|
| Doc ID | DOM-005 |
| Title | Unknowns & Assumptions |
| Phase | 1A |
| Status | LIVING |
| Version | 1.8.0 |
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
| UNK-001 | **RESOLVED (2026-07-16, ADR-0010):** Operations is **not a business entity** — it is a **chronological system activity timeline** (activity log) of everything that happened, presented business-friendly: newest first, searchable, each row self-explanatory. It records events (vouchers created/edited/cancelled, teacher payments, program/policy changes, settings, backup/restore) but creates no business logic (rules stay with the originating entity); every operation belongs to a source and never exists alone; some have financial impact, some don't; the timeline is append-only — corrections generate new operations, history never disappears. Candidate reading (b) was closest. → DR-018, DR-019, DR-020; DOM-002 §9 reclassified. | A core term cannot remain undefined. | resolved |
| UNK-002 | **RESOLVED (2026-07-16, ADR-0008 D1–D3; V1 scope reduced by ADR-0009):** the policy belongs to the program (one per program, one teacher may have many programs each with its own policy); rounding is owned exclusively by the currency definition (exact decimals stored when supported, otherwise official currency rounding). Session 1 initially opened five compensation models; the owner's V1 scope decision (ADR-0009) then fixed **percentage-of-posted-receipts as the ONLY V1 model** (teacher % + center % = 100%), postponing the rest as Future Considerations (→ DOM-004). → DR-013 v2, DR-014. | The split calculation is the heart of the system (F-07). | resolved |
| UNK-004 | **RESOLVED (2026-07-17, ADR-0013 S3-D3):** installments allowed — each payment is its own receipt voucher with its own number and date, split immediately at posting by the program's percentage. One voucher = one student + one program + one payment, never more. Overpayment does not exist — the system prevents amounts larger than what is due. → DR-023, DR-024. | Determines what a receipt voucher represents. | resolved |
| UNK-025 | **Integer rounding of fractional percentage splits.** All amounts are whole Shekels (DR-025), and receipts are split by percentage (DR-013). When the split of a whole amount is fractional (e.g. 70% of 1001 = 700.7, or 70% of 15 = 10.5): in which direction is the teacher share rounded, and who receives the remainder — teacher or center? | The exact calculation rule of every split; blocks the calculation spec of Product/Business Constitution. | DR-005, DR-013, DR-014, DR-025, WF-03 |
| UNK-006 | **Refunds.** Do refunds happen in this business? If money is returned after the split was stored (and possibly after the teacher was paid), how does the business handle the teacher's share and the center's share? | Money can flow backwards; DR-006 makes stored splits permanent, so the business's real practice must be captured, not guessed. | WF-07, DR-006, DR-009, DR-010 |
| UNK-007 | **Cancellation and corrections.** Can a wrongly recorded voucher be cancelled or corrected? What mistakes actually occur (wrong amount, wrong program, wrong payer)? What trace must a correction leave? *Session 2 signal (ADR-0010): the owner's activity-event examples include "Receipt Voucher edited" and "Receipt Voucher cancelled", and corrections must generate new operations (DR-019) — so these events exist; their money mechanics remain open.* | Every real bookkeeping practice needs a correction path that respects DR-006. | WF-08, WF-09, DR-006, DR-019 |
| UNK-008 | **Teacher payment mechanics.** How and when are teachers paid what they are owed — on demand, on schedule, in full or partially? Are advances (paying before it is owed) possible, creating negative balances? | Defines the decrease side of teacher balances. | WF-05, DR-009 |
| UNK-009 | **Payment voucher scope and categories.** What kinds of outgoing money exist? Is a teacher payout recorded as a payment voucher? What categories of center expenses exist (rent, supplies, salaries…)? | Defines the payment voucher entity and expense recording. | DR-008, WF-05, WF-06 |
| UNK-020 | **RESOLVED (2026-07-16, ADR-0008 D4–D6):** teacher entitlement begins immediately when a receipt voucher is posted (a teacher receivable is created; entitlement and payment are two different business events). Three balances exist and must never be merged: Cash Balance (all cash held, e.g. 1000), Teacher Payables (owed to teachers, e.g. 700), Center Net Balance (the center's earned share, e.g. 300); every posted receipt automatically increases all three (business ledger, not an accounting journal). → DR-015, DR-016, DR-017. | Determines the exact meaning of the most-read numbers in the system. | resolved |
| UNK-024 | **RESOLVED (2026-07-16, ADR-0009 — closed by V1 scope reduction, not by answers):** this unknown existed solely for the non-percentage compensation models, which the owner postponed out of Version 1. V1's only model (percentage of posted receipts, DR-013 v2) has fully defined money semantics. The per-model questions are archived in DOM-004 §Future considerations for any future version that reintroduces those models. Interview session 1-FU withdrawn. | The five models needed exact money semantics — no longer applicable in V1. | resolved |

## 3. Unknowns — MEDIUM priority

Needed before or during Product Constitution; do not block its start.

| ID | Missing fact | Why it matters | Blocks |
|---|---|---|---|
| UNK-003 | How and when does a program's distribution policy change — renegotiation with the teacher? Does a change need a record of its own? *Session 2 signal (ADR-0010): "Distribution policy changed" appears among the owner's activity-event examples — policy changes exist and are logged on the timeline; the change procedure remains open.* | Policy lifecycle; history of agreements. | DR-003, DR-018 |
| UNK-005 | Do programs have a set price per student, variable pricing, or discounts? *Session 3 signal (ADR-0013): overpayment prevention (DR-024) presupposes a defined "amount due" per student per program — such an amount must exist; its structure remains open.* | Whether expected income exists as a concept; required by DR-024. | DOM-002 §3, DR-024 |
| UNK-010 | **RESOLVED (2026-07-17, ADR-0013 S3-D4):** base currency is the Shekel; decimals are not used — all operations in whole numbers. Methods: cash and bank transfer; exactly one method per voucher, mixing forbidden. → DR-025. | Recording detail on every voucher. | resolved |
| UNK-011 | **RESOLVED (2026-07-17, ADR-0013 S3-D1):** the Student is an independent core entity — receipts, statements, and program registrations belong to the student. The payer is an optional Payer Name field on the voucher (>95% of cases: payer = student or irrelevant), not an entity in V1. → DR-021. | Entity depth; statements per student. | resolved |
| UNK-012 | **RESOLVED (2026-07-17, ADR-0013 S3-D2):** yes — registration is an independent recorded event; a student may register without paying, pay later, or withdraw before paying. Registration → Payment. → DR-022; WF-01 now ESTABLISHED. | Whether enrollment exists in the domain. | resolved |
| UNK-013 | Account statements — over which periods, showing what lines, and for which parties beyond the student? *Session 3 signal (ADR-0013 S3-D1): the account statement belongs to the Student — student statements confirmed; teacher/center statement scope still open.* | The main reading surface of the system. | DR-011, WF-10 |
| UNK-014 | **RESOLVED (2026-07-17, ADR-0013 S3-D5):** receipt and payment vouchers have independent continuous sequences; numbering never resets yearly; the system starts each sequence from an Owner-specified number at go-live to align with the paper vouchers. → DR-026. | Continuity with current records. | resolved |
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
| UNK-022 | Does existing historical data (past vouchers, current balances) need to be brought into the system at start? *Session 3 signal (ADR-0013 S3-D5): voucher numbering continues from the paper sequences at go-live — continuity matters; whether records themselves are imported is still open.* | Opening balances at go-live. | future phases, DR-026 |
| UNK-023 | Do receipts/payments carry any tax obligations or official receipt requirements? | Legal/format constraints on vouchers. | DOM-002 §7, §8 |

## 5. Working assumptions (ASM)

Explicitly labeled, **carrying no normative force** (ADR-0007 §4). Each awaits
owner confirmation; on confirmation it becomes a rule via amendment, on rejection
the affected documents are amended instead.

| ID | Assumption | Tied to | Status |
|---|---|---|---|
| ASM-001 | All amounts are in a single currency and positive. | UNK-010 | **CONFIRMED (2026-07-17, ADR-0013 S3-D4):** single currency (Shekel), whole positive numbers → DR-025 |
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
| 1-FU | Session 1 follow-up: per-model money semantics | UNK-024 | **WITHDRAWN** — mooted by the V1 percentage-only scope decision (ADR-0009) |
| 2 | Operations (العمليات) — moved to front by owner instruction (2026-07-16) | UNK-001 | **COMPLETE** — answered and recorded as ADR-0010; UNK-001 resolved; signals logged on UNK-003/UNK-007 |
| 3 | Student Payments & Receipt Vouchers | UNK-004 (+ UNK-010, UNK-011, UNK-012, UNK-014) | **COMPLETE** — answers recorded as ADR-0013 (S3-D1…S3-D6); 5 unknowns resolved, ASM-001 confirmed, UNK-025 opened, signals on UNK-005/013/022 |
| 4 | Teacher Payments | UNK-008 (+ UNK-019, UNK-021, ASM-003) | pending |
| 5 | Expenses & Payment Vouchers | UNK-009, UNK-015 | pending |
| 6 | Refunds, Cancellations & Corrections | UNK-006, UNK-007 | pending (depends on Sessions 1, 3, 4) |
| 7 | Account Statements | UNK-013 | pending (depends on Sessions 2–5) |
| 8 | Training Programs | UNK-016, UNK-005, UNK-003 | pending |

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
3. Next available IDs: **UNK-026**, **ASM-004**.
4. Current tally (2026-07-17, post-Session 3): **16 open** (5 HIGH: UNK-006,
   UNK-007, UNK-008, UNK-009, UNK-025; 6 MEDIUM; 5 LOW), 9 resolved (UNK-001,
   UNK-002, UNK-004, UNK-010, UNK-011, UNK-012, UNK-014, UNK-020 answered;
   UNK-024 mooted by scope), 1 assumption rejected (ASM-002), 1 confirmed
   (ASM-001), 1 awaiting confirmation (ASM-003).
