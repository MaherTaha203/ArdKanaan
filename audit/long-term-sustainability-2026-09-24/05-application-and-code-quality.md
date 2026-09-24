# 05 — Architecture, Code Quality & UI/State

**Phases 2 · 8 · 9.** Executed this session: `npx tsc -b` → **exit 0**; `npm run lint` →
**clean**. No `any` in app code, **no `dangerouslySetInnerHTML`/innerHTML/eval/`javascript:`
URL/`target="_blank"`**, no empty catch, **no circular imports**.

## Layering & sources of truth (Phase 2)

Read/write separation is **well done**: `useWorkspaceStore` = single read cache; command
stores = near-stateless action wrappers; financial fields immutable after posting; DB RPCs +
firewall triggers = write authority; derivations are pure selectors — **except** course
paid/remaining is derived two ways (CODE-002). This is a **maintainable, durable**
architecture.

## Page / state inventory (Phase 8)

State-based nav (`use-shell-store.ts`, `PageKey=section:view`); open tabs kept mounted so
per-page state survives; `withTab()` dedupes; home permanent. 10 page components + 7 keyed
overlays. Every workspace has loading/empty/error(+retry) states, save toasts, double-submit
guards on money-in/out, roving-tabindex tabs, zod-validated forms, Western-digit + RTL
rendering. **UX foundation is solid and consistent.**

## Findings (code durability)

| ID | Sev | Status | Location | Finding / recommendation (not implemented) |
|---|---|---|---|---|
| CODE-001 | P2 | PROVEN | `aggregate.ts:181-185`; `glance:52`; `receipt-sheet:68`; `financial-report:91` | Fee-paid formula copy-pasted 3× + inline institute-revenue recompute — **financial math in `.tsx`, drift risk over time**. → Export one helper |
| **CODE-002** (=TEST-016) | P2 | PROVEN divergence | `courses.ts:34-42,62` vs `aggregate.ts:123-179` | **Two sources of truth for course paid/remaining** (name-match no-entryType-filter vs enrollmentId+filtered) → can double-count same-named enrollments / count a fee line as course payment / show negative remaining. Course Detail can disagree with the ledger. → Reuse `studentCourseBreakdown` |
| CODE-003 | P2 | PROVEN | `use-workspace-store:32-39` & `use-money-in-store:18-64` | Duplicate row types + normalizers (money-in hard-codes `status:'active'`) can diverge. → Extract shared module |
| CODE-004 | P2/P3 | PROVEN | money-in/out, backup, voucher-admin stores | DB reads trusted via `as` casts, no runtime validation → schema/view drift becomes a runtime NaN, not a caught error. → Zod-parse read rows |
| CODE-013 (=TEST-003) | P2 | PROVEN | all tsconfigs | **`strict` off** → strictNullChecks/noImplicitAny disabled in a financial app. → Enable `strict` + `noUncheckedIndexedAccess` |
| CODE-005 | P3 | PROVEN | position-panel, emblem-mark, falcon-frieze | Dead component files. → Remove |
| CODE-006 | P3 | PROVEN | shell/money stores | Dead store surface from the pre-tab model. → Prune |
| CODE-007 | P3 | PROVEN | `app-shell.tsx:63-64` | Unreachable `PageView` `case 'home'`. → Remove |
| CODE-008 | P3 | SUSPECTED | `tab-strip.tsx:28-29` | Tab ArrowRight ignores RTL direction. → Map to reading direction |
| CODE-009 | P3 | IMPROVEMENT | `use-voucher-admin-store.ts` | Cancel/update lack the `isSaving` guard money-in/out have (button-disable + idempotent SQL still protect). → Add for uniformity |
| CODE-010 | P3 | PROVEN | ~6 sites | `feeCategory` label triplet duplicated. → One exported helper |
| CODE-011 | P3 | PROVEN | 16 sites | `console.error` as logging (no logger; ties to OPS-006) |
| CODE-012 | P3 | SUSPECTED | `course-detail-workspace.tsx:117` | Per-row quadratic count; duplicate descriptions read inflated. → Group once |

**Non-defects / positives:** all files < 800 lines; no god-functions; no cycles; extensive
tests. `receipt-sheet.tsx` dense (split candidate). **Net:** disciplined, maintainable
architecture; the durable items are the **duplicated/divergent financial derivations
(CODE-001/002/003)** and **strict-off (CODE-013)** — both are "silent drift" risks that grow
with the codebase.
