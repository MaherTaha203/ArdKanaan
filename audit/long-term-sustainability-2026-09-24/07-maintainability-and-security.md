# 07 — Maintainability & Security (for years of change)

**Read-only.** Executed first-hand this session: `npx tsc -b` → **exit 0**, `npm run lint` →
**clean**, `npm run test` → **221 pass**, `npm run e2e` → **25 pass**, `npm audit` → **0**.

## Maintainability (Section VIII)

| Aspect | State | Verdict for multi-year maintenance |
|---|---|---|
| Code organization / SoC | Small typed files (largest `aggregate.ts` 351; all < 400), clean read/write separation, no god-functions, **no circular imports** | **Strong** |
| **TypeScript strict** | **OFF** — no `strict` key in any tsconfig (re-verified first-hand); strictNullChecks/noImplicitAny disabled | **Weak** for a financial app — a class of null/undefined bugs is invisible to the compiler; the risk compounds as contributors change |
| Lint | `tseslint recommended` (not type-checked); `exhaustive-deps` = warn | **Moderate** — no floating-promise/no-misused-promises detection for async Supabase |
| Dependencies | Modern, consistent; **0 audited vulns** (offline); 1 unused (`tw-animate-css`); permissive licenses | **Good** |
| Unit / integration / E2E | 40 unit + 25 e2e; client domain logic well covered | Good **surface**; but… |
| Critical-path (financial) coverage | **server guarantees tested by SQL text-matching** (P1) | **Weak** where it matters most |
| CI/CD | tsc + typecheck:test + lint + unit + build + e2e; **triggers on 2 branches only** (current + default get none) | **Weak wiring** — regressions can merge unchecked |
| Update without harming old data | Immutable history + snapshots + append-only ledger → app upgrades don't rewrite old records | **Strong** |
| Traceable/reviewable migrations | 53 well-ordered, self-documenting migrations | **Strong** (but no apply-test in CI) |
| Error diagnosability | `console.error` only; no remote tracing/correlation | **Weak** |
| Operational docs for a new dev | README is the **stock Vite template**; `docs/` is governance/ADR only — no run/deploy/backup/data-flow runbook | **Weak** (see bus-factor) |

**Bus-factor / single-person dependence:** *why* the system is shaped as it is is
exceptionally well documented (**77 ADRs** + frozen constitutions) → **low** design
bus-factor. But *how to run, deploy, back up, recover, and monitor* it is undocumented →
**high** operational bus-factor: today that knowledge lives with the current operator/author.
A new maintainer could understand the financial logic from the repo but **could not operate
or recover the system** without tribal knowledge.

## Security durability (Section VII/VIII overlap)

**Strong, server-enforced core** (full detail carried from the prior audit and re-verified):
owner-only RLS on every table; all financial writes through owner-gated SECURITY DEFINER RPCs;
append-only ledger; immutable snapshots; **no service-role key in the client**; **no XSS
sink, no SQL-injection surface**. This foundation ages well and is UI-change-proof.

Durable security gaps to close:
- **SEC-001** — `complete_student`/`reactivate_student` lack the `is_owner()` guard/revoke
  every other mutation has (re-verified first-hand: functions at `20260916116500:68,91`, no
  `is_owner`/DEFINER). A future change to the `students` UPDATE policy could open them.
- **SEC-006 / repo↔prod drift** — the repo documents drift ("repo only" tail migrations; a
  dropped view grant). Over years, applied state and repo diverge unless reconciled. Run
  Supabase Security Advisor periodically. **NOT VERIFIED IN LIVE ENVIRONMENT.**
- **SEC-002/003/004 (auth config)** — signup/password-policy/MFA are governed at the
  dashboard, not the repo; **NOT VERIFIED IN LIVE ENVIRONMENT**.
- **SEC-005** — session in `localStorage` (Supabase default; low risk given no XSS sinks).
- **SEC-007** — `owner_identity` has no RLS (revoke-only); lockout if the first auth user is
  deleted (no FK).

## Verdict

**Maintainable and secure at the core, fragile at the edges over time.** The code and its
decision history are durable; the multi-year risks are **strict-off**, **server-guarantee
tests that are text-only**, **narrow CI**, **no monitoring**, and **absent operational
docs** — each a slow-compounding maintenance/operability debt rather than an immediate defect.
