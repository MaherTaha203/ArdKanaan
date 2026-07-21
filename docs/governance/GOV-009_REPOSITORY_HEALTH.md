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

**Last refresh:** 2026-07-21 — **GOV-013 Multi-Agent Review Protocol FROZEN** (ADR-0053 / AUD-P0-006, atomic package): constitutional-document review is now repository law (Panel of six + Author + Readiness Judge; MR-01…MR-11; READY/NOT READY Gate; No Silent Progression). GOV-004 §2 amended (v1.2.0, scoped) and GOV-001 §9.6 hook added (v2.3.0). UX-004 (READY) propagates next under GOV-013

| # | Indicator | Value | Target | Status |
|---|---|---|---|---|
| 1 | Documentation completeness (registered docs present / planned for open phases) | 151 / 151 | 100% | 🟢 |
| 2 | Architecture consistency (structure matches IDX-001 §1; phase boundaries intact) | conformant | conformant | 🟢 |
| 3 | Business consistency (facts F-01…F-09 uncontradicted across repo) | 0 contradictions | 0 | 🟢 |
| 4 | UX consistency (no rule violating M-07/F-08) | 0 violations | 0 | 🟢 |
| 5 | Design consistency (canonical headers / document design; registered files non-empty) | 151 / 151 docs conformant | 100% | 🟢 |
| 6 | Terminology consistency (banned-synonym occurrences outside defining rules) | 0 | 0 | 🟢 |
| 7 | Traceability coverage (atoms with required upstream citations) | 9 / 9 F-atoms cite M; 90 / 90 DR-atoms cite upstream; PC-001…PC-008 atoms cite upstream; 33 / 33 PR cite constitution; 22 / 22 AC trace to PR; 87 / 87 BR dual-cited (Truth + Constitutional Legitimacy); BC-009 sink proves coverage/traceability/completeness (0 orphan BR, 0 gap) | 100% | 🟢 |
| 8 | Broken references (relative links that fail to resolve) | 0 | 0 | 🟢 |
| 9 | Technical debt (accepted deviations awaiting repair) | 0 items | 0 | 🟢 |
| 10 | Open decisions (ADRs in PROPOSED state) | 0 | 0 | 🟢 |
| 11 | Frozen documents | 86 (GOV-000…GOV-007 [GOV-001 v2.3.0, GOV-004 v1.2.0], GOV-010…GOV-013, DOM-001…DOM-004, PC-001…PC-008, BC-000…BC-009 [locked], UX-001…UX-003, 49 audit reports) + 53 ACCEPTED ADRs; P3-000 is LIVING | n/a | 🟢 |
| 12 | Pending reviews (phases open, awaiting gates) | **Phase 2 CLOSED & LOCKED** (BC-000…009); **Phase 3 (UX Constitution) IN PROGRESS** — UX-001…UX-003 FROZEN (**UC1 COMPLETE; UC2 begun**); six-document map; UX-004 next, pending explicit Owner order | 0 at close | 🟢 |
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
| 2026-07-19 | **BC-001 Programs, Pricing & Distribution Policy Rules FROZEN — Checkpoint C2 open** (ADR-0039) | AUD-P2-003 | **All indicators 🟢** — 18 BR (BR-001…018) in 13-field normal form, 11 categories; RP-1…5; every BR dual-cited; §8 Business Invariants INV-1…6 (derivational, not generative); every in-scope DR (071–079, 028, 031, 016) covered; no scope expansion |
| 2026-07-19 | **BC-002 Registration, Installment & Payer Rules FROZEN + CDC governance added** (ADR-0040) | AUD-P2-004 | **All indicators 🟢** — 9 BR (BR-019…027), 7 categories; RP-6…10; INV-7…10; installments divide settlement not obligation; BR-027 grounded in DR-087/071; first §9 Cross-Document Consistency Review ("Consumes only. No modification. No reinterpretation."); CDC clause added to P2-000 §6; consumes BC-001 with meaning intact; DR-021/022/023/024/086/087/089 covered |
| 2026-07-19 | **BC-003 Receipt, Voucher & Numbering Rules FROZEN — Checkpoint C2 COMPLETE** (ADR-0041) | AUD-P2-005 | **All indicators 🟢** — 13 BR (BR-028…040), 10 categories; RP-11…15; INV-11…15; BR-035 owns effect-arises-at-posting (calculation consumed from BC-001); BR-037 Immutability / BR-040 Lifecycle (single responsibility each); "Scope intentionally closed" adopted; four-line CDC finalized in P2-000 §6; consumes BC-001/BC-002 with meaning intact; DR-006/017/019/023/025/026/043/044/090 covered |
| 2026-07-19 | **BC-004 Teacher Entitlement & Debt Rules FROZEN + Phase 2 resequenced (Option A)** (ADR-0042) | AUD-P2-006 | **All indicators 🟢** — 8 BR (BR-041…048), 5 categories; RP-16…20; INV-16…20; Constitutional Boundary (entitlement only; never authorizes payment); BR-046 neutral (debt revealed when settlement exceeds entitlement); settlement split to new BC-006; BC-001/002/003 forward-refs amended to v1.0.1 (numeric only — every DR-/PC-/PR- token unchanged); DR-015/029/031/062…067/069 covered |
| 2026-07-19 | **BC-005 Refund & Adjustment Rules FROZEN** (ADR-0043) | AUD-P2-007 | **All indicators 🟢** — 9 BR (BR-049…057), 9 categories; RP-21…25; INV-21…25; Constitutional Boundary (refund/adjustment only; never authorizes settlement); BR-054 scoped to document's own effects; BR-055 implementation-neutral; BR-057 field-classification constitutional; consumes BC-002/003/004 with meaning intact; DR-036/037/040/041/042/045/046/047/048/085 covered |
| 2026-07-19 | **BC-006 Teacher Payment & Settlement Rules FROZEN — Checkpoint C3 COMPLETE** (ADR-0044) | AUD-P2-008 | **All indicators 🟢** — 9 BR (BR-058…066), 6 categories; RP-26…30; INV-26…30; Settlement definition + Principle #1; four-filter review PASS (Rule/Document/Set/Constitutional Independence); Transformation layer self-contained; BR-059 numbering consumed; BR-062 derived readings; INV-27 testable; DR-030/032/033/034/068/070 covered; **LES-020 (Architectural Saturation Principle)** recorded (BC-006 Reference Case) |
| 2026-07-19 | **BC-007 Balances & Party Financial Standing Rules FROZEN — Observation layer opened** (ADR-0045) | AUD-P2-009 | **All indicators 🟢** — 7 BR (BR-067…073), 7 categories; RP-31…35; INV-31…35; Observation definition + Principle #1 ("Aggregation is a mechanism of revelation, never a source of truth"); four-filter review PASS; self-contained (no forward dependency; dependency direction Creation→Transformation→Observation); BR-067 reveals from constitutional truths; BR-070 principle-level; DR-009/010/011/012/016/035 covered |
| 2026-07-20 | **BC-008 Non-Program Revenue, Expense & Lifecycle Rules FROZEN — Checkpoint C4 COMPLETE** (ADR-0046) | AUD-P2-010 | **All indicators 🟢** — 14 BR (BR-074…087), 7 categories; RP-36…40; INV-36…40; Creation-layer (creates center-only facts; lifecycle within frame); Principle #1 (center-only isolation) + Constitutional Boundary; BR-086 blocks only future business creation; BR-087 governs only the three current statuses; no forward dependency (facts BC-007 already reveals); DR-049…061/080…084/088 covered; Creation layer complete (BC-001/002/003/008); only BC-009 (C5) remains |
| 2026-07-20 | **BC-009 Phase 2 Traceability Matrix & Coverage FROZEN — Checkpoint C5 COMPLETE** (ADR-0047) | AUD-P2-011 | **All indicators 🟢** — constitutional sink (proof, not production; 0 BR/0 DR introduced); DR→BR coverage (76 in-scope) + BR→DR/PC matrix (87, **0 orphan**, verbatim-verified) + completeness (90 = 76 covered + 3 refined-forward + 11 disposition; **0 gap**) + BX-1…BX-6 objectively demonstrated; INV-41 (Constitutional Reproducibility, derivational); every planned Phase-2 doc (BC-000…009) frozen. **Phase 2 NOT declared closed** — closure/Phase-3 opening await a separate Owner order (Proof ≠ Authorization) |
| 2026-07-20 | **Phase 2 CLOSED & LOCKED; Phase 3 (UX Constitution) OPENED — P3-000 adopted** (ADR-0048 / ADR-0049) | AUD-P2-FINAL / AUD-P3-001 | **All indicators 🟢** — administrative authorization only (no constitutional truth introduced; no BR/PC/governance modified). BX-1…BX-6 all MET; BC-000…BC-009 frozen & locked as the single business reference (amendments only via GOV-004 §5). Phase 3 opened under GOV-011 §2; P3-000 UX Constitution Master Plan adopted (LIVING, `docs/ux/`); UX-layer-pure (Business ▷ UX per GOV-012); document map UX-001…UX-007 + checkpoints UC1…UC4 declared, none authored. Proof (BC-009) separate from Authorization (ADR-0048) preserved |
| 2026-07-20 | **UX-001 Constitutional Philosophy FROZEN — Checkpoint UC1 begun** (ADR-0050) | AUD-P3-002 | **All indicators 🟢** — framework of Phase 3 (UX analog of BC-000); answers one question (constitutional responsibility of the UX layer). Strong opening definition (window & hand); 5 principles (UXP-01…05, the stance) + 5 invariants (UXV-01…05, testable) sharply separated; §8 recast as Propagation Rule. Revision-1 (simplify: 11→5 principles, 7→5 invariants, design-guidance removed) + Revision-2 (UX presents but does not own product language; UXV-02 narrowed to business-presenting/-initiating elements) incorporated. Philosophy-only (0 BR/PR/DR; 0 screens/components/visuals); upstream-immutable |
| 2026-07-20 | **UX-002 Information Architecture FROZEN — Checkpoint UC1 COMPLETE** (ADR-0051) | AUD-P3-003 | **All indicators 🟢** — first structural document; redefined via Architectural Discovery (retired "Actors & Access", covered by PC-005 + UXV-05). IA-01…IA-07: information domains (Programs/Teachers/Students; Center = context, not a domain), grouping, hierarchy, entry points, informational relationships (not navigation), discoverability (every business fact has exactly one primary information home). Consumes PC-003, never redefines it; **organizes information, not work**. Revision-1 (domains reframing; Center→context; informational relationships; boundary line) + Revision-2 (domain vs structure distinction; discoverability definition) incorporated. P3-000 refined to a six-document map. Upstream-immutable (0 BR/PR/DR) |
| 2026-07-20 | **UX-003 Workspace Architecture FROZEN — Checkpoint UC2 begun** (ADR-0052) | AUD-P3-004 | **All indicators 🟢** — first document executed end-to-end under the **Autonomous Constitutional Engineering Contract** (Discovery → Draft → Adversarial Self Review → Readiness Verification → Propagation → Freeze). WA-01…WA-09: workspace defined as an operating context (NOT screen/page/nav/module/layout/component/UI) with explicit existence justification; work ⊥ information (ownership stays in UX-002); six workspaces WS-01…WS-06 derived one-per-frozen-BC-purpose-family; 17 Owner-authored actions each assigned exactly once; three orthogonal invariants (WA-04 single membership · WA-08 assignment completeness · WA-09 observation is never a workspace). Stage-3 four-checkpoint review + Stage-4 ten-dimension verification (3 defects corrected → READY). Upstream-immutable (0 BR/PR/DR) |
| 2026-07-21 | **GOV-013 Multi-Agent Review Protocol FROZEN — atomic package** (ADR-0053) | AUD-P0-006 | **All indicators 🟢** — the review policy moves from chat orders (void per GOV-001 §7.2) to repository law: Panel of six independent roles + Author + Readiness Judge; MR-01…MR-11 (Authority Model with conflict precedence; No Silent Progression with anti-bypass closures; READY/NOT READY Gate with satisfiable seating, closed mechanical delta, propagation-grade prohibitions, finding inheritance; amendments in scope). Full own-lifecycle run: 3-agent Discovery (CONFIRMED; identity corrected MARP→GOV-013), 5-hypothesis self-hardening, 6-role Panel (3 BLOCKING + ~12 MAJOR resolved; Prosecutor existence-case FAILED), independent Judge READY. GOV-004 §2 amended (v1.2.0, single-operator premise scoped to phase gates); GOV-001 §9.6 hook (v2.3.0); P3-000 §11 aligned |
