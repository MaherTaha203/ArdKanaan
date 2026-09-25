# Database Schema, Referential Integrity & Data Consistency Audit — ArdKanaan (أرض كنعان)

**Date:** 2026-09-25
**Type:** Investigative, **READ-ONLY**. No fixes, migrations, commits, PRs, or production changes were made.
**Method:** Every check runs against the **live PostgreSQL catalog** (`pg_catalog`/`pg_constraint`/`pg_index`/…),
never migration filenames. All write-behaviour probes (delete/update semantics, restore round-trip) were wrapped in
`BEGIN … ROLLBACK` on an **isolated** PostgreSQL 16 cluster (`akfix`) built from the full 54-migration chain plus the
corrective migration `20260925120000`. **Production was not touched and was not read.**

---

## 1. Executive Summary

**Overall verdict: PASS.** The schema is well-formed and defensively engineered. Every base table has a primary key,
every foreign key is validated, there are **zero orphan rows** (declarative *and* polymorphic), all financial records are
immutable at the database level, and the money reconciles across **three independent representations** (base tables,
append-only ledger, and the `financial_movements` view) to the same figure: **net centre balance = 430**.

No FAIL and no true WARNING were found. Six **INFO** observations are recorded — all are either by-design or pure
housekeeping, and all fall inside the financial firewall (they are noted, not actioned).

| # | Phase | Verdict |
|---|-------|---------|
| 1 | Catalog inventory | PASS |
| 2 | Primary keys | PASS |
| 3 | Foreign keys + actions | PASS |
| 4 | Orphan records (declarative + polymorphic) | PASS |
| 5 | NULLability | PASS |
| 6 | CHECK constraints | PASS |
| 7 | UNIQUE constraints | PASS |
| 8 | Financial cross-table consistency | PASS |
| 9 | Student data consistency | PASS (1 INFO) |
| 10 | Delete / update semantics | PASS |
| 11 | Temporal / status consistency | PASS |
| 12 | Duplicate logical records | PASS |
| 13 | Views | PASS |
| 14 | Triggers (integrity-relevant) | PASS |
| 15 | Sequence / identity | PASS (1 INFO) |
| 16 | Index / constraint interaction | PASS (3 INFO) |
| 17 | Restore structural integrity | PASS |
| 18 | Final reconciliation (3-way) | PASS |
| 19–21 | Assessment / unverified / verdict | See §6–§8 |

---

## 2. Inventory (Phase 1)

Catalog snapshot of schema `public`:

- **Base tables (11):** `students`, `courses`, `enrollments`, `fee_obligations`, `receipt_vouchers`,
  `receipt_allocations`, `payment_vouchers`, `financial_movement_ledger`, `audit_log`, `owner_identity`, `restore_log`.
- **Views (4):** `active_students`, `cancelled_vouchers`, `financial_movements`, `student_statement_lines`.
- **Sequences (2):** identity sequences for `receipt_vouchers.voucher_number`, `payment_vouchers.voucher_number`.
- **Enums (0), Domains (0).** Status/type values are modelled as `text` + CHECK (see §Constraint Coverage).
- **Extensions (2):** `pgcrypto`, `plpgsql`.
- **Functions (69)** (most application functions are `SECURITY DEFINER`; the rest are `pgcrypto`).
- **Triggers (26)** user triggers, **all enabled**.
- **Indexes (35).**

RLS is enabled on all data tables. `owner_identity` has RLS disabled — see INFO-6 (mitigated: no client GRANT).

---

## 3. Referential Integrity

### Primary keys (Phase 2)
Every one of the 11 base tables has a single-column `uuid` primary key. **No table lacks a PK.**

### Foreign keys (Phase 3)
10 foreign keys. `ON UPDATE` is `NO ACTION` on all; `ON DELETE` is `RESTRICT` on 9 and a single deliberate
`CASCADE` on `receipt_allocations.receipt_voucher_id → receipt_vouchers` (only reachable during restore, itself
mediated by the restore GUC and prevent-triggers). `financial_movement_ledger.reversal_of` is a self-referencing FK
(`RESTRICT`). The RESTRICT-heavy posture means no accidental cascading data loss is possible.

### Orphan report (Phase 4) — **ZERO orphans**
- All 10 declarative FKs: **0** orphan rows. All FKs are `VALIDATED` (none `NOT VALID`), so declarative orphans are
  structurally impossible.
- **Polymorphic references** (not FK-enforceable): `financial_movement_ledger (source_type, source_id)` →
  `receipt_vouchers`/`payment_vouchers`. Manually scanned: **0** orphans (`ledger→receipt` 0, `ledger→payment` 0).
  `source_type` domain is `{receipt, payment}` only.
- `receipt_allocations` is a clean discriminated union: 4 `course` rows all carry `enrollment_id` and no
  `fee_obligation_id`; 2 `fee` rows all carry `fee_obligation_id` and no `enrollment_id` — matching the
  `receipt_allocations_target_valid` CHECK.

