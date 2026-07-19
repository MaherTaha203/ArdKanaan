# BC-001 — Programs, Pricing & Distribution Policy Rules

| Field | Value |
|---|---|
| Doc ID | BC-001 |
| Title | Programs, Pricing & Distribution Policy Rules |
| Phase | 2 (Business Constitution) |
| Status | FROZEN |
| Version | 1.0.1 |
| Depends on | BC-000 (framework, Dual Authority); P2-000; DOM-004 (DR-016/028/031/071–079 + supporting); PC-003/004/006/007/008 (frozen); GOV-006/011/012 |
| Answers | "How are Training Programs, Pricing, and Revenue Distribution governed as Business Rules?" |

---

## 1. Purpose

BC-001 formalizes the frozen Domain truth about **Training Programs, their pricing, and
revenue distribution** into atomic **Business Rules (BR-NNN)**. It is the first
specialized document of Phase 2 and the foundation of every later BC document:
registration, receipts, entitlement, and refunds all depend on the program, price, and
split rules fixed here. It defines **only** Business Rules — no implementation, UI,
technology, or test.

## 2. Scope

**BC-001 governs:** Training Program identity & lifecycle; program ownership (teacher);
program base price; the registration-price relationship (default + override); the Final
Registration Price and its immutability; the Revenue Distribution Policy; the
teacher/center percentage split; distribution immutability; and program operational
constraints (Open/Closed, documentary dates, per-Teacher×Program independence).

**BC-001 does NOT govern:** how receipts, refunds, corrections, entitlement, payments,
debts, or balances *behave* (BC-003…BC-007); registration lifecycle beyond price
(BC-002); non-program revenue and expenses (BC-008); any UX, data, engineering, or test
concern. It defines no capacity or cohort behavior (frozen as Future Considerations —
out of V1 scope; no scope expansion).

## 3. Business Rule Principles

- **RP-1 — Program is the financial anchor.** Every rule treats a Program (single run)
  as an independent financial unit; no rule links two programs.
- **RP-2 — Price is one stored figure.** Pricing rules operate on a single stored
  amount, never a derived `base − discount`.
- **RP-3 — Split conserves value.** Every distribution rule preserves the exact voucher
  amount; shares always total 100%.
- **RP-4 — Immutability by new fact.** A change to a locked price or a fixed policy is
  realized by a new record (new program), never by editing a posted one (PC-002 PP-3;
  PC-004 AP-3).
- **RP-5 — Dual Authority.** Every BR cites both an Authority of Truth (DR) and an
  Authority of Constitutional Legitimacy (PC) — BC-000 §4.0.

## 4. Business Rule Catalog

### Category — Program Identity

**BR-001 — A Program is a single, independent Program Run**
- **Rule Statement:** In V1 a Program is one Program Run with its own financial
  identity; every financial attribute (teacher, distribution %, price, students,
  receipts, refunds, entitlements, payments, balances, debts) belongs to that run alone.
- **Business Rationale:** Each offering has its own agreement, price, and students;
  independence keeps every balance unambiguous.
- **Preconditions:** a Program is being created.
- **Trigger:** Program creation.
- **Required Outcome:** the Program holds its own complete financial identity,
  independent of every other Program.
- **Exceptions:** none — independence is absolute.
- **Authority of Truth:** DR-071 (DR-002/003/004 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Training Program); PC-004 §1
  (in-scope); PC-006 (canonical "Training Program").
- **Affected Product Concepts:** Training Program.
- **Affected Future Documents:** BC-002…BC-007; Phase 4 Data; Phase 3 UX; Testing.
- **Verification Method:** inspect any two Programs — no shared financial attribute
  exists.

