# PC-002 — Product Principles (+ Automation Boundary)

| Field | Value |
|---|---|
| Doc ID | PC-002 |
| Title | Product Principles (+ Automation Boundary) |
| Phase | 1 (Product Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | PC-001 (axioms PA-1…PA-7), P1-000, GOV-012, DOM-001…005 (frozen) |
| Governs | how Product Requirements (PC-007) are written, classified, and bounded |

---

## 1. Purpose

PC-001 fixed *what the product is* (invariants). PC-002 fixes *how requirements are
decided* — operating rules **derived from** the axioms (never restating them), plus
the **Automation Boundary** that partitions every decision the product will ever
face. Each principle here **changes how a PR is written**; anything that would not is
omitted.

## 2. Product Principles

**PP-1 — Every requirement is a Record or a Reveal.**
- **Rule:** each PR is exactly one of two kinds — it *records a primary fact* the
  owner supplies, or it *reveals derived truth*. No PR does both, and a Reveal
  accepts no input for the thing it reveals.
- **Derived from:** PA-3, PA-7.
- **Effect on PRs:** every PR declares its kind (Record | Reveal); hybrid
  "record-and-recompute-as-input" requirements are invalid by construction.

**PP-2 — One authoring point per fact.**
- **Rule:** each primary fact is recorded in exactly one place; every other
  requirement that needs it **references** it.
- **Derived from:** PA-4.
- **Effect on PRs:** no two PRs may capture the same fact; a PR needing an existing
  fact cites the recording PR as its source. *(Distinct from PA-4: PA-4 forbids
  re-asking the owner; PP-2 forbids any second authoring surface at all.)*

**PP-3 — Correction is a new record.**
- **Rule:** every corrective requirement is expressed as recording a new
  counter-fact; none mutates a prior fact.
- **Derived from:** PA-5.
- **Effect on PRs:** correction PRs are additive (cancel/adjust events); there are no
  edit/delete PRs for posted financial facts.

**PP-4 — Prefer the smaller model.**
- **Rule:** when more than one requirement set satisfies the same domain rule, choose
  the one that introduces the **fewest new concepts/entities**; every new concept a
  PR introduces must be justified by a domain rule it cannot otherwise satisfy.
- **Derived from:** PA-1.
- **Effect on PRs:** a tie-breaker and a justification burden — a PR adding a concept
  without a rule requiring it is rejected. *(Distinct from PA-1: PA-1 demands
  traceability; PP-4 chooses the leanest of the traceable options.)*

**PP-5 — No hidden state.**
- **Rule:** any state a requirement introduces (a status, a flag, a lifecycle) must
  be **derivable and inspectable**, its cause traceable; the product holds no
  implicit state the owner cannot explain.
- **Derived from:** PA-7.
- **Effect on PRs:** a PR that adds a state must define how that state is derived and
  how it is inspected/traced to its cause.

**PP-6 — Owner initiates, system reacts.**
- **Rule:** every change of financial truth **originates from an explicit
  owner-recorded action**; the system computes and records consequences *in
  reaction*, but never **originates** a financial change on its own.
- **Derived from:** PA-6, PA-3.
- **Effect on PRs:** no PR may specify a system-originated financial event; every
  financial-effect PR is downstream of an owner action. Gateway to the Automation
  Boundary.

## 3. Automation Boundary (constitutional)

Every decision the product ever faces falls into **exactly one** of three categories.

### Category A — Automatic (the system acts without asking)
Deterministic effects the system **must perform in reaction to an owner-recorded
action**, because a frozen rule dictates them. The owner is never asked to trigger or
confirm them.
- **Membership test:** the effect is a *rule-mandated reaction* to an owner action.
- **Examples (cited):** applying a posted receipt's split and updating the three
  balances (DR-005, DR-016, DR-017); beginning entitlement at posting (DR-015);
  recalculating entitlement and raising a teacher debt after a refund (DR-062,
  DR-065); reducing balances on a payment (DR-034); assigning the next voucher number
  (DR-090); emitting the activity record (DR-019).

### Category B — Owner's decision (the system must never assume it)
Genuine business judgments **not determined by recorded facts.** The product takes
these **only from the owner** and must never auto-select, default, or infer them.
- **Membership test:** the value is a business judgment with more than one legitimate
  outcome given the same facts.
- **Examples (cited):** whether to grant a refund and its amount (ADR-0016 S5-D7);
  whether/when/how much to pay a teacher (DR-030, DR-033); a program's base price,
  distribution percentage, and teacher at creation (ADR-0022); a per-registration
  price override (DR-073); ending or reactivating a registration (DR-086, DR-087); a
  teacher's Active/Inactive status (DR-083); an expense and its category (DR-051);
  the settlement method for a teacher debt (DR-068).

### Category C — Derived (no party may decide it)
Pure functions of recorded facts with **exactly one correct value.** Neither the
owner nor the system may *set* or *choose* them; the system only computes and reveals
them. Any surface that lets any party set one is a defect (PA-3).
- **Membership test:** the value is fully determined by recorded facts under a frozen
  rule.
- **Examples (cited):** the split amounts of a given receipt and the rounding
  remainder (DR-005, DR-028); the three balances (DR-016, DR-017); a Teacher ×
  Program outstanding balance (DR-034); entitlement after refunds (DR-062, DR-063);
  the teacher-debt amount (DR-065); overpayment limits against the Final Registration
  Price (DR-024, DR-074).

### AB-1 — Exactly one category per atomic decision (constitutional rule)
Every **atomic decision** inside every PR carries **exactly one** classification —
**A, B, or C** — never zero and never more than one. The categories are mutually
exclusive and exhaustive: the classification test below always yields exactly one. A
decision that appears to fit two categories is **not atomic** and MUST be decomposed
until each part carries a single category (GOV-012 L2, L14). A PR that leaves a
decision unclassified, or that places a Category-C value into A or B, or that
auto-decides a Category-B judgment, is **invalid**.

### Classification test (assign any decision to A, B, or C)
```
Given an atomic decision D:
  1. Is D's value fully determined by recorded facts under a frozen rule?
        → yes: CATEGORY C  (derived; no party may set it)
  2. Else, is D a rule-mandated effect the system must perform in reaction
     to an owner action?
        → yes: CATEGORY A  (automatic)
  3. Else (a business judgment not fixed by facts)
        → CATEGORY B  (owner's decision)
```

## 4. Reference — A/B/C applied to real financial decisions

Where an item bundles an *action* and a *value*, the row shows both (the action is A,
the value it produces is C). This table is the worked reference for classifying PR
decisions.

| # | Real decision (financial domain) | Category | Why |
|---|---|---|---|
| 1 | The teacher/center split ratio of a program | **B** | Business judgment set at creation (ADR-0022; DR-013) |
| 2 | The split **amounts** of a specific posted receipt | **C** | Fully determined by amount × percentage (DR-005, DR-028) |
| 3 | Applying the split & updating the three balances when a receipt is posted | **A** | Rule-mandated reaction to the owner's posting (DR-005, DR-017) |
| 4 | The value of Cash / Teacher Payables / Center Net at any moment | **C** | Derived from recorded vouchers (DR-016, DR-017) |
| 5 | The rounding remainder on a fractional split | **C** | Fixed by DR-028 (round-half-up, remainder to center) |
| 6 | Whether to grant a student refund, and its amount | **B** | Owner discretion, free input (ADR-0016 S5-D7) |
| 7 | Recalculating teacher entitlement after a refund | **A** (action) → **C** (value) | Automatic reaction (A); the recalculated value is derived (DR-062, DR-063) |
| 8 | Whether a teacher debt arises, and its amount | **C** | Exists iff payments exceed final entitlement; amount is the excess (DR-065) |
| 9 | How a teacher debt is settled (repay vs same-program deduction, or mix) | **B** | Owner's case-by-case choice, never automatic (DR-068) |
| 10 | Applying a chosen deduction to a future entitlement | **A** | Automatic effect once the owner chose the method (DR-068) |
| 11 | Whether / when / how much to pay a teacher | **B** | Owner-initiated; timing and amount are judgments (DR-030, DR-033) |
| 12 | The Teacher × Program outstanding balance | **C** | Total entitlement − total payments (DR-034) |
| 13 | Rejecting a payment/receipt that exceeds the allowed amount | **A** | Automatic enforcement of a C-derived limit (DR-024, DR-033, DR-074) |
| 14 | A program's base price / a per-registration override | **B** | Owner sets it (DR-072, DR-073) |
| 15 | Assigning the next voucher number | **A** | Automatic, unique per type (DR-026, DR-090) |
| 16 | Ending / reactivating a registration; teacher Active/Inactive | **B** | Owner-controlled status changes (DR-083, DR-086, DR-087) |
| 17 | Recording an expense and choosing its category | **B** | Owner records the fact and classifies it (DR-051, DR-053) |
| 18 | Reducing the expense's real cost when an expense return is recorded | **A** | Automatic reaction to the owner recording the return (DR-056, DR-060) |
| 19 | Emitting an activity-timeline entry for any financial action | **A** | Rule-mandated, append-only (DR-019, PA-7) |

## 5. Downstream-impact summary

| Item | Derived from | Effect type | Affects |
|---|---|---|---|
| PP-1 Record or Reveal | PA-3, PA-7 | Requirements, Testing | PC-007, Phase 2 BR |
| PP-2 One authoring point | PA-4 | Requirements, Engineering, Testing | PC-007, Phase 4 DDL |
| PP-3 Correction is a new record | PA-5 | Requirements, Engineering, Testing | PC-007, Phase 2 BR, Phase 4 DDL |
| PP-4 Prefer the smaller model | PA-1 | Requirements, ADR | PC-004, PC-007 |
| PP-5 No hidden state | PA-7 | Requirements, Engineering, Testing | PC-007, Phase 4 DDL |
| PP-6 Owner initiates, system reacts | PA-6, PA-3 | Requirements, UX, Testing | PC-007, Phase 3 UX |
| Automation Boundary + AB-1 (A/B/C, one per atom) | PA-3, PA-4, PA-6; GOV-012 L2/L14 | Requirements, UX, Engineering, Testing | every PR; Phase 2 BR; Phase 3 UX |
