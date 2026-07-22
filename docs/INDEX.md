# IDX-001 — Documentation Index

| Field | Value |
|---|---|
| Doc ID | IDX-001 |
| Title | Documentation Index |
| Phase | 0 |
| Status | LIVING |
| Version | 1.46.0 |
| Depends on | GOV-000, GOV-001, GOV-002 |

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
    │   ├── phase-0/
    │   ├── phase-1a/
    │   ├── phase-1/
    │   ├── phase-2/
    │   └── phase-3/

    ├── domain/                   Phase 1A — Domain Discovery
    ├── product/                  Phase 1 — Product Constitution   (CLOSED)
    ├── business/                 Phase 2 — Business Constitution  (CLOSED & LOCKED)
    ├── ux/                       Phase 3 — UX Constitution        (IN PROGRESS)
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
| GOV-000 | `docs/governance/GOV-000_PROJECT_MANIFESTO.md` | Project Manifesto | FROZEN |
| GOV-001 | `docs/governance/GOVERNANCE.md` | Repository Governance | FROZEN |
| GOV-002 | `docs/governance/CONVENTIONS.md` | Engineering & Naming Conventions | FROZEN |
| GOV-003 | `docs/governance/QUALITY-GATES.md` | Quality Gates | FROZEN |
| GOV-004 | `docs/governance/REVIEW-PROCESS.md` | Review Process | FROZEN |
| GOV-005 | `docs/governance/WORKFLOW.md` | Engineering Workflow | FROZEN |
| GOV-006 | `docs/governance/TRACEABILITY.md` | Traceability & Cross-Reference Strategy | FROZEN |
| GOV-007 | `docs/governance/GOV-007_AI_EXECUTION_PROTOCOL.md` | AI Execution Protocol | FROZEN |
| GOV-008 | `docs/governance/GOV-008_ENGINEERING_MEMORY.md` | Engineering Memory | LIVING |
| GOV-009 | `docs/governance/GOV-009_REPOSITORY_HEALTH.md` | Repository Health | LIVING |
| GOV-010 | `docs/governance/GOV-010_OWNER_DECISION_PROTOCOL.md` | Owner Decision Protocol | FROZEN |
| GOV-011 | `docs/governance/GOV-011_MASTER_ENGINEERING_ROADMAP.md` | Master Engineering Roadmap | FROZEN |
| GOV-012 | `docs/governance/GOV-012_LAYER_OWNERSHIP_CONSTITUTION.md` | Layer Ownership Constitution | FROZEN |
| RDM-001 | `docs/roadmap/ROADMAP.md` | Phase Roadmap (status tracker, subordinate to GOV-011) | LIVING |
| DEC-000 | `docs/decisions/DECISION-LOG.md` | Decision Log | LIVING |
| ADR-0001 | `docs/decisions/ADR-0001-documentation-first-pipeline.md` | Documentation-First Pipeline | ACCEPTED |
| ADR-0002 | `docs/decisions/ADR-0002-repository-structure.md` | Repository Structure & Taxonomy | ACCEPTED |
| ADR-0003 | `docs/decisions/ADR-0003-document-identity-and-lifecycle.md` | Document Identity, Naming & Lifecycle | ACCEPTED |
| ADR-0004 | `docs/decisions/ADR-0004-traceability-strategy.md` | Traceability Strategy | ACCEPTED |
| ADR-0005 | `docs/decisions/ADR-0005-documentation-language.md` | Documentation Language | ACCEPTED |
| ADR-0006 | `docs/decisions/ADR-0006-phase-0-governance-platform-extension.md` | Phase 0 Governance Platform Extension | ACCEPTED |
| TPL-001 | `docs/templates/DOCUMENT-TEMPLATE.md` | Canonical Document Template | LIVING |
| TPL-002 | `docs/templates/ADR-TEMPLATE.md` | ADR Template | LIVING |
| TPL-003 | `docs/templates/AUDIT-TEMPLATE.md` | Audit Report Template | LIVING |
| AUD-P0-001 | `docs/audits/phase-0/AUDIT-P0-REPOSITORY.md` | Phase 0 Repository Audit Report | FROZEN |
| AUD-P0-002 | `docs/audits/phase-0/AUDIT-P0-EXTENSION.md` | Phase 0 Governance Platform Extension Audit Report | FROZEN |
| ADR-0011 | `docs/decisions/ADR-0011-master-engineering-roadmap.md` | Master Engineering Roadmap as Governance Law | ACCEPTED |
| AUD-P0-003 | `docs/audits/phase-0/AUDIT-P0-ROADMAP.md` | Phase 0 Master Roadmap Audit Report | FROZEN |
| ADR-0012 | `docs/decisions/ADR-0012-owner-decision-protocol.md` | Owner Decision Protocol (GOV-010) Completes the Governance Layer | ACCEPTED |
| AUD-P0-004 | `docs/audits/phase-0/AUDIT-P0-DECISION-PROTOCOL.md` | Phase 0 Owner Decision Protocol Audit Report | FROZEN |
| ADR-0026 | `docs/decisions/ADR-0026-adopt-layer-ownership-constitution.md` | Adopt GOV-012 Layer Ownership Constitution | ACCEPTED |
| AUD-P0-005 | `docs/audits/phase-0/AUDIT-P0-LAYER-OWNERSHIP.md` | Layer Ownership Constitution Adoption Audit Report | FROZEN |
| GOV-013 | `docs/governance/GOV-013_MULTI_AGENT_REVIEW_PROTOCOL.md` | Multi-Agent Review Protocol | FROZEN |
| ADR-0053 | `docs/decisions/ADR-0053-gov-013-multi-agent-review-protocol.md` | GOV-013 Multi-Agent Review Protocol Adopted; GOV-004 §2 Amended; GOV-001 §9 Hook Added | ACCEPTED |
| AUD-P0-006 | `docs/audits/phase-0/AUDIT-P0-MULTI-AGENT-REVIEW.md` | GOV-013 Multi-Agent Review Protocol Adoption Audit Report | FROZEN |

