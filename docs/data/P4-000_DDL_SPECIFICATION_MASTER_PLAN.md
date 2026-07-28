# P4-000 — DDL Specification Master Plan

| Field | Value |
|---|---|
| Doc ID | P4-000 |
| Title | DDL Specification Master Plan |
| Phase | 4 (DDL Specification) |
| Status | LIVING |
| Version | 1.1.0 |
| Depends on | GOV-011 (§Phase 4 — the only legal phase spec); GOV-012 (layer ownership); GOV-003 (gates); GOV-004 (review); GOV-006 (traceability); GOV-013 (review protocol); BC-000…BC-009 (frozen & locked); PC-001…PC-008 + PLP-001 (frozen); UX-001…UX-006 (frozen); DOM-001…005 + DR-001…090 (frozen) |
| Answers | "How is Phase 4 — the specification of the product's complete data model — scoped, structured, governed, and closed?" |
| Governed by | GOV-011 §2 (phase-entry law) · GOV-013 (Multi-Agent Review Protocol) |

---

> **Nature of this document.** P4-000 is the **LIVING governing plan** of Phase 4 — the DDL analog of
> P2-000 / P3-000. It fixes what Phase 4 *is*, the documents it produces, the principles every one of
> them obeys, and the closure conditions — **without** specifying a single table, column, or SQL
> statement. Phase 4 documents the data model as **specification**, never as executable DDL.

## 1. Constitutional position

Phase 4 sits **below** the three frozen constitutions and **above** implementation:

```
Business (BC-000…009) ─┐
Product  (PC + PLP-001)├─ consumed as frozen ──► Phase 4: DDL Specification (DAT-NNN / DB atoms)
Domain   (DOM/DR)      ┘                                   │ consumed, never modified
UX       (UX-001…006) ─ (informs Screen/Component phases)  ▼
                                              Phase 10 Database (executable DDL, later)
```

Phase 4 **documents** the data model that already-frozen truth requires; it **implements nothing**.
Per GOV-012, a stored data structure is the representation of a Business/Product truth — Phase 4
records that representation as specification. It **consumes BC/PC/PLP/DOM exactly as frozen and
modifies nothing upstream** (CDC).

## 2. Mission & the one question

> **Document the product's complete data model as specification — entities, attributes, keys,
> constraints, integrity rules — such that every frozen Business Rule is representable, with no
> schema element lacking an upstream citation and no executable SQL.**

## 3. Governing principles (Phase-4 law — each testable at freeze)

- **P4-1 — Specification, never SQL.** Phase 4 produces *documents*, not executable DDL. No
  `CREATE TABLE`, no dialect, no engine, no migration. (GOV-011 §Phase 4.)
- **P4-2 — Upstream-cited or it does not exist.** Every **DB atom** (entity, attribute, key,
  constraint, integrity rule) **cites** the frozen authority it represents — a Business Rule (BR),
  Product Requirement (PR), or Domain Rule (DR). No schema element without a citation (GOV-006).
- **P4-3 — Representational completeness.** Every frozen Business Rule must be **representable** in
  the documented model; the three balances, the stored receipt splits (immutable), and the
  append-only activity timeline must all be expressible (GOV-011 success criteria).
- **P4-4 — No new truth.** Phase 4 introduces **no** Business Rule, Product decision, or Domain fact,
  and **redefines none**. It records structure for existing truth (UXV-01 analog: representational
  non-creation).
- **P4-5 — Intentional simplicity.** One owner, one training center, one database (PA-2). No
  multi-tenancy, no ERP schema, no partitioning/sharding/roles — the model is as small as the frozen
  constitutions require and no larger.
- **P4-6 — Technology-neutral.** The specification names no RDBMS, ORM, type dialect, index engine, or
  storage technology; it fixes *what must be stored and constrained*, not *how it is built*.

## 4. Document map *(indicative — refined per Architectural Discovery under GOV-013)*

