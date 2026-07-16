# ADR-0010 — Operations Is a System Activity View

| Field | Value |
|---|---|
| ADR | 0010 |
| Title | Operations Is a System Activity View |
| Phase | 1A |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

"Operations (عمليات)" has been listed among the core vocabulary since the founding
brief (F-05) but was never defined — the first HIGH unknown of Domain Discovery
(UNK-001, → LES-004). Interview Session 2 was dedicated solely to it; the owner
answered with a definitive business analysis that replaces every previous
candidate reading.

## Decision (the owner's ruling)

1. **Operations is NOT a business entity** — not an independent domain object,
   not a financial document, not a workflow, not a ledger, not a journal.
2. **Definition:** Operations is a **chronological activity timeline** of
   everything that happened inside the system — a System Activity Timeline /
   Activity Log presented in a business-friendly way.
3. **Content:** any meaningful business activity may appear — e.g. Receipt
   Voucher created/edited/cancelled, Payment Voucher created, Teacher payment
   recorded, Training Program created/modified, Distribution policy changed,
   Settings changed, Backup created, Restore completed.
4. **No business logic:** the timeline only *records* business events; business
   rules belong to the originating entity. The Operations page only displays
   them.
5. **Financial impact flag:** some operations affect money (receipt posted,
   teacher payment posted), some do not (settings changed, program name edited).
6. **Relationships:** every operation belongs to a source (Receipt Voucher,
   Payment Voucher, Training Program, Teacher, Settings, Backup, System). An
   operation never exists by itself.
7. **Immutability:** operations represent historical events; the timeline is
   **append-only**; corrections generate new operations; history never
   disappears.
8. **User experience intent:** a searchable chronological history of the center,
   newest first, each row self-explanatory without opening the source document.

## Interpretation boundaries

- **F-05 refinement (not contradiction):** F-05's "Operations" names this
  activity view within the system's core vocabulary; it does not make Operations
  a business entity. DOM-002 §9 is reclassified accordingly. The fixed term
  "Operation" (GOV-002 §7.2) remains in force with this meaning.
- **Signals noted, not resolved:** the owner's event examples imply that voucher
  *edit* and *cancel* events exist and that policy changes are logged. The
  mechanics of corrections/cancellations (UNK-007) and of policy changes
  (UNK-003) remain OPEN — these examples are recorded as signals in DOM-005, not
  as answers (AI-11).
- Settings, Backup, and Restore are system-level activities named here only as
  timeline sources; they introduce no new business unknowns and their
  specification belongs to later phases.

## Consequences

- **Resolved:** UNK-001 (closed with a full business definition).
- **New domain rules:** DR-018 (activity view, no business logic), DR-019
  (append-only immutability), DR-020 (source attachment + financial-impact
  flag).
- **Blast radius:** DOM-002 v2.2.0 (§9 reclassified), DOM-004 v2.2.0,
  DOM-005 v1.6.0, GOV-008 (LES-007), GOV-009, IDX-001, DEC-000; audit
  AUD-P1A-004. DOM-001/DOM-003 contain no Operations references (verified by
  repository-wide search).
- HIGH unknowns drop 6 → 5; full review pipeline re-run; Domain Discovery
  re-freezes on all-PASS.
