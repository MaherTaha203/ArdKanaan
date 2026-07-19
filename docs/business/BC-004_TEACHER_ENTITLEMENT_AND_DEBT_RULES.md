# BC-004 — Teacher Entitlement & Debt Rules

| Field | Value |
|---|---|
| Doc ID | BC-004 |
| Title | Teacher Entitlement & Debt Rules |
| Phase | 2 (Business Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | BC-000 (framework); BC-001 (distribution split, consumed); BC-003 (posted receipts, consumed); P2-000 + CDC; DOM-004 (DR-015/029/031/062/063/064/065/066/067/069); PC-003/004/006/007/008 (frozen) |
| Answers | "When does teacher entitlement arise, what changes it, and how is teacher debt defined?" |

---

## 1. Purpose

BC-004 formalizes the frozen Domain truth about **teacher entitlement and teacher debt** —
a teacher's *right* to a share of received money, and the *obligation* that arises when
reversals exceed what was earned. It defines when entitlement arises, what increases it,
what decreases it, how Teacher Debt is defined, and how both relate to posted receipts.
Entitlement and debt are **derived** truths (revealed, never authored). It defines **only**
Business Rules.

> **Constitutional Boundary.** BC-004 governs **entitlement only**. Payment and settlement
> are **intentionally excluded**. Settlement — the Teacher Payment Voucher, payment
> lifecycle, settlement mechanism and effects, partial payments, and outstanding-after-
> payment — is governed by **BC-006**. *Entitlement creates a right; Settlement discharges
> it — two constitutionally distinct phases, never merged in one document.* **BC-004 never
> authorizes payment.**

## 2. Scope

**BC-004 governs:** the origin of teacher entitlement (at receipt posting, from posted
receipts only, unconditionally); the basis and accrual of entitlement (the teacher share,
per Teacher×Program, cumulative); entitlement independence across programs; entitlement
reduction on refund and the zero-floor; and the **definition** of Teacher Debt (its
origin, per-program isolation, and nature — finite, non-negative, closed at zero,
non-expiring).

**BC-004 does NOT govern:** the distribution *calculation* (BC-001, consumed); receipt
posting mechanics (BC-003, consumed); the refund *event* and its ledger reversal (BC-005);
**any settlement** — teacher payment, payment voucher, payment lifecycle, settlement paths,
deduction, outstanding-after-payment (all **BC-006**); balances aggregation (BC-007); any
UX, data, engineering, or test.

## 3. Business Rule Principles

- **RP-16 — Entitlement follows the money received.** A teacher's right arises from posted
  receipts, and from nothing else — no completion, attendance, or other condition.
- **RP-17 — Entitlement is a right, not a payment.** BC-004 defines what the teacher has
  earned; whether and how it is paid is settlement (BC-006).
- **RP-18 — Per Teacher×Program isolation.** Every entitlement and every debt is tracked
  per Teacher×Program and never merged or offset across programs.
- **RP-19 — A shortfall is a debt, never a negative right.** Entitlement floors at zero; an
  excess of settlement over earned entitlement is a distinct obligation (Teacher Debt).
- **RP-20 — Dual Authority.** Every BR cites both an Authority of Truth (DR) and an
  Authority of Constitutional Legitimacy (PC).

## 4. Business Rule Catalog

### Category — Entitlement Origin

**BR-041 — Teacher entitlement arises at receipt posting, from posted receipts only, unconditionally**
- **Rule Statement:** The moment a Receipt Voucher is posted, a teacher entitlement (a
  receivable) arises for that Teacher×Program. Entitlement is created by posted student
  payments **only**; no other condition (program completion, attendance, or any other)
  creates or gates it in V1.
- **Business Rationale:** the teacher's right arises from money received, not from any
  later decision or milestone.
- **Preconditions:** a program with a Revenue Distribution Policy (BC-001) and a
  registration (BC-002).
- **Trigger:** a Receipt Voucher is posted (BC-003 BR-034/BR-035).
- **Required Outcome:** teacher entitlement for that Teacher×Program comes into being at
  posting, unconditionally.
- **Exceptions:** none in V1.
- **Authority of Truth:** DR-015, DR-029.
- **Authority of Constitutional Legitimacy:** PC-003 (Teacher Balance; derived);
  PC-002 PP-1 / PC-007 PR-015 (derived, revealed only); consumes BC-003 BR-035.
- **Affected Product Concepts:** Teacher Balance; Receipt Voucher.
- **Affected Future Documents:** BC-006; BC-007; Phase 4; Testing.
- **Verification Method:** post a receipt; confirm entitlement arises immediately with no
  additional condition.

### Category — Entitlement Basis

**BR-042 — Entitlement equals the teacher share of posted receipts, accrued cumulatively per Teacher×Program**
- **Rule Statement:** A teacher's entitlement on a program is the **teacher share** (the
  program's teacher percentage, as computed by BC-001) of that program's posted receipts,
  accrued **cumulatively across the Teacher×Program** — it is a running total, never tied
  to a single receipt.
- **Business Rationale:** entitlement is the sum of what the teacher has earned from all
  money received on the program.
- **Preconditions:** posted receipts on the Teacher×Program.
- **Trigger:** each receipt posting adds its teacher share.
- **Required Outcome:** entitlement equals the cumulative teacher share of posted receipts
  for that Teacher×Program.
- **Exceptions:** the share *amounts* are computed by BC-001 (BR-011/BR-012), not
  recomputed here.
- **Authority of Truth:** DR-013 (consumed), DR-062 (cumulative), DR-031.
- **Authority of Constitutional Legitimacy:** consumes BC-001 BR-011/BR-012; PC-003
  (Teacher Balance, derived); PC-007 PR-020 (reveal per-program teacher balances).
- **Affected Product Concepts:** Teacher Balance; Revenue Distribution Policy; Receipt
  Voucher.
- **Affected Future Documents:** BC-006; BC-007; Phase 4; Testing.
- **Verification Method:** confirm entitlement equals the cumulative teacher share of the
  program's posted receipts.

### Category — Entitlement Independence

**BR-043 — Entitlement is per Teacher×Program and never merged or offset across programs**
- **Rule Statement:** Each Teacher×Program carries its own independent entitlement;
  entitlements are never merged or offset between programs, even for the same teacher.
- **Business Rationale:** financial separation between programs is mandatory.
- **Preconditions:** a teacher with ≥1 program.
- **Trigger:** any entitlement reveal or computation.
- **Required Outcome:** entitlement is computed and shown per Teacher×Program, with no
  cross-program merging or offset.
- **Exceptions:** none permitted.
- **Authority of Truth:** DR-031.
- **Authority of Constitutional Legitimacy:** PC-004 AP-7 / PC-007 PR-014 / PC-008 AC-10
  (never merge/offset); PC-003.
- **Affected Product Concepts:** Teacher Balance; Training Program.
- **Affected Future Documents:** BC-006; BC-007; Phase 4; Testing.
- **Verification Method:** confirm one program's entitlement is never combined with
  another's.

### Category — Entitlement Reduction

**BR-044 — A refund reduces the program's teacher entitlement by the original program percentage of the refunded amount**
- **Rule Statement:** When a refund reverses revenue (the refund *event* governed by
  BC-005), the teacher's entitlement on that program is reduced by the **original program
  teacher percentage** applied to the refunded amount, rounded by the one rounding rule so
  that the teacher and center reductions sum exactly to the refunded amount.
- **Business Rationale:** a reversal must unwind the same split that recognized the
  revenue, or balances stop reflecting reality.
- **Preconditions:** existing entitlement on the Teacher×Program; a refund occurs (BC-005).
- **Trigger:** a refund is recorded (BC-005).
- **Required Outcome:** entitlement falls by the program-percentage share of the refunded
  amount; teacher and center reductions conserve the refunded amount exactly.
- **Exceptions:** the reversal always uses the original program percentage; the rounding
  *rule* is consumed from BC-001 (DR-028), not redefined.
- **Authority of Truth:** DR-062, DR-063.
- **Authority of Constitutional Legitimacy:** consumes BC-001 BR-011/BR-012 (split &
  rounding); PC-004 AP-7 (never merge); PC-003.
- **Affected Product Concepts:** Teacher Balance; Refund Voucher; Revenue Distribution
  Policy.
- **Affected Future Documents:** BC-005; BC-006; BC-007; Phase 4; Testing.
- **Verification Method:** refund a portion; confirm entitlement falls by the
  program-percentage share and amounts conserve exactly.

**BR-045 — Unpaid entitlement never displays negative; it floors at zero, and a shortfall signals a debt**
- **Rule Statement:** While the teacher has not been settled for the refunded portion, a
  refund reduces entitlement directly, and entitlement **never displays a negative value**
  — it floors at zero. A reduction that would push it below zero is the **signal that a
  Teacher Debt arises** (BR-046), not a negative entitlement. **BR-045 establishes the
  boundary at zero; BR-046 defines the resulting Teacher Debt.**
- **Business Rationale:** entitlement is money still owed to the teacher; you cannot owe
  less than nothing — a shortfall is a different concept (money to be returned), modelled
  as a debt.
- **Preconditions:** a refund reducing an entitlement toward or below zero.
- **Trigger:** the refund-driven reduction (BR-044).
- **Required Outcome:** entitlement floors at zero; any shortfall becomes a Teacher Debt
  (BR-046), never a negative balance.
- **Exceptions:** none.
- **Authority of Truth:** DR-064.
- **Authority of Constitutional Legitimacy:** PC-003 (Teacher Balance / Teacher Debt,
  derived); PC-007 PR-015; PC-002 PP-1.
- **Affected Product Concepts:** Teacher Balance; Teacher Debt.
- **Affected Future Documents:** BC-006; BC-007; Phase 4; Testing.
- **Verification Method:** drive a reduction below zero; confirm entitlement shows zero and
  a debt is signalled.

### Category — Teacher Debt Definition

**BR-046 — A Teacher Debt is revealed when settlement exceeds the final entitlement; the excess is the debt**
- **Rule Statement:** A Teacher Debt is **revealed when the constitutionally-defined
  settlement facts (BC-006) show that total settlement for a program exceeds** that
  teacher's **final entitlement** for the program after all refund recalculations. The
  excess is the debt. If settlement does not exceed the final entitlement, there is no debt
  — the refund simply reduces the outstanding entitlement (BR-045).
- **Business Rationale:** money already handed over for revenue later reversed must come
  back, but only the part exceeding what was truly earned is a debt.
- **Preconditions:** the program's final entitlement and its total settlement (a settlement
  fact governed by BC-006).