---

## 4. Constraint Coverage

### NOT NULL (Phase 5)
All financial-critical columns are `NOT NULL`: monetary amounts, `external_share`, `source_type`, `source_id`,
`entry_kind`, `voucher_number`, `voucher_date`, and required `student_id` references. Nullable columns are all
legitimately optional (cancellation metadata, snapshots, optional identity fields, reversal linkage).

### CHECK (Phase 6) — 36 constraints
- **Whole-shekel** (`x = trunc(x)`) on every monetary column across all tables.
- **Non-negative / positive** amount guards everywhere.
- **External-share coherence**: `fee_obligations.category_valid` and `receipt_vouchers.fee_distribution_valid`
  enforce institute→0, external→full, shared→strictly-between, mixed (receipts only)→0…full;
  `receipt_allocations` forces `external_share = 0` on `course` allocations and `external_share ≤ amount` otherwise.
- **Status enums via CHECK**: `students.status ∈ {active,completed,archived}`, `courses.status ∈ {active,ended}`,
  `ledger.entry_kind ∈ {original,reversal}`, `ledger.source_type ∈ {receipt,payment}`,
  `receipt_allocations.allocation_type ∈ {course,fee}`.
- **Discriminated-union guard**: `receipt_allocations_target_valid` ties `allocation_type` to exactly one populated
  reference column.
- **Singleton guard**: `owner_identity.singleton = true` (+ unique index) → exactly one owner row.
- **Idempotency hash format**: `^[0-9a-f]{32}$`.

### UNIQUE (Phase 7 + Phase 16)
- 5 declared UNIQUE constraints: `courses.name`, `enrollments (student_id, course_name)`,
  `ledger (source_type, source_id, entry_kind)`, `receipt/payment .voucher_number`.
- 5 partial/expression unique indexes (correctly not expressible as table constraints):
  idempotency-key partials on both voucher tables, `owner_identity` singleton,
  `enrollments (student_id, course_id) WHERE course_id IS NOT NULL`,
  and `receipt_allocations` COALESCE-sentinel target-uniqueness.

---

## 5. Data Consistency

