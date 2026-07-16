# ADR-0008 — Session 1 Owner Decisions: Compensation, Rounding, Entitlement, Balances

| Field | Value |
|---|---|
| ADR | 0008 |
| Title | Session 1 Owner Decisions: Compensation, Rounding, Entitlement, Balances |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Interview Session 1 (Revenue Distribution & Balances, → DOM-005 §6) was answered
by the owner on 2026-07-16 with six explicit decisions (D1–D6). These are owner
statements — the authoritative source class for domain rules (ADR-0007 §3) — and
they resolve UNK-002 and UNK-020, reject ASM-002, and refine the balance
vocabulary of the founding facts. Applying them modifies frozen DOM documents,
which requires this ADR (GOV-004 §5).

## Decision (the owner's rulings, recorded verbatim in substance)

1. **D1 — Compensation models.** Teacher compensation is NOT limited to
   percentages. Supported models: percentage of each receipt (most common), fixed
   amount per student, fixed amount per training program, fixed monthly amount,
   and custom agreement defined by the owner. The model set must remain
   extensible for future compensation models without changing the business model.
2. **D2 — Policy scope.** The distribution policy belongs to the Training
   Program, not to the teacher. One teacher may teach multiple programs; each
   program may have its own policy (e.g. English → 70%, Mathematics → 60%,
   Robotics → fixed amount per student). This confirms DR-002/DR-003.
3. **D3 — Rounding.** Distribution rules NEVER control rounding. Rounding belongs
   exclusively to the currency definition: if the currency supports decimals, the
   exact decimal value is stored; if not, the official currency rounding rules
   apply. No custom rounding logic exists.
4. **D4 — Entitlement.** Teacher entitlement (a teacher receivable) begins
   immediately when a Receipt Voucher is posted — not when payment is made.
   Entitlement and payment are two different business events.
5. **D5 — Three balances.** The business distinguishes three balances that must
   NEVER be merged: **Cash Balance** (all cash currently held, e.g. 1000),
   **Teacher Payables** (money currently owed to teachers, e.g. 700), and
   **Center Net Balance** (the center's own earned share, e.g. 300).
6. **D6 — Automatic revenue ledger.** Every posted Receipt Voucher automatically
   creates three business effects: increase Cash Balance, increase Teacher
   Payables, increase Center Net Balance. This is a business ledger, NOT an
   accounting journal.

## Interpretation boundaries (what is NOT decided here)

- D5 **refines** F-05 without contradicting it: "Center Balance" is made precise
  as **Center Net Balance**; "Teacher Balances" remain per-teacher and aggregate
  to **Teacher Payables**; **Cash Balance** is added as a third derived quantity.
- D1/D6 leave open how non-percentage models map onto per-receipt effects (what
  teacher share a receipt stores under a fixed-monthly or custom agreement, and
  how such entitlements accrue). This is recorded as new unknown **UNK-024**
  (HIGH) — not answered by inference (AI-11).
- "Posted" is read in its plain business sense: the recording of the voucher.

## Consequences

- **Resolved:** UNK-002 (all three parts: model forms, per-program scope,
  rounding ownership), UNK-020 (entitlement timing, balance composition).
  **Rejected:** ASM-002. **Opened:** UNK-024.
- **New domain rules:** DR-013…DR-017 (DOM-004); DR-005/DR-009/DR-010 unknown-
  status updated.
- **Blast radius:** DOM-001 v1.1.0, DOM-002 v2.0.0 (balance entity model
  restructured), DOM-003 v1.1.0, DOM-004 v1.1.0, DOM-005 v1.2.0, GOV-002 v1.3.0
  (three balance terms added to fixed terminology), GOV-008 (LES-005), GOV-009,
  IDX-001, DEC-000; audit AUD-P1A-002.
- Full review pipeline re-run; Domain Discovery re-freezes on all-PASS.
