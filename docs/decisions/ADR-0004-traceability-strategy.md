# ADR-0004 — Traceability Strategy

| Field | Value |
|---|---|
| ADR | 0004 |
| Title | Traceability Strategy |
| Phase | 0 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The pipeline's promise — that implementation is transcription of frozen
documentation — is only verifiable if every downstream artifact can cite its
upstream justification, and every upstream rule can list its consumers. A financial
rule (e.g. F-07: the applied distribution is stored permanently in each voucher)
must be provably carried from fact → requirement → business rule → data model →
screen → code.

## Decision

1. Adopt the single trace chain `F → PR → BR → {UX, DB, CP} → SC → implementation`
   with the citation obligations defined in GOV-006 §3 (no orphans, no inventions).
2. Cross-references are ID-based with relative links (GOV-006 §4), bidirectional via
   the `Depends on` / `Referenced by` header fields.
3. Each phase from Phase 1 onward ships a traceability matrix; the Final Audit
   composes them into one unbroken chain (GOV-006 §5).
4. Atoms are retired, never deleted (GOV-006 §6).

## Consequences

- Gate 5 (Consistency) and Gate 7 (Technical) gain mechanical checks: resolve every
  reference, find orphans, find inventions.
- Scope creep becomes structurally visible: a feature with no upstream `F`/`PR`
  citation cannot pass review — this operationalizes the simplicity mandate
  (GOV-001 §8).
- Matrix upkeep is manual; acceptable at this project's intentionally small scale
  (F-02, F-09).
