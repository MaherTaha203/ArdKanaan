# 09 — Dependencies & Maintainability

**Phases covered:** 15 (dependencies & licenses) · 16 (maintainability & documentation)

## Dependencies (Phase 15)

`npm audit --offline` → **0 vulnerabilities across 329 packages**; only `fsevents`
(macOS-only optional) carries an install script — minimal supply-chain surface. All spec
ranges are caret/tilde and resolve in range. Versions are internally consistent and
mainstream; **no abandoned packages, no copyleft/unlicensed** among direct deps (all
MIT/ISC/Apache-2.0 family).

Runtime deps: react/react-dom 19.2, `@supabase/supabase-js` 2.112, zustand 5, zod 3.25,
react-hook-form 7.84 + resolvers 5.7, lucide-react 1.28, react-to-print 3.3, tailwindcss
4.3 (+ vite plugin), class-variance-authority/clsx/tailwind-merge, **`tw-animate-css`
(unused)**. Dev: vite 8, vitest 4 (+coverage-v8), playwright 1.62, typescript ~6.0, eslint
10, typescript-eslint 8, jsdom 30, testing-library.

| ID | Sev | Status | Evidence | Recommendation (not implemented) |
|---|---|---|---|---|
| TEST-008 | P3 | PROVEN | `package.json:30`; no reference in any `.ts/.tsx` or `index.css` | `tw-animate-css` is unused → remove (reduces install surface) |
| TEST-013 | P3 | PROVEN | `npm audit --offline` | "0 vulnerabilities" reflects only locally-cached advisories, not the live registry → run an online `npm audit`/Dependabot periodically |
| TEST-014 | P3 | PROVEN | `.env.production` committed (only `.env.local` gitignored) | Anon key + URL live in git history (public by design) → keep, but treat the anon key as rotatable and never add non-public keys |
| SEC-005 / TEST-015 | P3 | PROVEN | `supabase.ts:41-49` | Session in `localStorage` (Supabase default; XSS-reachable) → accept as documented tradeoff; add a CSP; keep the XSS-sink-free posture |

## Maintainability & documentation (Phase 16)

**Code maintainability is HIGH.** Small focused files (largest `aggregate.ts` 351 lines;
all < 400, well under the 800 cap), strong typing (no `any` in app code), clear
naming, immutable pure selectors, comments that explain financial *intent*, ~40 unit specs
+ 25 e2e, well-ordered self-documenting migrations, and comprehensive CI steps. The
financial logic and its rationale can be followed from code + the extensive governance/ADR
docs **without prior AI chats** — a genuine strength for handover of *code comprehension*.

**Operational / handover documentation is effectively ABSENT.**

| ID | Sev | Status | Evidence | Impact / recommendation (not implemented) |
|---|---|---|---|---|
| OPS-013 / TEST-012 | P2 | PROVEN | `app/README.md` | README is the **unmodified stock Vite template** — no run, env-setup, DB/migration, deploy, backup, or architecture content. A new maintainer cannot run or operate the app from it. → Replace with real setup/env/DB/deploy/backup + an architecture overview |
| OPS-014 | P2 | PROVEN | `docs/` tree | `docs/` is **entirely governance/spec/audit** (GOV/DAT/PC/UX/CMP/ADR/phase audits) — **no** ops runbook, DR/restore procedure, code data-flow doc, env-setup guide, or new-dev "critical files" list. The store→aggregate→feature data flow (the heart of the app) is documented only in code comments. → Add an ops runbook, DR/restore procedure, a data-flow/architecture doc, and a critical-files list |
| OPS-015 | P2 | PROVEN | `ci.yml`; no deploy config | CI triggers only on 2 hard-coded branches; no deploy config; deploy/rollback undocumented (also in report 08). → Broaden CI triggers; add & document deploy/rollback |

**Documented architecture decisions:** excellent — **77 accepted ADRs** plus frozen
constitutions give unusually deep decision provenance. The gap is not *why* the system is
shaped as it is (well documented) but *how to run, deploy, back up, and recover it* (not
documented at all).

**Handover readiness:** **HIGH for code comprehension, LOW for operations.** A developer can
understand and safely extend the financial logic from the repo; they cannot learn to run,
deploy, or recover the system without external/tribal knowledge.
