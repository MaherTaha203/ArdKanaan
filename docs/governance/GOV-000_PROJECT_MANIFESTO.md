# GOV-000 — Project Manifesto

| Field | Value |
|---|---|
| Doc ID | GOV-000 |
| Title | Project Manifesto |
| Phase | 0 |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | — (root document) |
| Referenced by | GOV-001…GOV-009, and transitively every document in this repository |

---

This is the **highest document in the repository**. Every other document — including
GOV-001 — is subordinate to it. Conflicts of principle are resolved here; conflicts
of operational rule are resolved by GOV-001 (→ ADR-0006 §2). Its principles carry
permanent atom IDs `M-NN` (→ GOV-002 §5) and form the root of the traceability
chain (→ GOV-006 §3).

---

## 1. Why this project exists

- **M-01 (Purpose).** Ard Kanaan (أرض كنعان) exists to free the owner of one
  training center from manual financial bookkeeping: recording money in and money
  out, splitting revenue between teachers and the center, and knowing — at any
  moment, without calculation — what the center holds and what each teacher is owed.

## 2. What kind of software this is

- **M-02 (Identity).** This is a small, fast, single-purpose financial management
  tool for exactly one training center, one owner, one database. It models the
  center's real structure: programs taught by teachers, paid for by students,
  producing vouchers whose revenue is split automatically by policy.

## 3. What this software must never become

- **M-03 (Negative identity).** It must never become an ERP, general accounting
  software, a multi-company system, a multi-user system, a SaaS platform, or a
  configurable framework. Every growth pressure in one of those directions is, by
  definition, a defect. A reviewer who cannot decide whether a proposal fits the
  system must test it against this principle first.

## 4. Engineering philosophy

- **M-04 (Documentation-first engineering).** Understanding is engineered before
  software is written. Every rule, entity, screen, and calculation exists first as
  frozen, reviewed documentation; implementation is transcription of that
  documentation, never invention. Order of phases is law (→ RDM-001); gates are
  never skipped (→ GOV-003).

## 5. Documentation philosophy

- **M-05 (Single source of truth).** Every fact lives in exactly one authoritative
  place and is referenced everywhere else by permanent ID. Documentation is
  internally consistent at every commit, traceable end-to-end, and written so that
  a stranger — human or AI — can rebuild the system from it without asking a single
  question.

## 6. Business philosophy

- **M-06 (The center is the core).** The business model is the training center
  itself — not vouchers, not accounts. Money flows follow the center's real
  relationships: every receipt belongs to a program, every program to a teacher,
  every program to a distribution policy; the split applied to a voucher is
  computed automatically and preserved in that voucher forever, immune to later
  policy changes.

## 7. UX philosophy

- **M-07 (The user never computes).** The system must never ask the user to enter
  information that can be calculated automatically, and must never make the user
  wait for or hunt for information it already holds. Daily work — recording a
  receipt, checking a balance — must be achievable in seconds.

## 8. Simplicity philosophy

- **M-08 (Simplicity as a feature).** Speed is more important than features;
  clarity is more important than flexibility. Abstractions, options, and
  configurability that serve hypothetical futures are rejected at review. The
  correct measure of every addition: does it make the single owner-operator's day
  simpler and faster?

## 9. AI execution philosophy

- **M-09 (Disciplined execution).** AI executors working in this repository are
  bound by an explicit behavioral protocol (→ GOV-007): they never invent
  requirements, never assume business logic, never bypass review, and always leave
  the repository consistent. AI capability is spent on rigor, not on speed.

## 10. Repository philosophy

- **M-10 (The repository is the product until release).** Until release, the
  repository's value is its documentation, its consistency, and its auditability.
  Every commit is a consistent state; every decision is recorded; every lesson is
  remembered (→ GOV-008); repository health is measured, not assumed (→ GOV-009).
