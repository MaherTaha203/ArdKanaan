# GOV-005 — Engineering Workflow

| Field | Value |
|---|---|
| Doc ID | GOV-005 |
| Title | Engineering Workflow |
| Phase | 0 |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | GOV-001, GOV-003, GOV-004 |
| Referenced by | RDM-001 |

---

## 1. The unit of work: a phase

All work happens inside exactly one open phase at a time. The workflow below is the
same for every phase.

```
┌─────────────────────────────────────────────────────────┐
│ 1. OPEN      previous phase FROZEN → declare phase open │
│ 2. DECIDE    record phase-shaping choices as ADRs       │
│ 3. AUTHOR    write phase documents (status: DRAFT)      │
│ 4. REGISTER  add every document to IDX-001              │
│ 5. RECONCILE apply Consistency Rule across whole repo   │
│ 6. REVIEW    set docs IN-REVIEW → run Gates 1–8         │
│      │                                                  │
│      ├─ any FAIL → repair → back to step 5, restart     │
│      │            all gates                             │
│      └─ all PASS ↓                                      │
│ 7. FREEZE    docs → FROZEN, commit audit report         │
│ 8. CLOSE     update IDX-001 + RDM-001, commit, push     │
└─────────────────────────────────────────────────────────┘
```

## 2. Daily working rules

1. **One phase, one focus.** Never author content for a phase that is not open.
2. **Decisions before documents.** If authoring stalls on an open question, stop
   and write the ADR first (GOV-001 §7).
3. **Consistency in the same commit.** A change and its ripple effects are one
   commit (GOV-001 §6, GOV-002 §8.3).
4. **Nothing is assumed.** Any fact not found in a frozen document or ACCEPTED ADR
   must be raised as an open question in the phase's documents and resolved before
   review.
5. **Automate the user's arithmetic, not the engineer's discipline.** F-08 binds the
   product; this workflow binds the engineers — neither may be shortcut.

## 3. Commit & push cadence

1. Commit at each workflow step boundary (steps 4, 5, 7, 8 at minimum).
2. Push to the designated phase branch after phase close (step 8) and whenever a
   day's work ends.
3. Never commit a repository state that fails the Consistency Rule.

## 4. Escalation

If two frozen documents are discovered to conflict (a latent Gate 5 failure), treat
it as a defect in the **later-frozen** document, open the amendment procedure
(GOV-004 §5), and repair before any new authoring continues.
