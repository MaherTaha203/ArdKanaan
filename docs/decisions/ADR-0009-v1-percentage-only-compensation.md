# ADR-0009 — V1 Scope: Percentage-Only Compensation

| Field | Value |
|---|---|
| ADR | 0009 |
| Title | V1 Scope: Percentage-Only Compensation |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | ADR-0008 (partially: D1's active multi-model scope only) |
| Superseded by | — |

## Context

After architectural review, the owner made a strategic product decision that
supersedes the exploratory multi-model direction of Session 1 (ADR-0008 D1).
The Session 1 follow-up questions on per-model money semantics (UNK-024) were
pending; this decision makes them moot for Version 1.

## Decision (the owner's ruling)

1. **Version 1 supports exactly ONE teacher compensation model: percentage of
   posted receipts.** This is the only valid business model in V1.
2. **Business rule:** every training program has exactly one distribution policy;
   that policy is a percentage; teacher percentage + center percentage MUST
   always equal 100% (example: Teacher 70% / Center 30%).
3. **Teacher entitlement is unchanged** (reaffirms ADR-0008 D4): entitlement is
   created immediately when a Receipt Voucher is posted; teacher payment is a
   separate business event.
4. **Postponed, not cancelled:** fixed amount per student, fixed amount per
   training program, fixed monthly salary, and custom compensation agreements are
   removed from V1 and recorded only as **Future Considerations — Not Part of
   Version 1** (DOM-004 §Future considerations). They are not modeled, not
   documented as active rules, carry no workflows, and generate no interview
   questions.
5. **Unknowns closed by scope:** UNK-024 existed solely because of the postponed
   models and is closed as moot; interview session 1-FU is withdrawn.

## What survives from ADR-0008

D2 (policy belongs to the program), D3 (currency-owned rounding), D4
(entitlement at posting), D5 (three never-merged balances), and D6 (automatic
revenue ledger) remain fully in force. Only D1's *active* multi-model scope is
superseded; the postponed models remain acknowledged future possibilities.

## Consequences

- **Blast radius:** DOM-001 v1.2.0, DOM-002 v2.1.0, DOM-003 v1.2.0,
  DOM-004 v2.0.0 (DR-013 rewritten — meaning change), DOM-005 v1.4.0,
  ADR-0008 (Superseded-by pointer only), GOV-008 (LES-006), GOV-009, IDX-001,
  DEC-000; audit AUD-P1A-003.
- V1's calculation semantics are now fully defined with zero open questions in
  the distribution area: percentage split (DR-013 v2), currency-owned rounding
  (DR-014), entitlement at posting (DR-015), three balances (DR-016), automatic
  ledger (DR-017).
- HIGH unknowns drop from 7 to 6; full review pipeline re-run; Domain Discovery
  re-freezes on all-PASS.
