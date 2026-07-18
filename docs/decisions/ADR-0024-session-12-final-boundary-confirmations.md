# ADR-0024 — Session 12 Owner Decisions: Final Boundary Confirmations

| Field | Value |
|---|---|
| ADR | 0024 |
| Title | Session 12 Owner Decisions: Final Boundary Confirmations |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner closed Interview Session 12 (Final Boundary Confirmations, targeting
UNK-017, UNK-023, and ASM-004) on 2026-07-18 and authorized propagation per
GOV-010 (Stage 2 of a three-stage plan; Stage 3 closes Phase 1A). Decision
categories (GOV-010 §5): Business, Scope. These were the last confirm-or-descope
items needed before Domain Discovery can be declared complete.

## Decision (the Owner's rulings)

1. **S12-D1 — Guardian/Parent participant.** V1 adds one participant: the
   **Guardian/Parent**, held as **student-level administrative contact data**
   (name, relationship, phone, contact means), used because many students are
   minors. The Guardian is **not** a system user, **not** a financial entity, and
   has **no** permissions or role in any operation.
2. **S12-D2 — Guardian is distinct from Payer Name.** The **Guardian** is standing
   contact information on the *student*, unchanged by payments; the **Payer Name**
   (DR-021) remains a **per-voucher** note of who paid on a specific receipt. They
   are independent — a guardian need not be the payer, and the payer may vary from
   receipt to receipt.
3. **S12-D3 — Sole system user.** The **only system user remains the Owner**; V1
   has no employees, accountant, secretary, or partner (reaffirms F-02).
4. **S12-D4 — No tax dimension.** V1 has **no VAT, tax computation, tax reports, or
   tax invoices** — all out of scope. The vouchers the system issues are the
   center's **internal** records, not government tax invoices.
5. **S12-D5 — Official numbering per voucher type.** The one regulatory requirement
   is that **every financial voucher type carry an official, sequential, unique,
   non-duplicated number in its own independent series**, preserved for audit. This
   generalizes DR-026 (receipt/payment sequences) to every financial voucher type.
6. **S12-D6 — Round-half-up (ASM-004 confirmed).** On an exact half shekel, the
   **teacher's share rounds up** to the whole shekel (standard commercial
   rounding), the rounding difference goes to the **center**, and the two shares
   always sum exactly to the voucher amount. Example: 1001 @ 50/50 → teacher 501,
   center 500.

## Interpretation boundaries

- **Guardian is a data attribute, not a new financial entity.** It adds contact
  fields to the Student; it never appears in any balance, split, entitlement, or
  voucher-money line.
- **Numbering scheme vs requirement.** S12-D5 elevates to a rule the *requirement*
  that each voucher type is officially, uniquely, sequentially numbered; the exact
  per-type numbering scheme and go-live starting numbers remain a design/go-live
  detail (as already noted for Refund Voucher numbering, ADR-0017 §2, and Expense
  Return numbering, ADR-0020).
- **ASM-004 becomes a rule.** Per DOM-005 §5, a confirmed assumption becomes a rule
  by amendment; DR-028 is amended to state the round-half-up direction, and ASM-004
  is marked CONFIRMED. This closes the last pending assumption.
- **No frozen fact overturned.** F-02 (single user) stands; DR-021 (Payer Name)
  stands; DR-026 stands and is generalized, not replaced; DR-028's conservation
  rule (shares sum to the voucher) is unchanged.

## Consequences

- **New domain rules:** DR-089 (Guardian/Parent), DR-090 (official numbering per
  voucher type). **Amended rule:** DR-028 (exact-half → round-half-up; ASM-004
  citation cleared).
- **Assumptions:** ASM-004 CONFIRMED (last pending assumption closed).
- **Unknowns:** UNK-017, UNK-023 CLOSED. No new unknowns opened.
- **Entity documentation:** DOM-002 §5 (Student) gains the Guardian attribute;
  §7/§8 note internal records and per-type numbering.
- **Future Considerations added:** tax / VAT / tax invoices / tax reporting (out of
  scope for V1).
- **Blast radius:** DOM-001 v1.13.0, DOM-002 v8.4.0, DOM-004 v3.9.0, DOM-005
  v1.19.0, GOV-009, IDX-001 v1.19.0, DEC-000; audit AUD-P1A-016. Frozen governance
  untouched.
- Full review pipeline re-run; Domain Discovery re-freezes on all-PASS. Phase 1A
  closure is handled separately (Stage 3, ADR-0025 + AUD-P1A-FINAL).
