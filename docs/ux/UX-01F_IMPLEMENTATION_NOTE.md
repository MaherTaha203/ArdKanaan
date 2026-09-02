# UX-01F — Detail Pages and Tables

## Scope

This phase establishes the implementation contract for detail pages and dense tables without changing financial behavior, derived calculations, persistence, migrations, or voucher numbering.

## Rules

- Detail pages use a wide document-like workspace.
- The page header keeps identity, context, and primary actions readable without a permanent sidebar.
- Related records remain tabular and scannable; do not turn dense financial data into card grids.
- Financial amounts use existing formatting and alignment rules; no derived value becomes editable.
- Status is expressed with text, never color alone.
- No decorative hover, animation, gradient, or heavy shadow is introduced.
- Responsive behavior may reflow controls and tables; it must not change business semantics.

## Financial firewall

No changes are permitted to financial aggregation, formatting/derivation rules, domain schemas, stores, or Supabase migrations as part of UX-01F.
