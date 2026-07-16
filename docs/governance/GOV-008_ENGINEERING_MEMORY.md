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

### LES-004 — An enumerated entity is not a defined entity

- **Observation:** Domain Discovery (Phase 1A) found that "Operations" — listed as
  a core entity in the founding facts (F-05) since Phase 0 — has no stated
  business meaning at all (→ UNK-001).
- **Engineering lesson:** A name appearing in an authoritative enumeration reads
  as "known", but enumeration is not definition; undefined listed concepts are the
  most dangerous gaps because no one questions them.
- **Reason:** F-05 was transcribed faithfully from the owner's brief, which named
  the entity without describing it; every later restatement inherited the name.
- **Impact:** Contained — discovered before Product Constitution; captured as the
  first HIGH unknown (UNK-001) rather than silently interpreted.
- **Future guidance:** When ingesting authoritative lists, immediately test each
  item: "could I write its Purpose, Lifecycle, and Example right now from stated
  facts?" Any item that fails goes straight into the unknowns register (AI-11).

### LES-005 — Resolving unknowns creates new, more precise unknowns

- **Observation:** Interview Session 1 resolved two HIGH unknowns (UNK-002,
  UNK-020) but the answers introduced five compensation models whose per-receipt
  money semantics are themselves undefined — spawning UNK-024. The founding
  vocabulary also shifted: "Center Balance" split into three never-merged
  balances (Cash / Teacher Payables / Center Net).
- **Engineering lesson:** Domain knowledge converges by refinement, not by
  monotonic countdown; each real answer sharpens the questions and can refine
  founding vocabulary. A permanent business rule discovered this way (rounding
  belongs to the currency, never to distribution — DR-014) can retire a whole
  class of would-be design decisions.
- **Reason:** The owner's mental model is richer than any first brief; interviews
  expose structure the brief compressed (percentage was only the *most common*
  model, not *the* model — ASM-002 rejected).
- **Impact:** Positive — the balance model and entitlement timing are now exact;
  UNK count went 23 → 22 despite two resolutions.
- **Future guidance:** After every interview session, re-derive the unknown
  register from the answers (spawn follow-ups explicitly), update fixed
  terminology immediately when the owner refines vocabulary, and never treat a
  rejected assumption as wasted work — its rejection is itself a captured rule.

### LES-006 — Scope reduction is a valid way to close unknowns

- **Observation:** UNK-024 (per-model money semantics, HIGH) was closed without
  ever being answered: the owner's V1 scope decision (ADR-0009) removed the
  models that created it. The pending interview session 1-FU was withdrawn.
- **Engineering lesson:** An unknown can be resolved by answering it OR by
  descoping the reality that raised it; both are legitimate, but a descope must
  record the postponed scope explicitly (Future Considerations) so it is neither
  forgotten nor half-remembered as an active rule.
- **Reason:** Simplicity is a stated project value (M-08, F-09) — after seeing
  the question load the multi-model design created, the owner cut V1 back to the
  one model that covers the common case.
- **Impact:** Positive — the entire V1 distribution area now has zero open
  questions; HIGH unknowns dropped 7 → 6 with no invention.
- **Future guidance:** When a scope decision arrives, sweep the unknown register
  for every unknown that exists only because of the removed scope and close them
  as "mooted by scope", citing the ADR; withdraw any pending interview questions
  about the removed scope; and keep the exploratory decision trail intact
  (supersede ADRs partially, never rewrite them).

---

## 4. Maintenance rules

1. Lessons are appended at phase close (GOV-005 §1 step 8) and whenever a
   noteworthy engineering event occurs mid-phase.
2. Each lesson cites the phase and, where relevant, the audit report that
   documents the triggering event.
3. Next available lesson number: **LES-007**.
