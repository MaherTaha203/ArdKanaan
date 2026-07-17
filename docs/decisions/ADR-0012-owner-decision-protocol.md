# ADR-0012 — Owner Decision Protocol (GOV-010) Completes the Governance Layer

| Field | Value |
|---|---|
| ADR | 0012 |
| Title | Owner Decision Protocol (GOV-010) Completes the Governance Layer |
| Phase | 0 (governance amendment) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

ADR-0011 §5 recorded GOV-010 as **reserved-unassigned by owner order**. The Owner
has now assigned it by mandatory engineering order: GOV-010 becomes the Owner
Decision Protocol — the authoritative protocol for how Owner decisions are
introduced, propagated, verified, and frozen. The order also declares that after
GOV-010 is integrated and all gates pass, **the Governance layer is complete and
frozen unless explicitly reopened by the Owner**.

## Decision

1. Create **GOV-010 Owner Decision Protocol**
   (`docs/governance/GOV-010_OWNER_DECISION_PROTOCOL.md`) with the ten sections
   mandated by the order: Purpose, Decision Authority, Decision Hierarchy,
   Decision Lifecycle, Decision Categories, Repository Propagation Rule,
   Mandatory Impact Report, Silent Impact Prohibition, Verification, Completion
   Rule — transcribed without optimization, reinterpretation, extension, or
   simplification.
2. **Reading note (no reinterpretation):** the Decision Hierarchy of GOV-010 §3
   expresses the precedence of **decision sources** when conflicts arise (a newer
   Owner decision immediately prevails over any lower artifact). It codifies the
   practice already in force since ADR-0008/0009/0010: Owner decision → ADR →
   propagation into constitutions and governance. It does not alter the
   document-authority chain GOV-000 > GOV-001 within the governance layer.
3. **Governance layer completion:** with GOV-010 integrated, gates passed, and
   references synchronized, the Governance layer (GOV-000…GOV-011) is COMPLETE
   and FROZEN; it may be reopened only by explicit Owner order (per GOV-010 §10).

## Consequences

- **Blast radius:** GOV-001 v2.2.0 (§9.5 pointer), GOV-007 v1.0.1 and
  GOV-011 v1.0.1 (Referenced-by header maintenance), IDX-001 v1.7.0, DEC-000,
  README.md, GOV-008 (LES-009), GOV-009; audit AUD-P0-004.
- Every future Owner decision follows the GOV-010 lifecycle: impact analysis →
  affected artifacts → repository update → cross-reference update → review
  pipeline → freeze, with a mandatory impact report and all-or-nothing
  propagation.
- The GOV-NNN sequence GOV-000…GOV-011 is now gap-free; ADR-0011 §5's
  reservation is fulfilled, not contradicted.
