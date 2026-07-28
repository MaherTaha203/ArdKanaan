# AUD-P4-005 — DAT-005 Derived Balances Audit Report

| Field | Value |
|---|---|
| Doc ID | AUD-P4-005 |
| Title | DAT-005 Derived Balances Audit Report |
| Phase | 4 (DDL Specification) |
| Status | FROZEN |
| Version | 1.0.0 |
| Audits | DAT-005 (FROZEN v1.0.0, ADR-0066) |

---

## 1. Scope
Adoption audit for **DAT-005 — Derived Balances**, the fourth Phase-4 entity-specification document and the
*mirror* of the stored-fact documents: it specifies the quantities DAT-002/003/004 excluded as "store
nothing" (BC-007), and itself **stores nothing**. Authored and reviewed under **GOV-013**. Evidence that
DAT-005 satisfies the eight quality gates and is fit to freeze as v1.0.0.

## 2. Lifecycle evidence (GOV-013)
| Stage | Outcome |
|---|---|
| Stage 1 Architectural Discovery | fixed the modeling approach — derived Attributes anchored to frozen subjects (Training-Center singleton / Teacher×Program / Registration / Student×Program) + invariant Constraints/Integrity rules, storing nothing; resolved the teacher-debt derivability question (debt = derived per BR-046/DR-065; discharge record deferred per UNK-026) as **not** a blocker |
| Stage 2 Constitutional Draft | DB-118…DB-143 (10 derived Attributes, 14 Constraints, 2 Integrity rules; zero Entities/Relationships/Identities/stored Attributes) |
| Stage 3 Adversarial Self-Hardening | H2 derivation-bases CLEAN; H3 debt-derivability + deferred-discharge faithful; **Blocking** repaired — Center Net omitted non-program revenue (DB-120 + DR-081/§15a); **Major** — DR-018→DR-010/DR-009 balance-persistence citation; plus Teacher-Outstanding zero-floor (DB-122), refund-reversal conservation (DB-129), and citation-precision repairs |
| **Readiness Verification** | Panel: all four lenses READY-WITH-NITS; **Judge NOT-READY** on one Major — Teacher Payables (DB-119) written as a global-floored net that would offset a debt program against a payable one |
| Editorial touch-up | DB-119 corrected to the **sum of per-Teacher×Program individually-floored balances** (Σ max(0, DB-122)), honoring isolation (DR-031/DR-064/DR-066); four Nit/Minor tightenings (DB-120 kind discriminator, DB-139 DR-045/047, DB-136 wording, §2 Center-anchor rationale) |
| Owner Approval → Freeze v1.0.0 | this report |

## 3. Gate results
| # | Gate | Result | Evidence |
|---|---|---|---|
| 1 | Structure & identity | 🟢 | Canonical header; FROZEN v1.0.0; registered in IDX-001; atom numbering DB-118…DB-143 continuous (26 atoms, 0 gap / 0 dupe). |
| 2 | Traceability | 🟢 | All 26 atoms cite a frozen BR/PR/DR/INV or framework authority; **0 orphan** (DV-1), confirmed by sweep after the DR-018/DR-035 citation repairs. |
| 3 | Rule atomicity | 🟢 | Exactly three of the six kinds used: derived Attributes (DB-118…127), invariant Constraints (DB-128…141), Integrity rules (DB-142/143); no Entity/Relationship/Identity/stored Attribute created. |
| 4 | Design/data consistency | 🟢 | Every derivation basis aggregates the correct stored DAT-004 facts with the correct frozen ledger signs; Center Net includes non-program revenue without double-count (DB-080 disjointness); Teacher Payables floors per Teacher×Program before aggregation (isolation preserved). |
| 5 | Language / consistency | 🟢 | Citations resolve verbatim; the Major DB-119 defect and all Nits/Minors resolved by touch-up; the teacher-debt discharge record honestly left to its frozen "deferred design decision" status (UNK-026). |
| 6 | Ownership / layer separation | 🟢 | Logical only; no table/column/type/key/SQL/materialized-view; the split computation and (non-refund) percentages are consumed, not re-derived; balances reference frozen subjects, materializing nothing. |
| 7 | **Data-model integrity (focus)** | 🟢 | The Authority Boundary made concrete — **nothing is persisted** (DB-141); the Teacher×Program isolation, non-negativity, never-merged, conservation, non-advance, debt-bounded/non-expiry, posted-only, and full-derivability invariants are all homed (DB-128…143). |
| 8 | Registers / integrity | 🟢 | IDX/DEC/GOV-009/RDM + P4-000 + data/README updated in the freeze commit; mechanical verification clean (DR 1..91, ADR 1..66). |

## 4. Independent review summary
The Readiness Verification returned **all four Panel lenses READY-WITH-NITS** and confirmed the central
"stores nothing" property, the correct ledger signs, and the honest deferral of the teacher-debt repayment
record. The independent Judge returned **NOT-READY** on one Major promoted from a panel Minor: the Teacher
Payables aggregate (DB-119) was written as a single global-floored net — `max(0, Σ shares − Σ payments − Σ
refunds)` — which would net an over-paid (debt) program against a payable program, the exact cross-program
offset DR-066 forbids, contradicting DAT-005's own isolation invariant DB-132. It was corrected to the sum
of per-Teacher×Program individually-floored balances (Σ max(0, DB-122)); DB-118/DB-120 were re-verified as
center-level factual sums correctly needing no per-program floor. Four Nit/Minor items were folded into the
same revision.

## 5. Verdict
**DAT-005 COMPLETE and FROZEN at v1.0.0.** The derived-balance layer delivered; the Authority Boundary made
concrete (nothing persisted); DC2 (entities & attributes) and its derived companions complete through the
core financial model. All eight gates 🟢.
