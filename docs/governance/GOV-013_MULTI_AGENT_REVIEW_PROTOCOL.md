# GOV-013 — Multi-Agent Review Protocol

| Field | Value |
|---|---|
| Doc ID | GOV-013 |
| Title | Multi-Agent Review Protocol |
| Phase | 0 (spans all phases — governance platform) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | GOV-001 (§7 decision governance); GOV-003 (phase gates, referenced); GOV-004 (review process — amended at this document's adoption, §10); GOV-005 (phase workflow, referenced); GOV-007 (AI executor conduct); GOV-008 (LES-008, generalized); GOV-010 (Owner decision protocol); GOV-012 (L12 — process rules live on the Governance Plane) |
| Referenced by | all future constitutional documents (MR-11); the adoption ADR |
| Answers | "Before a constitutional document is submitted for Owner approval: who must review it, under what independence constraints, through what lifecycle, and what is permitted or forbidden on each side of the readiness verdict?" |

---

> **Nature of this document.** GOV-013 codifies, as repository law, the multi-agent review model
> previously in force only through Owner engineering orders (there named the *Autonomous
> Constitutional Engineering Contract*, the *Multi-Agent Constitutional Execution Policy*, and the
> *Constitutional Readiness Gate* — **this document unifies all three under one canonical name:
> the Multi-Agent Review Protocol**). It governs **how constitutional documents are reviewed**; it
> is not a Business, Product, or UX document, and it defines no constitutional content of its own.

## 1. Purpose

Constitutional documents fix frozen law; the quality of that law is decided **before** the Owner
approves it — in review. This protocol fixes who reviews, how independently, through what
lifecycle, and behind what gate. It must exist as a repository document because:

- **GOV-001 §7.2** — undocumented decisions are void: a review policy living only in chat orders
  has, by the repository's own supreme rule, not been decided;
- **cross-session bindingness** — an AI executor is bound by frozen repository law (GOV-007
  AI-13/AI-36), and every constitutional document's lifecycle footer routes its reader here
  (MR-11); the adoption package adds the GOV-001 §9 binding hook that makes this protocol
  reachable from the governance root (§10) — chat orders can do none of this;
- **recorded experience** — LES-008 (generalized): conversation-only process rules decay;
  discipline holds only as a frozen, citable document.

**Governance, not workflow.** This protocol fixes *who must review, what must hold, and what is
prohibited* — governance. It fixes **no execution mechanics**: tooling, prompting, agent
implementation, session structure, model choice, and orchestration remain operational freedom
under GOV-007. Where this document names a sequence (MR-07), it names the constitutional order of
*meaning* — what must exist before what — exactly as GOV-005 does for phases; it prescribes no
operational procedure.

## 2. Definitions — MR-01…MR-03

- **MR-01 — Independent agent; the Panel.** An *independent agent* is a reviewer instance whose
  reasoning is separate from the Author's: it did not produce the text it examines, receives no
  instruction to approve, and its conclusions are its own. Specialized identity is mandatory —
  agents act **under their role names**, never as anonymous generic agents. **The Panel** is the
  set of six independent reviewer roles: Constitutional Reviewer, Adversarial Investigator,
  Constitutional Auditor, Proof Engineer, Scenario Tester, Constitutional Prosecutor. **Neither
  the Constitutional Author nor the Readiness Judge is a Panel member.**
- **MR-02 — Evidence-based finding; severity.** A finding is admissible only with evidence: the
  exact quote, file, and section that prove the claim. A finding without evidence is an opinion
  and carries no constitutional weight. Every finding carries **exactly one severity**:
  **BLOCKING** — bars progression until resolved; **MAJOR** — must be resolved before the Gate;
  **MINOR** — should be resolved before freeze; **OBSERVATION** — recorded, no change required.
  This scale classifies *per-document review findings*; it is distinct from GOV-004 §4's
  DEFECT/OBSERVATION vocabulary, which classifies *phase-gate findings* — the two never
  substitute for each other.
- **MR-03 — Documented disagreement.** When two agents reach conflicting conclusions, the
  conflict is recorded (who, about what, on what evidence) and **resolved before progression**;
  consensus is never assumed and never required for its own sake — the Owner expects constructive
  disagreement, adversarial review, and proof, not agreement.

## 3. Authority Model — MR-04

Authority under this protocol is layered and non-transferable:

| Authority | Holder | Nature |
|---|---|---|
| **Constitutional authority** — what becomes law; approval; propagation; amendment | **The Owner alone** (GOV-010) | Ultimate; never delegated |
| **Verdict authority** — READY / NOT READY at the Gate | **Readiness Judge** | Binary only; judges eligibility for Owner review, never approves content |
| **Finding authority** — evidence-based findings within one responsibility | Each review agent | Advisory to the Author's revision; **binds progression** (a BLOCKING finding must be resolved before the Gate) |
| **Authoring authority** — producing and revising the text | **Constitutional Author** | Creates; never certifies, never judges readiness, never approves |

No agent holds approval authority. No verdict, finding, or revision substitutes for an Owner
decision; and no Owner order is inferred — it is explicit or it does not exist (GOV-010, GOV-001
§7.2). This protocol is **subordinate** to GOV-001, GOV-010, and GOV-012, and it delegates no
Owner power.

**Conflict precedence.** When authorities collide, precedence is fixed — never negotiated:

1. **Evidence over rank.** A conflict between two agents' findings is resolved by frozen-text
   evidence, never by role seniority. If the evidence is inconclusive, the disagreement is
   recorded as **unresolved and BLOCKING** (MR-10) and progression stops until the Owner rules.
2. **The Author never dismisses a finding unilaterally.** The Author may contest a finding only
   with counter-evidence from frozen text; a contested finding that its finder does not withdraw
   is unresolved and BLOCKING per rule 1 — unless the counter-evidence is conclusive frozen text,
   which resolves it (rule 1) with the resolution recorded.
3. **Verdict authority is exclusive.** No agent's preference — including the Prosecutor's —
   substitutes for, anticipates, or overrides the Readiness Judge's verdict. Findings bind
   *progression* (they must be resolved before the Gate); the *verdict* belongs to the Judge
   alone. A Prosecutor conviction expressed as "NOT READY" has no verdict force; its findings do.
4. **Owner supremacy operates exclusively through GOV-010.** The Owner may override any rule of
   this protocol — including the Gate's prohibition. Such an override is an Owner decision and
   takes effect **only through GOV-010 §4's decision lifecycle**, whose head-of-lifecycle ADR
   gives it documented force (GOV-001 §7.2). **This protocol legislates no validity condition for
   Owner decisions** — the form and force of Owner decisions belong exclusively to GOV-010
   (GOV-001 §9.5). Absent a GOV-010-recorded decision, the Gate's prohibition stands.

## 4. The Roles — MR-05

Eight mandatory roles. Every agent has exactly one constitutional responsibility; additional
specialized agents may be created whenever they improve constitutional quality. The objective is
not speed; it is constitutional correctness.

| Role | Single responsibility | Never |
|---|---|---|
| **Constitutional Author** | Produce and revise the document in full obedience to frozen law; perform stage-1 Discovery and stage-3 self-hardening within the authoring mandate | Never reviews, defends, certifies, or approves its own work (MR-06); never decides readiness |
| **Constitutional Reviewer** | Review structure, responsibilities, boundaries, dependencies, overlaps | Never rewrites the document wholesale; never adds new requirements |
| **Adversarial Investigator** | Treat the document as wrong until proven otherwise: contradictions, loopholes, exceptions, omissions, conflicts with frozen law; verify citations against frozen text | Never softens a finding for harmony |
| **Constitutional Auditor** | Mechanical verification of the document (numbering, identifiers, references, links, coverage arithmetic) **and process-record arithmetic** — verifying MR-09's transition records: every mandatory role, stage record, and order present | Never judges prose quality or substance |
| **Proof Engineer** | Attempt to prove the document correct: deletion-resistance, boundary, independence, completeness, dependency proofs | Never asserts a proof without a construction |
| **Scenario Tester** | Build realistic stress scenarios (new rule, amendment, edge case, removed dependency) and test survival against exact rule text | Never reviews prose in the abstract |
| **Constitutional Prosecutor** | Attempt to prove the document does not deserve to exist (merge/split/rename/remove paths) | Never concedes without exhausting the strongest case; a failed prosecution is recorded as evidence of independence |
| **Readiness Judge** | Read **only the final document** and issue exactly one verdict: READY or NOT READY | Never reads the development process; never offers a third outcome; never edits |

## 5. Independence Rules — MR-06

1. **No self-review.** No agent may review, approve, audit, certify, or judge its own work.
2. **The Author participates only during authoring and revisions** — never in the Panel review,
   the Gate, or any certification.
3. **The Readiness Judge evaluates only the final document** — never drafts, never findings-in-
   progress, never the process history.
4. Single-agent execution of a constitutional review is **prohibited**; every mandatory role of
   MR-05 must complete its responsibility.

**Demarcation.** Stage-3 *self-hardening* (MR-07) is an **authoring act inside the Author's
mandate** — the Author stress-testing its own draft before independent review. It is expressly
**outside the meaning of "review"** in rules 1–2, which govern the independent examination of
stages 5–6. Self-hardening never substitutes for the Panel and confers no readiness.

## 6. The Constitutional Lifecycle — MR-07

Every constitutional document proceeds through this lifecycle:

```
1. Architectural Discovery      (existence proven or rejected — CONFIRMED / REJECTED)
2. Draft                        (Constitutional Author)
3. Adversarial Self-Hardening   (Author-side stress-testing; an authoring act — MR-06 demarcation)
4. Revision(s)                  (Owner review comments and/or self-hardening defects resolved)
5. Constitutional Readiness Verification
                                (the Panel reviews — every Panel role completes with its own
                                 record; the Author revises against findings; disagreements
                                 documented and resolved)
6. CONSTITUTIONAL READINESS GATE (Readiness Judge — READY / NOT READY)
7. Owner Constitutional Approval (GOV-010; only READY documents may be submitted)
8. Propagation                  (executed by the GOV-007-bound propagating executor, which must
                                 first verify MR-09 compliance; freeze + ADR + audit + registers +
                                 verification + commit + push)
9. Freeze                       (FROZEN; changes only via GOV-004 §5 — reviewed per §10)
```

**Order-gating.** Stages **1, 2, and 5** are entered only under an explicit Owner order. Stages
**3–4** proceed under the stage-2 authoring order (they are the Author's mandate). Stage **6**
follows automatically once stage 5's record is complete (MR-08 seating condition). Stage **7** is
the Owner's own act (GOV-010). Stages **8–9** proceed only under an explicit Owner propagation
order. This annotation is the determinate referent of MR-09(c).

**Canonical numbering.** This stage numbering is canonical from adoption; pre-codification stage
numbering recorded in historical ADRs, audits, and registers is superseded **as description** —
the historical records themselves remain immutable (GOV-001 §7.3).

## 7. The Constitutional Readiness Gate — MR-08

- The Gate is **mandatory**: no document enters Propagation without passing it.
- It verifies, at minimum: constitutional responsibility · boundary integrity · dependency
  integrity · constitutional invariants · deletion resistance · traceability · internal
  consistency · constitutional completeness · auditability · zero unresolved overlaps.
- Any defect found is corrected and verification repeats — until no constitutional defect remains.
- The Gate produces **exactly one result: READY or NOT READY.** No other outcome is valid.
- **Seating condition:** the Judge may be seated only over a document whose review record shows a
  completed stage-5 output from **every Panel role (MR-01)**, together with the Author's stage-5
  revision record; a Gate run without that record is void.
- **The verdict binds the exact reviewed text.** READY attaches to the precise document the Judge
  read. The only permitted post-verdict change is the **mechanical propagation delta**, a closed
  list: (a) the header **Status** field; (b) the header **Version** field; (c) replacement of the
  DRAFT lifecycle footer with the canonical frozen footer citing this protocol (MR-11) — with
  **zero change to any numbered rule or normative sentence**. Any other change voids the verdict
  and returns the document to stage 5.
- **Prohibition rule (propagation-grade acts only).** While the result is NOT READY (or no Gate
  has run), the following are constitutionally prohibited for that document: **Freeze ·
  publication of its propagation audit · its propagation/adoption ADR · any register status
  change for it · its propagation commit and push.** This prohibition does **not** reach acts
  that frozen law commands or permits independently of propagation: DRAFT registration and
  working commits under GOV-005 (§1 step 4, §3); the GOV-010 §4 head-of-lifecycle decision ADR;
  the GOV-004 §5 step-1 amendment-opening ADR; or a GOV-010-recorded Owner override decision —
  none of these propagates the unready document.
- **Findings attach to content, not to a name.** A document that substantially reproduces the
  content of a document carrying an open NOT READY verdict or an unresolved BLOCKING record
  **inherits** that verdict and record; renaming or re-issuing resets nothing.
- Only READY documents may be submitted for Owner Constitutional Approval.

## 8. No Silent Progression — MR-09 *(invariant)*

> **No stage of the lifecycle is ever entered, skipped, merged, or passed silently.**

Every progression from one MR-07 stage to the next requires, explicitly and visibly: (a) the
completed stage's **recorded output** (report, findings, revision log, or verdict — with its
evidence); (b) the **identity of the role** that produced it; and (c) the **Owner order**, for
the transitions MR-07 marks as order-gated. A stage transition that cannot show all applicable
elements has not happened; work produced beyond it is void and must not propagate. Silence is
never consent, absence of findings is never a verdict, and no verdict is ever inferred from
progression itself.

The invariant closes every bypass form explicitly:

- **One stage, one record.** A single record never serves two stages; two stages sharing one
  report are merged stages, and merged stages are prohibited.
- **Every iteration is recorded.** A repeated or re-run stage produces its **own new record**; a
  prior iteration's output never stands in for the re-run.
- **Zero findings is a record, not a skip.** A mandatory role that finds nothing still completes
  and records *what it examined and that it found nothing*; a role skipped "because no findings
  were expected" has not completed, and progression past it is void.
- **No stage-jumping.** Progression follows MR-07's order; entering stage *n* requires the
  recorded outputs of every stage before it — a document cannot travel from self-hardening to the
  Judge past an unexecuted Panel.

**Stage records take repository form.** During review, stage records exist as the reports and
verdicts presented to the Owner; at propagation, the document's **propagation audit and ADR must
reproduce the stage history** — stages run, roles completed, disagreements and resolutions, and
the Gate verdict. A propagation whose audit cannot reproduce its stage records violates this
invariant. Verifying the transition records is the **Constitutional Auditor's** process-record
mandate (MR-05) and a **stage-8 precondition** for the propagating executor.

## 9. Disagreement Documentation & Resolution — MR-10

Disagreements are first-class records: each is documented with the disagreeing roles, the exact
point, and the evidence on both sides. Resolution follows MR-04's precedence: a disagreement
**between two Panel agents** is resolved by frozen-text evidence, and the Author resolves it only
by producing a revision that satisfies that evidence — never by choosing a side without it; a
disagreement **to which the Author is a party** routes to the Owner (MR-04 rules 1–2); conclusive
frozen-text counter-evidence resolves a finding even without the finder's withdrawal — evidence
over rank — with the resolution recorded. Authority disagreements always route to the Owner.
Progression with an unresolved disagreement violates MR-09.

## 10. Scope, Amendments & Adoption

- **Scope: this protocol applies to all constitutional documents** — every document that fixes
  frozen law in any phase. *(The adoption ADR **must** state this scope explicitly; until that
  ADR is ACCEPTED, the only recorded scope is ADR-0052's Phase-3 mandate.)*
- **Amendments are in scope.** A GOV-004 §5 amendment to a constitutional document is not a
  bypass around independent review: the amendment **enters MR-07 at stage 2** (its
  amendment-opening ADR satisfies stage 1); the **Panel reviews the amended document with
  findings scoped to the changed content and its blast radius**; the Gate examines the amended
  text; GOV-004 §5's phase-gate re-runs remain untouched and additional.
- **Exemption by content, not by status.** An update is out of scope only if it changes **no
  normative rule**; any edit that adds, removes, or alters a review or process requirement is in
  scope regardless of the document's LIVING status. Purely administrative register/tracker
  updates remain out of scope.
- **The GOV-004 amendment (adoption prerequisite), precisely scoped:** the simultaneous amendment
  removes GOV-004 §2's single-operator premise **for constitutional-document review only** —
  which this protocol now governs. The phase-gate roles of GOV-004 §2 (Gates 1–8, Quality
  Director, AI Execution Supervisor) retain their operator model unless the Owner separately
  orders otherwise.
- **Relation to neighbors:** GOV-003 keeps the eight phase-freeze gates (PASS/FAIL) untouched —
  the Readiness Gate is per-document, pre-approval, with its own verdict vocabulary; GOV-005
  keeps the phase lifecycle (MR-07 nests inside it); GOV-007 keeps individual executor conduct
  (every MR-05 agent is individually bound by it); GOV-010 keeps all Owner authority.
- **Adoption & bootstrap (one-time transition rule).** This protocol's own review is conducted,
  before it is law, under explicit Owner orders whose force derives from **GOV-010**; it becomes
  law only through the adoption ADR. The adopting propagation is **one atomic package** (GOV-001
  §6; GOV-010 §6): GOV-013 · the GOV-004 §2 amendment · a GOV-001 §9 binding hook
  ("constitutional documents are reviewed exclusively through GOV-013", on the GOV-010 §9.5
  pattern — making this protocol reachable from the governance root for every future session) ·
  blast-radius alignment (P3-000 §11's lifecycle wording; the UX-004 footer's Gate citation) —
  reviewed by the Panel and gated as one package, then propagated in one commit.

## 11. Reference Rule — MR-11

Future constitutional documents **reference this protocol; they never embed review procedure.**
A document's lifecycle footer cites GOV-013; it does not restate roles, stages, or gate rules. A
document that embeds a divergent review procedure is in conflict with frozen governance and is
the defective document (GOV-005 §4).

## 12. Strict-Scope Self-Check

GOV-013 defines **only** how constitutional documents are reviewed: definitions (including the
Panel and the finding-severity scale), the authority model with its conflict precedence, eight
roles, independence rules with the self-hardening demarcation, the order-gated lifecycle, the
Readiness Gate with a satisfiable seating condition and a closed mechanical-delta exception, the
No-Silent-Progression invariant with its repository-form rule, disagreement resolution, scope
(including amendments), and the reference rule. It defines no business, product, UX, data, or
engineering content; it legislates **no validity condition for Owner decisions** (GOV-010's
exclusive domain); it modifies no frozen document by itself — the GOV-004 §2 amendment, the
GOV-001 §9 hook, and blast-radius alignment are separate, simultaneous acts of the adopting
propagation; and it duplicates neither GOV-003's gates nor GOV-004's gate-conduct rules — it
references them.

---

*FROZEN (v1.0.0, ADR-0053 / AUD-P0-006). GOV-013 is the Multi-Agent Review Protocol — the governing
law of constitutional-document review in every phase (scope stated in ADR-0053). Adopted as one
atomic package with the GOV-004 §2 amendment and the GOV-001 §9 binding hook, per §10. It changes
only via the amendment procedure (GOV-004 §5), itself reviewed under this protocol (§10).*
