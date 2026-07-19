# BC-000 — Business Constitution Framework

| Field | Value |
|---|---|
| Doc ID | BC-000 |
| Title | Business Constitution Framework |
| Phase | 2 (Business Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | P2-000 (governing plan); PC-001…PC-008 (frozen Product Constitution); DOM-001…005 + DR-001…090 (frozen Domain, Phase 1A); GOV-011, GOV-012, GOV-003, GOV-004, GOV-006, GOV-010 |
| Answers | "What is the constitutional responsibility of the Business Constitution layer?" |
| Defines no | business rule, workflow, calculation, entity, validation, accounting policy, UI, engineering, DB, API, or test — those belong to later BC documents |

---

## 1. Business Constitution Purpose

The Business Constitution exists to convert **frozen business truth** into a governed,
atomic, testable body of **Business Rules (BR-NNN)** that later phases (Data,
Components, Screens, code, tests) implement without re-interpreting the business.

- Phase 1A (Domain Discovery) answered *"what is true about the business?"* — frozen as
  facts (F), measures (M), and domain rules (DR-001…090).
- Phase 1 (Product Constitution) answered *"what is the product, and what is it
  deliberately not?"* — frozen as PA/PP/MMI/SC/AX/PR/AC.
- Phase 2 (**Business Constitution**) answers *"exactly how must the business behave,
  rule by rule, within the product's frozen scope?"* — the precise **BR-NNN**
  specifications (distribution, vouchers, balances, corrections, refunds, lifecycles)
  expressed as engineering-grade, verifiable statements.

BC-000 itself defines **only the architectural contract** for that layer. It is the
constitution *of* the Business Constitution: scope, responsibility, boundaries,
derivation, governance, principles, integrity, and completion — and **not one single
business rule.** BC-000 is authored under **P2-000** as the first document of Phase 2;
**P2-000 — not BC-000 — opens the phase.**

The knowledge chain BC-000 establishes:

> **Frozen Business Truth (Domain 1A) → Business Constitution (BR-NNN) → Business
> Decisions → Operational Behavior**, authored under and bounded by the Product
> Constitution.

## 2. Layer Responsibility

The Business Constitution has one exclusive responsibility:

> **To state, atomically and verifiably, every rule of business behavior the product
> must exhibit — and nothing else.**

It **SHALL**:
- express each unit of business behavior as one atomic **BR-NNN** rule;
- ground every BR in frozen business truth (Domain 1A) and keep it within the product's
  frozen scope (PC-004) and vocabulary (PC-006);
- make each BR observable and decidable (a BR is either satisfied or violated by an
  observed business outcome);
- preserve traceability from each BR upstream (to F/DR/M and PR) and downstream (to the
  phases that will implement it).

It **SHALL NOT** own identity, scope, vocabulary, or actor decisions (those are frozen
in the Product Constitution), nor any presentation, construction, storage, or
verification concern (later layers).

## 3. Layer Boundaries

| Layer | Question it owns | Belongs to it | Never in the Business Constitution |
|---|---|---|---|
| **Product Constitution** (Phase 1, frozen) | What is the product, its scope, vocabulary, actors, guarantees? | PA/PP/MMI/SC/NS/AP/AX/PR/AC | — (BC may not restate or override it) |
| **Business Constitution** (Phase 2, this layer) | How must the business behave, rule by rule, within product scope? | **BR-NNN** business rules; calculation/policy/immutability rules; BR traceability | anything below this row |
| **UX** (Phase 3) | How is a rule presented, entered, navigated? | interaction, IA, flow, copy, RTL | screens, wording, layout |
| **Engineering / Data / API** (Phase 4+) | How is a rule constructed, stored, exposed? | schema, algorithm, endpoint, index | tables, keys, APIs, code |
| **Testing** (implementation track) | How is a rule proven in a build? | test cases, fixtures, assertions | concrete test procedures |
| **Implementation** (build) | The running system | code, config, deployment | any executable artifact |

**Boundary rules**
- **BB-1** A BR states *business behavior only* — never how it is shown, stored,
  computed in code, exposed, or tested.
- **BB-2** The Business Constitution never redefines a Product concept (PC-003) or
  coins a term outside the canonical glossary (PC-006); it *uses* them.
- **BB-3** The Business Constitution never widens or narrows product scope (PC-004); a
  rule for an out-of-scope capability is rejected, not written.
- **BB-4** Reflective concerns (documentation, tests that *reflect* a BR) inherit the
  BR's Business ownership per GOV-012 L11 — but their artifacts live in their own
  layers.

## 4. Derivation Rules

### 4.0 Dual Authority Doctrine (constitutional)

The Business Constitution answers to **two frozen authorities, each supreme in its own
domain**, and a Business Rule is valid only when it satisfies **both authorities
simultaneously**:

- **Authority of Truth — the frozen Domain (Phase 1A).** The source of every rule's
  *substance*. A BR's behavior derives from, and may never contradict, frozen Domain
  truth (F/DR/M). Consistent with GOV-012, this business truth constrains all layers
  below it.
- **Authority of Constitutional Legitimacy — the frozen Product Constitution
  (Phase 1).** The source of every rule's *boundary*. A BR's scope, vocabulary, actors,
  and guarantees derive from, and may never breach, the frozen Product Constitution
  (PC-003 / PC-004 / PC-005 / PC-006 / PC-007 / PC-008).

A Business Rule that is true to the Domain but outside product scope is **illegitimate**;
one that is legitimate but untrue to the Domain is **invalid**. The two authorities
never override one another inline; an apparent conflict is escalated as an amendment
(GOV-004 §5), never resolved by fiat. This is the **Dual Authority** of the Business
Constitution.

### 4.1 Derivation rules

- **BCD-1 — Dual upstream.** Every BR derives its **substance** from a frozen Domain
  truth (F/DR/M, Phase 1A) and its **legitimacy** from the Product Constitution: it
  must fall within product scope (PC-004), honor product requirements/guarantees
  (PC-007/PC-008), and use canonical vocabulary (PC-006).
- **BCD-2 — Subordination of legitimacy.** No BR may bypass, weaken, or contradict a
  Product Requirement or Acceptance Criterion. Where the product excluded a behavior,
  the Business Constitution states no rule for it — the Authority of Constitutional
  Legitimacy.
- **BCD-3 — No contradiction.** No BR may contradict a frozen DR, another BR, or any
  frozen governance/product statement. A needed change to frozen truth is an amendment
  (GOV-004 §5), never an inline override.
- **BCD-4 — No duplication.** The Business Constitution does not restate DR rules
  verbatim, nor restate product decisions; it *formalizes* domain truth into
  implementable BR and *cites* its sources. Copy-forward without added specification is
  rejected.
- **BCD-5 — Traceable origin.** Every BR carries explicit upstream citations (≥1 of
  F/DR/M **and** the governing PR/PC clause). A BR with no traceable origin does not
  exist.

## 5. Governance Rules

- **BCG-1 — Lifecycle.** Each BC document: `DRAFT → Owner review → Owner approval →
  propagation (GOV-010) → FROZEN`. Identical to the Phase-1 rhythm.
- **BCG-2 — Approval.** No BC document is authored, propagated, or frozen without an
  explicit Owner Engineering Order; each propagation records an ADR (GOV-010 §5,
  category *Business*).
- **BCG-3 — Amendment.** A frozen BR changes only by a superseding ADR that repairs all
  downstream artifacts in the same commit (GOV-004 §5); ad-hoc reinterpretation is
  prohibited.
- **BCG-4 — Versioning.** Semantic (ADR-0003): DRAFT until first freeze; MINOR for
  additive BR, MAJOR for a superseding change; registers bump in the same commit.
- **BCG-5 — Traceability obligation.** Every BR appears in the Phase-2 traceability
  matrix (upstream F/DR/M + PR; downstream implementing phases), conforming to GOV-006;
  zero orphan BR and zero uncovered in-scope DR at freeze.
- **BCG-6 — Numbering.** Business rules use a single continuous **BR-NNN** series across
  all BC documents; BC framework/spec documents use the **BC-NNN** series (BC-000 is
  this framework). Numbers are never reused.

## 6. Business Constitution Principles

Every BC document and every BR **SHALL** satisfy:

- **BCP-1 — Single Responsibility.** One document owns one coherent area; one BR owns
  one behavior.
- **BCP-2 — Atomic Decisions.** A BR is indivisible — it cannot be split into two
  independently-true rules.
- **BCP-3 — Observable Rules.** A BR is decidable from an observed business outcome
  (satisfied / violated); non-observable intentions are not BR.
- **BCP-4 — Traceable Origin.** Every BR cites frozen upstream truth and its governing
  product clause (BCD-5).
- **BCP-5 — Business-first language.** BR are written in the business's own (canonical,
  PC-006) vocabulary — not in UI, data, or code terms.
