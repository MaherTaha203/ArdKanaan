# GOV-011 — Master Engineering Roadmap

| Field | Value |
|---|---|
| Doc ID | GOV-011 |
| Title | Master Engineering Roadmap |
| Phase | 0 (governance) |
| Status | FROZEN |
| Version | 1.0.1 |
| Depends on | GOV-000, GOV-001, GOV-003, GOV-004, GOV-005, ADR-0011 |
| Referenced by | GOV-001 §5/§9, GOV-005, GOV-010, RDM-001 |

---

## 1. Authority

This document is the **ONLY legal execution sequence** for the Ard Kanaan
project, from project start until Version 1 release. Future execution MUST
follow this roadmap exactly.

1. No session, agent, or document may **change its order**, **insert phases**,
   or **skip phases**.
2. **Only the Owner may modify this roadmap** (via the amendment procedure,
   GOV-004 §5, on the Owner's explicit order).
3. RDM-001 remains the LIVING status tracker, subordinate to this document; it
   must always agree with GOV-011, and on divergence GOV-011 wins (ADR-0011 §4).

## 2. Universal phase-entry law

A phase may begin ONLY after **all three** conditions hold:

1. **Previous phase frozen.**
2. **All quality gates passed** (GOV-003, all eight, one uninterrupted run).
3. **Explicit Owner authorization** to open the phase.

Without these three conditions, beginning the next phase is **forbidden**. This
law binds every phase below and overrides any contrary reading of any other
document.

## 3. The roadmap

The phases below define the execution sequence ONLY. Their internal
documentation is intentionally NOT written here and MUST NOT be executed or
expanded from this document.

### Phase 0 — Repository Bootstrap & Governance Platform

| Field | Definition |
|---|---|
| Phase Number | 0 |
| Phase Name | Repository Bootstrap & Governance Platform |
| Purpose | Establish governance, conventions, gates, workflow, traceability, AI protocol, memory, health, and this roadmap before any content work |
| Inputs | Owner's founding brief and orders |
| Outputs | GOV-000…GOV-011, IDX-001, RDM-001, DEC-000, templates, Phase 0 audits |
| Entry Conditions | Empty repository |
| Exit Conditions | All governance documents authored, registered, consistent |
| Freeze Conditions | All 8 gates PASS in one run; audit report committed |
| Required Reviews | Gates 1–8 (GOV-003) |
| Owner Approval Required | Yes |
| Dependencies | — |
| Success Criteria | Repository is a self-governing platform; zero broken references; all indicators green |

### Phase 1A — Domain Discovery

| Field | Definition |
|---|---|
| Phase Number | 1A |
| Phase Name | Domain Discovery |
| Purpose | Capture the complete business knowledge model without invention; identify every missing business fact |
| Inputs | GOV-001 facts (F-01…F-09), owner interview answers |
| Outputs | DOM-001…DOM-005, domain rules (DR), unknowns register (UNK/ASM), session decisions as ADRs |
| Entry Conditions | Universal law §2 (Phase 0 frozen, gates passed, Owner authorization) |
| Exit Conditions | Interview sessions completed as ordered by the Owner; every discovered fact documented or registered as unknown |
| Freeze Conditions | All 8 gates PASS; DOM-001…004 frozen (DOM-005 remains LIVING by design, ADR-0007 §5) |
| Required Reviews | Gates 1–8 + owner-mandated interview review passes |
| Owner Approval Required | Yes — including every unknown resolution |
| Dependencies | Phase 0 |
| Success Criteria | Business model exact; zero invented facts; HIGH unknowns identified and tracked |

### Phase 1 — Product Constitution

| Field | Definition |
|---|---|
| Phase Number | 1 |
| Phase Name | Product Constitution |
| Purpose | Define what the product is and is not: vision, scope, actors, product requirements |
| Inputs | GOV-000/001, DOM-001…005, resolved unknowns |
| Outputs | PRD documents with PR atoms, glossary, traceability matrix |
| Entry Conditions | Universal law §2 |
| Exit Conditions | All PRD documents authored, registered, reconciled with DR catalog |
| Freeze Conditions | All 8 gates PASS; **zero open HIGH unknowns in DOM-005** (ADR-0007 §7) |
| Required Reviews | Gates 1–8 |
| Owner Approval Required | Yes |
| Dependencies | Phase 1A |
| Success Criteria | Every PR cites F/DR upstream; no PR contradicts the DR catalog; scope and non-scope explicit |

### Phase 2 — Business Constitution

| Field | Definition |
|---|---|
| Phase Number | 2 |
| Phase Name | Business Constitution |
| Purpose | Codify every business rule of V1 with calculation-exact precision |
| Inputs | PRD documents, DOM-004 DR catalog, resolved unknowns |
| Outputs | BUS documents with BR atoms, calculation rules, immutability rules, traceability matrix |
| Entry Conditions | Universal law §2 |
| Exit Conditions | All BR atoms authored, each citing PR/DR/F upstream |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 |
| Owner Approval Required | Yes |
| Dependencies | Phase 1 |
| Success Criteria | Every money behavior of V1 derivable from BR atoms alone; no orphans, no inventions |

### Phase 3 — UX Constitution

| Field | Definition |
|---|---|
| Phase Number | 3 |
| Phase Name | UX Constitution |
| Purpose | Define UX principles, interaction rules, automation rules (F-08), information architecture, language/RTL decisions |
| Inputs | PRD + BUS documents |
| Outputs | UXC documents with UX atoms, traceability matrix |
| Entry Conditions | Universal law §2 |
| Exit Conditions | All UX atoms authored, each citing BR/PR upstream |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 |
| Owner Approval Required | Yes — including UI language decision (ADR-0005 §3) |
| Dependencies | Phase 2 |
| Success Criteria | No flow requires manual entry of computable data; speed/clarity priorities encoded |

### Phase 4 — DDL Specification

| Field | Definition |
|---|---|
| Phase Number | 4 |
| Phase Name | DDL Specification |
| Purpose | Document the complete data model as specification (entities, attributes, keys, constraints, integrity rules) — NOT executable SQL |
| Inputs | BUS + PRD documents, DOM entity catalog |
| Outputs | DAT documents with DB atoms, traceability matrix |
| Entry Conditions | Universal law §2 |
| Exit Conditions | All DB atoms authored, each citing BR/PR upstream |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 (Gate 7 includes data-model integrity) |
| Owner Approval Required | Yes |
| Dependencies | Phase 3 |
| Success Criteria | Every BR representable in the documented model; stored splits, three balances, append-only timeline expressible |

### Phase 5 — Component Library Specification

| Field | Definition |
|---|---|
| Phase Number | 5 |
| Phase Name | Component Library Specification |
| Purpose | Define the design language and component contracts as specification — no code, no HTML/CSS |
| Inputs | UXC documents |
| Outputs | CMP documents with CP atoms, traceability matrix |
| Entry Conditions | Universal law §2 |
| Exit Conditions | All CP atoms authored, each citing UX/BR upstream |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 (Gate 4 gains visual design language scope) |
| Owner Approval Required | Yes |
| Dependencies | Phase 4 |
| Success Criteria | Every screen need expressible from the component contracts |

### Phase 6 — Screen Blueprints

| Field | Definition |
|---|---|
| Phase Number | 6 |
| Phase Name | Screen Blueprints |
| Purpose | Specify every screen by composing UX rules, component contracts, and data model |
| Inputs | UXC, CMP, DAT documents |
| Outputs | SCR documents with SC atoms, traceability matrix; **Documentation Freeze** declared on close |
| Entry Conditions | Universal law §2 |
| Exit Conditions | All SC atoms authored, each citing UX/CP/DB upstream |
| Freeze Conditions | All 8 gates PASS; documentation-freeze audit covering Phases 1–6 |
| Required Reviews | Gates 1–8 + documentation-freeze audit |
| Owner Approval Required | Yes |
| Dependencies | Phase 5 |
| Success Criteria | The system is buildable from documentation alone; unbroken chain M→F→DR/PR→BR→{UX,DB,CP}→SC |

### Phase 7 — HTML Prototype

| Field | Definition |
|---|---|
| Phase Number | 7 |
| Phase Name | HTML Prototype |
| Purpose | Build the first tangible artifact strictly by transcribing SC/CP/UX documents |
| Inputs | Frozen SCR, CMP, UXC documents |
| Outputs | Static HTML prototype |
| Entry Conditions | Universal law §2 + Documentation Freeze declared |
| Exit Conditions | Every blueprinted screen prototyped, traceable to SC atoms |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 |
| Owner Approval Required | Yes |
| Dependencies | Phase 6 (Documentation Freeze) |
| Success Criteria | Prototype contains nothing without an SC/CP/UX citation |

### Phase 8 — Design Audit

| Field | Definition |
|---|---|
| Phase Number | 8 |
| Phase Name | Design Audit |
| Purpose | Verify the prototype against the design language and blueprints (Gate 4 focus, full run) |
| Inputs | HTML prototype, frozen documentation |
| Outputs | Design audit report |
| Entry Conditions | Universal law §2 |
| Exit Conditions | Every deviation repaired or ADR-recorded |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 (Gate 4 focus) |
| Owner Approval Required | Yes |
| Dependencies | Phase 7 |
| Success Criteria | Zero unexplained divergence between blueprints and prototype |

### Phase 9 — Repository Audit

| Field | Definition |
|---|---|
| Phase Number | 9 |
| Phase Name | Repository Audit |
| Purpose | Verify repository integrity before implementation begins (Gate 8 focus, full run) |
| Inputs | Entire repository |
| Outputs | Repository audit report; refreshed GOV-009 |
| Entry Conditions | Universal law §2 |
| Exit Conditions | All indicators green except deliberately tracked items |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 (Gate 8 focus) |
| Owner Approval Required | Yes |
| Dependencies | Phase 8 |
| Success Criteria | Implementation may start from a provably consistent base |

### Phase 10 — Database

| Field | Definition |
|---|---|
| Phase Number | 10 |
| Phase Name | Database |
| Purpose | Implement the database exactly from the frozen DAT specification |
| Inputs | Frozen DAT documents |
| Outputs | Executable DDL, database implementation |
| Entry Conditions | Universal law §2 |
| Exit Conditions | Schema matches every DB atom 1:1 |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 (Gate 7 includes schema verification) |
| Owner Approval Required | Yes |
| Dependencies | Phase 9 |
| Success Criteria | No schema element without a DB-atom citation; no DB atom unimplemented |

### Phase 11 — Backend

| Field | Definition |
|---|---|
| Phase Number | 11 |
| Phase Name | Backend |
| Purpose | Implement business rules exactly from the frozen BUS constitution |
| Inputs | Frozen BUS documents, database |
| Outputs | Backend implementation |
| Entry Conditions | Universal law §2 |
| Exit Conditions | Every BR atom implemented and verified; no rule exists in code without a BR ID |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 (Gate 2 verifies rule transcription) |
| Owner Approval Required | Yes |
| Dependencies | Phase 10 |
| Success Criteria | Automatic split, entitlement, three balances, and timeline behave exactly per BR atoms |

### Phase 12 — Frontend

| Field | Definition |
|---|---|
| Phase Number | 12 |
| Phase Name | Frontend |
| Purpose | Implement screens exactly from the frozen blueprints against the component library |
| Inputs | Frozen SCR/CMP documents, prototype, backend |
| Outputs | Frontend implementation |
| Entry Conditions | Universal law §2 |
| Exit Conditions | Every SC atom implemented; UI matches the design language |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 (Gates 3–4 verify UX/design fidelity) |
| Owner Approval Required | Yes |
| Dependencies | Phase 11 |
| Success Criteria | The owner performs daily work in seconds with zero manual computation (F-08, F-09) |

### Phase 13 — Integration

| Field | Definition |
|---|---|
| Phase Number | 13 |
| Phase Name | Integration |
| Purpose | Assemble database, backend, and frontend into the complete working system |
| Inputs | Phases 10–12 outputs |
| Outputs | Integrated V1 system, end-to-end verified |
| Entry Conditions | Universal law §2 |
| Exit Conditions | All business workflows executable end-to-end |
| Freeze Conditions | All 8 gates PASS |
| Required Reviews | Gates 1–8 |
| Owner Approval Required | Yes |
| Dependencies | Phase 12 |
| Success Criteria | Every documented workflow (WF) runs correctly end-to-end |

### Phase 14 — Final Audit & Version 1 Release

| Field | Definition |
|---|---|
| Phase Number | 14 |
| Phase Name | Final Audit & Version 1 Release |
| Purpose | Prove the delivered system equals the frozen documentation, then release V1 |
| Inputs | Complete system + entire documentation set |
| Outputs | Final audit report with composed traceability matrix (GOV-006 §5.3); V1 release |
| Entry Conditions | Universal law §2 |
| Exit Conditions | Unbroken chain M→F→DR/PR→BR→{UX,DB,CP}→SC→code demonstrated |
| Freeze Conditions | All 8 gates PASS; Owner accepts the release |
| Required Reviews | Gates 1–8 + composed traceability audit |
| Owner Approval Required | Yes — release is an Owner decision |
| Dependencies | Phase 13 |
| Success Criteria | V1 released; repository remains fully consistent and auditable |

## 4. Conflict rule (final rule)

**If future conversations contain conflicting instructions, this Master
Engineering Roadmap always wins — unless the Owner explicitly changes it.**
A session receiving a conflicting instruction records the conflict, does not
deviate, and waits for explicit Owner resolution (consistent with GOV-007 §5,
AI-39).
