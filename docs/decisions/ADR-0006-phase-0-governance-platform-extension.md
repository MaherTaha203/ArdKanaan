# ADR-0006 — Phase 0 Governance Platform Extension

| Field | Value |
|---|---|
| ADR | 0006 |
| Title | Phase 0 Governance Platform Extension |
| Phase | 0 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Phase 0 review found the governance layer sound but incomplete as a platform:
it lacked a philosophical root (the "why" above the law), an explicit behavioral
protocol for the AI executor, a persistent engineering memory across sessions, and
a measurable health dashboard. Phase 0 is therefore reopened under the amendment
procedure (GOV-004 §5) and extended before Phase 1 may begin.

## Decision

1. Add four governance documents:
   - **GOV-000 Project Manifesto** — the highest document in the repository;
     philosophical root of all others, carrying principle atoms `M-NN`.
   - **GOV-007 AI Execution Protocol** — mandatory behavioral rules for the AI
     executor, carrying protocol atoms `AI-NN`; binding in every phase.
   - **GOV-008 Engineering Memory** — permanent, LIVING record of engineering
     lessons (`LES-NNN`), distinct from ADRs and from git history.
   - **GOV-009 Repository Health** — permanent, LIVING dashboard of measurable
     repository indicators, refreshed at every phase close.
2. **Document hierarchy:** GOV-000 sits above GOV-001. Conflicts of principle are
   resolved by GOV-000; conflicts of operational rule by GOV-001; all other
   documents remain subordinate to both.
3. **Naming:** the extension documents are named
   `GOV-NNN_UPPER_SNAKE.md` (ID embedded in the filename). This pattern is
   canonical for all governance documents numbered GOV-007 and above, and for
   GOV-000. The six founding documents (GOV-001…GOV-006) keep their existing
   `UPPER-KEBAB.md` filenames — renaming them would invalidate frozen references
   for no engineering gain.
4. **Traceability root:** the trace chain of GOV-006 §3 gains `M-NN` as its root:
   `M → F → PR → BR → {UX, DB, CP} → SC → implementation`. Every immutable fact
   F-NN now cites its manifesto principle(s).
5. **Process integration:** phase close (GOV-005 step 8) now also refreshes
   GOV-009 and captures lessons into GOV-008; the review roles (GOV-004 §2) gain
   the AI Execution Supervisor, who enforces GOV-007 at every gate.

## Consequences

- **Blast radius (all updated in this amendment):** IDX-001, GOV-001 (→ v2.0.0,
  supremacy change + fact citations), GOV-002, GOV-003, GOV-004, GOV-005, GOV-006,
  RDM-001, DEC-000, README.md.
- All eight quality gates re-run for Phase 0; a new audit report AUD-P0-002 records
  the extension audit; Phase 0 re-freezes only on all-PASS.
- Future sessions of the AI executor are bound by GOV-007 and must consult GOV-008
  before starting any phase.
