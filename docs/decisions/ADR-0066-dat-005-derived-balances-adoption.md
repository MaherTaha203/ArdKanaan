# ADR-0066 — DAT-005 Derived Balances Adoption & Freeze

| Field | Value |
|---|---|
| ADR | 0066 |
| Title | DAT-005 Derived Balances Adoption & Freeze |
| Phase | 4 (DDL Specification) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 4 checkpoint DC2 continues after DAT-004 (vouchers, ADR-0065) froze. The remaining core financial
cluster is the one every prior document deliberately **excluded** as "store nothing" (BC-007): the running
balances, teacher entitlement/outstanding/debt, and party financial standing. A Stage-1 Architectural
Discovery fixed how these are modeled without violating the Authority Boundary, and confirmed that the
teacher-debt derivation is faithful without reopening any frozen document.

**DAT-005 — Derived Balances** (`docs/data/DAT-005_DERIVED_BALANCES.md`) specifies the derivation basis of
every frozen derived financial quantity over DAT-004's stored voucher facts, plus their invariants — a
*mirror* of the stored-fact documents that **itself stores nothing**. It ran the full GOV-013 lifecycle:
Discovery → Draft → Stage-3 Adversarial Self-Hardening → Constitutional Readiness Verification (4-lens
Panel + independent Readiness Judge).

## Decision

1. **Adopt DAT-005 — Derived Balances** as **FROZEN v1.0.0** — the fourth Phase-4 entity-specification
   document, subordinate to DAT-001 and P4-000.
2. **What it fixes (26 Data Atoms, DB-118…DB-143; derivation & invariants only, storing nothing):**
   - **Derived Attributes** (class `derived`, DB-118…DB-127): the three balances — Cash (DB-118), Teacher
     Payables (DB-119), Center Net (DB-120); Total Teacher Entitlement (DB-121), Teacher Outstanding
     (DB-122), Teacher Debt (DB-123), settlement-lifecycle reading (DB-124), all per Teacher×Program;
     Registration Collected-Total (DB-125) and Outstanding (DB-126); Student×Program Net-Paid (DB-127).
   - **Invariant Constraints** (DB-128…DB-141): three-balances-never-merged, value conservation (receipt
     split + refund reversal), non-negativity floors, **Teacher×Program isolation**, Outstanding
     non-advance, Teacher-Debt bounded/closed, registration ceiling honored, refund ceiling, posted-only
     scope, full-derivability, and Authority-Boundary conformance (stores nothing).
   - **Integrity rules** (DB-142/DB-143): Teacher-Debt non-expiry; read-only revelation — Party Financial
     Standing and the Account Statement are **views, not entities** (DOM-002 §10), assembled without
     re-declaring their values.
   - **Modeling stance:** DAT-005 creates **no Entity/Relationship/Identity/stored Attribute**; each
     derived Attribute anchors to an already-frozen subject (the Training-Center domain singleton, DOM-002
     §1 — referenced, never materialized; Teacher×Program; Registration; Student×Program). A stored balance
     would be a forbidden second source of truth (DR-010/DR-009).
   - **Teacher Debt is derived per its frozen definition** — `max(0, Total Teacher Settlements − Final
     Teacher Entitlement)` (BC-004 BR-046 / DR-065) — with **no per-payment discriminator** (the sign
     partitions Outstanding vs Debt); the direct-repayment discharge *record* is honestly left to its frozen
     "deferred design decision" status (UNK-026), not invented.
3. **Review outcome:** Stage-3 hardening confirmed every derivation basis sound (H2 CLEAN) and the
   debt-derivability faithful (H3), repairing one Blocking omission (Center Net missing non-program revenue)
   and citation defects. The Readiness Verification returned **all four Panel lenses READY-WITH-NITS**; the
   independent **Judge returned NOT-READY** on one Major — Teacher Payables written as a global-floored net
   that would offset a debt program against a payable one — corrected before freeze to the sum of
   per-Teacher×Program individually-floored balances (Σ max(0, DB-122)), honoring isolation
   (DR-031/DR-064/DR-066); four Nit/Minor tightenings were folded in.

## Consequences

- DAT-005 is FROZEN and is the authoritative logical specification of how every derived financial quantity
  is computed from the stored model — **persisting nothing**. Amendments only via GOV-004 §5.
- **No** business/product/domain truth is introduced (DV-8); every quantity is one BC-004/006/007 already
  establishes, re-expressed as a derivation basis + invariant. The teacher-debt discharge record remains the
  deferred design decision the domain already declared (UNK-026).
- **Modeling precedents:** (a) a "store-nothing" document is expressed entirely as derived Attributes +
  invariant Constraints/Integrity rules, anchored to frozen subjects, creating no Entity; (b) an aggregate
  over isolated Teacher×Program balances must floor **per program before summation** to preserve isolation
  (DR-066) — never a global net.
- Registers updated in this commit: IDX-001 (DAT-005 + ADR-0066 + AUD-P4-005), DEC-000 (next → ADR-0067),
  GOV-009 (counts + refresh + history row), RDM-001 (Phase-4 DC2 — DAT-005 frozen), P4-000 (document-map
  DAT-005 status), data/README.

## Notes

DAT-005 is the "mirror" document — the concrete expression of DAT-001 §4's Authority Boundary, specifying
the quantities the constitution names as *may never be persisted*. Its single NOT-READY was a genuine
isolation bug (a global-floored Teacher Payables) that the independent Judge promoted from a panel Minor to
a Major — a clear win for the adversarial Readiness Gate. The next Phase-4 deliverable is **DAT-006
(Activity Timeline)**, pending a separate Owner order.
