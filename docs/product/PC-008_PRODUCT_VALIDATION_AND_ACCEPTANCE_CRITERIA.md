# PC-008 — Product Validation & Acceptance Criteria

| Field | Value |
|---|---|
| Doc ID | PC-008 |
| Title | Product Validation & Acceptance Criteria |
| Phase | 1 (Product Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | PC-001…PC-007 (frozen constitution), P1-000, GOV-003 (gates), GOV-006, GOV-012 |
| Answers | "How do we objectively determine that the Product Constitution has been satisfied?" |

---

## 1. Validation Principles

- **VP-1 — Derivation only.** Every Acceptance Criterion (AC) derives from one or more
  PC-007 Product Requirements; none introduces a new product decision.
- **VP-2 — Objective & Pass/Fail decidable.** Each AC yields a single Pass/Fail verdict
  from observable facts about a downstream artifact.
- **VP-3 — Layer purity.** Each AC is technology-, UI-, implementation-, and
  database-independent (GOV-012); it validates *conformance*, not *construction*.
- **VP-4 — No downstream invention.** ACs are acceptance *conditions*, not test cases,
  QA procedures, business rules, or UX/engineering constraints.
- **VP-5 — Applicability.** An AC applies to **any** future artifact claiming to
  implement the product; it is the constitutional acceptance gate every later phase must
  pass.

## 2. Acceptance Criteria Catalog

| AC | Statement (the artifact under review is accepted iff…) | Requirement(s) | Constitution | Verification | Pass | Fail |
|---|---|---|---|---|---|---|
| **Identity** |
| AC-01 | it introduces no second owner/center/tenant/company/role, and every capability traces upstream | PR-001, PR-007, PR-025 | PA-1/PA-2 | scope/trace review | zero violations | any plurality or untraced capability |
| AC-02 | it accepts no input for a derivable value nor for a fact already known | PR-002, PR-003 | PA-3/PA-4 | input-source review | all inputs new primary facts | any derived/known-fact input |
| AC-03 | it permits no edit/delete of a posted financial fact; corrections are additive | PR-004, PR-017 | PA-5 | mutation review | additive-only | any destructive mutation |
| AC-04 | it introduces no approval, permission, or workflow gate | PR-005 | PA-6 | gate review | none present | any gate/approval |
| AC-05 | every financial-changing element ties to a recorded cause and an activity record | PR-006, PR-031 | PA-7 | cause/trace review | all tied | any untied change |
| **Actors** |
| AC-06 | it defines exactly one system user, no roles, and no restriction on the Owner | PR-008, PR-010 | AX-1/AX-2/AX-4 | actor review | one user, total access | any 2nd user/role/restriction |
| AC-07 | it grants no operating capability to Teachers/Students/Guardians | PR-009 | AX-3 | actor-capability review | none granted | any party capability |
| AC-08 | it asserts the single-user guarantee and specifies no enforcement mechanism in a product artifact | PR-011 | AX-5 | guarantee review | guarantee present, mechanism absent | mechanism leaks into product layer |
| **Mental Model** |
| AC-09 | every concept it uses maps 1:1 to a PC-003 concept; no overlap, no new concept | PR-012, PR-013 | MMI-1/MMI-2 | concept review | full 1:1 | any new/overlapping concept |
| AC-10 | it never merges the three balances nor offsets across Teacher×Program | PR-014 | AP-7 | merge/offset review | none | any merge/offset |
| AC-11 | derived truths are revealed only; no party sets a Category-C value | PR-015, PR-020, PR-021 | MMI-4/PP-1/AB-1 | derived-value review | reveal-only | any authoring surface for a derived value |
| AC-12 | every concept is defined without reference to any presentation | PR-033 | MMI-3 | screen-independence review | independent | any screen-dependent concept |
| **Records** |
| AC-13 | each primary fact has exactly one authoring point | PR-016 | PP-2 | authoring-point review | single | any duplicate capture |
| AC-14 | each financial voucher type has a unique sequential series | PR-018 | SC-12 | numbering review | unique/sequential | any reuse or designed gap |
| AC-15 | every financial change originates from an explicit owner action | PR-019 | PP-6/AP-5 | origin review | owner-originated | any self-origination |
| **Language** |
| AC-16 | it uses only canonical terms (zero banned synonyms); aliases are labeled as aliases | PR-022, PR-023 | NR-1/NR-2/NR-3 | terminology scan | clean | any banned term / alias-as-canonical |
| AC-17 | any new concept has a canonical term before propagation; any rename carries an ADR | PR-024 | GG-2/GG-3 | glossary-governance review | satisfied | missing term / unADR'd rename |
| **Scope** |
| AC-18 | it contains only in-scope capabilities; no Non-Scope item is present | PR-025, PR-026 | PC-004 §1/§2 | scope review | in-scope only | any non-scope capability |
| AC-19 | every capability passed BT-1…BT-7 and matches no AP-1…AP-8 | PR-027, PR-028 | PC-004 §3/§4 | boundary/anti-pattern review | all pass, none matched | any BT fail or AP match |
| **Growth** |
| AC-20 | every extension is classified (Data/Capability/Behavior/Implementation) and tier-routed | PR-029, PR-030 | PC-004 §5/§6 | extension review | classified & routed | any misroute |
| **Auditability** |
| AC-21 | every event is recorded and every introduced state is derivable, inspectable, and traceable | PR-031, PR-032 | PA-7/PP-5 | audit/state review | full audit, no hidden state | any hidden state or unrecorded event |
| **Traceability** |
| AC-22 | every element cites upstream (F/DR/M/PR); no orphan element or unrepresented decision | PR-007, PR-024 | GOV-006/PA-1 | traceability review | zero orphans | any orphan |

## 3. Validation Categories

Identity (AC-01…05) · Actors (06…08) · Mental Model (09…12) · Records (13…15) ·
Language (16…17) · Scope (18…19) · Growth (20) · Auditability (21) · Traceability (22).
Derived Truths are validated within Mental Model (AC-11).

## 4. Acceptance Matrix (AC → downstream)

| AC | Requirement(s) | Constitution | Future phases | Testing |
|---|---|---|---|---|
| AC-01 | PR-001/007/025 | PC-001/004 | 2,3,4 | ✓ |
| AC-02 | PR-002/003 | PC-001/002 | 2,3,4 | ✓ |
| AC-03 | PR-004/017 | PC-001/002 | 2,4 | ✓ |
| AC-04 | PR-005 | PC-001/004/005 | 2,3,4 | ✓ |
| AC-05 | PR-006/031 | PC-001/003 | 2,4 | ✓ |
| AC-06 | PR-008/010 | PC-005 | 3,4 | ✓ |
| AC-07 | PR-009 | PC-005 | 3,4 | ✓ |
| AC-08 | PR-011 | PC-005 | 4 | ✓ |
| AC-09 | PR-012/013 | PC-003 | 2,4 | ✓ |
| AC-10 | PR-014 | PC-003/004 | 2,3,4 | ✓ |
| AC-11 | PR-015/020/021 | PC-002/003 | 2,3,4 | ✓ |
| AC-12 | PR-033 | PC-003 | 3,4 | ✓ |
| AC-13 | PR-016 | PC-002 | 3,4 | ✓ |
| AC-14 | PR-018 | PC-004 | 4 | ✓ |
| AC-15 | PR-019 | PC-002/004 | 2,3,4 | ✓ |
| AC-16 | PR-022/023 | PC-006 | 2,3,4 | ✓ |
| AC-17 | PR-024 | PC-006 | all | — |
| AC-18 | PR-025/026 | PC-004 | all | ✓ |
| AC-19 | PR-027/028 | PC-004 | all | ✓ |
| AC-20 | PR-029/030 | PC-004 | all | — |
| AC-21 | PR-031/032 | PC-001/002 | 2,4 | ✓ |
| AC-22 | PR-007/024 | GOV-006 | all | ✓ |

## 5. Coverage Review

Every PC-007 requirement is validated by ≥1 AC (no orphan requirement; no orphan
criterion):

| PR | AC(s) | PR | AC(s) | PR | AC(s) |
|---|---|---|---|---|---|
| PR-001 | AC-01 | PR-012 | AC-09 | PR-023 | AC-16 |
| PR-002 | AC-02 | PR-013 | AC-09 | PR-024 | AC-17, AC-22 |
| PR-003 | AC-02 | PR-014 | AC-10 | PR-025 | AC-18 |
| PR-004 | AC-03 | PR-015 | AC-11 | PR-026 | AC-18 |
| PR-005 | AC-04 | PR-016 | AC-13 | PR-027 | AC-19 |
| PR-006 | AC-05 | PR-017 | AC-03 | PR-028 | AC-19 |
| PR-007 | AC-01, AC-22 | PR-018 | AC-14 | PR-029 | AC-20 |
| PR-008 | AC-06 | PR-019 | AC-15 | PR-030 | AC-20 |
| PR-009 | AC-07 | PR-020 | AC-11 | PR-031 | AC-05, AC-21 |
| PR-010 | AC-06 | PR-021 | AC-11 | PR-032 | AC-21 |
| PR-011 | AC-08 | PR-022 | AC-16 | PR-033 | AC-12 |

**Uncovered requirements:** none.

## 6. Completeness table (mandatory) — PR → AC → Coverage

All 33 requirements → ≥1 acceptance criterion → **100%** (per §5). Category totals:
Identity 7/7, Actors 4/4, Concepts 5/5 (incl. PR-033), Records 4/4, Derived Truths 2/2,
Language 3/3, Scope 3/3, Growth 2/2, Auditability 2/2 — **100% overall.**

> **No Product Requirement remains without at least one constitutional Acceptance
> Criterion.**

## 7. Constitution Completion Statement

Phase 1 (Product Constitution) is **complete** when, and only when, all of the
following hold:
- PC-001…PC-008 are **FROZEN** in the repository;
- every Product Requirement (PC-007) is covered by ≥1 Acceptance Criterion (§5/§6);
- every Acceptance Criterion traces to the constitution (§2/§4);
- no constitutional decision is unrepresented (PC-007 §6 + §5).

## 8. Constitution Exit Criteria

Phase 1 may be officially closed and Phase 2 authorized only when **every** exit
criterion is met:

| # | Exit criterion |
|---|---|
| EX-1 | All PC-001…PC-008 are FROZEN |
| EX-2 | Every Product Requirement is covered by an Acceptance Criterion |
| EX-3 | Every Acceptance Criterion is traceable to the constitution |
| EX-4 | No constitutional decision remains unrepresented |
| EX-5 | The next phase can begin without further constitutional interpretation |

When EX-1…EX-5 all hold, the Product Constitution is the **single reference** for all
later phases, and Phase 2 (Business Constitution) may be authorized under GOV-011 §2.

## 9. Constitutional Lock

Upon Phase-1 closure, **PC-001…PC-008 are locked** as the single, immutable Product
Constitution. No later phase, document, or decision may reinterpret, weaken, or
override a constitutional statement. Any change requires an **explicit constitutional
amendment** (GOV-004 §5; PC-004 Tier 3), never an ad-hoc reading. From closure onward,
every downstream artifact (Business, UX, Data, Components, Screens, code, tests) is
**accepted only against these criteria**, and the Product Constitution is the **sole
product reference** for the remainder of the project. The lock is released only by an
Owner-authorized amendment.
