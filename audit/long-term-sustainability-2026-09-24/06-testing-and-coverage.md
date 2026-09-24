# 06 — Testing & Quality Assurance

**Phase 10.** All suites executed **first-hand this session**.

| Command | Result |
|---|---|
| `npx tsc -b` | exit 0 |
| `npm run lint` | clean |
| `npm run test` | **40 files / 221 passed / 0 fail** |
| `npm run build` | OK (747 KB / 203 KB gz) |
| `PW_CHROMIUM_PATH=… npm run e2e` | **25 passed / 0 fail** |
| `npm audit` | **0 vulnerabilities** |

No `.only`/`.skip`/`.todo`; no zero-assertion files; all offline/isolated from production.

> **The number that matters for sustainability is not 221 — it is _15_:** the count of unit
> files that verify server money-safety by matching migration **text** rather than executing
> it (confirmed first-hand: `grep -rln readFileSync app/src --include=*.test.ts` → 15).

## Coverage matrix (executed vs SQL-grep)

| Critical area | Coverage | Durability |
|---|---|---|
| `financialTotals`, center/external split | Behavioral (owner matrices) | **Solid** |
| student aggregation / ledger / statement | Behavioral | **Solid** |
| external-party statement, fee aggregate | Behavioral | **Solid** |
| student identity, calendar, smart-date, password policy | Behavioral (+ e2e) | **Solid** |
| receipt posting **client guard** | Behavioral (mocked) | Good (client only) |
| receipt/payment posting **server invariants** (firewall, overpayment, idempotency, rounding) | **SQL-grep** | **Fragile — false green** |
| fee cancellation, voucher cancellation guard | **SQL-grep** / mocked e2e | **Fragile** |
| RLS ownership enforcement | **SQL-grep** | **Never actually exercised** |
| restore integrity | client `validateBackup` behavioral; server **SQL-grep** / mocked | **Fragile** |
| external-split rounding across values | executed only 100/40 in a shell test **not in CI** | **Unproven** |

## Findings

| ID | Sev | Status | Evidence | Recommendation (not implemented) |
|---|---|---|---|---|
| **TEST-001** (=FIN-006) | **P1** | PROVEN (first-hand) | 15/40 files `readFileSync`+`toContain` | Money-safety SQL tested as string presence — a wrong branch/typo that keeps the string still passes. **The safety net decays silently as SQL evolves.** → Execute invariants against embedded/real Postgres in CI |
| TEST-002 (=OPS-015) | P2 | PROVEN | `ci.yml:4-10` | CI on 2 hard-coded branches (one deleted); current + default get no CI → regressions merge unchecked. → Trigger on default + all PRs |
| TEST-003 (=CODE-013) | P2 | PROVEN (first-hand) | no `strict` in any tsconfig | strict off. → Enable strict + noUncheckedIndexedAccess |
| TEST-004 | P2 | PROVEN | `external_share_layers.sh:6-8` | Only real-DB test, not in CI, one slice (PG16 vs config PG17). → Run + broaden in CI |
| TEST-005 | P2 | PROVEN | `eslint.config.js:12-17` | Non-type-aware lint (no floating-promise/no-misused-promises for async Supabase). → Adopt `recommendedTypeChecked` |
| TEST-006 | P2 | PROVEN | `vitest.config.ts:17-21` | Coverage limited to lib/store, no thresholds, CI runs `npm test` not coverage; mandated 80% unenforced. → Add thresholds + coverage in CI |
| TEST-007 | P2 | PROVEN | `e2e/support/mock-supabase.ts:132-208` | e2e mock re-implements RPCs as always-succeed → cannot catch a server money bug. → Pair with real-DB layer |
| TEST-010 | P3 | SUSPECTED | `amount-in-words.ts:111` | Words truncate decimals while figures show 2dp. → Reconcile |
| TEST-016 (=CODE-002) | P3 | SUSPECTED | `courses.ts:34-42` | `paidFor` omits entryType filter. → Reuse breakdown |

**Assessment:** the *suite* is large and the *client* domain logic is genuinely well tested;
the **server** — where money safety is enforced — is tested almost entirely by text-matching.
For long-term sustainability this is the single highest-leverage fix: without an executable
DB test net, every future migration risks silently breaking a guarantee that CI reports green.
