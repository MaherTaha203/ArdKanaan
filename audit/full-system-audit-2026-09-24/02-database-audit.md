# 02 — Database Schema Audit

**Phase 3.** **Method:** static reading of all 53 migrations (`app/supabase/migrations/`,
2026-08-29 → 2026-09-19) + frozen data constitution `DAT-001..006` / `P4-000`. **The live
DB was not queried** (see "could not verify" list).

**Headline:** Money is stored correctly as `numeric(12,2)` (ledger `numeric(14,2)`) —
**no `float`/`double`/`real`/`money` type for any amount** (full-tree sweep). All system
timestamps are `timestamptz`; business dates are `date`. Writes are RPC-only, the ledger is
append-only, and immutability/delete-block triggers are pervasive. **No P0/P1
money-corruption was found statically.** The material items are DB-001 (fractional
`external_share`), DB-002 (restore vs standalone-fee contradiction), and DB-008
(implemented schema is a smaller MVP than the frozen constitution).

## Schema map (compact) — 11 base tables, RLS on all except `owner_identity`

| Table | Money cols (type) | Identity/PK | Key CHECKs | FKs (on delete) |
|---|---|---|---|---|
| students | — | id uuid; status default 'active' | `status ∈ {active,completed,archived}` | — |
| receipt_vouchers | course_value, amount_received, external_share `num(12,2)` | id; `voucher_number bigint IDENTITY UNIQUE` | amount>0; course_value≥0; amount/value `=trunc()`; external_share nonneg/≤amount (**whole-shekel DROPPED**); fee_distribution_valid; fee_requires_allocation_mode; idempotency hash | student_id→students **RESTRICT** |
| payment_vouchers | amount `num(12,2)` | id; voucher_number IDENTITY | amount>0 & `=trunc()`; expense_type free text (no Expense Category entity) | — |
| enrollments | course_value `num(12,2)` | id | course_value≥0 & `=trunc()` | student_id, course_id→**RESTRICT** |
| courses | base_fee `num(12,2)` **NULL** | id; name UNIQUE | status∈{active,ended}; base_fee null or (≥0 & trunc) | — |
| fee_obligations | amount, external_share `num(12,2)` | id | amount>0 & trunc; external_share whole & ≤amount; category∈{institute,external,shared} | student/course/enrollment→RESTRICT (enrollment_id & course_name **nullable** since 20260919130000) |
| receipt_allocations | amount, external_share `num(12,2)` | id | type∈{course,fee}; amount>0 & trunc; XOR target; external_share nonneg/≤amount/course⇒0 (**no whole-shekel check**) | receipt_voucher_id→**CASCADE**; enrollment/fee→RESTRICT |
| financial_movement_ledger | amount, external_share `num(14,2)` | id; UNIQUE(source_type,source_id,entry_kind) | source_type∈{receipt,payment}; entry_kind∈{original,reversal}; amount>0 | reversal_of→self; **source_id has NO FK** (polymorphic) |
| audit_log | — | id | — | none; **no indexes** |
| restore_log | before/after counts jsonb | id | — | — |
| owner_identity | — | id; singleton | UNIQUE(singleton) | **RLS NOT enabled**; no FK to auth.users |

**Views (4, `security_invoker=true`):** `student_statement_lines` (per-allocation + legacy,
running remaining balance), `financial_movements` (unreversed 'original' ledger rows),
`cancelled_vouchers`, `active_students`. **Indexes:** every FK used in aggregation is
indexed; partial-unique idempotency keys; unique allocation-target guard. **Gap:**
`audit_log` has no index (DB-010). **Triggers:** `set_updated_at`, `log_activity` (4
tables), financial firewalls, delete-blockers, ledger writers + append-only lock + restore
purges. **RPCs:** all `SECURITY DEFINER, search_path='', is_owner()`-gated **except**
`complete_student`/`reactivate_student` (DB-011).

## Findings (DB-001 … DB-011)

