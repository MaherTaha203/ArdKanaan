# ADR-0020 — Session 8 Owner Decisions: Money Returning to the Center After an Expense (Expense Returns)

| Field | Value |
|---|---|
| ADR | 0020 |
| Title | Session 8 Owner Decisions: Expense Returns |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner closed Interview Session 8 (Money Returning to the Center After an
Expense, target UNK-028) on 2026-07-17 and authorized propagation per GOV-010,
with a pre-propagation refinement on S8-D6 (below). Decision categories
(GOV-010 §5): Business, Scope.

## Decision (the Owner's rulings)

1. **S8-D1 — Concept & boundary.** An **expense return** is a financial value
   that returns to the center **because of a specific prior expense**; it must
   reference exactly one prior expense. With no prior expense to reference, it is
   not an expense return but a different financial situation handled separately.
   In-scope real cases: purchase returns, supplier refunds (invoice error /
   overpayment), cancelled service/subscription refunds, returned
   deposits/securities. Out of concept: recovering a teacher payment, student
   refunds (revenue side), anything on receipts/settlements.
2. **S8-D2 — Meaning.** An expense return **reduces/reverses the original
   expense; it is never new income** (1000 spent, 300 back → real expense 700; a
   full return zeroes the expense).
3. **S8-D3 — Partial & multiple, bounded.** Partial returns and several returns
   per expense are allowed; the **total returned may never exceed the original
   expense** (a full return is the ceiling); any excess is out of concept.
4. **S8-D4 — One return ↔ one expense.** Each return references exactly one
   expense; a lump-sum refund covering several expenses is split at entry into
   several independent returns; one expense may accumulate several returns; one
   return never spans multiple expenses.
5. **S8-D5 — Valid original required.** A return may be recorded only against an
   expense that exists, is **Posted, and not cancelled**; a cancelled expense
   carries no return (out of concept).
6. **S8-D6 — Cash realization in V1 (refined).** *The concept is "a financial
   value returns to the center because of a prior expense."* **Version 1
   realizes this through actual cash returning.** A **credit note** is **not**
   an expense return — it returns no financial value now, only a future credit
   right — so it stays outside the concept; non-cash realizations (supplier
   balances/payables) are a future version.
7. **S8-D7 — Goods replacement.** Replacing goods with no cash returned is
   **not** an expense return in V1 (the expense stands); a fuller purchase cycle
   is a future concern.
8. **S8-D8 — No time limit.** Acceptance depends only on the link to the
   original expense (Posted, non-cancelled, ceiling not exceeded), not on
   elapsed time.
9. **S8-D9 — Complete for V1.** The four boundary cases all fit this model;
   non-cash settlements are out of scope.

## Refinement applied (Owner-directed, S8-D6)

The governing concept is stated at the **"financial value returns"** level
(DR-055), with **cash as the V1 realization** (DR-060), so the concept is not
permanently coupled to physical cash. Credit notes are excluded on the concept
itself (they return no value now), not merely on the cash mechanism.

## Interpretation boundaries

- An expense return is recorded as a dedicated **Expense Return** record
  referencing one expense (the Owner referred to "سند استرداد"). Its **numbering
  is a deferred design decision** (as with the Refund Voucher, ADR-0017 §2), not
  a domain unknown.
- **Balance effects (entailed, not invented):** a cash expense return increases
  the **Cash Balance** and, by reversing a center-borne expense (DR-052),
  increases the **Center Net Balance**; it never touches any teacher.
- **Dependency/cancellation (entailed):** a return depends on its expense, so
  that expense cannot be cancelled while a return is attached — the return is
  cancelled first (DR-046). A return is itself a financial record and follows
  the posted/immutable/cancel model (DR-043…DR-048).
- **New vocabulary:** "Expense Return" extends the founding term set; adding it
  to GOV-002 §7.2 (frozen) is **reported to the Owner** (GOV-010 §8), not
  applied — defined canonically in DOM-002 meanwhile.

## Consequences

- **New domain rules:** DR-055…DR-061. **Updated status:** DR-049 (UNK-028
  resolved), DR-046 (expense returns added as a dependent type).
- **Unknowns:** UNK-028 CLOSED. No new unknowns opened.
- **New entity:** Expense Return (DOM-002 §15). **New workflow:** WF-11 (expense
  return), ESTABLISHED.
- **Future Considerations added:** non-cash returns — credit notes / supplier
  balances (payables); goods replacement / fuller purchase cycle.
- **Blast radius:** DOM-001 v1.9.0, DOM-002 v8.0.0, DOM-003 v1.10.0,
  DOM-004 v3.5.0, DOM-005 v1.15.0, GOV-009, IDX-001, DEC-000; audit AUD-P1A-012.
  GOV-008 unchanged (concept/realization separation already captured by LES-013).
  Frozen governance untouched.
- Full review pipeline re-run; Domain Discovery re-freezes on all-PASS.
