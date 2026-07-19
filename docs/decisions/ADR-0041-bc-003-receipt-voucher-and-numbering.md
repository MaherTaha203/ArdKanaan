# ADR-0041 — BC-003 Receipt, Voucher & Numbering Rules Adopted; CDC/Coverage Conventions Finalized

| Field | Value |
|---|---|
| ADR | 0041 |
| Title | BC-003 Receipt, Voucher & Numbering Rules Adopted; CDC/Coverage Conventions Finalized |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Third business-rule document of Phase 2 under P2-000 (Checkpoint C2). BC-003 was authored
in the DRAFT → Review methodology answering exactly one question — *"How is money formally
recorded?"* — scope confirmed by the Owner, then revised (Revision-1: BR-035 reworded so
the rule owns *that* the effect arises at posting, not the calculation consumed from
BC-001; BR-037 = Immutability Principle and BR-040 = Lifecycle-only, each single
responsibility; Coverage Report gains the fixed line "Scope intentionally closed").
Approved on 2026-07-19. In the same order the Owner finalized two governance conventions.
Decision category (GOV-010 §5): Business (+ Governance for the conventions).

## Decision

1. Adopt **BC-003 — Receipt, Voucher & Numbering Rules** (FROZEN): **13 Business Rules**
   (BR-028…BR-040) in the mandated 13-field normal form across 10 categories (Receipt
   Voucher Identity, Purpose, Voucher Numbering, Dating, Ownership, Posting, Financial
   Effect of Posting, Receipt Atomicity, Immutability, Lifecycle); principles RP-11…RP-15;
   Business Invariants INV-11…INV-15; and a Cross-Document Consistency Review (§9). Every
   BR dual-cited under BC-000 Dual Authority — Authority of Truth (frozen Domain
   DR-006/017/019/023/025/026/043/044/090) + Authority of Constitutional Legitimacy (frozen
   PC-003/004/006/007/008).
2. **Finalize the CDC template in P2-000 §6** to the permanent **four-line form**:
   "Consumes only. No modification. No narrowing. No reinterpretation."
3. **Adopt the "Scope intentionally closed" coverage convention** (P2-000 §6): every BC
   document's Coverage Report ends with "Scope intentionally closed. No additional frozen
   Domain Rules belong to this document."

## Interpretation boundaries

- Business-layer only: BR-028…040 state business behavior; they create no UI, engineering,
  schema, API, algorithm, validation, or test artifact.
- **Separation of rule from calculation:** BC-003 governs *that* posting gives rise to the
  constitutionally-defined effects; the distribution *calculation* is consumed from BC-001
  (BR-011/BR-012), never re-described.
- BC-003 **consumes** BC-001 (distribution) and BC-002 (registration/installment/
  overpayment) with meaning intact — no modification, no narrowing, no reinterpretation
  (§9 CDC).
- The two conventions are governance mechanisms; they introduce no business rule.

## Consequences

- **New document:** BC-003 (FROZEN, `docs/business/`); Checkpoint C2 complete (BC-001/002/
  003); BC-004 next.
- **P2-000:** §6 CDC finalized to four lines + "Scope intentionally closed" convention;
  tracker → BC-003 FROZEN, BC-004 NEXT.
- **Registers:** IDX-001, DEC-000 (next ADR-0042), GOV-009, P2-000 tracker.
- **Audit:** AUD-P2-005 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P2-000 (LIVING). No domain, product, or
  frozen governance changed; BC-000/001/002 untouched (conventions recorded in the LIVING
  plan).
