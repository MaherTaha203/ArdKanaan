# UX-003 — Workspace Architecture

| Field | Value |
|---|---|
| Doc ID | UX-003 |
| Title | Workspace Architecture |
| Phase | 3 (UX Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | UX-001 (frozen — philosophy & invariants); UX-002 (frozen — Information Architecture, consumed); BC-000…BC-009 (frozen & locked — the business actions organized here, consumed only); via UX-001: PC-001…008, DOM, GOV-012 |
| Answers | "How is the Owner's work constitutionally organized into coherent workspaces above the Information Architecture?" |

---

> **Nature of this document.** UX-003 is the second structural document of Phase 3. It organizes the
> Owner's **work** — the frozen business actions of BC-000…BC-009 — into a small, fixed set of
> **workspaces** operating **above** the Information Architecture (UX-002). It invents no business
> action, redefines none, and migrates no information ownership out of UX-002. It defines **no**
> screen, page, layout, navigation, visual hierarchy, interaction detail, form, component,
> accessibility rule, language rule, or implementation. It answers **exactly one** question.

## 1. Constitutional definition of a Workspace — WA-01

**A Workspace is an operating context for coherent business work**: the setting within which the
Owner performs a related family of frozen business actions toward one work purpose.

**Why the concept must exist (constitutional justification).** The frozen constitution fixes
*actions* but not *where work happens*; without a constitutional operating context, every later
surface would improvise its own grouping of actions — scattering one coherent piece of work across
unrelated surfaces, or mixing unrelated work in one place — and the assignment of actions to
contexts would be decided by screens (Phase 6) instead of by the constitution. The Workspace is the
smallest concept that closes that gap: it gives every business action exactly one constitutional
work-context *before* any surface exists.

A Workspace is **NOT**: a screen · a page · a navigation destination · a module · a layout · a
visual component · a UI construct. Those belong to later documents and phases (UX-004, Phases 5–6);
a workspace exists even if every screen disappeared — it is the *organization of work itself*.

## 2. Orthogonality: work vs information — WA-02

**Workspace Architecture organizes WORK. Information Architecture organizes INFORMATION.** These
are **orthogonal constitutional dimensions**:

- UX-002 organizes information **by subject** — where information *lives* (Programs / Teachers /
  Students; the Center as context).
- UX-003 organizes work **by purpose** — where the Owner *acts*. A workspace may draw on
  information from several domains (settling a teacher draws on the Teachers domain — their
  payments, balances, and debts — and on context-level revealed truths), and one domain may be
  drawn on by several workspaces.

**Information ownership always remains in UX-002.** No information home, domain, structure, or
discoverability rule migrates into UX-003; a workspace *uses* information where UX-002 fixed it and
owns none of it.

## 3. Derivation rule — WA-03

Workspaces are **derived from the frozen Business Actions of the Business Constitution
(BC-000…BC-009), operating above the frozen Information Architecture (UX-002)**:

1. Collect every **Owner-authored business action** fixed by the frozen BC documents.
2. Group actions by **coherent work purpose** — actions the business constitution binds into one
   kind of work.
3. Each group is a workspace; each workspace draws its information from the UX-002 domains its
   actions touch.

UX-003 **never invents a new business action and never redefines an existing one** — the action
list below is a *consumption* of BC, cited per action. Derivation-only documents (BC-004
entitlement), observation documents (BC-007), and proof documents (BC-009) define **no**
Owner-authored action and therefore contribute none.

## 4. Single-membership invariant — WA-04

> **Every business action belongs to exactly one Workspace.**
> No business action belongs to two workspaces. No business action belongs to none.

This is a constitutional invariant of the UX layer's work organization. It is checkable pass/fail
against the assignment table (WA-06): the table must cover every Owner-authored BC action exactly
once. A future document that sites one action in two workspaces, or leaves one unhomed, violates
WA-04 and cannot propagate.

## 5. The Workspace Set — WA-05

**The set is derived, not invented.** Its derivation basis is a constitutional rule: **one workspace
per distinct work purpose that the frozen Business Constitution itself fixes** — the constitution
already separates constituting the offering (BC-001), committing a student (BC-002), receiving money
(BC-003 + BC-008 revenue), discharging teacher rights (BC-006 — settlement, constitutionally distinct
from expense per BR-077), bearing the center's own costs (BC-008 expenses), and lawfully reversing
recorded facts (BC-005 + document lifecycle). Each frozen purpose-family yields exactly one
workspace; no workspace exists without a frozen purpose-family behind it, and no frozen
purpose-family is split or merged. **Six families → six workspaces:**

| # | Workspace | Work purpose | Derived from (BC) | Draws on information of (UX-002) |
|---|---|---|---|---|
| WS-01 | **Offering & Engagement** | Constitute what the center offers and who delivers it | BC-001 (program, price, policy, program lifecycle); BC-008 BR-086 (teacher status) | Programs; Teachers |
| WS-02 | **Enrollment** | Commit a student to an offering | BC-002 (registration, final price, installments, payer info, registration lifecycle) | Students; Programs (Registration between them) |
| WS-03 | **Money In** | Receive and record incoming money | BC-003 (program-fee receipts); BC-008 (non-program revenue) | Students; Programs; context |
| WS-04 | **Teacher Settlement** | Discharge teacher rights and recover teacher debts | BC-006 (payments; debt-settlement path) | Teachers; context |
| WS-05 | **Center Expenses** | Operate the center's own spending | BC-008 (expenses, expense returns, category list) | context (center financial records) |
| WS-06 | **Corrections & Refunds** | Lawfully reverse or correct recorded facts | BC-005 (refunds; cancellation); BC-003 lifecycle (cancel, descriptive edit) | Students; Programs; the affected record's home |

**Observation is not a workspace** — an independent constitutional invariant; see WA-09 (§8).

## 6. Business-action assignment — WA-06

Complete assignment of every Owner-authored business action fixed by BC-000…BC-009 — each action
appears **exactly once** (WA-04):

| Owner-authored business action | Frozen source | Workspace |
|---|---|---|
| Define a Program (teacher, base price, distribution policy) | BC-001 | WS-01 |
| Close / reopen a Program | BC-001 | WS-01 |
| Set a Teacher's status (Active / Inactive-Left) | BC-008 BR-086 | WS-01 |
| Create a Registration (student × program, final price) | BC-002 | WS-02 |
| Define the installment split of a Registration | BC-002 | WS-02 |
| Record payer / guardian information | BC-002 | WS-02 |
| End / reactivate a Registration | BC-002 | WS-02 |
| Record (post) a program-fee Receipt Voucher | BC-003 | WS-03 |
| Record Non-Program Educational Revenue | BC-008 | WS-03 |
| Record a Teacher Payment Voucher | BC-006 | WS-04 |
| Settle a Teacher Debt (choose repayment / deduction path) | BC-006 | WS-04 |
| Record a center Expense | BC-008 | WS-05 |
| Record an Expense Return | BC-008 | WS-05 |
| Extend the Expense Category list | BC-008 | WS-05 |
| Record a Refund Voucher | BC-005 | WS-06 |
| Cancel a posted financial document | BC-003 / BC-005 | WS-06 |
| Record a logged descriptive edit | BC-003 / BC-005 | WS-06 |

No other Owner-authored business action exists in the frozen Business Constitution (BC-004 derives,
BC-007 reveals, BC-009 proves — none authors). The split of a receipt, the numbering of a voucher,
the arising of entitlement, and every balance are **automatic or derived** — they are not actions
and are not assigned.

## 7. Workspaces above the Information Architecture — WA-07

Workspaces **operate above** UX-002: each draws the information its actions need from the domains
and context exactly as UX-002 fixed them (homes unchanged, discoverability unchanged), and each
action's recorded outcome lands in its UX-002 primary information home. A workspace adds no
information structure and relocates none; it only fixes *where work happens*.

## 8. Constitutional invariants — WA-08, WA-09

Alongside WA-04 (single membership), two independent, pass/fail-checkable invariants bind every
future artifact:

- **WA-08 — Assignment completeness.** The assignment registry (WA-06) is **exhaustive**: every
  Owner-authored business action fixed by the frozen Business Constitution appears in it. If a
  constitutional amendment to BC ever introduces a new business action, that action **must be
  assigned to exactly one workspace by an amendment to UX-003 before any surface may present it**.
  An action existing in BC but absent from WA-06 is a constitutional defect that blocks propagation
  of any document presenting it.
- **WA-09 — Observation is never a workspace.** No workspace may exist whose purpose is
  observation, reporting, or revelation. Revealing balances, standings, and derived truths (BC-007)
  is *information*, not work — the Owner performs no business action to make truth exist — and
  revealed truths live where UX-002 homed them (domains and context). Any future proposal of a
  "reports/observation workspace" violates this invariant and is **rejected**; it could become
  possible only if the Business Constitution's Observation layer itself were first amended — never
  by a UX decision.

## 9. Boundaries

**Owns:** the constitutional definition of a Workspace (WA-01); the orthogonality rule (WA-02); the
derivation rule (WA-03); the single-membership invariant (WA-04); the workspace set (WA-05); the
business-action assignment (WA-06); the relationship of workspaces to the Information Architecture
(WA-07); the assignment-completeness invariant (WA-08); the observation-is-never-a-workspace
invariant (WA-09).

**Never owns:** any business action or Business Rule (BC — consumed, never invented or redefined);
any product concept (PC); any information home, domain, structure, or discoverability rule (UX-002);
how any single action is *performed* — its interaction, guidance, validation surfacing, or forms
(UX-004); language, RTL, accessibility (UX-005); screens, pages, layouts, navigation, visual
hierarchy, components (Phases 5–6); engineering or implementation.

**Consumes** (exactly as frozen, modifies nothing): BC-000…BC-009 (the business actions and their
meaning); UX-002 (the information structure worked above); UX-001 (philosophy and invariants —
every WA element obeys UXV-01…05).

**Produces** (the frame later documents must obey): the workspace context every later UX document
assumes — UX-004 sites the performance of each action *inside its one workspace*; UX-006 traces
each UX rule through workspace and action to its frozen authority; Phase 6 composes screens *within*
workspaces, never across the WA-04 invariant.

**Dependencies:** UX-001 → UX-002 → **UX-003** → UX-004 → UX-006; Phase 6 depends on WA-05/WA-06.

**Downstream effects:** any future change to the workspace set or assignment is a constitutional
amendment of UX-003 (GOV-004 §5), never a drift in a later document; a new business action (itself
a BC amendment) must be assigned to exactly one workspace by an UX-003 amendment before any surface
presents it.

## 10. Strict-scope self-check

UX-003 answers only *"how is the Owner's work constitutionally organized into workspaces above the
Information Architecture?"* It defines the workspace concept, the orthogonality and derivation
rules, the invariants (WA-04 single membership; WA-08 assignment completeness; WA-09 observation is
never a workspace), the six-workspace set, the complete action assignment, and the relationship to
UX-002 — nothing else. It invents no business action, redefines none, migrates
no information ownership, and defines no screen, page, navigation, layout, visual hierarchy,
interaction detail, form, component, accessibility rule, language rule, or implementation. It
consumes BC-000…BC-009, UX-002, and UX-001 exactly as frozen and modifies nothing upstream. CDC —
*Consumes only. No modification. No narrowing. No reinterpretation.* Scope intentionally closed.

---

*FROZEN (v1.0.0, ADR-0052 / AUD-P3-004). UX-003 is the work-organization foundation of Phase 3: six
workspaces (WS-01…WS-06) derived from the frozen purpose-families of the Business Constitution,
bound by three invariants (WA-04 single membership · WA-08 assignment completeness · WA-09
observation is never a workspace). It is now the frozen work-context authority every later UX
document consumes and cites; no further modification is permitted except through the Constitutional
Amendment process (GOV-004 §5 / BC-000 §BCG-3).*