### Financial cross-table (Phase 8) & Final reconciliation (Phase 18)
- Every allocated receipt reconciles to its allocations (amount **and** external_share): 5/5.
- Each receipt has exactly one `original` ledger entry with matching amount/external; the single cancelled receipt
  (#4) additionally has exactly one `reversal`; reversal presence exactly matches cancellation state.
- No fee obligation and no enrollment is over-allocated.
- **Three-way reconciliation agrees exactly:**

  | Figure | Base tables | Ledger (orig−rev) | `financial_movements` view |
  |---|---|---|---|
  | Gross receipts (active) | 550 | 550 | 550 |
  | External share | 40 | 40 | 40 |
  | Payments (active) | 80 | 80 | 80 |
  | **Net centre balance** | **430** | **430** | **430** |

- **Whole-shekel invariant** holds in data across all 10 monetary columns (0 fractional values).

### Student data (Phase 9)
Status ↔ timestamp coherence holds (no `completed` without `completed_at`, no `archived` without `archived_at`, no
active carrying either). No blank receipt name-snapshots; every receipt references a live student. **INFO-1**:
`students.id_number` has no DB-level UNIQUE constraint (no duplicates present; disambiguation is by design in-app).

### Delete / update semantics (Phase 10) — all mutations blocked
Rolled-back probes confirmed every destructive path is refused by the intended mechanism:

| Attempt | Blocked by | SQLSTATE |
|---|---|---|
| delete referenced student / course | FK `RESTRICT` | 23503 |
| delete receipt voucher | `RECEIPT_DELETE_FORBIDDEN` | P0001 |
| delete / update allocation | `RECEIPT_ALLOCATION_IMMUTABLE` | P0001 |
| delete / update ledger row | `FINANCIAL_LEDGER_APPEND_ONLY` | P0001 |
| delete fee obligation | `FINANCIAL_OBLIGATION_DELETE_FORBIDDEN` | P0001 |
| delete enrollment | `ENROLLMENT_DELETE_FORBIDDEN` | P0001 |
| delete payment voucher | `PAYMENT_DELETE_FORBIDDEN` | P0001 |

### Temporal / status (Phase 11) & Duplicates (Phase 12)
All temporal orderings hold (`cancelled_at ≥ created_at`, `cancel_reason` paired with `cancelled_at`, reversal ≥
original, lifecycle stamps ≥ creation). **Zero** duplicate logical records across all 6 guarded keys.

---

## 6. Views, Triggers, Sequences, Restore

- **Views (Phase 13):** all 4 execute cleanly with coherent counts. `financial_movements` correctly shows only live
  originals (excludes reversed), `cancelled_vouchers` unions cancelled receipts+payments, `student_statement_lines`
  builds a running remaining-balance ledger. No broken dependencies.
- **Triggers (Phase 14):** 26 user triggers, **none disabled** (`tgenabled = 'O'`). Firewalls, append-only,
  prevent-delete, snapshot, ledger-recording, cancellation-ledger, restore-purge, audit, and `updated_at` triggers all
  active.
- **Sequence / identity (Phase 15):** `voucher_number` on both voucher tables is
  `GENERATED ALWAYS AS IDENTITY`. An explicit-value insert is correctly rejected (SQLSTATE `428C9`) unless
  `OVERRIDING SYSTEM VALUE` is used — and `restore_center_data` uses exactly that to preserve original voucher
  numbers, then resets each sequence to `max(voucher_number)+1`. Used voucher numbers are contiguous (no gaps).
  **INFO-4**: on the isolated cluster the receipt sequence read `last_value = 12618` vs `max used = 5` — a pure
  artifact of earlier rolled-back benchmark/negative tests (sequences are non-transactional); a restore normalises it
  to `max+1` (verified: receipt→6, payment→2). Not a production or schema concern.
- **Restore structural integrity (Phase 17):** rolled-back round-trip preserved every source-table count exactly,
  reconciled net centre = 430 on both base and ledger paths, produced **zero orphans**, **correctly rebuilt the
  reversal for the cancelled receipt** (1 original + 1 reversal), and reset the sequences to `max+1`. Post-rollback the
  seed is intact.

---

## 7. Findings (severity-ranked)

No FAIL. No WARNING. Six INFO notes (by-design or housekeeping; all inside the financial firewall):

| ID | Severity | Finding | Assessment |
|----|----------|---------|------------|
| INFO-1 | INFO | `students.id_number` has no UNIQUE constraint | By design — id_number is optional identity metadata; duplicate-name disambiguation is handled in-app (P1-6). No duplicates in data. Would only be a WARNING if the business rule required unique national IDs. |
| INFO-2 | INFO | Duplicate CHECK pairs: `course_value ≥ 0` declared twice on `enrollments` and `receipt_vouchers` (`_non_negative` + `_nonnegative`) | Redundant metadata from two migrations; harmless (identical predicate). |
| INFO-3 | INFO | Unindexed FK `financial_movement_ledger.reversal_of` | Append-only table; parent-side deletes are blocked; lookups are rare. Negligible. |
| INFO-4 | INFO | Isolated-cluster sequence gap (receipt seq 12618 vs max 5) | Rolled-back-benchmark artifact only. Restore resets to `max+1`. Not present/relevant in production. |
| INFO-5 | INFO | `financial_movement_ledger_source_idx (source_type, source_id)` is a prefix of the unique `(…, entry_kind)` index | Minor read redundancy; deliberate for the source-lookup path. |
| INFO-6 | INFO | `owner_identity` has RLS disabled | Mitigated: the table has **no GRANT** to any client role; it is reachable only through `SECURITY DEFINER` `is_owner()`. GRANT is the boundary, so RLS-off is not an exposure. |
| INFO-7 | INFO | Type-width mismatch: source amounts `numeric(12,2)`, ledger `numeric(14,2)` | Ledger domain is wider than source; no truncation risk. |

---

## 8. Unverified Items / Scope Caveats

1. **Production data was not read.** Data-consistency results (§5) are proven on the **seed dataset** in the isolated
   cluster (2 students, 5 receipts, 6 allocations, 1 payment, 7 ledger rows). The **schema/DDL** (tables, PKs, FKs,
   constraints, indexes, sequences, identity, triggers, views) is production-equivalent because it is built from the
   same migration chain, so all *structural/referential* conclusions apply to production. To certify *production data*
   consistency, the same read-only orphan/reconciliation/duplicate queries would need to run against production.
2. **Corrective migration `20260925120000` is present in the isolated cluster but NOT applied to production.** It only
   `CREATE OR REPLACE`s three function bodies (`restore_center_data`, `enforce_financial_firewall`,
   `enforce_payment_financial_firewall`) — no table/constraint/index DDL — so §2–§6 structural findings are unaffected
   by it. The **Phase 17 restore round-trip reflects the fixed restore**; current production restore of a non-empty
   backup would still hit the previously-reported F1 defect until that migration is applied.

---

## 9. Verdict

**PASS.** The ArdKanaan schema is structurally sound and referentially intact: complete PK coverage, validated FKs,
zero orphans (declarative and polymorphic), comprehensive CHECK/UNIQUE/NOT-NULL coverage, database-enforced
immutability of all financial records, correct identity/sequence handling, a restore path that preserves counts and
rebuilds the ledger (including reversals) while resetting sequences, and money that reconciles three independent ways to
430. The only observations are seven INFO-level, by-design/housekeeping notes, all within the financial firewall and
none requiring action.
