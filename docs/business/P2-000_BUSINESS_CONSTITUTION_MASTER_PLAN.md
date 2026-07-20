# P2-000 — Business Constitution Master Plan

| Field | Value |
|---|---|
| Doc ID | P2-000 |
| Title | Business Constitution Master Plan |
| Phase | 2 (Business Constitution) |
| Status | LIVING (governing plan for the phase; subordinate to GOV-011) |
| Version | 1.0.0 |
| Depends on | PC-001…PC-008 (frozen); DOM-001…005 + DR-001…090 (frozen, Phase 1A); GOV-011, GOV-012, GOV-003, GOV-004, GOV-006, GOV-010 |
| Answers | "How is Phase 2 (Business Constitution) structured, sequenced, and governed?" |

---

## 1. Status & lineage

This is the governing roadmap for the entire Business Constitution phase, opened under
the universal phase-entry law (GOV-011 §2: Phase 1 frozen ✓, all gates passed ✓,
explicit Owner authorization ✓ — ADR-0037). **GOV-012 is the sole official reference**
for the ownership of any new decision in this phase; every classification below derives
from it. Phase 2 builds on the frozen Domain (Phase 1A) and the frozen Product
Constitution (Phase 1) and introduces **no** new domain truth and **no**
product / UX / engineering decision.

## 2. Why the Business Constitution exists

Domain Discovery froze *"what is true about the business"* (F/DR/M). The Product
Constitution froze *"what the product is and is not"* (PA/PP/MMI/SC/AX/PR/AC). Phase 2
converts that frozen truth into a governed, atomic, testable body of **Business Rules
(BR-NNN)** — the exact behavior of distribution, entitlement, vouchers, refunds,
corrections, balances, revenue, expense, and lifecycles — that later phases implement
without re-interpreting the business.

## 3. Constitutional Position

Phase 2 does not redefine the Product Constitution.

Phase 2 operationalizes the Business behavior permitted by the Product Constitution and
grounded in the frozen Domain.

Its authority is therefore constitutional, not implementation-oriented.

## 4. Ownership authority

GOV-012. Every BR is a **Business**-layer atom (GOV-012 Product Stack, row *Business* —
"what is true about the domain, with or without software"). UX / Visual / Engineering /
Data / Testing content is out of scope and deferred to its owning layer.

## 5. Document set (planned — refined per Owner order as authoring proceeds)

| Doc | Title | Question it answers | Owner (GOV-012) |
|---|---|---|---|
| **BC-000** | Business Constitution Framework | What is the constitutional responsibility of this layer? | Business (governance of the layer) |
| BC-001 | Programs, Pricing & Distribution Policy Rules | How are programs priced and splits fixed? | Business |
| BC-002 | Registration, Installment & Payer Rules | How are registrations, payers, and installments governed? | Business |
| BC-003 | Receipt, Voucher & Numbering Rules | How are money-in events recorded and numbered? | Business |
| BC-004 | Teacher Entitlement & Debt Rules | When does entitlement arise, what changes it, how is debt defined? | Business |
| BC-005 | Refund & Adjustment Rules | How are refunds and adjustments governed (additive)? | Business |
| BC-006 | Teacher Payment & Settlement Rules | How is a teacher paid and a debt settled? | Business |
| BC-007 | Balances & Party Financial Standing Rules | How are the three balances derived and never merged? | Business |
| BC-008 | Non-Program Revenue, Expense & Lifecycle Rules | How are center-only revenue/expense and statuses governed? | Business |
| BC-009 | Phase 2 Traceability Matrix & Coverage | Is every in-scope DR covered by ≥1 BR, every BR grounded? | Business (reflective of BR; L11) |

All BR live in one continuous **BR-NNN** series across BC-001…BC-008; BC-009 proves
coverage. The document set mirrors the Phase-1 rhythm — plan (P2-000) → framework
(BC-000) → specialized documents (BC-001…) → audits (AUD-P2-NNN) → decisions (ADR).

> **Sequence revision (ADR-0042, Option A).** BC-004 is narrowed to **Entitlement & Debt**;
> a dedicated **BC-006 Teacher Payment & Settlement Rules** now holds all settlement, which
> pushed the former BC-006/007/008 down one place (see the renumbering table in ADR-0042).
> The governing constitutional principle: **Entitlement creates a right; Settlement
> discharges a right** — two phases, never merged in one document.

## 6. Governance

- **Approval flow:** each BC document authored as DRAFT → Owner review → approval →
  propagation (GOV-010, category *Business*) → FROZEN.
- **Constitutional bound:** every BR obeys BC-000 (Dual Authority §4.0; Integrity Rules
  BCI-1…5). No BR contradicts a DR, a PR, or another BR.
