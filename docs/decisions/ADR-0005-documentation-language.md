# ADR-0005 — Documentation Language

| Field | Value |
|---|---|
| ADR | 0005 |
| Title | Documentation Language |
| Phase | 0 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The product is Arabic-named (أرض كنعان) and serves an Arabic-speaking training
center owner, while the engineering pipeline, tooling, and review vocabulary are
English-centric. Mixing languages ad hoc inside normative documents would create
Gate 5 (Consistency) hazards.

## Decision

1. Engineering documentation (Phases 0–6, ADRs, audits) is written in **English**.
2. Domain terms carry their Arabic original on first use in a document, e.g.
   “Receipt Voucher (سند قبض)”; thereafter the fixed English term from GOV-002 §7.2
   is used.
3. The **product UI language** (including RTL layout) is explicitly **not decided
   here**; it is a Phase 3 (UX Constitution) decision and must be recorded there as
   a `UX-NNN` atom backed by its own ADR.

## Consequences

- One normative vocabulary per document set; Gate 5 checks remain mechanical.
- Phase 1's glossary must supply the English↔Arabic term pairs for all ten core
  entities (F-05) so later phases inherit them consistently.
- No constraint is placed on the eventual UI language — the user-facing product is
  free to be fully Arabic.
