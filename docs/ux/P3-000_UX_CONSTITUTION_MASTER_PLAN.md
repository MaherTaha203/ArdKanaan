# P3-000 — UX Constitution Master Plan

| Field | Value |
|---|---|
| Doc ID | P3-000 |
| Title | UX Constitution Master Plan |
| Phase | 3 (UX Constitution) |
| Status | LIVING — **Phase 3 CLOSED** (2026-07-22, ADR-0059 / AUD-P3-FINAL); governing plan, subordinate to GOV-011 |
| Version | 1.0.0 |
| Depends on | BC-000…BC-009 (frozen & locked); PC-001…PC-008 (frozen & locked); DOM-001…005 + DR-001…090 (frozen); GOV-011, GOV-012, GOV-003, GOV-004, GOV-006, GOV-010 |
| Answers | "How is Phase 3 (UX Constitution) structured, sequenced, and governed?" |

---

## 1. Status & lineage

This is the governing roadmap for the entire UX Constitution phase, opened under the universal
phase-entry law (GOV-011 §2: Phase 2 frozen & locked ✓, all gates passed ✓, explicit Owner
authorization ✓ — ADR-0048 Part III / ADR-0049). **GOV-012 is the sole official reference** for
the ownership of any new decision in this phase. Phase 3 builds on the frozen Domain (Phase 1A),
the frozen & locked Product Constitution (Phase 1), and the frozen & locked Business Constitution
(Phase 2), and introduces **no** new domain truth, **no** product decision, and **no** business
behavior.

## 2. Why the UX Constitution exists

Domain Discovery froze *what is true about the business* (F/DR/M). The Product Constitution froze
*what the product is and is not* (PA/PP/MMI/SC/AX/PR/AC). The Business Constitution froze *the
exact business behavior* (BR-001…087). Phase 3 fixes **how that frozen behavior is presented to
and operated by the Owner** — interaction, navigation, information architecture, workspace
architecture, forms, visual hierarchy, accessibility, usability, and presentation — as a governed,
atomic, testable body of **UX rules (UX-NNN)** that later phases build without reinterpreting the
business.

## 3. Constitutional Position

Phase 3 does not redefine the Business Constitution, the Product Constitution, or the Domain.

Phase 3 **explains and presents** the behavior that BC-000…BC-009 already fix, consuming them
**exactly as frozen**. UX explains business; it never defines business.

## 4. Layer relationships (per GOV-012)

**Business ▷ Product ▷ UX ▷ Visual ▷ Engineering.** UX is subordinate to Business and Product and
authoritative over Visual/Engineering for presentation only. Every UX rule is a **UX-layer atom**
that consumes frozen Business Rules and Product Constitution statements and originates **no**
business truth. Reconciliation of any apparent conflict follows GOV-012 (higher layer wins; if UX
cannot be produced without changing business behavior, STOP and amend — never compensate in UX).

## 5. Phase goals & responsibilities

Phase 3 owns **only** the presentation and operation of frozen behavior. It shall determine:

