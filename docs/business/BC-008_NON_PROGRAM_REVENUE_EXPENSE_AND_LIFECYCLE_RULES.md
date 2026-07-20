# BC-008 — Non-Program Revenue, Expense & Lifecycle Rules

| Field | Value |
|---|---|
| Doc ID | BC-008 |
| Title | Non-Program Revenue, Expense & Lifecycle Rules |
| Phase | 2 (Business Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | BC-000 (framework); BC-003 (posting/immutability/numbering, consumed); BC-005 (cancellation mechanics, consumed); P2-000 + CDC; DOM-004 (DR-049/050/051/052/053/054/055/056/057/058/059/060/061/080/081/082/083/084/088); PC-003/004/006/007/008 (frozen) |
| Answers | "How are center-only financial facts (non-program revenue and expenses) created and governed, and how are peripheral lifecycles maintained?" |

---

> **Layer classification.** BC-008 is a **Creation-layer** document (Layer 1): it creates
> facts. The three-layer model is: **Creation** = {BC-001, BC-002, BC-003, BC-008};
> **Transformation** = {BC-004, BC-005, BC-006}; **Observation** = {BC-007, BC-009}. BC-008's
> facts flow into BC-007's self-contained reveal; the two remain independent.

## 1. Purpose

BC-008's **primary constitutional responsibility is the creation of center-only financial
facts** — **non-program revenue** (exam, certificate, book/material), **expenses** (the
center's operating costs), and **expense returns**. The **shared operational-status
lifecycle** carried by peripheral entities is governed **within** this frame as a supporting
element — **not** an independent responsibility. It **consumes** BC-003 (posting/immutability/
numbering) and BC-005 (cancellation), creates facts that touch only the center's own
balances, and **never touches program distribution or teacher rights**. It defines **only**
Business Rules.

> **Constitutional Principle #1.** Center-only facts touch **only** the center's balances
> (Cash Balance and Center Net Balance) and **never** a teacher's entitlement, balance, or
> debt. Peripheral operational statuses never rewrite prior financial effects.
>
> **Constitutional Boundary.** BC-008 owns the creation of non-program revenue facts, expense
> facts, and expense-return facts, and — within that frame — the shared operational-status
> lifecycle pattern. It does **not** own program-fee distribution (BC-001/BC-003),
> entitlement/settlement (BC-004/BC-006), program-fee refund (BC-005), the revelation of
> balances (BC-007), UI, reporting, or analytics.

## 2. Scope

**BC-008 governs:** the revenue source on every receipt; non-program revenue as center-only,
student-linked income; the definition, recording, single-category classification, and
center-borne effect of expenses; expense returns (definition, bounds, preconditions, cash
realization); and — as a supporting element — the shared Owner-controlled reversible
operational-status pattern (Program / Teacher / Registration).

**BC-008 does NOT govern:** program-fee pricing/distribution (BC-001), registration (BC-002),
the program-fee receipt split (BC-003), entitlement/debt (BC-004), program-fee
refund/cancellation *mechanics* (BC-005, consumed), settlement (BC-006), balance/standing
revelation (BC-007); any UX, reporting, data, engineering, or test.

## 3. Business Rule Principles

- **RP-36 — Center-only isolation.** Non-program revenue and expenses affect only Cash and
  Center Net; they never touch a teacher.
- **RP-37 — Distribution is program-fee only.** Revenue distribution applies exclusively to
  program fees; no other revenue carries a teacher share.
- **RP-38 — A return is a smaller cost, never income.** An expense return reduces its
  originating expense; it is never revenue.
- **RP-39 — Statuses preserve history.** Every operational status is Owner-controlled,
  reversible, and never rewrites recorded money.
- **RP-40 — Dual Authority.** Every BR cites both an Authority of Truth (DR) and an Authority
  of Constitutional Legitimacy (PC).

## 4. Business Rule Catalog

### Category — Revenue Source

**BR-074 — Every receipt names a defined revenue source**
- **Rule Statement:** Every amount the center receives is recorded against a defined revenue
  source — program fees, exam fees, certificate-issuance fees, or book/material sales; no
  generic or unattributed receipt exists.
- **Business Rationale:** the Owner must always know what each incoming amount was for.
- **Preconditions:** money is received.
- **Trigger:** a receipt is recorded.
- **Required Outcome:** the receipt carries exactly one defined revenue source.
- **Exceptions:** none — every receipt names its source.
- **Authority of Truth:** DR-080.
- **Authority of Constitutional Legitimacy:** PC-003 (Receipt / Non-Program Revenue);
  PC-007 PR-006 (tied to a cause); PC-004 §1.
- **Affected Product Concepts:** Receipt Voucher; Non-Program Educational Revenue.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** inspect any receipt — a defined revenue source is present.

### Category — Non-Program Revenue

**BR-075 — Non-program revenue is entirely center revenue and never touches a teacher**
- **Rule Statement:** Exam fees, certificate-issuance fees, and book/material sales are
  entirely the center's revenue: recording one raises the **Cash Balance** and the **Center
  Net Balance** only, carries no teacher share, entitlement, balance, or debt effect, and
  never enters revenue distribution (which applies exclusively to program fees).
- **Business Rationale:** these are services/products the center provides independently of
  delivering a program; no teacher earned a share.
- **Preconditions:** a non-program educational revenue is received.
- **Trigger:** the revenue is recorded.
- **Required Outcome:** Cash↑ and Center Net↑ only; no teacher effect; not distributed.
- **Exceptions:** none — program fees remain the only distributed revenue.
- **Authority of Truth:** DR-081.
- **Authority of Constitutional Legitimacy:** PC-004 AP-7 / PC-007 PR-014 (never merge/touch
  teacher); PC-006 (Non-Program Educational Revenue; Cash / Center Net); PC-003.
- **Affected Product Concepts:** Non-Program Educational Revenue; The Three Balances.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** record a non-program revenue; confirm only Cash and Center Net
  rise, no teacher effect.

**BR-076 — All educational revenue is tied to one Student; a program link is optional**
- **Rule Statement:** Every educational revenue (program fees, exam, certificate,
  book/material) is always tied to a specific **Student**; a link to a **Program** is optional
  (present when the revenue relates to a program, absent otherwise). No non-student
  educational revenue is recorded in V1.
- **Business Rationale:** these are services delivered to a student, so each belongs to a
  student and appears in that student's record.
- **Preconditions:** an educational revenue is received.
- **Trigger:** the revenue is recorded.
- **Required Outcome:** the revenue references exactly one Student; a Program link is
  optional.
- **Exceptions:** none in V1 — no student, no educational-revenue record.
- **Authority of Truth:** DR-082.
- **Authority of Constitutional Legitimacy:** PC-003 (Student is the anchor); PC-004 §1.
- **Affected Product Concepts:** Non-Program Educational Revenue; Student; Training Program.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** record educational revenue; confirm a student link, optional
  program link.

### Category — Expense Definition

**BR-077 — An expense is a center operating cost, never a settlement of a pre-existing right**
- **Rule Statement:** An expense is money the center pays for a good, service, or obligation
  to operate the center itself and that does **not** settle a pre-existing financial right;
  teacher payments (settlements) and student refunds (reversals) are **not** expenses.
- **Business Rationale:** operating costs must be separated from settlements and reversals so
  each balance means what it should.
- **Preconditions:** the center incurs an operating cost.
- **Trigger:** an expense is recorded.
- **Required Outcome:** the cost is an expense only if it settles no pre-existing right.
- **Exceptions:** none.
- **Authority of Truth:** DR-049 (DR-030/036 by contrast).
- **Authority of Constitutional Legitimacy:** PC-003 (Expense distinct from Payment/Refund);
  PC-004 §1.
- **Affected Product Concepts:** Expense.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** confirm no settlement/refund is recorded as an expense.

### Category — Expense Recording

**BR-078 — Every expense is recorded uniformly, regardless of what is bought**
- **Rule Statement:** Every expense is recorded the same way — by category and amount —
  whether it buys a consumable or a durable item; the nature of the purchased item does not
  change how it is recorded (V1 has no fixed-asset distinction).
- **Business Rationale:** the center records what it spent, not what it owns.
- **Preconditions:** an expense is incurred.
- **Trigger:** the expense is recorded.
- **Required Outcome:** the expense is recorded by category + amount uniformly.
- **Exceptions:** none in V1.
- **Authority of Truth:** DR-050.
- **Authority of Constitutional Legitimacy:** PC-004 §2 (no fixed-asset concept); PC-003.
- **Affected Product Concepts:** Expense; Expense Category.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** record a consumable and a durable expense; confirm identical
  recording.

**BR-079 — Every expense is assigned exactly one category from an Owner-expandable list**
- **Rule Statement:** Every expense is assigned exactly one category, chosen from a named,
  Owner-expandable list of expense categories; an expense never belongs to more than one
  category.
- **Business Rationale:** the Owner wants per-category spending totals alongside each
  expense's detail.
- **Preconditions:** an expense is being recorded.
- **Trigger:** expense recording.
- **Required Outcome:** exactly one category is assigned.
- **Exceptions:** the Owner may extend the category list.
- **Authority of Truth:** DR-051.
- **Authority of Constitutional Legitimacy:** PC-003 (Expense Category); PC-004 §1.
- **Affected Product Concepts:** Expense; Expense Category.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** inspect any expense — exactly one category.

**BR-080 — An expense is recorded only when cash actually leaves the center**
- **Rule Statement:** An expense is recorded at the moment cash actually leaves the center,
  always paid from the center's own money. V1 has no unpaid/accrued expense and no
  owner-personal-money path.
- **Business Rationale:** the center records money it has actually spent from its own box.
- **Preconditions:** cash is leaving the center for an operating cost.
- **Trigger:** the cash leaves.
- **Required Outcome:** the expense is recorded at cash-out; no accrual exists.
- **Exceptions:** none in V1.
- **Authority of Truth:** DR-053.
- **Authority of Constitutional Legitimacy:** PC-004 §2 (no accrual); PC-003.
- **Affected Product Concepts:** Expense; Cash Balance.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** confirm no expense exists without cash having left the center.

**BR-081 — An expense requires no approval step**
- **Rule Statement:** Recording an expense requires no approval, permission, or workflow
  gate.
- **Business Rationale:** the single Owner operates the system directly.
- **Preconditions:** an expense is being recorded.
- **Trigger:** expense recording.
- **Required Outcome:** the expense is recorded with no approval gate.
- **Exceptions:** none.
- **Authority of Truth:** DR-054.
- **Authority of Constitutional Legitimacy:** PC-001 PA-6 / PC-005 (no approval/permission
  gate); PC-004 AP-4.
- **Affected Product Concepts:** Expense.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** record an expense; confirm no approval step exists.

### Category — Expense Effect

**BR-082 — Every expense is center-borne: Cash and Center Net fall, never a teacher**
- **Rule Statement:** Every expense is borne by the center: recording it reduces the **Cash
  Balance** (money out) and the **Center Net Balance** (the center bears the cost from its
  own earnings) and never touches any teacher's entitlement.
- **Business Rationale:** expenses are the center's operating costs, not the teachers'.
- **Preconditions:** an expense is recorded.
- **Trigger:** expense recording.
- **Required Outcome:** Cash↓ and Center Net↓; no teacher effect.
- **Exceptions:** allocating an expense to a program/teacher is a postponed future concept.
- **Authority of Truth:** DR-052 (DR-016 supporting).
- **Authority of Constitutional Legitimacy:** PC-004 AP-7 / PC-007 PR-014 (never touch
  teacher/merge); PC-006 (Cash / Center Net).
- **Affected Product Concepts:** Expense; The Three Balances.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** record an expense; confirm Cash and Center Net fall and no teacher
  balance changes.

### Category — Expense Return

**BR-083 — An expense return reduces its originating expense and is never income**
- **Rule Statement:** An expense return is a financial value returning to the center because
  of one specific prior expense; it **reduces/reverses that expense** (the center's real cost
  falls; a full return zeroes it) and is **never** recorded as new income or revenue.
- **Business Rationale:** money back for a cost is a smaller cost, not earnings.
- **Preconditions:** a standing prior expense (BR-085).
- **Trigger:** value returns because of that expense.
- **Required Outcome:** the original expense is reduced by the returned amount; nothing is
  recorded as income.
- **Exceptions:** with no prior expense to reference, it is not an expense return.
- **Authority of Truth:** DR-055, DR-056.
- **Authority of Constitutional Legitimacy:** PC-003 (Expense Return); PC-004 §1.
- **Affected Product Concepts:** Expense Return; Expense.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** record a return; confirm the expense falls and no income is
  recorded.

**BR-084 — Returns may be partial and multiple, bounded by the original; one return, one expense**
- **Rule Statement:** One expense may receive partial and multiple returns over time, but the
  **total returned never exceeds the original expense** (a full return is the ceiling). Each
  return references **exactly one** original expense; a lump-sum supplier refund covering
  several expenses is split at entry into independent returns.
- **Business Rationale:** you cannot reverse more cost than was incurred; atomic per-expense
  history.
- **Preconditions:** a standing expense with prior returns ≤ original.
- **Trigger:** a return is recorded.
- **Required Outcome:** the return is accepted only if the running total ≤ original; it
  references one expense.
- **Exceptions:** amount beyond the original is a different transaction, outside this concept.
- **Authority of Truth:** DR-057, DR-058.
- **Authority of Constitutional Legitimacy:** PC-004 §1; PC-003.
- **Affected Product Concepts:** Expense Return; Expense.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** attempt a return beyond the original; confirm it is bounded;
  confirm one-expense reference.

**BR-085 — An expense return requires a standing expense and is realized by cash returning; no time limit**
- **Rule Statement:** An expense return may be recorded only against an original expense that
  is **Posted and not cancelled**; the expense cannot be cancelled while a return is attached
  (the return is cancelled first — BC-005). It is realized by **actual cash returning** —
  raising the Cash Balance and, by reversing the center-borne expense, the Center Net Balance
  — and never touches a teacher. There is **no time limit**. Credit notes and goods
  replacement are not expense returns in V1.
- **Business Rationale:** a reversal needs a standing thing to reverse; V1 realizes the
  return through cash; time does not change the transaction.
- **Preconditions:** a Posted, non-cancelled expense.
- **Trigger:** cash returns because of that expense.
- **Required Outcome:** Cash↑ and Center Net↑; the expense is reduced; no teacher effect;
  accepted regardless of elapsed time.
- **Exceptions:** non-cash returns (credit notes, goods replacement) are outside V1.
- **Authority of Truth:** DR-059, DR-060, DR-061.
- **Authority of Constitutional Legitimacy:** consumes BC-005 (cancellation dependency);
  PC-004 AP-7 (never touch teacher); PC-006 (Cash / Center Net).
- **Affected Product Concepts:** Expense Return; Expense; The Three Balances.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** record a return against a standing expense; confirm cash/Center-Net
  effect, no teacher effect, and no time restriction.

### Category — Peripheral Lifecycle

**BR-086 — A Teacher's Active / Inactive-Left status blocks only future business creation**
- **Rule Statement:** A Teacher carries an Owner-controlled status, **Active** or
  **Inactive-Left**. Setting Inactive-Left blocks only the **creation of new business** for
  that teacher — its instance being the assignment of a new program — and has **no automatic
  financial or historical effect**: all prior programs, vouchers, entitlements, payments,
  balances, debts, and history persist, and all existing-balance operations (payment, refund
  recalculation, debt settlement, reporting) remain available until every obligation is
  settled.
- **Business Rationale:** the end of a teacher's engagement is a recorded fact, but
  obligations outlive the engagement and must remain settleable.
- **Preconditions:** a Teacher exists.
- **Trigger:** the Owner sets the status.
- **Required Outcome:** Inactive-Left blocks new business creation (new program assignment)
  only; all existing-balance operations remain; no history changes.
- **Exceptions:** none — the only thing blocked is new business creation.
- **Authority of Truth:** DR-083, DR-084.
- **Authority of Constitutional Legitimacy:** PC-003 (Operational Status; Teacher); PC-004 §1.
- **Affected Product Concepts:** Teacher; Operational Status; Teacher Balance; Teacher Debt.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** set a teacher Inactive-Left; confirm only new business creation
  blocked, all balance operations available.

**BR-087 — The current operational statuses follow one shared, history-preserving pattern**
- **Rule Statement:** The three entities that carry an operational lifecycle — **Program**
  (Open/Closed), **Teacher** (Active/Inactive-Left), and **Registration**
  (Active/Ended-Withdrawn) — all follow **one shared pattern**: the status is
  **Owner-controlled** and **reversible**, **preserves full history**, **blocks only new
  business**, and **never rewrites prior financial effects**. This rule governs these three
  current statuses; it imposes no rule on any future entity.
- **Business Rationale:** a single consistent lifecycle model keeps the system predictable and
  prevents any status from silently altering recorded money.
- **Preconditions:** an entity with one of the three operational statuses.
- **Trigger:** any status change.
- **Required Outcome:** the status behaves per the shared pattern; no prior financial effect
  is rewritten.
- **Exceptions:** none — the pattern is uniform across the three current statuses.
- **Authority of Truth:** DR-088 (DR-078/079/083/084/086/087 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Operational Status, one shared pattern);
  PC-002 PP-3 (history preserved); PC-004 §1.
- **Affected Product Concepts:** Operational Status; Training Program; Teacher; Registration.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** change each of the three statuses; confirm reversibility, history
  preservation, new-business blocking, no financial rewrite.

## 5. Rule Categories

| # | Category | Rules |
|---|---|---|
| 1 | Revenue Source | BR-074 |
| 2 | Non-Program Revenue | BR-075, BR-076 |
| 3 | Expense Definition | BR-077 |
| 4 | Expense Recording | BR-078, BR-079, BR-080, BR-081 |
| 5 | Expense Effect | BR-082 |
| 6 | Expense Return | BR-083, BR-084, BR-085 |
| 7 | Peripheral Lifecycle | BR-086, BR-087 |

## 6. Business Rule Traceability Matrix

| BR | Frozen Domain | Product Constitution | Consumes (BC) | Future BC | Future UX | Future Eng | Future Testing |
|---|---|---|---|---|---|---|---|
| BR-074 | DR-080 | PR-006 / PC-003 | — | BC-009 | ✓ | ✓ | ✓ |
| BR-075 | DR-081 | AP-7 / PR-014 / PC-006 | — | BC-009 | — | ✓ | ✓ |
| BR-076 | DR-082 | PC-003/004 | — | BC-009 | ✓ | ✓ | ✓ |
| BR-077 | DR-049 | PC-003/004 | — | BC-009 | — | ✓ | ✓ |
| BR-078 | DR-050 | PC-004 §2 | — | BC-009 | — | ✓ | ✓ |
| BR-079 | DR-051 | PC-003 | — | BC-009 | ✓ | ✓ | ✓ |
| BR-080 | DR-053 | PC-004 §2 | — | BC-009 | — | ✓ | ✓ |
| BR-081 | DR-054 | PA-6 / AP-4 / PC-005 | — | BC-009 | — | ✓ | ✓ |
| BR-082 | DR-052 | AP-7 / PR-014 / PC-006 | — | BC-009 | — | ✓ | ✓ |
| BR-083 | DR-055/056 | PC-003/004 | — | BC-009 | — | ✓ | ✓ |
| BR-084 | DR-057/058 | PC-004 | — | BC-009 | — | ✓ | ✓ |
| BR-085 | DR-059/060/061 | AP-7 / PC-006 | BC-005 | BC-009 | ✓ | ✓ | ✓ |
| BR-086 | DR-083/084 | PC-003 | — | BC-009 | ✓ | ✓ | ✓ |
| BR-087 | DR-088 | PP-3 / PC-003 | — | BC-009 | ✓ | ✓ | ✓ |

## 7. Coverage Report

| Frozen DR | Covered by | Frozen DR | Covered by |
|---|---|---|---|
| DR-049 | BR-077 | DR-057 | BR-084 |
| DR-050 | BR-078 | DR-058 | BR-084 |
| DR-051 | BR-079 | DR-059 | BR-085 |
| DR-052 | BR-082 | DR-060 | BR-085 |
| DR-053 | BR-080 | DR-061 | BR-085 |
| DR-054 | BR-081 | DR-080 | BR-074 |
| DR-055 | BR-083 | DR-081 | BR-075 |
| DR-056 | BR-083 | DR-082 | BR-076 |
| DR-083 | BR-086 | DR-084 | BR-086 |
| DR-088 | BR-087 | | |

**Uncovered in-scope rules:** none. **Deliberately deferred:** program-fee receipt/split
(BC-001/BC-003, consumed); the cancellation *mechanism* (BC-005, consumed); the revelation of
the balances these facts affect (BC-007); non-cash expense returns, program-expense
allocation, and non-educational revenue services are frozen Future Considerations (out of
V1). UNK-029/UNK-030 (non-program refundability / amount-due) remain open deferred unknowns —
no BR depends on them.

**Scope intentionally closed.** No additional frozen Domain Rules belong to this document.

## 8. Business Invariants *(derivational, not generative)*

- **INV-36 — Every receipt names a defined revenue source; no unattributed receipt exists.**
  *(entails BR-074; DR-080)*
- **INV-37 — Non-program revenue and expenses never touch a teacher's entitlement, balance,
  or debt.** *(entails BR-075, BR-082; DR-081/052)*
- **INV-38 — An expense return never exceeds its original expense and is never income.**
  *(entails BR-083, BR-084; DR-056/057)*
- **INV-39 — A center-only fact affects only Cash and Center Net Balance.** *(entails BR-075,
  BR-082, BR-085; DR-016/052/081)*
- **INV-40 — Every operational status is Owner-controlled, reversible, history-preserving,
  and never rewrites prior financial effects.** *(entails BR-086, BR-087; DR-088)*

## 9. Cross-Document Consistency Review

- **Consumed dependencies (existing frozen BC rules):** BC-003 (posting, immutability,
  per-type numbering for non-program receipts and expense/return vouchers), BC-005
  (cancellation mechanics and dependency ordering); and the BC-000 framework.
- **Forward dependencies:** **none.** BC-008 creates facts that BC-007 already reveals (BC-007
  is self-contained); BC-008 does not consume BC-007, and no arrow points forward.
- **Modifies / narrows / reinterprets any prior BR?** **Consumes only. No modification. No
  narrowing. No reinterpretation.** BC-008 creates center-only facts alongside the program-fee
  facts of BC-001…BC-003, reusing BC-003/BC-005 mechanics with meaning intact, and touching no
  teacher right. *(Had any prior BR needed changing, this would STOP and be raised as an
  Amendment per GOV-004 §5 / BC-000 §BCG-3.)*

## 10. Strict-Scope Self-Check

BC-008 defines **only** Business Rules (BR-074…BR-087) in the 13-field normal form, each
atomic, observable, business-only, and dual-cited. It creates center-only facts and governs
peripheral lifecycles within that frame; it introduces **no** program-fee distribution,
entitlement, settlement, balance revelation, UI, reporting, or analytics, and **never touches
a teacher's rights**. It duplicates no prior BR, expands no product scope, and contradicts no
Product Constitution statement.
