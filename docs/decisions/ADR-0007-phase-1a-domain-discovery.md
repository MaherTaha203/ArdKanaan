# ADR-0007 — Phase 1A: Domain Discovery

| Field | Value |
|---|---|
| ADR | 0007 |
| Title | Phase 1A: Domain Discovery |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The owner has commissioned a dedicated Domain Discovery stage before Product
Constitution: the complete knowledge model of the business must be captured —
exactly as currently understood, inventing nothing — and every missing business
fact must be identified explicitly rather than guessed (AI-10, AI-11). The frozen
pipeline (RDM-001) goes directly from Phase 0 to Phase 1; a documentation stage
must be inserted, which changes frozen material and therefore requires this ADR
(GOV-004 §5, ADR-0002).

## Decision

1. **Insert Phase 1A — Domain Discovery** into the documentation track between
   Phase 0 and Phase 1. Its deliverables live in a new directory `docs/domain/`
   (extends the ADR-0002 taxonomy).
2. **Documents and naming:** five documents with Doc-ID prefix `DOM-NNN`, filenames
   `DOMAIN-NNN_UPPER_SNAKE.md` (the filename word `DOMAIN` maps to the Doc-ID
   prefix `DOM`, following the ID-in-filename precedent of ADR-0006 §3):
   Business Overview, Business Entities, Business Workflows, Business Rules
   Catalog, Unknowns & Assumptions.
3. **New atom classes** (added to GOV-002 §5): `DR-NNN` domain rules, `WF-NN`
   domain workflows (descriptive), `UNK-NNN` unknown business facts, `ASM-NNN`
   working assumptions. `DR` atoms cite `F`/`M` atoms; from Phase 1 onward every
   `PR` MUST reconcile with the `DR` catalog and MUST NOT contradict it.
4. **Anti-invention law of the phase:** Domain Discovery records only what the
   frozen facts and the owner's statements establish. Any business fact that
   cannot be cited to F/M atoms or an owner statement is recorded as `UNK-NNN` in
   DOM-005 — never asserted. Assumptions (`ASM`) are explicitly labeled, carry no
   normative force, and convert to rules only after owner confirmation via
   amendment.
5. **Statuses:** DOM-001…DOM-004 freeze at phase close. DOM-005 is **LIVING** — it
   is the register of open unknowns, updated as the owner answers; each resolution
   is applied by amendment to the affected frozen documents.
6. **Audit:** the phase closes with audit report AUD-P1A-001 in
   `docs/audits/phase-1a/`. Phase labels of the form `1A` are valid phase
   identifiers wherever GOV-002 uses `N`.
7. **Gate to Phase 1:** Product Constitution may open after Phase 1A freezes, but
   Phase 1 itself cannot FREEZE while any HIGH-priority unknown in DOM-005 remains
   unresolved.

## Consequences

- **Blast radius (updated in this amendment):** GOV-002 (§2, §4, §5), GOV-006
  (§3), IDX-001 (§1, §2), RDM-001 (§2), DEC-000, README.md, GOV-008, GOV-009.
- Full gate re-run covers Phase 0's amended documents together with the Phase 1A
  audit (one combined run, AUD-P1A-001).
- Phase 1 gains an explicit entry criterion (owner answers to HIGH unknowns) —
  scope creep by silent assumption becomes structurally impossible.
