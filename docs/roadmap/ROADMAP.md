# RDM-001 — Phase Roadmap

| Field | Value |
|---|---|
| Doc ID | RDM-001 |
| Title | Phase Roadmap |
| Phase | 0 |
| Status | LIVING |
| Version | 1.24.0 |
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
| 1A | **Domain Discovery** (inserted by ADR-0007) | Business overview, business entities, business workflows (`WF-01…16`), business rules catalog (`DR-001…090`), unknowns & assumptions register (`UNK`/`ASM`, LIVING); interview Sessions 1–12; audits AUD-P1A-001…016 + **AUD-P1A-FINAL** | `docs/domain/` | ✅ **CLOSED** (frozen 2026-07-18; ADR-0025) |
| 1 | **Product Constitution** | Governed by **P1-000** (ADR-0027): PC-001…PC-008 — manifesto (`PA`), principles (`PP`, Automation Boundary), mental model (`MMI`), scope/non-scope/anti-patterns, actors (`AX`), language & glossary (`NR`/`GG`), product requirements (`PR-001…033`), traceability matrix, validation & acceptance criteria (`AC-01…22`). Ownership authority: **GOV-012**. Constitution frozen & **locked** (PC-008 §9) | `docs/product/` | ✅ **CLOSED** (frozen & locked 2026-07-18; ADR-0036 / AUD-P1-FINAL) · post-closure gap-fill **PLP-001** Product UI Language Policy added (ADR-0055, 2026-07-22) — modifies no locked PC document |
| 2 | **Business Constitution** | Governed by **P2-000** (ADR-0037): framework **BC-000** + **BC-001…BC-009** — business rules (`BR-001…087`) for programs, teachers, payers, distribution policies, vouchers, operations, statements, balances; calculation rules; immutability rules for stored splits; traceability matrix (BC-009). Ownership authority: **GOV-012**. Governed by BC-000 Dual Authority (Truth + Constitutional Legitimacy) | `docs/business/` | ✅ **CLOSED & LOCKED** (frozen & locked 2026-07-20; ADR-0048 / AUD-P2-FINAL) — BC-000…BC-009; 87 BR dual-cited, 0 orphan, 0 gap; BX-1…BX-6 all MET; single authoritative source of business behavior (amendments only via GOV-004 §5) |
| 3 | **UX Constitution** | Governed by **P3-000** (ADR-0049): UX principles (`UX-NNN`), interaction rules, automation rules enforcing F-08, information & workspace architecture, forms, language/RTL & accessibility, UX traceability matrix — consuming BC-000…BC-009 as frozen, changing no business behavior. Ownership authority: **GOV-012** (Business ▷ UX) | `docs/ux/` | ✅ **CLOSED** (frozen 2026-07-22; ADR-0059 / AUD-P3-FINAL) — **UX-001…UX-006 FROZEN** (UX-002 v1.1.0 incl. IA-08; ADR-0050/0051/0052/0054/0056/0057, amendment ADR-0058); **UC1–UC4 COMPLETE**; reviewed under **GOV-013**; language selection owned by Product (**PLP-001**, ADR-0055); DR-018/DR-020 delegation closed via UX-002 IA-08; single authoritative source of UX behavior (amendments only via GOV-004 §5) |
| 4 | **DDL Specification** | Documented data model (`DB-NNN`): entities, attributes, keys, constraints, integrity rules — as specification documents, **not** executable SQL | `docs/data/` | 🟡 **NEXT** — Phases 1–3 all CLOSED; opens only on explicit Owner authorization (GOV-011 §2) |
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
