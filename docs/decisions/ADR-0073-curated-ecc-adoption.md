# ADR-0073 — Curated ECC Reviewer/Rule Adoption (19 non-authoritative developer aids; installer rejected; `database-reviewer` deferred)

| Field | Value |
|---|---|
| ADR | 0073 |
| Title | Curated ECC Reviewer/Rule Adoption (non-authoritative developer aids) |
| Phase | 5 (Component Library Specification) — **administrative/tooling; opens and advances no phase** |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

`ecc-universal@2.1.0` ("Everything Claude Code") is installed globally in the working
environment. The Owner asked whether and how ECC can benefit Ard Kanaan **without**
conflicting with the project's governance. Six read-only investigations were produced
(all outside the repository, zero repo mutation): **ECC Analysis**, **Integration Plan**,
**Dry-Run Audit**, **Curated Rework Audit**, **Second Dry-Run — Controlled Manual
Extraction Preview**, and the **Manual Apply Review Gate**.

The forces at play:

- **Installer over-pull.** ECC's installer is **module/directory-granular**, not
  file-granular. A minimal selection copies **375 files** into `.claude/` — all 67
  agents, all 94 commands, all-language rules, a hidden `.agents/` tree, and a top-level
  `AGENTS.md` — including components the plan explicitly rejects. It cannot produce a
  curated subset, so the installer is unusable for a governed adoption.
- **Latent capability.** Every ECC review agent ships `tools: Read, Grep, Glob, Bash`;
  build/quality components additionally declare `Write`/`Edit`; `database-reviewer`
  connects to the **live database** (`psql $DATABASE_URL`, `EXPLAIN ANALYZE`). "Report
  findings only" in prose is not a capability guarantee.
- **No executable safety net.** The repository has **no test runner and no golden
  guards** (verified), so there is no automated defence against a regression in the
  financial logic.
- **Frozen authority to protect.** `GOV-007` (AI-13/15/17/36), the frozen constitutions
  (PC/BC/UX/DAT/DOM, `PLP-001`), ACCEPTED ADRs (≤ ADR-0072), and the financial invariants
  — notably **`BR-011`** (Teacher Share = round-half-up to whole shekel, `BC-001`) and
  **`DR-028`** — bind all work. Phase gating (`GOV-011`) keeps the implementation track
  closed until the documentation freeze.
