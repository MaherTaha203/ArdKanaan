# 07 — Performance, Reliability, Errors & Monitoring

**Phases covered:** 11 (performance & scalability, static) · 12 (errors, logging, monitoring)
**Mode:** static analysis only — no load/stress test was run; no perf numbers are claimed.

---

## Phase 11 — Scalability (static)

**Model: load-everything-then-aggregate-in-JS.** `store/use-workspace-store.ts:77-122`
loads *every row* of seven tables (`students`, `student_statement_lines`,
`financial_movements`, `cancelled_vouchers`, `courses`, `enrollments`,
`fee_obligations`) into memory via `fetchAllRows`; all totals/statements/ledgers are then
computed in the browser in `lib/aggregate.ts`. Report period/account filters
(`financial-report-workspace.tsx:63-77`) run over the full in-memory array — there is no
server-side aggregation and no filtered/paged report query.

- **Pagination (`lib/fetch-all.ts`): correct.** Loops `.range(from, from+999)` until a
  short page ends it, with a `MAX_PAGES=10_000` runaway guard (`fetch-all.ts:23-32`). No
  off-by-one, **no N+1** (initial load is 7 bulk queries in two `Promise.all` batches).
- **Ceiling:** fine for one center (hundreds of students / thousands of vouchers); the
  cold load transfers the entire ledger every page-load, and JS aggregation
  (`aggregateStudents` → per-student `studentCourseBreakdown`, `glance-workspace.tsx:47-58`
  nested filters) grows linearly-to-superlinearly toward tens of thousands of rows.
- **Redundant recompute:** every opened tab stays mounted (`app-shell.tsx` panel loop) and
  each workspace independently memoizes its own `aggregateStudents(...)` over the same
  dataset, so the heavy pass can run 3–4× in parallel and re-runs on any data change.
- **Bundle:** single ~747 KB JS chunk (~201 KB gzip), CSS ~43 KB; `vite.config.ts` sets no
  `manualChunks` / no route-level lazy loading — print + all workspaces ship eagerly, over
  Vite's 500 KB warning threshold.
- **`useMemo` discipline is good** (dependency arrays are honest); the issue is cross-tab
  duplication and the load-all model, not per-view churn.

**Measurements that would be needed (not performed):** cold-load transfer size/time at
representative row counts; `aggregateStudents`/`studentLedger` wall-time at 10k/50k lines;
loaded-array memory; Lighthouse/Web-Vitals on the 201 KB bundle; PostgREST latency for the
7 bulk queries.

## Phase 12 — Errors, logging, monitoring

**Strengths.** `ErrorNotice` (`components/shell/notices.tsx:15-49`) gives load failures an
explicit retry + dismiss, wired into every workspace. The read store classifies
auth-expiry (`use-workspace-store.ts:65-118`), refreshes the session and retries the load
once before showing a friendly Arabic error. Write errors are caught and mapped to
messages (e.g. `use-money-in-store.ts:159-163`). Idle-logout and password-recovery flows
exist. **No secret leakage in logs** — `console.error` logs Supabase error objects, never
credentials; the only env values are the public URL/anon key.

**Gaps (findings below):** no React error boundary; no remote monitoring/alerting/tracing
(only 17 `console.error` sites); fire-and-forget audit writes; auth-refresh retry missing
on the write path; no offline/reconnection handling; no refetch on focus/reconnect so
figures can be silently stale.

---

## Findings (OPS-001 … OPS-009)

| ID | Sev | Conf | Status | Location | Evidence | Impact | Recommendation (not implemented) |
|---|---|---|---|---|---|---|---|
| OPS-001 | P2 (P1 at scale) | High | PROVEN | `store/use-workspace-store.ts:77-122`; `lib/aggregate.ts` | Full unbounded load of 7 tables; all aggregation client-side | Entire ledger transferred every cold load; JS cost grows with data — hard scaling ceiling | Move totals/statements to SQL views/RPCs; windowed load; keep dashboard on aggregates |
| OPS-002 | P3 | Med | SUSPECTED | `app-shell.tsx` panel loop; glance/students/report workspaces | Mounted tabs each memoize `aggregateStudents` over full data | Same heavy pass runs 3–4× in parallel; redundant recompute | Hoist a shared memoized aggregate slice consumed by all tabs |
| OPS-003 | P3 | High | PROVEN | `dist` single chunk; `vite.config.ts` | 747 KB/201 KB gz single chunk, no manualChunks/lazy | Larger first load; over Vite 500 KB warning | Route-level `React.lazy` for print + heavy workspaces; vendor split |
| OPS-004 | P2 | High | PROVEN | `use-workspace-store.ts`; `app-shell.tsx` one-shot load | No realtime; no refetch on focus/visibility/reconnect | Multi-device edits invisible until manual refresh; figures silently stale | Realtime or focus/interval revalidation; "data may be stale" cue |
| OPS-005 | P2 | High | PROVEN | `main.tsx`, `App.tsx` | No `ErrorBoundary`/`getDerivedStateFromError` anywhere | Any render throw white-screens the whole SPA, no recovery | Wrap shell in an error boundary with reload/report fallback |
| OPS-006 | P2 | High | PROVEN | 17 `console.error` sites; no tracker | Only browser-console logging; no Sentry/monitoring/alerting/tracing | Failures in a financial system are invisible to operator/maintainer | Remote error tracking + uptime/alerting; correlation id |
| OPS-007 | P2 | High | PROVEN | `lib/activity-log.ts:11-29`; `void recordActivityEvent(...)` callers | Audit writes fire-and-forget; failure only `console.error`, op still "succeeds" | Silent gaps in the financial audit trail, no alert | Surface/queue audit-write failures; alert on gaps |
| OPS-008 | P3 | Med | SUSPECTED | write stores (e.g. `use-money-in-store.ts:159-163`) vs read store | Auth-expiry refresh+retry only on the read path | Token expiring mid-save → generic error (autoRefresh usually saves it) | Reuse `isAuthError`+`refreshSession` retry in write stores |
| OPS-009 | P3 | High | PROVEN | whole `src` | No `navigator.onLine`/reconnection handling | Offline actions fail generically, no queue | Offline detect + write-block/queue + reconnect banner |

**Positives to preserve:** correct pagination with runaway guard; disciplined `useMemo`;
load-failure retry with auth-refresh; idle logout; small, well-typed files. The
weaknesses here are **operational resilience** (boundary, monitoring, staleness), not the
financial core. Backup/DR (OPS-010…012) → report `08`; docs/maintainability
(OPS-013…015) → report `09`.
