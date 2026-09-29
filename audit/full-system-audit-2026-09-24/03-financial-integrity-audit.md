# 03 — Financial Integrity Audit (CRITICAL)

**Phases covered:** 4 (financial/accounting integrity) · 5 (data integrity, static)
**Method:** full read-only trace of every money path (entry → storage → aggregation →
display → print) across `lib/aggregate.ts`, `lib/statement-rows.ts`, the posting/ledger
RPCs and triggers, and the print components; `npm run test` executed (221 pass). No live DB.

## Headline

**The core money math is sound. No P0, and no true P1.** Aggregation is **posted-only and
single-sourced**; screen and print render from the **same pure helpers**; the ledger is
**append-only** with enforced immutability and reversal-not-mutation; split/external
**conservation holds** (`instituteShare = amount − externalShare`); **no stored value drifts
from its source** (the only stored "computed" value, `external_share`, is immutable and
conserved). The findings are a whole-shekel precision divergence, a legacy-data display
inconsistency, an owner-only non-RPC insert path, and a test-execution gap.

## (a) Source-of-truth map

| Amount / balance | Authoritative source | Derived on read? | Divergence risk |
|---|---|---|---|
| Receipts total `totalIn` | `financial_movement_ledger` (unreversed 'original') via `financial_movements` view | yes | none (no server aggregate to disagree) |
| Payments total `totalOut` | same ledger/view | yes | none |
| Net | `totalIn − totalOut` (`aggregate.ts:40`) | yes | none |
| External-held | stored `receipt_vouchers.external_share` → copied to ledger at insert | snapshot, immutable | **FIN-001** (can be fractional) |
| Institute share / center net | derived `totalIn − externalHeld`, `net − externalHeld` (`aggregate.ts:41`) | yes | inherits FIN-001 |
| Student paid | Σ `student_statement_lines.amount_received` (`aggregate.ts:283-288`) | yes | none (normal path) |
| Student remaining | latest line's `remaining_balance` (SQL window) + fee remaining (`aggregate.ts:290-292`) | yes | **FIN-002** (legacy+allocated coexistence) |
| Opening balance | live `financialTotals(before start).net` (`financial-report-workspace.tsx:70`) | yes — never stored | none |
| Fee obligation amount/external | stored `fee_obligations.*`, immutable after create | stored | none |
| Receipt split snapshot | stored `receipt_vouchers.external_share` + per-allocation `external_share` | stored at posting, immutable | conserved |

Honors `DAT-005` "store nothing": every balance is recomputed on read; the only stored
computed value (`external_share`) is made immutable by a firewall trigger.

## (b) Money-flow trace

- **Entry:** `useMoneyInStore.saveReceiptVoucher` → `post_receipt_with_allocations` RPC;
  `useMoneyOutStore` → `post_payment_voucher`; fees → `create_fee_obligations`.
- **Storage:** RPC validates owner, whole-shekel amounts, **allocation sum = amount**, per
  enrollment/fee remaining ceilings (advisory locks + `for share`), and idempotency (key +
  MD5 payload fingerprint); inserts voucher + allocations atomically.
- **Ledger:** AFTER INSERT trigger writes an append-only 'original' row; cancellation writes
  a 'reversal' row (never mutates); unique on `(source_type,source_id,entry_kind)`.
- **Aggregation:** `financial_movements` view = originals with no reversal → **posted-only**
  (DB-139 ✓); `student_statement_lines` view expands allocated receipts one row per
  allocation with a running `remaining_balance` window.
- **Display + print:** both use the **same** helpers (`financialTotals`,
  `withRunningBalance`, `studentLedger`, `externalPartyStatement`). Report screen and
  `FinancialReportPrint` render identical figures; statement screen and
  `StudentStatementPrint` both consume `studentLedger`. **No screen/print divergence.**

## (c) Financial isolation matrix (operation × what it can affect)

| Operation | receipt_v | payment_v | alloc | fee_obl | ledger | totals | student remaining |
|---|---|---|---|---|---|---|---|
| Post receipt (RPC) | insert | — | insert | read | +original | +in/+ext | ↓ |
| Post payment (RPC) | — | insert | — | — | +original | +out | — |
| Create fee (RPC) | — | — | — | insert | **none** | **none** | +debit only (zero cash, ADR-0077 ✓) |
| Cancel receipt (UPDATE) | set cancelled_at | — | kept, excluded | — | +reversal | −in/−ext | restored |
| Cancel payment | — | set cancelled_at | — | — | +reversal | −out | — |
| Cancel fee (RPC) | — | — | read (blocks if paid) | set cancelled_at | none | none | −debit |
| Edit receipt | payer_name/notes only | — | — | — | none | none | none |

