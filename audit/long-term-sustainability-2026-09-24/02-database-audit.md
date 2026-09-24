# 02 — Database Schema Audit

**Phase 3.** Static, from all 53 migrations + `DAT-001..006`. **Live DB not accessible →
runtime/applied-state items are marked BLOCKED — ACCESS REQUIRED.**

**Headline (first-hand confirmed):** money is `numeric(12,2)` (ledger `numeric(14,2)`) —
**no float/double/money type** for any amount; all system timestamps `timestamptz`. Writes
are RPC-only; ledger append-only; immutability/delete-block triggers pervasive. **No P0/P1
money-corruption found statically.**

## Schema map (11 base tables; RLS on all except `owner_identity`)

| Table | Money cols | Notable constraints | FKs (on delete) |
|---|---|---|---|
| students | — | status ∈ {active,completed,archived} | — |
| receipt_vouchers | course_value, amount_received, external_share `num(12,2)` | amount>0; `=trunc()` on amounts; **external_share whole-shekel DROPPED**; fee_distribution_valid; fee_requires_allocation_mode; idempotency | student_id → **RESTRICT** |
| payment_vouchers | amount `num(12,2)` | amount>0 & trunc; expense_type free text | — |
| enrollments | course_value `num(12,2)` | ≥0 & trunc | student/course → **RESTRICT** |
| courses | base_fee `num(12,2)` NULL | status ∈ {active,ended} | — |
| fee_obligations | amount, external_share `num(12,2)` | amount>0 & trunc; external whole & ≤amount; category valid; enrollment_id/course_name **nullable** since 20260919130000 | student/course/enrollment → RESTRICT |
| receipt_allocations | amount, external_share `num(12,2)` | type ∈ {course,fee}; XOR target; external ≤amount (**no whole-shekel check**) | receipt → **CASCADE**; enrollment/fee → RESTRICT |
| financial_movement_ledger | amount, external_share `num(14,2)` | UNIQUE(source_type,source_id,entry_kind); amount>0; append-only trigger | reversal_of → self; **source_id NO FK** (polymorphic) |
| audit_log | — | — | none; **no indexes** |
| restore_log | counts jsonb | — | — |
| owner_identity | — | singleton | **RLS NOT enabled** (revoke-only); no FK to auth.users |

**Views (invoker):** `student_statement_lines`, `financial_movements` (unreversed originals),
`cancelled_vouchers`, `active_students`. **Indexes:** all aggregation FKs indexed; partial
idempotency-key uniques; allocation-target unique. **RPCs** all `SECURITY DEFINER,
search_path='', is_owner()`-gated **except** `complete_student`/`reactivate_student`.

## Findings (sustainability lens: schema durability)

| ID | Sev | Status | Location | Finding / recommendation (not implemented) |
|---|---|---|---|---|
| **DB-001** (=FIN-001) | P2 | PROVEN | add `20260915093000:30`, drop `20260916110000:10`; RPC `round(...,2)` | Whole-shekel doctrine dropped for `external_share` → institute/external figures can show agorot, contradicting frozen DR-025. Conservation preserved. → Governance decision (nearest-shekel remainder-to-institute, or ADR-relax) |
| **DB-002** | P2 | PROVEN | `20260919130000:28-29` vs restore `20260916125000:75-81` | Restore still requires non-null student+course+enrollment → a backup with a standalone fee **aborts the whole restore**. Repo-only today; bites first prod restore after it ships. → Align restore validation before enabling live |
| DB-003 | P2 | SUSPECTED | `20260915093000` → `20260915124500:6-8` | Retroactive CHECK fails to apply if any direct-fee receipt has `allocation_mode=false`. **BLOCKED — ACCESS REQUIRED** (needs `count(*)` on prod) |
| DB-004 | P3 | IMPROVEMENT | `20260916125000:56` | Shrink guard omits money-bearing `receipt_allocations`/`fee_obligations` |
| DB-005 | P3 | IMPROVEMENT | dup checks; unique-index drift | Duplicate `≥0` CHECKs; partial-vs-full unique index left partial |
| DB-006 (=SEC-007) | P3 | IMPROVEMENT | `20260903182312:1-14` | `owner_identity` no RLS + no FK → lockout if first user deleted |
| DB-007 | P3 | IMPROVEMENT | ledger `source_id`; `audit_log.entity_id` | Polymorphic refs, no FK (orphan risk bounded by triggers) |
| DB-008 | P3 (info) | divergence | DAT-002..006 vs migrations | Implemented schema is a smaller MVP than the frozen constitution (expected per P4-000 "Phase 10 pending authorization") — a **long-term traceability debt** to reconcile |
| DB-009 | P3 | IMPROVEMENT | `audit_log` vs DB-157 | `audit_log` append-only by convention (no trigger) — durability of the audit trail is weaker than the ledger's |
| DB-010 | P3 | IMPROVEMENT | `audit_log` | No indexes → timeline scans worsen as the log grows (sustainability/perf) |
| DB-011 (=SEC-001) | P3→P2 | PROVEN | `20260916116500:68,91` | `complete_student`/`reactivate_student` SECURITY INVOKER, no `is_owner()`, not revoked — pattern drift vs every other mutation |

## BLOCKED — ACCESS REQUIRED (needs live DB / Owner authorization)

Applied migration set vs repo; real constraint/index set (post `if not exists` no-ops);
row-level conservation (`Σalloc=amount`, `Σext=external`, ledger tie-out); any fractional
`external_share`; any standalone fee obligation; DB-003 direct-fee rows; `owner_identity`
integrity + RLS status; orphans under polymorphic refs; trigger firing order.
