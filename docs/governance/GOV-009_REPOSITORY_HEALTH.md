# GOV-009 — Repository Health

| Field | Value |
|---|---|
| Doc ID | GOV-009 |
| Title | Repository Health |
| Phase | 0 (spans all phases) |
| Status | LIVING |
| Version | 1.0.0 |
| Depends on | GOV-000 (M-10), GOV-003, GOV-006, GOV-007 (AI-38) |
| Referenced by | GOV-005, TPL-003 |

---

## 1. Purpose

Permanent, measurable dashboard of repository health. It is refreshed **after every
completed phase** (GOV-005 §1 step 8, AI-38) using the mechanical checks of AI-37,
and its values must agree with the latest audit report. A dashboard value that
cannot be backed by evidence is a Gate 6 DEFECT.

## 2. Dashboard

**Last refresh:** 2026-07-19 — **Phase 2 — Business Constitution OPENED**; P2-000 adopted, BC-000 framework frozen (ADR-0037/0038 / AUD-P2-001/002)

| # | Indicator | Value | Target | Status |
|---|---|---|---|---|
| 1 | Documentation completeness (registered docs present / planned for open phases) | 107 / 107 | 100% | 🟢 |
| 2 | Architecture consistency (structure matches IDX-001 §1; phase boundaries intact) | conformant | conformant | 🟢 |
| 3 | Business consistency (facts F-01…F-09 uncontradicted across repo) | 0 contradictions | 0 | 🟢 |
| 4 | UX consistency (no rule violating M-07/F-08) | 0 violations | 0 | 🟢 |
| 5 | Design consistency (canonical headers / document design; registered files non-empty) | 107 / 107 docs conformant | 100% | 🟢 |
| 6 | Terminology consistency (banned-synonym occurrences outside defining rules) | 0 | 0 | 🟢 |
| 7 | Traceability coverage (atoms with required upstream citations) | 9 / 9 F-atoms cite M; 90 / 90 DR-atoms cite upstream; PC-001…PC-008 atoms cite upstream; 33 / 33 PR cite constitution; 22 / 22 AC trace to PR | 100% | 🟢 |
| 8 | Broken references (relative links that fail to resolve) | 0 | 0 | 🟢 |
| 9 | Technical debt (accepted deviations awaiting repair) | 0 items | 0 | 🟢 |
| 10 | Open decisions (ADRs in PROPOSED state) | 0 | 0 | 🟢 |
| 11 | Frozen documents | 58 (GOV-000…GOV-007, GOV-010, GOV-011, GOV-012, DOM-001…DOM-004, PC-001…PC-008, BC-000, 34 audit reports) + 38 ACCEPTED ADRs | n/a | 🟢 |
| 12 | Pending reviews (phases open, awaiting gates) | Phase 2 IN PROGRESS — Checkpoint C1 complete (BC-000 frozen); authoring BC-001…008 | 0 at close | 🟢 |
| 13 | Open domain unknowns (DOM-005) | 5 (**0 HIGH**, 3 MEDIUM, 2 LOW); **0 assumptions pending**; 25 resolved; all 5 open items formally deferred at Phase 1A close (AUD-P1A-FINAL §4) | HIGH = 0 before Phase 1 freeze (ADR-0007 §7) | 🟢 |

Status legend: 🟢 at target · 🟡 deviation, repair scheduled · 🔴 deviation blocking
next phase.

## 3. Measurement rules

1. Indicators 1, 5, 8 are computed mechanically (register diff, header check, link
   scan); 2–4, 6–7 combine mechanical scans with the corresponding gate's review;
   9–12 are read from DEC-000, IDX-001, and RDM-001.
2. Any 🔴 indicator blocks opening the next phase until repaired and re-audited.
3. Each refresh cites the audit report that supplies its evidence.

## 4. Refresh history

