# ADR-0051 — UX-002 Frozen — Information Architecture of the User Experience Layer

| Field | Value |
|---|---|
| ADR | 0051 |
| Title | UX-002 Frozen — Information Architecture of the User Experience Layer |
| Phase | 3 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Under P3-000 and the frozen UX-001, the second Phase-3 document underwent **Architectural
Discovery** (Owner-approved) which found the original mapped UX-002 ("Actors & Access Presentation")
**not constitutionally resistant to deletion** — its responsibility is already covered by PC-005 and
UX-001/UXV-05. The Owner therefore **redefined UX-002 as Information Architecture** (consuming PC-003,
never redefining it). UX-002 was authored as a DRAFT, then revised twice: **Revision-1** (reframe
"anchors/entities" as **information domains**; remove the Center as a domain and fix it as the
context; recast relationships as **informational**, not navigation; add the boundary line *"This
document organizes information. It does not organize work."*) and **Revision-2** (define the
**domain vs secondary-structure** distinction as a difference of level; add a constitutional
**discoverability** definition — every business fact has exactly one primary information home).
Approved for propagation on 2026-07-20. Decision category (GOV-010 §5): UX.

## Decision

**Approve and freeze UX-002 — Information Architecture** (FROZEN v1.0.0). UX-002 answers exactly one
question — *"How is information organized from the Owner's perspective so that the Owner can
understand it, locate it, and navigate through it?"* — and fixes seven structural elements, each
derived from and citing PC-003:

- **IA-01** three primary **information domains** (Programs, Teachers, Students); the **Center** is
  the context, not a domain;
- **IA-02** secondary information structures (Registration between Students & Programs; Policy;
  recorded facts within their subject; center-context financial records);
- **IA-03** information grouping (five clusters); **IA-04** information hierarchy (L0 context → L1
  domains → L2 domain detail → L3 individual fact);
- **IA-05** entry points; **IA-06** informational relationships (not navigation); **IA-07**
  discoverability — every business fact has **exactly one primary information home**.

UX-002 **consumes PC-003 and UX-001 exactly as frozen** and redefines nothing upstream.

## Interpretation boundaries

- **Structure only, information not work.** UX-002 organizes information; it does not organize work
  (UX-003), movement, or flow. It defines no screen, workspace, menu, navigation component, layout,
  form, interaction, visual language, accessibility rule, or engineering decision.
- **PC-003 consumed, never redefined** (UX-001 §2; MMI integrity untouched); introduces no Business
  or Product rule.
- UX-002 is now the frozen structural authority every later UX document (UX-003…UX-006) consumes and
  cites; released only by a Constitutional Amendment (GOV-004 §5).

## Consequences

- **UX-002 FROZEN** (`docs/ux/`); the Information-Architecture foundation of Phase 3 (Checkpoint UC1
  complete: UX-001 + UX-002).
- **P3-000 roadmap refined (administrative, LIVING):** the retired "Actors & Access Presentation" is
  recorded as covered by PC-005 + UXV-05; UX-002 = Information Architecture; the remaining set shifts
  to a six-document map (UX-003 Workspace · UX-004 Interaction & Forms · UX-005 Language/RTL/A11y ·
  UX-006 Traceability); checkpoints UC1{001,002} · UC2{003,004} · UC3{005} · UC4{006}.
- **Registers:** IDX-001, DEC-000 (next ADR-0052), GOV-009, RDM-001, P3-000.
- **Audit:** AUD-P3-003 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, RDM-001, P3-000 (LIVING). No Business, Product,
  Domain, or frozen Governance content changed.
