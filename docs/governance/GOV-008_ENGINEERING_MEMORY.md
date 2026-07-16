# GOV-008 — Engineering Memory

| Field | Value |
|---|---|
| Doc ID | GOV-008 |
| Title | Engineering Memory |
| Phase | 0 (spans all phases) |
| Status | LIVING |
| Version | 1.0.0 |
| Depends on | GOV-000 (M-10), GOV-007 (AI-02, AI-38) |
| Referenced by | GOV-005, GOV-009 |

---

## 1. Purpose

Permanent record of **engineering lessons learned** in this repository. It is not
an ADR (it records experience, not decisions), and not a changelog (git history
does that). Every future working session — human or AI — MUST read this document at
session start (AI-02) and MUST append lessons at phase close (AI-38). Lessons are
never deleted; an obsolete lesson is marked `RETIRED` with its reason.

## 2. Lesson format

Each lesson records: **ID · Title · Observation · Engineering lesson · Reason ·
Impact · Future guidance**. IDs are `LES-NNN`, sequential, never reused.

---

## 3. Lessons

### LES-001 — Verify platform preconditions before promising platform actions

- **Observation:** At Phase 0 close, the pushed branch was the repository's only
  branch; no default branch existed, so the intended pull request could not be
  created.
- **Engineering lesson:** Repository-platform actions (PRs, protections, CI) have
  preconditions that an empty repository does not satisfy.
- **Reason:** A PR requires a base branch distinct from the head branch; a
  root-commit push to an empty repository creates exactly one branch.
- **Impact:** Low — work was pushed and intact; only the PR step was blocked and
  reported.
- **Future guidance:** Before committing to a platform action, verify its
  preconditions mechanically (list branches/settings first). When a default branch
  exists, open the PR for the phase branch then.

### LES-002 — Create referenced artifacts in the same change that references them

- **Observation:** The Phase 0 link-resolution scan initially reported one broken
  link: README referenced the audit report before the report file existed.
- **Engineering lesson:** A reference and its target are one atomic unit of work;
  the Consistency Rule (GOV-001 §6) applies to forward references too.
- **Reason:** Documents were authored top-down, while the audit report is by nature
  the last artifact of a phase.
- **Impact:** None in the final state — the report was created before commit — but
  the intermediate state briefly violated link integrity.
- **Future guidance:** Order authoring so targets exist before or together with
  their references, and always run the mechanical link scan (AI-37) immediately
  before every commit, not only during audits.

### LES-003 — Naming conventions need an explicit extension procedure

- **Observation:** The Phase 0 extension mandated filenames of the form
  `GOV-NNN_UPPER_SNAKE.md`, which conflicted with the founding convention
  `UPPER-KEBAB.md` (GOV-002 §2).
- **Engineering lesson:** A convention without a documented procedure for
  externally mandated exceptions forces a choice between silent inconsistency and
  ad-hoc rule-breaking.
- **Reason:** GOV-002 v1.0.0 fixed one pattern per document class and did not
  anticipate mandated variations.
- **Impact:** Moderate — resolved by ADR-0006 §3: the new pattern is canonical for
  GOV-000 and GOV-007+, founding documents keep their frozen names, and GOV-002 was
  amended accordingly.
- **Future guidance:** When an instruction conflicts with a frozen convention,
  apply GOV-007 §5: surface the conflict, resolve it with an ADR, and amend the
  convention — never fork the convention silently.

---

## 4. Maintenance rules

1. Lessons are appended at phase close (GOV-005 §1 step 8) and whenever a
   noteworthy engineering event occurs mid-phase.
2. Each lesson cites the phase and, where relevant, the audit report that
   documents the triggering event.
3. Next available lesson number: **LES-004**.
