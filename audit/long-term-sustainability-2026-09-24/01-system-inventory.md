# 01 — System Inventory, Architecture & Baseline

**Phases 0–1.** Read-only. Commit `bd01683`, branch `claude/21st-magic-mcp-verify-nn04qc`
(clean; only `audit/` untracked before this run).

## Baseline (Phase 0)

| Item | Value |
|---|---|
| Repo | `github.com/MaherTaha203/ArdKanaan` (renamed from `MaherTaha203/-`) |
| Layout | `docs/` (governance + constitutions + ADRs), `app/` (Vite SPA), `vem/`, `audit/` |
| Node / npm | v22.22.2 / 10.9.7 |
| Default branch | `claude/ard-kanaan-phase-0-6rymjv` |
| Secrets on disk | `.env.production` committed but holds only the **public** `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (documented public; RLS is the boundary). No service-role key. No secrets printed in this audit. |
| Governance | Frozen constitutions (PC/BC/UX/DAT/DOM), frozen GOV-\*, **77 ADRs**, explicit financial-firewall lineage. |

## Inventory (Phase 1)

**Stack:** React 19.2, `@supabase/supabase-js` 2.112, zustand 5, react-hook-form 7.84 + zod
3.25, tailwind 4.3, lucide-react 1.28, react-to-print 3.3; Vite 8, TypeScript ~6.0, Vitest
4.1, Playwright 1.62, ESLint 10 + typescript-eslint 8.

**App (`app/src`, 137 files):** shell/nav (`components/shell/`: app-shell, tab-strip,
page-registry, window-frame, action-sheet), UI primitives (`components/ui/`), print
(`components/print` + `features/print`), feature workspaces (`features/`: activity, auth,
courses, financial-report, glance, payment-voucher, receipt-voucher, settings, students),
15 Zustand stores (`store/`), domain logic (`lib/`: aggregate, statement-rows, courses,
voucher, backup, activity-log, fetch-all, format, …), `types/domain.ts`, hooks.

**Database:** 53 SQL migrations (`app/supabase/migrations/`, 2026-08-29 → 2026-09-19) +
`config.toml` (PG 17). 11 base tables, 4 invoker views, RPCs, triggers.

**Tests / CI:** 40 unit `*.test.ts(x)`, 8 e2e spec files (25 tests) + support mocks.
`.github/workflows/ci.yml`: `quality` (tsc, typecheck:test, lint, unit, build) + `e2e`
(playwright). **Triggers only on 2 branches** (default + a deleted branch) + PRs to default.

## Architecture & data flow (the sustainability-critical shape)

```
UI event → useShellStore (nav/overlay)
form (react-hook-form + zod) → COMMAND store → supabase.rpc(post_*/create_*/cancel_*)
                                              → Postgres (RLS + firewall triggers = SOURCE OF TRUTH)
                                    on success → useWorkspaceStore.load() (fetch-all, paginated)
render ← pure READ-MODELS (lib/aggregate.ts) ← raw rows held in the workspace store
```

**Key sustainability fact:** the app is a **thin client that loads all rows and computes
every balance/total/statement in the browser** (`lib/aggregate.ts`), trusting stored
snapshot columns (`remaining_balance`, `course_value`, `external_share`). Server RPCs own
the *write* path; the *read/report* path is client-computed. This single design choice
drives the scalability ceiling (report 07), the source-of-truth findings (report 03), and
the "no server aggregate to disagree" strength (no screen/DB divergence). **Read/write
separation is otherwise clean**, financial fields are immutable after posting, and there are
**no circular imports** (verified in report 05).

**Largest files:** `aggregate.ts` 351, `smart-date-input.tsx` 305, `app-shell.tsx` 302 —
all well under the 800-line cap → good long-term readability.