**UI-only change risk: none.** Ledger snapshots (party/context/amount/external) are
immutable financial fields; notes/payer edits never reach the ledger or totals. **This is
the audit's confirmation that the "financial firewall" holds against presentation-layer
work** (the entire UI/nav/icon work stream on the current branch).

## (d) Findings (FIN-001 … FIN-006)

| ID | Sev | Conf | Status | Evidence | Impact / recommendation (not implemented) |
|---|---|---|---|---|---|
| **FIN-001** | P2 | PROVEN | `20260916110000:9-10` drops whole-shekel check; RPC `round(amount*ext/total,2)` `…124000:180,250` | Fractional `external_share` → `externalHeld`/`instituteRevenue`/`centerNet`/external statement can show agorot, contradicting frozen whole-shekel (DR-025/ADR-0014). **Conservation preserved — no money lost/double-counted.** Untested (matrices use whole shares). (= **DB-001**) | Governance decision: nearest-shekel with remainder-to-institute (mirroring ADR-0014), or formally relax whole-shekel for derived split sub-amounts via ADR |
| **FIN-002** | P2 | SUSPECTED (needs legacy data) | `student_statement_lines` remaining partitioned by `enrollment_id` (allocated) vs `(student_id,course_name)` (legacy) `20260915120000:430-467`; merged in `aggregate.ts:141-165` | When a legacy overpaid/ambiguous receipt and an allocated receipt coexist on one enrollment, displayed **remaining** (students list/attention) can be overstated vs `courseValue−paid`. **studentLedger balance is unaffected (books still balance); no stored value wrong.** | Unify remaining derivation (always allocate, or reconcile the two window partitions) |
| FIN-003 | P3 | PROVEN | `20260829211605:23` grant + owner insert policy; firewall allows direct insert when `fee_category null & allocation_mode false` | A raw owner insert (UI never does this) skips the idempotency key and creates a legacy line (feeds FIN-002). Ledger still records it → totals complete. Mitigated by single-owner trust | Revoke direct INSERT; route all receipts through the RPC |
| FIN-004 | P3 | PROVEN | `use-money-in-store.ts:119`, `use-money-out-store.ts:71` | `crypto.randomUUID()` per submit → key protects transport retries, not a logical resubmit; `isSaving` + DB ceilings cover it | Note only |
| FIN-005 | P3 | PROVEN | `financial-report-workspace.tsx:71` vs `financial-report-print.tsx:118-119` | "صافي الحركة" chip = scoped-period net; general print folds in `opening` (closing cash) — by design but can confuse with a date filter set | Clarify labels |
| **FIN-006** | P2 | PROVEN | 15 financial `*.test.ts` `readFileSync`+assert-on-text; runtime proof only in `supabase/tests/external_share_layers.sh` (not in `vitest run`) | Passing tests prove the read-model math and that migrations *say* the right things, **not** runtime conservation/idempotency/cancellation/rejection/fractional behavior (= **TEST-001**) | Execute invariants against embedded/real Postgres in CI |

## (e) Test coverage (financial)

`npm run test` → 40 files / 221 pass. **Well covered (executed):** `financialTotals` incl.
center/external split (owner matrices), `externalPartyStatement`, `studentLedger`/
`studentCourseBreakdown` incl. enrollment-identity isolation and overpaid-legacy floor,
`withRunningBalance`, fee aggregate, stores (mocked). **Gaps:** no execution of
RPCs/triggers/views; no fractional-`external_share` test; no legacy+allocated coexistence
test; no direct-insert-rejection test; idempotency dedupe asserted only as text.

## (f) Needs live DB / isolated env to confirm

Runtime behavior of the posting/cancellation/ledger RPCs+triggers and the two views (run
`external_share_layers.sh` against a throwaway PG); FIN-001 fractional reproduction;
FIN-002 legacy+allocated seed; FIN-003 direct-insert acceptance; and **which migration
state production is actually on** (ADR-0077's `20260919130000` is "repo only, not applied to
Production" — determines whether standalone fees exist live, which interacts with DB-002).

**Positive confirmations (no action):** posted-only aggregation (reversed originals
excluded); fee-level external conservation (final payment takes exact remainder);
append-only ledger + immutability + delete-prevention + cancellation-reason enforcement;
cancel-blocked-while-paid on fees; identical screen/print formulas. **The financial engine
is well-built; the residual risk is precision policy (FIN-001), legacy-data display
(FIN-002), and — most importantly — that its server guarantees are not executed in tests
(FIN-006/TEST-001).**
