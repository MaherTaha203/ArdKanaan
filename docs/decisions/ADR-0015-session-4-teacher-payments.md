# ADR-0015 — Session 4 Owner Decisions: Teacher Payments

| Field | Value |
|---|---|
| ADR | 0015 |
| Title | Session 4 Owner Decisions: Teacher Payments |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner closed Interview Session 4 (Teacher Payments, DOM-005 §6) by direct
Engineering Order on 2026-07-17, delivering eleven decisions (S4-D1…S4-D11)
without a live question round, and mandating propagation per GOV-010 with no
alternative analysis, no redesign, no additional questions, and no inference of
future features. Decision categories (GOV-010 §5): Business, Scope.

## Decision (the Owner's rulings)

1. **S4-D1 — Entitlement.** A teacher becomes entitled immediately after a
   Receipt Voucher is officially posted. Entitlement is created by posted
   student payments **only** — no additional conditions (program completion,
   attendance, etc.) exist in Version 1.
2. **S4-D2 — Payment timing.** Teacher payments are never generated
   automatically. The payment date depends entirely on the agreement between
   the center and the teacher; the system records a payment only when the Owner
   decides to issue a Payment Voucher.
3. **S4-D3 — Partial payments.** Fully supported: a teacher may receive any
   amount up to the outstanding balance of the selected program; the remainder
   stays outstanding.
4. **S4-D4 — Program isolation.** Financial separation between programs is
   mandatory. Teacher balances are NOT managed globally: every
   **Teacher × Program** combination is an independent financial relationship
   (example: Teacher Ahmed with Excel, ICDL, and Accounting programs = three
   independent balances).
5. **S4-D5 — Payment Voucher scope.** Every Payment Voucher belongs to exactly
   one Program; a single Payment Voucher must never cover multiple programs.
6. **S4-D6 — Settlement.** Liability is settled per Program: paying all
   outstanding entitlement of Program A clears liability for Program A only.
7. **S4-D7 — No advances.** Advance payments before entitlement are forbidden;
   a teacher cannot receive payment before actual student receipts generate
   entitlement. V1 contains no advances (hence no negative balances).
8. **S4-D8 — Deductions postponed.** Teacher deductions are intentionally
   postponed. No deduction model is invented; the topic stays an explicitly
   open unknown (UNK-021) until the Owner authorizes it.
9. **S4-D9 — Transparency.** The system must provide a complete entitlement
   breakdown: every component of a teacher's entitlement is inspectable —
   Receipt Voucher, Student, Program, payment amount, distribution percentage,
   teacher share. Teacher balance must always be fully traceable.
10. **S4-D10 — No receipt allocation.** Payment allocation is NOT based on
    receipt chronology; FIFO/LIFO/receipt-allocation algorithms do not exist.
    Payments associate with a Program only; outstanding balance is calculated
    at Program level.
11. **S4-D11 — Payment history.** Every Payment Voucher remains permanently
    recorded. Outstanding Balance = Total Teacher Entitlement − Total Payments
    issued for that Program. Payment history is always available for auditing.

## Interpretation boundaries (what is NOT decided here)

- **S4-D5 scope:** stated in the context of teacher payments. Whether payment
  vouchers for **center expenses** (rent, supplies — Session 5 territory) also
  attach to a program is NOT decided here; UNK-009/UNK-015 remain open with a
  logged signal (teacher payouts confirmed as Payment Vouchers).
- **S4-D8:** deductions remain UNK-021 — explicitly unresolved by Owner order;
  inventing behavior for them is forbidden.
- Departing-teacher handling (UNK-019) is untouched by these decisions.

## Consequences

- **Resolved:** UNK-008 (HIGH). **Confirmed:** ASM-003 (per Teacher × Program).
  **Signals logged:** UNK-009 (teacher payouts are Payment Vouchers), UNK-013
  (entitlement breakdown is a required reading surface), UNK-021 (postponed by
  D8).
- **New domain rules:** DR-029…DR-035. **Amended:** DR-009 (balance becomes
  per Teacher × Program — meaning change).
- **Blast radius:** DOM-001 v1.5.0, DOM-002 v4.0.0 (Teacher Balance
  restructured per program), DOM-003 v1.5.0 (WF-04/WF-05 ESTABLISHED),
  DOM-004 v3.0.0 (DR-009 meaning change), DOM-005 v1.10.0, GOV-009, IDX-001,
  DEC-000; audit AUD-P1A-007. Frozen governance untouched; GOV-008 unchanged
  (no new permanent engineering lesson — existing LES-005/LES-010 patterns
  cover this propagation).
- Full review pipeline re-run; Domain Discovery re-freezes on all-PASS.
