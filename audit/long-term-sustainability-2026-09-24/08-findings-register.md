# 08 — Findings Register (Sustainability)

Severity: **P0** stop-the-line · **P1** fix before long-term reliance · **P2** plan/needed at
scale · **P3** low. **Verification tier:** [static] code/SQL · [app-test] vitest · [measured]
this session · [LIVE] would need production/isolated DB (**NOT VERIFIED IN LIVE
ENVIRONMENT**). **Totals: 0 P0 · 1 P1 · ~14 P2 · rest P3.**

## Part A — Verification of the prior audit (`audit/full-system-audit-2026-09-24/`)

Prior findings were **re-checked, not copied.** Key ones:

| Prior ID | Description | Still valid? | Current evidence (this session) | Severity change | Tier |
|---|---|---|---|---|---|
| TEST-001 / FIN-006 | Server money-safety tested by SQL text-matching | **Yes** | `grep readFileSync …*.test.ts` → **15 files** (first-hand) | Held at **P1** (sustainability) | [measured] |
| CODE-013 / TEST-003 | TS `strict` off | **Yes** | `grep strict tsconfig*.json` → none (first-hand) | Same (P2) | [measured] |
| FIN-001 / DB-001 | Fractional `external_share` | **Yes** | whole-shekel CHECK added `20260915093000:30`, dropped `20260916110000:10` (first-hand) | Same (P2) | [static] |
| SEC-001 / DB-011 | Lifecycle RPCs lack `is_owner()` | **Yes** | `complete_student`/`reactivate_student` at `20260916116500:68,91`, no gate/DEFINER (first-hand) | Same (P2) | [static] |
| CODE-002 / TEST-016 | Two sources of truth for course paid/remaining | **Yes** | `courses.ts:34-42` vs `aggregate.ts:123-179` | Reframed **FIN-A2** (grows w/ name reuse) | [static] |
| OPS-001 | Load-all + client aggregation | **Yes, quantified** | benchmark: linear ~1 ms/1k lines; ~90 MB heap @200k | Same (P2; P1 at high scale) | [measured] |
| DB-010 | `audit_log` unindexed | **Yes** | migrations show no index; activity page loads+sorts whole table | Raised salience (fastest grower) | [static] |
| OPS-005/006/010/011/012 | No boundary/monitoring; manual/untested backup | **Yes** | re-read code | Same (P2) | [static] |
| Suites green | tsc/lint/unit/e2e/audit | **Yes** | re-run: 0 / clean / 221 / 25 / 0 | — | [measured] |
| Any prior fix "done"? | — | **None applied** | working tree changed only under `audit/` | — | [measured] |

**Production-state prior items remain [LIVE] / NOT VERIFIED:** applied migrations, applied
RLS/grants, prod Auth settings, row-level integrity.

## Part B — Sustainability findings register

| ID | Description | Evidence | Impact | Likelihood over 10y | Sev | Verify | Recommendation (not implemented) |
|---|---|---|---|---|---|---|---|
| **SUS-01** (P1) | Server money guarantees verified only by SQL text-matching | 15 test files `readFileSync` | A silently-broken firewall/idempotency/rounding passes CI as the SQL evolves | High (SQL will change) | **P1** | [measured] | Executable [real-PG] tests in CI (`10`) |
| SUS-02 | Load-all + client aggregation ceiling | benchmark `05` | Sluggish home/list/report at 50k–100k lines (~Yr3–5 Medium) | High | P2 | [measured] | Server-side aggregation + windowed load |
| SUS-03 | `audit_log` unindexed + fully loaded on activity page | DB-010; `activity-workspace` | Activity page is the **first** bottleneck; grows fastest | High | P2 | [static]→[LIVE] | Index `(changed_at desc)`; paginate/limit the page |
| SUS-04 | No error boundary | `main.tsx`/`App.tsx` | One render bug → whole-app white screen | Med–High | P2 | [static] | Add boundary + fallback |
| SUS-05 | No monitoring/alerting/tracing | 16 `console.error` | Financial failures invisible; slow to diagnose | High | P2 | [static] | Remote error tracking + uptime alerts |
| SUS-06 | Manual/local/unencrypted, untested backup+restore | `06` | Real data-loss window; recovery unproven | Med (but severe) | P2 | [static] | Automated offsite encrypted backups + tested restore |
| SUS-07 | Narrow CI triggers | `ci.yml:4-10` | Regressions merge without CI | High | P2 | [static] | Trigger on default + all PRs |
| SUS-08 (=FIN-A2) | Course paid/remaining second source of truth (same-name path) | `courses.ts` vs `aggregate.ts` | Wrong displayed course number as names are reused | Med, rising | P2 | [static]→[LIVE] | Single source of truth |
| SUS-09 (=FIN-001) | Fractional external share vs whole-shekel | migration lines | Fractional institute figures accumulate | Med | P2 | [static] | Governance decision |
| SUS-10 (=SEC-001) | Lifecycle RPC guard gap | `20260916116500` | Defense-in-depth gap on status mutations | Low today | P2 | [static] | Add gate + revoke |
| SUS-11 (=DB-002) | Restore aborts on standalone fee obligation | restore RPC vs `20260919130000` | First prod restore after the feature fails wholesale | Med (when shipped) | P2 | [static] | Align restore validation first |
| SUS-12 | TS `strict` off | tsconfig | Null/undefined bugs uncaught; worsens with contributors | Med | P2 | [measured] | Enable strict incrementally |
| SUS-13 | No deploy/rollback; `dist/` committed; migration apply untested; repo↔prod drift | `ci.yml`; `08`(SEC-006) | Release/schema hazards over time | Med | P2 | [static]→[LIVE] | Deploy config + rollback + CI reset test; reconcile drift |
| SUS-14 | No ops/DR/data-flow docs; stock README | `docs/`, `README.md` | High operational bus-factor | High | P2 | [static] | Runbook + architecture + DR docs |
| P3 set | strict-adjacent lint (TEST-005), coverage (TEST-006), e2e enforces nothing (TEST-007), backup-history select cap (FIN-A4-adjacent), OPS-002/003/008/009, CODE-001/003/004/005-012, DB-004/005/006/007/008/009, SEC-002/003/004/005/006/007/008/009, FIN-003/004/005, TEST-008/009/010/013/014 | per `03`–`07` | maintainability/perf/hardening | — | P3 | mixed | see `09` |

**No P0.** No finding warrants stopping current operations; the P1 and the P2 cluster are
about **long-term** durability, performance headroom, and recoverability — not a live defect.
