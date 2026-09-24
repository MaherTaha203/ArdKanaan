# 10 — Unified Findings Register

All findings from the 16-phase audit, deduplicated and cross-referenced, ranked by final
severity. **Severity** reflects the cross-verified whole-system view and may differ from a
single agent's local rating (noted where so). **Status:** PROVEN (from code/config) ·
SUSPECTED (needs live data) · IMPROVEMENT. Evidence and reverify steps are in the
per-domain reports (02–09) cited by ID prefix (DB/FIN/SEC/CODE/TEST/OPS).

**Totals:** P0 = 0 · P1 = 1 · P2 = 24 · P3 = 33. No proven money-corruption, secret leak,
or data-loss defect was found statically.

---

## P0 — Critical (money corruption / secret leak / breach / data loss)

**None found.** The financial firewall (RPC-only writes, append-only ledger, immutable
snapshots, conserved splits), the owner-only RLS model, and the anon-key-only client are
all sound in code. (Live-DB confirmation still required — see report 12 limitations.)

## P1 — High

| ID (aliases) | Area | Finding | Status | Ref |
|---|---|---|---|---|
| **TEST-001** (= FIN-006) | Testing / financial assurance | **Server-enforced money-safety guarantees are "tested" only by grepping migration SQL text** (`readFileSync`+`toContain` in 15/40 files). The posting firewall, overpayment ceilings, idempotency dedupe, external-share rounding, cancellation reversal, and restore integrity pass **whether or not the SQL is correct** — a false green. The only executable DB test (`external_share_layers.sh`) is not in CI and covers one slice. *(Constituent agents rated High/P2; elevated to P1 here because for a financial system the entire safety net is unverified.)* | PROVEN | 06, 03 |

## P2 — High-impact (financial correctness · access defense-in-depth · reliability · process)

