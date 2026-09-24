# 07 — Performance, Scalability, Reliability & Observability

**Phases 11–12.** Static analysis; no load test → no perf numbers are claimed (BLOCKED —
ACCESS REQUIRED for benchmarks). Build size measured first-hand: single `index-*.js`
**747 KB (203 KB gz)**.

## Scalability (Phase 11) — the central long-term concern

**Model: load-everything-then-aggregate-in-JS.** `use-workspace-store.ts:77-122` loads
*every row* of 7 tables, then `lib/aggregate.ts` computes all totals/statements in the
browser; report filters run over the full in-memory array. Pagination (`fetch-all.ts`) is
**correct** (range loop + `MAX_PAGES` guard, no N+1). **Ceiling:** fine for one center
(hundreds of students / thousands of vouchers); the cold load transfers the entire ledger on
every page-load and JS aggregation grows linearly-to-superlinearly toward tens of thousands
of rows. Every mounted tab re-memoizes `aggregateStudents` over the same data. **This is the
main scalability debt** — it will not fail soon, but it sets a hard ceiling and a growing
first-load cost.

## Reliability & observability (Phase 12)

**Strengths:** `ErrorNotice` + retry on every workspace; read store classifies auth-expiry,
refreshes + retries once; write errors mapped to friendly Arabic messages; idle-logout; **no
secret in logs**. **Gaps** drive the findings below.

## Findings

| ID | Sev | Status | Location | Finding / recommendation (not implemented) |
|---|---|---|---|---|
| OPS-001 | P2 (P1 at scale) | PROVEN | `use-workspace-store.ts:77-122`; `aggregate.ts` | Whole ledger loaded + aggregated in JS; no server aggregation/paging → scaling ceiling. → Server-side SQL views/RPCs + windowed load |
| OPS-002 | P3 | SUSPECTED | mounted tabs | Each tab re-memoizes `aggregateStudents` over full data. → Hoist a shared memoized slice |
| OPS-003 | P3 | PROVEN (first-hand) | 747 KB single chunk; `vite.config.ts` | No code-splitting/lazy; over Vite 500 KB warning. → Route-level `React.lazy` + vendor split |
| OPS-004 | P2 | PROVEN | one-shot load | No realtime/refetch on focus/reconnect → figures silently stale across devices. → Revalidation + "stale" cue |
| OPS-005 | P2 | PROVEN | `main.tsx`, `App.tsx` | **No React error boundary** → any render throw white-screens the app. → Wrap shell in a boundary with reload/report |
| OPS-006 | P2 | PROVEN | 16 `console.error` sites | No remote error tracking/monitoring/alerting/tracing → failures invisible in a financial system. → Add error tracking + uptime alerting |
| OPS-007 | P2 | PROVEN | `activity-log.ts:11-29` | Audit writes fire-and-forget; a failed audit RPC still reports op success → silent audit-trail gaps. → Surface/queue + alert |
| OPS-008 | P3 | SUSPECTED | write stores | Auth-refresh retry only on the read path. → Reuse in write stores |
| OPS-009 | P3 | PROVEN | whole `src` | No offline/reconnection handling. → Offline detect + reconnect banner |

**Long-term reliability outlook:** the app degrades **ungracefully** under three conditions
that become more likely over time — a single render bug (no boundary), a silent server-side
failure (no monitoring), and growing data (client aggregation). None is urgent; all compound.
The measurement plan (cold-load size/time, aggregation wall-time at 10k/50k rows, Web-Vitals
on the 203 KB gz bundle) is BLOCKED — ACCESS REQUIRED (representative data + runtime env).
