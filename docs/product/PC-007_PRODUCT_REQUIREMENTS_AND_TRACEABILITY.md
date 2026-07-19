# PC-007 — Product Requirements & Traceability

| Field | Value |
|---|---|
| Doc ID | PC-007 |
| Title | Product Requirements & Traceability |
| Phase | 1 (Product Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | PC-001…PC-006 (frozen constitution), P1-000, GOV-006 (traceability), GOV-012 |
| Answers | "What constitutional requirements must every future phase satisfy, and how are they traced?" |

---

## 1. Requirement Principles

- **RP-1 — Derivation only.** Every Product Requirement (PR) derives from a frozen
  constitutional source (PC-001…PC-006); none is invented (PA-1).
- **RP-2 — Atomicity.** Each PR states exactly one verifiable obligation (GOV-012 L1).
- **RP-3 — Layer purity.** A PR is technology-, UI-, implementation-, and
  database-independent; it states *what must hold*, never *how* (GOV-012).
- **RP-4 — No downstream invention.** PRs create no Business Rule, UX behavior,
  engineering constraint, schema, workflow, API, or test case.
- **RP-5 — Verifiability.** Each PR names a requirement-level verification method (no
  invented test cases).
- **Requirement Types:** **Invariant**, **Prohibition**, **Capability**,
  **Governance**, **Naming**.

## 2. Product Requirement Catalog

| ID | Statement | Type | Source | Affected phases | Verification |
|---|---|---|---|---|---|
| **Identity** |
| PR-001 | The product serves exactly one center/owner/dataset; no multi-owner/center/tenant/company structure exists | Invariant | PC-001 PA-2; PC-004 NS-1; PC-005 AX-1 | 2,3,4,Test | static scan: no plurality introduced |
| PR-002 | No value computable from recorded facts is ever entered by hand | Prohibition | PC-001 PA-3; PC-002 PP-1 | 2,3,4,Test | input-source check |
| PR-003 | The product never asks for information it already holds or can determine | Prohibition | PC-001 PA-4 | 3,4,Test | input-retrievability check |
| PR-004 | No posted financial record is ever edited or deleted; correction is additive | Prohibition | PC-001 PA-5; PC-002 PP-3; PC-004 AP-3 | 2,4,Test | destructive-mutation scan |
| PR-005 | The product never approves, authorizes, gates, or enforces process | Prohibition | PC-001 PA-6; PC-004 NS-3/AP-4; PC-005 AX-2 | 2,3,4,Test | gate/approval scan |
| PR-006 | Every financial change is traceable to a single recorded cause, discoverable after the fact | Invariant | PC-001 PA-7 | 2,4,Test | cause-trace check |
| PR-007 | Every capability traces to a frozen DR/WF or an approved PR; unrequired capability is forbidden | Invariant | PC-001 PA-1; PC-002 PP-4; PC-004 §1/§6 | all | capability-register trace |
| **Actors** |
| PR-008 | Exactly one system user (the Owner); no second user/account/role/permission | Invariant | PC-005 AX-1/AX-2 | 3,4,Test | role/user scan |
| PR-009 | Teachers/Students/Guardians never operate the product; they exist only as subjects/contacts | Prohibition | PC-005 AX-3 | 3,4,Test | actor-capability scan |
| PR-010 | The product hides nothing from, and forbids nothing to, the Owner | Invariant | PC-005 AX-4 | 3,4,Test | Owner-restriction scan |
| PR-011 | "Only the Owner operates the product" is a product guarantee (mechanism out of scope) | Invariant | PC-005 AX-5 | 4,Test | guarantee statement present |
| **Concepts** |
| PR-012 | The product exposes only PC-003 concepts; no concept without DOM-002/frozen-rule trace | Prohibition | PC-003 MMI-2; PC-004 AP-8 | 2,4,Test | concept-trace check |
| PR-013 | Each concept has one meaning/responsibility; no two overlap | Invariant | PC-003 MMI-1 | 2,4 | overlap review |
| PR-014 | The three balances are never merged; Teacher×Program relationships are never offset across programs | Prohibition | PC-003; PC-004 AP-7 | 2,3,4,Test | merge/offset scan |
| PR-015 | Derived concepts are revealed only, never authored | Prohibition | PC-003 MMI-4; PC-002 PP-1 | 3,4,Test | authoring-surface scan |
| PR-033 | Every product concept is definable and usable independent of any presentation; no concept depends on a screen existing | Invariant | PC-003 MMI-3 | 3,4,Test | screen-independence review |
| **Records** |
| PR-016 | Each primary fact has exactly one authoring point; no fact captured twice | Invariant | PC-002 PP-2 | 3,4,Test | authoring-point check |
| PR-017 | Every recorded financial fact is permanent; correction creates a new fact beside it | Invariant | PC-001 PA-5; PC-002 PP-3; PC-003 MMI-5 | 2,4,Test | permanence check |
| PR-018 | Every financial voucher type carries an official, unique, sequential number in its own series | Invariant | PC-004 SC-12 | 4,Test | numbering-uniqueness check |
| PR-019 | Every recorded change originates from an explicit owner action; the product never self-originates a financial change | Prohibition | PC-002 PP-6; PC-004 NS-11/AP-5 | 2,3,4,Test | origin scan |
| **Derived Truths** |
| PR-020 | The product reveals the three balances, per-program teacher balances/debts, and each party's financial standing — all derived | Capability | PC-003 §E; PC-004 SC-8 | 2,3,4,Test | reveal-only check |
| PR-021 | No party sets a Category-C value; every C decision is computed only | Prohibition | PC-002 Automation C, AB-1 | 2,4,Test | A/B/C classification check |
| **Language** |
| PR-022 | Exactly one Canonical Product Term per concept; banned synonyms never appear | Naming | PC-006 NR-1/NR-2/GG-1 | 2,3,4,Test | banned-term scan (Gate 6) |
| PR-023 | Business/Arabic/localized names are aliases only, never additional canonical terms | Naming | PC-006 NR-3 | 3 | alias review |
| PR-024 | A new PC-003 concept gets its canonical term in PC-006 before propagation; renaming requires an ADR + dependent updates | Governance | PC-006 GG-2/GG-3 | all | governance check |
| **Scope** |
| PR-025 | The product contains exactly PC-004 §1 capabilities; anything not listed (or §6-admitted) does not exist | Invariant | PC-004 §1 | all | capability-set diff |
| PR-026 | No Non-Scope capability exists; Permanent exclusions enter only by constitutional amendment | Prohibition | PC-004 §2/§6 Tier 3 | all | non-scope scan |
| PR-027 | Every proposed capability passes all Boundary Tests BT-1…BT-7 before admission | Governance | PC-004 §4 | all | boundary-test gate |
| PR-028 | The product exhibits none of AP-1…AP-8 | Prohibition | PC-004 §3 | all,Test | anti-pattern detection tests |
| **Growth** |
| PR-029 | Every new request is classified Data/Capability/Behavior/Implementation and routed to its owning layer | Governance | PC-004 §5 | all | classification check |
| PR-030 | Capability growth follows the extension tiers (Data→T1, Capability→T2 ADR+PR, axiom/scope-crossing→T3) | Governance | PC-004 §6 | all | tier-routing check |
| **Auditability** |
| PR-031 | Every meaningful event is recorded on the append-only Activity Record | Invariant | PC-001 PA-7; PC-003 Activity Record | 2,4,Test | event-coverage check |
| PR-032 | Every state the product introduces is derivable, inspectable, and traceable to its cause; no hidden state | Invariant | PC-002 PP-5 | 3,4,Test | hidden-state scan |

## 3. Requirement Categories

Identity (PR-001…007) · Actors (008…011) · Concepts (012…015, 033) · Records
(016…019) · Derived Truths (020…021) · Language (022…024) · Scope (025…027, 028) ·
Growth (029…030) · Auditability (031…032).

## 4. Traceability Matrix (PR → downstream layers)

✓ = the layer must honor this requirement.

| PR | Phase 2 (BR) | Phase 3 (UX) | Phase 4 (DDL/Eng) | Testing |
|---|---|---|---|---|
| PR-001 | ✓ | ✓ | ✓ | ✓ |
| PR-002 | ✓ | ✓ | ✓ | ✓ |
| PR-003 | | ✓ | ✓ | ✓ |
| PR-004 | ✓ | | ✓ | ✓ |
| PR-005 | ✓ | ✓ | ✓ | ✓ |
| PR-006 | ✓ | | ✓ | ✓ |
| PR-007 | ✓ | ✓ | ✓ | ✓ |
| PR-008 | | ✓ | ✓ | ✓ |
| PR-009 | | ✓ | ✓ | ✓ |
| PR-010 | | ✓ | ✓ | ✓ |
| PR-011 | | | ✓ | ✓ |
| PR-012 | ✓ | | ✓ | ✓ |
| PR-013 | ✓ | | ✓ | |
| PR-014 | ✓ | ✓ | ✓ | ✓ |
| PR-015 | | ✓ | ✓ | ✓ |
| PR-016 | | ✓ | ✓ | ✓ |
| PR-017 | ✓ | | ✓ | ✓ |
| PR-018 | | | ✓ | ✓ |
| PR-019 | ✓ | ✓ | ✓ | ✓ |
| PR-020 | ✓ | ✓ | ✓ | ✓ |
| PR-021 | ✓ | | ✓ | ✓ |
| PR-022 | ✓ | ✓ | ✓ | ✓ |
| PR-023 | | ✓ | | |
| PR-024 | ✓ | ✓ | ✓ | |
| PR-025 | ✓ | ✓ | ✓ | ✓ |
| PR-026 | ✓ | ✓ | ✓ | ✓ |
| PR-027 | ✓ | ✓ | ✓ | |
| PR-028 | ✓ | ✓ | ✓ | ✓ |
| PR-029 | ✓ | ✓ | ✓ | |
| PR-030 | ✓ | ✓ | ✓ | |
| PR-031 | ✓ | | ✓ | ✓ |
| PR-032 | | ✓ | ✓ | ✓ |
| PR-033 | | ✓ | ✓ | ✓ |

## 5. Coverage Review

Every constitutional decision maps to ≥1 PR:

| Constitutional source | Covered by |
|---|---|
| PC-001 PA-1…PA-7 | PR-007, 001, 002, 004, 005, 006, 031 |
| PC-002 PP-1…PP-6 | PR-002/015, 016, 004/017, 007, 032, 019 |
| PC-002 Automation A/B/C + AB-1 | PR-021 (C), PR-019 (A), PR-005 (B), PR-021 (one-category) |
| PC-003 MMI-1…MMI-9 | PR-013 (1), 012 (2), 033 (3), 015 (4), 017 (5), 022/RP-3 (6/7), 001/008 (8), 021 (9) |
| PC-003 concepts (19) | PR-012, PR-020, PR-031 |
| PC-004 SC-1…12 | PR-025, PR-020, PR-018 |
| PC-004 NS-1…12 | PR-026 (+ 001/005/014/019) |
| PC-004 AP-1…8 | PR-028 (+ 002,004,005,019,032,014,012) |
| PC-004 BT-1…7 | PR-027 |
| PC-004 §5/§6 | PR-029, PR-030 |
| PC-005 AX-1…5 | PR-008, 009, 010, 011 |
| PC-006 NR-1…4, GG-1…4 | PR-022, 023, 024 |

**Uncovered constitutional statements:** none.

## 6. Constitutional Coverage Report

Every Product Constitution document is fully represented by traceable, verifiable
Product Requirements:

| Constitution | Requirements Derived | Coverage |
|---|---|---|
| PC-001 — Product Manifesto | ✓ PR-001, 002, 004, 005, 006, 007, 031 | 100% |
| PC-002 — Product Principles (+ Automation Boundary) | ✓ PR-002, 015, 016, 017, 019, 021, 032 | 100% |
| PC-003 — Product Mental Model | ✓ PR-012, 013, 014, 015, 017, 020, 031, 033 | 100% |
| PC-004 — Scope, Non-Scope & Anti-Patterns | ✓ PR-018, 025, 026, 027, 028, 029, 030 | 100% |
| PC-005 — Actors & Access Model | ✓ PR-008, 009, 010, 011 | 100% |
| PC-006 — Product Language & Glossary | ✓ PR-022, 023, 024 | 100% |

**Constitutional atom coverage:** PA-1…PA-7 ✓ · PP-1…PP-6 ✓ · Automation A/B/C + AB-1 ✓
· MMI-1…MMI-9 ✓ · 19 concepts ✓ · SC-1…12 ✓ · NS-1…12 ✓ · AP-1…8 ✓ · BT-1…7 ✓ ·
Extension Classification + tiers ✓ · AX-1…5 ✓ · NR-1…4 + GG-1…4 ✓.

> **No constitutional statement remains without at least one derived Product
> Requirement.**
