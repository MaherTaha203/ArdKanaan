# ADR-0022 — Session 10 Owner Decisions: Program Definition, Pricing & Distribution Policy

| Field | Value |
|---|---|
| ADR | 0022 |
| Title | Session 10 Owner Decisions: Program Definition, Pricing & Distribution Policy |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner closed Interview Session 10 (Program Definition, Pricing & Distribution
Policy, targeting UNK-005, UNK-016, UNK-003) on 2026-07-18 and authorized
propagation per GOV-010, with two pre-propagation refinements (below). Decision
categories (GOV-010 §5): Business, Scope.

These three MEDIUM unknowns were the remaining foundational gaps in the Program
entity — the anchor to which every receipt, refund, and teacher balance attaches.
Their closure defines program identity, the "amount due" that DR-024 already
presupposed, and whether a distribution percentage can change.

## Decision (the Owner's rulings)

1. **S10-D1 — A Program is a single Program Run (Offering).** A program is an
   independent training offering with its own financial identity: name (service
   type), one teacher, one distribution percentage, one price, its registered
   students, and all its financial operations. Each new batch/run of a same-named
   service is a **new, separate program**.
2. **S10-D2 — Runs are fully independent.** Two same-named runs share their teacher
   assignment with nothing: each has its own teacher, percentage, price, students,
   receipts, refunds, entitlements, payments, balances, debts, and start/end. The
   shared name is **only a label** for the service type and creates **no financial
   link**. Settings may be **copied as initial values** at creation for
   convenience, which is never a live link.
3. **S10-D3 — One teacher per run (V1).** A single run has exactly one teacher; the
   existing frozen model (F-06, DR-002) is unchanged. Multiple teachers per program
   is explicitly a future version.
4. **S10-D4 — Base price on the program.** Each Program (run) carries one base
   price, set at creation; each registration inherits it as its default. Price
   belongs to the program, not the student.
5. **S10-D5 — Per-registration override allowed.** The Owner may set an individual
   registration's price different from the base price; the override applies to that
   registration only and changes neither the base price nor any other registration.
6. **S10-D6 — No discount concept; a single Final Registration Price.** The amount
   due for a registration is a single stored value — the **Final Registration
   Price**. V1 has no discount entity, field, percentage, or reason; the reason a
   price differs from the base is an administrative matter the system does not
   model. The final price is the sole amount-due reference for receipts, refunds,
   and overpayment prevention (DR-024).
7. **S10-D7 — Price lock at first receipt.** A registration's Final Registration
   Price is editable **until the first receipt** for that registration is recorded;
   once the first receipt exists it is **locked**. Later corrections use financial
   operations (e.g. refunds), never a change to the amount due.
8. **S10-D8 — Distribution percentage fixed for the program's life.** Once set at
   creation, a program's teacher/center percentage is immutable for that program's
   whole life; a different agreement is realized by creating a **new program (run)**,
   never by changing an existing one.
9. **S10-D9 — Documentary start/end dates.** Each program records a start date and
   an end date at creation. In V1 these are documentary/administrative only: the
   system never auto-closes, never blocks registration or receipts by date, and
   creates no date-driven operations.
10. **S10-D10 — Open/Closed status governs new business.** Each program carries an
    Owner-controlled Open/Closed status. Closing blocks **new business** — new
    registrations and new receipt vouchers — while all existing records remain
    fully visible and **legitimate financial operations on already-existing
    records** (e.g. a refund against an existing receipt) remain allowed. Closing
    deletes nothing and alters no entitlement, balance, or prior financial effect.
11. **S10-D11 — Reopening allowed.** A closed program may be reopened at any time,
    restoring new business; Open/Closed is a reversible operational status that
    never changes identity, dates, price, percentage, or history.
12. **S10-D12 — No capacity in V1.** No maximum-student-capacity concept exists;
    the system never blocks registration by student count. Capacity management
    (limits, remaining seats, waiting lists) is **explicitly out of scope** for V1
    (future enhancement).
13. **S10-D13 — No internal cohorts in V1.** A program contains no internal
    cohorts/batches/sections; each batch is its own independent program. Internal
    grouping (cohorts, sections, schedules) is **explicitly out of scope** for V1
    (future enhancement).
14. **S10-D14 — Unlimited concurrent runs.** Any number of programs, including
    several of the same service name, may be open/active at the same time; each is
    fully independent with no mutual effect beyond the shared name.

## Refinements applied (Owner-directed, pre-propagation)

1. **Entity name stays "Program."** The concept is refined — *in V1 a Program
   represents a single Program Run (Offering)* — but the entity is **not renamed**
   to "Program Run." DOM-002 §3 documents the refined meaning under the stable name.
2. **Pricing model.** The **Final Registration Price is a stored business value**,
   not a derived one; it is **not** computed as `Base Price − Discount`. There is
   no Discount concept in V1 (DR-074).

## Interpretation boundaries

- **No frozen fact is overturned.** One teacher per program (F-06, DR-002), one
  policy per program (DR-003), and permanence of applied splits (DR-006) all stand;
  Session 10 refines *what a program is* (a single run) without changing them.
- **Amount due is now defined.** DR-024 (overpayment prevention) previously
  presupposed an "amount due" (UNK-005 signal); it is the Final Registration Price
  (DR-074). Installments (DR-023) settle against this amount.
- **"Program price change" is not an in-place mutation.** Both the distribution
  percentage (S10-D8) and — after the first receipt — the Final Registration Price
  (S10-D7) are fixed; a new agreement is a new program. This is consistent with the
  independence model (S10-D2) and DR-006.
- **Capacity and cohorts** are recorded as Future Considerations (scope), not as
  business rules (LES-013).

## Consequences

- **New domain rules:** DR-071…DR-079 (nine rules). **Updated status:** DR-002
  (UNK-016 resolved), DR-003 (UNK-003 resolved), DR-024 (UNK-005 resolved).
- **Unknowns:** UNK-003, UNK-005, UNK-016 CLOSED. No new unknowns opened.
- **Entity documentation:** DOM-002 §3 (Program — refined as single run: base price,
  documentary dates, Open/Closed status, lifecycle), §5 (registration Final Price,
  override, lock), §6 (percentage immutable per run).
- **New workflow:** WF-13 (program creation & lifecycle: create / close / reopen),
  ESTABLISHED; WF-01 and WF-02 updated (price inheritance/override/lock; closed
  program blocks new registrations/receipts).
- **Future Considerations added:** program capacity (limits / seats / waiting
  lists); internal cohorts (sections / schedules).
- **Engineering memory:** LES-016 (refine the concept, keep the entity name stable).
- **Blast radius:** DOM-001 v1.11.0, DOM-002 v8.2.0, DOM-003 v1.12.0,
  DOM-004 v3.7.0, DOM-005 v1.17.0, GOV-008 (LES-016), GOV-009, IDX-001 v1.17.0,
  DEC-000; audit AUD-P1A-014. Frozen governance untouched.
- Full review pipeline re-run; Domain Discovery re-freezes on all-PASS.
