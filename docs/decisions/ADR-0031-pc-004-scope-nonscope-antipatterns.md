# ADR-0031 — PC-004 Scope, Non-Scope & Anti-Patterns Adopted

| Field | Value |
|---|---|
| ADR | 0031 |
| Title | PC-004 Scope, Non-Scope & Anti-Patterns Adopted |
| Phase | 1 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Fourth Phase-1 document under P1-000; opens **Checkpoint C2** (definition). Authored
under Owner constraints (answers "what product belongs here and what never belongs
here"; every scope capability cites upstream; every exclusion states a reason; each
anti-pattern carries the five required fields; mechanical boundary tests; a
future-extension policy; no UX/UI/visual/implementation/technology/DB/architecture
content; no restated business rules), presented as a DRAFT, and approved with one
required addition on 2026-07-18. Decision category (GOV-010 §5): Product.

## Decision

Adopt **PC-004 — Scope, Non-Scope & Anti-Patterns** (FROZEN):

- **§1 Scope** — 12 capabilities (SC-1…SC-12), each citing upstream DR/WF/PC.
- **§2 Non-Scope** — 12 exclusions (NS-1…NS-12), each with reason + disposition
  (Permanent vs Future version).
- **§3 Anti-Patterns** — AP-1…AP-8, each with Description / Harm / Constitution
  violated / Detection test / Examples.
- **§4 Boundary Tests** — a mechanical seven-gate admission procedure (BT-1…BT-7).
- **§5 Extension Classification** *(Owner-required addition)* — every new request is
  classified as **Data / Capability / Behavior / Implementation** extension, routing
  it to the owning layer/phase and its governance (mirrors GOV-012).
- **§6 Future Extension Policy** — three tiers (Data → Tier 1; Capability → Tier 2
  with ADR+PR; axiom/scope-crossing → Tier 3 amendment); deferred unknowns
  (UNK-013/029/030) routed to Tier 2.

Owner-required addition incorporated: **§5 Extension Classification precedes §6
Future Extension Policy**, classifying any request into Data / Capability / Behavior /
Implementation extension.

## Interpretation boundaries

- PC-004 is **Product-layer** (GOV-012): it defines the product boundary and growth
  rules; frozen business rules are **cited** as upstream, never restated; no UX/visual/
  implementation content.
- Extension Classification aligns with GOV-012 (existence vs usage vs construction):
  Data/Capability are Product; Behavior is UX/Business (Phase 2/3); Implementation is
  Engineering.
- §4 Boundary Tests and §3 Anti-Patterns become mandatory admission filters for every
  future PR.

## Consequences

- **New document:** PC-004 (FROZEN, `docs/product/`); **Checkpoint C2 begins.**
- **P1-000 tracker:** PC-004 → FROZEN; C2 continues with PC-005, PC-006.
- **Registers:** IDX-001, DEC-000 (next ADR-0032), GOV-009, P1-000 tracker.
- **Audit:** AUD-P1-005 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P1-000 (LIVING). No domain or frozen
  governance changed.