### 2.1a Phase 1A — Domain Discovery (CLOSED — frozen 2026-07-18, ADR-0025 / AUD-P1A-FINAL)

| Doc ID | File | Title | Status |
|---|---|---|---|
| ADR-0007 | `docs/decisions/ADR-0007-phase-1a-domain-discovery.md` | Phase 1A: Domain Discovery | ACCEPTED |
| DOM-001 | `docs/domain/DOMAIN-001_BUSINESS_OVERVIEW.md` | Business Overview | FROZEN |
| DOM-002 | `docs/domain/DOMAIN-002_BUSINESS_ENTITIES.md` | Business Entities | FROZEN |
| DOM-003 | `docs/domain/DOMAIN-003_BUSINESS_WORKFLOWS.md` | Business Workflows | FROZEN |
| DOM-004 | `docs/domain/DOMAIN-004_BUSINESS_RULES_CATALOG.md` | Business Rules Catalog | FROZEN |
| DOM-005 | `docs/domain/DOMAIN-005_UNKNOWNS_AND_ASSUMPTIONS.md` | Unknowns & Assumptions | LIVING |
| ADR-0008 | `docs/decisions/ADR-0008-session-1-owner-decisions.md` | Session 1 Owner Decisions: Compensation, Rounding, Entitlement, Balances | ACCEPTED |
| AUD-P1A-001 | `docs/audits/phase-1a/AUDIT-P1A-DOMAIN.md` | Phase 1A Domain Discovery Audit Report | FROZEN |
| AUD-P1A-002 | `docs/audits/phase-1a/AUDIT-P1A-SESSION1.md` | Phase 1A Session 1 Decisions Audit Report | FROZEN |
| ADR-0009 | `docs/decisions/ADR-0009-v1-percentage-only-compensation.md` | V1 Scope: Percentage-Only Compensation | ACCEPTED |
| AUD-P1A-003 | `docs/audits/phase-1a/AUDIT-P1A-V1SCOPE.md` | Phase 1A V1 Scope Reduction Audit Report | FROZEN |
| ADR-0010 | `docs/decisions/ADR-0010-operations-is-a-system-activity-view.md` | Operations Is a System Activity View | ACCEPTED |
| AUD-P1A-004 | `docs/audits/phase-1a/AUDIT-P1A-OPERATIONS.md` | Phase 1A Operations Definition Audit Report | FROZEN |
| ADR-0013 | `docs/decisions/ADR-0013-session-3-owner-decisions.md` | Session 3 Owner Decisions: Student Entity, Registration, Installments, Currency, Numbering, V1 Simplicity | ACCEPTED |
| AUD-P1A-005 | `docs/audits/phase-1a/AUDIT-P1A-SESSION3.md` | Phase 1A Session 3 Decisions Audit Report | FROZEN |
| ADR-0014 | `docs/decisions/ADR-0014-rounding-rule-and-closing-discipline.md` | Integer Rounding Rule; Session-Closing Discipline | ACCEPTED |
| AUD-P1A-006 | `docs/audits/phase-1a/AUDIT-P1A-ROUNDING.md` | Phase 1A Rounding Rule Audit Report | FROZEN |
| ADR-0015 | `docs/decisions/ADR-0015-session-4-teacher-payments.md` | Session 4 Owner Decisions: Teacher Payments | ACCEPTED |
| AUD-P1A-007 | `docs/audits/phase-1a/AUDIT-P1A-SESSION4.md` | Phase 1A Session 4 Decisions Audit Report | FROZEN |
| ADR-0016 | `docs/decisions/ADR-0016-session-5-student-refunds.md` | Session 5 Owner Decisions: Student Refunds | ACCEPTED |
| AUD-P1A-008 | `docs/audits/phase-1a/AUDIT-P1A-SESSION5.md` | Phase 1A Session 5 Decisions Audit Report | FROZEN |
| ADR-0017 | `docs/decisions/ADR-0017-unknown-register-restructure.md` | Unknown Register Restructure: Split of UNK-026 | ACCEPTED |
| AUD-P1A-009 | `docs/audits/phase-1a/AUDIT-P1A-UNKREG.md` | Phase 1A Unknown Register Restructure Audit Report | FROZEN |
| ADR-0018 | `docs/decisions/ADR-0018-session-6-corrections-cancellations.md` | Session 6 Owner Decisions: Corrections & Cancellations | ACCEPTED |
| AUD-P1A-010 | `docs/audits/phase-1a/AUDIT-P1A-SESSION6.md` | Phase 1A Session 6 Decisions Audit Report | FROZEN |
| ADR-0019 | `docs/decisions/ADR-0019-session-7-expense-categories.md` | Session 7 Owner Decisions: Expense Categories | ACCEPTED |
| AUD-P1A-011 | `docs/audits/phase-1a/AUDIT-P1A-SESSION7.md` | Phase 1A Session 7 Decisions Audit Report | FROZEN |
| ADR-0020 | `docs/decisions/ADR-0020-session-8-expense-returns.md` | Session 8 Owner Decisions: Expense Returns | ACCEPTED |
| AUD-P1A-012 | `docs/audits/phase-1a/AUDIT-P1A-SESSION8.md` | Phase 1A Session 8 Decisions Audit Report | FROZEN |
| ADR-0021 | `docs/decisions/ADR-0021-session-9-refund-teacher-entitlement-and-debt.md` | Session 9 Owner Decisions: Refund Effects on Teacher Entitlement & Debt | ACCEPTED |
| AUD-P1A-013 | `docs/audits/phase-1a/AUDIT-P1A-SESSION9.md` | Phase 1A Session 9 Decisions Audit Report | FROZEN |
| ADR-0022 | `docs/decisions/ADR-0022-session-10-program-definition-pricing-policy.md` | Session 10 Owner Decisions: Program Definition, Pricing & Distribution Policy | ACCEPTED |
| AUD-P1A-014 | `docs/audits/phase-1a/AUDIT-P1A-SESSION10.md` | Phase 1A Session 10 Decisions Audit Report | FROZEN |
| ADR-0023 | `docs/decisions/ADR-0023-session-11-business-boundary-completeness.md` | Session 11 Owner Decisions: Business Boundary & Operational Completeness | ACCEPTED |
| AUD-P1A-015 | `docs/audits/phase-1a/AUDIT-P1A-SESSION11.md` | Phase 1A Session 11 Decisions Audit Report | FROZEN |
| ADR-0024 | `docs/decisions/ADR-0024-session-12-final-boundary-confirmations.md` | Session 12 Owner Decisions: Final Boundary Confirmations | ACCEPTED |
| AUD-P1A-016 | `docs/audits/phase-1a/AUDIT-P1A-SESSION12.md` | Phase 1A Session 12 Decisions Audit Report | FROZEN |
| ADR-0025 | `docs/decisions/ADR-0025-phase-1a-closure-and-phase-1-authorization.md` | Phase 1A Closure & Phase 1 Authorization | ACCEPTED |
| AUD-P1A-FINAL | `docs/audits/phase-1a/AUDIT-P1A-FINAL.md` | Domain Discovery Completion Report | FROZEN |

