# 03 — Financial Integrity Audit (CRITICAL)

**Phases 4–5.** Full read-only trace of every money path; `npm run test` executed this
session (**221 pass**). Live DB not accessible → runtime items BLOCKED — ACCESS REQUIRED.

**Headline:** the core money math is **sound**. **No P0, no true P1.** Aggregation is
**posted-only and single-sourced**; screen and print share the same helpers; the ledger is
**append-only** with reversal-not-mutation; splits are **conserved**; **no stored value
drifts from its source** (the only stored computed value, `external_share`, is immutable).

## Source-of-truth map

| Amount | Authoritative source | Derived on read? | Divergence risk |
|---|---|---|---|
| totalIn / totalOut / net | `financial_movements` view (unreversed originals) | yes | none |
| external-held / institute / center-net | derived from stored `external_share` (`aggregate.ts:41`) | partly | **FIN-001** (fractional) |
| student paid | Σ `student_statement_lines.amount_received` | yes | none |
| student remaining | latest window `remaining_balance` + fee remaining | yes | **FIN-002** (legacy+allocated) |
| opening balance | live `financialTotals(before start).net` | yes — never stored | none |
| fee obligation / receipt split | stored, immutable after posting | stored | conserved |

Honors `DAT-005` "store nothing" — everything recomputed on read.

## Money-flow & isolation

Entry (money-in/out stores) → `post_receipt_with_allocations` / `post_payment_voucher` /
`create_fee_obligations` RPCs (owner-gated, whole-shekel, allocation-sum=amount, remaining
ceilings, idempotency) → atomic insert → **append-only ledger** trigger → `financial_movements`
view (posted-only) → **same pure helpers** for screen and print.

**Financial isolation (sustainability-critical):** creating a fee = **zero cash** (debit
only, ADR-0077 ✓); cancellation writes a **reversal** row (never mutates); editing a receipt
touches **only** `payer_name`/`notes`. **No UI/presentation change can reach the ledger or
totals** — this is the audit's confirmation that the ongoing UI/nav/icon/date/tab work stream
cannot disturb the books.

## Findings

| ID | Sev | Status | Evidence | Impact / recommendation (not implemented) |
|---|---|---|---|---|
| **FIN-001** (=DB-001) | P2 | PROVEN | whole-shekel check dropped; RPC `round(...,2)` | Fractional external split diverges from frozen whole-shekel; **conservation preserved, no money lost**; untested. → Governance decision |
| **FIN-002** | P2 | SUSPECTED | `student_statement_lines` legacy vs allocated window partitions; merged `aggregate.ts:141-165` | Displayed **remaining** can overstate vs `courseValue−paid` when a legacy overpaid receipt + an allocated receipt coexist on one enrollment. **Ledger balance unaffected; books balance.** BLOCKED — ACCESS REQUIRED (needs legacy data) |
| FIN-003 | P3 | PROVEN | `20260829211605:23` grant + owner insert policy | Plain course receipts have an owner-only direct insert path bypassing the RPC (skips idempotency; feeds FIN-002). Ledger still records → totals complete. → Route all receipts through the RPC |
| FIN-004 | P3 | PROVEN | `use-money-in-store.ts:119`, `use-money-out-store.ts:71` | Idempotency key regenerated per submit → protects transport retries, not a logical resubmit; `isSaving` + DB ceilings cover it |
| FIN-005 | P3 | PROVEN | report vs print | Screen "صافي الحركة" = period net; print folds in opening (closing cash) — by design, can confuse with a date filter |
| **FIN-006** (=TEST-001) | **P1** | PROVEN | 15 financial `*.test.ts` use `readFileSync`+`toContain`; runtime proof only in `external_share_layers.sh` (not in CI) | Passing tests prove read-model math + that migrations *say* the right things — **not** runtime conservation/idempotency/cancellation/rejection/fractional behavior. **Long-term: the money safety net erodes silently as SQL changes.** → Execute invariants against embedded/real Postgres in CI |

## Test coverage (financial)

**Well covered (executed):** `financialTotals` incl. center/external split (owner matrices),
`externalPartyStatement`, `studentLedger`/`studentCourseBreakdown` incl. enrollment-identity
isolation + overpaid-legacy floor, `withRunningBalance`, fee aggregate, stores (mocked).
**Gaps:** no execution of RPCs/triggers/views; no fractional-`external_share` test; no
legacy+allocated coexistence test; no direct-insert-rejection test; idempotency dedupe
asserted only as text.

## BLOCKED — ACCESS REQUIRED

Runtime behavior of posting/cancellation/fee/restore RPCs + triggers + the 2 views (run
`external_share_layers.sh` on a throwaway PG); FIN-001 fractional reproduction; FIN-002
legacy+allocated seed; FIN-003 direct-insert acceptance; and **which migration state
production is on** (ADR-0077's `20260919130000` is "repo only, not applied to production").

**Positive confirmations:** posted-only aggregation, fee-level external conservation,
append-only ledger + immutability + delete-prevention + cancel-reason enforcement,
cancel-blocked-while-paid on fees, identical screen/print formulas. **The financial engine
is well-built; the durable risk is FIN-006 (untested server guarantees), then FIN-001
precision policy and FIN-002 legacy display.**
