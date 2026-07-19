# ADR-0033 — PC-006 Product Language & Glossary Adopted

| Field | Value |
|---|---|
| ADR | 0033 |
| Title | PC-006 Product Language & Glossary Adopted |
| Phase | 1 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Sixth Phase-1 document under P1-000 (Checkpoint C2). Authored under the phase
constraints (product terminology only; 1:1 with PC-003/DOM-002; no UI copy/RTL — those
are Phase 3; no invented terms), presented as a DRAFT, revised as Revision-1, and
approved on 2026-07-18. Decision category (GOV-010 §5): Product.

## Decision

Adopt **PC-006 — Product Language & Glossary** (FROZEN): the product naming authority —
25 canonical terms (each with a one-line meaning, banned synonyms, a "why banned"
reason, and a source), a cross-cutting global-banned-terms table, four naming rules,
and the Glossary Governance rules.

Revision-1 changes (Owner-directed) incorporated:
1. Added **§3 Glossary Governance** (GG-1…GG-4).
2. Replaced NR-3 with the constitutional **Canonical Product Term vs aliases** rule
   (Arabic/business/localized names are communication aliases only, never additional
   canonical terms; Product terminology, not UI).
3. Added the **"Why banned"** column to the glossary (explains the terminology
   violation, not merely the replacement).

## Interpretation boundaries

- Product-layer only: PC-006 fixes vocabulary; UI copy/RTL are Phase-3 (ADR-0005 §3).
- 1:1 with PC-003/DOM-002; no concept renamed, no term invented; frozen rules cited.

## Consequences

- **New document:** PC-006 (FROZEN, `docs/product/`).
- **P1-000 tracker:** PC-006 → FROZEN.
- **Registers:** IDX-001, DEC-000 (next ADR-0034), GOV-009, P1-000 tracker.
- **Audit:** AUD-P1-007 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P1-000 (LIVING). No domain or frozen
  governance changed.