### 2.2 Phase 1 — Product Constitution (CLOSED — frozen & locked 2026-07-18, ADR-0036 / AUD-P1-FINAL)

| Doc ID | File | Title | Status |
|---|---|---|---|
| P1-000 | `docs/product/P1-000_PRODUCT_CONSTITUTION_MASTER_PLAN.md` | Product Constitution Master Plan | LIVING |
| ADR-0027 | `docs/decisions/ADR-0027-phase-1-commencement-and-p1-000-adoption.md` | Phase 1 Commencement & P1-000 Master Plan Adoption | ACCEPTED |
| AUD-P1-001 | `docs/audits/phase-1/AUDIT-P1-MASTER-PLAN.md` | Phase 1 Commencement & Master Plan Audit Report | FROZEN |
| PC-001 | `docs/product/PC-001_PRODUCT_MANIFESTO.md` | Product Manifesto | FROZEN |
| ADR-0028 | `docs/decisions/ADR-0028-pc-001-product-manifesto.md` | PC-001 Product Manifesto Adopted | ACCEPTED |
| AUD-P1-002 | `docs/audits/phase-1/AUDIT-P1-PC001.md` | PC-001 Product Manifesto Audit Report | FROZEN |
| PC-002 | `docs/product/PC-002_PRODUCT_PRINCIPLES.md` | Product Principles (+ Automation Boundary) | FROZEN |
| ADR-0029 | `docs/decisions/ADR-0029-pc-002-product-principles.md` | PC-002 Product Principles (+ Automation Boundary) Adopted | ACCEPTED |
| AUD-P1-003 | `docs/audits/phase-1/AUDIT-P1-PC002.md` | PC-002 Product Principles Audit Report | FROZEN |
| PC-003 | `docs/product/PC-003_PRODUCT_MENTAL_MODEL.md` | Product Mental Model | FROZEN |
| ADR-0030 | `docs/decisions/ADR-0030-pc-003-product-mental-model.md` | PC-003 Product Mental Model Adopted | ACCEPTED |
| AUD-P1-004 | `docs/audits/phase-1/AUDIT-P1-PC003.md` | PC-003 Product Mental Model Audit Report | FROZEN |
| PC-004 | `docs/product/PC-004_SCOPE_NONSCOPE_ANTIPATTERNS.md` | Scope, Non-Scope & Anti-Patterns | FROZEN |
| ADR-0031 | `docs/decisions/ADR-0031-pc-004-scope-nonscope-antipatterns.md` | PC-004 Scope, Non-Scope & Anti-Patterns Adopted | ACCEPTED |
| AUD-P1-005 | `docs/audits/phase-1/AUDIT-P1-PC004.md` | PC-004 Scope, Non-Scope & Anti-Patterns Audit Report | FROZEN |
| PC-005 | `docs/product/PC-005_ACTORS_AND_ACCESS_MODEL.md` | Actors & Access Model | FROZEN |
| ADR-0032 | `docs/decisions/ADR-0032-pc-005-actors-and-access-model.md` | PC-005 Actors & Access Model Adopted | ACCEPTED |
| AUD-P1-006 | `docs/audits/phase-1/AUDIT-P1-PC005.md` | PC-005 Actors & Access Model Audit Report | FROZEN |
| PC-006 | `docs/product/PC-006_PRODUCT_LANGUAGE_AND_GLOSSARY.md` | Product Language & Glossary | FROZEN |
| ADR-0033 | `docs/decisions/ADR-0033-pc-006-product-language-and-glossary.md` | PC-006 Product Language & Glossary Adopted | ACCEPTED |
| AUD-P1-007 | `docs/audits/phase-1/AUDIT-P1-PC006.md` | PC-006 Product Language & Glossary Audit Report | FROZEN |
| PC-007 | `docs/product/PC-007_PRODUCT_REQUIREMENTS_AND_TRACEABILITY.md` | Product Requirements & Traceability | FROZEN |
| ADR-0034 | `docs/decisions/ADR-0034-pc-007-product-requirements-and-traceability.md` | PC-007 Product Requirements & Traceability Adopted | ACCEPTED |
| AUD-P1-008 | `docs/audits/phase-1/AUDIT-P1-PC007.md` | PC-007 Product Requirements & Traceability Audit Report | FROZEN |
| PC-008 | `docs/product/PC-008_PRODUCT_VALIDATION_AND_ACCEPTANCE_CRITERIA.md` | Product Validation & Acceptance Criteria | FROZEN |
| ADR-0035 | `docs/decisions/ADR-0035-pc-008-product-validation-and-acceptance.md` | PC-008 Product Validation & Acceptance Criteria Adopted | ACCEPTED |
| AUD-P1-009 | `docs/audits/phase-1/AUDIT-P1-PC008.md` | PC-008 Product Validation & Acceptance Criteria Audit Report | FROZEN |
| ADR-0036 | `docs/decisions/ADR-0036-phase-1-closure-product-constitution-locked.md` | Phase 1 Closure: Product Constitution Frozen & Locked | ACCEPTED |
| AUD-P1-FINAL | `docs/audits/phase-1/AUDIT-P1-FINAL.md` | Product Constitution Completion Report | FROZEN |
| PLP-001 | `docs/product/PLP-001_PRODUCT_UI_LANGUAGE_POLICY.md` | Product UI Language Policy (post-closure gap-fill; modifies no locked PC document) | FROZEN |
| ADR-0055 | `docs/decisions/ADR-0055-plp-001-product-ui-language-policy.md` | PLP-001 Product UI Language Policy Adopted; Language-Selection Ownership Gap Filled | ACCEPTED |

