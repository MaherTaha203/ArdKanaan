# TPL-003 — Audit Report Template

| Field | Value |
|---|---|
| Doc ID | TPL-003 |
| Title | Audit Report Template |
| Phase | 0 |
| Status | LIVING |
| Version | 1.0.0 |
| Depends on | GOV-003, GOV-004 |

Copy everything below the horizontal rule into
`docs/audits/phase-N/AUDIT-PN-SUBJECT.md`. One report per completed audit run.
A report without per-gate evidence is itself a Gate 6 DEFECT (GOV-004 §6).

---

# AUD-P`<N>`-`<NNN>` — Phase `<N>` `<Subject>` Audit Report

| Field | Value |
|---|---|
| Doc ID | AUD-P`<N>`-`<NNN>` |
| Title | Phase `<N>` `<Subject>` Audit Report |
| Phase | `<N>` |
| Status | FROZEN |
| Version | 1.0.0 |
| Audit date | `<YYYY-MM-DD>` |
| Run | `<n>` (restarts count; only an all-PASS run may be final) |
| Final verdict | ALL GATES PASS / FAILED AT GATE `<k>` |

## 1. Scope

`<Phase deliverables audited, with Doc IDs. List every artifact examined.>`

## 2. Gate results

| Gate | Name | Verdict | Defects | Observations |
|---|---|---|---|---|
| 1 | Architecture Review | `<PASS/FAIL>` | `<n>` | `<n>` |
| 2 | Business Rules Review | `<PASS/FAIL>` | `<n>` | `<n>` |
| 3 | UX Review | `<PASS/FAIL>` | `<n>` | `<n>` |
| 4 | Design Review | `<PASS/FAIL>` | `<n>` | `<n>` |
| 5 | Consistency Review | `<PASS/FAIL>` | `<n>` | `<n>` |
| 6 | Documentation Review | `<PASS/FAIL>` | `<n>` | `<n>` |
| 7 | Technical Review | `<PASS/FAIL>` | `<n>` | `<n>` |
| 8 | Repository Integrity Review | `<PASS/FAIL>` | `<n>` | `<n>` |

## 3. Gate evidence

`<One subsection per gate: checklist used, artifacts examined, checks performed,
findings (DEFECT/OBSERVATION) with locations, and verdict rationale.>`

### Gate 1 — Architecture Review
`<evidence>`

### Gate 2 — Business Rules Review
`<evidence>`

### Gate 3 — UX Review
`<evidence>`

### Gate 4 — Design Review
`<evidence>`

### Gate 5 — Consistency Review
`<evidence>`

### Gate 6 — Documentation Review
`<evidence>`

### Gate 7 — Technical Review
`<evidence>`

### Gate 8 — Repository Integrity Review
`<evidence>`

## 4. Findings register

| # | Gate | Severity | Location | Finding | Resolution |
|---|---|---|---|---|---|
| 1 | `<k>` | `<DEFECT/OBSERVATION>` | `<Doc ID §>` | `<text>` | `<fixed in commit / accepted>` |

## 5. Conclusion

`<Declaration: phase FROZEN and next phase may open, or repairs required and gates
restart.>`
