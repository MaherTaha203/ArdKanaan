# 04 — Financial Integrity with Data Accumulation

**Read-only.** Re-verifies the prior audit's financial findings first-hand and evaluates them
under years of accumulation + student/course reactivation. **No financial formula changed.**
Evidence tiers are distinguished: **[static]** code/SQL reading · **[app-test]** vitest (mocked
Supabase) · **[real-PG]** executed against Postgres. **No [real-PG] test was run** (no
isolated DB) → runtime guarantees are **NOT VERIFIED IN LIVE ENVIRONMENT**.

## What is durable by construction [static]

- **Atomicity + idempotency:** `post_receipt_with_allocations`/`post_payment_voucher` run in
  one transaction with advisory locks + `for share`, and dedupe on a UUID key **plus** an MD5
  payload fingerprint. → Retries/double-clicks cannot double-post. *(Enforced in SQL;
  behavior **[static]** only — never executed in tests.)*
- **Concurrency:** per-key / per-enrollment / per-fee advisory locks + remaining-balance
  re-check inside the transaction → two simultaneous receipts on the same enrollment cannot
  both consume the last balance. **[static]**
- **Historical immutability (the key longevity property):** vouchers/enrollments/obligations
  are immutable after posting (edits touch only `payer_name`/`notes`); deletes are
  trigger-blocked; the ledger is **append-only** and cancellation writes a **reversal** row.
  Receipts snapshot `student_name_snapshot` and `course_value`. → **New activity (new
  registration, new course, reactivation) cannot rewrite old dues, payments, or balances.**
  This holds regardless of how many years accumulate. **[static]**
- **Balances after years:** all balances are **derived on read** from immutable rows (posted-
  only `financial_movements`; running-balance statement view) → they cannot "drift"; a
  correct set of rows always recomputes the same balance. **[static]** + **[app-test]** for the
  read-model math (owner-split matrices, ledger reconciliation, enrollment-identity isolation).
- **Screen = report = print:** the same pure helpers feed all three (`financial-report-workspace`,
  `financial-report-print`, `student-statement-print`). **[app-test]** for the helpers.
- **RLS isolation:** owner-only across every table/RPC (`07`). **[static]**

## Accumulation-specific risks (the ones that grow with data/time)

| ID | Sev | Tier | Risk under accumulation / reactivation |
|---|---|---|---|
| **FIN-A1** (=TEST-001/FIN-006) | **P1** | app-test only | Every guarantee above marked **[static]** is verified in the test suite **only by grepping migration SQL text** (15/40 files, re-confirmed first-hand). Over years the SQL evolves (new fee rules, new lifecycle) and a broken guard passes CI green. **The safety net decays exactly as the system accumulates complexity.** → executable **[real-PG]** tests (`10`) |
| **FIN-A2** (=CODE-002/FIN-002) | P2 | static | **Same-course-name legacy path:** as new runs reuse a program name, `courses.ts paidFor` (name-match, no entryType filter) diverges from the enrollment-id breakdown → a course's paid/remaining can double-count or absorb a fee line. **Grows more likely the longer the center reuses course names.** Ledger balance unaffected; display can be wrong. → single source of truth (`09`) |
| FIN-A3 (=FIN-001/DB-001) | P2 | static | Fractional `external_share` accumulates fractional institute-revenue figures across years, diverging from the whole-shekel rule (conservation preserved). → governance decision |
| FIN-A4 | P2 | static | **Report totals depend on `fetchAllRows` completeness.** Correct today (verified). The risk is *regression*: any future report query that drops `fetchAllRows` for a plain `.select()` would silently cap at 1000 rows and **under-count totals** as history grows. `backup-history` already shows this capped pattern (cosmetic there). → keep every financial aggregate on `fetchAllRows`; add a guard/test |
| FIN-A5 | P2 | static | **Browser-memory / whole-history load:** totals are computed by loading the entire ledger to the client (`02`/`05`). At high growth the raw arrays reach ~90 MB+ (measured heap at 200k lines) → on low-memory devices the tab can slow or crash *before* any number is wrong. Not a correctness bug; an availability limit. → server-side aggregation (`09`) |
| FIN-A6 | P3 | static | **Network failure after a successful DB write:** posting is idempotent (key+fingerprint), so a retried receipt won't duplicate; a payment retried with a new key *could* (FIN-004 — key regenerated per submit). `isSaving` + remaining-ceilings mitigate. → reuse one idempotency key across retries |
| FIN-A7 | P3 | static | Long single statement stays fast (`studentLedger` ≤3.5 ms at 200k lines) → **no** "slow statement" bottleneck even for a decade-long student. ✅ (confirms a *non*-risk) |

## Verification vs the prior audit

The prior audit's financial verdict — **no P0, sound core, one P1 (SQL-text testing)** —
was **re-verified first-hand** this session (the whole-shekel drop lines, the 15 SQL-text
test files, and the lifecycle-RPC gap were all re-confirmed). Full status table in `08`.

## Not verified (needs isolated Postgres — `10`)

Runtime conservation (`Σalloc=amount`, `Σext=external`, ledger tie-out) on accumulated data;
idempotency dedupe of a real duplicate; cancellation reversal netting; overpayment rejection;
fractional-share reproduction; and that a decade of reactivations leaves balances exact. All
**NOT VERIFIED IN LIVE ENVIRONMENT**.