### 2.3 Phase 2 — Business Constitution (CLOSED & LOCKED — frozen & locked 2026-07-20, ADR-0048 / AUD-P2-FINAL)

| Doc ID | File | Title | Status |
|---|---|---|---|
| P2-000 | `docs/business/P2-000_BUSINESS_CONSTITUTION_MASTER_PLAN.md` | Business Constitution Master Plan | LIVING |
| ADR-0037 | `docs/decisions/ADR-0037-phase-2-commencement-and-p2-000-adoption.md` | Phase 2 Commencement & P2-000 Master Plan Adoption | ACCEPTED |
| AUD-P2-001 | `docs/audits/phase-2/AUDIT-P2-MASTER-PLAN.md` | Phase 2 Commencement & Master Plan Audit Report | FROZEN |
| BC-000 | `docs/business/BC-000_BUSINESS_CONSTITUTION_FRAMEWORK.md` | Business Constitution Framework | FROZEN |
| ADR-0038 | `docs/decisions/ADR-0038-bc-000-business-constitution-framework.md` | BC-000 Business Constitution Framework Adopted | ACCEPTED |
| AUD-P2-002 | `docs/audits/phase-2/AUDIT-P2-BC000.md` | BC-000 Business Constitution Framework Audit Report | FROZEN |
| BC-001 | `docs/business/BC-001_PROGRAMS_PRICING_AND_DISTRIBUTION_POLICY_RULES.md` | Programs, Pricing & Distribution Policy Rules | FROZEN |
| ADR-0039 | `docs/decisions/ADR-0039-bc-001-programs-pricing-and-distribution.md` | BC-001 Programs, Pricing & Distribution Policy Rules Adopted | ACCEPTED |
| AUD-P2-003 | `docs/audits/phase-2/AUDIT-P2-BC001.md` | BC-001 Programs, Pricing & Distribution Policy Rules Audit Report | FROZEN |
| BC-002 | `docs/business/BC-002_REGISTRATION_INSTALLMENT_AND_PAYER_RULES.md` | Registration, Installment & Payer Rules | FROZEN |
| ADR-0040 | `docs/decisions/ADR-0040-bc-002-registration-installment-and-payer.md` | BC-002 Registration, Installment & Payer Rules Adopted; CDC Governance Added | ACCEPTED |
| AUD-P2-004 | `docs/audits/phase-2/AUDIT-P2-BC002.md` | BC-002 Registration, Installment & Payer Rules Audit Report | FROZEN |
| BC-003 | `docs/business/BC-003_RECEIPT_VOUCHER_AND_NUMBERING_RULES.md` | Receipt, Voucher & Numbering Rules | FROZEN |
| ADR-0041 | `docs/decisions/ADR-0041-bc-003-receipt-voucher-and-numbering.md` | BC-003 Receipt, Voucher & Numbering Rules Adopted; CDC/Coverage Conventions Finalized | ACCEPTED |
| AUD-P2-005 | `docs/audits/phase-2/AUDIT-P2-BC003.md` | BC-003 Receipt, Voucher & Numbering Rules Audit Report | FROZEN |
| BC-004 | `docs/business/BC-004_TEACHER_ENTITLEMENT_AND_DEBT_RULES.md` | Teacher Entitlement & Debt Rules | FROZEN |
| ADR-0042 | `docs/decisions/ADR-0042-bc-004-entitlement-and-phase-2-resequence.md` | BC-004 Teacher Entitlement & Debt Rules Adopted; Phase 2 Resequenced (Option A) | ACCEPTED |
| AUD-P2-006 | `docs/audits/phase-2/AUDIT-P2-BC004.md` | BC-004 Teacher Entitlement & Debt Rules Audit Report | FROZEN |
| BC-005 | `docs/business/BC-005_REFUND_AND_ADJUSTMENT_RULES.md` | Refund & Adjustment Rules | FROZEN |
| ADR-0043 | `docs/decisions/ADR-0043-bc-005-refund-and-adjustment.md` | BC-005 Refund & Adjustment Rules Adopted | ACCEPTED |
| AUD-P2-007 | `docs/audits/phase-2/AUDIT-P2-BC005.md` | BC-005 Refund & Adjustment Rules Audit Report | FROZEN |
| BC-006 | `docs/business/BC-006_TEACHER_PAYMENT_AND_SETTLEMENT_RULES.md` | Teacher Payment & Settlement Rules | FROZEN |
| ADR-0044 | `docs/decisions/ADR-0044-bc-006-teacher-payment-and-settlement.md` | BC-006 Teacher Payment & Settlement Rules Adopted; Checkpoint C3 Complete | ACCEPTED |
| AUD-P2-008 | `docs/audits/phase-2/AUDIT-P2-BC006.md` | BC-006 Teacher Payment & Settlement Rules Audit Report | FROZEN |
| BC-007 | `docs/business/BC-007_BALANCES_AND_PARTY_FINANCIAL_STANDING_RULES.md` | Balances & Party Financial Standing Rules | FROZEN |
| ADR-0045 | `docs/decisions/ADR-0045-bc-007-balances-and-party-financial-standing.md` | BC-007 Balances & Party Financial Standing Rules Adopted | ACCEPTED |
| AUD-P2-009 | `docs/audits/phase-2/AUDIT-P2-BC007.md` | BC-007 Balances & Party Financial Standing Rules Audit Report | FROZEN |
| BC-008 | `docs/business/BC-008_NON_PROGRAM_REVENUE_EXPENSE_AND_LIFECYCLE_RULES.md` | Non-Program Revenue, Expense & Lifecycle Rules | FROZEN |
| ADR-0046 | `docs/decisions/ADR-0046-bc-008-non-program-revenue-expense-and-lifecycle.md` | BC-008 Non-Program Revenue, Expense & Lifecycle Rules Adopted; Checkpoint C4 Complete | ACCEPTED |
| AUD-P2-010 | `docs/audits/phase-2/AUDIT-P2-BC008.md` | BC-008 Non-Program Revenue, Expense & Lifecycle Rules Audit Report | FROZEN |
| BC-009 | `docs/business/BC-009_PHASE_2_TRACEABILITY_MATRIX_AND_COVERAGE.md` | Phase 2 Traceability Matrix & Coverage | FROZEN |
| ADR-0047 | `docs/decisions/ADR-0047-bc-009-phase-2-traceability-matrix-and-coverage.md` | BC-009 Phase 2 Traceability Matrix & Coverage Adopted; Checkpoint C5 Complete | ACCEPTED |
| AUD-P2-011 | `docs/audits/phase-2/AUDIT-P2-BC009.md` | BC-009 Phase 2 Traceability Matrix & Coverage Audit Report | FROZEN |
| ADR-0048 | `docs/decisions/ADR-0048-phase-2-closure-and-phase-3-authorization.md` | Phase 2 Constitutional Closure & Lock; Phase 3 Authorization | ACCEPTED |
| AUD-P2-FINAL | `docs/audits/phase-2/AUDIT-P2-FINAL.md` | Business Constitution Completion Report (Phase 2 Closure) | FROZEN |