| ID (aliases) | Area | Finding | Status | Ref |
|---|---|---|---|---|
| FIN-001 (= DB-001) | Financial | Fractional `external_share` (whole-shekel check dropped; RPC `round(...,2)`) → institute/external report figures can show agorot, contradicting frozen whole-shekel (DR-025/ADR-0014). **Conservation preserved — no money lost.** | PROVEN divergence | 03, 02 |
| CODE-002 (= TEST-016) | Financial / code | Two sources of truth for course paid/remaining: `courses.ts paidFor` (by name, no entryType filter) vs `aggregate.ts studentCourseBreakdown` (by enrollmentId, filtered). Can double-count same-named enrollments / count a fee line as course payment / show negative remaining → Course Detail can disagree with the Student ledger. | PROVEN divergence (impact needs data) | 05, 06 |
| FIN-002 | Financial | Per-student **remaining** can be overstated when a legacy overpaid receipt and an allocated receipt coexist on one enrollment (two window partitions never see each other). studentLedger balance unaffected; display-only. | SUSPECTED (needs legacy data) | 03 |
| SEC-001 (= DB-011) | Security | `complete_student`/`reactivate_student` RPCs are SECURITY INVOKER with **no `is_owner()` gate and not revoked from public/anon** — unlike every other mutation. Safe today only via the `students` UPDATE RLS; defense-in-depth layer absent. | PROVEN | 04, 02 |
| DB-002 | Database / DR | `restore_center_data` still requires non-null student+course+enrollment, so a backup with any standalone (course-less) fee obligation **aborts the whole restore**. Repo-only feature today; will bite first production restore after it ships. | PROVEN (contradiction) | 02, 08 |
| DB-003 | Database | Retroactive `check (fee_category is null or allocation_mode)` fails to apply if any direct-fee receipt exists with `allocation_mode=false` (data-dependent). | SUSPECTED (needs live) | 02 |
| CODE-001 | Code / financial | Fee-paid formula copy-pasted into 3 components + inline institute-revenue recompute — financial math in `.tsx`, drift risk. | PROVEN | 05 |
| CODE-003 | Code | Duplicate row types + normalizers (`use-workspace-store` vs `use-money-in-store`, latter hard-codes `status:'active'`) can diverge. | PROVEN | 05 |
| CODE-004 | Code | DB read rows trusted via `as` casts with no runtime validation at the boundary → schema/view drift surfaces as runtime NaN/undefined, not a caught error. | PROVEN | 05 |
| CODE-013 (= TEST-003) | Config | **TypeScript `strict` disabled** project-wide (no strictNullChecks/noImplicitAny) — weak null/any safety for a financial app. | PROVEN | 05, 06 |
| OPS-001 | Performance | Whole ledger loaded to the client and aggregated in JS; no server-side aggregation/paging — scaling ceiling (P1 at large data). | PROVEN | 07 |
| OPS-004 | Reliability | No realtime/refetch on focus/reconnect → figures can be silently stale across devices. | PROVEN | 07 |
| OPS-005 | Reliability | **No React error boundary** — any render throw white-screens the whole app. | PROVEN | 07 |
| OPS-006 | Observability | No remote error tracking/monitoring/alerting/tracing (only `console.error`) — failures invisible in a financial system. | PROVEN | 07 |
| OPS-007 | Audit trail | Audit writes are fire-and-forget; a failed audit RPC still reports op success → silent audit-trail gaps. | PROVEN | 07 |
| OPS-010 | Backup | Backup is a **manual** browser JSON download — no schedule/offsite/encryption/retention/immutability. | PROVEN | 08 |
| OPS-011 | DR | Server restore path (heavy validation) has **no executable test** (e2e mocks it). | PROVEN | 08 |
| OPS-012 | DR | Pre-restore safety copy lands on the **same device** as the routine backup. | PROVEN | 08 |
| OPS-013 (= TEST-012) | Docs | README is the stock Vite template — no run/env/DB/deploy/backup/architecture content. | PROVEN | 09 |
| OPS-014 | Docs | `docs/` has no ops runbook, DR/restore procedure, data-flow, or critical-files list. | PROVEN | 09 |
| TEST-002 (= OPS-015) | CI/CD | CI triggers only on 2 hard-coded branches (one deleted); current + default branch get **no CI**. | PROVEN | 06, 08 |
| TEST-004 | Testing | Only real-DB test not in CI; covers one slice (also PG16 vs config PG17). | PROVEN | 06 |
| TEST-005 | Lint | Non-type-aware ESLint (no floating-promise/no-misused-promises for async Supabase). | PROVEN | 06 |
| TEST-006 | Testing | No coverage thresholds; UI excluded from measurement; mandated 80% unenforced. | PROVEN | 06 |
| TEST-007 | Testing | e2e mock re-implements RPCs as always-succeed — cannot catch a server money bug. | PROVEN | 06 |
| SEC-002 | Auth (config) | Local config enables public signup + no email confirmation (self-registered JWT still fails `is_owner()`); verify production. | SUSPECTED (needs live) | 04 |
| (deploy) | Deploy | No deploy config/job; no rollback doc; migration-apply untested in CI; production schema state unverified from repo. | PROVEN (absence) / SUSPECTED | 08 |

## P3 — Lower (hardening · cleanup · minor UX · docs polish)

