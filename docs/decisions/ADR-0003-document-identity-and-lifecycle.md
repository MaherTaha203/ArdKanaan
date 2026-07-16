# ADR-0003 — Document Identity, Naming & Lifecycle

| Field | Value |
|---|---|
| ADR | 0003 |
| Title | Document Identity, Naming & Lifecycle |
| Phase | 0 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Cross-referencing and traceability (GOV-006) require stable identities for
documents and for individual normative statements. File paths alone are fragile;
prose alone is unreviewable.

## Decision

1. **Two-level identity:** every document gets a permanent Doc ID
   (`PREFIX-NNN`, GOV-002 §4); every normative statement gets a permanent atom ID
   (`F/PR/BR/UX/DB/CP/SC`, GOV-002 §5). IDs are never reused.
2. **Naming rules** for files follow GOV-002 §2 exactly (upper-kebab canonical
   docs, `ADR-NNNN-kebab-title.md`, `AUDIT-PN-SUBJECT.md`).
3. **Lifecycle:** `DRAFT → IN-REVIEW → FROZEN → SUPERSEDED`, plus `LIVING` for
   registers/logs/templates; semantic versioning per GOV-002 §6.
4. **Canonical header:** every document opens with the header table of GOV-002 §3,
   which is machine-checkable at Gate 6/7.

## Consequences

- References survive file moves (IDs are stable; links are repaired mechanically).
- Frozen documents are tamper-evident: any change without the amendment procedure
  (GOV-004 §5) is a Gate 8 defect.
- Slight authoring overhead per document; accepted — the document set is small by
  design (F-09).
