# ADR-0075 — Supersede the B+ Product Design Direction

**Status:** ACCEPTED — Owner-directed
**Date:** 2026-09-02

## Decision

The previously authorized **B+ product direction** is retired and must no longer be treated as the active design direction for the Ard Kanaan product track.

The current product design is the new design baseline established by the Owner. Future implementation and review work must follow that current design baseline rather than the historical B+ direction.

## Scope

This decision supersedes the product-design direction expressed by ADR-0074 and any implementation guidance whose authority derives solely from B+.

It does **not**:

- reopen or modify the frozen Business, Product, Domain, Data, or UX constitutions;
- modify financial rules or the financial firewall;
- alter the Phase-5 governance requirement that material component/design decisions are Owner-controlled;
- alter the Documentation Freeze or phase structure;
- delete historical records or previously merged implementation commits.

## Implementation rule

The existing `app/` product track may continue from the current repository baseline, but new implementation must be evaluated against the Owner's current design baseline. Historical B+ styling or layout is not a reason to preserve an existing UI treatment when it conflicts with the current design.

## Supersession

ADR-0074 remains in repository history as a historical record. It is superseded as an active product-design direction by this ADR.