- interaction, navigation, and information architecture;
- workspace architecture (how the Owner's work is organized);
- forms (how a business action is performed and how its Business Rules surface);
- visual hierarchy, accessibility, usability, and language/RTL presentation.

Phase 3 shall **not** introduce or modify: Business Rules, accounting behavior, financial
calculations, workflow meaning, or constitutional exceptions. It shall not, in any document,
redefine a term fixed by PC-006 or a behavior fixed by BC-001…BC-009.

## 6. Constitutional boundaries

| UX MAY determine | UX MUST NOT determine |
|---|---|
| Interaction & navigation | Any Business Rule (new or modified) |
| Information & workspace architecture | Accounting behavior / financial calculation |
| Forms & how actions are performed | Workflow reinterpretation |
| Visual hierarchy & presentation | Constitutional exceptions |
| Accessibility & usability | Product scope / actors / glossary (owned by PC) |
| Language & RTL presentation | Domain truth (owned by DOM) |

**Boundary rule:** if a UX need cannot be met without changing business behavior, work **STOPS**
and a Constitutional Amendment request is raised (GOV-004 §5 / BC-000 §BCG-3). UX never compensates
for a missing or inconvenient business rule.

## 7. Document map (mission only — contents NOT written here)

All UX rules live in one continuous **UX-NNN** series across the phase documents; the final
document proves coverage (the UX sink). Missions only — no screen, component, layout, colour,
interaction, or design-language content is authored in this master plan.

| Doc | Mission (only) | Layer |
|---|---|---|
| UX-001 | UX Constitutional Philosophy & Layer Responsibility — the constitutional responsibility of the UX layer; principles (UXP) + invariants (UXV) | UX |
| UX-002 | Information Architecture — the structure through which the frozen concepts (PC-003) become perceivable, locatable, and findable (consumes PC-003, never redefines it) | UX |
| UX-003 | Workspace Architecture — how the Owner's day-to-day work is organized into working areas over the information architecture | UX |
| UX-004 | Interaction & Forms Rules — how each business action is performed and how its Business Rules (BR-NNN) surface as guidance/validation, without adding behavior | UX |
| UX-005 | Language, RTL & Accessibility — Arabic-first RTL presentation, terminology bound to PC-006, and accessibility/usability rules | UX |
| UX-006 | UX Traceability Matrix & Coverage — the UX sink: every UX rule traced to the Business Rule(s) it presents and the Product Constitution it serves; proof, not production | UX |

*(This map is LIVING: documents may be split or merged during the phase by an Owner-approved update
to P3-000, never by silent drift. **Amendment history:** the provisional "UX-001 Principles &
Interaction Doctrine" was frozen as UX-001 Constitutional Philosophy (interaction rules deferred to
UX-004); the provisional "UX-002 Actors & Access Presentation" was **retired at Architectural
Discovery** — its responsibility is covered by PC-005 + UXV-05 — and UX-002 was redefined as
Information Architecture; the remaining documents shifted to this six-document map, ADR-0051.)*

## 8. Phase checkpoints

- **UC1 — Foundation:** UX-001 (Philosophy), UX-002 (Information Architecture).
- **UC2 — Structure & interaction:** UX-003 (Workspace), UX-004 (Interaction & Forms).
- **UC3 — Language & accessibility:** UX-005.
- **UC4 — Traceability + phase audit:** UX-006 (the UX sink).

## 9. Quality gates

Every UX document passes the eight quality gates (GOV-003) at its propagation, with **Gate 4
(Design / UX consistency)** as focus, plus these phase-specific gates:

1. **No behavior introduced** — the document defines no Business Rule and changes none.
2. **Traceable** — every UX rule cites the frozen Business Rule(s) it presents.
3. **Derivable** — every screen/workspace/form implied is derivable from constitutional behavior.
4. **Boundary-honest** — any behavior gap is raised as an Amendment, never patched in UX.
5. **Terminology-bound** — all user-facing terms conform to PC-006 (canonical, no banned synonyms).

## 10. Traceability model

Every UX-NNN atom carries a dual citation, mirroring the constitution's rigor at the UX layer:

- **Authority of Behavior** — the frozen Business Rule(s) (BR-NNN) the interaction presents, and/or
  the frozen Domain/Product statement it serves; and
- **Authority of Presentation Legitimacy** — the Product Constitution statement (MMI/PR/AC/NR) that
  makes the presentation legitimate.

UX introduces no atom of behavior; a UX rule that cannot cite a frozen Business Rule (or a frozen
Product/Domain statement) as its Authority of Behavior is out of scope. The phase's final document
(UX-006) is the coverage sink: it demonstrates that every in-scope Business Rule that requires
presentation is presented by ≥1 UX rule, and that no UX rule originates behavior.

## 11. Phase governance

- **One document at a time, reviewed under GOV-013:** every UX constitutional document follows the
  Multi-Agent Review Protocol's lifecycle and Readiness Gate (GOV-013 MR-07/MR-08 — referenced,
  never restated here); no propagation without an explicit Owner Engineering Order (GOV-010).
  *(Aligned by ADR-0053; earlier wording embedded the pre-codification cycle.)*