- **Precedent.** Non-authoritative tooling has been added under `.claude/` before, as a
  `chore` governance action — `.claude/skills/ard-kanaan-engineering` (PR #7). Adopting
  curated developer aids is the same class of administrative decision, and needs an
  explicit Owner decision recorded as an ADR rather than an ad-hoc addition.

## Decision

1. **Adopt a curated, file-level, hardened subset of ECC as NON-AUTHORITATIVE developer
   review aids** — **19 files**: four hardened review agents
   (`code-reviewer`, `typescript-reviewer`, `react-reviewer`, `security-reviewer`) under
   `.claude/agents/ecc/`, and fifteen reference rules
   (`common/`, `typescript/`, `react/` × `{coding-style, security, patterns, testing, hooks}`)
   under `.claude/rules/ecc/`. **No other ECC component is adopted.**
2. **Reject the ECC installer for Apply.** Because selection is module-granular and
   over-pulls rejected components, adoption is a **manual file-level copy of the hardened
   snapshot only** (the snapshot that passed the Second Dry-Run). No `ecc`/`ecc-install`,
   no module-level copy, no extra file.
3. **Hardening is mandatory and fixed.** Every adopted agent carries `tools: Read, Grep,
   Glob` **only** (no `Bash`/`Write`/`Edit`); all execution, network, and database
   instructions are removed (git/gh/npm/npx/tsc/eslint/prettier/tests/`npm audit`,
   `psql`/`$DATABASE_URL`/`EXPLAIN ANALYZE`); each agent carries a non-authoritative,
   review-only, read-only governance header that defers to `GOV-007` and the
   constitution; rule cross-links stay valid within `rules/ecc/` and dangling references
   to non-adopted components are neutralised.
4. **Defer `database-reviewer`.** It targets the live financial database; it is **not
   adopted now**. Revisit only after executable financial golden tests exist (a separate,
   project-owned decision).
5. **Never adopt** (explicit exclusion): `hooks-runtime`, MCP, memory/persistence,
   commands, orchestration/epic/multi/loop, refactor/simplify/performance agents, build
   resolvers, `quality-gate`/`security-scan`/`test-coverage`, platform configs,
   `AGENTS.md`, `.agents/`, the Itô compute bridge, and any auto-format / auto-fix.
6. **ECC is non-authoritative.** It never overrides `GOV-007`, the frozen constitutions,
   ACCEPTED ADRs, financial invariants, scope, or evidence rules. **On any conflict,
   Ard Kanaan wins.** The `ecc` layer has **zero write authority** over the financial
   files (`app/src/lib/aggregate.ts`, `app/src/lib/format.ts`, the voucher schemas,
   `app/src/types/domain.ts`, `app/src/store/**`, `app/supabase/migrations/**`).
7. **Fully removable.** The adoption is reversible by deleting the 19 files under
   `.claude/agents/ecc/` and `.claude/rules/ecc/`, with **zero loss of system logic**;
   no existing file (including `.claude/skills/ard-kanaan-engineering/`) is modified.
8. **Administrative only.** This ADR **opens no phase and advances no phase** (`GOV-011`),
   authors no CP atom or authoritative content, and modifies **no frozen constitution**.
   The implementation track (Phases 7/10/12) remains gated.
9. **Apply is a separate explicit step.** This ADR's acceptance authorises the curated
   adoption; per the Owner's explicit order (this session, 2026-08-23) the curated set was
   **applied in the adopting commit** on branch `claude/ecc-universal-global-install-scgfv8`,
   with **push and pull-request withheld pending a further explicit Owner order**. The
   post-apply verification defined in the Manual Apply Review Gate holds (19 expected
   files, 0 unexpected; `Bash`/`Write`/`Edit`/network/DB absent).

## Consequences

- **Positive.** The AI executor gains **opt-in, read-only** review assistance
  (TypeScript, React, security, and — if later un-deferred — static database review) as
  explicitly-invoked subagents, plus reference rule material, with **no autonomous
  mutation**. Financial and governance firewalls are preserved; the change is fully
  reversible.
- **Negative / cost.** Manual maintenance — on any future ECC upgrade the hardening must
  be re-applied (no auto-update). Rules placed under `.claude/rules/ecc/` are **inert
  reference**: Claude Code does not auto-load a `.claude/rules/` directory as governing
  context, so their value is realised only via explicit reference; **no `CLAUDE.md`
  import of these rules may be added**, to preserve non-authoritative status. Database
  review value is reduced while `database-reviewer` is deferred.
- **Enforcement.** Safety rests on the **absence of tool grants** (`Bash`/`Write`/`Edit`
  removed), not on prose promises; this is verified by the Apply Review Gate scans, and
  is re-verified after Apply.
- **Blast radius (Doc IDs changed in the adopting commit — GOV-004 §5):**
  - **DEC-000** (`docs/decisions/DECISION-LOG.md`): ADR-0073 register row appended;
    next-number line advanced **→ ADR-0074**.
  - **IDX-001** (`docs/INDEX.md`): ADR-0073 registered under §2.6; version → 1.56.0.
  - **GOV-009** (`docs/governance/GOV-009_REPOSITORY_HEALTH.md`): ACCEPTED-ADR count
    72 → 73; refresh-history row added.
  - **RDM-001** (`docs/roadmap/ROADMAP.md`): Phase-5 administrative note; version → 1.31.0.
  - **New files created:** the **19** curated files under `.claude/agents/ecc/` and
    `.claude/rules/ecc/`.
  - **Unchanged:** every frozen constitution, all `app/` code, and every financial file.

## Notes

- **Owner-Decision ADR.** Authorised by explicit Owner order in this session
  (2026-08-23). It **records a decision, not contested design**, so the GOV-013
  Multi-Agent Review Panel is **not invoked** (PLP-001 / DR-091 / ADR-0071 precedent).
  The 19 files under `.claude/` are non-authoritative developer tooling, not `docs/`
  documentation, so they carry no Doc ID and need no IDX-001 registration; only this ADR
  is registered.
- **Evidence basis.** The six ECC review deliverables listed in Context (Analysis →
  Integration Plan → Dry-Run Audit → Curated Rework Audit → Second Dry-Run Preview →
  Apply Review Gate). The Second Dry-Run confirmed the 19 hardened files are review-only
  (29 classified changes, 0 unclassified); the Apply Review Gate confirmed all technical
  checks pass.
- **Precedent.** `.claude/skills/ard-kanaan-engineering` was adopted as non-authoritative
  tooling via a `chore` commit (PR #7); this ADR follows that class of administrative
  tooling decision.