- **BCP-6 — No implementation knowledge.** No algorithm, data structure, storage, or
  performance detail.
- **BCP-7 — No UI knowledge.** No screen, field, layout, wording, or interaction
  detail.
- **BCP-8 — No technology knowledge.** No product/vendor, framework, protocol, API, or
  database concept.
- **BCP-9 — Dual Authority.** Every BR simultaneously satisfies the Authority of Truth
  and the Authority of Constitutional Legitimacy (§4.0).

## 7. Constitutional Integrity Rules

Every BR **SHALL**:

- **BCI-1 — Derive** from frozen truth and be legitimate under the Product Constitution
  (BCD-1 / BCD-2).
- **BCI-2 — Stay internally consistent** — contradict no DR, no other BR, no frozen
  governance/product statement (BCD-3).
- **BCI-3 — Never redefine a Product concept** (PC-003) or a canonical term (PC-006);
  it uses them as-frozen.
- **BCI-4 — Never bypass a Product Requirement** (PC-007) or evade an Acceptance
  Criterion (PC-008).
- **BCI-5 — Never leak downstream** — introduce no UI, engineering, data, API, or test
  artifact (BB-1, BCP-6/7/8).

A statement violating any BCI is **rejected at authoring**, not deferred to review.

## 8. Business Constitution Completion Rules

Phase 2 may be declared complete and closed **only when every** criterion holds:

- **BX-1** — BC-000 is FROZEN and every planned BC document (P2-000 §5) is FROZEN.
- **BX-2** — Every in-scope business behavior (each in-scope DR/WF of Domain 1A that the
  product retains) is covered by ≥1 BR — no uncovered in-scope truth.
- **BX-3** — Every BR is atomic, observable, and traces upstream to F/DR/M **and** a
  Product clause — no orphan BR.
- **BX-4** — No BR contradicts a DR, another BR, or any frozen product/governance
  statement.
- **BX-5** — A complete Phase-2 traceability matrix exists (GOV-006), and a closure
  audit records eight gates PASS.
- **BX-6** — The next phase (UX, Phase 3) can begin with no further business
  interpretation required.

When BX-1…BX-6 all hold, the Business Constitution becomes the single reference for
*how the business behaves*, and Phase 3 may be authorized under GOV-011 §2.

---

## Strict-scope self-check

BC-000 contains **no** business rule, workflow, calculation, accounting policy, entity,
validation, UI, engineering, DB, API, or test. It defines only scope, responsibility,
boundaries, derivation, governance, principles, integrity, and completion for the
Business Constitution — answering the single question in its header.
