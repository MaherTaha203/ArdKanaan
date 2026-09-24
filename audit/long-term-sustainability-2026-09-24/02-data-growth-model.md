# 02 — Data-Growth Model (1 / 5 / 10 years)

**All numbers here are HYPOTHETICAL scenarios**, not system facts: no production data was
accessible, and no per-day rate is set anywhere in the code/config (searched). They exist to
size the risk. Real production counts are **NOT VERIFIED IN LIVE ENVIRONMENT** — obtaining
them is item 1 of `10-test-plan.md`.

## Assumptions (stated)

- Operating days/year: **300** (6-day week minus holidays).
- Scenarios by **new students/operating-day**: **Low = 2**, **Medium = 6**, **High = 15**.
- Derived per-year rows (from the lifecycle in `01`): enrollments ≈ 2.5 × intake (new +
  returning re-enroll); statement lines (≈ `receipt_allocations`) ≈ 2 × enrollments; receipts
  ≈ 0.8 × lines; fees ≈ 0.5 × intake; expenses (`payment_vouchers`) ≈ 8/day = 2,400/yr
  (mostly student-independent); ledger ≈ receipts + payments; **`audit_log` ≈ 1.2 × (students
  + enrollments + receipts + payments)** — logs every insert/update on 4 tables + logins, so
  it is the **fastest-growing table**.
- Row-width estimates (incl. tuple overhead): students ~200 B, enrollments ~150 B, receipts
  ~320 B, allocations ~130 B, fees ~200 B, payments ~160 B, ledger ~260 B, **audit_log
  ~800 B** (jsonb old/new-data + device/UA/IP text).

## Cumulative rows — MEDIUM scenario (6/day)

| Table | /year | Year 1 | Year 5 | Year 10 |
|---|---|---|---|---|
| students | 1,800 | 1,800 | 9,000 | 18,000 |
| enrollments | 4,500 | 4,500 | 22,500 | 45,000 |
| **statement_lines (allocations)** | 9,000 | 9,000 | 45,000 | **90,000** |
| receipt_vouchers | 7,200 | 7,200 | 36,000 | 72,000 |
| fee_obligations | 900 | 900 | 4,500 | 9,000 |
| payment_vouchers | 2,400 | 2,400 | 12,000 | 24,000 |
| financial_movement_ledger | 9,600 | 9,600 | 48,000 | 96,000 |
| **audit_log** | ~19,000 | 19,000 | 95,000 | **190,000** |

**Low ≈ ×0.33, High ≈ ×2.5** on the student-derived tables (expenses scale less). So Year-10
statement lines ≈ **30k (Low) / 90k (Medium) / 225k (High)**; audit_log ≈ **63k / 190k /
475k**.

## Storage (Medium, Year 10)

audit_log ~152 MB · ledger ~25 MB · receipts ~23 MB · allocations ~12 MB · enrollments
~7 MB · payments ~4 MB · students ~4 MB · fees ~2 MB → **≈ 228 MB data + ~40 % indexes ≈
~320 MB.** High-growth Year 10 ≈ ~800 MB. **Conclusion: Postgres storage is NOT the
constraint for a decade** (well within a Supabase paid tier; Medium even approaches but is
serviceable on larger free/low tiers). `audit_log` dominates storage.

## Where growth actually bites (mapped to the measured benchmark)

The cost is **client-side**, not storage. Two loads dominate:

1. **Every workspace load** re-fetches students + statement_lines + ledger originals +
   enrollments + fee_obligations (Medium Year 10 ≈ **258k rows**, tens of MB of JSON) and
   then runs `aggregateStudents` over the statement lines. Benchmark (server CPU; **modest
   device 3–8× slower**):

   | Year (Medium) | statement lines | `aggregateStudents` (server) | est. modest device |
   |---|---|---|---|
   | 1 | 9,000 | ~9 ms | ~30–70 ms |
   | 5 | 45,000 | ~40 ms | ~0.15–0.35 s |
   | 10 | 90,000 | ~90 ms | ~0.3–0.7 s |
   | 10 (High) | 225,000 | ~200 ms | ~0.6–1.6 s |

   …**on top of** the cold-load transfer + JSON parse of tens of MB, which usually dominates
   perceived latency. Opening a **single** student statement stays fast (`studentLedger`
   ≤ 3.5 ms even at 200k lines) — the problem is the whole-dataset pages (home dashboard,
   students list, reports).

2. **The activity/audit page** loads **all of `audit_log`** (190k rows Medium Year 10),
   which is **unindexed** (DB-010) — the single worst query, degrading both DB-side (scan)
   and client-side (transfer + render).

## Interpretation

- **DB storage/engine:** comfortable for 10 years at Low/Medium; paid tier for High.
- **First user-visible bottleneck:** the **activity page**, then the **every-load
  workspace transfer + aggregation**, reaching "sluggish" (~0.5 s+ perceived) around
  **Year 3–5 Medium** (sooner on High), **well before** any DB or storage limit.
- This is an **architecture ceiling** (load-all + client-aggregate), addressable by
  server-side aggregation + windowed loading (`09` R-group) — not a data-model flaw.
