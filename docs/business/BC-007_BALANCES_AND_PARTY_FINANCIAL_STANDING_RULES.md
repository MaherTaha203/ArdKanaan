# BC-007 — Balances & Party Financial Standing Rules

| Field | Value |
|---|---|
| Doc ID | BC-007 |
| Title | Balances & Party Financial Standing Rules |
| Phase | 2 (Business Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | BC-000 (framework); BC-001…BC-006 (all frozen; consumed); P2-000 + CDC; DOM-004 (DR-009/010/011/012/016/035); PC-003/004/006/007/008 (frozen) |
| Answers | "How are existing constitutional truths revealed without modifying them?" |

---

## 1. Purpose

BC-007 is the first document of the **Observation** layer (Layer 3). It formalizes how the
**derived financial truths** of the business — the Three Balances, the Teacher Balance,
Teacher Debt standing, and each Party's Financial Standing — are **revealed** without
altering anything. It **consumes** the frozen facts (BC-003), rights (BC-004), reversals
(BC-005), and discharges (BC-006), plus their program/pricing basis (BC-001/BC-002), and
**originates no new financial truth**. It defines **only** Business Rules.

> **Constitutional Principle #1.** Observation never creates, modifies, reverses,
> discharges, or legitimizes a constitutional truth. It only reveals constitutional truths
> established by previous layers.
>
> **Constitutional Definition — Observation.** Observation is the constitutional act of
> revealing existing financial truths derived entirely from constitutional facts, rights,
> and settlements established in BC-001 through BC-006.
>
> **Constitutional Boundary.** BC-007 owns financial balances, Teacher Balance, Teacher Debt
> standing, Party Financial Standing, derived financial readings, constitutional financial
> visibility, and read-only business financial state. It does **not** own fact creation,
> entitlement creation, settlement, refund logic, obligation discharge, payment execution,
> any calculation that redefines a prior truth, reporting presentation, UI, or analytics.
> **Aggregation is a mechanism of revelation, never a source of truth.** **BC-007 defines
> the constitutional rules by which balances are revealed from all constitutional financial
> facts available to the system.** It references no later document; new facts established
> later automatically fall under these same reveal rules.

## 2. Scope

**BC-007 governs:** the revelation of the Three Balances (Cash, Teacher Payables, Center Net
— never merged); the Teacher Balance per Teacher×Program; Teacher Debt standing per
Teacher×Program; each Party's Financial Standing (student and teacher); the read-only,
view-not-record nature of a statement; and full derivability/traceability of every revealed
value.

**BC-007 does NOT govern:** the creation of any fact, right, refund, settlement, or discharge
(BC-001…BC-006, consumed) — wherever a fact is established; reporting presentation,
dashboards, UI, analytics; any calculation that redefines a prior truth; any data,
engineering, or test concern.

## 3. Business Rule Principles

- **RP-31 — Reveal, never originate.** Observation reveals constitutional truths; it
  creates, modifies, reverses, discharges, or legitimizes none.
- **RP-32 — Every value is derived.** No revealed value is entered by hand; each is fully
  derived from prior constitutional truths.
- **RP-33 — Aggregation is mechanism, not truth.** Summation is one means of revelation; it
  is never the source of a value.
- **RP-34 — Separation is preserved on reveal.** Revelation preserves the frozen separations
  — the Three Balances are never merged; Teacher×Program values are never offset across
  programs.
- **RP-35 — Dual Authority.** Every BR cites both an Authority of Truth (DR) and an Authority
  of Constitutional Legitimacy (PC).

## 4. Business Rule Catalog

### Category — The Three Balances

**BR-067 — The Three Balances are revealed as three separate derived quantities, never merged**
- **Rule Statement:** The **Cash Balance** (all cash currently held), **Teacher Payables**
  (money currently owed to teachers, in aggregate), and **Center Net Balance** (the center's
  own earned share) are each revealed as a **derived** quantity, **derived exclusively from
  the constitutional financial truths available to the system**, and **never merged** into
  one figure. None is ever entered by hand.
- **Business Rationale:** merging them hides what the Owner needs to know — what is in the
  box, what is owed, what is earned.
- **Preconditions:** constitutional financial truths exist.
- **Trigger:** the Owner views the balances.
- **Required Outcome:** three separate derived values are revealed; none is stored or merged.
- **Exceptions:** none — separation is absolute.
- **Authority of Truth:** DR-016, DR-010.
- **Authority of Constitutional Legitimacy:** PC-004 AP-7 / PC-007 PR-014 / PC-008 AC-10
  (never merge); PC-007 PR-020 (reveal the three balances, derived); PC-006 (Cash / Teacher
  Payables / Center Net).
- **Affected Product Concepts:** The Three Balances.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** view the balances; confirm three separate derived values, never a
  merged figure.

### Category — Teacher Balance

**BR-068 — A Teacher Balance is revealed per Teacher×Program as a derived Outstanding**
- **Rule Statement:** A **Teacher Balance** is revealed for each **Teacher×Program** as the
  derived **Outstanding** = cumulative teacher share of that program's posted receipts
  (BC-004), reduced by refund recalculations (BC-004/BC-005) and by settlements (BC-006). It
  is never entered by hand and never global.
- **Business Rationale:** the Owner must see what each teacher is owed per program at any
  moment without computing.
- **Preconditions:** a Teacher×Program with posted financial activity.
- **Trigger:** the Owner views the teacher balance.
- **Required Outcome:** the per-program Teacher Balance is revealed, fully derived;
  entitlement and settlements are unchanged.
- **Exceptions:** none — per Teacher×Program only.
- **Authority of Truth:** DR-009, DR-034.
- **Authority of Constitutional Legitimacy:** consumes BC-004 (entitlement/Outstanding),
  BC-006 (settlement reduction); PC-007 PR-020 (reveal per-program teacher balances, derived);
  PC-006 (Teacher Balance / Outstanding Balance).
- **Affected Product Concepts:** Teacher Balance; Outstanding Balance.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** view a teacher balance; confirm it equals entitlement − settlements
  for that program, derived.

### Category — Teacher Debt Standing

**BR-069 — Teacher Debt standing is revealed per Teacher×Program, derived and never offset**
- **Rule Statement:** A **Teacher Debt standing** is revealed for each Teacher×Program as the
  derived debt balance defined by BC-004, reduced by settlements (BC-006); it is never
  negative, closes at zero, and is **never merged or offset** across programs.
- **Business Rationale:** the Owner must see per-program what a teacher owes, cleanly
  separated.
- **Preconditions:** a recognized Teacher Debt (BC-004) on a Teacher×Program.
- **Trigger:** the Owner views the debt standing.
- **Required Outcome:** the per-program debt standing is revealed, derived, non-negative,
  never offset across programs.
- **Exceptions:** none permitted.
- **Authority of Truth:** DR-009 (DR-031 supporting).
- **Authority of Constitutional Legitimacy:** consumes BC-004 (Teacher Debt), BC-006
  (settlement); PC-004 AP-7 / PC-007 PR-020 (reveal per-program teacher debts, derived);
  PC-003 (Teacher Debt).
- **Affected Product Concepts:** Teacher Debt.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** view a debt standing; confirm it is derived, non-negative, and
  isolated per program.

### Category — Party Financial Standing

**BR-070 — A Party's Financial Standing is revealed as a fully derived view**
- **Rule Statement:** A **Party Financial Standing** is revealed as a derived view of **all
  constitutional financial truths applicable to that party** — for a Student and for a
  Teacher alike — derived entirely from prior constitutional truths. It stores nothing.
- **Business Rationale:** each party's position must be visible at a glance, always
  reconstructable from the records.
- **Preconditions:** a party with recorded financial activity.
- **Trigger:** the Owner views the party's standing.
- **Required Outcome:** the standing is revealed entirely from derived constitutional truths;
  nothing is stored.
- **Exceptions:** none.
- **Authority of Truth:** DR-011, DR-035.
- **Authority of Constitutional Legitimacy:** PC-003 (Party Financial Standing, derived);
  PC-007 PR-020 (reveal each party's financial standing, derived); PC-008 AC-11 (reveal-only).
- **Affected Product Concepts:** Party Financial Standing; Teacher Balance; Teacher Debt.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** view a party's standing; confirm every figure traces to prior
  constitutional truths and nothing is stored.

### Category — Statement as View

**BR-071 — A statement is a view, not a record; producing one changes nothing**
- **Rule Statement:** An account statement or financial view **presents existing recorded
  activity**; producing one **records nothing new**, requires no input the records do not
  already contain, and changes no fact, right, obligation, or balance.
- **Business Rationale:** observation must be safe — looking never alters the truth.
- **Preconditions:** recorded activity exists.
- **Trigger:** the Owner produces a statement/view.
- **Required Outcome:** the view is rendered from existing records; no fact/right/obligation
  changes; nothing is written.
- **Exceptions:** none.
- **Authority of Truth:** DR-011.
- **Authority of Constitutional Legitimacy:** PC-002 PP-1 / PC-003 MMI-4 (derived, revealed
  only); PC-008 AC-11 (no authoring surface for a derived value).
- **Affected Product Concepts:** Party Financial Standing; Activity Record.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** produce a statement; confirm no record is created and no value
  changes.

### Category — Full Derivability

**BR-072 — Every revealed value is fully traceable to its constitutional components**
- **Rule Statement:** Every revealed financial value is **fully decomposable** to the
  constitutional truths that produce it — for a teacher balance: the Receipt Voucher,
  Student, Program, distribution percentage, teacher share, and settlements. A value that
  cannot be fully derived from prior constitutional truths is **not revealed** (INV-31).
- **Business Rationale:** a balance the Owner cannot decompose is a balance the Owner cannot
  trust.
- **Preconditions:** a revealed value.
- **Trigger:** the Owner inspects a value's components.
- **Required Outcome:** the value decomposes completely to its constitutional sources; an
  underivable value is never shown.
- **Exceptions:** none permitted.
- **Authority of Truth:** DR-035.
- **Authority of Constitutional Legitimacy:** PC-007 PR-032 (state derivable/inspectable) /
  PC-008 AC-21 (traceable, no hidden state); PC-007 PR-020.
- **Affected Product Concepts:** Teacher Balance; Party Financial Standing; Activity Record.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** decompose any revealed value to its components; confirm
  completeness.

### Category — Read-Only Separation

**BR-073 — Revelation is read-only and preserves every frozen separation**
- **Rule Statement:** Observation is **read-only**: no revealed value creates, modifies,
  reverses, discharges, or legitimizes any truth. Revelation **preserves the frozen
  separations** — the Three Balances are never merged, and Teacher×Program balances and debts
  are never offset across programs, in any revealed view.
- **Business Rationale:** the point of observation is to reflect the truth exactly, not to
  reshape it.
- **Preconditions:** any revealed view.
- **Trigger:** any observation.
- **Required Outcome:** the view is read-only and preserves all constitutional separations.
- **Exceptions:** none.
- **Authority of Truth:** DR-016 (DR-012 supporting).
- **Authority of Constitutional Legitimacy:** PC-004 AP-7 / PC-007 PR-014 / PC-008 AC-10
  (never merge/offset); PC-002 PP-1 (reveal-only).
- **Affected Product Concepts:** The Three Balances; Teacher Balance; Teacher Debt.
- **Affected Future Documents:** BC-009; Phase 4; Testing.
- **Verification Method:** confirm no view writes anything and no separation is collapsed.

## 5. Rule Categories

| # | Category | Rules |
|---|---|---|
| 1 | The Three Balances | BR-067 |
| 2 | Teacher Balance | BR-068 |
| 3 | Teacher Debt Standing | BR-069 |
| 4 | Party Financial Standing | BR-070 |
| 5 | Statement as View | BR-071 |
| 6 | Full Derivability | BR-072 |
| 7 | Read-Only Separation | BR-073 |

## 6. Business Rule Traceability Matrix

| BR | Frozen Domain | Product Constitution | Consumes (BC) | Future BC | Future UX | Future Eng | Future Testing |
|---|---|---|---|---|---|---|---|
| BR-067 | DR-016/010 | AP-7 / PR-014 / PR-020 / AC-10 / PC-006 | BC-003/005/006 | BC-009 | ✓ | ✓ | ✓ |
| BR-068 | DR-009/034 | PR-020 / PC-006 | BC-004/006 | BC-009 | ✓ | ✓ | ✓ |
| BR-069 | DR-009/031 | AP-7 / PR-020 / PC-003 | BC-004/006 | BC-009 | — | ✓ | ✓ |
| BR-070 | DR-011/035 | PR-020 / AC-11 / PC-003 | BC-002/003/004/005/006 | BC-009 | ✓ | ✓ | ✓ |
| BR-071 | DR-011 | PP-1 / MMI-4 / AC-11 | — | BC-009 | ✓ | ✓ | ✓ |
| BR-072 | DR-035 | PR-032 / AC-21 / PR-020 | BC-003/004/006 | BC-009 | — | ✓ | ✓ |
| BR-073 | DR-016/012 | AP-7 / PR-014 / AC-10 / PP-1 | — | BC-009 | — | ✓ | ✓ |

## 7. Coverage Report

| Frozen DR | Covered by | Frozen DR | Covered by |
|---|---|---|---|
| DR-009 | BR-068, BR-069 | DR-012 | BR-073 |
| DR-010 | BR-067 | DR-016 | BR-067, BR-073 |
| DR-011 | BR-070, BR-071 | DR-035 | BR-072 |

**Uncovered in-scope rules:** none. **Deliberately deferred:** the *creation* of every
fact/right/refund/settlement (BC-001…BC-006, consumed, not re-derived); the presentation
scope/period of statements (UNK-013 — a deferred design detail, not a domain rule, and a
presentation concern outside Observation's constitutional scope); reporting/UI/dashboards/
analytics (out of scope). BC-007 reveals from **all constitutional financial facts available
to the system** and references no later document; any facts a later document establishes flow
into the same reveal rules unchanged.

**Scope intentionally closed.** No additional frozen Domain Rules belong to this document.

## 8. Business Invariants *(derivational, not generative)*

- **INV-31 — Every observed financial value is completely derivable from constitutional
  truths established in BC-001 through BC-006.** *(entails BR-072; Principle #1)*
- **INV-32 — No observed value is entered by hand; every revealed value is derived.**
  *(entails BR-067/068/070; DR-009/010)*
- **INV-33 — The Three Balances are never merged, and Teacher×Program values are never offset
  across programs, in any revealed view.** *(entails BR-067/073; DR-016)*
- **INV-34 — Producing a statement or view changes no fact, right, or obligation.** *(entails
  BR-071; DR-011)*
- **INV-35 — No revealed value contradicts its constitutional source (Outstanding ≥ 0,
  Debt ≥ 0, the three shares conserve the amount).** *(entails BR-068/069; BC-004/006)*

## 9. Cross-Document Consistency Review

- **Consumed dependencies (existing frozen BC rules):** BC-001 (policy/split), BC-002
  (registration/FRP), BC-003 (posted facts), BC-004 (entitlement/Outstanding/Teacher Debt),
  BC-005 (refunds/cancellation), BC-006 (settlements) — all revealed, none re-derived; and
  the BC-000 framework.
- **Forward dependencies:** **none.** BC-007 reveals from all constitutional financial facts
  available to the system, regardless of which document established them; the dependency
  direction stays strictly Creation → Transformation → Observation, with no arrow to any
  future document.
- **Modifies / narrows / reinterprets any prior BR?** **Consumes only. No modification. No
  narrowing. No reinterpretation.** BC-007 reveals the frozen truths of BC-001…BC-006 with
  their meaning intact and originates none. *(Had any prior BR needed changing, this would
  STOP and be raised as an Amendment per GOV-004 §5 / BC-000 §BCG-3.)*

## 10. Strict-Scope Self-Check

BC-007 defines **only** Business Rules (BR-067…BR-073) in the 13-field normal form, each
atomic, observable, business-only, and dual-cited. It **reveals** derived truths; it
introduces **no** fact creation, entitlement creation, settlement, refund logic, discharge,
payment, redefining calculation, reporting presentation, UI, or analytics. It is
constitutionally self-contained and references no later document. It duplicates no prior BR,
expands no product scope, and contradicts no Product Constitution statement.

## 11. Four-Filter Review (self-applied; formally recorded in AUD-P2-009)

| Filter | Question | Result |
|---|---|---|
| **Rule** | Does the rule reveal a constitutional truth rather than create one? | ✓ BR-067…073 reveal derived balances/standing; none creates, modifies, reverses, discharges, or legitimizes a truth |
| **Document** | Constitutionally correct if reports/UI/layouts/dashboards change? | ✓ no BR depends on presentation; statements are views (BR-071); aggregation is mechanism, not truth |
| **Set** | Can every observed value be explained using BC-001…BC-007? | ✓ every observed value derives from the constitutional financial truths available to the system; BC-007 is self-contained and references no future document |
| **Constitutional Independence** | Consumes prior truths without originating a new foundational truth? | ✓ INV-31 holds; every value decomposes to prior constitutional truths (BR-072); none originates one |

Single property verified: **BC-007 reveals constitutional truths; it never produces them.**
