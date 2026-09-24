# 10 — Unified Findings Register

All findings, deduplicated and cross-referenced, ranked by cross-verified severity.
**Status:** PROVEN · SUSPECTED (needs live data) · IMPROVEMENT. Evidence/reverify steps are
in reports 02–09 (by ID prefix). **Totals: P0 = 0 · P1 = 1 · P2 = 24 · P3 = 33.** No proven
money-corruption, secret leak, or data-loss defect was found statically.

## P0 — none

The financial firewall (RPC-only writes, append-only ledger, immutable snapshots, conserved
splits), owner-only RLS, and anon-key-only client are sound in code. Live-DB confirmation
still required (report 12).

## P1 — High

| ID (aliases) | Area | Finding | Status |
|---|---|---|---|
| **TEST-001** (= FIN-006) | Test durability / financial assurance | Server money-safety guarantees (posting firewall, overpayment ceilings, idempotency, external-share rounding, cancellation, restore) verified **only by grepping migration SQL text** (15/40 files, confirmed first-hand) — false green; the safety net erodes silently as SQL evolves. Constituent agents rated High/P2; elevated to P1 for the sustainability lens. | PROVEN |

## P2 — High-impact (financial correctness · access · reliability · process)

| ID (aliases) | Finding | Status |
|---|---|---|
| FIN-001 (= DB-001) | Fractional `external_share` vs frozen whole-shekel rule (conservation preserved) | PROVEN divergence |
| CODE-002 (= TEST-016) | Two sources of truth for course paid/remaining → can show a wrong number | PROVEN divergence |
| FIN-002 | Per-student remaining can overstate when legacy + allocated receipts coexist (books still balance) | SUSPECTED |
| SEC-001 (= DB-011) | `complete_student`/`reactivate_student` lack `is_owner()` gate / revoke | PROVEN |
| DB-002 | Restore aborts on any standalone fee obligation | PROVEN |
| DB-003 | Retroactive CHECK may fail to apply (data-dependent) | SUSPECTED / BLOCKED |
| CODE-001 | Fee-paid math copy-pasted into components (drift) | PROVEN |
| CODE-003 | Duplicate row types + normalizers can diverge | PROVEN |
| CODE-004 | Unvalidated DB reads via `as` casts | PROVEN |
| CODE-013 (= TEST-003) | TypeScript `strict` disabled | PROVEN |
| OPS-001 | Whole ledger loaded + aggregated in JS — scaling ceiling | PROVEN |
| OPS-004 | No refetch on focus/reconnect → stale figures | PROVEN |
| OPS-005 | No React error boundary | PROVEN |
| OPS-006 | No monitoring/alerting/tracing | PROVEN |
| OPS-007 | Fire-and-forget audit writes → silent gaps | PROVEN |
| OPS-010 | Backup manual/local/unencrypted | PROVEN |
| OPS-011 | Server restore path untested | PROVEN |
| OPS-012 | Safety copy on the same device as backups | PROVEN |
| OPS-013 (= TEST-012) | README is the stock Vite template | PROVEN |
| OPS-014 | No ops/DR/data-flow docs | PROVEN |
| TEST-002 (= OPS-015) | CI on 2 branches only | PROVEN |
| TEST-004 | Only real-DB test not in CI, one slice | PROVEN |
| TEST-005 | Non-type-aware lint | PROVEN |
| TEST-006 | No coverage enforcement; UI excluded | PROVEN |
| TEST-007 | e2e mock enforces no DB invariant | PROVEN |
| SEC-002 | Public signup enabled (config; verify prod) | SUSPECTED / BLOCKED |
| (deploy/migration/rollback) | No deploy config; migration-apply untested; prod schema unverified | PROVEN / SUSPECTED |

## P3 — Lower (hardening · cleanup · minor UX · docs)

SEC-003 (server password policy), SEC-004 (owner MFA), SEC-006 (view grant drop / drift),
SEC-007=DB-006 (owner_identity no RLS), SEC-008 (unbounded date/text), SEC-009 (count
disclosure), SEC-005=TEST-015 (localStorage session); DB-004 (shrink guard), DB-005
(dup constraints/index drift), DB-007 (polymorphic FK), DB-008 (schema vs constitution),
DB-009 (audit_log append-only by convention), DB-010 (audit_log no indexes); FIN-003
(direct insert path), FIN-004 (idempotency key per submit), FIN-005 (net vs closing labels);
CODE-005..012 (dead files/store surface, unreachable branch, RTL arrow keys, missing guard,
duplicated labels, console logging, quadratic count); OPS-002 (tab recompute), OPS-003
(bundle), OPS-008 (write-path auth retry), OPS-009 (offline); TEST-008 (unused dep), TEST-009
(fonts CDN), TEST-010 (words vs 2dp), TEST-011 (no deploy/`dist` committed), TEST-013
(offline audit), TEST-014 (env committed).

## Cross-verification corroborations (independent agreement)

- **strict off** — auditor grep (first-hand) + testing agent (TEST-003) + architecture
  correction. **Confirmed.**
- **SQL-text-only testing** — FIN-006 = TEST-001, re-confirmed first-hand (15 files). **Confirmed.**
- **fractional external_share** — FIN-001 = DB-001, migration lines re-confirmed first-hand. **Confirmed.**
- **lifecycle RPC guard gap** — SEC-001 = DB-011, re-confirmed first-hand. **Confirmed.**
- **owner_identity no RLS** — SEC-007 = DB-006. **Confirmed.**
- **courses.ts paid leak** — CODE-002 = TEST-016; adjacent FIN-002. **Confirmed.**
- **README/ops docs; narrow CI** — OPS-013=TEST-012; TEST-002=OPS-015. **Confirmed.**
