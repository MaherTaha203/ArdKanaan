# ADR-0075 — Retain B+ Structure, Adopt Current Visual Design

**Status:** ACCEPTED — Owner-directed
**Date:** 2026-09-02

## Decision

The previously authorized **B+ product direction is not discarded wholesale**. Its approved product structure, information architecture, workspace model, and implementation direction remain the structural foundation where they are already suitable.

What is retired is the **old B+ visual treatment**. The current Owner-designed visual baseline is the authoritative presentation direction: the existing B+ foundation has been refined with the new approved colours, button treatment, and associated visual styling.

Future implementation and review must therefore:

1. retain suitable B+ structural/product decisions that remain compatible with the current design;
2. use the current Owner-approved visual design for colours, buttons, surfaces, typography treatment, spacing treatment, and other presentation details already established in the product;
3. avoid reverting to the historical B+ visual styling.

## Scope

This decision supersedes ADR-0074 **only where it conflicts with the current visual design**. It does not require rewriting the product structure that was derived from B+ and remains suitable.

It does **not**:

- reopen or modify the frozen Business, Product, Domain, Data, or UX constitutions;
- modify financial rules or the financial firewall;
- alter the Phase-5 governance requirement that material component/design decisions are Owner-controlled;
- alter the Documentation Freeze or phase structure;
- delete historical records or previously merged implementation commits.

## Current visual baseline

The current application implementation records the active visual direction as a light, Arabic-first workspace with a clear-sky presentation: white/light canvas surfaces, slate text, a blue primary brand, restrained semantic accents, softly rounded surfaces, pill actions, generous whitespace, minimal borders, low shadow, and no dashboard KPI wall, card-in-card treatment, or decorative gradients.

The concrete values already present in the application are the current implementation baseline; future changes must preserve that direction unless the Owner explicitly changes it.

## Implementation rule

The product track continues from the current repository baseline. For every new UI change, distinguish between:

- **structure/function** — preserve the suitable B+ foundation and frozen product/UX rules;
- **visual treatment** — follow the current Owner-approved design, not historical B+ styling.

No financial calculation, balance, allocation, rounding, voucher numbering, store, schema, migration, or other financial-domain behaviour may be changed merely to implement this visual baseline.

## Supersession

ADR-0074 remains in repository history as a historical record. Its conflicting **visual direction** is superseded by this ADR; suitable structural/product decisions from B+ remain usable as described above.
