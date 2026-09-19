# ADR-0076 — Student Archive Lifecycle Authorization (an independent student-level `archived` state, added to the product work-line as a tracked divergence from the frozen DB-014; financial firewall absolute)

| Field | Value |
|---|---|
| ADR | 0076 |
| Title | Student Archive Lifecycle Authorization (independent student-level `archived` state; tracked divergence from DB-014; financial firewall absolute) |
| Phase | 5 (Component Library Specification) — **product work-line; opens and advances no phase; the documentation track and the rest of the implementation track stay gated** |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner has directed that the `app/` product gain a **student archiving** capability: a
student who is no longer active may be moved out of the day-to-day active roster into an
**archived** state, and later restored — a purely administrative act that must have **zero
financial impact**.

Two frozen facts constrain how this may be modelled:

- **DAT-002 Party Entities is FROZEN** (ADR-0063). Its atom **DB-014** states, verbatim:
  *"The Student holds **no operational status** — the Active / Ended-Withdrawn lifecycle
  lives on the **Registration**, not the person; there is **no student-level deactivation**"*
  (cites DR-086, DR-088, DOM-002 §17). A student-level `archived` status is, by that atom's
  own words, a student-level deactivation — so the requested feature **crosses the frozen
  DB-014 boundary**.
- The running Supabase database of the `app/` product **already carries** a student-level
  `students.status ∈ {active, completed}` column, plus `completed_at` / `completion_reason`,
  a `students_status_check` constraint, an `active_students` view, and
  `complete_student` / `reactivate_student` functions. These were applied to the product
  database out-of-band and are a **pre-existing divergence** from DB-014 (the product
  work-line's data reality, reconciled to the frozen data model only at Documentation
  Freeze). A companion reconciliation migration
  (`20260916116500_reconcile_student_lifecycle.sql`, PR #101) merely makes the repository
  *reproduce* that existing state; it neither deepens nor endorses the divergence.

Per the Engineering Gateway (Skill §2/§7) and GOV-010, an Owner instruction that crosses a
frozen boundary must be **surfaced and recorded as an explicit Owner-Decision**, not executed
silently. The conflict with DB-014 was surfaced to the Owner, who reviewed it and **authorized
Path A** — proceed via a recorded amendment/exception — with the detailed decision captured
below. This ADR is that record; it is written **before** any archive code.

The forces at play:

- **Product need vs. frozen data model.** The Owner wants an administrative archive/restore
  action on the student; DB-014 places all lifecycle on the Registration and forbids
  student-level deactivation.
- **Concept separation.** `completed` (a graduation/finished concept, currently unused — 0
  rows in the product database) must **not** be overloaded to mean "archived." The two remain
  distinct.
- **Financial firewall.** Archiving must not touch any financial record. The ADR-0074 /
  ADR-0075 financial firewall stays absolute.
- **Precedent.** Owner-directed crossings of a documented boundary have been recorded as
  Owner-Decision ADRs before (ADR-0070 VEM; ADR-0073 ECC tooling; ADR-0074 product work-line;
  ADR-0075 visual baseline). This is the same class of explicit, recorded, non-authoritative
  product decision.

## Decision

1. **Authorize an independent student-level `archived` state** on the `app/` product,
   alongside the existing `active` and `completed`. The student lifecycle domain becomes
   `status ∈ {active, completed, archived}`. `archived` is a **new, separate** state — it is
   **not** a relabelling of `completed`.

2. **Two independent transitions.** `active ⇄ completed` (unchanged) and `active ⇄ archived`
   (new) are separate lifecycles. **`completed` is never converted to `archived`**, and
   `complete_student()` / `reactivate_student()` are **not modified** — their meaning and
   behaviour stay exactly as they are.

3. **Dedicated transition functions.** Archiving and restoration are performed by **new,
   dedicated** functions `archive_student(uuid, text)` and `unarchive_student(uuid)`. The
   completion RPCs are **not** reused. The archive function enforces, server-side:
   - **Eligibility:** a student with **any enrollment on a course whose `status = 'active'`**
     **cannot** be archived (raises a domain error).
   - **Outstanding balance does not block** archiving; it surfaces a **warning** in the UI.
     Archiving performs **no** balance settlement, **no** amount change, and **no** financial
     movement.
   - **Authorization:** only the Owner may archive/restore (enforced inside the function via
     `public.is_owner()`; SECURITY DEFINER, touching only the three lifecycle columns).

4. **This decision amends/excepts DB-014 for archiving only.** DB-014's prohibition on
   student-level deactivation is **excepted, for the archiving concept only**, within the
   product work-line. No other DAT-002 atom, and no other frozen constitution (PC / BC / UX /
   DAT / DOM / PLP / CMP-001), is changed by this ADR.

5. **Recorded as a tracked divergence; the frozen DAT-002 text is not edited now.** Consistent
   with the ADR-0074 product-work-line model, the frozen DAT-002 document is **left unedited**
   at this stage; the DB-014 exception is recorded **here**, in this ADR, as a **tracked
   divergence** of the product work-line from the frozen data model. It **must be reconciled**
   when Phases 1–6 reach **Documentation Freeze** — either by a formal GOV-004 §5 amendment of
   DAT-002 (should the archived concept be adopted into the authoritative data model) or by
   bringing the product back into conformance — resolved **toward the specs**, never the
   reverse, and never as silent drift.

6. **Authorization spans the data layer required to build the feature.** This ADR authorizes,
   for the archiving feature specifically: an **additive, idempotent migration** (the two
   metadata columns `archived_at` / `archive_reason`; widening `students_status_check` to
   include `archived`; the two dedicated RPCs with owner-authorization + audit), the
   **application store / domain-type** changes needed to read `status` and filter the active
   roster, the **UI** (archive/restore actions, an archived-students view), and **tests**. This
   is a narrowly-scoped, Owner-authorized extension of the ADR-0074 / ADR-0075 product
   work-line into the data layer for this feature — it authors **no** CP atom and **no** design
   authority.

7. **Financial firewall is absolute.** Archiving must not modify, delete, re-allocate, or
   re-order any row in `receipt_vouchers`, `receipt_allocations`, `fee_obligations`,
   `payment_vouchers`, `financial_movement_ledger`, or any balance, statement, or historical
   record; it must not change any amount, allocation, rounding, voucher numbering, teacher- or
   center-share (BR-011 / DR-028 / DAT-005 invariants intact). The archive/restore functions
   touch **only** `students.status` / `students.archived_at` / `students.archive_reason`.
   **Financial difference across an archive/restore must be provably zero.**

8. **Financial visibility of an archived student is preserved.** Archiving hides the student
   from the **active roster** only. An archived student who carries financial data or an
   outstanding balance **remains visible** in dues, the relevant financial reports, the account
   statement, and the historical record — archiving does not hide financial truth.

9. **Audit.** Archive and restore are recorded in the existing activity/audit trail via the
   existing `students_activity` → `log_activity` trigger (the transition is an ordinary
   `UPDATE` on `public.students`, logged with the acting Owner).

10. **Production remains READ-ONLY in this phase.** No migration is applied to Production, no
    Production data is changed, no RPC that mutates data is run against Production, and nothing
    is merged or deployed to Production/default without a further explicit Owner order.

11. **Owner-Decision ADR.** This records an Owner decision under GOV-010, not contested design;
    the GOV-013 Multi-Agent Review Panel is **not** invoked (ADR-0070 / 0071 / 0073 / 0074
    precedent).

## Consequences

- **Positive.** The product gains a clean, independent archive lifecycle with server-enforced
  eligibility and owner-only authorization, the financial firewall intact and provably
  zero-impact, `completed` kept distinct, and the frozen-boundary crossing openly recorded
  rather than smuggled in.
- **Negative / cost.** The product's student data model now **diverges further** from the
  frozen DB-014 (student holds no operational status). This is a **tracked divergence** owed a
  **reconciliation** at Documentation Freeze (per Decision §5); until then the `archived` state
  carries **no** authority in the data model and must not be cited as such.
- **Boundary preserved except as stated.** No CP atom is authored, no phase is opened/advanced,
  the Documentation-Freeze gate is not moved, and — apart from the DB-014 archiving exception
  recorded here — no frozen constitution is modified. Design authority remains exclusively in
  the Phase-5 specs.
- **Blast radius (Doc IDs changed in this commit — GOV-004 §5):**
  - **DEC-000** (`docs/decisions/DECISION-LOG.md`): ADR-0076 register row appended; the
    previously-missing **ADR-0075** register row backfilled for contiguity; next-number line
    advanced **→ ADR-0077**.
  - **IDX-001** (`docs/INDEX.md`): ADR-0075 and ADR-0076 registered under §2.6;
    ACCEPTED-ADR count 74 → 76; version bumped.
  - **GOV-009** (`docs/governance/GOV-009_REPOSITORY_HEALTH.md`): ACCEPTED-ADR count 74 → 76;
    refresh entry + history row added.
  - **RDM-001** (`docs/roadmap/ROADMAP.md`): Phase-5 product-work-line note for ADR-0076;
    version bumped.
  - **New file created:** this ADR.
  - **Unchanged:** every frozen constitution (PC / BC / UX / **DAT** / DOM / PLP / CMP-001) —
    including the DAT-002 text, whose DB-014 exception is recorded here as a tracked divergence,
    not an in-place edit — and every financial file and financial-domain behaviour.

## Notes

- **Authority model.** "Ard Kanaan wins": the frozen constitutions, ACCEPTED ADRs, and
  financial invariants bind the work-line. This is a **product** decision recorded as an
  explicit Owner exception to DB-014 for archiving; it creates no design authority and does not
  alter the authoritative data model, which is reconciled at Documentation Freeze.
- **Why an ADR and not silent execution.** A student-level `archived` status crosses the frozen
  DB-014 boundary; the Engineering Gateway (Skill §2/§7) and GOV-010 require it be surfaced and
  recorded as an explicit Owner decision — which this ADR is, authored before any archive code.
- **Reversibility.** The feature is additive and reversible: reverting the archive migration
  and product commits restores the prior state with no loss of financial logic (the migration
  adds only columns/constraint/functions; it deletes nothing).
