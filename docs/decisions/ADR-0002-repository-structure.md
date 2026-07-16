# ADR-0002 — Repository Structure & Taxonomy

| Field | Value |
|---|---|
| ADR | 0002 |
| Title | Repository Structure & Taxonomy |
| Phase | 0 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Documents from seven phases (0–6), decision records, templates, and per-phase audit
reports must coexist without ambiguity about where anything lives, and reviewers
must be able to detect out-of-phase content mechanically.

## Decision

Adopt the directory layout fixed in IDX-001 §1:

- `docs/governance/` — Phase 0 rulebook (GOV-*)
- `docs/decisions/` — DEC-000 + ADRs, spanning all phases
- `docs/roadmap/` — RDM-001
- `docs/templates/` — TPL-* canonical templates
- `docs/audits/phase-N/` — one audit folder per phase
- `docs/product|business|ux|data|components|screens/` — one directory per
  documentation phase (1–6), created now as RESERVED stubs so the full shape of the
  repository is visible and phase trespassing is detectable from day one.

Each reserved directory contains only a `README.md` stub naming its phase and
owning Doc-ID prefix until that phase opens.

## Consequences

- Gate 8 can verify repository integrity by diffing the actual tree against
  IDX-001 §1.
- Adding any new top-level directory requires a new ADR (it changes this taxonomy).
- Stub READMEs are replaced by real content only when their phase opens (GOV-001 §5.2).
