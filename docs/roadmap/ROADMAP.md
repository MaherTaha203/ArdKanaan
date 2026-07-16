# RDM-001 — Phase Roadmap

| Field | Value |
|---|---|
| Doc ID | RDM-001 |
| Title | Phase Roadmap |
| Phase | 0 |
| Status | LIVING |
| Version | 1.3.0 |
| Depends on | GOV-000, GOV-001, GOV-003, GOV-005, GOV-011 |

---

## 1. Pipeline overview

**This document is the LIVING status tracker, subordinate to the Master
Engineering Roadmap (GOV-011) — the only legal execution sequence. On any
divergence, GOV-011 wins and this document is repaired (ADR-0011 §4).**

Phases execute strictly in order. Every phase ends with all eight quality gates
(GOV-003) passing and an audit report in `docs/audits/phase-N/`; a phase opens
only under the universal phase-entry law (GOV-011 §2: previous phase frozen, all
gates passed, explicit Owner authorization). Implementation steps are forbidden
until Phases 1–6 are all FROZEN (“documentation freeze”).

## 2. Documentation track

| # | Phase | Deliverables | Directory | Status |
|---|---|---|---|---|
| 0 | **Repository Bootstrap & Governance Platform** | Manifesto, governance, conventions, gates, review process, workflow, traceability, AI execution protocol, engineering memory, repository health dashboard, index, roadmap, decision log, templates; audits AUD-P0-001 + AUD-P0-002 (extension per ADR-0006) | `docs/governance/`, `docs/` | ✅ COMPLETE (extended & re-frozen) |
| 1A | **Domain Discovery** (inserted by ADR-0007) | Business overview, business entities, business workflows (`WF-NN`), business rules catalog (`DR-NNN`), unknowns & assumptions register (`UNK`/`ASM`, LIVING); audit AUD-P1A-001 | `docs/domain/` | ✅ COMPLETE |
| 1 | **Product Constitution** | Product vision, scope & non-scope, actors, product requirements (`PR-NNN`), glossary of the ten core entities, traceability matrix. **Entry criterion:** cannot FREEZE while HIGH unknowns in DOM-005 remain open (ADR-0007 §7) | `docs/product/` | ⏳ NEXT |
| 2 | **Business Constitution** | Business rules (`BR-NNN`) for programs, teachers, payers, distribution policies, vouchers, operations, statements, balances; calculation rules; immutability rules for stored splits; traceability matrix | `docs/business/` | PENDING |
| 3 | **UX Constitution** | UX principles (`UX-NNN`), interaction rules, automation rules enforcing F-08, information architecture, language/RTL decisions, traceability matrix | `docs/ux/` | PENDING |
| 4 | **DDL Specification** | Documented data model (`DB-NNN`): entities, attributes, keys, constraints, integrity rules — as specification documents, **not** executable SQL | `docs/data/` | PENDING |
| 5 | **Component Library Specification** | Design language + component contracts (`CP-NNN`) — as specification documents, no code | `docs/components/` | PENDING |
| 6 | **Screen Blueprints** | Screen-by-screen blueprints (`SC-NNN`) composing UX rules, components, and data — as specification documents | `docs/screens/` | PENDING |

**→ Documentation Freeze** — all of Phases 1–6 FROZEN; declared by a dedicated
freeze audit report.

## 3. Implementation track (opens only after documentation freeze)

| # | Step | Gatekeeping |
|---|---|---|
| 7 | HTML Prototype | Built strictly from SC/CP/UX documents |
| 8 | Design Audit | Gate 4 focus, full 8-gate run |
| 9 | Repository Audit | Gate 8 focus, full 8-gate run |
| 10 | Database | DDL implemented exactly from DAT documents |
| 11 | Backend | Implements BR atoms; no rule may exist in code without a `BR` ID |
| 12 | Frontend | Implements SC blueprints against the component library |
| 13 | Integration | End-to-end assembly |
| 14 | Final Audit | Full 8-gate run + composed traceability matrix (GOV-006 §5.3) |

## 4. Re-audit rule

After every phase (documentation or implementation), **all eight gates re-run** for
that phase before the next opens. Amendments to frozen material re-open gates per
GOV-004 §5.

## 5. Status maintenance

This document is LIVING: the Status column in §2/§3 is updated in the same commit
that closes or opens a phase (GOV-005 step 8).
