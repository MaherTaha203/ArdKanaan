# 04 — Financial Data Paths: the current formulas, stated before any SQL move is proposed

**Read-only.** The task forbids proposing "move aggregation to SQL" before the *current
formula* is written down and parity is shown preservable. This report states each money
formula **verbatim from `app/src/lib/aggregate.ts`** and defines the parity obligation for any
future server implementation. **No formula is changed here; nothing is moved. This is the
specification a future parity test would check against.** Tier: **[static]**.

## F1 — Center totals (`financialTotals`, lines 26–42)

```
for each movement:
  if receipt:  totalIn += amount;  externalHeld += externalShare ?? 0
  else:        totalOut += amount
net              = totalIn − totalOut
instituteRevenue = totalIn − externalHeld
centerNet        = net − externalHeld            (= instituteRevenue − totalOut)
```
Inputs: all `financial_movements` (receipt/payment, amount, externalShare).
**Parity obligation:** a server `SUM` grouped by `movement_type` plus `SUM(external_share)
FILTER (WHERE movement_type='receipt')` must return `totalIn/totalOut/externalHeld` **equal to
the cent** for the same row set, and the three derived figures must be computed with the *same
signs*. Rounding: JS sums raw numeric values; the SQL must use the same numeric type (no
premature rounding) — see the fractional-share note below.

## F2 — External-party split (`externalPartyStatement`, lines 68–95)

```
per receipt with externalShare > 0:
  instituteShare = max(0, amount − externalShare)
  accumulate amount, externalShare, instituteShare
```
**Parity obligation:** identical per-line `instituteShare` (note the `max(0,…)` clamp) and
identical totals; ordering is voucher_date then voucher_number.

## F3 — Per-student balance (`aggregateStudents` → `studentCourseBreakdown` + `feeRemaining`)

```
paid       = Σ amountReceived over the student's statement lines           (aggregate: 283–288)
remaining  = Σ max(0, course.remaining) over courses (breakdown)           (291)
             + Σ feeRemaining(fee) over the student's non-cancelled fees   (292)
feeRemaining(fee) = max(0, fee.amount − Σ amountReceived of that fee's lines)  (187–189)
course.remaining comes from the latest (chronological) statement line for that enrolment (159–163)
```
**Parity obligation (highest care):** the "latest line wins" rule for `remaining`, the
enrolment-vs-name resolution (`studentCourseBreakdown` 141–165), and the `max(0,…)` clamps must
be reproduced exactly. This is the formula most at risk in an SQL translation and **must** have
a per-student parity test across the enrolment/name-reuse edge cases before any move.

## F4 — Running ledger (`studentLedger`, lines 220–265)

Debits = course dues (one per course, from the breakdown) + non-cancelled fee obligations;
credits = each receipt allocation line; running `balance += debit − credit` in a strict sort
order (`sort` key, 240/247/252/255); `balance = totalDebit − totalCredit`. **Per-student only.**
**Parity obligation:** if ever server-side, reproduce the sort key and the debit/credit dating
rules exactly. (But `05` shows this path needs **no formula move at all** — only a
server-side row filter — so parity is trivially guaranteed.)

## The rounding / fractional-share caveat (cross-ref SUS-09 / FIN-001)

`externalShare` can be **fractional**: a whole-shekel `CHECK` was added in migration
`20260915093000` and **dropped** in `20260916110000` (verified first-hand in the prior audit).
Any SQL aggregate over `external_share` must therefore use the **same numeric precision as the
column** and must **not** round mid-sum, or `externalHeld`/`instituteShare` could diverge from
the JS result by fractions that accumulate. This is a parity-test case, not a blocker.

## Rule for any future move (not executed here)

1. Freeze the JS formula above as the oracle.
2. Implement the server aggregate as a **read-only** parameterized view/RPC.
3. Run a **[real-PG] parity test** (isolated DB, seeded) asserting server output == JS output
   to the cent across: zero rows, one student, name-reuse, fractional external share,
   overpayment-clamped remaining, cancelled fees. (Test spec: `10`; roadmap: `12`.)
4. Only after 100% parity, and in a **separate PR from any UI change**, may the read path use
   the server aggregate.

Until all four hold, **no financial aggregation is moved.** The firewall (append-only ledger,
posting/cancellation RPCs, RLS) is **not touched by any of this** — these are read models over
already-posted data.
