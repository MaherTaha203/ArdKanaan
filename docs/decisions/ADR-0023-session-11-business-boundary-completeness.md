# ADR-0023 — Session 11 Owner Decisions: Business Boundary & Operational Completeness

| Field | Value |
|---|---|
| ADR | 0023 |
| Title | Session 11 Owner Decisions: Business Boundary & Operational Completeness |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner closed Interview Session 11 (Business Boundary & Operational
Completeness, targeting UNK-018, UNK-019, and the remaining domain portion of
UNK-006) on 2026-07-18 and authorized propagation per GOV-010, with a
pre-propagation review (below). Decision categories (GOV-010 §5): Business, Scope.

These were the remaining operational and boundary unknowns needed to complete the
V1 domain: what other money the center takes in, what happens when a teacher
leaves, and how a refund relates to a student's registration.

## Decision (the Owner's rulings)

1. **S11-D1 — Revenue set & the defined-source principle.** Beyond program fees,
   V1 supports three other revenue sources: **exam fees, certificate-issuance
   fees, and book/material sales** (each when charged separately). **Room rental,
   consulting, and other services are out of scope** (future). Every incoming
   amount must be tied to a **clear, defined revenue source** — there are no
   generic, unattributed receipts.
2. **S11-D2 — Non-program revenue is center-only.** Exam fees, certificate fees,
   and book/material sales are **entirely center revenue**: no teacher share,
   entitlement, balance, or debt. Revenue **distribution applies exclusively to
   program fees**; these three raise only the Cash Balance and Center Net Balance.
3. **S11-D3 — Educational revenue is student-linked.** All educational revenue
   (program, exam, certificate, books) is **always tied to a specific student**; a
   **program link is optional** per the revenue's nature. **No** general
   non-student educational revenue exists in V1 (out of scope if it occurs).
4. **S11-D4 — Teacher status.** A teacher carries an Owner-controlled status,
   **Active / Inactive-Left**, set manually. Going Inactive-Left blocks assigning
   **new** programs and causes **no** automatic financial or historical effect —
   all prior programs, vouchers, entitlements, payments, balances, debts, and
   history persist unchanged.
5. **S11-D5 — Operations continue regardless of teacher status.** Inactive-Left
   never closes the teacher's financial account. All operations on existing
   balances remain fully available: paying out remaining entitlement, refunds on
   past programs (with entitlement recalculation), creating/settling teacher debt,
   and full reporting/history — until every obligation is settled. The **only**
   thing blocked is new program assignment.
6. **S11-D6 — Refund and registration are independent.** A refund (partial or
   full) **never** automatically changes a student's registration status; there is
   no "full refund ⇒ cancelled" or "partial ⇒ active" rule. Ending or continuing a
   registration is a **separate administrative decision** by the Owner.
7. **S11-D7 — Registration status.** A registration carries an Owner-controlled
   status, **Active / Ended-Withdrawn**. **Ended blocks new receipts** on that
   registration while all prior records remain visible and unchanged, and refunds
   tied to earlier receipts stay allowed. Ending closes the registration to
   **future collection only**, changing no prior financial effect.
8. **S11-D8 — Ended registration is reversible.** The Owner may **reactivate** an
   ended registration back to Active; the **same** registration resumes, keeping
   its full history and its **Final Registration Price** (which is not re-set — it
   remains locked per DR-075). A **new registration** is created only for a
   genuinely **new relationship** (another program, or a new financial obligation
   that is not a continuation).
9. **S11-D9 — Shared operational-status lifecycle pattern.** Program (Open/Closed),
   Teacher (Active/Inactive-Left), and Registration (Active/Ended-Withdrawn) all
   follow one pattern: **Owner-controlled, reversible, history-preserving, blocking
   only new business, and never rewriting prior financial effects.**

## Pre-propagation review applied

1. **New unknowns.** Only genuine open business questions become unknowns:
   **UNK-029** (refundability of non-program revenue) and **UNK-030** (amount-due
   & overpayment handling for non-program revenue) are opened. **UNK-031 is NOT
   opened** — whether these revenues reuse the existing Receipt Voucher (with a
   revenue-source classifier) or a new record type is an **architectural modeling
   decision**, not an unresolved business rule.
2. **Lifecycle pattern.** The emerging pattern across Program/Teacher/Registration
   statuses is documented explicitly (DR-088; DOM-002 §18).

## Interpretation boundaries

- **No frozen fact is overturned.** Program revenue distribution (DR-013),
  center-borne expenses (DR-052), and the refund model (DR-036…DR-042, DR-062…070)
  are unchanged; non-program revenue is a new **center-only** inflow that never
  enters distribution.
- **UNK-006 fully closed.** The remaining domain portion (refund ⟂ registration)
  is decided (S11-D6…D8). The residual UNK-006 items (when a student is *entitled*
  to a refund, how the amount is set, approval, signing) are confirmed to be
  **Owner administrative practice with no system rule** — the amount is a free
  input (S5-D7) and a single operator needs no approval (consistent with S7-D6).
- **Non-program revenue recording** carries a **revenue-source classification** on
  every receipt (S11-D1); the document structure that holds it is deferred as an
  architectural decision (per the review), not a domain unknown.

## Consequences

- **New domain rules:** DR-080…DR-088 (nine rules).
- **Updated status:** DR-009 (UNK-019 resolved), DR-022 (UNK-006 resolved).
- **Unknowns:** UNK-006, UNK-018, UNK-019 CLOSED; **UNK-029, UNK-030 OPENED**
  (both MEDIUM). No HIGH unknown open.
- **Entity/lifecycle documentation:** DOM-002 §4 (teacher status), §5 (registration
  status), new §17 (Non-Program Educational Revenue), new §18 (Operational Status
  Lifecycle — shared pattern).
- **New workflows:** WF-14 (non-program educational revenue received), WF-15
  (teacher status change), WF-16 (registration status change / reactivation);
  WF-01, WF-05, WF-07 updated.
- **Future Considerations added:** room rental, consulting, and other non-
  educational revenue services.
- **Engineering memory:** LES-017 (notice a repeating cross-entity pattern and
  unify it).
- **Blast radius:** DOM-001 v1.12.0, DOM-002 v8.3.0, DOM-003 v1.13.0,
  DOM-004 v3.8.0, DOM-005 v1.18.0, GOV-008 (LES-017), GOV-009, IDX-001 v1.18.0,
  DEC-000; audit AUD-P1A-015. Frozen governance untouched.
- Full review pipeline re-run; Domain Discovery re-freezes on all-PASS.
