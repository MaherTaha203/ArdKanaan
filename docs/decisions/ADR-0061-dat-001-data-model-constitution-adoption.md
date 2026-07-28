# ADR-0061 — DAT-001 Data Model Constitution Adoption & Freeze

| Field | Value |
|---|---|
| ADR | 0061 |
| Title | DAT-001 Data Model Constitution Adoption & Freeze |
| Phase | 4 (DDL Specification) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 4 (DDL Specification) is OPEN under **P4-000** (ADR-0060). Its first deliverable is the
framework document — the DDL analog of BC-000 / P3-000 — that fixes the grammar of the logical data
model and, above all, the boundary of what may become persisted truth, *before* any concrete entity
(DAT-002+) is specified.

**DAT-001 — Data Model Constitution (of the Logical Data Model)** was authored and reviewed under the
full **GOV-013** Multi-Agent Review Protocol. The Owner directed that it be built around three axes —
(1) *What is a Data Atom?* (2) *What may become persisted truth?* (the Authority Boundary) (3) *How is
logical data represented independently of technology?* — with Stored-vs-Derived elevated from an
invariant to a first-class **Authority Boundary**, and **Relationship** established as a distinct atom
kind.

## Decision

1. **Adopt DAT-001 — Data Model Constitution** (`docs/data/DAT-001_DATA_MODEL_CONSTITUTION.md`) as
   **FROZEN v1.0.0** — the constitutional framework of Phase 4, subordinate to P4-000 and GOV-011.
2. **What it fixes (framework only; introduces no concrete entity and no new truth):**
   - **AXIS 1 (§3)** — the **six-kind** Data-Atom taxonomy (Entity · Attribute · Relationship ·
     Identity · Constraint · Integrity rule), exhaustive and mutually exclusive under two
     discriminators; Relationship ≠ foreign key (§3.1: ownership · cardinality · referential meaning).
   - **AXIS 2 (§4)** — the **Authority Boundary**: *only truth may be persisted*. The classifying test
     is a question of **constitutional authority, not of derivability** — a value may be persisted only
     when a frozen authority (BR/PR/DR) establishes it as a truth of record (an authored fact, or a
     snapshot it mandates). Balances and closed-set aggregates that no authority establishes as truth
     may never be persisted (BC-007 "stores nothing"); the receipt **split** snapshot is persisted
     because DR-006 commands it.
   - **AXIS 3 (§5)** — logical representation independent of technology; no physical/DDL/engine
     construct or storage type on the logical side (per GOV-012, *what* is Phase 4, *how* is Phase 10).
   - **Invariants DV-1…DV-8** (§6, propagation-blocking) and **closure criteria DX-1…DX-6** (§8).
3. **Review discipline honored:** DAT-001 ran the complete GOV-013 lifecycle — Discovery → Draft →
   Adversarial Self-Hardening → three Constitutional Readiness Verifications (6-agent Panel + independent
   Readiness Judge). Verification #3 returned **6/6 CONSTITUTIONALLY SOUND (0 Blocking / 0 Major)** and
   the independent Judge issued **READY**; a single non-blocking Minor (the reserved word "allocation")
   was resolved by editorial touch-up ("allocation" → "split", per DR-034/DR-040) before freeze.

## Consequences

- DAT-001 is FROZEN and is the single authoritative source of the logical-data-model grammar and the
  Authority Boundary for all Phase-4 work; amendments only via GOV-004 §5.
- **No** constitutional truth is introduced; no Business (BC), Product (PC/PLP), Domain (DOM), or UX
  document is modified. DAT-001 consumes them exactly as frozen (CDC).
- **P4-000 corrected** in the same propagation (LIVING governing plan, editorial): its document map now
  titles DAT-001 "Data Model Constitution" (was "Data Model Framework"), and the database phase is
  named "Phase 10" throughout (two stale "Phase 7+" references corrected) — resolving Observations
  raised during DAT-001 verification; no principle or decision of P4-000 changes.
- Registers updated in this commit: IDX-001 (DAT-001 + ADR-0061 + AUD-P4-001), DEC-000 (next →
  ADR-0062), GOV-009 (counts refresh), RDM-001 (Phase-4 status: DAT-001 FROZEN), data/README.

## Notes

DAT-001's central lesson is recorded for the phase: the persist-or-reveal line is drawn by
**constitutional authority**, not by the mathematical property of derivability. An earlier revision
grounded the boundary in re-derivability and thereby *forbade the very split snapshot DR-006 mandates*;
regrounding it in authority dissolved the contradiction while still forbidding balances and closed-set
aggregations. The next Phase-4 deliverable — DAT-002+ entity/attribute specifications — awaits a
separate explicit Owner order.
