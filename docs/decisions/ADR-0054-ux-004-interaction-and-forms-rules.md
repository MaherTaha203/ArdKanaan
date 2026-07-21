# ADR-0054 — UX-004 Frozen — Interaction & Forms Rules (First Adoption Under GOV-013)

| Field | Value |
|---|---|
| ADR | 0054 |
| Title | UX-004 Frozen — Interaction & Forms Rules of the User Experience Layer |
| Phase | 3 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Third structural document of Phase 3 (Checkpoint UC2), and the **first document adopted under
GOV-013** — its review predates the protocol's freeze but satisfied it in full, and the deferral
of this propagation until GOV-013 froze was the Owner's methodological decision (all published
documents pass under the same governing system).

Lifecycle (AUD-P3-005 reproduces the full record): Discovery **CONFIRMED**; Draft with the two
Owner notes embedded from v0.1.0 (the non-derivable-input rule as an independent invariant; the
workflow-integrity prohibition); Author self-hardening (four hypotheses, four hits fixed —
including the DR-043/BR-043 citation confusion caught by frozen-text check); **six-role Panel
review** (4 BLOCKING + 12 MINOR findings, all evidence-based — miscited authorities corrected to
DR-043 + per-document rules, the BR-065 path constraint restored, the IX-10 deciding test added,
prevention bounded, IX-08 extended to "requests or accepts"); Author resolution (v0.3.0);
**Readiness Judge: READY** (8/8 criteria, every load-bearing citation spot-verified against
frozen text). Owner approval granted. Decision category (GOV-010 §5): UX.

## Decision

**Approve and freeze UX-004 — Interaction & Forms Rules** (FROZEN v1.0.0). UX-004 answers exactly
one question — *"How is each frozen business action constitutionally performed?"* — and fixes ten
elements (IX-01…IX-10):

- **IX-01/02** the Interaction (≡ performance of exactly one action; one-Interaction-one-action
  per DR-023/BR-084; viewing is not Interaction) and the Form (input surface of one action; one
  Form iff non-derivable inputs; NOT a screen/page/layout/field-list/control/tab/wizard/dialog);
- **IX-03** the five-moment performance lifecycle (initiation → input → rule surfacing →
  adjudication → outcome revelation) — semantics ordered by DR-043, never a step design;
- **IX-04** rule surfacing: every guidance/prevention cites the frozen rule it surfaces;
  prevention bounded to what the cited rule itself makes invalid; permanence surfaced before the
  act (DR-043; PP-3/PA-5);
- **IX-05/06** five action classes derived one-per-frozen-consequence-kind, covering all 17 WA-06
  actions exactly once (verbatim titles; WA-06 the sole registry);
- **IX-07…IX-10** four invariants: adjudication belongs to the business layer; **nothing
  derivable is ever requested or accepted** (revealed derivable values never editable — the
  surface-level enforcement of DR-007/F-08/PP-1); performance coverage complete (BC amendment →
  UX-003 assignment → UX-004 classification before any surface); **workflow integrity** with the
  three-criterion deciding test for every later phase.

## Interpretation boundaries

- Performance semantics only: no screen, layout, navigation, visual hierarchy, interaction
  detail-design, component, wording, accessibility rule, or implementation; wording belongs to
  UX-005 (PC-006), arrangement to Phases 5–6 within the IX-10 test.
- Consumes BC-000…BC-009, UX-003 (WA-06), UX-002 (homes), UX-001 (invariants) exactly as frozen;
  CDC honored; no upstream document modified.
- Released only by constitutional amendment (GOV-004 §5), reviewed per GOV-013 §10.

## Consequences

- **UX-004 FROZEN** (`docs/ux/`); **Checkpoint UC2 COMPLETE** (UX-003 + UX-004); UX-005
  (Language, RTL & Accessibility) is next, pending an explicit Owner order (GOV-013 lifecycle).
- **P3-000 tracker:** UX-004 → FROZEN; UC2 complete.
- **Registers:** IDX-001, DEC-000 (next ADR-0055), GOV-009, RDM-001.
- **Audit:** AUD-P3-005 — eight gates PASS; GOV-013 stage history reproduced (MR-09).
- **Blast radius:** IDX-001, DEC-000, GOV-009, RDM-001, P3-000 (LIVING). No frozen upstream
  changed.
