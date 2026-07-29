# ADR-0067 — DAT-006 Activity Timeline Adoption & Freeze

| Field | Value |
|---|---|
| ADR | 0067 |
| Title | DAT-006 Activity Timeline Adoption & Freeze |
| Phase | 4 (DDL Specification) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 4 checkpoint DC2 concludes with the last entity family — the append-only **Activity Timeline**
(Operations) that DAT-002/003/004/005 each deferred to DAT-006. A Stage-1 Architectural Discovery resolved
its one genuinely subtle question — the timeline's *nature* — and confirmed it can be specified faithfully
without any upstream amendment.

**DAT-006 — Activity Timeline** (`docs/data/DAT-006_ACTIVITY_TIMELINE.md`) specifies the Operations record as
logical Data Atoms under DAT-001's six-kind taxonomy. It ran the full GOV-013 lifecycle: Discovery → Draft →
Stage-3 Adversarial Self-Hardening → Constitutional Readiness Verification (4-lens Panel + independent
Readiness Judge).

## Decision

1. **Adopt DAT-006 — Activity Timeline** as **FROZEN v1.0.0** — the fifth and final Phase-4
   entity-specification document, subordinate to DAT-001 and P4-000.
2. **What it fixes (16 Data Atoms, DB-144…DB-159):**
   - **Entity** DB-144 — the **Activity Timeline Event (Operation)**: a **stored** append-only event-log
     entity (DAT-001 §4 places timeline events on the persistable side; DV-4's insert-only rule presupposes
     stored rows), holding no business authority (DR-018).
   - **Stored Attributes** DB-145…DB-148 — occurrence timestamp, operation type (verb), actor (only where
     homed nowhere else), and the DR-048 descriptive-edit **old→new** change record (the sole home of the
     old value).
   - **Derived Attributes** DB-149/DB-150 — the financial-impact flag and the "what happened" descriptor
     (projections of source facts; DR-020 requires distinguishability, not storage).
   - **Identity** DB-151 (ordered by occurrence timestamp; no per-type sequential number — DR-090 governs
     voucher types only), **Relationship** DB-152 (Operation → Source; "about this source", never
     re-authoring), **Constraints** DB-153…DB-156 (source/type/flag value-domains; and the
     never-a-second-source Authority-Boundary invariant), **Integrity rules** DB-157…DB-159 (append-only
     insert-only; corrections-append; auto-generated-not-hand-keyed).
   - **Hybrid Authority Boundary:** an Operation stores only its own event metadata and the DR-048 delta;
     every source-owned fact (amount, the DR-006 split snapshot, cancellation date/reason/actor DB-057…DB-059,
     current status) is **referenced/projected, never re-stored** — no forbidden second source of truth
     (DR-018). Status transitions are recorded by the **operation-type verb** (the three lifecycles are
     binary and reversible — DR-088 — so no stored from→to is needed), honoring the DAT-002 DB-021 pointer
     without inventing a stored status fact.
3. **Review outcome:** Stage-3 CONFIRMED the stored-entity nature (H1) and **refuted the one amendment
   risk (H3)** — recording Registration/Refund/Expense-Return events is faithful consumption of DR-018 ("everything
   that happened", on which DR-020 depends and which predates those entities), not a DR-020 amendment; H2/H4/H5
   repairs applied. The Readiness Verification returned **all four Panel lenses READY-WITH-NITS** and the
   independent **Judge READY** (0 Blocking / 0 Major); eight editorial/precision corrections (DR-088 on
   DB-146; DR-047 + governing test on DB-147; Expense Category in DB-153; "Restore" removed from the DR-020
   source claim; the Entity-vs-"business entity" reconciliation; §8 range and DB-145 label; footer stamp)
   were applied before freeze.

## Consequences

- DAT-006 is FROZEN and is the authoritative logical specification of the Activity Timeline. Amendments only
  via GOV-004 §5.
- **No** business/product/domain truth is introduced (DV-8): the only genuinely-new stored delta is the
  DR-048 edit old→new; status transitions reuse the DR-020 operation type; the balances stay derived in
  DAT-005; voucher facts stay authoritative in DAT-004.
- **Phase-4 milestone:** DAT-006 completes the entity-specification set **DAT-001…DAT-006** and the DB-atom
  sequence **DB-001…DB-159**. Formal Phase-4 closure (an AUD-P4-FINAL and a closure ADR, per the GOV-011
  phase-closure discipline) remains a **separate Owner-ordered step**; this ADR freezes DAT-006 only.
- **Modeling precedent:** a "records-everything but authors-nothing" log is modeled as a stored Entity on
  DAT-001 §4's persistable side, fenced by DR-018 so it stores only its own event facts and references the
  rest — reconciling DR-007's "the view is derived" as *auto-generated-and-stored*, not recomputed-on-read.
- Registers updated in this commit: IDX-001 (DAT-006 + ADR-0067 + AUD-P4-006), DEC-000 (next → ADR-0068),
  GOV-009 (counts + refresh + history row), RDM-001 (Phase-4 DC2 — DAT-006 frozen; entity set complete),
  P4-000 (document-map DAT-006 status), data/README.

## Notes

DAT-006 is the final entity document of Phase 4. Its central decision — a stored append-only timeline that
is nonetheless never a second source of truth — sat on a genuine tension in the frozen layer (DAT-001 §4
persistable vs DR-018 "not an entity" / DR-007 "the view is derived"), which the lifecycle resolved
decisively against source rather than by fiat. With DAT-001…DAT-006 frozen, the logical data model is
fully specified; the next step is **formal Phase-4 closure**, pending a separate Owner order.
