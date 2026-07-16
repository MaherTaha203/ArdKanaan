# ADR-0011 — Master Engineering Roadmap as Governance Law

| Field | Value |
|---|---|
| ADR | 0011 |
| Title | Master Engineering Roadmap as Governance Law |
| Phase | 0 (governance amendment) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Execution sequencing has so far lived in RDM-001 (a LIVING status tracker) plus
per-instruction owner orders. After several sequence events (Session 2 reorder,
V1 scope reduction), the owner has ordered — as a mandatory engineering order —
that the execution sequence itself become permanent governance law that no
session may reorder, extend, or optimize.

## Decision

1. Create **GOV-011 Master Engineering Roadmap**
   (`docs/governance/GOV-011_MASTER_ENGINEERING_ROADMAP.md`) as the **only legal
   execution sequence** for the entire project, from project start to Version 1
   release. Only the Owner may modify it.
2. **Universal phase-entry law:** a phase may begin ONLY after (a) the previous
   phase is frozen, (b) all quality gates passed, and (c) explicit Owner
   authorization. Without all three, beginning the next phase is forbidden.
3. **Conflict rule:** if future conversations contain conflicting instructions,
   the Master Engineering Roadmap always wins, unless the Owner explicitly
   changes it.
4. **Document hierarchy:** GOV-011 sits within the governance layer under
   GOV-000/GOV-001 and is the supreme authority on execution *sequence*.
   RDM-001 remains the subordinate LIVING status tracker and must always agree
   with GOV-011; on divergence, GOV-011 wins and RDM-001 is repaired.
5. **ID note (recorded observation, no deviation):** the owner's order names the
   document GOV-011; **GOV-010 is reserved-unassigned by owner order**. Per
   GOV-002 §4, the ID GOV-010 is not retired and may be assigned by the Owner in
   the future.

## Consequences

- **Blast radius:** GOV-001 v2.1.0 (§5.1 sequence authority, §9.4 pointer),
  GOV-005 v1.2.0 (workflow step 1 gains the owner-authorization condition),
  RDM-001 v1.3.0 (subordination note), IDX-001, DEC-000, GOV-008 (LES-008),
  GOV-009; audit AUD-P0-003.
- Phase 0 governance re-freezes after the full review pipeline passes.
- No roadmap phase is executed by this ADR; the repository waits for the Owner.
