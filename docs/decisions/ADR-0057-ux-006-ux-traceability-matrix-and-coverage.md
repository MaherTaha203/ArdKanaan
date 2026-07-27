# ADR-0057 — UX-006 Frozen: UX Traceability Matrix & Coverage (the UX sink)

| Field | Value |
|---|---|
| ADR | 0057 |
| Title | UX-006 Frozen — UX Traceability Matrix & Coverage |
| Phase | 3 (UX Constitution) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 3 (P3-000) requires a UX coverage sink (Checkpoint UC4) — the UX analog of BC-009 — that proves
the UX Constitution completely and traceably presents the frozen business/product behavior requiring
a surface. UX-006 was authored and reviewed under **GOV-013**. Its lifecycle exercised the protocol,
including a real coverage gap and a Business→UX boundary amendment:

- Draft → Adversarial Self-Hardening → **Readiness Verification #1: NOT READY** — F1: BC-009 (§7 / §9
  BX-6) delegates DR-018/DR-020 to the UX layer, but no UX rule covered them.
- **Path-1 amendment** (Owner-authorized): UX-002 gains **IA-08 (The Activity View)** to discharge
  DR-018/DR-020 (see ADR-0058).
- **Readiness Verification #2: NOT READY** — integration slips N1–N4 (the amendment under-propagated
  through UX-002's own boilerplate/citations).
- **Amendment Completion** → **Readiness Verification #3: READY** — 6/6 Panel SOUND, 0 Blocking / 0
  Major; independent Readiness Judge **READY**.

## Decision

1. **Adopt UX-006 — UX Traceability Matrix & Coverage** (`docs/ux/UX-006_UX_TRACEABILITY_MATRIX_AND_COVERAGE.md`),
   **FROZEN v1.0.0**.
2. **Nature:** a **sink — proof, never production.** UX-006 introduces **no** UX rule (no
   IA/WA/IX/LA/UXP/UXV); its content is the two traceability matrices (§5 rule→authority, 0 orphan;
   §6 authority→rule, 0 gap), the presentation-relevance filter (§4), the non-presenting disposition
   (§7), and six closure criteria **UXC-1…UXC-6** (proof success-conditions, not behavior).
3. **Proven:** every UX atom (UXP/UXV/IA-01…08/WA/WS/IX/C/LA/LAV) traces to a frozen authority (0
   orphan); all **17** Owner actions are covered (one workspace + one class each); every revealed fact
   is homed; the DR-018/DR-020 delegation is covered by UX-002 IA-08. **0 orphan · 0 gap.**
4. **Checkpoint UC4 COMPLETE.**

## Consequences

- UX-006 is the frozen proof that Phase 3 is complete and traceable; it consumes UX-001…UX-005 and
  the Business/Product authorities they cite, and produces no atom any later layer must obey.
- Enables **Phase 3 Closure** (ADR-0059) once the UX-002 amendment (ADR-0058) is also propagated.
- Registers updated in the closure commit: IDX-001, DEC-000, GOV-009, RDM-001, P3-000.

## Notes

Second Phase-3 document (after UX-004/UX-005) to run the full GOV-013 independent-Panel lifecycle, and
the one that surfaced and closed a genuine Business→UX coverage gap (DR-018/DR-020) — the sink doing
exactly its job before a freeze could hide the gap. No Silent Progression (MR-09) held across three
verifications.
