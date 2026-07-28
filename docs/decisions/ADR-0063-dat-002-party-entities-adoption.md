# ADR-0063 — DAT-002 Party Entities Adoption & Freeze

| Field | Value |
|---|---|
| ADR | 0063 |
| Title | DAT-002 Party Entities (Student & Teacher) Adoption & Freeze |
| Phase | 4 (DDL Specification) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 4 checkpoint DC2 (Entities & attributes) opened with a Stage-1 Architectural Discovery over the
frozen entity landscape (ADR-0060 governs Phase 4; DAT-001 is the frozen framework, ADR-0061). The
Discovery fixed the DC2/DC3 decomposition and established **Parties** as the correct first entity
family — the referential anchor of the whole model (DAT-001 §3.1: every Relationship fixes an
anchor→dependent ownership, and nothing can reference an entity not yet specified). It also surfaced a
missing-authority gap (person identity), closed upstream at the Domain layer by **DR-091** (ADR-0062)
before DAT-002 was drafted.

**DAT-002 — Party Entities (Student & Teacher)** specifies the two authored-fact party entities as
logical Data Atoms under DAT-001's six-kind taxonomy and Authority Boundary. It ran the full GOV-013
lifecycle: Discovery → Draft → Stage-3 Adversarial Self-Hardening → Constitutional Readiness
Verification (6-agent Panel + independent Readiness Judge).

## Decision

1. **Adopt DAT-002 — Party Entities** (`docs/data/DAT-002_PARTY_ENTITIES.md`) as **FROZEN v1.0.0** — the
   first Phase-4 entity-specification document, subordinate to DAT-001 and P4-000.
2. **What it fixes (21 Data Atoms, DB-001…DB-021; structure only, no new truth):**
   - **Entities** DB-001 Student, DB-002 Teacher — the referential anchors.
   - **Attributes** DB-003…DB-009 — the person **name** (DB-003/DB-008, cite **DR-091**); the Guardian
     contact group on the student (DB-004…DB-007, DR-089); the Teacher operational status (DB-009,
     DR-083).
   - **Identity** DB-010/DB-011 — each record denotes one distinct individual; the name is the
     identifying attribute; **no automatic natural-key uniqueness** (DR-091; surrogate = Phase-10).
   - **Constraints** DB-012…DB-018 and **Integrity rules** DB-019…DB-021 (incl. the Teacher-status
     lifecycle and the cross-cluster append-only pointer to the DAT-006 timeline).
   - **Authority Boundary applied:** the Student Account Statement / outstanding and the Teacher Balance
     / Teacher Debt are **excluded** as derived revelations (BC-007 BR-068/BR-069/BR-070/BR-072) — never
     stored attributes; they are specified as computations in DAT-005.
   - **Relationships:** none declared here; the party anchors are listed for the dependent documents
     (§4), each with ownership + cardinality + referential meaning.
3. **Review outcome:** Stage-3 hardening cleared the Authority Boundary, DV-8 non-invention, and
   six-kind classification/completeness. The Readiness Verification returned **6/6 CONSTITUTIONALLY
   SOUND (0 Blocking / 0 Major)**; the Prosecutor's UNSOUND case failed; the independent Judge issued
   **READY**. Two Minors (a §5 Teacher-quantity citation pointer; a Guardian citation-format
   inconsistency) and two actionable Observations (§3.3 surrogate-key self-contradiction; the DB-001
   descriptor naming the statement) were resolved by editorial touch-up before freeze; two Observations
   were judged acceptable-as-flagged.

## Consequences

- DAT-002 is FROZEN and is the authoritative logical specification of the Student and Teacher entities;
  every downstream Phase-4 document references these anchors. Amendments only via GOV-004 §5.
- **No** business/product/domain truth is introduced (DV-8); the person-identity authority is DR-091,
  frozen upstream (ADR-0062). BC/PC/PLP/DOM are consumed exactly as frozen.
- **DB-021 forward-note:** the append-only Teacher-status-transition integrity rule is a *referential
  pointer* to the DAT-006 Activity Timeline; DAT-006 authoring must *home* that append-only rule and
  keep DB-021 a pointer (no duplicate ownership).
- Registers updated in this commit: IDX-001 (DAT-002 + ADR-0063 + AUD-P4-002), DEC-000 (next →
  ADR-0064), GOV-009 (counts + refresh + history row), RDM-001 (Phase-4 DC2 in progress — DAT-002
  frozen), P4-000 (document-map DAT-002 status), data/README.

## Notes

DAT-002 is the first *specification-of-structure over frozen behavior* to freeze in Phase 4. Its clean
first-pass Readiness (0 Blocking / 0 Major) reflects the discipline of closing the person-identity gap
by upstream amendment (DR-091) rather than inventing it in-model — the traceability chain held. The next
Phase-4 deliverable is **DAT-003 (Programs & Registrations)**, pending a separate Owner order.
