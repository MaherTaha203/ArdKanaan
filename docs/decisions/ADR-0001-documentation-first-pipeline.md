# ADR-0001 — Documentation-First Pipeline

| Field | Value |
|---|---|
| ADR | 0001 |
| Title | Documentation-First Pipeline |
| Phase | 0 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Ard Kanaan is a financial system: correctness of money calculations (automatic
revenue distribution, permanently stored per-voucher splits, balances) matters more
than delivery speed of code. Financial defects are usually born as documentation
gaps — undocumented rules, inconsistent terminology, screens designed before rules
exist. The repository starts empty, giving us one chance to enforce order from day
one.

## Decision

1. All documentation phases (Phases 1–6 per RDM-001) MUST be complete and FROZEN
   before any application code, UI, HTML prototype, database schema, package
   manifest, or dependency exists in the repository.
2. Phases execute strictly sequentially; each closes only when all eight quality
   gates (GOV-003) pass in one uninterrupted run.
3. The immutable project facts are codified as F-01…F-09 in GOV-001 §2 and bind
   every later phase.

## Consequences

- **Positive:** business rules, UX rules, and the data model will exist, be
  consistent, and be traceable before they are implemented; implementation becomes
  transcription, not invention.
- **Negative:** no runnable software exists for a long time; accepted deliberately
  (F-09 favors clarity, and the single-owner scope keeps the documentation set
  small).
- **Enforcement:** Gate 8 (Repository Integrity Review) fails any phase whose
  repository state contains forbidden content.
