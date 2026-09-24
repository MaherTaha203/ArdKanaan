# 09 — Dependencies & Maintainability

**Phases 15–16.**

## Dependencies (Phase 15)

`npm audit` (this session) → **0 vulnerabilities across 329 packages**; only `fsevents`
(macOS-only optional) has an install script — minimal supply-chain surface. Versions are
modern and internally consistent (React 19, supabase-js 2.112, zustand 5, zod 3.25, vite 8,
vitest 4, playwright 1.62, typescript ~6.0). **No abandoned or copyleft/unlicensed** direct
deps (all MIT/ISC/Apache-2.0 family). **Dependency health is good and sustainable** — the one
cleanup is an unused package.

| ID | Sev | Status | Finding / recommendation (not implemented) |
|---|---|---|---|
| TEST-008 | P3 | PROVEN | `tw-animate-css` unused (`package.json:30`; no reference). → Remove |
| TEST-013 | P3 | PROVEN | `npm audit` ran offline — "0" reflects cached advisories only. → Periodic online audit / Dependabot |
| TEST-014 | P3 | PROVEN | `.env.production` (anon key + URL) committed (public by design). → Keep, treat anon key as rotatable, never add non-public keys |
| SEC-005 | P3 | PROVEN | Session in `localStorage` (report 04). → Documented tradeoff + CSP |

## Maintainability & documentation (Phase 16)

**Code maintainability: HIGH.** Small typed files (all < 400 lines), no `any`, clear naming,
immutable pure selectors, intent-explaining comments, ~40 unit + 25 e2e specs, well-ordered
migrations, comprehensive CI steps, and — unusually — **77 ADRs + frozen constitutions**
giving deep decision provenance. A developer can understand and safely extend the financial
logic from the repo **without prior AI chats**.

**Operational / handover documentation: effectively ABSENT.**

| ID | Sev | Status | Finding / recommendation (not implemented) |
|---|---|---|---|
| OPS-013 (=TEST-012) | P2 | PROVEN | `app/README.md` is the **stock Vite template** — no run/env/DB/deploy/backup/architecture content. → Replace with real setup + architecture overview |
| OPS-014 | P2 | PROVEN | `docs/` is entirely governance/spec/audit — **no** ops runbook, DR/restore procedure, data-flow doc, or critical-files list; the store→aggregate→feature flow lives only in code comments. → Add ops runbook, DR procedure, data-flow doc, critical-files list |
| OPS-015 (=TEST-002) | P2 | PROVEN | Narrow CI triggers; no deploy config; deploy/rollback undocumented (report 08) |

## Long-term maintainability / handover outlook

**Split verdict: HIGH for code comprehension, LOW for operations.** The governance corpus
makes the *why* of the system exceptionally durable — a rare strength that reduces bus-factor
risk on the design. But the *how to run, deploy, back up, and recover it* is undocumented, so
operational bus-factor is high: today the knowledge lives with the current operator/author.
Closing the README + runbook + DR-procedure gap is the cheapest, highest-value sustainability
investment after the test-net (P1) and recovery (report 08) work.
