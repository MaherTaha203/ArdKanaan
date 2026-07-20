# BC-005 — Refund & Adjustment Rules

| Field | Value |
|---|---|
| Doc ID | BC-005 |
| Title | Refund & Adjustment Rules |
| Phase | 2 (Business Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | BC-000 (framework); BC-001 (split/rounding, consumed via BC-004); BC-002 (registration lifecycle, consumed); BC-003 (receipt posting/immutability/lifecycle, consumed); BC-004 (entitlement reduction & debt definition, consumed); P2-000 + CDC; DOM-004 (DR-036/037/040/041/042/045/046/047/048/085); PC-003/004/006/007/008 (frozen) |
| Answers | "How are refunds and adjustments governed, additively and without loss of history?" |

---

## 1. Purpose

BC-005 formalizes the frozen Domain truth about **refunds** (reversals of recognized
revenue) and **adjustments** (cancellation and correction of posted documents). It governs
what a refund *is*, how it is recorded and bounded, its ledger footprint, and how any
posted financial document is cancelled or corrected — always **additively**, never by
erasure. It **consumes** BC-003 (posting, immutability, the receipt lifecycle) and BC-004
(the entitlement/debt effects of a refund). It defines **only** Business Rules.

> **Constitutional Boundary.** BC-005 governs the **refund event and the adjustment
> mechanism** — reversing revenue and undoing posted documents. It does **not** define the
> *entitlement* effect of a refund (BC-004, consumed) nor the **settlement** of any
> resulting Teacher Debt (BC-006). *A refund reverses a fact; settlement of what it leaves
> behind is a separate phase.* **BC-005 never authorizes settlement.**

## 2. Scope

**BC-005 governs:** the nature of a refund (reversal of recognized revenue, bounded by net
paid); the Refund Voucher (its identity, numbering, mandatory reason); the refund's
financial effect (revenue reversal and ledger footprint); refund association
(Student×Program only, no receipt allocation); refund–registration independence; and
**adjustment** — cancellation effect, cancellation dependency ordering, cancellation as a
preserved status, and the financial-vs-descriptive correction method.

**BC-005 does NOT govern:** the distribution *calculation* (BC-001, consumed); receipt
posting/immutability (BC-003, consumed); the *entitlement reduction* and *Teacher Debt
definition* driven by a refund (BC-004, consumed); the **settlement** of a Teacher Debt
(BC-006); balances aggregation (BC-007); non-program revenue/expense (BC-008); any UX,
data, engineering, or test.

## 3. Business Rule Principles

- **RP-21 — A refund reverses, it does not spend.** A refund is a reversal of recognized
  revenue, never a new expense.
- **RP-22 — Reversal is bounded by what was recognized.** A refund can never exceed the
  Student×Program net paid amount.
- **RP-23 — Adjustment is additive.** Nothing posted is edited or deleted; money is
  corrected by cancel-and-recreate, and cancellation is a preserved status.
- **RP-24 — History is never lost.** Every refund and every cancellation records its cause
  and remains on the audit timeline.
- **RP-25 — Dual Authority.** Every BR cites both an Authority of Truth (DR) and an
  Authority of Constitutional Legitimacy (PC).

## 4. Business Rule Catalog

### Category — Refund Nature

**BR-049 — A refund is a reversal of recognized revenue, bounded by the net paid amount**
- **Rule Statement:** A student refund is a **reversal** of previously recognized revenue —
  the refunded portion is treated as though never earned — and is **not** a new operating
  expense. A refund can never exceed the Student×Program net paid amount.
- **Business Rationale:** refunded money was never truly earned; treating it as an expense
  would distort every downstream figure.
- **Preconditions:** a Student×Program with a positive net paid amount.
- **Trigger:** the Owner records a refund.
- **Required Outcome:** recognized revenue is reversed by the refunded amount, never
  exceeding net paid.
- **Exceptions:** none — this is the governing refund principle.
- **Authority of Truth:** DR-036 (DR-017/023 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Refund Voucher reverses revenue);
  PC-004 §1.
- **Affected Product Concepts:** Refund Voucher; The Three Balances.
- **Affected Future Documents:** BC-006; BC-007; Phase 4; Testing.
- **Verification Method:** attempt a refund exceeding net paid; confirm it is impossible;
  confirm a refund is never recorded as an expense.

### Category — Refund Document

**BR-050 — A refund is recorded by a dedicated Refund Voucher with its own unique number and a mandatory reason**
- **Rule Statement:** Refunds are recorded by a dedicated, independent **Refund Voucher
  (سند استرجاع)** — never a Payment Voucher or an expense voucher. It references the
  Student and the Program, records the refund amount and a **mandatory refund reason**, and
  carries an official, unique, sequential number in its **own** independent series (never
  reused).
- **Business Rationale:** a revenue reversal must never masquerade as outgoing-expense
  documentation, and every financial document must be auditably numbered.
- **Preconditions:** a refund is being recorded.
- **Trigger:** refund posting.
- **Required Outcome:** a Refund Voucher exists with Student, Program, amount, reason, and
  its own unique number.
- **Exceptions:** the exact numbering scheme / go-live start is a design detail, not a
  business rule.
- **Authority of Truth:** DR-041, DR-042, DR-090 (per-type numbering).
- **Authority of Constitutional Legitimacy:** PC-006 (canonical "Refund Voucher");
  PC-004 SC-12 / PC-007 PR-018 / PC-008 AC-14 (unique series per voucher type);
  PC-007 PR-006 (tied to a cause).
- **Affected Product Concepts:** Refund Voucher.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** inspect any refund — it is a Refund Voucher with its own numbered
  series and a recorded reason.

### Category — Refund Financial Effect

**BR-051 — Posting a refund reverses revenue with a defined ledger footprint**
- **Rule Statement:** Posting a Refund Voucher reverses recognized revenue: **Cash Balance**
  decreases by the refunded amount and **Center Net Balance** decreases by the center's
  portion of the reversal; on the teacher side, the entitlement is reduced (unpaid case) or
  a Teacher Debt arises (already-settled case) **as defined by BC-004**. The three balances
  are never merged. The financial state is recalculated after every refund.
- **Business Rationale:** the refund's full footprint must be visible and auditable, and
  the balances must always reflect the revenue that actually stands.
- **Preconditions:** a posted refund on a Student×Program.
- **Trigger:** refund posting.
- **Required Outcome:** Cash↓ (refunded amount), Center Net↓ (center portion), teacher
  entitlement↓ or Teacher Debt (per BC-004); state recalculated.
- **Exceptions:** the teacher-side *amounts and debt definition* are consumed from BC-004
  (BR-044/BR-045/BR-046), not redefined here; the split *calculation* is BC-001.
- **Authority of Truth:** DR-037, DR-042.
- **Authority of Constitutional Legitimacy:** consumes BC-004 BR-044/045/046; PC-004 AP-7 /
  PC-007 PR-014 / PC-008 AC-10 (never merge); PC-006 (Cash / Center Net / Teacher Payables).
- **Affected Product Concepts:** Refund Voucher; The Three Balances; Teacher Balance;
  Teacher Debt.
- **Affected Future Documents:** BC-006; BC-007; Phase 4; Testing.
- **Verification Method:** post a refund; confirm Cash and Center Net fall correctly and the
  teacher effect matches BC-004.

### Category — Refund Association

**BR-052 — A refund attaches to the Student×Program only; no receipt allocation**
- **Rule Statement:** A refund is associated with the Student and the Program only and
  reduces the Student×Program total paid amount; it is **never** allocated or matched to
  individual Receipt Vouchers — no receipt-matching algorithm of any kind exists.
- **Business Rationale:** program-level arithmetic replaces an entire allocation machine
  (M-08).
- **Preconditions:** a Student×Program with paid receipts.
- **Trigger:** refund posting.
- **Required Outcome:** the refund reduces the Student×Program paid total; no per-receipt
  allocation occurs.
- **Exceptions:** none permitted.
- **Authority of Truth:** DR-040 (DR-034 mirror).
- **Authority of Constitutional Legitimacy:** PC-003 (per-program arithmetic); PC-004 §1.
- **Affected Product Concepts:** Refund Voucher; Registration; Training Program.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** confirm a refund reduces the program paid total without
  referencing any specific receipt.

### Category — Refund Independence

**BR-053 — A refund never changes registration status**
- **Rule Statement:** A refund (partial or full) **never** automatically changes a
  student's registration status, in either direction; ending or continuing a registration
  is a separate administrative decision (BC-002).
- **Business Rationale:** the financial act (refund) and the academic act (ending a
  registration) are distinct; coupling them would force unintended outcomes.
- **Preconditions:** a registration with a refund.
- **Trigger:** a refund is posted.
- **Required Outcome:** registration status is unchanged by the refund.
- **Exceptions:** none — the two are always decided independently.
- **Authority of Truth:** DR-085 (DR-036/086 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Registration status independent);
  consumes BC-002 BR-025 (registration lifecycle); PC-004 §1.
- **Affected Product Concepts:** Refund Voucher; Registration; Operational Status.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** issue a full refund; confirm registration status is untouched.

### Category — Cancellation Effect

**BR-054 — A permitted cancellation automatically reverses all of a document's financial effects**
- **Rule Statement:** When cancellation is permitted (BR-055), **every financial effect
  introduced by that document is automatically and completely reversed, while all unrelated
  subsequent facts are preserved**; Cash Balance, teacher entitlement, Center Net Balance,
  and all derived balances and reports update with no further action.
- **Business Rationale:** cancellation must be a single, complete, self-correcting act that
  touches only what the document itself caused.
- **Preconditions:** a posted, independently-cancellable document (BR-055).
- **Trigger:** the Owner cancels the document.
- **Required Outcome:** every financial effect of the document is reversed and unrelated
  subsequent facts are preserved; derived state updates accordingly.
- **Exceptions:** none — the reversal of the document's own effects is total.
- **Authority of Truth:** DR-045 (DR-016/017 supporting).
- **Authority of Constitutional Legitimacy:** PC-004 AP-3 / PC-008 AC-03 (additive,
  non-destructive); PC-003 (Three Balances).
- **Affected Product Concepts:** Receipt Voucher; Refund Voucher; The Three Balances.
- **Affected Future Documents:** BC-006; BC-007; Phase 4; Testing.
- **Verification Method:** cancel a posted document; confirm its own financial effects
  reverse and unrelated later facts remain.

### Category — Cancellation Dependency

**BR-055 — No document may be cancelled while later documents depend on it**
- **Rule Statement:** A document cannot be cancelled while **later dependent financial
  documents** depend on it; dependents are removed **newest-first** until the original
  becomes independent. Cancellation never creates automatic debts or open items — the user
  removes dependents first.
- **Business Rationale:** preserve the financial timeline — no document may reference a
  source that no longer exists — while keeping a single-operator system simple.
- **Preconditions:** a document with zero or more dependents.
- **Trigger:** an attempt to cancel.
- **Required Outcome:** cancellation proceeds only when the document is independent;
  otherwise dependents are removed newest-first; no automatic debt/open item is created.
- **Exceptions:** none permitted.
- **Authority of Truth:** DR-046 (DR-044 supporting).
- **Authority of Constitutional Legitimacy:** PC-004 AP-3; PC-007 PR-031 (audit chain);
  PC-003.
- **Affected Product Concepts:** Receipt Voucher; Refund Voucher; Activity Record.
- **Affected Future Documents:** BC-006; Phase 4; Testing.
- **Verification Method:** attempt to cancel a document with a dependent; confirm it is
  blocked until the dependent is removed.

### Category — Cancellation Record

**BR-056 — Cancellation is a preserved status on the original document**
- **Rule Statement:** Cancelling a posted document creates **no separate cancellation
  document**; the original keeps its place and carries a **"Cancelled"** status — never
  deleted, never hidden — remaining visible in the voucher log, the student statement,
  financial-history reports, and the activity timeline. Each cancellation records its
  **date**, its **mandatory reason**, and the **actor** (the Owner, the single user).
- **Business Rationale:** preserve the full history without adding extra document types.
- **Preconditions:** a permitted cancellation (BR-054/BR-055).
- **Trigger:** the cancellation is recorded.
- **Required Outcome:** the original is preserved with a Cancelled status, date, reason, and
  actor; nothing is deleted or hidden.
- **Exceptions:** none.
- **Authority of Truth:** DR-047 (DR-019/044 supporting).
- **Authority of Constitutional Legitimacy:** PC-002 PP-3 / PC-004 AP-3 /
  PC-007 PR-004/PR-031/PR-032 / PC-008 AC-21 (no deletion; full audit).
- **Affected Product Concepts:** Receipt Voucher; Refund Voucher; Activity Record;
  Operational Status.
- **Affected Future Documents:** BC-006; Phase 4; Testing.
- **Verification Method:** cancel a document; confirm the original persists as Cancelled
  with date/reason/actor.

### Category — Correction Method

**BR-057 — Financial fields cancel-and-recreate; descriptive fields edit-with-log**
- **Rule Statement:** Fields that affect money — amount, student, program, payment method,
  or anything affecting balances, entitlements, or financial reports — are **never edited**
  after posting; correcting them is always **cancel-and-recreate**. Descriptive fields that
  affect no money — notes, Payer Name, extra description — **may** be edited after posting,
  provided the change is recorded in the activity log (date, user, old→new value); such an
  edit triggers no financial recalculation. **The classification of a field as financial or
  descriptive is constitutional and cannot vary by implementation.**
- **Business Rationale:** lock what money depends on; allow harmless descriptive fixes
  without the weight of cancellation, but never silently.
- **Preconditions:** a posted document needing correction.
- **Trigger:** a correction is attempted.
- **Required Outcome:** money-affecting corrections go through cancel-and-recreate;
  descriptive edits are logged and cause no recalculation.
- **Exceptions:** none beyond the financial/descriptive split itself.
- **Authority of Truth:** DR-048 (DR-044/021/019 supporting).
- **Authority of Constitutional Legitimacy:** PC-004 AP-3 / PC-007 PR-004 / PC-008 AC-03
  (posted facts additive-only); PC-007 PR-031 (logged).
- **Affected Product Concepts:** Receipt Voucher; Refund Voucher; Payer Name; Activity
  Record.
- **Affected Future Documents:** BC-006; Phase 4; Testing.
- **Verification Method:** edit an amount (blocked → cancel/recreate) and a note (allowed,
  logged, no recalculation).

## 5. Rule Categories

| # | Category | Rules |
|---|---|---|
| 1 | Refund Nature | BR-049 |
| 2 | Refund Document | BR-050 |
| 3 | Refund Financial Effect | BR-051 |
| 4 | Refund Association | BR-052 |
| 5 | Refund Independence | BR-053 |
| 6 | Cancellation Effect | BR-054 |
| 7 | Cancellation Dependency | BR-055 |
| 8 | Cancellation Record | BR-056 |
| 9 | Correction Method | BR-057 |

## 6. Business Rule Traceability Matrix

| BR | Frozen Domain | Product Constitution | Consumes (BC) | Future BC | Future UX | Future Eng | Future Testing |
|---|---|---|---|---|---|---|---|
| BR-049 | DR-036 | PC-003/004 | — | BC-006/007 | — | ✓ | ✓ |
| BR-050 | DR-041/042/090 | PC-006 / SC-12 / PR-018 / AC-14 / PR-006 | — | BC-007 | ✓ | ✓ | ✓ |
| BR-051 | DR-037/042 | AP-7 / PR-014 / AC-10 / PC-006 | BC-004 BR-044/045/046 | BC-006/007 | — | ✓ | ✓ |
| BR-052 | DR-040 | PC-003/004 | — | BC-007 | — | ✓ | ✓ |
| BR-053 | DR-085 | PC-003/004 | BC-002 BR-025 | BC-007 | ✓ | ✓ | ✓ |
| BR-054 | DR-045 | AP-3 / AC-03 | — | BC-006/007 | — | ✓ | ✓ |
| BR-055 | DR-046 | AP-3 / PR-031 | — | BC-006 | ✓ | ✓ | ✓ |
| BR-056 | DR-047 | PP-3 / AP-3 / PR-004/031/032 / AC-21 | — | BC-006 | ✓ | ✓ | ✓ |
| BR-057 | DR-048 | AP-3 / PR-004 / AC-03 / PR-031 | — | BC-006 | ✓ | ✓ | ✓ |

## 7. Coverage Report

| Frozen DR | Covered by | Frozen DR | Covered by |
|---|---|---|---|
| DR-036 | BR-049 | DR-045 | BR-054 |
| DR-037 | BR-051 | DR-046 | BR-055 |
| DR-040 | BR-052 | DR-047 | BR-056 |
| DR-041 | BR-050 | DR-048 | BR-057 |
| DR-042 | BR-050, BR-051 | DR-085 | BR-053 |

**Uncovered in-scope rules:** none. **Deliberately deferred:** the *entitlement reduction*
and *Teacher Debt definition* driven by a refund (DR-038/DR-039 entitlement side) are
consumed from **BC-004**; the **settlement** of any resulting Teacher Debt
(repayment/deduction) is **BC-006**; posting and immutability (DR-043/044) are consumed
from **BC-003**; balances aggregation is **BC-007**.

**Scope intentionally closed.** No additional frozen Domain Rules belong to this document.

## 8. Business Invariants *(derivational, not generative)*

- **INV-21 — A refund can never exceed the Student×Program net paid amount.** *(entails
  BR-049; DR-036)*
- **INV-22 — Every refund is a Refund Voucher with its own unique number; it is never a
  payment or an expense.** *(entails BR-050; DR-041/090)*
- **INV-23 — A refund reverses revenue with an auditable ledger footprint (Cash↓,
  Center Net↓, entitlement↓/debt per BC-004); it never merges the balances.** *(entails
  BR-051; DR-037/042)*
- **INV-24 — No posted document is ever edited or deleted; money is corrected by
  cancel-and-recreate, and cancellation is a preserved "Cancelled" status recording date,
  reason, and actor.** *(entails BR-054/056/057; DR-044/047/048)*
- **INV-25 — A refund never changes registration status; the financial and academic acts
  are independent.** *(entails BR-053; DR-085)*

## 9. Cross-Document Consistency Review

- **Consumed dependencies (existing frozen BC rules):** BC-003 — BR-034 (posting), BR-037
  (receipt immutability), BR-040 (receipt lifecycle / cancellation deferral); BC-004 —
  BR-044 (refund-driven entitlement reduction), BR-045 (zero-floor), BR-046 (Teacher Debt
  definition); BC-002 — BR-025 (registration lifecycle); BC-001 split via BC-004; and the
  BC-000 framework.
- **Forward dependencies (not consumption; authored later):** BC-006 (settlement of a
  refund-driven Teacher Debt) and BC-007 (balances aggregation).
- **Modifies / narrows / reinterprets any prior BR?** **Consumes only. No modification. No
  narrowing. No reinterpretation.** BC-005 provides the cancellation mechanics that BC-003
  BR-040 explicitly deferred, and triggers the entitlement/debt effects that BC-004 defines
  — using every prior rule with its frozen meaning intact. *(Had any prior BR needed
  changing, this would STOP and be raised as an Amendment per GOV-004 §5 / BC-000 §BCG-3.)*

## 10. Strict-Scope Self-Check

BC-005 defines **only** Business Rules (BR-049…BR-057) in the 13-field normal form, each
atomic, observable, business-only, and dual-cited. It defines the refund event and the
adjustment (cancellation/correction) mechanism; it introduces **no** entitlement/debt
definition (BC-004), **no** settlement of a debt (BC-006), no balances aggregation
(BC-007), and no UI/engineering/DB/API/test. It duplicates no prior BR, expands no product
scope, and contradicts no Product Constitution statement.