| ID | Sev | Conf | Status | Location | Evidence / impact | Recommendation (not implemented) |
|---|---|---|---|---|---|---|
| **DB-001** | P2 | High | PROVEN divergence | `20260916110000_financial_operation_hardening.sql:9-10`; alloc `external_share` never gets `=trunc()`; RPC `round(...,2)` `…124000:180,250` | Whole-shekel doctrine dropped for `external_share`; institute recognized share can be fractional — contradicts frozen `DAT-004 DB-053`/`DR-025`. Inconsistent: `fee_obligations.external_share` still has the whole-shekel check | Decide vs DR-025: prorate to whole shekels, or record an ADR amending DB-053 for derived split sub-amounts |
| **DB-002** | P2 | High | PROVEN (internal contradiction) | `20260919130000_allow_standalone_fee_obligations.sql:28-29` vs `restore_center_data` `20260916125000:75-81` | Restore still requires non-null student+course+enrollment, so a backup with any standalone (course-less) fee obligation **aborts the whole restore** (`INVALID_FEE_BACKUP`). Migration is "REPO ONLY, not in production" — defect is real in repo/`db reset` and will bite the first production restore after the feature ships | Update restore fee-obligation validation to mirror standalone rules **before** enabling in production |
| DB-003 | P2 | Med | SUSPECTED (needs live) | `20260915093000:23-46` → `20260915124500:6-8` | Retroactive `check (fee_category is null or allocation_mode)` fails to apply if any direct-fee receipt exists with `allocation_mode=false` | Confirm `count(*) where fee_category not null and allocation_mode=false` = 0 in production |
| DB-004 | P3 | High | IMPROVEMENT | `20260916125000:56` | `RESTORE_SHRINKS` guard covers only students/receipts/payments; `receipt_allocations`/`fee_obligations` (money-bearing) get no shrink protection on a non-forced restore | Extend shrink guard to child tables or document why not |
| DB-005 | P3 | High | IMPROVEMENT | `enrollments`/`receipt_vouchers` dup checks; `enrollments_student_course_id_unique` partial→full drift | Duplicate `≥0` CHECKs under two names; `create if not exists` silently keeps the partial unique index after `course_id` became NOT NULL | Deduplicate; reconcile the unique index definition |
| DB-006 | P3 | High | IMPROVEMENT | `20260903182312_stabilize_owner_identity.sql:1-14` | `owner_identity` has **no RLS** (revoke-only) and **no FK to auth.users**; deleting the first user dangles `is_owner()` → lockout. (= SEC-007) | Enable RLS (no permissive policy); consider integrity link |
| DB-007 | P3 | High | IMPROVEMENT (inherent) | `financial_movement_ledger.source_id` `…114000:11-27`; `audit_log.entity_id` | Polymorphic refs with no FK; orphan risk bounded by delete-block triggers but not schema-enforced | Accept with documented rationale, or add validation triggers |
| **DB-008** | P3 (info) | High | divergence | `DAT-002..006` vs migrations | Implemented schema (students/courses/enrollments/fee-obligations, institute/external split) is a **smaller MVP** than the frozen constitution (teacher/program/registration/revenue-split, refund/expense-return/expense-category/payment-method/revenue-source — none implemented). Per P4-000 the physical DB is "Phase 10, pending separate authorization" — so this is an earlier/parallel MVP, expected. Shared & honored: whole-shekel (except DB-001), per-type monotonic voucher numbers, post-on-save + immutability + cancel-not-edit, mandatory cancel reason, overpayment ceiling, derived balances | Traceability note; reconcile when Phase 10 is authorized |
| DB-009 | P3 | High | IMPROVEMENT | `audit_log` (no `prevent_*_mutation`) vs frozen `DAT-006 DB-157` | Ledger is trigger-enforced append-only; `audit_log` is append-only only by absent grants, not by integrity rule | Add append-only trigger to match DB-157 |
| DB-010 | P3 | High | IMPROVEMENT (perf) | `audit_log` `20260831210424:2-13` | No index on `changed_at`/`entity_id`; timeline scans grow with the log | Index the ordering/filter columns |
| DB-011 | P3 | High | IMPROVEMENT | `20260916116500:68-112` | `complete_student`/`reactivate_student` SECURITY INVOKER, `search_path='public'`, not revoked from public/anon — unlike sibling archive RPCs (= SEC-001) | Bring up to the DEFINER + `is_owner()` + revoke pattern |

*(No P0/P1 with production money-corruption impact found statically. The "float for money"
trigger does **not** fire — all amounts are `numeric`; the closest money issue is the
deliberate fractional `external_share`, rated P2 at DB-001.)*

## Could not verify statically (need live DB / owner authorization)

1. DB-003 condition: any `receipt_vouchers` with `fee_category not null and
   allocation_mode=false`.
2. Whether all migrations applied cleanly and in order to production (a
   "Verified against production read-only 2026-09-19" note implies prior out-of-band drift;
   only `supabase_migrations.schema_migrations` is authoritative).
3. Row-level conservation: `Σ allocations.amount = receipt.amount_received`,
   `Σ allocation.external_share = receipt.external_share`, ledger balances tie-out.
4. Whether any fractional `external_share` actually exists (DB-001).
5. Whether standalone fee obligations exist anywhere / `20260919130000` applied (DB-002).
6. Actual index/constraint set after the `if not exists` no-ops (DB-005).
7. `owner_identity` row integrity + RLS status (DB-006).
8. Orphans under polymorphic `source_id`/`entity_id` (DB-007).
9. Runtime trigger firing order where two BEFORE triggers coexist.
