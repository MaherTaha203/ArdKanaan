# 05 — Architecture, Code Quality & UI/State

**Phases covered:** 2 (architecture / separation of concerns) · 8 (UI / navigation / state) · 9 (code quality & AI-generated-code risk)
**Toolchain (real output):** `npx tsc -b` → **exit 0, no diagnostics** · `npm run lint` (eslint 10 + typescript-eslint 8 + react-hooks) → **exit 0, clean**.

The codebase passes its type/lint gate cleanly: **no `any` in application code** (only `as unknown` in tests), **no empty catch**, **no `dangerouslySetInnerHTML` / innerHTML / eval / `javascript:` URL / `target="_blank"`**. Env is Zod-validated `import.meta.env` with only the public anon key. The findings below are structural/quality, not gate failures.

> **Correction vs a stray agent note & the tsconfig:** although the code is clean at the
> gate, **TypeScript `strict` is not enabled** in any tsconfig (independently verified:
> `grep -rn strict tsconfig*.json` → none). `tsc` therefore runs without `strictNullChecks`
> / `noImplicitAny`. Practical exposure is reduced (no `any`, clean build), but for a
> financial app this is a real safety gap → see CODE-013.

## Layering & sources of truth (Phase 2)

```
main.tsx → useAuthStore.init()            (document dir=rtl lang=ar)
App.tsx  → gate: !ready→spinner · recovering→RecoveryGate · session?AppShell:OpeningGate
AppShell → useShellStore (nav/overlay, UI-only) + useWorkspaceStore.load() once
  form (react-hook-form + zodResolver, schema in features/*/schema.ts)
     → COMMAND store (money-in / money-out / voucher-admin / course-admin / student-admin / archive / fee-obligation)
        → supabase.rpc('post_receipt_with_allocations' | 'post_payment_voucher' | …)  OR  descriptive-only .update()
           → Postgres (RLS + financial-firewall triggers = SOURCE OF TRUTH)
        → on success: useWorkspaceStore.load()  (re-fetch all, paginated)
  render ← pure READ-MODELS (lib/aggregate.ts, lib/courses.ts, lib/statement-rows.ts) ← Money/formatNumber/formatDate (Western digits)
```

Read/write separation is **well done**: `useWorkspaceStore` is the single read cache;
command stores are near-stateless action wrappers; financial fields are immutable after
posting (edits touch only `payer_name`/`notes`); DB RPCs + firewall triggers are the write
authority. Derivations are pure selectors — **except** course paid/remaining is derived two
different ways (CODE-002).

## Page / state inventory (Phase 8)

State-based nav (`use-shell-store.ts`); `PageKey = section:view`; open tabs kept mounted
(`WindowFrame`) so per-page state survives switches; `withTab()` dedupes; home permanent.
10 page components across home/students/courses/report/settings, plus 7 keyed overlays.
Observed good on every workspace: loading (`SkeletonRows`), empty, and error
(`ErrorNotice` + retry) states; save toasts; double-submit guards on money-in/out;
TabStrip roving-tabindex + `aria-selected/controls`; Zod-validated forms; Western-digit +
RTL rendering. UX posture is solid.

## Findings (CODE-001 … CODE-013)

> IDs renumbered CODE-\* for the register; the architecture pass labelled them ARCH-\*.