| Date | Trigger | Audit | Result |
|---|---|---|---|
| 2026-07-16 | Phase 0 close | AUD-P0-001 | All indicators 🟢 (18 docs) |
| 2026-07-16 | Phase 0 extension close | AUD-P0-002 | All indicators 🟢 (24 docs) |
| 2026-07-16 | Phase 1A close | AUD-P1A-001 | 🟢 except indicator 13 🟡 — 23 open unknowns awaiting owner (by design: discovered, not invented) |
| 2026-07-16 | Session 1 decisions applied (ADR-0008) | AUD-P1A-002 | 🟢 except indicator 13 🟡 — 22 open (7 HIGH); UNK-002/020 resolved, UNK-024 opened |
| 2026-07-16 | V1 scope reduction (ADR-0009) | AUD-P1A-003 | 🟢 except indicator 13 🟡 — 21 open (6 HIGH); UNK-024 mooted, session 1-FU withdrawn |
| 2026-07-16 | Session 2: Operations defined (ADR-0010) | AUD-P1A-004 | 🟢 except indicator 13 🟡 — 20 open (5 HIGH); UNK-001 resolved, DOM-002 §9 reclassified |
| 2026-07-16 | Master Engineering Roadmap enacted (ADR-0011) | AUD-P0-003 | 🟢 except indicator 13 🟡 (unchanged — no domain work in this amendment) |
| 2026-07-16 | Owner Decision Protocol integrated (ADR-0012); Governance layer COMPLETE & FROZEN | AUD-P0-004 | 🟢 except indicator 13 🟡 (unchanged — no domain work in this amendment) |
| 2026-07-17 | Session 3 decisions applied (ADR-0013) | AUD-P1A-005 | 🟢 except indicator 13 🟡 — 16 open (5 HIGH); 5 unknowns resolved, UNK-025 opened, ASM-001 confirmed |
| 2026-07-17 | Rounding rule applied (ADR-0014) | AUD-P1A-006 | 🟢 except indicator 13 🟡 — 15 open (4 HIGH); UNK-025 resolved, ASM-004 opened |
| 2026-07-17 | Session 4: Teacher Payments (ADR-0015) | AUD-P1A-007 | 🟢 except indicator 13 🟡 — 14 open (3 HIGH); UNK-008 resolved, ASM-003 confirmed, UNK-021 postponed by Owner |
| 2026-07-17 | Session 5: Student Refunds (ADR-0016) | AUD-P1A-008 | 🟢 except indicator 13 🟡 — 15 open (3 HIGH); UNK-006 reduced→MEDIUM, UNK-026 opened; Refund Voucher entity added |
| 2026-07-17 | Unknown register restructured (ADR-0017) | AUD-P1A-009 | 🟢 except indicator 13 🟡 — 16 open (4 HIGH); UNK-026 refocused, UNK-027 split out, numbering item removed as design-deferred |
| 2026-07-17 | Session 6: Corrections & Cancellations (ADR-0018) | AUD-P1A-010 | 🟢 except indicator 13 🟡 — 15 open (3 HIGH); UNK-007 CLOSED; WF-08/WF-09 ESTABLISHED; Draft → Future Consideration |
| 2026-07-17 | DR-043 rule/scope separation refinement | inline (no ADR/DR/renumber; no behavior change) | 🟢 unchanged — DR-043 now states only business behavior; V1 Draft exclusion lives in ADR-0018 S6-D6 + Future Considerations; LES-013 |
| 2026-07-17 | Session 7: Expense Categories (ADR-0019) | AUD-P1A-011 | 🟢 except indicator 13 🟡 — 14 open (2 HIGH); UNK-009 & UNK-015 CLOSED; UNK-028 registered; WF-06 ESTABLISHED; Expense Category entity added |
| 2026-07-17 | Session 8: Expense Returns (ADR-0020) | AUD-P1A-012 | 🟢 except indicator 13 🟡 — 13 open (2 HIGH); UNK-028 CLOSED; WF-11 ESTABLISHED; Expense Return entity added |
| 2026-07-18 | Session 9: Refund Effects on Teacher Entitlement & Debt (ADR-0021) | AUD-P1A-013 | **All indicators 🟢** — 11 open (**0 HIGH**); UNK-026 & UNK-027 CLOSED (last two HIGH); DR-062…DR-070 added; WF-12 ESTABLISHED; Teacher Debt concept (§16) added; GOV-008 restored from empty (truncated since Session 7 — LES-015) |
| 2026-07-18 | Session 10: Program Definition, Pricing & Distribution Policy (ADR-0022) | AUD-P1A-014 | **All indicators 🟢** — 8 open (**0 HIGH**); UNK-003, UNK-005 & UNK-016 CLOSED; DR-071…DR-079 added; WF-13 ESTABLISHED; Program refined as single run (entity name kept); capacity & cohorts → Future Considerations; LES-016 |
| 2026-07-18 | Session 11: Business Boundary & Operational Completeness (ADR-0023) | AUD-P1A-015 | **All indicators 🟢** — 7 open (**0 HIGH**); UNK-006, UNK-018, UNK-019 CLOSED, UNK-029 & UNK-030 opened; DR-080…DR-088 added; center-only non-program revenue; teacher/registration lifecycle + shared status pattern (DR-088, §18); WF-14/15/16 ESTABLISHED; LES-017 |
| 2026-07-18 | Session 12: Final Boundary Confirmations (ADR-0024) | AUD-P1A-016 | **All indicators 🟢** — 5 open (**0 HIGH**, 0 assumptions pending); UNK-017 & UNK-023 CLOSED; ASM-004 CONFIRMED; DR-089 (Guardian) & DR-090 (per-type numbering) added; DR-028 amended (round-half-up) |
| 2026-07-18 | **Phase 1A CLOSED** — Domain Discovery frozen; Phase 1 authorized (ADR-0025) | AUD-P1A-FINAL | **All indicators 🟢** — DR-001…090; ADR-0001…0025; 5 unknowns open (0 HIGH) formally deferred; GOV-011 §2 phase-entry conditions met for Phase 1 |
| 2026-07-18 | **GOV-012 adopted** — Layer Ownership Constitution (ADR-0026) | AUD-P0-005 | **All indicators 🟢** — 17 laws incl. L16/L17; deterministic LOA; no conflict with Minimal Perturbation; frozen governance untouched |
| 2026-07-18 | **Phase 1 commenced** — P1-000 Master Plan adopted (ADR-0027) | AUD-P1-001 | **All indicators 🟢** — Product-layer-pure plan (PC-001…008); UX deferred to Phase 3 per GOV-012; GOV-012 is the ownership authority |
| 2026-07-18 | **PC-001 Product Manifesto FROZEN** (ADR-0028) | AUD-P1-002 | **All indicators 🟢** — 7 axioms (PA-1…PA-7), each testable/traceable; Product-layer-pure; Checkpoint C1 in progress |
| 2026-07-18 | **PC-002 Product Principles FROZEN** (ADR-0029) | AUD-P1-003 | **All indicators 🟢** — PP-1…PP-6 (derived, no restatement) + Automation Boundary A/B/C + AB-1 (one category per atom) + 19-row reference table |
| 2026-07-18 | **PC-003 Product Mental Model FROZEN — Checkpoint C1 COMPLETE** (ADR-0030) | AUD-P1-004 | **All indicators 🟢** — 19 concepts (1:1 DOM-002); §0 The Product's World; Registration as first-class abstraction; Party Financial Standing; MMI-1…MMI-9 |
| 2026-07-18 | **PC-004 Scope/Non-Scope/Anti-Patterns FROZEN — Checkpoint C2 open** (ADR-0031) | AUD-P1-005 | **All indicators 🟢** — SC-1…12, NS-1…12, AP-1…8, Boundary Tests BT-1…7, Extension Classification (Data/Capability/Behavior/Implementation), Future-Extension tiers |
| 2026-07-18 | **PC-005 Actors & Access Model FROZEN** (ADR-0032) | AUD-P1-006 | **All indicators 🟢** — 3 actor kinds (System User/Party/Contact); Owner sole user; access model AX-1…AX-5 (single-user, no roles; guarantee vs mechanism) |
| 2026-07-18 | **PC-006 Product Language & Glossary FROZEN — Checkpoint C2 COMPLETE** (ADR-0033) | AUD-P1-007 | **All indicators 🟢** — NR-1…NR-4 (canonical vs aliases), GG-1…GG-4 glossary governance, 25-term glossary with "Why banned" column; 1:1 with PC-003/DOM-002 |
| 2026-07-18 | **PC-007 Product Requirements & Traceability FROZEN — Checkpoint C3 COMPLETE** (ADR-0034) | AUD-P1-008 | **All indicators 🟢** — 33 PR (PR-001…033) across 9 categories; full traceability matrix; §6 Constitutional Coverage Report — each PC-001…006 at 100% |
| 2026-07-18 | **PC-008 Product Validation & Acceptance Criteria FROZEN — Checkpoint C4 COMPLETE** (ADR-0035) | AUD-P1-009 | **All indicators 🟢** — 22 AC (AC-01…022), 100% PR coverage; Constitution Completion Statement; Exit Criteria EX-1…EX-5; Constitutional Lock (§9) |
| 2026-07-18 | **Phase 1 — Product Constitution CLOSED** — PC-001…PC-008 frozen & locked (ADR-0036) | AUD-P1-FINAL | **All indicators 🟢** — EX-1…EX-5 all MET; 101 registered docs; ADR-0001…0036; end-to-end coverage (Domain ▷ PC ▷ PR ▷ AC) with no orphan; Phase 2 remains NEXT awaiting Owner authorization (GOV-011 §2) |
| 2026-07-19 | **Phase 2 — Business Constitution OPENED** — P2-000 Master Plan adopted (ADR-0037) | AUD-P2-001 | **All indicators 🟢** — GOV-011 §2 entry conditions met (Phase 1 frozen/locked); GOV-012 ownership authority; §3 Constitutional Position; `docs/business/` opened, `docs/audits/phase-2/` created; no domain/product/frozen governance modified |
| 2026-07-19 | **BC-000 Business Constitution Framework FROZEN — Checkpoint C1 COMPLETE** (ADR-0038) | AUD-P2-002 | **All indicators 🟢** — Dual Authority Doctrine §4.0 (Authority of Truth + Authority of Constitutional Legitimacy); BB-1…4, BCD-1…5, BCG-1…6, BCP-1…9, BCI-1…5, BX-1…6; no BR defined; Business-layer-pure |
