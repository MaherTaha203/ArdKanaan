# 12 — Implementation Phases: the safe order (proposed, NOT executed)

**Read-only, proposed.** The sequence that reaches `11` with the least risk, ordered by
**result-safety first** (Tier S before Tier P from `10`). Each phase names its safety gate and
its verification. **No phase has been started.** Golden rules carried from the prior roadmap:
never move a financial formula without a **[real-PG] parity test** proving identical output;
keep every financial change in its **own PR, separate from UI**; all DB changes are **new
additive/corrective migrations** validated in an **isolated DB** first; do `[LIVE]` reads only
under Owner authorization.

## Phase 0 — Prerequisite (Owner)
Authorize an **isolated test environment** + **read-only production row counts** (to know where
the center sits on the `09` curve and pick seed sizes). Without this, thresholds stay estimates.

## Phase 1 — Tier S, zero result change (start here; no parity test needed)
Each item moves a filter that already runs in JS to the server; output is identical by
construction (`05`, `10`).
1. **Student statement on-demand** — fetch `.eq('student_id', S)` on selection; feed the
   unchanged `studentLedger`/`statementFor`. *Verify:* unit test asserting
   `f(S, fullArray) deep-equals f(S, serverFilteredSlice)`; manual statement spot-check.
   **Smallest change, biggest immediate win.**
2. **Course detail on-demand** — same shape for the selected course.
3. **Activity page: server pagination + search** + the **`audit_log(changed_at desc)` index**
   (additive migration). *Verify:* `EXPLAIN` shows index scan in isolated DB; same rows appear,
   paged. Fixes the **first** bottleneck (`07`,`09`).

## Phase 2 — Tier S list rows + search (still zero result change for the row lists)
4. **Server-side student search** and **directory/list pagination** (rows only; the balance
   column stays client-computed until Phase 3). *Verify:* same matches as the JS filter on a
   seeded set.
5. **Report: server date-range + account filter + row pagination** (the movement **list**;
   totals stay client-side until Phase 3). *Verify:* same rows for the same range.

## Phase 3 — Tier P: financial aggregates to the server (parity-gated)
Only after Phase 0's isolated DB exists and the **parity tests** are written and green.
6. **Center totals** (F1) and **external split** (F2) as server aggregates for home + report.
7. **Per-student balance** (F3) as a server aggregate for the directory column; **per-course**
   rollups.
8. **Dashboard KPIs / attention counts** from server aggregates.
*Gate for each:* the `04`/`10` **[real-PG] parity test** (zero rows, one student, name-reuse,
fractional external share, overpayment-clamped remaining, cancelled fees) must pass to the cent;
each ships in its **own PR**, no UI mixed in.

## Phase 4 — Structural finish (optional; only if data warrants)
9. **Slim the eager store** to roster + summaries + small sets; details fetched on demand
   (`11`). *Verify:* full unit/e2e green; totals still reconcile to SQL (guards a future
   `.select()` from truncating — the `fetchAllRows` completeness invariant stays enforced for
   backup).
10. Add composite indexes **only where a new server filter needs one** (e.g.
    `financial_movement voucher_date`) — never speculatively, and only after `EXPLAIN` shows the
    need.

## Explicitly deferred / not done
- **Offline / IndexedDB / service worker** — not recommended (`08`); out of scope.
- **Pagination of `courses`/`cancelled_vouchers`** — premature (small/slow).
- **Any change to posting/cancellation/fee RPCs, ledger, RLS, or the backup's read-all** — out
  of scope entirely.

## Stop conditions
Start Phase 1 items **now** (safe, high value). **Do not** begin Phase 3 until the isolated DB
and parity tests exist. **Do not** begin Phase 4 until Phase 3 is proven. If at any point a
parity test fails, **halt that item**, keep the client formula, and treat the divergence as a
finding — do not "fix" the money to match SQL.

**This is a plan. Nothing in it has been executed in this audit.**
