# DOM-005 — Unknowns & Assumptions

| Field | Value |
|---|---|
| Doc ID | DOM-005 |
| Title | Unknowns & Assumptions |
| Phase | 1A |
| Status | LIVING |
| Version | 1.12.0 |
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
| UNK-025 | **RESOLVED (2026-07-17, ADR-0014 D1):** the teacher share is rounded to the **nearest whole shekel**; any rounding difference automatically belongs to the center; the two shares always sum to exactly the full voucher amount (1001 × 70% → teacher 701 / center 300; teacher at 30% → teacher 300 / center 701). → DR-028. Exact-half (.5) direction parked as ASM-004. | The exact calculation rule of every split. | resolved |
| UNK-026 | **Teacher debt from refunds — calculation and management** (restructured by ADR-0017 from the cancelled composite form). Is the debt (DR-039) tracked per Teacher × Program or per teacher? May settlement-by-deduction cross programs, given program isolation (DR-031)? How is an immediate repayment or a deduction settlement recorded? | Blocks the exact debt-management spec of refunds. | DR-039, WF-07 |
| UNK-027 | **Entitlement recalculation and rounding rules after refunds** (split from UNK-026 by ADR-0017 — genuinely unresolved). What is the exact formula for net teacher entitlement after a refund, and how does it interact with nearest-shekel rounding (DR-028)? | Blocks the exact calculation spec of refunds. | DR-038, WF-07 |
| UNK-007 | **Cancellation and corrections.** Can a wrongly recorded voucher be cancelled or corrected? What mistakes actually occur (wrong amount, wrong program, wrong payer)? What trace must a correction leave? *Session 2 signal (ADR-0010): the owner's activity-event examples include "Receipt Voucher edited" and "Receipt Voucher cancelled", and corrections must generate new operations (DR-019) — so these events exist; their money mechanics remain open.* | Every real bookkeeping practice needs a correction path that respects DR-006. | WF-08, WF-09, DR-006, DR-019 |
| UNK-008 | **RESOLVED (2026-07-17, ADR-0015 S4-D1…D7, D10, D11):** payments are owner-initiated only, on the date the center-teacher agreement dictates — never automatic; recorded as a Payment Voucher belonging to exactly one program; partial payments allowed up to the program's outstanding balance; advances forbidden (no negative balances); every Teacher × Program is an independent balance settled per program with Outstanding = Total Entitlement − Total Payments, no FIFO/LIFO allocation; payment history permanent. → DR-029…DR-035; WF-04/WF-05 now ESTABLISHED. | Defines the decrease side of teacher balances. | resolved |
| UNK-009 | **Payment voucher categories for center expenses.** What categories of center expenses exist (rent, supplies, salaries…), and do expense payment vouchers attach to a program or stand alone? *Session 4 signals (ADR-0015): teacher payouts ARE Payment Vouchers, one program each (S4-D2/S4-D5) — that part is resolved; S4-D5's program-scope statement is not extended to expense vouchers (ADR-0015 interpretation boundary).* | Defines expense recording. | DR-008, WF-06 |
| UNK-020 | **RESOLVED (2026-07-16, ADR-0008 D4–D6):** teacher entitlement begins immediately when a receipt voucher is posted (a teacher receivable is created; entitlement and payment are two different business events). Three balances exist and must never be merged: Cash Balance (all cash held, e.g. 1000), Teacher Payables (owed to teachers, e.g. 700), Center Net Balance (the center's earned share, e.g. 300); every posted receipt automatically increases all three (business ledger, not an accounting journal). → DR-015, DR-016, DR-017. | Determines the exact meaning of the most-read numbers in the system. | resolved |
| UNK-024 | **RESOLVED (2026-07-16, ADR-0009 — closed by V1 scope reduction, not by answers):** this unknown existed solely for the non-percentage compensation models, which the owner postponed out of Version 1. V1's only model (percentage of posted receipts, DR-013 v2) has fully defined money semantics. The per-model questions are archived in DOM-004 §Future considerations for any future version that reintroduces those models. Interview session 1-FU withdrawn. | The five models needed exact money semantics — no longer applicable in V1. | resolved |

## 3. Unknowns — MEDIUM priority

Needed before or during Product Constitution; do not block its start.

| ID | Missing fact | Why it matters | Blocks |
|---|---|---|---|
| UNK-003 | How and when does a program's distribution policy change — renegotiation with the teacher? Does a change need a record of its own? *Session 2 signal (ADR-0010): "Distribution policy changed" appears among the owner's activity-event examples — policy changes exist and are logged on the timeline; the change procedure remains open.* | Policy lifecycle; history of agreements. | DR-003, DR-018 |
| UNK-005 | Do programs have a set price per student, variable pricing, or discounts? *Session 3 signal (ADR-0013): overpayment prevention (DR-024) presupposes a defined "amount due" per student per program — such an amount must exist; its structure remains open.* | Whether expected income exists as a concept; required by DR-024. | DOM-002 §3, DR-024 |
| UNK-006 | **REDUCED (2026-07-17, ADR-0016) — money mechanics resolved (→ DR-036…DR-042); downgraded HIGH → MEDIUM.** Remaining business practice questions: when is a student *entitled* to a refund (withdrawal timing, center cancellation, other reasons)? Is the amount full/partial and how is it determined — or is it pure Owner discretion entered on the Refund Voucher? Who approves, and does the student sign/receive anything? Does the registration end or continue after a refund? | Owner practice around refunds; the voucher takes amount + reason as inputs (S5-D7), so these do not block the calculation spec. | WF-07 (conditions), DOM-002 §13 |
| UNK-010 | **RESOLVED (2026-07-17, ADR-0013 S3-D4):** base currency is the Shekel; decimals are not used — all operations in whole numbers. Methods: cash and bank transfer; exactly one method per voucher, mixing forbidden. → DR-025. | Recording detail on every voucher. | resolved |
| UNK-011 | **RESOLVED (2026-07-17, ADR-0013 S3-D1):** the Student is an independent core entity — receipts, statements, and program registrations belong to the student. The payer is an optional Payer Name field on the voucher (>95% of cases: payer = student or irrelevant), not an entity in V1. → DR-021. | Entity depth; statements per student. | resolved |
| UNK-012 | **RESOLVED (2026-07-17, ADR-0013 S3-D2):** yes — registration is an independent recorded event; a student may register without paying, pay later, or withdraw before paying. Registration → Payment. → DR-022; WF-01 now ESTABLISHED. | Whether enrollment exists in the domain. | resolved |
| UNK-013 | Account statements — over which periods, showing what lines, and for which parties beyond the student? *Session 3 signal (ADR-0013 S3-D1): student statements confirmed. Session 4 signal (ADR-0015 S4-D9): a full teacher entitlement breakdown is a required reading surface — receipt voucher, student, program, amount, percentage, teacher share (DR-035).* | The main reading surface of the system. | DR-011, DR-035, WF-10 |
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
| UNK-021 | Are there ever deductions from a teacher's share (fees, penalties, materials costs)? **Intentionally postponed by Owner order (ADR-0015 S4-D8): no deduction model may be invented; this stays open until the Owner explicitly authorizes it.** *Session 5 note (ADR-0016 S5-D4): refund-debt settlement by deduction from future entitlements is a separate, Owner-decided mechanism (DR-039) — it does not resolve or preempt this general topic.* | Edge of DR-012. | DR-012, DR-039 |
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
| ASM-003 | Paying a teacher reduces that teacher's balance by the paid amount. | UNK-008 | **CONFIRMED (2026-07-17, ADR-0015 S4-D11):** per Teacher × Program — Outstanding = Total Entitlement − Total Payments (DR-034) |
| ASM-004 | "Nearest whole shekel" (DR-028) rounds an exact half (.5) up, toward the teacher — standard commercial rounding. Only reachable by percentages that can produce halves (e.g. 50% of an odd amount); impossible for 70/30. | DR-028 | AWAITING CONFIRMATION |

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
| 4 | Teacher Payments | UNK-008 (+ UNK-019, UNK-021, ASM-003) | **COMPLETE** — closed by direct Owner Engineering Order, recorded as ADR-0015 (S4-D1…D11); UNK-008 resolved, ASM-003 confirmed, UNK-021 explicitly postponed (S4-D8), UNK-019 untouched |
| 5 | Student Refunds — conducted per Owner order (2026-07-17) | UNK-006 | **COMPLETE** — recorded as ADR-0016 (S5-D1…D7); UNK-006 reduced & downgraded to MEDIUM; register restructured by ADR-0017 (UNK-026 refocused on teacher debt, UNK-027 split out, refund-voucher numbering removed as a deferred design decision) |
| 6 | Expenses & Payment Vouchers | UNK-009, UNK-015 | pending |
| 6a | Cancellations & Corrections | UNK-007 | pending |
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
3. Next available IDs: **UNK-028**, **ASM-005**.
4. Current tally (2026-07-17, post-ADR-0017 restructure): **16 open** (4 HIGH:
   UNK-007, UNK-009, UNK-026, UNK-027; 7 MEDIUM incl. reduced UNK-006; 5 LOW),
   11 resolved (UNK-001, UNK-002, UNK-004, UNK-008, UNK-010, UNK-011, UNK-012,
   UNK-014, UNK-020, UNK-025 answered; UNK-024 mooted by scope), 1 assumption
   rejected (ASM-002), 2 confirmed (ASM-001, ASM-003), 1 awaiting confirmation
   (ASM-004). Refund-voucher numbering is NOT tracked here — deferred design
   decision per ADR-0017 §2.
