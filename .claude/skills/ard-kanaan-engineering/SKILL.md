---
name: ard-kanaan-engineering
description: "Repository-specific governance and execution gateway for any AI agent working in the Ard Kanaan (أرض كنعان) project. A ROUTER to the repository's own laws — it holds no authority of its own and is not a second constitution. Use at the START of any task in this repository: to onboard against the current authoritative state (branch, INDEX, ROADMAP, open phase, governing plan, latest ADRs), to classify the artifacts a task would touch (FROZEN / LIVING / exploratory-VEM / non-authoritative), to enforce scope and stop conditions, and to keep execution inside the documented governance, amendment, and Owner-decision paths."
metadata:
  version: "1.0.0"
  scope: repository-governance-router
---

# Ard Kanaan — Engineering & Governance Gateway

**This Skill is a ROUTER, not a constitution.** It holds **no authority of its own**.
Every rule below points to where the real authority lives; when this Skill and a
cited document ever disagree, **the cited document wins**. Do not treat anything
here as a new rule, a new decision, or a substitute for reading the governing
document for the task at hand.

Authority in this repository lives only in: **frozen constitutions** (Product PC-*,
Business BC-*, UX UX-*, Data DAT-*, Domain DOM-*, PLP-001), **frozen governance**
(GOV-*), **ACCEPTED ADRs** (`docs/decisions/`), and the **LIVING plan** that governs
the currently open phase. GitHub is the shared source of truth.

---

## 0. Where the laws live (router map)

| Need | Document | Path |
|---|---|---|
| Master map of every doc | **IDX-001** | `docs/INDEX.md` |
| Phase status tracker | **RDM-001** | `docs/roadmap/ROADMAP.md` |
| The only legal phase sequence + phase-entry law (§2) | **GOV-011** | `docs/governance/GOV-011_MASTER_ENGINEERING_ROADMAP.md` |
| Amendment / review procedure (§5 amend frozen material) | **GOV-004** | `docs/governance/REVIEW-PROCESS.md` |
| Owner Decision Protocol | **GOV-010** | `docs/governance/GOV-010_OWNER_DECISION_PROTOCOL.md` |
| Multi-Agent Review Protocol | **GOV-013** | `docs/governance/GOV-013_MULTI_AGENT_REVIEW_PROTOCOL.md` |
| Layer ownership (who owns which truth) | **GOV-012** | `docs/governance/GOV-012_LAYER_OWNERSHIP_CONSTITUTION.md` |
| Quality gates | **GOV-003** | `docs/governance/QUALITY-GATES.md` |
| Engineering workflow (commit discipline) | **GOV-005** | `docs/governance/WORKFLOW.md` |
| Repository health dashboard | **GOV-009** | `docs/governance/GOV-009_REPOSITORY_HEALTH.md` |
| Decision register + next ADR number | **DEC-000** | `docs/decisions/DECISION-LOG.md` |
| Governing plan of the **currently open** phase | e.g. **P5-000** | `docs/components/P5-000_COMPONENT_LIBRARY_SPECIFICATION_MASTER_PLAN.md` |
| Frozen framework of the open phase | e.g. **CMP-001** | `docs/components/CMP-001_DESIGN_LANGUAGE_CONSTITUTION.md` |
| Non-authoritative visual exploration | **VEM** | `vem/` (outside `docs/`, no Doc ID) |

Frozen constitution layers: `docs/product/` (PC-*), `docs/business/` (BC-*),
`docs/ux/` (UX-*), `docs/data/` (DAT-*), `docs/domain/` (DOM-*), plus PLP-001.

---

## 1. Lightweight onboarding (do this first, every task)

Read **only the authority the task needs** — never a full audit per task.

1. `git branch --show-current` and `git status` — know your branch and cleanliness.
2. Skim **IDX-001** (`docs/INDEX.md`) — locate the documents the task touches.
3. Skim **RDM-001** (`docs/roadmap/ROADMAP.md`) — identify the **current open phase**
   and confirm no phase is being silently skipped.
4. Open the **governing plan** of that phase (the LIVING P-000 for the open phase)
   and, if relevant, its frozen framework.
5. Read the **latest ADR tail** in **DEC-000** (`docs/decisions/DECISION-LOG.md`) and
   the specific ADRs that bind the task.
6. **Classify every artifact the task would touch:**
   - **FROZEN** — immutable; changeable only via the amendment path (GOV-004 §5).
   - **LIVING** — may evolve within frozen boundaries (e.g. the open-phase plan, registers).
   - **exploratory-VEM** — `vem/` visual explorations; comparison evidence only.
   - **non-authoritative** — installed Skills, 21st.dev, external references, general
     design systems, prototypes, scratchpad artifacts.
