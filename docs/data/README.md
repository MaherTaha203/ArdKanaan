# Phase 4 — DDL Specification

This directory holds **Phase 4 — DDL Specification** documents (Doc-ID prefix
`DAT-NNN`, rule atoms `DB-NNN`).

Phase 4 is **OPEN** (declared in RDM-001; ADR-0060, 2026-07-22). It documents the
product's complete data model — entities, attributes, keys, constraints, integrity
rules — **as specification documents, not executable SQL** (executable DDL belongs
to implementation step 10, after documentation freeze).

Governance: every Phase-4 constitutional document runs the full **GOV-013**
Multi-Agent Review Protocol; the phase is governed by **P4-000** (LIVING).

## Contents

| Doc | Title | Status |
|---|---|---|
| **P4-000** | DDL Specification Master Plan | LIVING (v1.1.0) — the governing plan |
| **DAT-001** | Data Model Constitution (of the Logical Data Model) | **FROZEN v1.0.0** (ADR-0061 / AUD-P4-001) — the framework: six-kind DB-atom taxonomy, the Authority Boundary, technology-neutral logical representation |
| **DAT-002** | Party Entities (Student & Teacher) | **FROZEN v1.0.0** (ADR-0063 / AUD-P4-002) — the two anchor party entities, DB-001…DB-021 |

## Checkpoints (P4-000 §5)

- **DC1 — Framework:** DAT-001. ✅ **COMPLETE.**
- **DC2 — Entities & attributes:** DAT-002 (Parties) ✅ **FROZEN**; DAT-003 (Programs & Registrations) *next*, then DAT-004 (Vouchers).
- **DC3 — Constraints & integrity:** keys, referential integrity, immutability/append-only, stored-vs-derived.
- **DC4 — Traceability + phase audit:** the DDL sink (proof precedes authorization).
