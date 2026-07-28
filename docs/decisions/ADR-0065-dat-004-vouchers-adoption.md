# ADR-0065 — DAT-004 Vouchers Adoption & Freeze

| Field | Value |
|---|---|
| ADR | 0065 |
| Title | DAT-004 Vouchers Adoption & Freeze |
| Phase | 4 (DDL Specification) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 4 checkpoint DC2 continues after DAT-002 (party anchors, ADR-0063) and DAT-003 (Programs &
Registrations, ADR-0064) froze. With Student (DB-001), Teacher (DB-002), Program (DB-022), the Revenue
Distribution Policy (DB-033), and Registration (DB-038) all specified, the next cluster is the authored
money-movement records — the **financial vouchers**. A Stage-1 Architectural Discovery fixed the scope
(one document for the whole voucher cluster, including the BC-008 center-only vouchers), resolved that
non-program revenue is folded into the Receipt entity via a revenue-source discriminator, and corrected
the Refund's anchoring to Student×Program only (DR-040 forbids receipt-matching).

**DAT-004 — Vouchers** (`docs/data/DAT-004_VOUCHERS.md`) specifies the five voucher entities as logical
Data Atoms under DAT-001's six-kind taxonomy and Authority Boundary. Its load-bearing atom is the
**immutable split snapshot** on the Receipt Voucher — a *computed* value that is a *stored fact* because a
frozen authority (DR-006) commands its persistence. It ran the full GOV-013 lifecycle: Discovery → Draft
→ Stage-3 Adversarial Self-Hardening → Constitutional Readiness Verification (4-lens Panel + independent
Readiness Judge).

## Decision

1. **Adopt DAT-004 — Vouchers** as **FROZEN v1.0.0** — the third Phase-4 entity-specification document,
   subordinate to DAT-001 and P4-000.
2. **What it fixes (65 Data Atoms, DB-053…DB-117; structure only, no new truth):**
   - **Shared voucher discipline** DB-053…DB-065 — whole-shekel amounts, method/status/number value-domains,
     the stored cancellation date/reason/actor (DB-057…DB-059), posted-on-save, immutability,
     numbering-generation, cancellation preservation & ordering, and append-only history.
   - **Receipt Voucher** DB-066…DB-081 — number/date/amount/method/Payer-Name/revenue-source, the
     **immutable Teacher/Center split snapshot** (DB-073/DB-074, DR-006) and its fixity (DB-081), identity,
     atomicity, split conservation, the revenue-source value-domain, and the revenue-source-conditioned
     structure (program-fee → split + Registration; non-program → Student + optional Program, no split).
   - **Payment Voucher** DB-082…DB-089 — **one entity, two kinds** {teacher payment, center expense}.
   - **Refund Voucher** DB-090…DB-098 — reversal of recognized revenue; **Student×Program only** (DR-040,
     no receipt-matching); refund–registration independence.
   - **Expense Return** DB-099…DB-105 and **Expense Category** DB-106…DB-109.
   - **Relationships** DB-110…DB-117 — Receipt(program-fee)→Registration; Receipt(non-program)→Student +
     Program; Payment(teacher)→Program (Teacher transitive via DB-049); Payment(expense)→Expense Category;
     Refund→Student + Program; Expense Return→center-expense Payment Voucher — each homed here.
   - **Authority Boundary applied:** every running balance (the three balances, teacher entitlement /
     outstanding / debt, party standing, registration collected-total, Student×Program net-paid, settlement
     readings, per-category totals) is **excluded** as derived — never stored on a voucher; all are
     specified as computations in **DAT-005**. The split *computation* and the *percentages* are consumed
     (not re-described); the overpayment ceiling (DB-044/045) is referenced, not re-declared.
3. **Review outcome:** Stage-3 hardening confirmed the non-program-as-Receipt-variant fold faithful and the
   Authority Boundary clean, repairing one Major (the cancellation metadata promoted to stored Attributes;
   a revenue-source value-domain Constraint added). The Readiness Verification returned **three lenses
   READY / READY-WITH-NITS and one NOT-READY** on two DV-1 citation orphans (DB-086, DB-108); the Judge
   returned **NOT-READY** conditioned on a two-line citation repair, which was applied (DR-030/DR-052 →
   DB-086; DR-051 → DB-108) and confirmed by a **0-orphan sweep**, with the DB-064 Nit reworded, before
   freeze.

## Consequences

- DAT-004 is FROZEN and is the authoritative logical specification of the five voucher entities and the
  immutable split snapshot; **DAT-005** (derived balances) reads the vouchers' effects. Amendments only via
  GOV-004 §5.
- **No** business/product/domain truth is introduced (DV-8); BC/DOM are consumed exactly as frozen; the
  DR-006 split snapshot is the paradigm case of *authority-mandated* persistence (DAT-001 §4).
- **Modeling precedents:** (a) a frozen-named-but-structure-delegated concept (non-program revenue) is
  folded into an existing entity via a mandatory discriminator when the frozen layer delegates the
  structure (BR-074 / DOM-002 §15a); (b) a cross-cutting voucher discipline is factored once as shared
  atoms; (c) a cancellation dependency that the frozen layer forbids to store as an allocation (DR-040/046)
  is modeled as an ordering Integrity rule, not a stored FK.
- Registers updated in this commit: IDX-001 (DAT-004 + ADR-0065 + AUD-P4-004), DEC-000 (next → ADR-0066),
  GOV-009 (counts + refresh + history row), RDM-001 (Phase-4 DC2 — DAT-004 frozen), P4-000 (document-map
  DAT-004 status), data/README.

## Notes

DAT-004 is the largest Phase-4 document to date (65 atoms) and the first to home a *computed-but-stored*
fact — the receipt split snapshot — cleanly on the authority-not-derivability line (DAT-001 §4). The one
NOT-READY was a pair of trivial citation orphans caught by the Traceability lens, underscoring the value of
the independent Readiness Verification even on an otherwise-clean draft. The next Phase-4 deliverable is
**DAT-005 (Derived Balances — the three balances, teacher entitlement/debt, party standing)**, pending a
separate Owner order.