7. Read only the authority required by that classification — stop reading once you
   have enough to act correctly.

---

## 2. Authority model

- **The Owner instruction defines the requested task** within the governance framework.
- **Frozen governance, frozen constitutions, and ACCEPTED ADRs remain binding** until
  changed through their **documented amendment/decision path** (GOV-004 §5 for frozen
  material; GOV-010 for Owner decisions; a superseding ADR for ADRs).
- **If an Owner instruction conflicts with frozen authority → STOP.** Do not comply and
  do not "fix" it silently. Identify the **required amendment/decision path** and surface
  it for the Owner to authorize.
- **LIVING plans govern open work** — but only **within** frozen boundaries.
- **Exploratory artifacts, installed Skills, 21st.dev, external references, and general
  design systems are research inputs only** — never authority.

---

## 3. Scope enforcement

- **No implicit phase progression** — a phase opens only under GOV-011 §2 (previous phase
  frozen, all gates passed, **explicit Owner authorization**).
- **No modification of frozen authority** outside the amendment path.
- **No automatic next phase** and no automatic next design decision.
- **No conversion of VEM / exploration into authority** without an explicit, approved
  **transcription** into a CMP/CP atom (or the equivalent authoritative artifact).
- **Existing prototypes / implementation are not design truth.**
- **Rejection of an exploration does not implicitly authorize** its deletion or a
  replacement direction.

---

## 4. Execution discipline

For every authorized task, follow this loop:

> **Understand → inspect authority → surface conflicts → smallest authorized change →
> verify → evidence → required approval.**

- Make the **smallest change** that satisfies the authorized instruction.
- **Verify** against the governing documents; attach the **evidence** (what was read,
  what was checked).
- **Commit / push / PR / merge must respect explicit authorization and the repository
  workflow** (GOV-005). Do none of these unless the instruction authorizes them.

---

## 5. Branch protection

- **Normal authorized work must not happen directly on the default branch**
  (`claude/ard-kanaan-phase-0-6rymjv`).
- For an authorized modification, **create/use a clearly named task branch**
  (e.g. `chore/…`, `docs/…`, `phase-5/…`).
- **Do not stop merely to ask permission to create a normal task branch** — creating one
  is part of normal execution.
- **Stop** for exceptional / release / frozen-workflow ambiguity (e.g. anything touching
  a frozen boundary, a release, or an unclear merge/target).

---

## 6. Ard Kanaan visual & product guardrails

These bound *how* work is shaped when visual/product judgement is legitimately in play.
**They are guardrails — not frozen token values, and not authorization to start visual
design.** Exact values are decided one at a time under the open-phase plan and Owner
approval; starting a design decision (e.g. D0) requires a **separate explicit order**.

- **Arabic-first**, **RTL**.
- **LIGHT-only.**
- **Generous workspace and whitespace.**
- **Calm, refined, simple** experience suitable for **long sessions**.
- **Restrained dashboards**; **no unnecessary charts**.
- **Avoid cards-inside-cards** and decorative container nesting.
- **Fast, direct, lightweight forms.**
- **Readable financial tables over density.**
- **Extremely simple, refined, calm output / print.**
- **Minimal, functional motion** only.
- **Navigation architecture remains open — never assume a Sidebar.**
- **Do not default to conventional ERP / dashboard / sidebar / card-heavy patterns.**
- **External references inspire but do not dictate.**
- **Rejected explorations remain historical / non-authoritative** unless explicitly
  ordered otherwise.

---

## 7. Stop conditions

**STOP and surface to the Owner** when:

- authority is **ambiguous**;
- repository documents **conflict**;
- the work would **cross a frozen boundary**;
- the **next phase is unopened**;
- **Owner product/design judgement** is required;
- **implementation exceeds authorized scope**;
- **exploratory artifacts would be used as authority**.

Stopping is a correct outcome — do not paper over any of the above to keep moving.

---

## 8. Output contract

Whenever this Skill is invoked, report briefly:

1. **Branch / cleanliness** — current branch and `git status`.
2. **Current phase** — the open phase and its governing plan.
3. **Controlling authority consulted** — the specific GOV / constitution / ADR / plan read.
4. **Touched-artifact classification** — FROZEN / LIVING / exploratory-VEM / non-authoritative.
5. **Authorization status** — what the Owner authorized, and whether the action is in scope.
6. **Conflicts / stop conditions** — any triggered, or "none".