| ID | Sev | Conf | Status | Location | Evidence / impact | Recommendation (not implemented) |
|---|---|---|---|---|---|---|
| CODE-001 | P2 | High | PROVEN | `lib/aggregate.ts:181-185`; `glance-workspace.tsx:52`; `receipt-sheet.tsx:68`; `financial-report-workspace.tsx:91` | Fee-paid formula (`entryType==='fee' && feeObligationId===fee.id`) copy-pasted 3×; institute-revenue recomputed inline — financial math living in `.tsx`, drift risk | Export one `feePaid`/`feeRemaining` from `aggregate.ts`; components call it |
| **CODE-002** | **P2 (→P1 candidate)** | Med (divergence PROVEN) | **PROVEN divergence** | `lib/courses.ts:34-42,62` vs `lib/aggregate.ts:123-179` | **Two sources of truth for course paid/remaining.** `courses.ts paidFor` matches by `studentId+courseName`, no `entryType` filter; `studentCourseBreakdown` matches by `enrollmentId`, filters `entryType==='course'`. → (i) two same-named enrollments double-count payments in Course Detail/list tiles; (ii) a fee line whose snapshot courseName == course name is counted as course payment; (iii) `remaining=courseValue-paid` can go negative despite its comment. **Course Detail numbers can disagree with the Student Statement ledger.** | Make `courses.ts` reuse `studentCourseBreakdown` so both screens share one function. **Cross-verify with report 03 (financial).** |
| CODE-003 | P2 | High | PROVEN | `use-workspace-store.ts:32-39` & `use-money-in-store.ts:18-64` | `StudentRow`/`StudentStatementRow`/`normalizeStudent`/`normalizeStatementLine` defined twice; the money-in copy hard-codes `status:'active'` → normalizers can diverge | Extract shared row types + normalizers to one module |
| CODE-004 | P2/P3 | High | PROVEN | `use-money-in-store.ts:78,129`; `use-money-out-store.ts:48`; `use-backup-store.ts:124`; `backup-history.tsx:51`; `use-voucher-admin-store.ts:88-117` | DB read rows trusted via `as` casts, no runtime validation at the data boundary → a view/schema change surfaces as runtime NaN/undefined, not a caught error | Zod-parse read rows (write side already models payloads) |
| CODE-005 | P3 | High | PROVEN | `shell/position-panel.tsx`, `brand/emblem-mark.tsx`, `brand/falcon-frieze.tsx` | Dead component files, imported nowhere | Delete or wire in |
| CODE-006 | P3 | High | PROVEN | `use-shell-store.ts:72-79,137-144`; `use-money-in-store.ts:8,88`; `use-money-out-store.ts:8,57` | Dead store surface from the pre-tab model (`navigateStudents/navigateReport/openReceiveFor`, `currentView`/`goTo*`) | Prune |
| CODE-007 | P3 | High | PROVEN | `app-shell.tsx:63-64` vs `:165` | `PageView` `case 'home'` is unreachable (home rendered separately, filtered out of the loop) | Remove dead branch |
| CODE-008 | P3 | Med | SUSPECTED | `tab-strip.tsx:28-29` | Tab `ArrowRight` always `current+1` (DOM order), ignoring RTL reading direction | Map arrows to visual/RTL direction |
| CODE-009 | P3 | — | IMPROVEMENT | `use-voucher-admin-store.ts:46,123,145` vs money-in/out | Cancel/update lack the `isSaving` re-entrancy guard money-in/out have (button-disable + idempotent SQL still protect) | Add matching `isBusy` guard for uniformity |
| CODE-010 | P3 | High | PROVEN | `student-fee-sheet.tsx:16-18`; `fee-obligation-sheet.tsx:11-13`; `course-detail-workspace.tsx:116`; `receipt-sheet.tsx:169,171`; `aggregate.ts:191` | `feeCategory` label triplet duplicated ~6× | One exported `beneficiaryLabel`/`FEE_CATEGORY_OPTIONS` |
| CODE-011 | P3 | High | PROVEN | 16 sites incl. `use-workspace-store.ts:103,108,116` | `console.error` as the logging mechanism (no `console.log`); coding-style prefers a logger | Route through a logger/telemetry (ties to OPS-006) |
| CODE-012 | P3 | Med | SUSPECTED | `course-detail-workspace.tsx:117` | Per-row `courseFees.filter(...).length` (quadratic) and duplicate descriptions each show the same count (reads inflated) | Group by description once (memoized), one row per group |
| CODE-013 | P2/P3 | High | PROVEN | `tsconfig.app.json` (+ all tsconfigs) | `strict` not set → `tsc` runs without `strictNullChecks`/`noImplicitAny` | Enable `strict` and fix fallout incrementally |

**Non-defects / positives:** all files < 800-line cap (largest `aggregate.ts` 351); no
god-functions; **no circular imports**; extensive tests (43 `.test.ts(x)` incl. financial
firewall/integrity). `receipt-sheet.tsx` is dense (candidate to split); `StatusBadge`
imported cross-feature (candidate to move to `components/ui`).

**Net:** architecture is disciplined (DB firewall + RLS as truth, pure read-models,
immutable-after-posting, correct RTL/Western-digit handling). The material items are
**CODE-001/002/003** (duplicated/divergent financial derivations — CODE-002 can yield a
wrong displayed number) and **CODE-004** (unvalidated DB reads); the rest are P3 cleanup.
