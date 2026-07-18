# P1-000 — Product Constitution Master Plan

| Field | Value |
|---|---|
| Doc ID | P1-000 |
| Title | Product Constitution Master Plan |
| Phase | 1 (Product Constitution) |
| Status | LIVING (governing plan for the phase; subordinate to GOV-011) |
| Version | 1.0.0 |
| Depends on | GOV-011 §2/§3, GOV-012 (ownership authority), ADR-0007 §7, ADR-0025 (Phase 1 authorization), ADR-0027 (this plan's adoption), DOM-001…DOM-005 (frozen domain), GOV-001…GOV-010 |
| Governs | all Phase 1 (PC-NNN) documents |

---

## 1. Status & lineage

This is the governing roadmap for the entire Product Constitution phase. It
**supersedes the earlier presented draft** of P1-000: that draft placed several
UX-layer documents in Phase 1, which **GOV-012** (the sole ownership authority,
Appendix B) objectively assigns to **UX (Phase 3)**. This version is reconciled with
GOV-012 and with the approved Architecture Review, and is **Product-layer-pure**.

**GOV-012 is the sole official reference for the ownership of any new decision in this
phase.** Every classification below is derived from it.

## 2. Why Product Constitution exists

Domain Discovery (Phase 1A, frozen) answered *"what is the business?"* Product
Constitution answers *"what is the product that serves this business, and what is it
deliberately not?"* — converting a frozen business model into a bounded, testable
product definition (vision, principles, scope, actors, vocabulary, and **Product
Requirements PR-NNN**). It introduces **no** business behavior (frozen) and **no**
UX/interaction/visual design (Phase 3+).

## 3. Layer relationships (per GOV-012)

| Relationship | Definition |
|---|---|
| **← Domain Discovery (Phase 1A, frozen)** | Sole upstream source of truth. Every PR cites F/DR/M and contradicts no DR. Product *selects and bounds* domain behavior; it never adds or edits domain facts. Open unknowns (UNK-013/021/022/029/030) are honored as scope boundaries, not reopened. |
| **→ Business Constitution (Phase 2)** | PR atoms become the parents of BR atoms; Phase 2 makes in-scope behavior calculation-exact. |
| **→ UX Constitution (Phase 3)** | Product declares *what* and *which capabilities*; UX designs *how they are operated* (IA, navigation, interaction, workspace, UI-language — GOV-012 Appendix B). |
| **→ DDL (Phase 4) / Engineering (10–13)** | PR + entities constrain the documented data model and, transitively, the build. Product names; it does not design schema or code. |

## 4. Phase goals

1. State the product's identity and enduring principles (incl. the automation boundary).
2. Fix explicit, testable **scope and non-scope** (consolidating every Domain-Discovery Future Consideration and open unknown).
3. Define the **actors** and the single-user model.
4. Establish canonical **product vocabulary** (terms + definitions).
5. Author the complete **Product Requirements (PR-NNN)**, each traceable to F/DR/M.
6. Produce the **Phase 1 traceability matrix**.

## 5. Expected outputs

The PC document set (§8), a closed **PR-NNN** register, the **Product Language &
Glossary**, the **Phase 1 Traceability Matrix**, and the Phase 1 completion audit.

## 6. Acceptance criteria (phase-level)

- Every PR cites ≥1 upstream F/DR/M and contradicts **no** DR.
- Scope/non-scope covers **every** Domain-Discovery Future Consideration and open unknown as an explicit in/out line.
- Glossary reconciles 1:1 with DOM-002 vocabulary; zero terminology drift.
- **No PC document contains UX/interaction/navigation/visual/implementation content** (GOV-012 layer purity; verifiable).
- All eight quality gates PASS in one run; all GOV-009 indicators green.

## 7. Exit criteria

- All PC documents FROZEN; **zero open HIGH unknowns** (already satisfied — 0 HIGH).
- Phase 1 completion audit committed.
- Explicit Owner authorization to open **Phase 2** (GOV-011 §2).

## 8. Document roadmap (mission only — contents NOT written here)

Each document is Product-layer by GOV-012 (classification column cites the test).

| ID | Document | The one question it answers | GOV-012 owner (why) |
|---|---|---|---|
| PC-001 | Product Manifesto | Why does this product exist and what does it stand for? | Product (Q2: binds every UI/impl; survives redesign, L7) |
| PC-002 | Product Principles (incl. Automation Boundary) | By what rules do we decide, and what does the product decide vs ask? | Product (Q2; automation boundary rooted in F-08) |
| PC-003 | Product Mental Model | What are the product's objects and how do they relate? | Product (Q2; conceptual model, not schema) |
| PC-004 | Scope, Non-Scope & Anti-Patterns | What is in V1, what is out, what must it never become? | Product (Q2; scope boundary) |
| PC-005 | Actors & Access Model | Who are the actors and who uses the system? | Product (Q2; single-user model, F-02, DR-089) |
| PC-006 | Product Language & Glossary | What are the canonical terms and their definitions? | Product (Q2; terminology survives reskin, L7/L13) |
| PC-007 | Product Requirements (PR-NNN) | What must the product do? | Product (Q2; requirements, not flows) |
| PC-008 | Phase 1 Traceability Matrix | Is every requirement grounded and every in-scope rule covered? | Product (reflective of PR; L11) |

### Per-document specification (mission, not contents)

- **PC-001 Product Manifesto** — *Purpose:* the product's reason to exist for the Owner-user (distinct from GOV-000, the project/repo manifesto). *Scope:* vision & value; the "seconds, not spreadsheets" promise. *Inputs:* GOV-000 (M-atoms), DOM-001, F-atoms. *Outputs:* vision statement + 3–7 tenets. *Dependencies:* none (root). *Acceptance:* each tenet traces to an M/F atom; explicit boundary note vs GOV-000; no UX content.
- **PC-002 Product Principles** — *Purpose:* enduring product decision rules + the automation boundary (what the product decides vs asks). *Scope:* product principles only; not UX rules, not BRs. *Inputs:* PC-001, M-07/M-08/F-08. *Outputs:* numbered principles incl. an Automation Boundary section. *Dependencies:* PC-001. *Acceptance:* each principle testable against future PRs; none restates a DR or UX rule.
- **PC-003 Product Mental Model** — *Purpose:* the conceptual objects and their relationships as a product model. *Scope:* concepts & relationships; excludes schema (Phase 4) and screens. *Inputs:* DOM-002, DOM-003. *Outputs:* mental-model overview + relationship narrative. *Dependencies:* PC-001, PC-002. *Acceptance:* every object maps 1:1 to a DOM-002 entity/concept; no invented entity.
- **PC-004 Scope, Non-Scope & Anti-Patterns** — *Purpose:* the explicit V1 boundary and forbidden directions. *Scope:* in/out registers consolidating all Future Considerations + open unknowns; anti-patterns (ERP, multi-user, accounting SW, manual compute). *Inputs:* DOM-004 §Future considerations, DOM-005, all ADRs, M-02/03/08, F-02/03. *Outputs:* scope register, non-scope register, anti-pattern register. *Dependencies:* PC-001, PC-002. *Acceptance:* every deferred/future/open item appears exactly once as in or out; no line contradicts a DR.
- **PC-005 Actors & Access Model** — *Purpose:* the actors and the single-user model. *Scope:* Owner (sole system user, F-02); Teachers/Students/Guardians as non-users (DR-089). *Inputs:* DOM-001 §2, DOM-002 §2/§4/§5, DR-089, F-02. *Outputs:* actor catalog with (non-)access. *Dependencies:* PC-003. *Acceptance:* exactly one system user; every actor traces to a domain participant; no invented role.
- **PC-006 Product Language & Glossary** — *Purpose:* canonical product vocabulary (terms + definitions + banned synonyms). *Scope:* product/domain terminology; excludes UI copy / RTL (Phase 3). *Inputs:* DOM-002 terms, GOV-002 §7.2, ADR-0005. *Outputs:* glossary entries (name + definition + banned synonyms), each linked to DOM-002. *Dependencies:* PC-003. *Acceptance:* 1:1 with DOM-002 vocabulary; zero banned-synonym use; UI-language explicitly out.
- **PC-007 Product Requirements (PR-NNN)** — *Purpose:* the atomic, testable statements of what the product must do. *Scope:* functional product requirements; no calculation formulas (Phase 2), no UX/screen detail. *Inputs:* DOM-003 (WF), DOM-004 (DR), PC-002/004/005/006. *Outputs:* the continuous PR-NNN register. *Dependencies:* PC-001…PC-006. *Acceptance:* every PR cites ≥1 F/DR/M, contradicts no DR, is individually verifiable; every in-scope DR/WF covered by ≥1 PR.
- **PC-008 Phase 1 Traceability Matrix** — *Purpose:* prove upstream coverage. *Scope:* PR → DR/F/M and DR/WF → PR (both directions). *Inputs:* PC-007, DOM-004, GOV-001, GOV-006. *Outputs:* the matrix. *Dependencies:* all PC docs (authored last). *Acceptance:* zero orphan PRs; zero uncovered in-scope DR/WF; conforms to GOV-006.

### Deferred to Phase 3 — UX Constitution (per GOV-012 Appendix B)

Information Architecture (navigable), Navigation, Interaction design, Workspace, and
UI-language/RTL. Their *product inputs* (which capabilities exist, the efficiency
guarantee F-09, the automation boundary) live here as PR atoms; their *design* is UX.

## 9. Phase governance

- **Approval flow:** each PC document authored as DRAFT → Owner review → Owner approval → propagation (GOV-010) → FROZEN.
- **Review process:** all eight quality gates (GOV-003) per document/batch; owner-mandated review pass.
- **Ownership authority:** **GOV-012** decides the layer of any new decision; a decision failing the Product gate is out of Phase 1.
- **Freeze policy:** a PC document freezes when its acceptance criteria pass and upstream citations resolve; the phase freezes per §7.
- **Versioning:** semantic (ADR-0003); DRAFT until first freeze; amendments via GOV-004 §5.
- **Dependencies / order:** `PC-001 → PC-002 → PC-003 → {PC-004, PC-005, PC-006} → PC-007 → PC-008` (acyclic; PR is the convergence, the matrix the sink).
- **Checkpoints:** C1 foundation (001–003) · C2 definition (004–006) · C3 requirements (007) · C4 traceability + phase audit (008).
- **Completion:** §7 exit criteria + Owner authorization to open Phase 2.

## 10. Quality requirements (every PC document)

Single responsibility (one question) · clear ownership · zero overlap (GOV-012
decomposition) · measurable completion (the acceptance criteria above) · layer purity
(no UX/Visual/Engineering content; each doc states its Business/Product relationship).

## 11. Progress tracker (LIVING)

| Doc | Status |
|---|---|
| P1-000 | ADOPTED (this document) |
| PC-001 Product Manifesto | **FROZEN** (2026-07-18, ADR-0028 / AUD-P1-002) — 7 axioms PA-1…PA-7 |
| PC-002 Product Principles (+ Automation Boundary) | **FROZEN** (2026-07-18, ADR-0029 / AUD-P1-003) — PP-1…PP-6 + Automation Boundary A/B/C + AB-1 |
| PC-003 Product Mental Model | **FROZEN** (2026-07-18, ADR-0030 / AUD-P1-004) — 19 concepts; §0 The Product's World; MMI-1…MMI-9. **Checkpoint C1 COMPLETE.** |
| PC-004…PC-008 | NOT STARTED — authored on Owner order, in the §9 sequence |
