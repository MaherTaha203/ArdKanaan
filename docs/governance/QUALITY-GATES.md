# GOV-003 — Quality Gates

| Field | Value |
|---|---|
| Doc ID | GOV-003 |
| Title | Quality Gates |
| Phase | 0 |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | GOV-001, GOV-002 |
| Referenced by | GOV-004, GOV-005, RDM-001, TPL-003 |

---

## 1. Principle

Every phase MUST pass **all eight gates** before it is FROZEN and the next phase may
open. If ANY gate fails: **STOP → repair → restart ALL eight gates** for that phase
(a repair can invalidate gates that previously passed). Continue only when all pass
in a single uninterrupted audit run.

## 2. The eight gates

### Gate 1 — Architecture Review
Verifies structural soundness: the phase's artifacts fit the documentation-first
pipeline, respect phase boundaries, introduce no premature implementation concepts,
and keep the system's shape simple (GOV-001 §8).

### Gate 2 — Business Rules Review
Verifies conformance to the immutable project facts (GOV-001 §2): single center,
single owner, correct entity model, automatic revenue distribution, permanent
per-voucher storage of the applied split, and the Absolute Rule (F-08). In Phase 0,
this gate checks that governance documents state these facts correctly and nothing
contradicts them.

### Gate 3 — UX Review
Verifies that nothing burdens the future user: no process, rule, or (later) screen
may require manual entry of computable information, and simplicity/speed priorities
(F-09) are preserved. In documentation phases this gate reviews rules and flows;
from the HTML Prototype onward it reviews actual interfaces.

### Gate 4 — Design Review
Verifies coherence of the design language: document design in Phases 0–6 (uniform
headers, structure, register formats), and visual design language from Phase 5
onward.

### Gate 5 — Consistency Review
Verifies the Consistency Rule (GOV-001 §6): terminology identical everywhere, every
cross-reference resolves, no two documents contradict each other, phase numbering
and gate numbering identical in all documents.

### Gate 6 — Documentation Review
Verifies documentation completeness and quality: every document registered in
IDX-001, canonical header present and correct, statuses accurate, naming rules
(GOV-002 §2) followed, normative language used, no undocumented decisions.

### Gate 7 — Technical Review
Verifies technical correctness of the phase's artifacts: valid Markdown, working
relative links, correct ID sequences with no duplicates or gaps, templates usable
as written. From Phase 4 onward this gate also covers data-model integrity, and
after documentation freeze, code quality.

### Gate 8 — Repository Integrity Review
Verifies the repository as an artifact: directory layout matches IDX-001 §1, no
forbidden content (code, dependencies, schema, UI) before documentation freeze,
reserved directories contain only their stubs, git history and branch discipline
follow GOV-002 §8.

## 3. Gate verdicts

Each gate concludes with exactly one verdict:

- **PASS** — no defects, or only observations that require no change.
- **FAIL** — at least one defect requiring repair. Any FAIL triggers §1.

Verdicts, findings, and evidence are recorded in the phase audit report using
TPL-003 and stored under `docs/audits/phase-N/`.

## 4. Who executes gates

Gates are executed by the acting Quality Director (see GOV-004 §2). Each gate is
run as an independent adversarial pass: the reviewer's job is to find reasons to
FAIL, not reasons to pass.
