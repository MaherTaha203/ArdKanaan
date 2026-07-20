# BC-006 — Teacher Payment & Settlement Rules

| Field | Value |
|---|---|
| Doc ID | BC-006 |
| Title | Teacher Payment & Settlement Rules |
| Phase | 2 (Business Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | BC-000 (framework); BC-003 (posted receipts / immutable facts, consumed); BC-004 (Entitlement, Outstanding, Teacher Debt, consumed); BC-005 (cancellation mechanics, consumed); P2-000 + CDC; DOM-004 (DR-030/032/033/034/068/070); PC-003/004/006/007/008 (frozen) |
| Answers | "How is an already-defined financial right constitutionally discharged?" |

---

## 1. Purpose

BC-006 formalizes how a **pre-existing financial right or obligation is discharged** — the
settlement of a teacher's outstanding entitlement and the settlement of a Teacher Debt. It
is the final document of the **Transformation** layer (BC-004 derives rights · BC-005
reverses facts · **BC-006 discharges rights**). It **consumes** BC-004 (the obligations it
discharges), BC-005 (the cancellation mechanism), and BC-003 (immutable posted facts), and
**originates no new financial truth**. It defines **only** Business Rules.

> **Constitutional Principle #1.** Settlement never creates, modifies, or recalculates
> financial rights. It only discharges constitutionally established rights and obligations.
>
> **Constitutional Definition — Settlement.** Settlement is the constitutional act that
> discharges an existing financial obligation. It never creates an obligation, determines
> its legitimacy, or changes its amount.
>
> **Constitutional Boundary.** BC-006 owns Settlement, Teacher Payment, the settlement
> lifecycle, partial/full settlement, Outstanding reduction, Teacher Debt discharge, and
> settlement cancellation effects. It does **not** own Entitlement creation or calculation,
> refund calculation, reporting, standing, aggregation, or financial analytics (Layer 3 —
> Observation).

## 2. Scope

**BC-006 governs:** the settlement event (Owner-initiated); the Teacher Payment as the
instrument evidencing a settlement (scoped per Teacher×Program); Outstanding reduction;
partial and full settlement; the settlement lifecycle (Outstanding → Partially Settled →
Fully Settled); Teacher Debt discharge and its two Owner-chosen paths; settlement
cancellation effects; and settlement invariants.

**BC-006 does NOT govern:** Entitlement creation/calculation (BC-004, consumed); the
Teacher Debt *definition* (BC-004, consumed); refund calculation (BC-005/BC-004, consumed);
receipt facts (BC-003, consumed); balances aggregation, financial standing, reporting,
analytics, and entitlement traceability presentation (Layer 3 — BC-007/BC-009); any UX,
data, engineering, or test.

## 3. Business Rule Principles

- **RP-26 — Settlement discharges, never originates.** Settlement never creates, modifies,
  or recalculates a right; it only discharges an established obligation. *(Principle #1.)*
- **RP-27 — One settlement, one obligation.** Every settlement references exactly one
  pre-existing constitutional obligation (Outstanding entitlement, or a Teacher Debt), per
  Teacher×Program.
- **RP-28 — Discharge is Owner-initiated.** No settlement is ever system-generated; each is
  an explicit Owner act.
- **RP-29 — Discharge is bounded and non-negative.** No settlement exceeds the obligation
  it discharges; Outstanding and Debt floor at zero.
- **RP-30 — Dual Authority.** Every BR cites both an Authority of Truth (DR) and an
  Authority of Constitutional Legitimacy (PC).

## 4. Business Rule Catalog

### Category — Settlement Event

**BR-058 — A settlement is an Owner-initiated act discharging exactly one pre-existing obligation**
- **Rule Statement:** A settlement comes into being only by an explicit Owner act (never
  system-generated) and discharges **exactly one** pre-existing constitutional obligation —
  either a Teacher×Program **Outstanding** entitlement (BC-004) or a **Teacher Debt**
  (BC-004). It creates no obligation and changes no right's amount or legitimacy.
- **Business Rationale:** payment timing is a human agreement, not a system rule; discharge
  must attach to an existing obligation, never invent one.
- **Preconditions:** a pre-existing obligation (Outstanding entitlement or Teacher Debt) on
  a Teacher×Program.
- **Trigger:** the Owner issues a settlement.
- **Required Outcome:** a settlement exists, referencing exactly one obligation, beginning
  its discharge; no right is created or recalculated.
- **Exceptions:** none — advances before entitlement are forbidden (BR-061).
- **Authority of Truth:** DR-030 (DR-034 supporting).
- **Authority of Constitutional Legitimacy:** PC-007 PR-019 / PC-008 AC-15 (every financial
  change originates from an explicit owner action); PC-003 (teacher payment references one
  Teacher×Program).
- **Affected Product Concepts:** Teacher Balance; Teacher Debt.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** confirm a settlement is only Owner-created and always references
  exactly one obligation.

### Category — Teacher Payment Instrument

**BR-059 — A teacher payment settlement is evidenced by a Payment Voucher scoped to one Teacher×Program**
- **Rule Statement:** A settlement of outstanding entitlement is **evidenced by a Teacher
  Payment Voucher scoped to exactly one Teacher×Program** — a single voucher never spans
  multiple programs. **Voucher numbering is consumed from the frozen numbering
  constitution** (DR-090 / PC-004 SC-12 / PC-007 PR-018), not defined here.
- **Business Rationale:** program isolation requires atomic per-program payments; the
  document is only the instrument proving the settlement occurred, and its numbering and
  layout are not constitutional to BC-006.
- **Preconditions:** an outstanding entitlement on a Teacher×Program being settled.
- **Trigger:** the settlement is recorded.
- **Required Outcome:** the settlement is evidenced by a per-program Payment Voucher; its
  numbering is inherited, not authored.
- **Exceptions:** center-expense payment vouchers are general and carry no program (outside
  BC-006).
- **Authority of Truth:** DR-032 (per-program scope); *numbering consumed from DR-090.*
- **Authority of Constitutional Legitimacy:** PC-004 AP-7 (per-program isolation); PC-006
  (Payment Voucher); *numbering consumed from SC-12 / PR-018 / AC-14.*
- **Affected Product Concepts:** Teacher Balance; Training Program.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** inspect any teacher Payment Voucher — one program; confirm no BR
  depends on its field layout or numbering scheme.

### Category — Outstanding Reduction

**BR-060 — A settlement reduces the program's Outstanding by exactly the settled amount**
- **Rule Statement:** A settlement of entitlement reduces the Teacher×Program **Outstanding**
  by exactly the settled amount, where Outstanding = Total Entitlement (BC-004) − Total
  Settlements for that program. Settlements associate with the Program only — never with
  specific receipts (no allocation). Entitlement itself is unchanged.
- **Business Rationale:** one simple per-program subtraction replaces an allocation machine
  (M-08), and discharge reduces what is owed without altering what was earned.
- **Preconditions:** Outstanding > 0 on the Teacher×Program.
- **Trigger:** a settlement is recorded.
- **Required Outcome:** Outstanding decreases by the settled amount; entitlement is
  untouched; no receipt allocation occurs.
- **Exceptions:** the settlement amount is bounded by Outstanding (BR-061).
- **Authority of Truth:** DR-034.
- **Authority of Constitutional Legitimacy:** consumes BC-004 BR-042 (entitlement) /
  Outstanding; PC-004 AP-7 / PC-007 PR-014 (never offset); PC-006 (Outstanding Balance).
- **Affected Product Concepts:** Teacher Balance; Outstanding Balance.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** settle an amount; confirm Outstanding falls by exactly that
  amount and entitlement is unchanged.

**BR-061 — Settlement is bounded by Outstanding; advances are forbidden and Outstanding never goes negative**
- **Rule Statement:** A settlement may be any amount up to the program's Outstanding; a
  settlement that would exceed Outstanding is forbidden. Advance payment before entitlement
  exists is forbidden, so Outstanding can never become negative.
- **Business Rationale:** money owed is the ceiling of money paid.
- **Preconditions:** an Outstanding value on the Teacher×Program.
- **Trigger:** a settlement is attempted.
- **Required Outcome:** the settlement is accepted only if ≤ Outstanding; Outstanding stays
  in [0, entitlement].
- **Exceptions:** none in V1.
- **Authority of Truth:** DR-033 (DR-034 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (no negative balance); PC-004 §1.
- **Affected Product Concepts:** Outstanding Balance; Teacher Balance.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** attempt a settlement above Outstanding; confirm it is prevented.

### Category — Settlement Lifecycle

**BR-062 — Partially Settled and Fully Settled are derived readings of Outstanding, not independent states**
- **Rule Statement:** The only settlement transition is that **a settlement reduces
  Outstanding** (BR-060). **"Partially Settled" (Outstanding > 0 after settlement) and
  "Fully Settled" (Outstanding = 0) are derived readings of Outstanding — revealed, never
  authored** — not independent events or new states this document creates. The reading is
  monotonic under settlement (Outstanding only decreases).
- **Business Rationale:** the discharge state is nothing more than what remaining
  Outstanding expresses; naming it does not create it.
- **Preconditions:** an obligation with an Outstanding value.
- **Trigger:** each settlement.
- **Required Outcome:** the settlement state is read directly from Outstanding — Partially
  Settled while > 0, Fully Settled at 0; no independent state is stored or created.
- **Exceptions:** cancellation of a settlement moves the reading back (BR-066).
- **Authority of Truth:** DR-033, DR-034.
- **Authority of Constitutional Legitimacy:** PC-003 (derived state, revealed);
  PC-007 PR-015 (derived, revealed only).
- **Affected Product Concepts:** Outstanding Balance; Teacher Balance.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** settle partially then fully; confirm the reading moves Partially
  → Fully Settled at zero, with no separate stored state.

### Category — Teacher Debt Discharge

**BR-063 — A settlement discharges a Teacher Debt by reducing its balance toward zero**
- **Rule Statement:** A settlement applied to a **Teacher Debt** (defined by BC-004) reduces
  the debt balance by the settled amount; the debt only decreases, never below zero, and is
  **closed** when it reaches zero. The debt's definition and amount are not recalculated
  here — only discharged.
- **Business Rationale:** a debt is a finite amount to be returned; settlement converges it
  to zero.
- **Preconditions:** a recognized Teacher Debt (BC-004 BR-046/BR-048).
- **Trigger:** a settlement toward the debt.
- **Required Outcome:** the debt balance decreases by the settled amount, flooring at zero
  and closing at zero.
- **Exceptions:** none — never negative.
- **Authority of Truth:** DR-068 (DR-067 nature, consumed from BC-004).
- **Authority of Constitutional Legitimacy:** consumes BC-004 BR-046/BR-048; PC-004 AP-7
  (per-program); PC-003 (Teacher Debt).
- **Affected Product Concepts:** Teacher Debt.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** settle a debt partially then fully; confirm it decreases and
  closes at zero.

**BR-064 — A Teacher Debt is settled by direct repayment or same-program deduction**
- **Rule Statement:** The settlement path for a Teacher Debt is **explicitly selected by the
  Owner** (never an automatic system action). The available paths are **(a)** direct
  repayment by the teacher to the center, or **(b)** deduction from the teacher's future
  entitlement **on the same program**; the two may be combined on one debt. Cross-program
  deduction is forbidden.
- **Business Rationale:** both paths occur in real life; the Owner decides; program
  isolation confines deduction to the program that generated the debt.
- **Preconditions:** a Teacher Debt on a Teacher×Program.
- **Trigger:** the Owner settles the debt by a selected path.
- **Required Outcome:** the debt decreases via repayment and/or same-program deduction; no
  cross-program deduction occurs.
- **Exceptions:** deduction requires future entitlement on that program (else BR-065).
- **Authority of Truth:** DR-068 (DR-066 supporting).
- **Authority of Constitutional Legitimacy:** PC-007 PR-019 / PC-008 AC-15 (owner-originated);
  PC-004 AP-7 (never offset across programs).
- **Affected Product Concepts:** Teacher Debt; Teacher Balance.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** settle a debt by repayment, by same-program deduction, and by a
  combination; confirm no cross-program draw.

**BR-065 — With no future entitlement on the program, a debt is discharged only by direct repayment**
- **Rule Statement:** If no further entitlement remains on the debt's program, same-program
  deduction is impossible; the debt stays open as a balance owed to the center, and the only
  remaining discharge path is direct repayment. Cross-program settlement remains forbidden;
  the debt never expires (BC-004).
- **Business Rationale:** program isolation rules out drawing on another program; the debt
  does not disappear.
- **Preconditions:** a Teacher Debt whose program has no future entitlement.
- **Trigger:** an attempt to settle the debt.
- **Required Outcome:** only direct repayment discharges it; it otherwise stays open.
- **Exceptions:** none.
- **Authority of Truth:** DR-070 (DR-069 no-expiry consumed from BC-004).
- **Authority of Constitutional Legitimacy:** consumes BC-004 BR-047/BR-048; PC-004 AP-7.
- **Affected Product Concepts:** Teacher Debt.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** with no future entitlement, confirm deduction is unavailable and
  only repayment clears the debt.

### Category — Settlement Cancellation

**BR-066 — Cancelling a settlement reverses its discharge, restoring the prior obligation**
- **Rule Statement:** A settlement may be cancelled using the cancellation mechanism of
  **BC-005**; cancelling a settlement reverses exactly its discharge — the program's
  Outstanding (or the Teacher Debt) returns to its pre-settlement value — while all
  unrelated subsequent facts are preserved. **Cancellation restores the previous obligation;
  it never creates a new obligation.**
- **Business Rationale:** an erroneous discharge must be undoable without inventing a right
  or losing history.
- **Preconditions:** a posted settlement, independently cancellable (BC-005 BR-055).
- **Trigger:** the Owner cancels the settlement.
- **Required Outcome:** the discharged amount is restored to Outstanding or the Debt;
  unrelated facts persist; the original settlement is preserved as Cancelled (BC-005
  BR-056); no new obligation is created.
- **Exceptions:** dependency ordering per BC-005 BR-055.
- **Authority of Truth:** DR-034 (DR-045 reversal consumed from BC-005).
- **Authority of Constitutional Legitimacy:** consumes BC-005 BR-054/BR-055/BR-056;
  PC-004 AP-3 / PC-008 AC-03 (additive, non-destructive).
- **Affected Product Concepts:** Teacher Balance; Teacher Debt; Activity Record.
- **Affected Future Documents:** BC-007; Phase 4; Testing.
- **Verification Method:** cancel a settlement; confirm Outstanding/Debt returns to its
  pre-settlement value, the original is preserved as Cancelled, and no new obligation
  appears.

## 5. Rule Categories

| # | Category | Rules |
|---|---|---|
| 1 | Settlement Event | BR-058 |
| 2 | Teacher Payment Instrument | BR-059 |
| 3 | Outstanding Reduction | BR-060, BR-061 |
| 4 | Settlement Lifecycle | BR-062 |
| 5 | Teacher Debt Discharge | BR-063, BR-064, BR-065 |
| 6 | Settlement Cancellation | BR-066 |

## 6. Business Rule Traceability Matrix

| BR | Frozen Domain | Product Constitution | Consumes (BC) | Future BC | Future UX | Future Eng | Future Testing |
|---|---|---|---|---|---|---|---|
| BR-058 | DR-030 | PR-019 / AC-15 / PC-003 | BC-004 | BC-007 | — | ✓ | ✓ |
| BR-059 | DR-032 (DR-090 consumed) | AP-7 / PC-006 (SC-12/PR-018 consumed) | — | BC-007 | ✓ | ✓ | ✓ |
| BR-060 | DR-034 | AP-7 / PR-014 / PC-006 | BC-004 BR-042 | BC-007 | — | ✓ | ✓ |
| BR-061 | DR-033 | PC-003/004 | BC-004 | BC-007 | — | ✓ | ✓ |
| BR-062 | DR-033/034 | PC-003 / PR-015 | BC-004 | BC-007 | ✓ | ✓ | ✓ |
| BR-063 | DR-068/067 | AP-7 / PC-003 | BC-004 BR-046/048 | BC-007 | — | ✓ | ✓ |
| BR-064 | DR-068 | PR-019 / AC-15 / AP-7 | BC-004 BR-046 | BC-007 | ✓ | ✓ | ✓ |
| BR-065 | DR-070 | AP-7 | BC-004 BR-047/048 | BC-007 | — | ✓ | ✓ |
| BR-066 | DR-034/045 | AP-3 / AC-03 | BC-005 BR-054/055/056 | BC-007 | ✓ | ✓ | ✓ |

## 7. Coverage Report

| Frozen DR | Covered by | Frozen DR | Covered by |
|---|---|---|---|
| DR-030 | BR-058 | DR-034 | BR-060 (+BR-066) |
| DR-032 | BR-059 | DR-068 | BR-064 (+BR-063) |
| DR-033 | BR-061, BR-062 | DR-070 | BR-065 |

**Uncovered in-scope rules:** none. **Deliberately deferred:** entitlement
traceability/breakdown presentation (DR-035) is **Observation** → BC-007/BC-009; the Teacher
Debt *definition, non-negativity nature, and no-expiry* (DR-065/067/069) are consumed from
**BC-004**; refund/cancellation *mechanics* (DR-045…048) are consumed from **BC-005**;
balances aggregation and financial standing are **BC-007**; voucher numbering is consumed
from the frozen numbering constitution (DR-090).

**Scope intentionally closed.** No additional frozen Domain Rules belong to this document.

## 8. Business Invariants *(derivational, not generative)*

- **INV-26 — Every settlement references exactly one pre-existing constitutional
  obligation.** *(entails BR-058; Principle #1)*
- **INV-27 — Every settlement leaves Total Entitlement unchanged.** *(entails BR-060;
  DR-034 — a settlement reduces Outstanding, never entitlement)*
- **INV-28 — Outstanding and Teacher Debt never go negative; settlement floors them at
  zero.** *(entails BR-061/063; DR-033/067)*
- **INV-29 — No settlement exceeds the obligation it discharges (no advance/overpayment).**
  *(entails BR-061; DR-033)*
- **INV-30 — Cross-program deduction is never a settlement path.** *(entails BR-064/065;
  DR-066/068/070)*

## 9. Cross-Document Consistency Review

- **Consumed dependencies (existing frozen BC rules):** BC-004 — BR-042
  (entitlement/Outstanding), BR-046 (Teacher Debt definition), BR-047/BR-048 (per-program,
  nature); BC-005 — BR-054/BR-055/BR-056 (cancellation mechanics); BC-003 — immutable posted
  facts; and the BC-000 framework.
- **Forward dependencies (not consumption; authored later):** BC-007 (balances aggregation /
  financial standing / entitlement traceability presentation).
- **Modifies / narrows / reinterprets any prior BR?** **Consumes only. No modification. No
  narrowing. No reinterpretation.** BC-006 discharges the obligations BC-004 defined and
  reuses BC-005's cancellation mechanism, with every prior rule's frozen meaning intact.
  *(Had any prior BR needed changing, this would STOP and be raised as an Amendment per
  GOV-004 §5 / BC-000 §BCG-3.)*

## 10. Strict-Scope Self-Check

BC-006 defines **only** Business Rules (BR-058…BR-066) in the 13-field normal form, each
atomic, observable, business-only, and dual-cited. It **discharges** pre-existing rights and
obligations; it introduces **no** entitlement creation/calculation, no refund calculation,
no balances aggregation, no financial standing, no reporting/analytics, and no
UI/engineering/DB/API/test. The Teacher Payment Voucher appears only as the instrument
evidencing a settlement — never as the document's subject — and its numbering is consumed,
not defined. It duplicates no prior BR, expands no product scope, and contradicts no Product
Constitution statement.

## 11. Four-Filter Review (self-applied; formally recorded in AUD-P2-008)

| Filter | Question | Result |
|---|---|---|
| **Rule** | Does each BR describe a state transition? | ✓ BR-058…066 move the obligation (Outstanding↓, Debt↓, discharge reversal); BR-062 reveals derived readings, not new states; BR-059 states per-program scope only (numbering consumed) |
| **Document** | Does the document stay valid if the Payment Voucher layout changes? | ✓ no BR depends on voucher fields, layout, or numbering scheme |
| **Set** | Can the full settlement lifecycle be understood using only BC-003…BC-006? | ✓ every transition traces to posted facts (BC-003) → entitlement/debt (BC-004) → settlement (BC-006); no reach into BC-007+ |
| **Constitutional Independence** | Does every BR consume prior truths without originating a new foundational truth? | ✓ every BR is the discharge stage of Posted Receipt → Entitlement → (Refund) → Settlement; none founds a new truth |

Single property verified: **BC-006 is a consumer of constitutional truths, never a producer
of them.**
