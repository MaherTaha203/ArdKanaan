# DEC-000 — Decision Log

| Field | Value |
|---|---|
| Doc ID | DEC-000 |
| Title | Decision Log |
| Phase | 0 (spans all phases) |
| Status | LIVING |
| Version | 1.1.0 |
| Depends on | GOV-001 §7 |

---

## 1. Purpose

Chronological register of every Architecture Decision Record (ADR). A decision not
listed here (and not in a frozen constitution document) **has not been made**
(GOV-001 §7.2).

## 2. ADR lifecycle

`PROPOSED` → `ACCEPTED` → (optionally) `SUPERSEDED by ADR-XXXX`.
ACCEPTED ADRs are immutable; to change a decision, write a new ADR that supersedes
the old one and repair all downstream documents in the same commit.

## 3. Register

| ADR | Title | Phase | Status | Supersedes |
|---|---|---|---|---|
| [ADR-0001](ADR-0001-documentation-first-pipeline.md) | Documentation-First Pipeline | 0 | ACCEPTED | — |
| [ADR-0002](ADR-0002-repository-structure.md) | Repository Structure & Taxonomy | 0 | ACCEPTED | — |
| [ADR-0003](ADR-0003-document-identity-and-lifecycle.md) | Document Identity, Naming & Lifecycle | 0 | ACCEPTED | — |
| [ADR-0004](ADR-0004-traceability-strategy.md) | Traceability Strategy | 0 | ACCEPTED | — |
| [ADR-0005](ADR-0005-documentation-language.md) | Documentation Language | 0 | ACCEPTED | — |
| [ADR-0006](ADR-0006-phase-0-governance-platform-extension.md) | Phase 0 Governance Platform Extension | 0 | ACCEPTED | — |
| [ADR-0007](ADR-0007-phase-1a-domain-discovery.md) | Phase 1A: Domain Discovery | 1A | ACCEPTED | — |
| [ADR-0008](ADR-0008-session-1-owner-decisions.md) | Session 1 Owner Decisions: Compensation, Rounding, Entitlement, Balances | 1A | ACCEPTED (D1 scope partially superseded by ADR-0009) | — |
| [ADR-0009](ADR-0009-v1-percentage-only-compensation.md) | V1 Scope: Percentage-Only Compensation | 1A | ACCEPTED | ADR-0008 (partial: D1) |
| [ADR-0010](ADR-0010-operations-is-a-system-activity-view.md) | Operations Is a System Activity View | 1A | ACCEPTED | — |
| [ADR-0011](ADR-0011-master-engineering-roadmap.md) | Master Engineering Roadmap as Governance Law | 0 | ACCEPTED | — |
| [ADR-0012](ADR-0012-owner-decision-protocol.md) | Owner Decision Protocol (GOV-010) Completes the Governance Layer | 0 | ACCEPTED | — |
| [ADR-0013](ADR-0013-session-3-owner-decisions.md) | Session 3 Owner Decisions: Student Entity, Registration, Installments, Currency, Numbering, V1 Simplicity | 1A | ACCEPTED | — |
| [ADR-0014](ADR-0014-rounding-rule-and-closing-discipline.md) | Integer Rounding Rule; Session-Closing Discipline | 1A | ACCEPTED | — |
| [ADR-0015](ADR-0015-session-4-teacher-payments.md) | Session 4 Owner Decisions: Teacher Payments | 1A | ACCEPTED | — |
| [ADR-0016](ADR-0016-session-5-student-refunds.md) | Session 5 Owner Decisions: Student Refunds | 1A | ACCEPTED | — |
| [ADR-0017](ADR-0017-unknown-register-restructure.md) | Unknown Register Restructure: Split of UNK-026 | 1A | ACCEPTED | — |
| [ADR-0018](ADR-0018-session-6-corrections-cancellations.md) | Session 6 Owner Decisions: Corrections & Cancellations | 1A | ACCEPTED | — |
| [ADR-0019](ADR-0019-session-7-expense-categories.md) | Session 7 Owner Decisions: Expense Categories | 1A | ACCEPTED | — |
| [ADR-0020](ADR-0020-session-8-expense-returns.md) | Session 8 Owner Decisions: Expense Returns | 1A | ACCEPTED | — |
| [ADR-0021](ADR-0021-session-9-refund-teacher-entitlement-and-debt.md) | Session 9 Owner Decisions: Refund Effects on Teacher Entitlement & Debt | 1A | ACCEPTED | — |
| [ADR-0022](ADR-0022-session-10-program-definition-pricing-policy.md) | Session 10 Owner Decisions: Program Definition, Pricing & Distribution Policy | 1A | ACCEPTED | — |
| [ADR-0023](ADR-0023-session-11-business-boundary-completeness.md) | Session 11 Owner Decisions: Business Boundary & Operational Completeness | 1A | ACCEPTED | — |
| [ADR-0024](ADR-0024-session-12-final-boundary-confirmations.md) | Session 12 Owner Decisions: Final Boundary Confirmations | 1A | ACCEPTED | — |
| [ADR-0025](ADR-0025-phase-1a-closure-and-phase-1-authorization.md) | Phase 1A Closure & Phase 1 Authorization | 1A → 1 | ACCEPTED | — |
| [ADR-0026](ADR-0026-adopt-layer-ownership-constitution.md) | Adopt GOV-012 Layer Ownership Constitution | 0 | ACCEPTED | — |
| [ADR-0027](ADR-0027-phase-1-commencement-and-p1-000-adoption.md) | Phase 1 Commencement & P1-000 Master Plan Adoption | 1 | ACCEPTED | — |
| [ADR-0028](ADR-0028-pc-001-product-manifesto.md) | PC-001 Product Manifesto Adopted | 1 | ACCEPTED | — |
| [ADR-0029](ADR-0029-pc-002-product-principles.md) | PC-002 Product Principles (+ Automation Boundary) Adopted | 1 | ACCEPTED | — |
| [ADR-0030](ADR-0030-pc-003-product-mental-model.md) | PC-003 Product Mental Model Adopted | 1 | ACCEPTED | — |
| [ADR-0031](ADR-0031-pc-004-scope-nonscope-antipatterns.md) | PC-004 Scope, Non-Scope & Anti-Patterns Adopted | 1 | ACCEPTED | — |
| [ADR-0032](ADR-0032-pc-005-actors-and-access-model.md) | PC-005 Actors & Access Model Adopted | 1 | ACCEPTED | — |
| [ADR-0033](ADR-0033-pc-006-product-language-and-glossary.md) | PC-006 Product Language & Glossary Adopted | 1 | ACCEPTED | — |
| [ADR-0034](ADR-0034-pc-007-product-requirements-and-traceability.md) | PC-007 Product Requirements & Traceability Adopted | 1 | ACCEPTED | — |
| [ADR-0035](ADR-0035-pc-008-product-validation-and-acceptance.md) | PC-008 Product Validation & Acceptance Criteria Adopted | 1 | ACCEPTED | — |
| [ADR-0036](ADR-0036-phase-1-closure-product-constitution-locked.md) | Phase 1 Closure: Product Constitution Frozen & Locked | 1 | ACCEPTED | — |
| [ADR-0037](ADR-0037-phase-2-commencement-and-p2-000-adoption.md) | Phase 2 Commencement & P2-000 Master Plan Adoption | 2 | ACCEPTED | — |
| [ADR-0038](ADR-0038-bc-000-business-constitution-framework.md) | BC-000 Business Constitution Framework Adopted | 2 | ACCEPTED | — |
| [ADR-0039](ADR-0039-bc-001-programs-pricing-and-distribution.md) | BC-001 Programs, Pricing & Distribution Policy Rules Adopted | 2 | ACCEPTED | — |
| [ADR-0040](ADR-0040-bc-002-registration-installment-and-payer.md) | BC-002 Registration, Installment & Payer Rules Adopted; CDC Governance Added | 2 | ACCEPTED | — |
| [ADR-0041](ADR-0041-bc-003-receipt-voucher-and-numbering.md) | BC-003 Receipt, Voucher & Numbering Rules Adopted; CDC/Coverage Conventions Finalized | 2 | ACCEPTED | — |
| [ADR-0042](ADR-0042-bc-004-entitlement-and-phase-2-resequence.md) | BC-004 Teacher Entitlement & Debt Rules Adopted; Phase 2 Resequenced (Option A) | 2 | ACCEPTED | — |
| [ADR-0043](ADR-0043-bc-005-refund-and-adjustment.md) | BC-005 Refund & Adjustment Rules Adopted | 2 | ACCEPTED | — |
| [ADR-0044](ADR-0044-bc-006-teacher-payment-and-settlement.md) | BC-006 Teacher Payment & Settlement Rules Adopted; Checkpoint C3 Complete | 2 | ACCEPTED | — |
| [ADR-0045](ADR-0045-bc-007-balances-and-party-financial-standing.md) | BC-007 Balances & Party Financial Standing Rules Adopted | 2 | ACCEPTED | — |
| [ADR-0046](ADR-0046-bc-008-non-program-revenue-expense-and-lifecycle.md) | BC-008 Non-Program Revenue, Expense & Lifecycle Rules Adopted; Checkpoint C4 Complete | 2 | ACCEPTED | — |
| [ADR-0047](ADR-0047-bc-009-phase-2-traceability-matrix-and-coverage.md) | BC-009 Phase 2 Traceability Matrix & Coverage Adopted; Checkpoint C5 Complete | 2 | ACCEPTED | — |
| [ADR-0048](ADR-0048-phase-2-closure-and-phase-3-authorization.md) | Phase 2 Constitutional Closure & Lock; Phase 3 Authorization | 2 → 3 | ACCEPTED | — |
| [ADR-0049](ADR-0049-phase-3-commencement-and-p3-000-adoption.md) | Phase 3 Commencement & P3-000 UX Constitution Master Plan Adoption | 3 | ACCEPTED | — |
| [ADR-0050](ADR-0050-ux-001-frozen-constitutional-philosophy.md) | UX-001 Frozen — Constitutional Philosophy of the User Experience Layer | 3 | ACCEPTED | — |
| [ADR-0051](ADR-0051-ux-002-information-architecture.md) | UX-002 Frozen — Information Architecture of the User Experience Layer | 3 | ACCEPTED | — |
| [ADR-0052](ADR-0052-ux-003-workspace-architecture.md) | UX-003 Frozen — Workspace Architecture of the User Experience Layer | 3 | ACCEPTED | — |
| [ADR-0053](ADR-0053-gov-013-multi-agent-review-protocol.md) | GOV-013 Multi-Agent Review Protocol Adopted; GOV-004 §2 Amended; GOV-001 §9 Hook Added | 0 | ACCEPTED | — |
| [ADR-0054](ADR-0054-ux-004-interaction-and-forms-rules.md) | UX-004 Frozen — Interaction & Forms Rules of the User Experience Layer | 3 | ACCEPTED | — |
| [ADR-0055](ADR-0055-plp-001-product-ui-language-policy.md) | PLP-001 Product UI Language Policy Adopted; Language-Selection Ownership Gap Filled | 1 | ACCEPTED | — |
| [ADR-0056](ADR-0056-ux-005-language-rtl-and-accessibility.md) | UX-005 Frozen — Language, RTL & Accessibility of the User Experience Layer | 3 | ACCEPTED | — |
| [ADR-0057](ADR-0057-ux-006-ux-traceability-matrix-and-coverage.md) | UX-006 Frozen — UX Traceability Matrix & Coverage (the UX sink) | 3 | ACCEPTED | — |
| [ADR-0058](ADR-0058-ux-002-ia-08-activity-view-amendment.md) | UX-002 IA-08 (The Activity View) Amendment Adopted (v1.1.0) | 3 | ACCEPTED | — |
| [ADR-0059](ADR-0059-phase-3-closure-ux-constitution.md) | Phase 3 Closure — UX Constitution Complete & Frozen | 3 → 4 | ACCEPTED | — |
| [ADR-0060](ADR-0060-phase-4-commencement-and-p4-000-adoption.md) | Phase 4 Commencement & P4-000 DDL Specification Master Plan Adoption | 4 | ACCEPTED | — |
| [ADR-0061](ADR-0061-dat-001-data-model-constitution-adoption.md) | DAT-001 Data Model Constitution Adoption & Freeze (v1.0.0) | 4 | ACCEPTED | — |
| [ADR-0062](ADR-0062-dr-091-person-record-identity-amendment.md) | DR-091 Person-Record Identity — DOM-004 Post-Closure Amendment (v3.10.0) | 4 | ACCEPTED | — |
| [ADR-0063](ADR-0063-dat-002-party-entities-adoption.md) | DAT-002 Party Entities (Student & Teacher) Adoption & Freeze (v1.0.0) | 4 | ACCEPTED | — |
| [ADR-0064](ADR-0064-dat-003-programs-and-registrations-adoption.md) | DAT-003 Programs & Registrations (+ Revenue Distribution Policy) Adoption & Freeze (v1.0.0) | 4 | ACCEPTED | — |
| [ADR-0065](ADR-0065-dat-004-vouchers-adoption.md) | DAT-004 Vouchers (Receipt · Payment · Refund · Expense Return · Expense Category) Adoption & Freeze (v1.0.0) | 4 | ACCEPTED | — |
| [ADR-0066](ADR-0066-dat-005-derived-balances-adoption.md) | DAT-005 Derived Balances (three balances · entitlement/outstanding/debt · standing) Adoption & Freeze (v1.0.0) | 4 | ACCEPTED | — |
| [ADR-0067](ADR-0067-dat-006-activity-timeline-adoption.md) | DAT-006 Activity Timeline (append-only Operations event log) Adoption & Freeze (v1.0.0) — completes DAT-001…DAT-006 | 4 | ACCEPTED | — |

Next available ADR number: **ADR-0068**.

## 4. Maintenance rules

1. New ADRs are appended to §3 in the same commit that creates the ADR file.
2. The "Next available ADR number" line is advanced in that same commit.
3. Status changes are reflected here in the same commit they occur.
