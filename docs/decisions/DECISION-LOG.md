# DEC-000 — Decision Log

| Field | Value |
|---|---|
| Doc ID | DEC-000 |
| Title | Decision Log |
| Phase | 0 (spans all phases) |
| Status | LIVING |
| Version | 1.0.0 |
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

Next available ADR number: **ADR-0006**.

## 4. Maintenance rules

1. New ADRs are appended to §3 in the same commit that creates the ADR file.
2. The "Next available ADR number" line is advanced in that same commit.
3. Status changes are reflected here in the same commit they occur.
