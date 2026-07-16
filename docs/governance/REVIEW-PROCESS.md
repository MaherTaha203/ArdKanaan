# GOV-004 — Review Process

| Field | Value |
|---|---|
| Doc ID | GOV-004 |
| Title | Review Process |
| Phase | 0 |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | GOV-001, GOV-003 |
| Referenced by | GOV-005, TPL-003 |

---

## 1. Scope

Defines how reviews are conducted, recorded, and how failures are handled, for every
phase from Phase 0 through Final Audit.

## 2. Roles

This is a single-operator engineering effort; one person (or agent) acts in all
roles, but **must switch roles explicitly and sequentially**, never merging them:

| Role | Responsibility |
|---|---|
| Author | Produces phase documents |
| Principal Architect | Gate 1 |
| Domain Analyst | Gate 2 |
| UX Reviewer | Gate 3 |
| Design Reviewer | Gate 4 |
| Consistency Auditor | Gate 5 |
| Documentation Engineer | Gate 6 |
| Technical Reviewer | Gate 7 |
| Quality Director | Gate 8, owns the audit report and the final verdict |

## 3. Review procedure (per phase)

1. **Entry check** — all phase documents claim status IN-REVIEW; the previous phase
   is FROZEN.
2. **Gate execution** — Gates 1→8 run in order. Each gate:
   a. states its checklist (derived from GOV-003),
   b. examines every phase artifact plus every artifact it references,
   c. records findings with severity (DEFECT / OBSERVATION),
   d. issues PASS or FAIL.
3. **Failure handling** — on any FAIL: stop the run, repair all defects, apply the
   Consistency Rule (GOV-001 §6), then **restart from Gate 1**. Partial re-runs are
   forbidden.
4. **Freeze** — when all eight gates PASS in one uninterrupted run, phase documents
   move to FROZEN, the audit report (TPL-003) is committed to
   `docs/audits/phase-N/`, IDX-001 is updated, and the phase is declared complete.

## 4. Findings classification

| Severity | Meaning | Effect |
|---|---|---|
| DEFECT | Violates a rule in GOV-001…GOV-006 or contradicts another document | Gate FAILS |
| OBSERVATION | Improvement opportunity, no rule violated | Gate may still PASS; logged in the audit report |

## 5. Amendment procedure (changing FROZEN documents)

1. Open an ADR proposing the change and its blast radius (list of affected Doc IDs).
2. Apply the change and all consequential updates in one commit.
3. Re-run all eight gates for **every phase whose frozen documents changed**.
4. Update IDX-001 statuses and record the new audit report(s).

## 6. Review evidence

Every audit report must show, per gate: the checklist used, artifacts examined,
findings, and verdict. An audit report without evidence is itself a Gate 6 DEFECT.