| ID | Area | Finding | Ref |
|---|---|---|---|
| SEC-003 | Auth | Weak server password policy (len 6, no requirements); strong policy client-only — verify prod | 04 |
| SEC-004 | Auth | No MFA on the sole owner account — verify prod | 04 |
| SEC-006 | DB/access | `financial_movements` view SELECT grant dropped in a migration → from-scratch reset breaks report read (fails safe); drift signal | 04 |
| SEC-007 (= DB-006) | DB | `owner_identity` has no RLS (revoke-only) and no FK to `auth.users` (lockout if first user deleted) | 04, 02 |
| SEC-008 | Input | `voucher_date` unbounded; descriptive fields only `btrim` (not injection/authz) | 04 |
| SEC-009 | Errors | Minor count disclosure in `RESTORE_SHRINKS` (owner-only) — acceptable | 04 |
| DB-004 | DR | Shrink guard omits `receipt_allocations`/`fee_obligations` | 02, 08 |
| DB-005 | DB | Duplicate CHECK constraints; partial-vs-full unique index drift | 02 |
| DB-007 | DB | Polymorphic `source_id`/`entity_id` without FK (orphan risk bounded) | 02 |
| DB-008 | Traceability | Implemented schema is a smaller MVP than the frozen constitution (expected per P4-000) | 02 |
| DB-009 | DB | `audit_log` append-only by convention, not trigger (vs frozen DB-157) | 02 |
| DB-010 | Performance | `audit_log` has no indexes (timeline scans grow) | 02 |
| FIN-003 | Financial | Plain course receipts have an owner-only direct insert path bypassing the RPC (feeds FIN-002) | 03 |
| FIN-004 | Financial | Idempotency key regenerated per submit (layered guards cover it) | 03 |
| FIN-005 | UX | Screen net vs print closing-balance semantics differ (by design; can confuse) | 03 |
| CODE-005 | Code | Dead component files (position-panel, emblem-mark, falcon-frieze) | 05 |
| CODE-006 | Code | Dead store surface from the pre-tab model | 05 |
| CODE-007 | Code | Unreachable `PageView` `case 'home'` | 05 |
| CODE-008 | a11y | TabStrip arrow keys ignore RTL direction | 05 |
| CODE-009 | Code | Cancel/update lack the `isSaving` re-entrancy guard money-in/out have | 05 |
| CODE-010 | Code | `feeCategory` label triplet duplicated ~6× | 05 |
| CODE-011 | Code | `console.error` as the logging mechanism (16 sites) | 05 |
| CODE-012 | Code/perf | Per-row quadratic count in Course Detail; duplicate descriptions read inflated | 05 |
| OPS-002 | Performance | Mounted tabs each re-memoize `aggregateStudents` over full data | 07 |
| OPS-003 | Performance | Single 747 KB chunk, no code-splitting/lazy | 07 |
| OPS-008 | Reliability | Auth-refresh retry only on the read path, not writes | 07 |
| OPS-009 | Reliability | No offline/reconnection handling | 07 |
| TEST-008 | Deps | Unused dependency `tw-animate-css` | 09 |
| TEST-009 | Build | Runtime Google-Fonts CDN dependency | 08 |
| TEST-010 | Financial/print | Amount-in-words truncates decimals while figures show 2dp | 06 |
| TEST-011 | Deploy | No deploy mechanism; `dist/` committed | 08 |
| TEST-013 | Deps | `npm audit` ran offline — not a live guarantee | 09 |
| TEST-014 | Config | `.env.production` (anon key + URL) committed to git (public by design) | 09 |
| SEC-005 (= TEST-015) | Security | Session JWT in `localStorage` (XSS-reachable; low today) | 04, 09 |

---

### Cross-verification corroborations (independent agents agreeing)

- **TypeScript strict off** — found independently by the auditor (grep), the testing agent
  (TEST-003), and corrected against the architecture agent's stray "strict" note. **Confirmed.**
- **SQL-text-only testing** — FIN-006 (financial agent) = TEST-001 (testing agent). **Confirmed.**
- **Fractional external_share** — FIN-001 (financial) = DB-001 (database). **Confirmed.**
- **Lifecycle RPC guard gap** — SEC-001 (security) = DB-011 (database). **Confirmed.**
- **owner_identity no RLS** — SEC-007 (security) = DB-006 (database). **Confirmed.**
- **courses.ts paid leak** — CODE-002 (architecture) = TEST-016 (testing); adjacent to FIN-002. **Confirmed.**
- **README stock / no ops docs** — OPS-013 = TEST-012. **Confirmed.**
- **Narrow CI** — TEST-002 = OPS-015. **Confirmed.**
