# ADR-0062 — DR-091 Person-Record Identity (DOM-004 Post-Closure Amendment)

| Field | Value |
|---|---|
| ADR | 0062 |
| Title | DR-091 Person-Record Identity — DOM-004 Amendment |
| Phase | 4 (DDL Specification) — amends Phase-1A Domain (DOM-004) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 4 checkpoint DC2 (Parties — DAT-002) opened with a Stage-1 Architectural Discovery over the
frozen entity landscape. The Discovery surfaced a genuine **missing-authority gap**: the frozen
Business/Domain layer establishes that **Student** and **Teacher** exist as person-records (DR-021;
DOM-002 §4/§5) and freezes *some* of their attributes (the Guardian contact group on the student,
DR-089; the Teacher operational status, DR-083), but it freezes **no descriptive/identifying field of
the person themselves — not even a name — and no uniqueness / de-duplication policy**.

Under DAT-001's Authority Boundary and DV-8 (representational non-creation), a Phase-4 document may
record structure **only** for already-frozen truth; it may not invent a person's identity attributes.
The gap was escalated to the Owner (Owner Decision Request). The Owner directed **Option B**: author
the smallest possible constitutional amendment that freezes the essential person-record identity
attributes and uniqueness policy — minimal, technology-neutral, no implementation detail — then resume
DAT-002 from the amended authority.

## Decision

1. **Adopt DR-091 — "Person-record identity: the name is the essential identifying attribute;
   distinctness is Owner-maintained"** into **DOM-004** (Business Rules Catalog), as a post-closure
   amendment under **GOV-004 §5**. DOM-004 advances **v3.9.0 → v3.10.0**.
2. **What DR-091 freezes (minimal, technology-neutral):**
   - the person's **name** is the **essential identifying attribute** of every person record (Student,
     Teacher, and the Guardian contact held on a student) — the minimum for a record to denote a person;
   - each person record denotes **one distinct real individual**;
   - V1 imposes **no automatic natural-key uniqueness or de-duplication rule** (no national-ID, no
     phone-unique, no "same X ⇒ same person"); the sole Owner-operator maintains distinctness by
     judgment (single-operator simplicity, PA-2; "no weight without value", M-08);
   - beyond the name, a person record holds only such further attributes as are **separately frozen**
     (DR-089 Guardian group; DR-083 Teacher status); no other descriptive field is mandated in V1.
3. **What DR-091 does NOT do:** it fixes no storage type, key mechanism, format, or validation (any
   machine-level unique identifier is a **Phase-10** surrogate, never a business/natural key); it adds
   no financial or behavioral rule; it enumerates no further descriptive fields.
4. **Vehicle rationale (Owner Engineering Directive):** the DR catalogue (DOM-004) is where person-entity
   facts already live (DR-021, DR-083, DR-089) and is the authority Phase-4 atoms cite; extending it by
   one atom preserves architecture, DR-continuity (1..91), and the lowest governance cost, versus a
   fragmenting new document. Like **PLP-001** (the Product analog, ADR-0055), this records an
   **Owner-approved fact**, not contested design, so the GOV-013 Panel is not invoked; the adoption gate
   check plus explicit Owner approval governs.

## Consequences

- **DAT-002 unblocked:** the Student and Teacher **Identity** atoms and the **name** Attribute atom now
  cite **DR-091**; the previously-flagged Identity gap is closed at its proper (Domain) layer, not
  invented inside the data model.
- **No behavioral change:** DR-091 introduces no money rule, workflow, or product decision; every prior
  DR (DR-001…090) is untouched. DOM-002's entity descriptions remain accurate and are not modified.
- **Amendment scope (GOV-004 §5):** the change is additive (one new DR atom); the mechanical DR range
  becomes 1..91. Registers updated in this commit: IDX-001 (DOM-004 v3.10.0 + ADR-0062), DEC-000
  (next → ADR-0063), GOV-009 (DR count 90 → 91; refresh + history row).
- The surrogate-key and any further person fields remain deferrable to a future amendment or Phase-10.

## Notes

This is the second post-closure amendment to a frozen constitution driven by a downstream phase (after
UX-002 IA-08, ADR-0058) — the traceability discipline working as designed: a Phase-4 Discovery exposed
a real gap in the frozen truth, which was closed at the owning layer by the smallest possible
Owner-approved amendment rather than papered over inside the data model.
