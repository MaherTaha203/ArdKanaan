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

**Last refresh:** 2026-07-17 — UNK-025 rounding rule applied, Phase 1A re-frozen (AUD-P1A-006)

| # | Indicator | Value | Target | Status |
|---|---|---|---|---|
| 1 | Documentation completeness (registered docs present / planned for open phases) | 47 / 47 | 100% | 🟢 |
| 2 | Architecture consistency (structure matches IDX-001 §1; phase boundaries intact) | conformant | conformant | 🟢 |
| 3 | Business consistency (facts F-01…F-09 uncontradicted across repo) | 0 contradictions | 0 | 🟢 |
| 4 | UX consistency (no rule violating M-07/F-08) | 0 violations | 0 | 🟢 |
| 5 | Design consistency (canonical headers / document design) | 47 / 47 docs conformant | 100% | 🟢 |
| 6 | Terminology consistency (banned-synonym occurrences outside defining rules) | 0 | 0 | 🟢 |
| 7 | Traceability coverage (atoms with required upstream citations) | 9 / 9 F-atoms cite M; 28 / 28 DR-atoms cite F/M/owner decisions (ADR-0008/0009/0010/0013/0014) | 100% | 🟢 |
| 8 | Broken references (relative links that fail to resolve) | 0 | 0 | 🟢 |
| 9 | Technical debt (accepted deviations awaiting repair) | 0 items | 0 | 🟢 |
| 10 | Open decisions (ADRs in PROPOSED state) | 0 | 0 | 🟢 |
| 11 | Frozen documents | 24 (GOV-000…GOV-007, GOV-010, GOV-011, DOM-001…DOM-004, 10 audit reports) + 14 ACCEPTED ADRs | n/a | 🟢 |
| 12 | Pending reviews (phases open, awaiting gates) | 0 — no phase open | 0 at close | 🟢 |
| 13 | Open domain unknowns (DOM-005) | 15 (4 HIGH, 6 MEDIUM, 5 LOW); 2 assumptions awaiting confirmation (ASM-003, ASM-004); 10 unknowns resolved (9 answered, 1 mooted) + ASM-001 confirmed, ASM-002 rejected | HIGH = 0 before Phase 1 freeze (ADR-0007 §7) | 🟡 |

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