**BR-002 — A shared service-name is a label only, with no financial link**
- **Rule Statement:** Two Programs carrying the same service name (e.g. "ICDL — Jan
  2026" / "ICDL — Sep 2026") are distinct Programs; the shared name is a label for the
  service type and creates no financial link.
- **Business Rationale:** naming convenience must never become a financial relationship.
- **Preconditions:** two or more Programs share a service name.
- **Trigger:** creation or reference of a same-named Program.
- **Required Outcome:** no balance, entitlement, price, or policy is shared or offset
  between same-named Programs.
- **Exceptions:** none — the only shared thing is the label.
- **Authority of Truth:** DR-071.
- **Authority of Constitutional Legitimacy:** PC-003 (Training Program = one run);
  PC-006 (bans "course template/catalog item").
- **Affected Product Concepts:** Training Program.
- **Affected Future Documents:** BC-007 (balances); Phase 4; Testing.
- **Verification Method:** confirm same-named Programs have fully separate financial
  records.

**BR-003 — Any number of Programs may be concurrently open**
- **Rule Statement:** Multiple Programs, including same-named runs, may be open at the
  same time.
- **Business Rationale:** the center runs offerings in parallel.
- **Preconditions:** ≥1 Program exists.
- **Trigger:** creating/opening an additional Program.
- **Required Outcome:** concurrency is permitted; no rule caps the number of open
  Programs.
- **Exceptions:** none.
- **Authority of Truth:** DR-071 (S10-D14).
- **Authority of Constitutional Legitimacy:** PC-004 §1 (in-scope); PC-003.
- **Affected Product Concepts:** Training Program; Operational Status.
- **Affected Future Documents:** BC-002; Phase 3 UX; Phase 4.
- **Verification Method:** confirm no limit blocks concurrent open Programs.

### Category — Program Ownership

**BR-004 — A Program belongs to exactly one Teacher**
- **Rule Statement:** Each Program is owned by exactly one Teacher for its whole life.
- **Business Rationale:** the offering's agreement is with a single teacher; entitlement
  is defined per Teacher×Program.
- **Preconditions:** a Program is being created.
- **Trigger:** Program creation.
- **Required Outcome:** the Program references one, and only one, Teacher.
- **Exceptions:** none in V1.
- **Authority of Truth:** DR-071 ("its own teacher"); DR-031 (Teacher×Program).
- **Authority of Constitutional Legitimacy:** PC-003 (Training Program "belongs to one
  Teacher"; "one teacher per program").
- **Affected Product Concepts:** Training Program; Teacher.
- **Affected Future Documents:** BC-004 (entitlement); Phase 4; Testing.
- **Verification Method:** inspect any Program — exactly one Teacher is referenced.

### Category — Program Lifecycle

**BR-015 — A Program records documentary start and end dates that drive no behavior**
- **Rule Statement:** Each Program records a start date and an end date, captured at
  creation; in V1 these are documentary only — the system never auto-closes, never
  blocks registration or receipts by date, and creates no date-driven operations.
- **Business Rationale:** dates aid organization and reporting; operation is governed by
  Open/Closed status, not the calendar.
- **Preconditions:** a Program is being created.
- **Trigger:** Program creation; passage of the end date.
- **Required Outcome:** dates are stored; reaching the end date changes nothing on its
  own.
- **Exceptions:** none — dates never trigger automatic behavior in V1.
- **Authority of Truth:** DR-077.
- **Authority of Constitutional Legitimacy:** PC-004 §2 (no automation beyond scope);
  PC-003.
- **Affected Product Concepts:** Training Program; Operational Status.
- **Affected Future Documents:** BC-002; Phase 3; Phase 4.
- **Verification Method:** advance past an end date; confirm no automatic effect.

**BR-016 — A Program's Open/Closed status governs new business**
- **Rule Statement:** Each Program has an Owner-controlled status, Open or Closed.
  Closing blocks new business — no new registrations and no new receipts — while all
  existing records stay visible and legitimate operations on existing records (e.g. a
  refund against an existing receipt) remain allowed. Closing deletes nothing and alters
  no entitlement or balance. **Closing never invalidates existing business facts.**
- **Business Rationale:** the Owner must stop new activity on a finished offering
  without freezing the legitimate lifecycle of existing records.
- **Preconditions:** a Program exists.
- **Trigger:** the Owner closes the Program.
- **Required Outcome:** new registrations and new receipts are blocked; existing records
  and their legitimate operations remain; **no existing business fact is invalidated by
  closing.**
- **Exceptions:** management/correction of pre-existing records (refunds, cancellations)
  is not "new business" and stays allowed.
- **Authority of Truth:** DR-078 (DR-022/023 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Operational Status); PC-004 §1.
- **Affected Product Concepts:** Training Program; Operational Status; Receipt Voucher;
  Registration.
- **Affected Future Documents:** BC-002; BC-003; BC-005; Phase 3; Phase 4; Testing.
- **Verification Method:** close a Program; confirm new registrations/receipts blocked
  but an existing-receipt refund still allowed, and no prior fact changes.

**BR-017 — Open/Closed is a reversible operational status**
- **Rule Statement:** A Closed Program may be reopened by the Owner at any time,
  restoring new business; Open/Closed never changes the program's identity, dates,
  price, distribution percentage, or historical data.
- **Business Rationale:** a program may legitimately need to reopen; reopening is a
  status change, not a new program.
- **Preconditions:** a Closed Program.
- **Trigger:** the Owner reopens the Program.
- **Required Outcome:** new business is restored; no identity, price, percentage, date,
  or history changes.
- **Exceptions:** none.
- **Authority of Truth:** DR-079.
- **Authority of Constitutional Legitimacy:** PC-003 (Operational Status "reversible");
  PC-004 §1.
- **Affected Product Concepts:** Training Program; Operational Status.
- **Affected Future Documents:** BC-003; Phase 3; Phase 4; Testing.
- **Verification Method:** reopen a Closed Program; confirm new business resumes and all
  prior data is intact.

### Category — Program Pricing

**BR-005 — A Program carries exactly one base price, set at creation**
- **Rule Statement:** Each Program has one base price, fixed at creation, that serves as
  the default amount due for its registrations.
- **Business Rationale:** the price is a property of the offering.
- **Preconditions:** a Program is being created.
- **Trigger:** Program creation.
- **Required Outcome:** the Program stores exactly one base price.
- **Exceptions:** none — a *registration's* amount may still be overridden (BR-007),
  which does not change the base price.
- **Authority of Truth:** DR-072.
- **Authority of Constitutional Legitimacy:** PC-003 (Program "carries … one base
  price"); PC-004 §1.
- **Affected Product Concepts:** Training Program.
- **Affected Future Documents:** BC-002; Phase 4; Testing.
- **Verification Method:** inspect any Program — exactly one base price is present.

**BR-006 — A registration's default amount due is the program base price**
- **Rule Statement:** When a student registers, the registration takes the program's
  base price as its default amount due.
- **Business Rationale:** the price applies automatically at registration.
- **Preconditions:** a Program with a base price; a student registers.
- **Trigger:** registration is created.
- **Required Outcome:** the new registration's amount due defaults to the base price.
- **Exceptions:** the default may be overridden per registration (BR-007).
- **Authority of Truth:** DR-072 (DR-022 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Registration holds a Final
  Registration Price); PC-006.
- **Affected Product Concepts:** Registration; Training Program; Final Registration
  Price.
- **Affected Future Documents:** BC-002; Phase 3; Phase 4; Testing.
- **Verification Method:** confirm a new registration with no override equals the base
  price.

### Category — Registration Pricing

**BR-007 — A registration's price may be overridden per registration**
- **Rule Statement:** The Owner may set an individual registration's price different
  from the base price; the override applies to that registration only and changes
  neither the base price nor any other registration.
- **Business Rationale:** a student may be admitted at a different agreed amount without
  disturbing others.
- **Preconditions:** a registration exists and its price is not yet locked (BR-013).
- **Trigger:** the Owner sets a registration-specific price.
- **Required Outcome:** only that registration's Final Registration Price changes.
- **Exceptions:** not permitted once the price is locked (BR-013).
- **Authority of Truth:** DR-073.
- **Authority of Constitutional Legitimacy:** PC-003 (Registration "owns the amount
  due"); PC-004 §1.
- **Affected Product Concepts:** Registration; Final Registration Price.
- **Affected Future Documents:** BC-002; Phase 3; Phase 4; Testing.
- **Verification Method:** override one registration; confirm base price and other
  registrations are unchanged.

**BR-008 — The amount due is a single stored Final Registration Price; no discount concept**
- **Rule Statement:** A registration's amount due is one stored value — the Final
  Registration Price. It is not derived from `base − discount`; V1 has no discount
  entity, field, percentage, or reason.
- **Business Rationale:** one clear figure keeps pricing unambiguous; the reason for a
  difference is administrative (M-08).
- **Preconditions:** a registration exists.
- **Trigger:** the Final Registration Price is set (default or override).
- **Required Outcome:** a single amount is stored directly; no discount is computed or
  recorded.
- **Exceptions:** none in V1.
- **Authority of Truth:** DR-074.
- **Authority of Constitutional Legitimacy:** PC-006 (Final Registration Price; bans
  "discount/net price"); PC-003; PC-004 §2 (no discount).
- **Affected Product Concepts:** Final Registration Price; Registration.
- **Affected Future Documents:** BC-002; BC-003; Phase 4; Testing.
- **Verification Method:** confirm the amount due is one stored figure with no discount
  element.

**BR-009 — The Final Registration Price is the sole amount-due reference**
- **Rule Statement:** The Final Registration Price is the single reference for that
  registration's receipts, refunds, and overpayment prevention.
- **Business Rationale:** every money-in/out check needs one unambiguous amount due.
- **Preconditions:** a registration with a Final Registration Price.
- **Trigger:** a receipt, refund, or overpayment check on the registration.
- **Required Outcome:** the operation measures against the Final Registration Price and
  no other figure.
- **Exceptions:** none.
- **Authority of Truth:** DR-074, DR-024 (overpayment).
- **Authority of Constitutional Legitimacy:** PC-003 (Registration/Receipt); PC-004 §1.
- **Affected Product Concepts:** Final Registration Price; Receipt Voucher; Refund
  Voucher.
- **Affected Future Documents:** BC-003; BC-005; Phase 4; Testing.
- **Verification Method:** confirm receipt/refund/overpayment checks reference only the
  Final Registration Price.

### Category — Price Immutability

**BR-013 — The Final Registration Price locks at the first receipt**
- **Rule Statement:** A registration's Final Registration Price may be edited until the
  first Receipt Voucher for that registration is recorded; once the first receipt
  exists, the price is locked and never changed. Later corrections are made through
  financial operations (e.g. a refund), never by altering the amount due.
- **Business Rationale:** the first receipt begins the financial record built on that
  amount; changing it afterward would distort balances, receipts, refunds, and
  overpayment prevention.
- **Preconditions:** a registration with a Final Registration Price.
- **Trigger:** the first Receipt Voucher for the registration is recorded.
- **Required Outcome:** the Final Registration Price becomes permanently immutable.
- **Exceptions:** none — corrections occur via financial operations, not price edits.
- **Authority of Truth:** DR-075 (DR-044 kin).
- **Authority of Constitutional Legitimacy:** PC-002 PP-3 / PC-004 AP-3 / PC-007 PR-004
  / PC-008 AC-03 (no edit/delete of a posted fact; additive correction).
- **Affected Product Concepts:** Final Registration Price; Receipt Voucher.
- **Affected Future Documents:** BC-003; BC-005; Phase 4; Testing.
- **Verification Method:** after a registration's first receipt, confirm the price
  cannot change.

### Category — Revenue Distribution Policy

**BR-010 — A Program owns exactly one Revenue Distribution Policy, a fixed percentage split, set at creation**
- **Rule Statement:** Each Program carries exactly one Revenue Distribution Policy — a
  fixed teacher/center percentage split — set at creation and belonging to that Program
  alone.
- **Business Rationale:** the split is part of the program's financial identity,
  consumed whenever a receipt is divided.
- **Preconditions:** a Program is being created.
- **Trigger:** Program creation.
- **Required Outcome:** the Program references one Policy with a fixed teacher/center
  percentage.
- **Exceptions:** none — one Policy per Program at all times.
- **Authority of Truth:** DR-076, DR-013.
- **Authority of Constitutional Legitimacy:** PC-003 (Revenue Distribution Policy
  "belongs to exactly one Program"); PC-006 (bans "commission/pay rate").
- **Affected Product Concepts:** Revenue Distribution Policy; Training Program.
- **Affected Future Documents:** BC-003; BC-004; Phase 4; Testing.
- **Verification Method:** inspect any Program — exactly one Policy with a fixed
  percentage.

### Category — Teacher Share

**BR-011 — The Teacher Share of a receipt is the program percentage, rounded to the nearest whole shekel (round-half-up)**
- **Rule Statement:** When a program-fee receipt is split, the Teacher Share equals the
  Policy's teacher percentage of the voucher amount, rounded to the nearest whole
  shekel; on an exact half (.5) it rounds up.
- **Business Rationale:** whole-shekel operation requires one deterministic integer rule.
- **Preconditions:** a program-fee receipt is being recorded on a Program with a Policy.
- **Trigger:** a Receipt Voucher is recorded.
- **Required Outcome:** a whole-shekel Teacher Share is produced by round-half-up.
- **Exceptions:** none — reachable only for percentages that can yield halves; never
  70/30.
- **Authority of Truth:** DR-028 (DR-025 supporting).
- **Authority of Constitutional Legitimacy:** PC-003 (Receipt Voucher drives Teacher
  Balance); PC-004 §1.
- **Affected Product Concepts:** Receipt Voucher; Teacher Balance; Revenue Distribution
  Policy.
- **Affected Future Documents:** BC-003; BC-004; BC-007; Phase 4; Testing.
- **Verification Method:** for a sample receipt, confirm Teacher Share = round-half-up
  (amount × teacher %).

### Category — Center Share

**BR-012 — The Center Share is the receipt remainder; Teacher + Center Share always total the full amount and feed the three balances, never merged**
- **Rule Statement:** The Center Share equals the voucher amount minus the Teacher Share
  (absorbing any rounding difference). The Teacher Share and Center Share always sum to
  exactly the full voucher amount, and the receipt raises Cash Balance, Teacher
  Payables, and Center Net Balance — three balances that are never merged.
- **Business Rationale:** value must be conserved exactly; rounding may never create an
  independent accounting difference; the three balances must stay distinct.
- **Preconditions:** a Teacher Share has been computed (BR-011).
- **Trigger:** a Receipt Voucher is recorded.
- **Required Outcome:** Center Share = amount − Teacher Share; the two shares sum to the
  exact amount; the three balances update independently.
- **Exceptions:** none — conservation is absolute; the balances are never merged.
- **Authority of Truth:** DR-028, DR-016.
- **Authority of Constitutional Legitimacy:** PC-004 AP-7 / PC-007 PR-014 / PC-008 AC-10
  (never merge/offset); PC-006 (Cash Balance / Teacher Payables / Center Net Balance).
- **Affected Product Concepts:** Receipt Voucher; The Three Balances; Center Net Balance.
- **Affected Future Documents:** BC-003; BC-007; Phase 4; Testing.
- **Verification Method:** for any receipt, confirm Teacher Share + Center Share = amount
  exactly, and the three balances are reported separately.

### Category — Distribution Immutability

**BR-014 — A Program's distribution percentage is fixed for the program's life; a new split requires a new Program**
- **Rule Statement:** Once set at creation, a Program's teacher/center percentage is
  immutable for the program's whole life; a different agreement is realized by creating
  a new Program with the new percentage, never by editing an existing one.
- **Business Rationale:** the percentage is part of the program's financial identity;
  changing it mid-life would corrupt entitlement, past receipts, refunds, balances, and
  audit.
- **Preconditions:** a Program exists with a set percentage.
- **Trigger:** a need for a different split arises.
- **Required Outcome:** the existing percentage is unchanged; any new agreement is a new
  Program.
- **Exceptions:** none permitted.
- **Authority of Truth:** DR-076 (DR-006/013 supporting).
- **Authority of Constitutional Legitimacy:** PC-004 AP-3 / PC-007 PR-017 (permanence);
  PC-003 (Policy identity).
- **Affected Product Concepts:** Revenue Distribution Policy; Training Program.
- **Affected Future Documents:** BC-003; BC-004; Phase 4; Testing.
- **Verification Method:** confirm no operation edits a live program's percentage; a
  changed split appears only as a new Program.

### Category — Operational Constraints

**BR-018 — Every Teacher × Program pair is an independent financial relationship**
- **Rule Statement:** Teacher balances and entitlement are never global; each Teacher ×
  Program combination carries its own independent balance, settled per program, and is
  never offset against another program.
- **Business Rationale:** financial separation between programs is mandatory and keeps
  liability unambiguous.
- **Preconditions:** a Teacher owns ≥1 Program.
- **Trigger:** any entitlement, payment, or balance computation for the Teacher.
- **Required Outcome:** each Teacher×Program balance is computed and settled
  independently; no cross-program offset.
- **Exceptions:** none permitted.
- **Authority of Truth:** DR-031 (DR-016 supporting).
- **Authority of Constitutional Legitimacy:** PC-007 PR-014 / PC-008 AC-10 (never offset
  across programs); PC-003 (Teacher Balance per Teacher×Program).
- **Affected Product Concepts:** Teacher Balance; Teacher Debt; Training Program.
- **Affected Future Documents:** BC-004; BC-007; Phase 4; Testing.
- **Verification Method:** confirm clearing one program's entitlement affects that
  program only.

## 5. Rule Categories

The catalog is ordered *define the program → price it → lock the price → distribute
revenue → lock the distribution → operational independence*:

| # | Category | Rules |
|---|---|---|
| 1 | Program Identity | BR-001, BR-002, BR-003 |
| 2 | Program Ownership | BR-004 |
| 3 | Program Lifecycle | BR-015, BR-016, BR-017 |
| 4 | Program Pricing | BR-005, BR-006 |
| 5 | Registration Pricing | BR-007, BR-008, BR-009 |
| 6 | Price Immutability | BR-013 |
| 7 | Revenue Distribution Policy | BR-010 |
| 8 | Teacher Share | BR-011 |
| 9 | Center Share | BR-012 |
| 10 | Distribution Immutability | BR-014 |
| 11 | Operational Constraints | BR-018 |

BR IDs are stable identifiers (BC-000 §BCG-6): the catalog is presented in category-flow
order while each rule keeps its permanent number.

## 6. Business Rule Traceability Matrix

| BR | Frozen Domain | Product Constitution | Future BC | Future UX | Future Engineering | Future Testing |
|---|---|---|---|---|---|---|
| BR-001 | DR-071 | PC-003/004/006 | BC-002…007 | ✓ | ✓ | ✓ |
| BR-002 | DR-071 | PC-003/006 | BC-007 | — | ✓ | ✓ |
| BR-003 | DR-071 | PC-003/004 | BC-002 | ✓ | ✓ | ✓ |
| BR-004 | DR-071/031 | PC-003 | BC-004 | — | ✓ | ✓ |
| BR-005 | DR-072 | PC-003/004 | BC-002 | — | ✓ | ✓ |
| BR-006 | DR-072/022 | PC-003/006 | BC-002 | ✓ | ✓ | ✓ |
| BR-007 | DR-073 | PC-003/004 | BC-002 | ✓ | ✓ | ✓ |
| BR-008 | DR-074 | PC-003/004/006 | BC-002/003 | ✓ | ✓ | ✓ |
| BR-009 | DR-074/024 | PC-003/004 | BC-003/005 | — | ✓ | ✓ |
| BR-010 | DR-076/013 | PC-003/006 | BC-003/004 | — | ✓ | ✓ |
| BR-011 | DR-028 | PC-003/004 | BC-003/004/007 | — | ✓ | ✓ |
| BR-012 | DR-028/016 | PC-004 AP-7 / PR-014 / AC-10 / PC-006 | BC-003/007 | — | ✓ | ✓ |
| BR-013 | DR-075 | PC-002 PP-3 / AP-3 / PR-004 / AC-03 | BC-003/005 | ✓ | ✓ | ✓ |
| BR-014 | DR-076 | PC-004 AP-3 / PR-017 / PC-003 | BC-003/004 | — | ✓ | ✓ |
| BR-015 | DR-077 | PC-004/003 | BC-002 | ✓ | ✓ | — |
| BR-016 | DR-078 | PC-003/004 | BC-002/003/005 | ✓ | ✓ | ✓ |
| BR-017 | DR-079 | PC-003/004 | BC-003 | ✓ | ✓ | ✓ |
| BR-018 | DR-031/016 | PR-014 / AC-10 / PC-003 | BC-004/007 | — | ✓ | ✓ |

## 7. Coverage Report

Every in-scope frozen Domain rule is represented:

| Frozen DR | Covered by | Frozen DR | Covered by |
|---|---|---|---|
| DR-071 | BR-001, BR-002, BR-003, BR-004 | DR-077 | BR-015 |
| DR-072 | BR-005, BR-006 | DR-078 | BR-016 |
| DR-073 | BR-007 | DR-079 | BR-017 |
| DR-074 | BR-008, BR-009 | DR-028 | BR-011, BR-012 |
| DR-075 | BR-013 | DR-031 | BR-018 |
| DR-076 | BR-010, BR-014 | DR-016 | BR-012, BR-018 |

**Uncovered in-scope rules:** none. **Deliberately out of scope (no BR):** program
capacity and cohorts — frozen as Future Considerations (post-V1), so representing them
would expand product scope (rejected per Quality Gates). Supporting
DR-013/022/023/024/025/006 are cited within BRs, not independently formalized here
(their own behavior belongs to BC-002/BC-003).

## 8. Business Invariants *(mandatory; always-true facts entailed by the BRs above — no new rule)*

**§8 is derivational, not generative.** Business Invariants are **derived consequences**
of the Business Rules in §4 — never a source of rules. No Business Rule, and no later
UX, engineering, data, or test artifact, may cite an invariant as an origin or
authority; an invariant's only force is that every artifact must **preserve** it. If an
invariant and a Business Rule ever appear to diverge, the **Business Rule governs** (it
carries the dual authorities) and the invariant text is corrected — never the reverse.

- **INV-1 — Program pricing cannot change retroactively once locked.** *(entails BR-013;
  DR-075)*
- **INV-2 — A Revenue Distribution Policy is immutable after becoming effective (for the
  program's whole life).** *(entails BR-014; DR-076)*
- **INV-3 — Teacher Share and Center Share always total exactly 100% of the voucher
  amount.** *(entails BR-011, BR-012; DR-028)*
- **INV-4 — A Program owns exactly one Revenue Distribution Policy at any point in
  time.** *(entails BR-010; DR-076; PC-003)*
- **INV-5 — A Program is financially independent of every other Program, including
  same-named runs.** *(entails BR-001, BR-002; DR-071)*
- **INV-6 — The amount due for a registration is one stored Final Registration Price,
  never a derived discount.** *(entails BR-008; DR-074)*

These invariants introduce no behavior; they are the permanent truths every later
BC/UX/Engineering/Testing artifact must preserve.

---

## Strict-scope self-check

BC-001 defines **only** Business Rules (BR-001…BR-018) with the mandated 13-field normal
form, each atomic, observable, business-only, and dual-cited (Truth + Constitutional
Legitimacy). It creates **no** UI, engineering, API, schema, algorithm, validation
logic, screen flow, component, code, test, report, or accounting implementation. No BR
duplicates another, expands product scope, or contradicts the Product Constitution.

---

*Amendment — ADR-0042 (Option A renumbering): forward-reference document numbers updated (BC-006→BC-007 balances; BC-007→BC-008 non-program). Numbering only changed; constitutional meaning unchanged; no business rule altered.*
