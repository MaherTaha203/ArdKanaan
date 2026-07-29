# ADR-0068 — Phase 4 Closure: DDL Specification Complete & Frozen

| Field | Value |
|---|---|
| ADR | 0068 |
| Title | Phase 4 Closure — DDL Specification Complete & Frozen |
| Phase | 4 (→ 10) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 4 (DDL Specification), governed by **P4-000** under GOV-011/GOV-012 with review under GOV-013, has
delivered its framework and its complete entity-specification set. With **DAT-001…DAT-006 all FROZEN v1.0.0**
and the DB-atom sequence **DB-001…DB-159** complete, the logical data model is fully specified. The final
cross-document closure audit **AUD-P4-FINAL** returned **CLOSURE-READY** — all ten required verifications
(A–J) pass, mechanical verification is clean, and no unresolved Blocking or Major constitutional
contradiction remains. The Owner has authorized Phase 4 closure (Owner Engineering Order — Authorize Phase 4
Formal Closure). The cancelled Owner Discovery Interview has no authority and played no role.

## Decision

1. **Close Phase 4.** The logical data model — **DAT-001 (framework), DAT-002 (Party Entities), DAT-003
   (Programs & Registrations), DAT-004 (Vouchers), DAT-005 (Derived Balances), DAT-006 (Activity Timeline)**,
   all FROZEN v1.0.0 — is the single authoritative logical DDL specification for the product. **Amendments
   only via GOV-004 §5.** P4-000 remains the LIVING governing plan, now marked **CLOSED**.
2. **Checkpoints complete.** DC1 (framework) and DC2 (entities, attributes, identities, constraints,
   integrity rules, relationships, derived quantities, and the activity timeline) are delivered; DB-001…DB-159
   are contiguous with **0 gaps / 0 duplicates / 0 orphans**, and every atom is traceable to a frozen
   BR/PR/DR/invariant (DV-1). No DAT document introduces new Business/Product/Domain truth (DV-8); the
   Authority Boundary (DAT-001 §4) holds across DAT-002…DAT-006.
3. **Deferrals remain explicit.** The teacher-debt discharge record (UNK-026), statement/period presentation
   scope (UNK-013), non-program refundability / amount-due (UNK-029/030), and teacher-share deductions
   (UNK-021) remain explicit deferrals in the frozen layer; the data layer resolved none of them silently.
4. **The successor phase (Phase 10 — physical database / implementation) is NEXT — NOT opened here.** Per
   GOV-011 §2, it opens only on a **separate explicit Owner authorization**; this ADR begins no
   implementation, physical SQL/DDL, schema migration, or any successor phase.
5. **No constitutional change** is introduced by closure — it is an administrative declaration that the
   frozen logical data model is complete; no BC/PC/PLP/DOM/DR content and no substantive DAT content is
   modified.

## Consequences

- Phase 4 joins Phase 1 (Product), Phase 2 (Business), and Phase 3 (UX) as a closed, frozen constitution
  layer; the logical data model is the DDL analog of those constitutions, ready to govern Phase-10
  implementation.
- The documentation pipeline's next gate is **Phase 10 (physical DDL / implementation)**, pending Owner
  authorization.
- Registers updated in this commit: IDX-001 (Phase 4 → CLOSED; AUD-P4-FINAL + ADR-0068 registered),
  DECISION-LOG (next → ADR-0069), GOV-009 (Phase 4 CLOSED; counts + refresh + history row), ROADMAP (Phase 4
  → ✅ COMPLETE), P4-000 (status → CLOSED), docs/data/README.
- Audit: **AUD-P4-FINAL** (Phase 4 Closure Audit — CLOSURE-READY).

## Notes

Phase 4 delivered the complete logical data model over the frozen behavioral constitutions without inventing
a single new business rule — every one of the 159 Data Atoms consumes frozen truth. Each of the six DAT
documents ran the full GOV-013 lifecycle (Discovery → Draft → Stage-3 Adversarial Self-Hardening →
Constitutional Readiness Verification with an independent Panel + Judge), and the load-bearing modeling
decisions (Revenue-Distribution-Policy as an owned entity, non-program revenue as a Receipt variant, the
derived-balances "store nothing" mirror, and the Activity Timeline as a stored-but-never-a-second-source-of-
truth event log) were each resolved by tracing to a governing frozen authority rather than by reinterpretation.
Per-phase-closure convention (cf. ADR-0059) does not require a GOV-008 lesson entry; none is added.