### 2.4 Phase 3 — UX Constitution (IN PROGRESS — P3-000 adopted 2026-07-20, ADR-0049)

| Doc ID | File | Title | Status |
|---|---|---|---|
| P3-000 | `docs/ux/P3-000_UX_CONSTITUTION_MASTER_PLAN.md` | UX Constitution Master Plan | LIVING |
| ADR-0049 | `docs/decisions/ADR-0049-phase-3-commencement-and-p3-000-adoption.md` | Phase 3 Commencement & P3-000 UX Constitution Master Plan Adoption | ACCEPTED |
| AUD-P3-001 | `docs/audits/phase-3/AUDIT-P3-MASTER-PLAN.md` | Phase 3 Commencement & UX Constitution Master Plan Audit Report | FROZEN |
| UX-001 | `docs/ux/UX-001_UX_CONSTITUTIONAL_PHILOSOPHY_AND_LAYER_RESPONSIBILITY.md` | UX Constitutional Philosophy & Layer Responsibility | FROZEN |
| ADR-0050 | `docs/decisions/ADR-0050-ux-001-frozen-constitutional-philosophy.md` | UX-001 Frozen — Constitutional Philosophy of the User Experience Layer | ACCEPTED |
| AUD-P3-002 | `docs/audits/phase-3/AUDIT-P3-UX001.md` | UX-001 Constitutional Philosophy Audit Report | FROZEN |
| UX-002 | `docs/ux/UX-002_INFORMATION_ARCHITECTURE.md` | Information Architecture | FROZEN |
| ADR-0051 | `docs/decisions/ADR-0051-ux-002-information-architecture.md` | UX-002 Frozen — Information Architecture of the User Experience Layer | ACCEPTED |
| AUD-P3-003 | `docs/audits/phase-3/AUDIT-P3-UX002.md` | UX-002 Information Architecture Audit Report | FROZEN |
| UX-003 | `docs/ux/UX-003_WORKSPACE_ARCHITECTURE.md` | Workspace Architecture | FROZEN |
| ADR-0052 | `docs/decisions/ADR-0052-ux-003-workspace-architecture.md` | UX-003 Frozen — Workspace Architecture of the User Experience Layer | ACCEPTED |
| AUD-P3-004 | `docs/audits/phase-3/AUDIT-P3-UX003.md` | UX-003 Workspace Architecture Audit Report | FROZEN |
| UX-004 | `docs/ux/UX-004_INTERACTION_AND_FORMS_RULES.md` | Interaction & Forms Rules | FROZEN |
| ADR-0054 | `docs/decisions/ADR-0054-ux-004-interaction-and-forms-rules.md` | UX-004 Frozen — Interaction & Forms Rules of the User Experience Layer | ACCEPTED |
| AUD-P3-005 | `docs/audits/phase-3/AUDIT-P3-UX004.md` | UX-004 Interaction & Forms Rules Audit Report | FROZEN |
| UX-005 | `docs/ux/UX-005_LANGUAGE_RTL_AND_ACCESSIBILITY.md` | Language, RTL & Accessibility | FROZEN |
| ADR-0056 | `docs/decisions/ADR-0056-ux-005-language-rtl-and-accessibility.md` | UX-005 Frozen — Language, RTL & Accessibility of the User Experience Layer | ACCEPTED |
| AUD-P3-006 | `docs/audits/phase-3/AUDIT-P3-UX005.md` | UX-005 Language, RTL & Accessibility Audit Report | FROZEN |
| — | `docs/ux/` (UX-006) | UX Traceability sink (Checkpoint UC4) | PENDING (authored per P3-000 §7) |

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
