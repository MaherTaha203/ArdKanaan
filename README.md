# Ard Kanaan (أرض كنعان)

**Financial Management System for a Training Center**

| | |
|---|---|
| Project code | `ARDK` |
| System class | Single-center, single-owner, single-database financial management system |
| Engineering mode | Strict documentation-first pipeline |
| Current phase | **Phase 1A — Domain Discovery (COMPLETE, frozen)** |
| Next phase | Phase 1 — Product Constitution (HIGH unknowns in DOM-005 must be answered by the owner before Phase 1 can freeze) |

---

## What this system is

Ard Kanaan manages the money flow of **one** training center: training programs, teachers,
students/payers, receipt vouchers, payment vouchers, automatic revenue distribution between
teacher and center, account statements, and balances.

## What this system is NOT

- ❌ Not an ERP
- ❌ Not general accounting software
- ❌ Not multi-company
- ❌ Not multi-user

**Design creed:** Speed over features. Clarity over flexibility. The system must **never**
ask the user to enter information that can be calculated automatically.

---

## Repository status — READ BEFORE CONTRIBUTING

This repository is governed by a strict engineering pipeline. **No application code, UI,
schema, or dependency may exist in this repository until all documentation phases are
frozen.** See [`docs/governance/GOVERNANCE.md`](docs/governance/GOVERNANCE.md).

## Start here

| Document | Purpose |
|---|---|
| [`docs/governance/GOV-000_PROJECT_MANIFESTO.md`](docs/governance/GOV-000_PROJECT_MANIFESTO.md) | **The Project Manifesto — highest document in the repository** |
| [`docs/INDEX.md`](docs/INDEX.md) | Master documentation index — the map of everything |
| [`docs/governance/GOVERNANCE.md`](docs/governance/GOVERNANCE.md) | Repository governance and the strict rules |
| [`docs/governance/GOV-007_AI_EXECUTION_PROTOCOL.md`](docs/governance/GOV-007_AI_EXECUTION_PROTOCOL.md) | Mandatory behavioral protocol for AI executors |
| [`docs/governance/GOV-008_ENGINEERING_MEMORY.md`](docs/governance/GOV-008_ENGINEERING_MEMORY.md) | Permanent engineering lessons — read at every session start |
| [`docs/governance/GOV-009_REPOSITORY_HEALTH.md`](docs/governance/GOV-009_REPOSITORY_HEALTH.md) | Measurable repository health dashboard |
| [`docs/governance/WORKFLOW.md`](docs/governance/WORKFLOW.md) | The engineering workflow |
| [`docs/governance/QUALITY-GATES.md`](docs/governance/QUALITY-GATES.md) | The 8 quality gates every phase must pass |
| [`docs/roadmap/ROADMAP.md`](docs/roadmap/ROADMAP.md) | Full phase roadmap from bootstrap to release |
| [`docs/decisions/DECISION-LOG.md`](docs/decisions/DECISION-LOG.md) | Architecture Decision Records index |
| [`docs/audits/phase-0/AUDIT-P0-REPOSITORY.md`](docs/audits/phase-0/AUDIT-P0-REPOSITORY.md) | Phase 0 Repository Audit Report |
| [`docs/audits/phase-0/AUDIT-P0-EXTENSION.md`](docs/audits/phase-0/AUDIT-P0-EXTENSION.md) | Phase 0 Governance Platform Extension Audit Report |
| [`docs/domain/DOMAIN-001_BUSINESS_OVERVIEW.md`](docs/domain/DOMAIN-001_BUSINESS_OVERVIEW.md) | The business itself — what the center does and how money flows |
| [`docs/domain/DOMAIN-004_BUSINESS_RULES_CATALOG.md`](docs/domain/DOMAIN-004_BUSINESS_RULES_CATALOG.md) | Domain rules catalog (DR-001…DR-012) |
| [`docs/domain/DOMAIN-005_UNKNOWNS_AND_ASSUMPTIONS.md`](docs/domain/DOMAIN-005_UNKNOWNS_AND_ASSUMPTIONS.md) | **Open business questions awaiting the owner's answers** |
| [`docs/audits/phase-1a/AUDIT-P1A-DOMAIN.md`](docs/audits/phase-1a/AUDIT-P1A-DOMAIN.md) | Phase 1A Domain Discovery Audit Report |
