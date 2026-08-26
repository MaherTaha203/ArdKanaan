# ADR-0074 — Product Work-Line Authorization (the `app/` prototype evolved toward a usable product under the approved B+ UX direction, ahead of the documentation pipeline; NON-AUTHORITATIVE; financial firewall absolute)

| Field | Value |
|---|---|
| ADR | 0074 |
| Title | Product Work-Line Authorization (non-authoritative product track ahead of Documentation Freeze) |
| Phase | 5 (Component Library Specification) — **product work-line; opens and advances no phase; the documentation track and the rest of the implementation track stay gated** |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The project runs a **documentation-first pipeline** (GOV-011 / RDM-001): Phases 1–6 must all
be FROZEN ("Documentation Freeze") before the implementation track (Phases 7–14, the Frontend
being **Phase 12**) may open. The current authoritative state is **Phase 5 OPEN** — only the
framework **CMP-001** is frozen (ADR-0072); **no CP atom is authored**, no component-family
document exists, and Phase 6 (Screen Blueprints) has not begun. Design authority is created
**only** through the Phase-5 Owner-controlled design-decision protocol (P5-000 §4) transcribed
into CMP/CP atoms (CMV-01; VEM-6).

At the same time a working **React prototype already exists in `app/`** (Vite + TypeScript +
Tailwind; features: `home`, `students`, `receipt-voucher`, `payment-voucher`,
`financial-report`, `settings`, `auth`; Supabase read model), built ahead of the gate as a
non-authoritative prototype. Its visual language already matches the Ard Kanaan direction
(bone/olive/gold/clay, IBM Plex Sans Arabic + Noto Naskh Arabic, RTL, LIGHT), and
`students-workspace` is already a two-pane list/detail.

Across this session the Owner ran a **read-only design exploration** (three radically-different
UX products → **B "Split Cockpit" / القُمرة** chosen as TOP), then approved a **refined
variant "B+ / القُمرة المطوّرة"** (glance landing + persistent two-pane cockpit + lens rail +
command bar + inline quick-receipt + smart sort/status + toast-undo). All exploration artifacts
were non-authoritative scratchpad prototypes (VEM-class), never committed to `docs/`.

The Owner then directed (this session): **adopt the design and evolve `app/` now into a usable
product, quickly — explicitly ahead of the documentation pipeline** (the Owner selected the
"pragmatic product track" over the full constitutional route and over a hybrid). This crosses a
documented boundary (the implementation gate), so per GOV-010 / the Engineering Gateway Skill
§7 it is recorded here as an explicit **Owner-Decision ADR** rather than proceeding silently.

The forces at play:

- **Speed vs. pipeline.** The full documentation-first route (finish Phase 5 CP atoms → Phase 6
  screens → freeze → implement) is faithful but is the opposite of quick; the Owner wants a
  usable product now.
- **Authority protection.** Design authority must remain in the specs — an exploration/prototype
  can **never** become authority by fiat (CMV-01 / VEM-6). A product track must not be mistaken
  for a design decision.
- **Financial firewall.** The financial invariants (BR-011 teacher-share rounding; DR-028; the
  DAT-005 derived-balance invariants) and the files that encode them must stay untouched by any
  presentation work.
- **Precedent.** Non-authoritative additions ahead of authority have been recorded as
  Owner-Decision ADRs before (ADR-0073 curated ECC tooling; ADR-0070 VEM). This is the same class
  of explicit, recorded, non-authoritative decision.

## Decision

1. **Authorize a NON-AUTHORITATIVE Product Work-Line.** The `app/` codebase may be evolved —
   on branch `claude/ecc-universal-global-install-scgfv8` — to apply the approved **B+ UX
   direction** and to complete product features toward a **usable product**, running **ahead of
   the documentation track** as an explicit, Owner-authorized exception (GOV-010).
2. **It creates no design authority.** B+ and every visual/interaction value in `app/` remain
   **non-authoritative prototype-grade product code**. They do **not** become CP atoms, do
   **not** freeze anything, and do **not** satisfy Phase 5 or Phase 6. Design authority is still
   created only via the Phase-5 protocol (P5-000 §4 / CMV-01 / VEM-6); the specs remain the
   system of record for design authority.
3. **Opens and advances no phase.** Phase 5 stays OPEN; the documentation track (Phases 5–6) and
   the remainder of the implementation track (Phases 7–11, 13–14) are unaffected. This is **not**
   a GOV-011 §2 phase entry; the Documentation-Freeze gate is not moved.
