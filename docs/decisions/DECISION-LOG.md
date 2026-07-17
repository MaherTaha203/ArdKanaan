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

Next available ADR number: **ADR-0013**.

## 4. Maintenance rules

1. New ADRs are appended to §3 in the same commit that creates the ADR file.
2. The "Next available ADR number" line is advanced in that same commit.
3. Status changes are reflected here in the same commit they occur.
