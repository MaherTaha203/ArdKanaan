# 01 — System Inventory & Architecture Map

**Audit:** Full-system structural audit of «أرض كنعان» (Ard Kanaan)
**Date:** 2026-09-24 · **Mode:** Read-only (no code/DB/config change)
**Auditor branch:** `claude/21st-magic-mcp-verify-nn04qc` (working tree clean at audit start)

> This report covers Phase 0 (baseline) and Phase 1 (inventory). All facts below are
> from static inspection of the repository at the commit noted. Live database, hosting,
> and runtime state were **not** queried (see limitations in `12-audit-completion-matrix.md`).

---

## Phase 0 — Baseline & environment

| Item | Value (evidence) |
|---|---|
| Repository | `github.com/MaherTaha203/-` (redirects to `MaherTaha203/ArdKanaan`) |
| Repo root | `/home/user/-` — governance docs (`docs/`), app (`app/`), `vem/`, `README.md` |
| App root | `/home/user/-/app` (Vite + React 19 SPA) |
| Current branch | `claude/21st-magic-mcp-verify-nn04qc` (a UI/navigation work branch) |
| Default branch | `claude/ard-kanaan-phase-0-6rymjv` (per CI + governance skill) |
| Git status at start | clean (no uncommitted/untracked except this new `audit/` folder) |
| Last commits | UI-only series (`ea2cff7` icons, `a9a2252` date-field align, … `8deea37` per-page tabs) |
| Node / npm | Node v22.22.2 / npm 10.9.7 |
| Package manager | npm (single lockfile `app/package-lock.json`) |
| Open PR | #108 (this branch → default), draft-review, must stay unmerged |
| Secrets risk on read | `.env.production` is committed but contains only the **public** Vite vars (project URL + anon key), explicitly documented as public; **no** service-role key or DB password present. `.env.example` mirrors the two public keys. No secrets were printed during this audit. |

**Governance context (authoritative):** the project is documentation-first with frozen
constitutions (`docs/product` PC-\*, `docs/business` BC-\*, `docs/ux` UX-\*, `docs/data`
DAT-\*, `docs/domain` DOM-\*), frozen governance (`docs/governance` GOV-\*), and **77
accepted ADRs** (`docs/decisions/ADR-0001…ADR-0077`). A **financial firewall** is an
explicit, repeatedly-reinforced law (migration `20260903182300_financial_firewall.sql`
and the ledger hard-lock lineage). The current work-line is ADR-0074 (product/app UI
evolution, non-authoritative, firewall absolute).

---

## Phase 1 — Component inventory

### 1.1 Tech stack (from `app/package.json`)

**Runtime deps:** React 19.2, react-dom 19.2, `@supabase/supabase-js` 2.112,
zustand 5.0, react-hook-form 7.84 + `@hookform/resolvers` 5.7, zod 3.25,
tailwindcss 4.3 (+ `@tailwindcss/vite`, `tw-animate-css`), lucide-react 1.28,
class-variance-authority, clsx, tailwind-merge, react-to-print 3.3.

**Dev/build:** Vite 8.2, TypeScript ~6.0.2, typescript-eslint 8.65, ESLint 10.8,
Vitest 4.1 (+ `@vitest/coverage-v8`, jsdom), Playwright 1.62, Testing Library
(react/user-event/jest-dom).

**Entry points:** `app/index.html` → `src/main.tsx` → `src/App.tsx` → auth gate →
`AppShell` (`src/components/shell/app-shell.tsx`).

### 1.2 Application layers (`app/src`, 137 source files)

| Layer | Location | Role |
|---|---|---|
| Shell / navigation | `components/shell/` | `app-shell.tsx` (top bar, tab model, mobile nav), `tab-strip.tsx`, `page-registry.ts`, `window-frame.tsx`, `action-sheet.tsx`, `notices.tsx` |
| UI primitives | `components/ui/` | button, input, field, money, toast, skeleton, smart-date-input, etc. |
| Print | `components/print/` + `features/print/` | print-preview, voucher-print, financial-report-print, student-statement-print |
| Feature workspaces | `features/*` | activity, auth, courses, financial-report, glance (home), payment-voucher, receipt-voucher, settings, students |
| State (Zustand) | `store/` (15 files) | see 1.3 |
| Domain logic | `lib/` (financial + utilities) | see 1.4 |
| Types | `types/domain.ts` | single domain type module |
| Hooks | `hooks/use-app-preferences.ts` | root settings + idle logout |

### 1.3 Stores (`src/store/`)

