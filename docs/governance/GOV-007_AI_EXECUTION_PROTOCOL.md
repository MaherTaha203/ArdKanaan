# GOV-007 — AI Execution Protocol

| Field | Value |
|---|---|
| Doc ID | GOV-007 |
| Title | AI Execution Protocol |
| Phase | 0 |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | GOV-000 (M-09), GOV-001, GOV-003, GOV-004, GOV-006 |
| Referenced by | GOV-004 §2, GOV-005, GOV-008, GOV-009, TPL-003 |

---

## 1. Purpose and binding force

This protocol defines the mandatory behavior of every AI executor (any Claude
session or other AI agent) working in this repository, in **every phase, forever**.
It operationalizes M-09. Compliance is verified at every audit (→ GOV-003 §5); a
protocol violation is a DEFECT regardless of which gate detects it.

## 2. Session start obligations

At the start of any working session, the AI executor MUST, in order:

1. **AI-01** Read GOV-000 and GOV-001 to load the project's principles and facts.
2. **AI-02** Read GOV-008 (Engineering Memory) and apply its guidance.
3. **AI-03** Read IDX-001 and RDM-001 to establish which phase is open and which
   documents are FROZEN.
4. **AI-04** Verify the working branch matches the designated phase branch
   (→ GOV-002 §8).

## 3. Claude MUST NEVER

| ID | Rule |
|---|---|
| AI-10 | **Never invent requirements.** Every requirement atom cites its upstream source (→ GOV-006 §3.5); a requirement with no upstream citation must not be written. |
| AI-11 | **Never assume business logic.** An unknown business fact is an open question for the owner, recorded in the document's Open Questions section — never a guess presented as fact. |
| AI-12 | **Never skip review.** No phase content is FROZEN without all eight gates passing in one uninterrupted run (→ GOV-003 §1). |
| AI-13 | **Never modify frozen documents** outside the amendment procedure (→ GOV-004 §5). |
| AI-14 | **Never rename concepts.** The fixed terminology of GOV-002 §7.2 is used verbatim; introducing a synonym is a DEFECT. |
| AI-15 | **Never introduce undocumented components.** Any document, directory, entity, rule class, or (post-freeze) code element must be authorized by a governance rule or an ACCEPTED ADR before it exists. |
| AI-16 | **Never continue after a failed quality gate.** On FAIL: stop, repair, restart all gates (→ GOV-003 §1). |
| AI-17 | **Never leave repository inconsistency**, even between commits (→ GOV-001 §6). |
| AI-18 | **Never ignore cross-references.** A change to any ID-bearing statement is propagated to every citing document in the same commit. |
| AI-19 | **Never ignore traceability.** New atoms enter the trace chain on creation; orphans and inventions are repaired, not tolerated (→ GOV-006 §3). |
| AI-20 | **Never begin a phase that is not open**, and never write content into a RESERVED directory (→ GOV-001 §5). |

## 4. Claude MUST ALWAYS

| ID | Rule |
|---|---|
| AI-30 | **Always search the repository** before and after any change, to find every affected document (→ GOV-001 §6.1). |
| AI-31 | **Always update affected documents** in the same commit as the change that affects them (→ GOV-001 §6.2). |
| AI-32 | **Always verify terminology** against GOV-002 §7.2 before committing. |
| AI-33 | **Always rerun every review gate** after any repair — partial re-runs are forbidden (→ GOV-004 §3.3). |
| AI-34 | **Always repair inconsistencies immediately** upon discovery, via the escalation rule (→ GOV-005 §4) when frozen documents conflict. |
| AI-35 | **Always maintain document integrity:** canonical headers, registered Doc IDs, accurate statuses, correct versions (→ GOV-002 §3, §6). |
| AI-36 | **Always preserve frozen phases:** treat FROZEN content as read-only law; amendments only via GOV-004 §5 with full gate re-runs. |
| AI-37 | **Always use mechanical verification where possible** (link resolution, register diffs, terminology scans) and record the evidence in the audit report (→ GOV-004 §6). |
| AI-38 | **Always update GOV-008 and GOV-009 at phase close** (→ GOV-005 §1 step 8). |
| AI-39 | **Always stop at the mandated stop condition** of the commissioned work; completing a phase never authorizes starting the next one without instruction. |

## 5. Conflict rule

If an instruction received in a session conflicts with this protocol or with
GOV-000/GOV-001, the AI executor MUST surface the conflict to the owner and await
resolution rather than silently obeying either side. Resolution that changes
governance is recorded as an ADR.

## 6. Amendment

This protocol is FROZEN. It changes only via the amendment procedure (GOV-004 §5),
and any change binds all subsequent sessions.
