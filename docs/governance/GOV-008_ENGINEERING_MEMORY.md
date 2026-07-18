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

### LES-007 — Ask what kind of thing it is before modeling it

- **Observation:** "Operations", carried since the founding brief as a core
  *entity* (F-05) and modeled as an entity placeholder in DOM-002, turned out —
  by the owner's definitive ruling (ADR-0010) — to be no entity at all, but a
  read-only system activity timeline.
- **Engineering lesson:** A term's *classification* (entity vs. view vs. event
  vs. report) is itself a discoverable fact and must be asked, not inherited from
  where the term appeared in a list. Modeling proceeds only after the
  classification question is answered.
- **Reason:** Founding enumerations mix things of different kinds; every reader
  before Session 2 (including the entity catalog's own structure) silently
  assumed "listed among entities" meant "is an entity".
- **Impact:** Contained — the placeholder carried a HIGH unknown instead of an
  invented model (LES-004 guidance worked); reclassification cost one section
  rewrite, not a cascade.
- **Future guidance:** For each term in an authoritative list, the first
  interview question is "what kind of thing is this?"; keep undefined terms as
  explicitly-unknown placeholders (never provisional models); expect answers to
  carry *signals* about other unknowns — log them on those unknowns without
  closing them (AI-11).

### LES-008 — Execution sequence must be law, not convention

- **Observation:** After several sequence events (interview reorder, V1 scope
  reduction), the Owner elevated the execution sequence from a LIVING status
  tracker (RDM-001) into governance law (GOV-011) with a universal three-condition
  phase-entry rule and an explicit conflict-resolution clause: the roadmap beats
  any future conversational instruction unless the Owner changes it.
- **Engineering lesson:** In a long-running, multi-session project, anything that
  lives only in conversation or in a mutable tracker will eventually be reordered
  ad hoc; sequence discipline holds only when the sequence itself is a frozen,
  citable document with a conflict rule.
- **Reason:** Sessions come and go (and AI sessions restart); the roadmap is the
  contract that survives them.
- **Impact:** Positive — every future session now has one authoritative answer to
  "what comes next and may I start it?" (No: not without previous-phase freeze,
  all gates passed, and explicit Owner authorization.)
- **Future guidance:** Check GOV-011 before opening any work; when an instruction
  conflicts with it, record the conflict and wait (GOV-011 §4, GOV-007 §5);
  status lives in RDM-001, law lives in GOV-011 — never blur the two.

### LES-009 — Record apparent gaps; never repair them on your own

- **Observation:** ADR-0011's numbering order skipped GOV-010. Instead of
  "fixing" the gap (renumbering) or silently ignoring it, the gap was recorded
  as reserved-unassigned by owner order. One order later, the Owner assigned
  GOV-010 as the Owner Decision Protocol — the gap was intentional headroom.
- **Engineering lesson:** An apparent inconsistency in an owner-mandated
  structure may be deliberate. The correct handling is exactly what governance
  prescribes for conflicts: record the observation, do not deviate, and let the
  authority resolve it.
- **Reason:** The executor cannot distinguish an oversight from a plan it has
  not been shown; self-repair destroys the plan, while recording preserves both
  possibilities at zero cost.
- **Impact:** Positive — the GOV sequence is now gap-free (GOV-000…GOV-011)
  without any renumbering, broken references, or rework.
- **Future guidance:** When owner-mandated names, numbers, or sequences look
  wrong: transcribe verbatim, record the observation in the ADR and audit, and
  wait. Reserve self-repair for defects in the executor's own artifacts.

### LES-010 — Decisions can implicitly create concepts no question asked about

- **Observation:** Session 3's "no overpayment — the system prevents amounts
  larger than what is due" (S3-D3) presupposes a defined **amount due** per
  student per program — a concept no interview question had asked about and no
  document had established. It was surfaced as a signal on UNK-005 instead of
  being silently absorbed.
- **Engineering lesson:** Owner decisions must be swept not only for what they
  answer but for what they **assume**: a prohibition or validation rule implies
  the existence of the quantity it checks against. Implied concepts are
  unknowns until the owner defines them.
- **Reason:** Decision language naturally references the owner's full mental
  model; the repository only holds the part that has been made explicit.
- **Impact:** Positive — DR-024 carries an explicit dependency signal instead of
  a hidden one; UNK-005's priority reasoning improved.
- **Future guidance:** After recording each decision, ask of every rule: "what
  must already exist for this rule to operate?" Any answer not yet defined in
  the repository becomes an unknown or a logged signal — never an implicit
  assumption (AI-11, GOV-010 §8's silent-impact prohibition applied to
  concepts).

### LES-011 — Session-closing language must reflect authority, not initiative

- **Observation:** The Owner corrected the executor's session-ending phrasing:
  "Next per the frozen plan: Session 4…" reads as if the executor leads
  execution, when the roadmap (GOV-011) defines only the **order** of work and
  never grants permission to begin (ADR-0014 D2).
- **Engineering lesson:** Communication is part of governance. A status line
  that names the next task in an anticipatory voice quietly reverses the
  authority model, even when the underlying behavior is compliant.
- **Reason:** Language shapes expectation; over many sessions, anticipatory
  phrasing normalizes executor-led sequencing.
- **Impact:** Linguistic only — no execution deviation occurred — but the
  correction precisely encodes the governance philosophy (GOV-010 §2,
  GOV-011 §2).
- **Future guidance:** **Every session MUST end with the compliance-first
  formula (mandated by ADR-0014 D2):**
  > Repository state: <current frozen state>.
  > No further work is authorized.
  > Awaiting explicit Owner Engineering Order.
  Pending items may be *listed as facts* (e.g. open unknowns and their session
  mapping) but never announced as "next" actions.

### LES-012 — State rules in plain domain language; make each rule locally true

- **Observation:** At Session 6 propagation the Owner rejected two draft
  wordings: (a) "the system returns to the state as if the voucher never existed"
  — true only when no dependents exist, so it silently leaned on another rule;
  and (b) the term "LIFO" for the cancellation-ordering rule — accurate but
  borrowed accounting/inventory jargon that invites future misreading. Both were
  reworded (DR-045 made self-contained; DR-046 written as "remove dependents
  newest → original").
- **Engineering lesson:** A rule should be true read in isolation (not only in
  conjunction with a sibling rule), and stated in the domain's own plain
  language rather than imported technical jargon. This is a distinct concern
  from business correctness — it is documentation quality, and it is a
  legitimate engineering lesson (not a business decision).
- **Reason:** Rules are read one at a time by future implementers and reviewers;
  a rule that is only true "together with rule X," or that hides behind a term
  of art, is a latent inconsistency and a Gate-5 hazard.
- **Impact:** Positive — DR-045/DR-046 are now unambiguous and jargon-free.
- **Future guidance:** When drafting a normative statement, test it two ways:
  "Is it still true if the reader knows only this one rule?" and "Would a
  domain expert with no accounting-systems background read this the way I
  mean?" Reword until both pass. Prefer the Owner's own vocabulary.

### LES-013 — Keep version/product scope out of business rules

- **Observation:** DR-043 initially bundled a business rule ("saving a financial
  document immediately posts it") with a version-scope statement ("no Draft
  stage in V1"). The Owner directed separating the two: the rule keeps only the
  business behavior; the V1 exclusion moves to ADR explanatory text and the
  Future Considerations section.
- **Engineering lesson:** A business rule states enduring business behavior;
  whether a capability is present in a given version is product/version scope.
  Co-locating them makes the rule version-bound and blurs what is permanent
  versus what is a scoping choice.
- **Reason:** Scope changes per version; business behavior is meant to endure.
  Mixing them forces re-editing the rule catalog on every scope change and
  muddies its meaning.
- **Impact:** Positive — DR-043 now states only business behavior; the V1 Draft
  exclusion lives in ADR-0018 S6-D6 and DOM-004 §Future considerations.
- **Future guidance:** When writing a DR, ask "is this true regardless of
  version?" Anything version-specific ("not in V1", "postponed", "future")
  belongs in ADR explanatory text, Future Considerations, or product-scope
  documentation — never in the rule body.

### LES-014 — State a business rule as behavior, not as a bare formula

- **Observation:** Before Session 9 propagation the Owner directed that the
  teacher-debt rule be expressed as business behavior — "a teacher debt exists
  only when total teacher payments exceed the teacher's final entitlement after
  all refund recalculations" — rather than as the equation `debt = payments −
  entitlement (when positive)`. The arithmetic was kept only in explanatory text,
  examples, and the ADR rationale (DR-065).
- **Engineering lesson:** A domain rule should describe *what is true in the
  business* and the *condition under which it holds*; a formula alone states the
  computation without the meaning. Behavior-first wording survives implementation
  choices and reads correctly to a non-programmer Owner; the formula is a faithful
  restatement, not the rule itself.
- **Reason:** Formulas invite the reader to treat the rule as an implementation
  detail and can hide the qualifying condition (here, "only when positive"); the
  behavior statement carries the condition in plain language. (Kin to LES-012:
  state rules in plain domain language.)
- **Impact:** Positive — DR-065 states the existence condition of a teacher debt
  in the Owner's own terms; the arithmetic lives beside it as explanation.
- **Future guidance:** When a decision arrives as a calculation, write the DR as
  the behavior and its condition first; place the formula in an explanatory aside,
  an example, or the ADR — never as the sole body of the rule.

### LES-015 — Verify LIVING governance files retain content, not merely that they exist

- **Observation:** During Session 9 propagation, GOV-008 (this file) was found to
  have been silently truncated to an **empty file** since the Session 7 commit
  (68429e3). Both the Session 7 and Session 8 audits reported GOV-008 as
  "unchanged"/consistent because their mechanical checks confirmed the file was
  *registered and present* (indicators 1, 5, 8) but never asserted it was
  *non-empty*. It was restored here from its last-good content (LES-001…LES-013).
- **Engineering lesson:** "File exists and is registered" is not "file has its
  expected content." A LIVING document can regress to empty (or lose sections)
  without breaking any link or register-diff check, so presence-only verification
  gives false assurance.
- **Reason:** The register 1:1 diff and link scan operate on filenames and
  references, not on body content or size; an empty-but-registered file passes
  both.
- **Impact:** Contained — content was recoverable verbatim from git history; no
  lesson was permanently lost. But two audits certified a repository that was in
  fact missing its entire engineering memory.
- **Future guidance:** Add a mechanical non-emptiness / minimum-size check for
  every LIVING and FROZEN document to the pre-commit and audit sweeps (AI-37):
  assert each registered file has a title line and a non-trivial body, and that
  files expected to grow monotonically (GOV-008, DOM-005, DEC-000) never shrink
  toward zero between commits. Treat a shrink-to-empty as a Gate 5/Gate 8 defect.

### LES-016 — Refine the concept, keep the entity name stable

- **Observation:** Session 10 revealed that a "Program" is really a single **run
  (offering)** — a richer concept than the founding term implied. The natural
  instinct was to rename the entity to "Program Run." The Owner instead directed:
  keep the entity name **"Program"** and document that *in V1 a Program represents
  a single Program Run (Offering).* The meaning was sharpened; the name stayed put.
- **Engineering lesson:** When discovery deepens the meaning of an existing term,
  prefer **refining the concept under the stable name** over renaming the entity.
  A rename ripples through every citing document, rule, workflow, and cross-
  reference and invites broken links and reader confusion for no domain gain; a
  documented refinement captures the same knowledge at a fraction of the blast
  radius.
- **Reason:** Names are load-bearing across a heavily cross-referenced repository;
  the cost of a rename is structural, while the value being added is semantic —
  the two should not be coupled.
- **Impact:** Positive — "Program" remained the single entity name (DOM-002 §3);
  DR-071 states the refined "a Program is a single run" meaning without disturbing
  F-06, DR-002, or any existing citation.
- **Future guidance:** When an interview sharpens what a known term *means*, add
  the refinement to the entity's definition and a DR; rename only when the old name
  is genuinely wrong (not merely less precise), and then do it as its own scoped
  change with a full cross-reference sweep.

---

## 4. Maintenance rules

1. Lessons are appended at phase close (GOV-005 §1 step 8) and whenever a
   noteworthy engineering event occurs mid-phase.
2. Each lesson cites the phase and, where relevant, the audit report that
   documents the triggering event.
3. Next available lesson number: **LES-017**.