`use-auth-store` (Supabase Auth session), `use-workspace-store` (**the main read
model** — loads students, movements, statement lines, enrollments, fee obligations,
courses), `use-shell-store` (UI navigation: `activeTab`/`openTabs` PageKey model,
overlays), `use-settings-store` (app preferences), `use-backup-store`,
`use-money-in-store` / `use-money-out-store` (voucher posting), `use-voucher-admin-store`
(edit/cancel), `use-student-admin-store`, `use-student-archive-store`,
`use-course-admin-store`, `use-fee-obligation-store`. (Several have co-located `.test.ts`.)

### 1.4 Domain / financial logic (`src/lib/`)

Financial core: `aggregate.ts` (financialTotals, aggregateStudents, studentLedger,
studentCourseBreakdown, externalPartyStatement, receiptCount/paymentCount),
`statement-rows.ts`, `student-identity.ts`, `voucher.ts`, `courses.ts`,
`amount-in-words.ts`, `fetch-all.ts` (pagination), `backup.ts`, `activity-log.ts`,
`format.ts` (Western-digit money/date), `smart-date.ts`, `calendar.ts`, `env.ts`,
`supabase.ts`, `text.ts`, `utils.ts`. **28 co-located `*.test.ts` files** in `lib/`.

> **Architectural note (cross-cutting):** the app is a **thin client over Supabase**.
> `use-workspace-store` fetches raw rows and **all balances/totals/statements are computed
> in the browser** by `lib/aggregate.ts` over already-loaded data. Server-side RPCs own
> the *write* path (posting receipts/payments, cancellation, enrollment); the *read/report*
> path is client-computed and trusts stored snapshot columns (`remainingBalance`,
> `courseValue`, `externalShare`). This shapes the financial-integrity findings (report 03)
> and the scalability findings (report 07).

### 1.5 Database (`app/supabase/migrations/`, 53 SQL migrations)

Chronological lineage (2026-08-29 → 2026-09-19): money-in/out/report sprints → RLS
(authenticated-only → owner-only reconciled) → students id_number → edit/cancel audit →
restore hardening → enrollments → **financial_firewall** → activity-log guard → courses
→ enrollment firewall → financial-integrity checks/indexes → receipt fee distribution →
fee obligations + allocations → posting integrity/idempotency lineage → **financial_ledger**
(+ append-only cleanup + hard-lock) → security hardening/advisor cleanup → FK indexes →
enrollment/fee-cancellation RPCs → student archive lifecycle → standalone fee obligations.
Full schema map and constraint/index inventory: report `02-database-audit.md`.

### 1.6 Tests & CI

- **Unit (Vitest):** 40 `*.test.ts(x)` files (28 in `lib/`, several in `store/` and
  `features/`). Excluded from the app tsconfig build; separate `typecheck:test`.
- **E2E (Playwright):** 10 specs in `app/e2e/` + `e2e/support/` (mock-supabase, actions).
  Config supports `PW_CHROMIUM_PATH` for a pre-installed browser.
- **CI:** `.github/workflows/ci.yml` — job `quality` runs `tsc -b`, `typecheck:test`,
  `lint`, `npm test`, `build`; job `e2e` installs chromium and runs Playwright.
  **Triggers:** push to `claude/ard-kanaan-phase-0-6rymjv` and
  `fix/finance-receipt-enrollment-only`, and PRs targeting the default branch. (Finding:
  narrow push triggers — see report 07/09.)

### 1.7 Build / config posture

- `tsconfig.app.json`: bundler mode, `noUnusedLocals`, `noUnusedParameters`,
  `noFallthroughCasesInSwitch`. **`strict` is NOT set in any tsconfig** (verified:
  `grep -rn strict tsconfig*.json` → none). See finding in report 05.
- ESLint flat config: `js.recommended` + `typescript-eslint recommended` (not the
  **type-checked** variant) + react-hooks + react-refresh. No custom financial-safety rules.
- `supabase.ts`: single browser client using the **anon** key, `persistSession:true`
  (Supabase default storage = `localStorage`), device-id + timezone headers.

---

## 1.8 High-level flow (main financial read path)

```
User → feature workspace (.tsx)
      → useWorkspaceStore.load()  ── fetch-all (paged) ──▶ Supabase (RLS: authenticated/owner)
      → raw rows: students, movements, statement_lines, enrollments, fee_obligations, courses
      → lib/aggregate.ts  (financialTotals / aggregateStudents / studentLedger / externalPartyStatement)
      → rendered totals, statements, reports, print
Write path (separate): voucher sheets → money-in/out & admin stores → RPC (SECURITY DEFINER) → DB ledger/vouchers
```

Detailed per-operation flow, sources of truth, and the financial-isolation matrix are in
report `03-financial-integrity-audit.md`.