- **Trigger:** a refund recalculation reduces final entitlement below the total already
  settled.
- **Required Outcome:** a Teacher Debt equal to (total settlement − final entitlement) is
  revealed, recognized only when positive.
- **Exceptions:** none — BC-004 **defines** the debt; the settlement facts themselves are
  governed by BC-006.
- **Authority of Truth:** DR-065 (DR-064 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Teacher Debt, derived); PC-007
  PR-015/PR-020 / PC-008 AC-11 (derived, revealed only); forward-references BC-006
  (settlement facts).
- **Affected Product Concepts:** Teacher Debt; Teacher Balance.
- **Affected Future Documents:** BC-006; BC-007; Phase 4; Testing.
- **Verification Method:** with total settlement 700 and final entitlement 420, confirm a
  debt of 280 is revealed.

**BR-047 — Teacher Debt is per Teacher×Program and never merged or offset across programs**
- **Rule Statement:** A Teacher Debt is defined and tracked per Teacher×Program
  independently; a debt on one program is never cleared using entitlements owed on another,
  even for the same teacher.
- **Business Rationale:** debt management obeys the same program isolation as entitlement.
- **Preconditions:** a Teacher Debt on a program.
- **Trigger:** any debt reveal or computation.
- **Required Outcome:** the debt stays isolated to its Teacher×Program; no cross-program
  merge or offset.
