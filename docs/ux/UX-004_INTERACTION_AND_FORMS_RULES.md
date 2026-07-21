# UX-004 — Interaction & Forms Rules

| Field | Value |
|---|---|
| Doc ID | UX-004 |
| Title | Interaction & Forms Rules |
| Phase | 3 (UX Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | UX-001 (frozen — philosophy & invariants); UX-002 (frozen — information homes, consumed); UX-003 (frozen — workspaces & the WA-06 action registry, consumed); BC-000…BC-009 (frozen & locked — the rules that surface here, consumed only); **direct frozen authorities:** DOM-004 DR-005/007/013/023/043/090 + F-08; PC-001/002 PA-5, PP-1/PP-3/PP-6; PC-006; BC-001 INV-3; GOV-004 §5 (amendment path); via UX-001: remaining PC/DOM, GOV-012 |
| Answers | "How is each frozen business action constitutionally performed — initiated, supplied with inputs, guided by its Business Rules, adjudicated, and revealed — without adding, altering, or re-deciding behavior?" |

---

> **Nature of this document.** UX-004 fixes the **performance doctrine** of the UX layer: how the
> Owner performs each of the 17 frozen business actions (UX-003 WA-06). It governs the *act*, not
> the surface's appearance: it defines **no** screen, page, layout, field list, control, component,
> tab, wizard, navigation, visual hierarchy, wording, accessibility rule, or implementation — and it
> **never redesigns, re-sequences, or decomposes a business workflow**. It answers **exactly one**
> question.

## 1. Constitutional definitions — IX-01, IX-02

**IX-01 — Interaction (Performance).** In this document, **an Interaction *is* the performance of
exactly one business action** — the constitutional act by which the Owner brings a frozen business
action into effect: initiating it, supplying what only the Owner can know, and submitting it to the
business layer's judgment. Performance is the **hand** of UX-001 §1 made concrete — the one bridge
between the Owner's intent and a frozen business effect.

Two demarcations close the term:

- **Interaction and Form do not overlap — they nest.** The Form (IX-02) is the *input surface
  within* an Interaction (lifecycle moment 2, IX-03); it is a part of the performance, never a
  parallel or competing concept. Every Form belongs to exactly one Interaction. **Form cardinality
  is decided by one criterion:** an Interaction carries **exactly one Form iff its action takes
  non-derivable inputs**, and **no Form** when the act itself is the entire input (as is typical of
  the C3 status actions, whose only input is the Owner's decision to set the status); never more
  than one.
- **One Interaction, one action.** A single Interaction brings **exactly one** business action into
  effect — never two, never a compound. This mirrors the frozen constitution itself: a payment
  covering several programs is recorded as multiple receipts (DR-023), and a lump-sum supplier
  refund is split at entry into independent returns (BR-084). Work spanning several actions is
  several Interactions.
- **Viewing is not Interaction.** Reading, finding, or being shown revealed information initiates
  no business action and is therefore not an Interaction in this document's sense — it is
  presentation, governed by UX-002 and UXV-03.

**Why this document must exist.** The constitution fixes *what* each action does (BC), *where its
information lives* (UX-002), and *where it belongs* (UX-003) — but not *how it is performed*.
Without a performance doctrine, every later surface would improvise what the Owner is asked, when
an entry is accepted, and how rules appear — including the one error the constitution exists to
prevent: **asking the Owner for a value the system can derive** (DR-007, F-08). UX-004 closes that
gap once, constitutionally, before any surface exists.

**IX-02 — The Form.** A **Form is the constitutional surface through which the inputs of exactly
one business action are provided.** A Form serves one action only, and an action has one Form iff
it takes non-derivable inputs (the cardinality criterion of IX-01). A Form is **NOT**: a screen · a page · a
layout · a list of fields · a set of controls · a tab · a wizard · a dialog · a visual or
implementation construct. Those belong to Phases 5–6; the Form exists even if every screen
disappeared — it is the *input surface of an action*, constitutionally defined.

## 2. The performance lifecycle — IX-03

Every performance of every business action follows one constitutional lifecycle:

1. **Initiation** — the Owner initiates; nothing performs itself (PP-6; UXP-04: the right to act
   comes from the constitution, not from a control).
2. **Input** — the Form requests **only** what cannot be derived (IX-08); everything derivable is
   revealed, never requested.
3. **Rule surfacing** — the action's Business Rules surface as guidance and prevention (IX-04)
   while the Owner works, before judgment.
4. **Adjudication** — the business layer alone judges validity (IX-07); the surface submits, never
   decides.
5. **Outcome revelation** — the recorded fact lands in its UX-002 primary information home (the
   two dimensions stay orthogonal: the *performance* occurred within the action's one UX-003
   workspace, WA-06; the *fact's home* is UX-002's and never migrates); its derived effects
   (splits, balances, statuses) are **revealed** to the Owner, never computed or restated by the
   surface (UXV-03).

This lifecycle is constitutional **semantics**, not a step design: it fixes *what must happen*,
never how many surfaces, in what visual sequence, or in which arrangement it happens (IX-10). Its
order is the order of **meaning** the frozen constitution already fixes — an effect cannot exist
before its action is judged, and judgment cannot precede the inputs it judges (DR-043: saving a
financial document *is* posting it) — it prescribes no surface sequence, no step count, and no
arrangement.

## 3. Rule surfacing: guidance & prevention — IX-04

- Every guidance or prevention a surface shows **surfaces an existing frozen rule** and **cites the
  BR (or frozen Product/Domain statement) it surfaces** — traceable per UXV-02. A guidance without a
  frozen source is invented behavior and is prohibited (UXV-01).
- Surfaces **may prevent** invalid entry as a courtesy of the same frozen rule they cite;
  prevention is early surfacing, never a new rule and never the judgment itself (IX-07). **The
  license is bounded and testable: prevention may block only what the cited frozen rule itself
  makes invalid; a surface that prevents an entry the Business Rules would accept violates IX-07
  and blocks propagation of the artifact containing it.**
- Irreversibility is surfaced **before** the act: where saving a financial document is posting it
  and the posted record is permanent (DR-043; BR-037/BR-040 for the receipt instance; PP-3/PA-5),
  the Form surfaces permanence before submission — as constitutionally required knowledge, not as a
  workflow step.
- UX-004 fixes the **existence and constitutional position** of guidance; its wording, language,
  and presentation belong to UX-005 (bound to PC-006) and later phases.

## 4. Action classes — IX-05

The 17 actions perform in **five constitutional classes**, each with class rules. **The classes are
derived, not invented — one class per distinct frozen consequence-kind the Business Constitution
itself fixes:** a standing business fact with no voucher posted (definitional/obligational rules of
BC-001/002/008) · a permanent posted voucher (DR-043 and the posting rules of BC-003/005/006/008) ·
a reversible operational status (the BR-087 shared-pattern family) · an Owner-chosen discharge among
constitutionally fixed paths (BR-064/065) · a lawful reversal or logged correction of a recorded
document (the BC-003/005 document-lifecycle rules). Each frozen consequence-kind yields exactly one
class; no class exists without one, and none is split or merged. Classes never derive from any
interface idea:

| Class | Nature (frozen) | Class performance rules |
|---|---|---|
| **C1 — Definition** | creates or extends a standing business fact — a definition or an obligation — with **no voucher posted** | inputs are the non-derivable definitional/obligational facts; the defining BRs surface (e.g. one fixed policy per Program — BR-010; shares total exactly 100% — DR-013 / BC-001 INV-3; the Registration obligation — BR-019/BR-023; one category per expense — BR-079); outcome is a standing fact revealed in its home |
| **C2 — Posting** | creates a permanent financial voucher; **saving a financial document is posting it (DR-043)** — instantiated per document by its own frozen rules: receipt BR-034/BR-035; refund BR-050/BR-051; teacher payment BR-058; expense BR-080; expense return BR-085; non-program revenue via BC-008's consumption of BC-003 posting (BC-008 §9) | permanence surfaced before the act (DR-043; PP-3/PA-5); every derived consequence (split, balance movement, numbering) is **revealed only** (DR-005/090; the acting document's own effect rules); no financial value the system can compute is requested **or accepted** |
| **C3 — Status** | reversible operational status (BR-087) | reversibility and blocks-only-new-business surface with the act (BR-016/025/086); no financial rewrite is possible or implied |
| **C4 — Settlement choice** | Owner chooses among constitutionally fixed paths (BR-064), **as constrained by BR-065** | the constitutionally **available** paths for the concrete case are presented exactly as BC fixes them — with no future entitlement on the program, deduction does not exist and only direct repayment remains (BR-065); the set of lawful paths is business-adjudicated, and within it the choice is the Owner's alone — the surface neither adds a path nor makes or biases the choice (UXP-04) |
| **C5 — Correction** | lawful reversal / logged edit of recorded documents | cancellation surfaces as a preserved status, never deletion (BR-056; BR-037/BR-040 for the receipt instance); dependency ordering surfaces before the act (BR-055); the financial-vs-descriptive field classification (BR-057) governs what may be edited |

## 5. Class coverage of the action registry — IX-06

Every WA-06 action performs in exactly one class. **UX-003 WA-06 is the sole action registry; this
table is a classification of it, never a second registry** — wherever the two could diverge, WA-06
governs and this table is void at the point of divergence. Action titles are reproduced verbatim
from the frozen registry:

| Class | WA-06 actions (verbatim) |
|---|---|
| C1 — Definition | Define a Program (teacher, base price, distribution policy) · Create a Registration (student × program, final price) · Define the installment split of a Registration · Record payer / guardian information · Extend the Expense Category list |
| C2 — Posting | Record (post) a program-fee Receipt Voucher · Record Non-Program Educational Revenue · Record a Teacher Payment Voucher · Record a center Expense · Record an Expense Return · Record a Refund Voucher |
| C3 — Status | Close / reopen a Program · End / reactivate a Registration · Set a Teacher's status (Active / Inactive-Left) |
| C4 — Settlement choice | Settle a Teacher Debt (choose repayment / deduction path) |
| C5 — Correction | Cancel a posted financial document · Record a logged descriptive edit |

5 + 6 + 3 + 1 + 2 = **17** — the registry is fully covered, each action exactly once.

## 6. Constitutional invariants — IX-07…IX-10

Four independent, pass/fail-checkable invariants bind every future surface:

- **IX-07 — Adjudication belongs to the business layer.** The validity of a performed action is
  judged **only** by the frozen Business Rules; no surface accepts, rejects, or completes an action
  by its own judgment. Prevention and guidance surface rules; they never replace the judgment
  (UXP-04; UXV-01).
- **IX-08 — Nothing derivable is ever requested or accepted.** A Form **never requests — and never
  accepts — a value the system can derive** from recorded facts: shares, splits, balances, totals,
  numbering, entitlements, standings. Derivable values are revealed, and **a revealed derivable
  value is never editable**; only non-derivable facts are requested. *(Independent constitutional
  invariant — the surface-level enforcement of DR-007 / F-08 / PP-1; a single field requesting, or
  an edit affordance accepting, a derivable value violates this invariant and blocks propagation of
  the artifact that contains it.)*
- **IX-09 — Performance coverage is complete.** Every action in the WA-06 registry performs in
  exactly one class (IX-06), and no performance rule exists for anything that is not a WA-06
  action. A BC amendment introducing a new action requires (after its UX-003 assignment) a UX-004
  amendment classifying its performance **before any surface presents it**; an action fitting no
  existing class is classified by that same amendment, which may lawfully add the class it needs.
- **IX-10 — Workflow integrity.** **UX-004 never redesigns a business workflow, never re-sequences
  it, and never decomposes it into steps, screens, tabs, or wizards.** The meaning and order of
  business work are fixed by the frozen Business Constitution; how a surface is arranged is a
  user-interface decision of later phases (5–6). This document fixes performance *semantics* only —
  any content in this or a later UX document that prescribes a step decomposition, tabbed
  arrangement, or wizard sequence for a business workflow violates this invariant. **The deciding
  test for every phase:** a surface arrangement — including any Phase 5–6 construct — violates the
  constitution iff it (a) imposes a mandatory order **between distinct business actions** that the
  frozen Business Constitution does not fix, (b) splits **one action's single adjudication** into
  more than one business submission, or (c) inserts a step, approval, or gate the business does not
  define (UXV-05). Arranging the input-gathering of **one** action — within its one Form and one
  adjudication — is later-phase arrangement freedom and violates nothing.

## 7. Boundaries

**Owns:** the constitutional definitions of Performance and the Form (IX-01/02); the performance
lifecycle (IX-03); rule-surfacing doctrine (IX-04); the five action classes and their rules
(IX-05); the class coverage of the action registry (IX-06); the four invariants (IX-07…IX-10).

**Never owns:** any business behavior, rule, calculation, workflow meaning, or validity judgment
(BC); the action registry or workspace assignment (UX-003); any information home or discoverability
rule (UX-002); wording, language, RTL, accessibility (UX-005 / PC-006); screens, pages, layouts,
field lists, controls, components, tabs, wizards, dialogs, navigation, visual hierarchy (Phases
5–6); engineering or implementation.

**Consumes** (exactly as frozen, modifies nothing): BC-000…BC-009 (the rules that surface and the
judgment that adjudicates); UX-003 (WA-06 registry and workspace context); UX-002 (outcome homes);
UX-001 (every IX element obeys UXV-01…05); **and the directly-cited frozen authorities:** DOM-004
DR-005/007/013/023/043/090 with F-08; PC-001/PC-002 (PA-5, PP-1/PP-3/PP-6); PC-006 (terminology, via
UX-005's mandate); BC-001 INV-3; GOV-004 §5 (the amendment path this document's invariants invoke).

**Produces** (the frame later documents must obey): the performance doctrine that **UX-005 gives
language to** (the guidance whose existence and position IX-04 fixes), that **UX-006 traces** to its
frozen authorities (every surfaced rule carries its citation), and that **Phases 5–6 must satisfy**
(components and screens implement the lifecycle, classes, and invariants — none may re-decide
them).

**Dependencies:** UX-001 → UX-002 → UX-003 → **UX-004** → UX-005 / UX-006; Phases 5–6 depend on
IX-01…IX-10.

**Downstream effects:** any change to the lifecycle, classes, or invariants is a constitutional
amendment of UX-004 (GOV-004 §5); a new BC action reaches surfaces only through the chain BC
amendment → UX-003 assignment → UX-004 classification.

## 8. Strict-scope self-check

UX-004 answers only *"how is each frozen business action constitutionally performed?"* It defines
the Interaction (≡ performance; one Interaction, one action; the Form nests within it; viewing is
not Interaction), the lifecycle, rule surfacing, five action classes covering all 17 registry
actions exactly once, and four invariants — nothing else. It invents no behavior, re-decides no
validity, requests nothing derivable, redesigns no workflow, and defines no screen, layout, field
list, control, component, tab, wizard, navigation, wording, accessibility rule, or implementation.
It consumes BC-000…BC-009, UX-003, UX-002, and UX-001 exactly as frozen and modifies nothing
upstream. CDC — *Consumes only. No modification. No narrowing. No reinterpretation.* Scope
intentionally closed.

---

*FROZEN (v1.0.0, ADR-0054 / AUD-P3-005) — reviewed under GOV-013 (Multi-Agent Review Protocol):
Panel review complete, Constitutional Readiness Gate verdict READY, Owner constitutional approval
granted. UX-004 is the performance doctrine of Phase 3; every later document consumes and cites it;
no further modification is permitted except through the Constitutional Amendment process
(GOV-004 §5, reviewed per GOV-013 §10).*
