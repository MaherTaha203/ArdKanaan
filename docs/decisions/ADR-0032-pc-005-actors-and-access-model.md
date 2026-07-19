# ADR-0032 — PC-005 Actors & Access Model Adopted

| Field | Value |
|---|---|
| ADR | 0032 |
| Title | PC-005 Actors & Access Model Adopted |
| Phase | 1 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Fifth Phase-1 document under P1-000 (Checkpoint C2). Authored under the phase
constraints (Product-layer only; builds on PC-001…PC-004 and the frozen domain; no
invented roles; no UX/visual/implementation content; frozen rules cited, not
restated), presented as a DRAFT, and approved on 2026-07-18. Decision category
(GOV-010 §5): Product.

## Decision

Adopt **PC-005 — Actors & Access Model** (FROZEN):

- **Three actor kinds:** System User (operates), Party (subject of records), Contact
  (information only).
- **Four actors:** Owner (the only System User), Teacher and Student (Parties),
  Guardian (Contact) — each traced to the frozen domain; no other actor exists.
- **Access model (AX-1…AX-5):** exactly one system user; no roles/permissions;
  parties/contacts never operate; total access for the one user; the "only the Owner
  operates" **guarantee** is Product while the enforcement **mechanism** is
  Engineering (GOV-012 L10).

## Interpretation boundaries

- Product-layer only: PC-005 states the single-user, no-roles model as a guarantee
  and its invariants; it specifies no authentication mechanism (Engineering).
- Consistent with PA-2 (Scope Singularity), PA-6 (Non-Authority), PC-004 NS-1/NS-3 and
  AP-4; introduces no business rule.
- AX-1…AX-5 become admission filters for every PR (no second user, no roles, no party
  access, no Owner restriction).

## Consequences

- **New document:** PC-005 (FROZEN, `docs/product/`).
- **P1-000 tracker:** PC-005 → FROZEN; Checkpoint C2 continues with PC-006.
- **Registers:** IDX-001, DEC-000 (next ADR-0033), GOV-009, P1-000 tracker.
- **Audit:** AUD-P1-006 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P1-000 (LIVING). No domain or frozen
  governance changed.
