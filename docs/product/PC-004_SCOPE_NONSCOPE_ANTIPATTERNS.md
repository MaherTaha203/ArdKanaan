# PC-004 — Scope, Non-Scope & Anti-Patterns

| Field | Value |
|---|---|
| Doc ID | PC-004 |
| Title | Scope, Non-Scope & Anti-Patterns |
| Phase | 1 (Product Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | PC-001 (PA-1…PA-7), PC-002 (PP-1…PP-6, Automation Boundary), PC-003 (mental model), P1-000, GOV-012, DOM-003/004/005 |
| Answers | "What product belongs here — and what never belongs here?" |

---

## 1. Product Scope — capabilities inside this product

Each capability cites its upstream source. Nothing here is a UI, flow, or
implementation — only *what the product is able to do*.

| # | Capability | Upstream source |
|---|---|---|
| SC-1 | Record a program-fee receipt and split it automatically | WF-02, WF-03; DR-005, DR-017, DR-028; PC-003 Receipt Voucher |
| SC-2 | Register a student in a program with a Final Registration Price | WF-01; DR-022, DR-072–075; PC-003 Registration |
| SC-3 | Define and operate a program (base price, fixed policy, open/closed) | WF-13; DR-071–079; PC-003 Program, Policy |
| SC-4 | Record a teacher payment per program | WF-05; DR-030–034 |
| SC-5 | Record a center expense (one category) and an expense return | WF-06, WF-11; DR-049–061 |
| SC-6 | Record a student refund, recalculating entitlement and raising any teacher debt | WF-07, WF-12; DR-036–042, DR-062–070 |
| SC-7 | Record non-program educational revenue (center-only, student-linked) | DR-080–082 |
| SC-8 | Reveal the three balances, per-Teacher×Program balances/debts, and each party's financial standing | DR-016, DR-017, DR-034, DR-065, DR-011, DR-035; PC-003 derived truths |
| SC-9 | Maintain the append-only activity record of every event | DR-018–020; PC-003 Activity Record |
| SC-10 | Correct any posted record by cancellation + recreation (never edit/delete) | WF-08, WF-09; DR-043–048; PA-5, PP-3 |
| SC-11 | Change teacher status (Active/Inactive) and registration status (Active/Ended), reversibly | DR-083, DR-086, DR-087; PC-003 Operational Status |
| SC-12 | Assign official unique sequential numbering per voucher type | DR-026, DR-090 |

**Scope law:** a capability not listed here (or added later via §6) does not exist in
the product (PA-1).

## 2. Product Non-Scope — capabilities that never belong

Each exclusion states its reason and its **disposition**: *Permanent* (would be a
different product) or *Future version* (own ADR, possibly a constitutional amendment).

| # | Excluded capability | Reason | Disposition |
|---|---|---|---|
| NS-1 | Multiple owners / centers / tenants / companies; any role or permission model | PA-2; M-02/M-03 | Permanent (different product) |
| NS-2 | General accounting / ERP (ledgers, journals, tax/VAT, tax invoices, statements beyond the three balances) | PA-1; ADR-0024; M-08 | Permanent |
| NS-3 | Approvals, permissions, sign-offs, workflow gates | PA-6 | Permanent |
| NS-4 | Multiple teachers per program; alternative compensation models (salary, per-student, fixed) | ADR-0009, ADR-0022 | Future version |
| NS-5 | Program capacity / seats / waiting lists; internal cohorts / sections | ADR-0022 | Future version |
| NS-6 | Non-educational revenue (room rental, consulting, other services) | ADR-0023 | Future version |
| NS-7 | Non-cash expense returns (credit notes, supplier balances, goods replacement) | ADR-0020 | Future version |
| NS-8 | A Draft / posting lifecycle (saving already posts) | ADR-0018 S6-D6 | Future version |
| NS-9 | Fixed-asset distinction; program/proportional expense allocation; teacher-share deductions | ADR-0019; S4-D8 / UNK-021 | Future version |
| NS-10 | Manual entry of any derived value; any second authoring point for a known fact | PA-3, PA-4, PP-2 | Permanent |
| NS-11 | Any system-originated financial change (auto-postings without an owner action) | PP-6 | Permanent |
| NS-12 | Merging the three balances or offsetting across Teacher×Program | DR-016, DR-031, DR-066 | Permanent |

## 3. Anti-Patterns

Each carries Description · Why harmful · Constitution violated · Detection test · Examples.

- **AP-1 ERP Creep.** *Description:* adding general accounting/organizational capability. *Harm:* turns a single-owner tool into an ERP; unbounded growth. *Violates:* PA-1, PA-2. *Detection:* a capability with no DR/WF upstream, or introducing ledgers/roles/tenancy. *Examples:* chart of accounts, branches, user roles.
- **AP-2 Manual Override.** *Description:* letting the owner type a derived value or re-enter a known fact. *Harm:* breaks single-source truth; numbers become untrustworthy. *Violates:* PA-3, PA-4, PP-2. *Detection:* a capability whose input is a derived value or a re-supplied known fact. *Examples:* "edit balance," "set outstanding," re-typing a known student's name.
- **AP-3 Silent Mutation.** *Description:* editing or deleting a posted record. *Harm:* destroys the permanent, tamper-evident record. *Violates:* PA-5, PP-3. *Detection:* a capability offering hard edit/delete of posted financial data. *Examples:* "delete voucher," "edit posted amount."
- **AP-4 Gatekeeper.** *Description:* inserting approvals/permissions/gates. *Harm:* bureaucracy the single operator neither needs nor wants. *Violates:* PA-6. *Detection:* a capability with an approve/authorize/sign-off step. *Examples:* "approve refund," "role may not post."
- **AP-5 Autopilot.** *Description:* the system originating a financial change with no owner action. *Harm:* money changes the owner did not initiate. *Violates:* PP-6. *Detection:* a financial effect triggered by a timer/event, not an owner-recorded action. *Examples:* auto-pay teachers monthly, auto-close a program by date.
- **AP-6 Hidden State.** *Description:* state the owner cannot derive, inspect, or trace. *Harm:* un-auditable behavior. *Violates:* PP-5, PA-7. *Detection:* a status/flag with no derivation and no activity trace. *Examples:* an internal flag absent from the timeline.
- **AP-7 The Merge.** *Description:* combining the three balances or netting across Teacher×Program. *Harm:* hides the distinctions the owner relies on. *Violates:* DR-016, DR-031, DR-066; PC-003 integrity. *Detection:* a capability producing a single "total balance" or cross-program offset. *Examples:* "net balance," cross-program debt clearing.
- **AP-8 Concept Smuggler.** *Description:* introducing a product concept with no DOM-002/frozen-rule trace. *Harm:* scope creep by resonance rather than need. *Violates:* PA-1, MMI-2. *Detection:* a concept failing PC-003 MMI-2 traceability. *Examples:* loyalty points, gamification, a CRM pipeline, branding features.

## 4. Boundary Tests — mechanical admission procedure

Run every proposed capability through this ordered gate; **any fail → rejected.**

```
ADMIT(capability C):
  BT-1 Upstream trace?  C cites a DR/WF or an approved PR?            fail → reject (PA-1, PP-4)
  BT-2 Product Identity? C honors PA-1…PA-7?                          fail → reject
  BT-3 Scope Singularity? C keeps one owner/center/dataset, no roles? fail → reject (PA-2)
  BT-4 Simplicity Ceiling? C adds the fewest concepts; nothing unrequired? fail → reject (PA-1, PP-4)
  BT-5 Fits Mental Model? every concept C touches maps to PC-003?     fail → reject (MMI-2)
  BT-6 Anti-Pattern free? C matches no AP-1…AP-8 detection test?      fail → reject
  BT-7 Classifiable? every decision in C is A/B/C (one each)?          fail → reject (AB-1)
  all pass → ADMIT (author as a PR)
```

## 5. Extension Classification

Before applying the extension policy (§6), **classify any new request** into exactly
one of four kinds. The kind determines which layer/phase owns it and which governance
applies. (This mirrors GOV-012: existence vs usage vs construction.)

| Kind | Definition | Owning layer / phase | Governance | Example |
|---|---|---|---|---|
| **Data Extension** | a new *instance* within a concept/capability the model already admits | Product (within existing model) | none beyond normal use → **§6 Tier 1** | create program "ICDL — Mar 2026"; add expense category "Cleaning" |
| **Capability Extension** | a new *thing the product can do* (a new capability) | Product | Boundary Tests (§4) + Owner ADR + PR → **§6 Tier 2** | record a non-program-revenue refund (resolving UNK-029) |
| **Behavior Extension** | a change to *how an existing capability is operated or ruled* (flow, interaction, or a calculation rule) — not what it is | UX (Phase 3) or Business (Phase 2) | belongs to that later phase; if it would alter a PC axiom/principle → **§6 Tier 3** | how a receipt is entered/navigated (Phase 3); changing a calculation rule (Phase 2) |
| **Implementation Extension** | a change to *how a capability is built* | Engineering | engineering phases only; never touches the product constitution | caching balances; changing storage |

**Classification rule:** every request is exactly one kind (decompose a bundled
request until each part is one kind — GOV-012 L2). Only **Data** and **Capability**
extensions are governed by §6; **Behavior** routes to Phase 2/3; **Implementation**
routes to Engineering. Misrouting (e.g. slipping a Capability in as Data) is a
boundary violation.

## 6. Future Extension Policy

Three tiers govern product-affecting growth (Data and Capability extensions from §5):

- **Tier 1 — Free extension (no ADR).** *Data Extensions* — instances the model
  already admits (new programs, teachers, students, registrations; new expense
  categories, DR-051). Data within existing capabilities, not new capabilities.
- **Tier 2 — Owner-approved capability (ADR + PR, no constitutional change).** A
  *Capability Extension* that passes all Boundary Tests and traces to the domain —
  including resolving a **deferred/open item** into a capability. Requires an Owner
  Engineering Order, an ADR, and a PR; the constitution is untouched. **Deferred items
  eligible for Tier 2:** UNK-013 (party-standing rendering scope), UNK-029
  (non-program-revenue refundability), UNK-030 (non-program-revenue amount/
  overpayment).
- **Tier 3 — Constitutional amendment (Owner + GOV-004 §5).** Any request that would
  change an axiom/principle (PA-*/PP-*) or cross a *Permanent* Non-Scope boundary —
  e.g. multi-tenant, approvals, alternative compensation, ERP features. By PA-2 this
  effectively **defines a different product**; it requires amending PC-001/PC-002/
  PC-004 (and possibly GOV-011) before any PR may exist.

**Extension law:** a request enters Tier 1 only if it is truly a Data Extension; a
*Permanent* Non-Scope item cannot be admitted at Tier 2 — only Tier 3.
