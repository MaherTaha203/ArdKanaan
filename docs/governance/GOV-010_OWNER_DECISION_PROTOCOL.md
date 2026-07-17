# GOV-010 — Owner Decision Protocol

| Field | Value |
|---|---|
| Doc ID | GOV-010 |
| Title | Owner Decision Protocol |
| Phase | 0 (governance) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | GOV-000 (M-09), GOV-001, GOV-004 §5, GOV-007, GOV-011, ADR-0012 |
| Referenced by | GOV-001 §9, DEC-000 |

---

## 1. Purpose

This document is the **authoritative protocol governing how Owner decisions are
introduced, propagated, verified, and frozen** across the Ard Kanaan repository.
It binds every session, agent, and reviewer, in every phase, forever. With its
acceptance, the Governance layer (GOV-000…GOV-011) is **complete and frozen
unless explicitly reopened by the Owner** (§10).

## 2. Decision Authority

The **Owner is the sole authority** for:

- Business Decisions
- Product Decisions
- Engineering Roadmap
- Scope Decisions
- Feature Acceptance
- Architecture Approval
- Freeze Decisions
- Naming Decisions
- Priority Decisions

Claude (and any AI executor) **may**:

- analyze
- review
- detect inconsistencies
- recommend alternatives

Claude may **NEVER** replace an Owner decision with its own judgment. A
recommendation is input to the Owner; only the Owner's ruling has force.
(Operationalizes M-09 and GOV-007 AI-10/AI-11/AI-39.)

## 3. Decision Hierarchy

Precedence of decisions, highest first:

```
Owner Decision
  ↓
ADR
  ↓
Project Constitutions
  ↓
Governance Documents
  ↓
Design Language (DDL)
  ↓
Component Library
  ↓
Everything Else
```

**If any lower-level artifact conflicts with a newer Owner decision, the Owner
decision immediately prevails.** The conflicting artifact is repaired through
the lifecycle in §4 — never the other way around.

## 4. Decision Lifecycle

Every Owner decision follows this mandatory lifecycle:

```
Owner Decision
  ↓
Impact Analysis
  ↓
Affected Artifacts Identified
  ↓
Repository Update
  ↓
Cross-reference Update
  ↓
Review Pipeline
  ↓
Repository Freeze
```

**No step may be skipped.** The decision is recorded as an ADR (GOV-001 §7,
DEC-000) at the head of the lifecycle; the freeze at its tail follows the
amendment procedure (GOV-004 §5) with all eight quality gates (GOV-003).

## 5. Decision Categories

Every Owner decision is classified into at least one category:

- Business
- Product
- Architecture
- UX
- UI
- Engineering
- Naming
- Scope
- Priority
- Governance
- Roadmap

The category determines which document sets the impact analysis (§4) must
examine first, but never limits the repository-wide verification of §9.

## 6. Repository Propagation Rule

```
One Owner Decision  →  One Repository State
```

**Partial propagation is forbidden.** Either every affected artifact is updated,
or none are. A commit series implementing a decision must land the decision
record, all artifact updates, and all cross-reference repairs as one consistent
repository state (GOV-001 §6, GOV-002 §8.3).

## 7. Mandatory Impact Report

Every propagated Owner decision SHALL produce a report listing at least:

- Affected Documents
- Affected ADRs
- Affected Business Rules
- Affected Unknowns
- Affected Traceability
- Affected Reviews
- Affected Governance Files

The report is delivered to the Owner and its substance is preserved in the
decision's audit report (`docs/audits/`).

## 8. Silent Impact Prohibition

**No repository artifact may remain outdated after an accepted Owner decision.**
Impacts that cannot yet be determined SHALL be explicitly reported as unknown
impacts — never omitted. **Hidden impacts are engineering defects** and fail the
review pipeline at whichever gate detects them.

## 9. Verification

After every propagated Owner decision, repository-wide verification SHALL run,
including at minimum:

- Cross-reference validation
- Traceability validation
- Broken-reference detection
- Governance consistency
- Repository consistency
- Review pipeline execution (all eight gates, GOV-003, one uninterrupted run)

Verification evidence is recorded in the decision's audit report (GOV-004 §6,
AI-37).

## 10. Completion Rule

The Governance layer SHALL be considered complete only after:

- GOV-010 is integrated
- All governance references are synchronized
- Repository Health (GOV-009) is updated
- Repository Index (IDX-001) is updated
- Cross references are updated
- Decision Log (DEC-000) is updated
- Review Pipeline passes
- All Quality Gates pass

Upon completion, the Governance layer (GOV-000…GOV-011) is **FROZEN** and may be
reopened **only by explicit Owner order**, executed through this protocol's own
lifecycle (§4).
