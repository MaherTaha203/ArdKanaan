# GOV-001 — Repository Governance

| Field | Value |
|---|---|
| Doc ID | GOV-001 |
| Title | Repository Governance |
| Phase | 0 |
| Status | FROZEN |
| Version | 2.1.0 |
| Depends on | GOV-000 |
| Referenced by | IDX-001, GOV-002…GOV-009, RDM-001, ADR-0001, ADR-0002, ADR-0006 |

---

## 1. Purpose

This document is the supreme **operational law** of the Ard Kanaan repository. It is
subordinate only to the Project Manifesto (GOV-000): conflicts of principle are
resolved by GOV-000, conflicts of operational rule by GOV-001 (→ ADR-0006 §2).
Every other document, process, and (eventually) line of code is subordinate to
both. Where any other document conflicts with GOV-001, GOV-001 wins and the
conflicting document must be repaired (see §6, Consistency Rule).

## 2. Project identity (immutable facts)

These facts are fixed and operationalize the manifesto's principles (GOV-000). No
phase may contradict them. Changing any of them requires a new ADR superseding
ADR-0001 and re-running all quality gates for all frozen phases.

| # | Fact | Derives from |
|---|---|---|
| F-01 | The project is **Ard Kanaan (أرض كنعان)**, a financial management system for a training center. | M-01, M-02 |
| F-02 | It serves exactly **one** training center, **one** owner, **one** database. | M-02 |
| F-03 | It is **not** an ERP, **not** general accounting software, **not** multi-company, **not** multi-user. | M-03 |
| F-04 | The core of the system is the **Training Center**, not vouchers. | M-06 |
| F-05 | Core entities: Training Programs, Teachers, Students (Payers), Revenue Distribution Policies, Receipt Vouchers, Payment Vouchers, Operations, Account Statements, Center Balance, Teacher Balances. | M-06 |
| F-06 | Every receipt voucher belongs to one training program; every training program belongs to one teacher and has one distribution policy. | M-06 |
| F-07 | Revenue distribution is calculated **automatically** and the applied split is **permanently stored inside each voucher**, immune to later policy changes. | M-06, M-07 |
| F-08 | **Absolute Rule:** the system must never ask the user to enter information that can be calculated automatically. | M-07 |
| F-09 | Speed is more important than features. Clarity is more important than flexibility. | M-08 |

## 3. The Documentation-First Law

1. **No application code** (frontend, backend, database schema, HTML prototype, package
   manifests, dependency installation) may exist in this repository until every
   documentation phase (Phases 1–6) is FROZEN and has passed all eight quality gates.
2. The only permitted repository content before documentation freeze is:
   Markdown documentation under `docs/`, the root `README.md`, and `.gitignore`.
3. Violations of this law are Gate 8 failures and must be reverted, not patched.

## 4. Document authority

1. A document officially exists only when it is registered in the Documentation Index
   (IDX-001) with a Doc ID, file path, title, and status.
2. Every document carries the canonical header block defined in GOV-002 §3.
3. A FROZEN document may only be changed through the amendment procedure in
   GOV-004 §5 (which reopens the owning phase's gates).

## 5. Phase discipline

1. Phases execute strictly in the order defined in the Master Engineering
   Roadmap (GOV-011) — the only legal execution sequence — tracked in RDM-001.
   A phase may begin only when the previous phase is FROZEN, all quality gates
   passed, and the Owner has explicitly authorized it (GOV-011 §2).
2. Each RESERVED directory (`docs/product/`, `docs/business/`, `docs/ux/`,
   `docs/data/`, `docs/components/`, `docs/screens/`) may receive content only when
   its phase opens.
3. Completing a phase requires: all phase documents FROZEN, all eight gates PASS,
   and a phase audit report committed under `docs/audits/phase-N/`.

## 6. Consistency Rule (repository-wide)

Whenever a document is created or changed:

1. Search the **entire repository** for content affected by the change
   (Doc IDs, entity names, rule IDs, phase numbers, file paths, terminology).
2. Update every affected document **in the same commit**.
3. Never leave documentation in an inconsistent state, even between commits.

## 7. Decision governance

1. Every non-trivial engineering, product, business, UX, or data decision is recorded
   as an ADR under `docs/decisions/` and indexed in DEC-000.
2. Undocumented decisions are void: if a choice is not in an ADR or in a frozen
   constitution document, it has not been decided.
3. ADRs are immutable once ACCEPTED; they can only be SUPERSEDED by a new ADR.

## 8. Simplicity mandate

Every reviewer at every gate must ask: *"Does this addition make the system simpler
and faster for the single owner-operator?"* Features, abstractions, or flexibility
mechanisms that serve hypothetical future needs (multi-user, multi-center,
configurability beyond the stated business model) must be **rejected** at review.

## 9. Execution & platform governance

1. Every AI executor working in this repository is bound by the AI Execution
   Protocol (GOV-007) in every phase.
2. Engineering lessons are recorded permanently in the Engineering Memory
   (GOV-008) and MUST be consulted at every session start (→ AI-02).
3. Repository health is measured, not assumed: the Repository Health dashboard
   (GOV-009) is refreshed at every phase close, and any 🔴 indicator blocks the
   opening of the next phase.
4. The Master Engineering Roadmap (GOV-011) is the only legal execution
   sequence; conflicting instructions in future conversations lose to it unless
   the Owner explicitly changes it (GOV-011 §4).
