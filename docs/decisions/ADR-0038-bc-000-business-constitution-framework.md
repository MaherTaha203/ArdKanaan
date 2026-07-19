# ADR-0038 — BC-000 Business Constitution Framework Adopted

| Field | Value |
|---|---|
| ADR | 0038 |
| Title | BC-000 Business Constitution Framework Adopted |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

First Phase-2 document under P2-000 (Checkpoint C1). BC-000 was authored as a DRAFT
answering exactly one question — *"What is the constitutional responsibility of the
Business Constitution layer?"* — presented for review, and revised twice: Revision-1
(remove the governance-reconciliation note; adopt the **Dual Authority** doctrine;
reposition BC-000 as a document within Phase 2 under P2-000) and a final naming edit
(**Authority of Admissibility → Authority of Constitutional Legitimacy**). Approved on
2026-07-19. Decision category (GOV-010 §5): Business (framework/governance of the
layer).

## Decision

Adopt **BC-000 — Business Constitution Framework** (FROZEN). It defines only the
architectural contract for Phase 2 — scope, responsibility, boundaries, derivation,
governance, principles, integrity, and completion — and **no** business rule. Key
constitutional content:

- **§4.0 Dual Authority Doctrine** — a Business Rule is valid only when it satisfies
  **both** the **Authority of Truth** (the frozen Domain — a rule's substance) and the
  **Authority of Constitutional Legitimacy** (the frozen Product Constitution — a
  rule's boundary) simultaneously.
- **Layer boundaries** BB-1…BB-4; **derivation rules** BCD-1…BCD-5; **governance
  rules** BCG-1…BCG-6 (incl. BR-NNN / BC-NNN numbering); **principles** BCP-1…BCP-9
  (BCP-9 = Dual Authority); **integrity rules** BCI-1…BCI-5; **completion rules**
  BX-1…BX-6.

## Interpretation boundaries

- Business-layer framework only: BC-000 owns *how the layer is governed*, not any
  business behavior; every future BR is authored under it.
- Consistent with GOV-012: the Authority of Truth preserves the Business ▷ Product
  ordering (domain truth constrains lower layers); the Authority of Constitutional
  Legitimacy is the governance subordination the Product Constitution imposes on
  Phase-2 document authoring — the two are distinct axes, not a layer inversion.
- BC-000 is the framework every BC-001…BC-008 document and every BR must satisfy.

## Consequences

- **New document:** BC-000 (FROZEN, `docs/business/`); **Checkpoint C1 complete.**
- **P2-000 tracker:** BC-000 → FROZEN.
- **Registers:** IDX-001, DEC-000 (next ADR-0039), GOV-009, P2-000 tracker.
- **Audit:** AUD-P2-002 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P2-000 (LIVING). No domain, product, or
  frozen governance changed.