- **Exceptions:** none permitted.
- **Authority of Truth:** DR-066 (DR-031 supporting).
- **Authority of Constitutional Legitimacy:** PC-004 AP-7 / PC-007 PR-014 / PC-008 AC-10
  (never merge/offset); PC-003.
- **Affected Product Concepts:** Teacher Debt; Training Program.
- **Affected Future Documents:** BC-006; BC-007; Phase 4; Testing.
- **Verification Method:** confirm a debt on one program is never offset by entitlement on
  another.

**BR-048 — A Teacher Debt is a finite balance: never negative, closed at zero, and non-expiring**
- **Rule Statement:** A Teacher Debt is a finite balance that only decreases as it is
  settled; it **never becomes negative**, is **closed when it reaches zero**, and has **no
  expiry** — elapsed time never reduces or writes it off. The *mechanism* that reduces it
  (settlement) is governed by BC-006.
- **Business Rationale:** a debt is a finite amount to be returned; it converges to zero,
  cannot overshoot into a credit, and time does not change that the money is owed.
- **Preconditions:** a recognized Teacher Debt.
- **Trigger:** the passage of time; a settlement event (governed by BC-006).
- **Required Outcome:** the debt is bounded in [0, original]; it closes at zero and never
  expires; BC-004 defines this nature, BC-006 performs the reduction.
- **Exceptions:** the settlement paths and effects are defined in BC-006, not here.
- **Authority of Truth:** DR-067 (nature), DR-069 (no expiry).
- **Authority of Constitutional Legitimacy:** PC-003 (Teacher Debt, derived);
  PC-002 PP-1 / PC-007 PR-015; forward-references BC-006 (settlement).
- **Affected Product Concepts:** Teacher Debt.
- **Affected Future Documents:** BC-006; Phase 4; Testing.
- **Verification Method:** confirm a debt never goes negative, closes at zero, and is
  unaffected by elapsed time.

## 5. Rule Categories

| # | Category | Rules |
|---|---|---|
| 1 | Entitlement Origin | BR-041 |
| 2 | Entitlement Basis | BR-042 |
| 3 | Entitlement Independence | BR-043 |
| 4 | Entitlement Reduction | BR-044, BR-045 |
| 5 | Teacher Debt Definition | BR-046, BR-047, BR-048 |

