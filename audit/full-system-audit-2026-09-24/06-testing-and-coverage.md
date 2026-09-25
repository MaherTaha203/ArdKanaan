# 06 — Testing & Quality Assurance

**Phase 10.** All suites executed read-only from `/home/user/-/app`.

## Executed results (real)

| Command | Result | Time |
|---|---|---|
| `npm run test` (vitest) | **PASS — 40 files, 221 tests, 0 fail/skip** | 3.80s |
| `npm run lint` (eslint) | PASS, exit 0 | — |
| `npm run build` (tsc -b && vite build) | PASS; `dist` 747 KB JS / 43 KB CSS; **no source maps** (good) | — |
| `PW_CHROMIUM_PATH=… npm run e2e` | **PASS — 25 tests, 0 fail** (8 spec files) | 45.3s |

No `.only`/`.skip`/`.todo`/`xit` anywhere; no zero-assertion test files. All tests run
offline (pure functions or mocked Supabase; e2e stubs `stub.supabase.co` with every request
intercepted). **Isolation from production is solid.**

> **Per the audit's own rule ("passing tests ≠ a sound system"), the headline is not the
> 221 green tests — it is _what_ they actually exercise (below).**

## Coverage matrix (critical function → tests → gap)

"Behavioral" = executes the real code. **"SQL-grep"** = `readFileSync(migration.sql)` +
`toContain('…')` — asserts a substring exists in the migration text, **never executes SQL**.

| Critical area | Tests | Assessment |
|---|---|---|
| Financial totals + center/external split (`financialTotals`) | `aggregate.test`, `center-funds.test` (behavioral; owner matrix 100/0, 100/40, 100/100) | **Well covered** (read-model) |
| Student aggregation / remaining / attention | `aggregate.test` (+ enrollment-identity isolation, legacy overpayment non-netting) | **Well covered** |
| Running statement / ledger | `aggregate.test`, `student-ledger.test`, `statement-rows.test` | **Well covered** |
| External-party statement | `external-party-statement.test` | **Well covered** |
| Amount-in-words (Arabic) | `amount-in-words.test` | Covered (truncates decimals — TEST-010) |
| Course roster / stats | `courses.test` | Good; `paidFor` entry-type leak untested (**TEST-016 = CODE-002**) |
| Receipt posting — **client guard** | `use-money-in-store.test`, `receipt/schema.test` | **Well covered** (client) |
| Receipt posting — **server invariants** (RPC-required, dup-alloc, overpayment, idempotency+fingerprint, external-share rounding) | `receipt-posting-integrity`, `financial-operation-hardening`, `receipt-allocation-integrity`, `receipt-fee-firewall` | **SQL-grep only** (TEST-001); one slice truly executed by `external_share_layers.sh`, not in CI |
| Payment posting/hardening | `payment-posting-hardening` (SQL-grep) | **Executed nowhere** (+ mocked e2e only) |
| Fee obligation create/immutability/standalone | `use-fee-obligation-store.test` (behavioral) + 2 SQL-grep | Client good; server SQL-grep only |
| **Fee cancellation** guard | `fee-cancellation.test` (SQL-grep) | **Guard never executed** |
| **Voucher cancellation** | `smoke.spec` (mocked; mock always succeeds) | UI flow only; DB guard/RLS never asserted |
| External split rounding | string-asserted ×2; executed only 100/40 in shell (not CI) | **Rounding correctness across values unproven** |
| **RLS-dependent flows** (owner-only, firewall) | `*-firewall`, `security-advisor-cleanup` (SQL-grep) | **RLS never actually exercised to block anyone** |
| Restore / backup identity | `backup.test` (client) + migrations (SQL-grep) + mocked e2e | Client good; server checks SQL-grep only |
| Student archive lifecycle | `aggregate-archive`, `use-student-archive-store` (behavioral) + SQL-grep + e2e | Read-model/client good; server RPC SQL-grep only |
| Student identity / calendar / smart-date / password policy | dedicated behavioral tests (+ e2e for identity) | **Well covered** |

**Bottom line:** client-side pure/read-model logic is genuinely well tested; **every
server-enforced money-safety guarantee (RLS, posting firewall, cancellation, idempotency,
restore) is verified only by grepping migration text**, except one external-share slice run
by a shell test CI never invokes.

## Findings (TEST-001 … TEST-016)

Testing-specific findings; build/deploy (TEST-002/003/006/011/012) also appear in report
`08`, dependency ones (TEST-008/013/014) in report `09`, and TEST-015 = SEC-005.

| ID | Sev | Conf | Status | Evidence | Impact / recommendation (not implemented) |
|---|---|---|---|---|---|
| **TEST-001** | **P1** | PROVEN | 15/40 files are `readFileSync`+`toContain` (e.g. `fee-cancellation.test.ts:5-24`, `receipt-posting-integrity.test.ts:14-47`) | Money-safety SQL "tested" as **string presence** — a wrong WHERE/branch/typo that keeps the string still passes. **False green** on the firewall, overpayment, idempotency, rounding, cancellation, restore. → Run these invariants against real/embedded Postgres (pglite/testcontainers or extend the shell harness) in CI; keep text tests only as secondary |
| **TEST-002** | P2 | PROVEN | `ci.yml:4-10` | CI runs only on `claude/ard-kanaan-phase-0-6rymjv` + a now-deleted branch; **current branch + default get no CI**. → Trigger on default branch and all PRs |
| **TEST-003** | P2 | PROVEN | no `strict` in any tsconfig | strictNullChecks/noImplicitAny off in a financial app (= CODE-013). → Enable `strict` + `noUncheckedIndexedAccess`, fix incrementally |
| TEST-004 | P2 | PROVEN | `supabase/tests/external_share_layers.sh:6-8` | Only real-DB test, **not in CI**, covers one slice (also seeds PG16 vs config PG17). → Run + broaden in CI against ephemeral PG17 |
| TEST-005 | P2 | PROVEN | `eslint.config.js:12-17` | Non-type-aware lint (no floating-promise/no-misused-promises for async Supabase). → Adopt `recommendedTypeChecked`; `exhaustive-deps` = error for new code |
| TEST-006 | P2 | PROVEN | `vitest.config.ts:17-21` | Coverage limited to `lib`/`store`, **no thresholds**, CI runs `npm test` not coverage; the mandated 80% is unmeasured. → Add thresholds + coverage in CI; widen include |
| TEST-007 | P2 | PROVEN | `e2e/support/mock-supabase.ts:132-208` | Mock re-implements RPCs as always-succeed (no firewall/idempotency/rounding/RLS); e2e cannot catch a server money bug. → Keep as UI smoke; pair with real-DB layer |
| TEST-010 | P3 | SUSPECTED | `amount-in-words.ts:111` `Math.trunc` | Words truncate decimals while figures show 2dp — disagree if a fractional amount ever prints. → Forbid fractions end-to-end or render sub-unit |
| TEST-016 | P3 | SUSPECTED | `courses.ts:34-42` vs `aggregate.ts:128` | `paidFor` omits `entryType==='course'` filter → a fee line sharing a course name inflates course paid (= **CODE-002**). → Reuse `studentCourseBreakdown` |

**Assessment:** the test *suite* is large and the *client* domain logic is genuinely,
carefully covered (owner-split matrices, identity isolation, ledger reconciliation). The
gap is structural: the **server** is where money safety is enforced, and the server is
tested almost entirely by text-matching. TEST-001 is the audit's headline QA risk and the
reason "build is green" must not be read as "financial engine is verified."