- **Cross-Document Consistency Review (CDC) — mandatory from BC-002.** Every BC document
  from BC-002 onward SHALL end with a *Cross-Document Consistency Review* answering
  exactly two questions: (1) which existing BC rules it depends on; (2) whether it
  modifies, narrows, or reinterprets any previous BR. The permanent expected answer is the
  **four-line form**: **"Consumes only. No modification. No narrowing. No
  reinterpretation."** Any need to modify, narrow, or reinterpret a prior BR is a signal
  for an **Amendment** (GOV-004 §5; BC-000 §BCG-3), never a plain new document. CDC
  introduces no business rule; it is a governance mechanism against semantic drift.
- **Coverage closure convention — mandatory from BC-003.** Every BC document's Coverage
  Report SHALL end with the fixed line **"Scope intentionally closed. No additional frozen
  Domain Rules belong to this document."** — making each document's boundary explicit for
  future review. This is a governance convention, not a business rule.
- **Versioning:** semantic (ADR-0003); DRAFT until first freeze; amendments via
  GOV-004 §5.
- **Traceability:** every BR cites upstream (F/DR/M **and** governing PR/PC clause) and
  is carried in the BC-009 matrix (GOV-006).

## 7. Sequence, dependencies & checkpoints

`BC-000 → {BC-001 → BC-002 → BC-003} → {BC-004 → BC-005 → BC-006} → {BC-007 → BC-008} → BC-009`
(acyclic; BR-NNN accretes; the matrix is the sink).

- **C1 — Framework:** BC-000.
- **C2 — Money-in:** BC-001, BC-002, BC-003.
- **C3 — Entitlement, Adjustment & Settlement:** BC-004, BC-005, BC-006.
- **C4 — Standing & periphery:** BC-007, BC-008.
- **C5 — Traceability + phase audit:** BC-009.

## 8. Freeze criterion

Phase 2 closes only when BC-000 §8 completion rules **BX-1…BX-6** all hold: all BC
documents FROZEN; every in-scope DR/WF covered by ≥1 BR; zero orphan BR; no
contradiction; a complete matrix; a closure audit with eight gates PASS; and Phase 3
(UX) can begin with no further business interpretation.

## 9. Progress tracker (LIVING)

| Doc | Status |
|---|---|
| P2-000 | ADOPTED (this document — opens Phase 2, ADR-0037) |
| BC-000 Business Constitution Framework | **FROZEN** (2026-07-19, ADR-0038 / AUD-P2-002) — Dual Authority §4.0; BB/BCD/BCG/BCP/BCI/BX. **Checkpoint C1 COMPLETE.** |
| BC-001 Programs, Pricing & Distribution Policy Rules | **FROZEN** (2026-07-19, ADR-0039 / AUD-P2-003) — BR-001…BR-018 (11 categories); RP-1…5; §8 Business Invariants INV-1…6. **Checkpoint C2 OPEN.** |
| BC-002 Registration, Installment & Payer Rules | **FROZEN** (2026-07-19, ADR-0040 / AUD-P2-004) — BR-019…BR-027 (7 categories); RP-6…10; INV-7…10; first CDC section (§9). |
| BC-003 Receipt, Voucher & Numbering Rules | **FROZEN** (2026-07-19, ADR-0041 / AUD-P2-005) — BR-028…BR-040 (10 categories); RP-11…15; INV-11…15; four-line CDC + "Scope intentionally closed" conventions finalized. |
| BC-004 Teacher Entitlement & Debt Rules | **FROZEN** (2026-07-19, ADR-0042 / AUD-P2-006) — BR-041…BR-048 (5 categories); RP-16…20; INV-16…20; Constitutional Boundary (entitlement only, never authorizes payment). |
| BC-005 Refund & Adjustment Rules | **FROZEN** (2026-07-19, ADR-0043 / AUD-P2-007) — BR-049…BR-057 (9 categories); RP-21…25; INV-21…25; Constitutional Boundary (refund/adjustment only, never authorizes settlement). |
| BC-006 Teacher Payment & Settlement Rules | **FROZEN** (2026-07-19, ADR-0044 / AUD-P2-008) — BR-058…BR-066 (6 categories); RP-26…30; INV-26…30; Settlement definition; four-filter review PASS. **Checkpoint C3 COMPLETE.** |
| BC-007 Balances & Party Financial Standing Rules | **FROZEN** (2026-07-19, ADR-0045 / AUD-P2-009) — BR-067…BR-073 (7 categories); RP-31…35; INV-31…35; Observation definition; self-contained (no forward dependency); four-filter review PASS. First Observation-layer document. |
| BC-008 Non-Program Revenue, Expense & Lifecycle Rules | **FROZEN** (2026-07-20, ADR-0046 / AUD-P2-010) — BR-074…BR-087 (7 categories); RP-36…40; INV-36…40; Creation-layer (creates center-only facts; lifecycle governed within that frame); Principle #1 + Constitutional Boundary; no forward dependency. **Checkpoint C4 COMPLETE.** |
| BC-009 Phase 2 Traceability Matrix & Coverage | NEXT (Checkpoint C5) — pending explicit Owner order |