- **Frozen material is read-only:** BC-000…BC-009, PC-001…008, DOM-001…005, and frozen governance
  are consumed, never modified. Any required change proceeds only through GOV-004 §5 amendment.
- **Cross-Document Consistency Review (CDC)** applies to every UX document: *Consumes only. No
  modification. No narrowing. No reinterpretation.* + "Scope intentionally closed."

## 12. Freeze / exit criteria

Phase 3 closes only when the UX exit criteria **UXX-1…UXX-6** all hold: every planned UX document
FROZEN; every in-scope Business Rule that requires presentation is presented by ≥1 UX rule; zero
UX rule originates or modifies behavior; no contradiction with the frozen constitutions; a complete
UX traceability matrix (UX-006); and a closure audit with eight gates PASS — after which Phase 4
can begin with no further UX interpretation. **Proof precedes Authorization:** UX-006 demonstrates
satisfaction; closure is declared only by a separate Owner Engineering Order.

## 13. Progress tracker (LIVING)

| Doc | Status |
|---|---|
| P3-000 | ADOPTED (this document — opens Phase 3, ADR-0049) |
| UX-001 UX Constitutional Philosophy & Layer Responsibility | **FROZEN** (2026-07-20, ADR-0050 / AUD-P3-002) — framework of Phase 3; 5 principles (UXP-01…05) + 5 invariants (UXV-01…05); philosophy-only. |
| UX-002 Information Architecture | **FROZEN** (2026-07-20, ADR-0051 / AUD-P3-003) — first structural document; IA-01…IA-07 (information domains, grouping, hierarchy, entry points, informational relationships, discoverability); consumes PC-003, organizes information not work. **Checkpoint UC1 COMPLETE.** *(Redefined via Architectural Discovery from the retired "Actors & Access Presentation", covered by PC-005 + UXV-05.)* |
| UX-003 Workspace Architecture | **FROZEN** (2026-07-20, ADR-0052 / AUD-P3-004) — WA-01…WA-09; six workspaces WS-01…WS-06 derived one-per-frozen-BC-purpose-family; 17 actions assigned exactly once; invariants WA-04 (single membership), WA-08 (completeness), WA-09 (observation is never a workspace). First document under the Autonomous Constitutional Engineering Contract. **Checkpoint UC2 begun.** |
| UX-004 Interaction & Forms Rules | **FROZEN** (2026-07-21, ADR-0054 / AUD-P3-005) — IX-01…IX-10; five action classes covering all 17 WA-06 actions exactly once; invariants incl. nothing-derivable-requested-or-accepted (IX-08) and workflow integrity with the three-criterion test (IX-10). First adoption under GOV-013 (Panel + Gate READY). **Checkpoint UC2 COMPLETE.** |
| UX-005 Language, RTL & Accessibility | **FROZEN** (2026-07-22, ADR-0056 / AUD-P3-006) — LA-01…LA-10 (three facets + LA-10 boundary rule) + LAV-01…LAV-06; language selection → Product (PLP-001); accessibility guarantee → Product (GOV-012 #30); UX owns presentation only. Three Readiness Verifications (NR→NR→READY). **Checkpoint UC3 COMPLETE.** |
| UX-006 UX Traceability Matrix & Coverage | **FROZEN** (2026-07-22, ADR-0057 / AUD-P3-007) — the UX coverage sink; proof, never production; §5 0 orphan + §6 0 gap (17/17 actions; every revealed fact homed); DR-018/DR-020 delegation closed via UX-002 IA-08 (amendment ADR-0058, v1.1.0). **Checkpoint UC4 COMPLETE.** |

**Phase 3 (UX Constitution) is CLOSED** (ADR-0059 / AUD-P3-FINAL): UX-001…UX-006 FROZEN (UX-002 v1.1.0); UC1–UC4 COMPLETE; the single authoritative source of UX behavior, amendments only via GOV-004 §5. Phase 4 (DDL Specification) is NEXT, pending explicit Owner authorization (GOV-011 §2).
| ~~Actors & Access Presentation~~ | RETIRED at Architectural Discovery — responsibility covered by PC-005 + UXV-05 (ADR-0051) |
