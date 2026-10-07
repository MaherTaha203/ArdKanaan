# ADR-0079 — FIN-001 / DB-001: Whole-Shekel Derived External Share

| Field | Value |
|---|---|
| ADR | ADR-0079 |
| Status | ACCEPTED |
| Phase | 5 — Product Work-Line |
| Decision type | Owner-Decision |
| Supersedes | — |
| Date | 2026-10-07 |

---

## 1. Decision

Resolve **FIN-001 / DB-001** by restoring the frozen whole-shekel rule for derived `external_share` amounts.

For every receipt allocation derived from a fee obligation:

1. `external_share` is rounded to the nearest whole shekel.
2. The institute receives the rounding remainder implicitly as `amount_received - external_share`.
3. Stored receipt voucher and allocation snapshots contain whole-shekel `external_share` values.
4. Across partial payments, the final payment receives the exact remaining external share so the fee's external allocation is conserved exactly.
5. No agorot are introduced into financial reports or derived financial figures.

PostgreSQL numeric `round(value)` is the authoritative nearest-integer operation; ties are rounded away from zero.

This decision does **not** amend ADR-0014. It restores the implementation to the already accepted whole-shekel financial rule.

## 2. Rationale

The previous implementation used `round(..., 2)` for derived external shares. That preserved monetary conservation but allowed values such as `0.33` to be stored and surfaced in financial reporting, contradicting the frozen whole-shekel rule.

The selected policy keeps money whole-shekel throughout the financial model while preserving exact conservation. Partial-payment rounding drift is resolved by assigning the exact remaining external share to the final payment.

## 3. Implementation boundary

The authoritative calculation remains in `post_receipt_with_allocations`.

The implementation changes derived external-share rounding to the nearest whole shekel, restores whole-shekel database constraints on receipt vouchers and receipt allocations, and adds executable throwaway-PostgreSQL coverage for partial-payment rounding, final-payment conservation, and a `.5` rounding boundary.

No Production database mutation is authorized by this ADR. Production remains read-only until a separate explicit Owner authorization for application of the migration.

## 4. Acceptance evidence

The required runtime proof must show:

- `1 / 100` against external share `33` → allocation external share `0`;
- final `99 / 100` → remaining external share `33`;
- total external share = `33` and gross allocation = `100`;
- `50 / 100` against external share `33` → `17`;
- final `50 / 100` → remaining `16`;
- total external share = `33`;
- no stored receipt/allocation external share is fractional.

The proof runs only against throwaway PostgreSQL and is wired into CI.

## 5. Governance

This is an Owner-Decision ADR under the existing product work-line authorization. It opens or advances no phase and creates no new product feature.

The implementation is reconciled to the frozen financial rule rather than creating a new business-rule divergence.
