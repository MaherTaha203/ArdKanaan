# DOM-005 — Unknowns & Assumptions

| Field | Value |
|---|---|
| Doc ID | DOM-005 |
| Title | Unknowns & Assumptions |
| Phase | 1A |
| Status | LIVING |
| Version | 1.19.0 |
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
| UNK-026 | **RESOLVED (2026-07-18, ADR-0021 S9-D4…D9):** a teacher debt exists **only when** the total already paid to the teacher for a program exceeds their final entitlement after all refund recalculations (the excess is the debt); tracked **per Teacher × Program**, never merged or offset across programs; settled by direct repayment OR same-program future-entitlement deduction (or a mix), always the Owner's case-by-case choice and never automatic — cross-program deduction is forbidden; it is a settleable balance that only decreases, never goes negative, and closes at zero; it has no expiry; and where a program has no future entitlement, only direct repayment can clear it. The settlement record is a deferred design decision, not a domain unknown. → DR-065…DR-070; WF-12; DOM-002 §16. | Blocks the exact debt-management spec of refunds. | resolved |
| UNK-027 | **RESOLVED (2026-07-18, ADR-0021 S9-D1…D3):** after a refund the teacher's entitlement is reduced by the **same original program percentage** on the refunded amount (percentage constant and cumulative per Teacher × Program, not tied to a receipt); the reduction is rounded to the nearest whole shekel with the remainder to the center, teacher and center reductions summing exactly to the refunded amount (DR-028); while unpaid, entitlement floors at zero and never displays negative — a would-be negative is the signal of a teacher debt (UNK-026). → DR-062, DR-063, DR-064. | Blocks the exact calculation spec of refunds. | resolved |
| UNK-007 | **RESOLVED (2026-07-17, ADR-0018 S6-D1…D7):** every financial document is Posted immediately on save (no Draft stage in V1) and is thereafter immutable — never edited, never deleted. A financial error is fixed by cancellation (a "Cancelled" status on the original that reverses all effects automatically and stays visible, with mandatory date/reason/actor) followed by recreating the correct document; a document cannot be cancelled while later documents depend on it (remove dependents newest → original; no automatic debts). Descriptive (non-financial) fields may be edited in place with full change logging (old → new value). → DR-043…DR-048; WF-08/WF-09 now ESTABLISHED. | Every real bookkeeping practice needs a correction path that respects DR-006. | resolved |
| UNK-008 | **RESOLVED (2026-07-17, ADR-0015 S4-D1…D7, D10, D11):** payments are owner-initiated only, on the date the center-teacher agreement dictates — never automatic; recorded as a Payment Voucher belonging to exactly one program; partial payments allowed up to the program's outstanding balance; advances forbidden (no negative balances); every Teacher × Program is an independent balance settled per program with Outstanding = Total Entitlement − Total Payments, with no receipt-allocation algorithm; payment history permanent. → DR-029…DR-035; WF-04/WF-05 now ESTABLISHED. | Defines the decrease side of teacher balances. | resolved |
| UNK-009 | **RESOLVED (2026-07-17, ADR-0019 S7-D1…D6):** a center expense is money paid to operate the center that does not settle a pre-existing right (teacher payments and refunds are not expenses); recorded as a center-borne Payment Voucher under exactly one **Expense Category** from an owner-expandable list; reduces Cash Balance and Center Net Balance, never a teacher; recorded only when cash actually leaves, from center money; no approval; furniture/equipment recorded as ordinary expenses (no fixed-asset distinction in V1). Expense vouchers **stand alone** (general center scope) — program/proportional allocation postponed. → DR-049…DR-054. | Defines expense recording. | resolved |
| UNK-020 | **RESOLVED (2026-07-16, ADR-0008 D4–D6):** teacher entitlement begins immediately when a receipt voucher is posted (a teacher receivable is created; entitlement and payment are two different business events). Three balances exist and must never be merged: Cash Balance (all cash held, e.g. 1000), Teacher Payables (owed to teachers, e.g. 700), Center Net Balance (the center's earned share, e.g. 300); every posted receipt automatically increases all three (business ledger, not an accounting journal). → DR-015, DR-016, DR-017. | Determines the exact meaning of the most-read numbers in the system. | resolved |
| UNK-024 | **RESOLVED (2026-07-16, ADR-0009 — closed by V1 scope reduction, not by answers):** this unknown existed solely for the non-percentage compensation models, which the owner postponed out of Version 1. V1's only model (percentage of posted receipts, DR-013 v2) has fully defined money semantics. The per-model questions are archived in DOM-004 §Future considerations for any future version that reintroduces those models. Interview session 1-FU withdrawn. | The five models needed exact money semantics — no longer applicable in V1. | resolved |

## 3. Unknowns — MEDIUM priority

Needed before or during Product Constitution; do not block its start.

| ID | Missing fact | Why it matters | Blocks |
|---|---|---|---|
| UNK-003 | **RESOLVED (2026-07-18, ADR-0022 S10-D8):** a program's distribution percentage is **fixed for the program's whole life** and never changes in place; a renegotiated agreement is realized by creating a **new Program (run)** with the new percentage, while past receipts keep their applied split (F-07, DR-006). There is no in-program policy-change procedure or separate policy-change record in V1. → DR-076. | Policy lifecycle; history of agreements. | resolved |
| UNK-005 | **RESOLVED (2026-07-18, ADR-0022 S10-D4…D7):** each Program (run) carries one **base price** (DR-072); a registration inherits it as its default and the Owner may **override** it for that registration only (DR-073); the amount due is a **single stored Final Registration Price** — there is **no discount concept**, and it is not derived from base − discount (DR-074); it is editable until the first receipt and **locked** thereafter (DR-075). This Final Registration Price is the "amount due" DR-024 checks against. | Whether expected income exists as a concept; required by DR-024. | resolved |
| UNK-006 | **RESOLVED (2026-07-18, ADR-0023 S11-D6…D8):** the remaining domain portion — the refund/registration relationship — is decided: a refund affects only the financial side and **never** changes registration status automatically (DR-085); a registration carries an Owner-controlled **Active / Ended-Withdrawn** status (Ended blocks new receipts, preserves history, still allows refunds on prior receipts — DR-086) that is **reversible** by reactivation with the Final Registration Price preserved (DR-087). The residual items (when a student is *entitled* to a refund, full/partial amount determination, approval, signing) are confirmed **Owner administrative practice with no system rule** — amount is a free input (S5-D7); a single operator needs no approval (S7-D6). → DR-085, DR-086, DR-087. | Owner practice around refunds; the voucher takes amount + reason as inputs (S5-D7). | resolved |
| UNK-010 | **RESOLVED (2026-07-17, ADR-0013 S3-D4):** base currency is the Shekel; decimals are not used — all operations in whole numbers. Methods: cash and bank transfer; exactly one method per voucher, mixing forbidden. → DR-025. | Recording detail on every voucher. | resolved |
| UNK-011 | **RESOLVED (2026-07-17, ADR-0013 S3-D1):** the Student is an independent core entity — receipts, statements, and program registrations belong to the student. The payer is an optional Payer Name field on the voucher (>95% of cases: payer = student or irrelevant), not an entity in V1. → DR-021. | Entity depth; statements per student. | resolved |
| UNK-012 | **RESOLVED (2026-07-17, ADR-0013 S3-D2):** yes — registration is an independent recorded event; a student may register without paying, pay later, or withdraw before paying. Registration → Payment. → DR-022; WF-01 now ESTABLISHED. | Whether enrollment exists in the domain. | resolved |
| UNK-013 | Account statements — over which periods, showing what lines, and for which parties beyond the student? *Session 3 signal (ADR-0013 S3-D1): student statements confirmed. Session 4 signal (ADR-0015 S4-D9): a full teacher entitlement breakdown is a required reading surface — receipt voucher, student, program, amount, percentage, teacher share (DR-035).* | The main reading surface of the system. | DR-011, DR-035, WF-10 |
| UNK-014 | **RESOLVED (2026-07-17, ADR-0013 S3-D5):** receipt and payment vouchers have independent continuous sequences; numbering never resets yearly; the system starts each sequence from an Owner-specified number at go-live to align with the paper vouchers. → DR-026. | Continuity with current records. | resolved |
| UNK-015 | **RESOLVED (2026-07-17, ADR-0019 S7-D4):** in V1 all expenses are general and center-borne — no expense is attributed to a specific program or teacher. Program-account / proportional allocation was discussed and postponed (Future Consideration; would deduct from teachers, UNK-021). → DR-052. | Expense linkage. | resolved |
| UNK-028 | **RESOLVED (2026-07-17, ADR-0020 S8-D1…D9):** an expense return is a financial value returning because of one prior expense; it reduces/reverses that expense, never new income; partial and multiple returns allowed, bounded by the original amount; one return ↔ one expense (lump sums split at entry); the original must be Posted and non-cancelled; V1 realizes it by **actual cash returning** (credit notes and goods replacement excluded → future); no time limit. Recorded as an **Expense Return** (§DOM-002 §15); Cash and Center Net both rise. → DR-055…DR-061; WF-11 ESTABLISHED. | Reverse side of the expense model. | resolved |
| UNK-016 | **RESOLVED (2026-07-18, ADR-0022 S10-D1/D9…D14):** in V1 a **Program is a single run (offering)** with its own financial identity; a same-named service repeats as **new, independent programs** (DR-071). A program has documentary **start/end dates** that drive no automatic behavior (DR-077) and an Owner-controlled **Open/Closed** status governing new business, reversible by reopening (DR-078, DR-079). **No capacity** and **no internal cohorts** in V1 (each batch is its own program) — both explicit Future Considerations; any number of programs, incl. same-named, may run concurrently. → DR-071, DR-077, DR-078, DR-079. | Program entity depth. | resolved |
| UNK-019 | **RESOLVED (2026-07-18, ADR-0023 S11-D4/D5):** a teacher carries an Owner-controlled **Active / Inactive-Left** status; going Inactive-Left blocks **only new program assignment** and has **no** automatic financial or historical effect — all prior programs, vouchers, entitlements, payments, balances, debts, and history persist. All operations on existing balances (payouts, refunds with entitlement recalculation, debt create/settle, reporting) remain available until obligations are settled; the status never freezes balances or closes the financial account. → DR-083, DR-084. | Teacher lifecycle edge. | resolved |
| UNK-029 | **Refundability of non-program educational revenue.** Can an exam fee, certificate fee, or book/material sale be refunded in V1, and if so how is it recorded (reversal of center revenue only, no teacher effect)? Opened by ADR-0023 (S11-D1…D3) — the refund model (DR-036…DR-042, DR-062…DR-070) is built around program-revenue reversal and teacher entitlement; its applicability to center-only revenue is unresolved. | Completeness of the non-program revenue model. | DR-080, DR-081, WF-14 |
| UNK-030 | **Amount-due & overpayment handling for non-program educational revenue.** Do exam / certificate / book charges have a defined amount and overpayment prevention like a registration's Final Registration Price (DR-024/DR-074), or are they free-entered amounts with no due-amount concept? Opened by ADR-0023 (S11-D1). | Consistency of the amount-due model across revenue types. | DR-080, DR-082, WF-14 |

## 4. Unknowns — LOW priority

Can be answered any time before the phase that consumes them.

| ID | Missing fact | Why it matters | Blocks |
|---|---|---|---|
| UNK-017 | **RESOLVED (2026-07-18, ADR-0024 S12-D1…D3):** the only additional participant is the **Guardian/Parent** — student-level administrative contact data (name, relationship, phone, contact means), distinct from the per-voucher Payer Name, and never a system user or financial entity (DR-089). No employees, accountant, secretary, or partner exist; the **Owner remains the sole system user** (F-02). → DR-089. | Completeness of the participant model. | resolved |
| UNK-018 | **RESOLVED (2026-07-18, ADR-0023 S11-D1…D3):** V1 also earns **exam fees, certificate-issuance fees, and book/material sales** — each charged separately, **entirely center revenue** (no teacher share — DR-081), **always tied to a student** with an optional program link (DR-082), and every receipt names a defined revenue source (DR-080). **Room rental, consulting, and other services are out of scope.** → DR-080, DR-081, DR-082. | Revenue completeness. | resolved |
| UNK-021 | Are there ever deductions from a teacher's share (fees, penalties, materials costs)? **Intentionally postponed by Owner order (ADR-0015 S4-D8): no deduction model may be invented; this stays open until the Owner explicitly authorizes it.** *Session 5 note (ADR-0016 S5-D4), detailed in Session 9 (ADR-0021 S9-D6 → DR-068): refund-debt settlement by same-program deduction is a separate, Owner-decided mechanism (DR-039, DR-068) — it does not resolve or preempt this general topic.* | Edge of DR-012. | DR-012, DR-039 |
| UNK-022 | Does existing historical data (past vouchers, current balances) need to be brought into the system at start? *Session 3 signal (ADR-0013 S3-D5): voucher numbering continues from the paper sequences at go-live — continuity matters; whether records themselves are imported is still open.* | Opening balances at go-live. | future phases, DR-026 |
| UNK-023 | **RESOLVED (2026-07-18, ADR-0024 S12-D4/D5):** V1 has **no tax dimension** — no VAT, tax computation, tax reports, or tax invoices (out of scope); vouchers are the center's **internal** records. The only regulatory requirement is **official, sequential, unique, non-duplicated numbering per financial voucher type**, preserved for audit (generalizes DR-026). → DR-090. | Legal/format constraints on vouchers. | resolved |

## 5. Working assumptions (ASM)

Explicitly labeled, **carrying no normative force** (ADR-0007 §4). Each awaits
owner confirmation; on confirmation it becomes a rule via amendment, on rejection
the affected documents are amended instead.

| ID | Assumption | Tied to | Status |
|---|---|---|---|
| ASM-001 | All amounts are in a single currency and positive. | UNK-010 | **CONFIRMED (2026-07-17, ADR-0013 S3-D4):** single currency (Shekel), whole positive numbers → DR-025 |
| ASM-002 | The 1000 → 700/300 example generalizes to proportional (percentage) policies, e.g. 70/30. | UNK-002 | **REJECTED (2026-07-16, ADR-0008 D1):** percentage is only the *most common* of five compensation models |
| ASM-003 | Paying a teacher reduces that teacher's balance by the paid amount. | UNK-008 | **CONFIRMED (2026-07-17, ADR-0015 S4-D11):** per Teacher × Program — Outstanding = Total Entitlement − Total Payments (DR-034) |
| ASM-004 | "Nearest whole shekel" (DR-028) rounds an exact half (.5) up, toward the teacher — standard commercial rounding. Only reachable by percentages that can produce halves (e.g. 50% of an odd amount); impossible for 70/30. | DR-028 | **CONFIRMED (2026-07-18, ADR-0024 S12-D6):** round-half-up — teacher's exact-half share rounds up, difference to center, shares sum to the voucher; now stated in DR-028 |

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
| 7 (Expenses) | Expense Categories — conducted per Owner order (2026-07-17) | UNK-009, UNK-015 | **COMPLETE** — recorded as ADR-0019 (S7-D1…D6); UNK-009 & UNK-015 CLOSED; UNK-028 registered (money returning after an expense) |
| 8 (Expense Returns) | Money Returning to the Center After an Expense — conducted per Owner order (2026-07-17) | UNK-028 | **COMPLETE** — recorded as ADR-0020 (S8-D1…D9); UNK-028 CLOSED; Expense Return entity + WF-11 added |
| 9 | Refund Effects on Teacher Entitlement & Debt — conducted per Owner order (2026-07-18) | UNK-027, UNK-026 | **COMPLETE** — recorded as ADR-0021 (S9-D1…D10); UNK-026 & UNK-027 CLOSED (the last two HIGH unknowns); DR-062…DR-070 added; Teacher Debt concept (DOM-002 §16) + WF-12 added |
| 10 | Program Definition, Pricing & Distribution Policy — conducted per Owner order (2026-07-18) | UNK-005, UNK-016, UNK-003 | **COMPLETE** — recorded as ADR-0022 (S10-D1…D14); UNK-003, UNK-005 & UNK-016 CLOSED; DR-071…DR-079 added; Program refined as a single run (entity name kept); WF-13 added; capacity & cohorts → Future Considerations |
| 11 | Business Boundary & Operational Completeness — conducted per Owner order (2026-07-18) | UNK-018, UNK-019, UNK-006 | **COMPLETE** — recorded as ADR-0023 (S11-D1…D9); UNK-006, UNK-018 & UNK-019 CLOSED; DR-080…DR-088 added; non-program center-only revenue, teacher/registration lifecycle + shared status pattern; WF-14/15/16 added; UNK-029 & UNK-030 opened |
| 12 | Final Boundary Confirmations — conducted per Owner order (2026-07-18) | UNK-017, UNK-023, ASM-004 | **COMPLETE** — recorded as ADR-0024 (S12-D1…D6); UNK-017 & UNK-023 CLOSED; ASM-004 CONFIRMED (last pending assumption); DR-089 (Guardian) & DR-090 (numbering) added; DR-028 amended (round-half-up) |
| 6 (Corrections) | Corrections & Cancellations — conducted per Owner order (2026-07-17) | UNK-007 | **COMPLETE** — recorded as ADR-0018 (S6-D1…D7); UNK-007 CLOSED; Draft stage recorded as a Future Consideration |
| 7 | Account Statements | UNK-013 | pending (depends on Sessions 2–5) |
| 8 | Training Programs | UNK-016, UNK-005, UNK-003 | **COMPLETE** — conducted as Session 10 (ADR-0022); all three CLOSED |

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
3. Next available IDs: **UNK-031**, **ASM-005**. (Unchanged — Session 12 opened no
   new unknowns and confirmed ASM-004 rather than adding an assumption.)
4. Current tally (2026-07-18, post-Session 12): **5 open** (**0 HIGH**; 3 MEDIUM:
   UNK-013, UNK-029, UNK-030; 2 LOW: UNK-021, UNK-022), 25 resolved (UNK-001,
   UNK-002, UNK-003, UNK-004, UNK-005, UNK-006, UNK-007, UNK-008, UNK-009,
   UNK-010, UNK-011, UNK-012, UNK-014, UNK-015, UNK-016, UNK-017, UNK-018,
   UNK-019, UNK-020, UNK-023, UNK-025, UNK-026, UNK-027, UNK-028 answered;
   UNK-024 mooted by scope), 1 assumption rejected (ASM-002), **3 confirmed
   (ASM-001, ASM-003, ASM-004)**, **0 awaiting confirmation**. **No HIGH unknown
   remains open**, and no assumption is pending — the 5 remaining unknowns are
   MEDIUM/LOW and are formally deferred at Phase 1A close (see AUD-P1A-FINAL).
   Deferred design/future items not tracked as unknowns: refund-voucher numbering
   (ADR-0017 §2), teacher-debt settlement record (ADR-0021), non-program-revenue
   document structure (ADR-0023 — an architectural modeling decision), per-type
   voucher numbering scheme (ADR-0024 — design/go-live detail), Draft/posting
   lifecycle (ADR-0018 S6-D6), fixed-asset distinction & program/proportional
   expense allocation (ADR-0019), non-cash expense returns (ADR-0020), program
   capacity & internal cohorts & multiple-teachers-per-program (ADR-0022),
   non-educational revenue services (ADR-0023), tax / VAT / tax invoices
   (ADR-0024).