| Doc | Working title | Responsibility |
|---|---|---|
| **P4-000** | DDL Specification Master Plan | this governing plan (LIVING) |
| **DAT-001** | Data Model Constitution | **FROZEN v1.0.0 (ADR-0061)** — the framework: six-kind DB-atom taxonomy, the Authority Boundary (what may become persisted truth), and technology-neutral logical representation (the DDL analog of BC-000) |
| **DAT-002** | Party Entities (Student & Teacher) | **FROZEN v1.0.0 (ADR-0063)** — the two anchor party entities and their attribute/identity/constraint/integrity atoms (DB-001…DB-021) |
| **DAT-003…00N** | Entity & attribute specifications | the remaining entities, their attributes, keys, and relationships — one coherent family per frozen concept cluster (programs/registrations, vouchers, balances[derived], activity timeline) |
| **DAT-00N** | Constraints & integrity rules | keys, uniqueness, referential integrity, immutability, append-only, derived-vs-stored discipline |
| **DAT-final** | DDL Traceability Matrix & Coverage (sink) | proof: every DB atom → its BR/PR/DR; every representation-requiring frozen rule → its DB atom; 0 orphan / 0 gap (the DDL analog of BC-009 / UX-006) |

*(Exact document count and boundaries are fixed by a Stage-1 Architectural Discovery before drafting,
per GOV-013 — the plan does not pre-commit the decomposition.)*

## 5. Checkpoints

- **DC1** — Framework: DAT-001 (DB-atom taxonomy & discipline). ✅ **COMPLETE** (DAT-001 FROZEN v1.0.0, ADR-0061 / AUD-P4-001).
- **DC2** — Entities & attributes: the core data structures.
- **DC3** — Constraints & integrity: keys, referential integrity, immutability/append-only, the
  stored-vs-derived line (three balances **derived**; receipt splits **stored & immutable**).
- **DC4** — Traceability + phase audit: the DDL sink (proof precedes authorization).

## 6. Governance & review

- **Review under GOV-013** — every Phase-4 constitutional document runs the Multi-Agent Review
  Protocol lifecycle (Discovery → Draft → Self-Hardening → Revision → Readiness Verification → Gate →
  Owner Approval → Propagation → Freeze).
- **Eight quality gates (GOV-003)** — Gate 7 (data-model integrity) in focus; a phase-closure audit
  (`docs/audits/phase-4/`) and **AUD-P4-FINAL** on closure.
- **Proof precedes Authorization** — the DDL sink demonstrates coverage; a *separate* Owner order
  closes Phase 4.

## 7. Dependencies & boundaries

- **Consumes (as frozen, modifies nothing):** BC-000…BC-009; PC-001…PC-008 + PLP-001; DOM/DR;
  UX-001…UX-006; GOV-011/012/003/004/006/013.
- **Produces:** DAT-NNN specification documents carrying **DB-NNN** atoms + the DDL traceability sink.
- **Out of scope (Phase 10 / other phases):** executable DDL and database implementation (Phase 10);
  component contracts (Phase 5); screen blueprints (Phase 6); any RDBMS/ORM/technology choice; any new
  business/product/domain truth.

## 8. Phase-entry record (GOV-011 §2)

Entry conditions **met**: Phases 1, 2, 3 are FROZEN & CLOSED (Product / Business / UX constitutions);
all eight gates passed for each; explicit **Owner authorization** to proceed to Phase 4 granted. On
adoption, `docs/data/` and `docs/audits/phase-4/` open, and P4-000 becomes the LIVING governing plan.

---

*LIVING (v1.1.0, ADR-0060; refreshed ADR-0061). The DDL Specification Master Plan — the governing plan
of Phase 4, subordinate to GOV-011. It introduces no data structure itself; it governs the DAT-NNN
documents (DB atoms) that will, and the DDL traceability sink that proves them. No executable SQL, in
this document or the phase it plans. Updated as Phase-4 checkpoints open and close (GOV-005) — v1.1.0
records DC1 COMPLETE (DAT-001 FROZEN), corrects the DAT-001 working title to "Data Model Constitution",
and names the database phase "Phase 10" throughout.*
