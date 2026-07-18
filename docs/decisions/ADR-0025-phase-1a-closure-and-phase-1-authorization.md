# ADR-0025 — Phase 1A Closure & Phase 1 Authorization

| Field | Value |
|---|---|
| ADR | 0025 |
| Title | Phase 1A Closure & Phase 1 Authorization |
| Phase | 1A → 1 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

On 2026-07-18 the Owner authorized closing Phase 1A (Domain Discovery) and opening
Phase 1 (Product Constitution), as Stage 3 of the three-stage close (Stage 1 =
Session 12 interview; Stage 2 = Session 12 propagation, ADR-0024). Phase transitions
are decisions and are recorded as ADRs (GOV-001 §7.2); opening a phase is governed by
the universal phase-entry law (GOV-011 §2). This ADR records the decision; the
evidence is assembled in **AUD-P1A-FINAL** (Domain Discovery Completion Report).

## Decision

1. **Phase 1A (Domain Discovery) is CLOSED.** All Owner-ordered interview sessions
   (1–12) are complete; DOM-001…DOM-004 are frozen and DOM-005 remains LIVING by
   design (ADR-0007 §5). The business knowledge model is captured with zero invented
   facts.
2. **Domain Discovery is frozen** at this state; further change requires a new Owner
   Engineering Order and the amendment procedure (GOV-004 §5).
3. **Phase 1 (Product Constitution) is authorized to open.** The three conditions of
   GOV-011 §2 all hold:
   - **Previous phase frozen** — Phase 1A is frozen (this ADR + AUD-P1A-FINAL).
   - **All quality gates passed** — the Session 12 run (AUD-P1A-016) and this
     closure run pass all eight gates.
   - **Explicit Owner authorization** — given in the Owner's Stage 3 order.
4. **The deferred unknowns are non-blocking and explicitly recorded** (see §Deferred
   below). Per ADR-0007 §7 only HIGH unknowns block a phase freeze, and **zero HIGH
   unknowns remain**; no assumption is pending.

## Deferred unknowns at closure (all MEDIUM/LOW, non-blocking)

| ID | Pri | Topic | Deferred to |
|---|---|---|---|
| UNK-013 | MED | Account-statement periods, columns, and party scopes | Product / UX phases (presentation) — student statements & teacher breakdown already exist (S3-D1, DR-035) |
| UNK-029 | MED | Refundability of non-program revenue | Non-program-revenue extension |
| UNK-030 | MED | Amount-due & overpayment handling for non-program revenue | Non-program-revenue extension |
| UNK-021 | LOW | Teacher-share deductions (fees/penalties/materials) | Future version (Owner-postponed, S4-D8) |
| UNK-022 | LOW | Historical data import / opening balances | Data / go-live phase |

None is HIGH; none blocks Phase 1 entry or freeze (ADR-0007 §7). Each stays OPEN in
DOM-005 (LIVING) and is resolved before the phase that consumes it.

## Consequences

- **RDM-001 updated:** Phase 1A → ✅ CLOSED (frozen); Phase 1 → 🟢 OPEN (authorized
  2026-07-18; work not yet started). RDM-001 remains subordinate to GOV-011.
- **AUD-P1A-FINAL created** — the Domain Discovery Completion Report (phase-level
  audit) referencing every session audit (AUD-P1A-001…016).
- **GOV-009 refreshed** to reflect the phase state.
- **No Phase 1 content is created by this ADR.** Opening a phase authorizes work to
  begin under its own Owner orders; the `docs/product/` directory stays reserved
  until Phase 1 work is ordered.
- **Blast radius:** RDM-001, IDX-001 v1.20.0, GOV-009, DEC-000; audit AUD-P1A-FINAL.
  Frozen governance (GOV-011 and the constitution documents) untouched — the roadmap
  is followed, not modified.

## Success criteria (met)

Business model exact; zero invented facts; zero HIGH unknowns; zero pending
assumptions; DR catalog DR-001…DR-090 continuous; all references resolve; all
indicators green. The repository is a stable, frozen domain model ready for Product
Constitution.