## 6. Business Rule Traceability Matrix

| BR | Frozen Domain | Product Constitution | Consumes (BC) | Future BC | Future UX | Future Eng | Future Testing |
|---|---|---|---|---|---|---|---|
| BR-041 | DR-015/029 | PC-003 / PP-1 / PR-015 | BC-003 BR-035 | BC-006/007 | — | ✓ | ✓ |
| BR-042 | DR-013/062/031 | PC-003 / PR-020 | BC-001 BR-011/012 | BC-006/007 | — | ✓ | ✓ |
| BR-043 | DR-031 | AP-7 / PR-014 / AC-10 | — | BC-006/007 | — | ✓ | ✓ |
| BR-044 | DR-062/063 | AP-7 / PC-003 | BC-001 BR-011/012 | BC-005/006/007 | — | ✓ | ✓ |
| BR-045 | DR-064 | PC-003 / PR-015 / PP-1 | — | BC-006/007 | — | ✓ | ✓ |
| BR-046 | DR-065 | PC-003 / PR-015/020 / AC-11 | → BC-006 (settlement) | BC-006/007 | — | ✓ | ✓ |
| BR-047 | DR-066 | AP-7 / PR-014 / AC-10 | — | BC-006/007 | — | ✓ | ✓ |
| BR-048 | DR-067/069 | PC-003 / PR-015 | → BC-006 (settlement) | BC-006 | — | ✓ | ✓ |

## 7. Coverage Report

| Frozen DR | Covered by | Frozen DR | Covered by |
|---|---|---|---|
| DR-015 | BR-041 | DR-064 | BR-045 |
| DR-029 | BR-041 | DR-065 | BR-046 |
| DR-031 | BR-043 | DR-066 | BR-047 |
| DR-062 | BR-042, BR-044 | DR-067 | BR-048 |
| DR-063 | BR-044 | DR-069 | BR-048 |

**Uncovered in-scope rules:** none. **Deliberately deferred to BC-006 (settlement):** the
two settlement paths and Owner choice (DR-068); no-future-entitlement ⇒ repayment-only
(DR-070); program-level outstanding = entitlement − settlement (DR-034); the settlement
*act* that reduces a debt (DR-067 settlement side). The distribution *calculation*
(DR-013/028) is consumed from BC-001; the refund *event* (DR-036…042) is BC-005.

**Scope intentionally closed.** No additional frozen Domain Rules belong to this document.

## 8. Business Invariants *(derivational, not generative)*

- **INV-16 — Teacher entitlement arises only from posted receipts — no other condition.**
  *(entails BR-041; DR-029)*
- **INV-17 — Unpaid entitlement is never negative; it floors at zero.** *(entails BR-045;
  DR-064)*
- **INV-18 — A Teacher Debt is exactly the excess of total settlement over final
  entitlement, per Teacher×Program.** *(entails BR-046, BR-047; DR-065/066)*
- **INV-19 — A Teacher Debt never goes negative, closes at zero, and never expires.**
  *(entails BR-048; DR-067/069)*
- **INV-20 — Entitlement and Debt are per Teacher×Program and never offset across
  programs.** *(entails BR-043, BR-047; DR-031/066)*

## 9. Cross-Document Consistency Review

- **Consumed dependencies (existing frozen BC rules):** BC-001 — BR-010 (policy),
  BR-011/BR-012 (teacher/center split & rounding); BC-003 — BR-034/BR-035 (posting and its
  entitlement-raising effect); and the BC-000 framework.
- **Forward dependencies (not consumption; authored later):** BC-005 (the refund event) and
  BC-006 (the settlement facts). BC-004 defines their *entitlement/debt effects* but
  governs neither.
- **Modifies / narrows / reinterprets any prior BR?** **Consumes only. No modification. No
  narrowing. No reinterpretation.** BC-004 defines entitlement and debt *on top of* BC-001's
  split and BC-003's posting, using them with frozen meaning intact. *(Had any prior BR
  needed changing, this would STOP and be raised as an Amendment per GOV-004 §5 / BC-000
  §BCG-3.)*

## 10. Strict-Scope Self-Check

BC-004 defines **only** Business Rules (BR-041…BR-048) in the 13-field normal form, each
atomic, observable, business-only, and dual-cited. It defines entitlement and the
*definition* of Teacher Debt; it introduces **no** settlement, payment, payment-voucher,
payment-lifecycle, or settlement-mechanism rule (all BC-006), no refund-event mechanics
(BC-005), no balances aggregation (BC-007), and no UI/engineering/DB/API/test. It
duplicates no prior BR, expands no product scope, and contradicts no Product Constitution
statement.
