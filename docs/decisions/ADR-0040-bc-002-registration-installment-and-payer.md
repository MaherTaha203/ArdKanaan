# ADR-0040 — BC-002 Registration, Installment & Payer Rules Adopted; CDC Governance Added

| Field | Value |
|---|---|
| ADR | 0040 |
| Title | BC-002 Registration, Installment & Payer Rules Adopted; CDC Governance Added |
| Phase | 2 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Second business-rule document of Phase 2 under P2-000 (Checkpoint C2). BC-002 was authored
in the DRAFT → Review methodology answering exactly one question — *"How are
Registrations, Installments, and Payers governed as Business Rules?"* — scope confirmed by
the Owner, then revised (Revision-1: installments divide settlement not obligation;
BR-027 "new relationship" grounded in Domain truth; CDC third line "No reinterpretation").
Approved on 2026-07-19. In the same order the Owner adopted the **Cross-Document
Consistency Review (CDC)** governance mechanism (Option 1) — folded into this propagation,
no standalone ADR. Decision category (GOV-010 §5): Business (+ Governance for CDC).

## Decision

1. Adopt **BC-002 — Registration, Installment & Payer Rules** (FROZEN): **9 Business
   Rules** (BR-019…BR-027) in the mandated 13-field normal form across 7 categories
   (Registration Identity & Precedence, Registration–Program Link, Payer, Guardian,
   Installments, Overpayment Prevention, Registration Lifecycle); principles RP-6…RP-10;
   Business Invariants INV-7…INV-10; and the first **Cross-Document Consistency Review**
   (§9). Every BR dual-cited under BC-000 Dual Authority — Authority of Truth (frozen
   Domain DR-021/022/023/024/086/087/089) + Authority of Constitutional Legitimacy (frozen
   PC-003/004/005/006/007/008).
2. **Add the CDC governance clause to P2-000 §6** (LIVING): every BC document from BC-002
   onward ends with a Cross-Document Consistency Review answering (1) which BC rules it
   depends on and (2) whether it modifies, narrows, or reinterprets any prior BR; expected
   answer **"Consumes only. No modification. No reinterpretation."**; any exception is an
   Amendment (GOV-004 §5; BC-000 §BCG-3), not a new document.

## Interpretation boundaries

- Business-layer only: BR-019…027 state business behavior; they create no UI, engineering,
  schema, API, algorithm, validation, or test artifact.
- BC-002 **consumes** BC-001 pricing (Final Registration Price, price-lock) with meaning
  intact — no modification, no narrowing, no reinterpretation (§9 CDC).
- Installments divide **settlement**, never the single indivisible obligation; a "new
  registration" is defined by the Domain criterion (DR-087 + DR-071), not by wording.
- CDC is a governance mechanism against semantic drift; it introduces no business rule.

## Consequences

- **New document:** BC-002 (FROZEN, `docs/business/`); Checkpoint C2 continues (BC-003
  next).
- **P2-000:** §6 gains the CDC clause; tracker → BC-002 FROZEN, BC-003 NEXT.
- **Registers:** IDX-001, DEC-000 (next ADR-0041), GOV-009, P2-000 tracker.
- **Audit:** AUD-P2-004 — eight gates PASS.
- **Blast radius:** IDX-001, DEC-000, GOV-009, P2-000 (LIVING). No domain, product, or
  frozen governance changed; BC-000 and BC-001 untouched (CDC recorded in the LIVING plan,
  not by amending frozen BC-000).
