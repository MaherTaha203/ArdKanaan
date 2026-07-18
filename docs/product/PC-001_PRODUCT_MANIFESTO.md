# PC-001 — Product Manifesto

| Field | Value |
|---|---|
| Doc ID | PC-001 |
| Title | Product Manifesto |
| Phase | 1 (Product Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | P1-000, GOV-012 (ownership authority), GOV-000 (M-atoms), DOM-001…005 (frozen), F-01…F-09 |
| Governs | all downstream Product Constitution documents, all PR atoms, and every later phase |

---

## 1. Purpose (binding, not descriptive)

Ard Kanaan exists to keep its single owner's financial truth **always knowable,
permanently trustworthy, and never produced by hand.** This is enforced, not
decorative — each clause is discharged by the Product Axioms below: *always knowable*
→ PA-3, PA-4, PA-7; *permanently trustworthy* → PA-5, PA-7; *never by hand* → PA-3,
PA-4. Every downstream requirement must satisfy these axioms.

*"Knowable" is deliberate: the product's obligation is to always be able to **yield**
the truth, not to promise any particular way of showing it or any response time —
those are UX/engineering concerns (Phase 3+), outside this constitution.*

This is the **product's** supreme law. It does not restate GOV-000 (the
repository/engineering manifesto) or the Domain (business facts, DOM-001…005); it
constrains **what the product built over them may become**. Where an axiom rests on a
frozen fact, it *elevates* that fact into a testable product prohibition — it does not
repeat it.

## 2. Product Axioms

**PA-1 — Simplicity Ceiling.**
- **Law:** the product may never exceed the complexity of the business it serves.
  Every capability must trace to a frozen DR/WF or an approved PR; **anything not
  required is forbidden.**
- **Forces:** every PR cites upstream DR/WF/M/F; a capability with no upstream is out
  of scope by construction.
- **Test:** zero PRs without an upstream citation; zero product features absent from
  the PR register.
- **Builds on:** M-08, F-09. *(Placed first: it is the constitution's governing
  filter through which every other axiom and requirement passes.)*

**PA-2 — Scope Singularity.**
- **Law:** this product models exactly **one center, one owner, one dataset.**
  Multi-owner, multi-center, multi-tenant, multi-company, or organizational-role
  structure is **outside this product's identity**: introducing any of them does not
  *extend* this product — it defines a **different** product, which would be a
  future-version decision under its own constitution, not a change to this one.
- **Forces:** no PR, entity, or capability may introduce a second owner/center/tenant
  or any role/permission concept.
- **Test:** scan every PR and entity → zero introduce plurality of owner/center/
  tenant or any role.
- **Builds on:** F-02, F-03. *(The law binds the product's identity, not the
  company's future; the owner's business may grow — that growth would be served by a
  different product, not forbidden here.)*

**PA-3 — Derivation Supremacy.**
- **Law:** every value the product can **compute** from recorded facts is derived and
  read-only; the product provides **no authoring surface for any computable value**
  (balance, total, share, outstanding, debt).
- **Forces:** no PR may specify an input or action that *sets* a derivable value; PR
  inputs are only primary recorded facts.
- **Test:** for every PR input, the input is a primary fact, never a derived quantity.
- **Builds on:** F-08 (made a testable product invariant; seeds PC-002's Automation
  Boundary).

**PA-4 — Non-Interrogation.**
- **Law:** the product never asks the owner for information it **already possesses or
  can determine from recorded facts.** Known things are *referenced*, not re-entered —
  a known student is not re-named, a known program is not re-described, an existing
  datum is not re-supplied.
- **Distinction from PA-3:** PA-3 governs **computation** (never ask the owner to
  *calculate*); PA-4 governs **knowledge** (never ask the owner to *re-tell* what the
  system already knows). PA-4 is broader — it covers primary facts already recorded,
  not only derived values.
- **Forces:** no PR may request an input the system can already retrieve for the
  current context (identity, prior selection, an existing recorded fact).
- **Test:** for every PR input, the datum is not already retrievable from recorded
  facts in that context.
- **Builds on:** M-07, F-08 / F-09 (minimize manual work) — elevated to a *knowledge*
  law.

**PA-5 — Non-Destruction.**
- **Law:** no recorded financial fact is ever edited or deleted; every correction is a
  **new** recorded event that leaves the original intact.
- **Forces:** no PR may offer hard edit/delete of a posted financial record;
  corrections are additive only.
- **Test:** no PR exposes destructive mutation of posted financial data.
- **Builds on:** DR-006, DR-019, DR-044 (universalized as a product stance).

**PA-6 — Non-Authority.**
- **Law:** the product records and reveals; it **never approves, authorizes, gates, or
  enforces process** on the owner.
- **Forces:** no PR may introduce an approval, permission, sign-off, or mandatory
  workflow gate.
- **Test:** no PR contains an approval/authorization/gate step.
- **Builds on:** F-02, ADR-0019 S7-D6 (made a product-identity law).

**PA-7 — Total Auditability.**
- **Law:** every financial change the product makes is traceable to a **single
  recorded cause** and remains discoverable afterward.
- **Forces:** every state-changing PR names the recorded cause it derives from and
  emits an activity record.
- **Test:** every financial-effect PR references its cause and an activity event.
- **Builds on:** DR-019, DR-020, M-10 (product-level total-traceability law).

## 3. Downstream-impact table

| Axiom | Why it exists | Documents it will affect later | Effect type |
|---|---|---|---|
| PA-1 Simplicity Ceiling | Constitutional anti-bloat law; makes scope self-limiting | every PC document, every PR, every later phase, GOV-006 traceability | Requirements, ADR, UX, Engineering, Testing |
| PA-2 Scope Singularity | Prevents drift into organizational/ERP software (protects M-02, M-03) | PC-004 (non-scope), PC-005 (actors), PC-007 (all PRs), Phase 4 DDL (single dataset) | Requirements, ADR, Engineering, Testing |
| PA-3 Derivation Supremacy | Guarantees no manual computation of any derivable value | PC-002 (automation boundary), PC-007, Phase 3 UX, Phase 4 DDL (no writable derived fields) | Requirements, UX, Engineering, Testing |
| PA-4 Non-Interrogation | Guarantees no re-entry of known facts (knowledge, wider than computation) | PC-002, PC-007, Phase 3 UX, Phase 4 DDL (referential identity) | Requirements, UX, Engineering, Testing |
| PA-5 Non-Destruction | Permanent trust; tamper-evident record | PC-004, PC-007, Phase 2 BR (correction rules), Phase 4 DDL (append-only) | Requirements, Engineering, Testing |
| PA-6 Non-Authority | Single operator; no bureaucracy between owner and action | PC-002, PC-005, PC-007, Phase 3 UX | Requirements, UX, Engineering, Testing |
| PA-7 Total Auditability | Every change explainable and discoverable (M-10) | PC-007, Phase 2 BR, Phase 4 DDL (activity record), Phase 3 UX | Requirements, Engineering, Testing |
