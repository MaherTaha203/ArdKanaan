# ADR-0052 — UX-003 Frozen — Workspace Architecture of the User Experience Layer

| Field | Value |
|---|---|
| ADR | 0052 |
| Title | UX-003 Frozen — Workspace Architecture of the User Experience Layer |
| Phase | 3 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

First document authored under the **Autonomous Constitutional Engineering Contract** (adopted by
Owner order as the governing execution model for all remaining Phase-3 work): Stage 1 —
Architectural Discovery (accepted; existence CONFIRMED, conditional on remaining work-organization,
never screen design); Stage 2 — DRAFT with the four mandatory discovery foundations incorporated
from the first version; Stage 3 — Adversarial Self Review against four Owner-specified checkpoints
(justified definition; rule-derived set; independent completeness invariant; observation-is-not-a-
workspace elevated to an invariant); Stage 4 — Constitutional Readiness Verification across ten
dimensions (three small defects found and corrected; verdict **READY**). The Owner's final decision
declared UX-003 Constitutionally Ready and ordered propagation on 2026-07-20. Decision category
(GOV-010 §5): UX.

## Decision

**Approve and freeze UX-003 — Workspace Architecture** (FROZEN v1.0.0). UX-003 answers exactly one
question — *"How is the Owner's work constitutionally organized into coherent workspaces above the
Information Architecture?"* — and fixes nine elements (WA-01…WA-09):

- **WA-01** the constitutional definition of a Workspace — an operating context for coherent
  business work; **not** a screen, page, navigation destination, module, layout, visual component,
  or UI construct — with an explicit justification of why the concept must exist;
- **WA-02** orthogonality — Workspace Architecture organizes WORK; Information Architecture
  organizes INFORMATION; information ownership always remains in UX-002;
- **WA-03** the derivation rule — workspaces derive from the frozen Business Actions of BC-000…
  BC-009 above the frozen UX-002; no action invented, none redefined;
- **WA-04** the single-membership invariant — every business action belongs to exactly one
  workspace (never two, never none);
- **WA-05** the six-workspace set, derived one-per-frozen-purpose-family: WS-01 Offering &
  Engagement · WS-02 Enrollment · WS-03 Money In · WS-04 Teacher Settlement · WS-05 Center
  Expenses · WS-06 Corrections & Refunds;
- **WA-06** the complete assignment registry — all 17 Owner-authored BC business actions, each
  exactly once;
- **WA-07** workspaces operate above UX-002 (homes and discoverability unchanged);
- **WA-08** the assignment-completeness invariant — the registry is exhaustive; any future BC action
  requires a UX-003 amendment before any surface presents it;
- **WA-09** observation is never a workspace — revelation (BC-007) is information, not work.

## Interpretation boundaries

- **Work organization only.** UX-003 defines no screen, page, layout, navigation, visual hierarchy,
  interaction detail, form, component, accessibility rule, language rule, or implementation; how
  each action is *performed* belongs to UX-004.
- **Consumes only:** BC-000…BC-009, UX-002, UX-001 — exactly as frozen; CDC honored; no information
  ownership migrates out of UX-002.
- Any future change to the workspace set or assignment is a constitutional amendment of UX-003
  (GOV-004 §5), never a drift in a later document.

## Consequences

- **UX-003 FROZEN** (`docs/ux/`); the work-organization foundation of Phase 3 (**Checkpoint UC2
  begun**; UX-004 next).
- **P3-000 tracker:** UX-003 → FROZEN; UX-004 next (pending a separate Owner order).
- **Registers:** IDX-001, DEC-000 (next ADR-0053), GOV-009, RDM-001, P3-000.
- **Audit:** AUD-P3-004 — eight gates PASS; ten-dimension readiness verification PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, RDM-001, P3-000 (LIVING). No Business, Product,
  Domain, or frozen Governance content changed.