4. **Financial firewall is absolute.** No change to `app/src/lib/aggregate.ts`,
   `app/src/lib/format.ts`, `app/src/features/*/schema.ts`, `app/src/types/domain.ts`,
   `app/src/store/**`, or `app/supabase/migrations/**`, and no change to any balance, allocation,
   rounding, voucher numbering, teacher-share, center-share, or cash logic (BR-011 / DR-028 /
   DAT-005 invariants). The work-line is **presentation + shell/interaction state only**; it
   reads the existing derived model, never rewrites it.
5. **Scope of the work-line.** (a) the B+ shell — a calm wide **glance** landing + a persistent
   two-pane **cockpit** (subject list ⇄ account) + a lens rail + a command/search bar; (b) the
   five approved usability upgrades (glance, command jump, inline quick-receipt, smart sort +
   status, toast/undo); (c) feature completeness **within the existing app data scope** —
   students, receipts (money-in), expenses/payments (money-out), the financial report, settings;
   (d) empty / loading / error states; (e) Arabic / RTL / LIGHT and a mobile layering of the
   cockpit. **Out of scope (not fabricated):** Teacher and Program data surfaces are not in the
   current app read model and remain **future data work**, not invented here.
6. **Reconciliation later.** When Phases 5–6 freeze, the product work-line is **reconciled** to
   the frozen CMP/CP/SC specifications (the app is brought into conformance with the authoritative
   design language and screen blueprints); material divergences are tracked and resolved toward
   the specs, never the reverse.
7. **Governed like code.** Commit/PR discipline per GOV-005; each increment is verified
   (`tsc -b` typecheck, `vite build`, `eslint`) and the financial firewall is proven untouched
   (the firewall files unchanged in the diff); the curated ECC review aids (ADR-0073) may be
   invoked as read-only reviewers. The work-line is reversible (revert the `app/` presentation
   commits) with zero loss of financial logic.
8. **Owner-Decision ADR.** This records a decision, not contested design, so the GOV-013
   Multi-Agent Review Panel is **not** invoked (PLP-001 / ADR-0071 / ADR-0073 precedent).

## Consequences

- **Positive.** A fast, honest path to a usable product that applies the Owner-approved B+
  direction, on the existing well-architected app, with the financial and governance firewalls
  intact and the change reversible.
- **Negative / cost.** The product runs **ahead of** its own documentation; when Phases 5–6
  freeze, a **reconciliation pass** is owed to bring `app/` into conformance with the frozen
  CMP/CP/SC specs (tracked divergence, not silent drift). Until then the app's visual/interaction
  values carry **no authority** and must not be cited as such.
- **Boundary preserved.** No CP atom is authored, no phase is opened/advanced, no frozen
  constitution is modified, and the Documentation-Freeze gate is not moved; design authority
  remains exclusively in the Phase-5 specs.
- **Blast radius (Doc IDs changed in this commit — GOV-004 §5):**
  - **DEC-000** (`docs/decisions/DECISION-LOG.md`): ADR-0074 register row appended;
    next-number line advanced **→ ADR-0075**.
  - **IDX-001** (`docs/INDEX.md`): ADR-0074 registered under §2.6; ACCEPTED-ADR count 73 → 74;
    version → 1.57.0.
  - **GOV-009** (`docs/governance/GOV-009_REPOSITORY_HEALTH.md`): ACCEPTED-ADR count 73 → 74;
    refresh entry + history row added.
  - **RDM-001** (`docs/roadmap/ROADMAP.md`): Phase-5 product-work-line note; version → 1.32.0.
  - **New file created:** this ADR.
  - **Unchanged:** every frozen constitution (PC / BC / UX / DAT / DOM / PLP / CMP-001), all
    financial files, and every `app/supabase/migrations/**` file.

## Notes

- **Authority model.** "Ard Kanaan wins": on any conflict, the frozen constitutions, ACCEPTED
  ADRs, and financial invariants bind the work-line. The work-line is a **product** decision, not
  a **design-authority** decision — the two are kept strictly separate by clauses 2 and 6.
- **Why an ADR and not silent execution.** Evolving `app/` toward a shipped product ahead of the
  Documentation-Freeze gate crosses a documented boundary; the Engineering Gateway Skill §7 and
  GOV-010 require it be surfaced and recorded as an explicit Owner decision — which this ADR is.
- **Reversibility.** Reverting the product-work-line commits restores the prior `app/` state with
  no loss of financial or governance logic.
