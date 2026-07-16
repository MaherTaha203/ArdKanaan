# IDX-001 — Documentation Index

| Field | Value |
|---|---|
| Doc ID | IDX-001 |
| Title | Documentation Index |
| Phase | 0 |
| Status | LIVING |
| Version | 1.0.0 |
| Depends on | GOV-001, GOV-002 |

This is the **master map** of all documentation in the Ard Kanaan repository.
Every document in `docs/` MUST be registered here. A document that is not registered
here does not officially exist (see GOV-001 §4).

---

## 1. Directory layout

```
/
├── README.md                     Project front door
└── docs/
    ├── INDEX.md                  ← this file (IDX-001)
    ├── governance/               Phase 0 — rules of the repository
    ├── decisions/                Decision log + ADRs (all phases)
    ├── roadmap/                  Phase roadmap
    ├── templates/                Canonical document templates
    ├── audits/                   Audit reports, one folder per phase
    │   └── phase-0/
    ├── product/                  Phase 1 — Product Constitution   (RESERVED)
    ├── business/                 Phase 2 — Business Constitution  (RESERVED)
    ├── ux/                       Phase 3 — UX Constitution        (RESERVED)
    ├── data/                     Phase 4 — DDL Specification      (RESERVED)
    ├── components/               Phase 5 — Component Library Spec (RESERVED)
    └── screens/                  Phase 6 — Screen Blueprints      (RESERVED)
```

RESERVED directories contain only a `README.md` stub until their phase opens.
Writing content into a reserved directory before its phase opens is a
Gate 8 (Repository Integrity) violation.

---

## 2. Document register

### 2.1 Phase 0 — Governance & Bootstrap

| Doc ID | File | Title | Status |
|---|---|---|---|
| IDX-001 | `docs/INDEX.md` | Documentation Index | LIVING |
| GOV-001 | `docs/governance/GOVERNANCE.md` | Repository Governance | FROZEN |
| GOV-002 | `docs/governance/CONVENTIONS.md` | Engineering & Naming Conventions | FROZEN |
| GOV-003 | `docs/governance/QUALITY-GATES.md` | Quality Gates | FROZEN |
| GOV-004 | `docs/governance/REVIEW-PROCESS.md` | Review Process | FROZEN |
| GOV-005 | `docs/governance/WORKFLOW.md` | Engineering Workflow | FROZEN |
| GOV-006 | `docs/governance/TRACEABILITY.md` | Traceability & Cross-Reference Strategy | FROZEN |
| RDM-001 | `docs/roadmap/ROADMAP.md` | Phase Roadmap | LIVING |
| DEC-000 | `docs/decisions/DECISION-LOG.md` | Decision Log | LIVING |
| ADR-0001 | `docs/decisions/ADR-0001-documentation-first-pipeline.md` | Documentation-First Pipeline | ACCEPTED |
| ADR-0002 | `docs/decisions/ADR-0002-repository-structure.md` | Repository Structure & Taxonomy | ACCEPTED |
| ADR-0003 | `docs/decisions/ADR-0003-document-identity-and-lifecycle.md` | Document Identity, Naming & Lifecycle | ACCEPTED |
| ADR-0004 | `docs/decisions/ADR-0004-traceability-strategy.md` | Traceability Strategy | ACCEPTED |
| ADR-0005 | `docs/decisions/ADR-0005-documentation-language.md` | Documentation Language | ACCEPTED |
| TPL-001 | `docs/templates/DOCUMENT-TEMPLATE.md` | Canonical Document Template | LIVING |
| TPL-002 | `docs/templates/ADR-TEMPLATE.md` | ADR Template | LIVING |
| TPL-003 | `docs/templates/AUDIT-TEMPLATE.md` | Audit Report Template | LIVING |
| AUD-P0-001 | `docs/audits/phase-0/AUDIT-P0-REPOSITORY.md` | Phase 0 Repository Audit Report | FROZEN |

### 2.2 Phase 1 — Product Constitution (NOT YET OPEN)

| Doc ID | File | Title | Status |
|---|---|---|---|
| — | `docs/product/` | Reserved | PENDING |

### 2.3 Phase 2 — Business Constitution (NOT YET OPEN)

| Doc ID | File | Title | Status |
|---|---|---|---|
| — | `docs/business/` | Reserved | PENDING |

### 2.4 Phase 3 — UX Constitution (NOT YET OPEN)

| Doc ID | File | Title | Status |
|---|---|---|---|
| — | `docs/ux/` | Reserved | PENDING |

### 2.5 Phase 4 — DDL Specification (NOT YET OPEN)

| Doc ID | File | Title | Status |
|---|---|---|---|
| — | `docs/data/` | Reserved | PENDING |

### 2.6 Phase 5 — Component Library Specification (NOT YET OPEN)

| Doc ID | File | Title | Status |
|---|---|---|---|
| — | `docs/components/` | Reserved | PENDING |

### 2.7 Phase 6 — Screen Blueprints (NOT YET OPEN)

| Doc ID | File | Title | Status |
|---|---|---|---|
| — | `docs/screens/` | Reserved | PENDING |

---

## 3. Maintenance rules

1. Any new document is added to this register **in the same commit** that creates it.
2. Any status change (DRAFT → IN-REVIEW → FROZEN → SUPERSEDED) is reflected here
   in the same commit.
3. The register is verified by Gate 6 (Documentation Review) and Gate 8
   (Repository Integrity Review) at every phase audit.
