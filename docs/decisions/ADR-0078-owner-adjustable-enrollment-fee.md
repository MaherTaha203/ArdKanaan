# ADR-0078 — Owner-Adjustable Per-Enrollment Registration Price (course-fee snapshot editable pre/post receipt down to the collected floor; financial firewall otherwise absolute; tracked divergence from BR-013/DB-047 reconciled at Documentation Freeze; full GOV-004 §5 amendment deferred)

| Field | Value |
|---|---|
| ADR | 0078 |
| Title | Owner-Adjustable Per-Enrollment Registration Price (enrollment `course_value` editable by the Owner, floored at the collected total; firewall otherwise absolute) |
| Phase | 5 (Component Library Specification) — **product work-line; opens and advances no phase; the documentation and remaining implementation tracks stay gated** |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The Owner requires that the **total course fee of one specific student enrollment** be adjustable by the Owner. In the
running product this fee is the per-enrollment snapshot **`public.enrollments.course_value`** — the **Final Registration
Price (FRP)** of the frozen data model (DAT-003 **DB-039**), which "defaults to the program base price, may be overridden
per registration." The course's own catalog price (`public.courses.base_fee`, DB-024) is a separate value and is **not**
the subject of this decision.

Two frozen rules and one implemented firewall bear on the change:

- **BR-013 (BC-001 §Price Immutability) / DAT-003 DB-047 (DV-3 Immutability):** the FRP is *"editable until the first
  receipt, then permanently locked; later corrections are made through financial operations, never by editing the
  price."* Exceptions: **none**.
- **DAT-005 DB-126 / DB-044 / DB-137:** Registration Outstanding = FRP − Collected-Total; collected may never exceed the
  FRP; Outstanding is never negative.
- **Implemented firewall** `public.enforce_enrollment_financial_firewall` (trigger `enrollments_financial_firewall`,
  `app/supabase/migrations/20260916112000_enrollment_identity_insert_delete_hardening.sql`) is **stricter than the
  spec**: it raises `ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE` on **any** UPDATE that changes `course_value` (even before a
  receipt), its only bypass is `app.restoring='on'`, and on INSERT it forces `course_value = courses.base_fee` (no
  per-registration override). `UPDATE` on `enrollments` is also revoked from `authenticated`.

The Owner's **approved financial method** is a **direct adjustment of the enrollment's total obligation** — **not** a
discount obligation, **not** a cash transaction, and **not** cancel-and-recreate of historical receipts. After payments,
the new fee may **never** be below the valid amount already collected and allocated to that enrollment (e.g. FRP 300 with
100 collected may become 250 → remaining 150; 100 collected may **not** become 80 → rejected). Historical
`receipt_vouchers`, `receipt_allocations`, and `financial_movement_ledger` rows stay byte-for-byte unchanged; the
remaining balance simply re-derives.

Editing the FRP after the first receipt **conflicts with the frozen BR-013 / DB-047**, and the approved method
deliberately excludes BR-013's sanctioned correction path (a financial operation / refund). This is therefore an
Owner-authorized **boundary change** that the Engineering Gateway (Skill §2/§7) and GOV-010 require to be **surfaced and
recorded** — which this ADR is. The Owner has clarified that ArdKanaan currently holds only **experimental/test data**
(no real financial operational records), so no flawed model need be preserved for backward compatibility; this
clarification **does not** by itself authorize bypassing governance or touching Production.

**Governance route (Owner-selected).** Two routes were surfaced. **Route A (this ADR): tracked divergence** — the
ADR-0074 / 0076 / 0077 precedent: record the authorized behavior and its intentional deviation from BR-013 / DB-047 here,
**leave the frozen BC-001 / DAT-003 text unedited now**, and reconcile toward the specs at **Documentation Freeze**. The
**full GOV-004 §5 amendment** that would rewrite BR-013 / DB-047 as the new authoritative text (requiring a re-run of the
Phase-4 / business-constitution eight gates under GOV-013) is **deferred to a separate, dedicated governance task** when
the Owner orders it. The runtime feature is identical under either route.

## Decision

1. **Direct FRP adjustment on the enrollment.** The Owner may set one enrollment's total fee by updating
   `enrollments.course_value` directly. `course_value` is the correct existing domain field (the FRP snapshot); **no
   duplicate fee column and no difference/discount `fee_obligation` is introduced.**

2. **Owner-only RPC.** A single narrowly-scoped `SECURITY DEFINER` RPC (empty/locked `search_path`, fully-qualified
   objects, executable revoked from `public`/`anon`, granted only to `authenticated`, e.g. `public.update_enrollment_fee(
   p_enrollment_id uuid, p_amount numeric, p_reason text)`) performs the change. It first enforces `public.is_owner()`
   (`OWNER_ONLY`); a client-settable GUC, request header, or frontend check is **never** the security boundary.

3. **Editable before or after receipts, floored at the collected total.** The fee may be changed whether or not receipts
   exist for that enrollment. The new amount must be **≥ the valid amount already collected and allocated to that
   enrollment** — computed canonically inside PostgreSQL from `receipt_allocations ⋈ receipt_vouchers` (`allocation_type
   = 'course'`, that `enrollment_id`, **cancelled receipts excluded** exactly as the system's balance logic does) — else
   the change is **rejected atomically** (`FEE_BELOW_COLLECTED`) with **zero** database mutation. A fee change may never
   produce over-collection or a negative Registration Outstanding (preserving DB-044 / DB-137).

4. **Atomicity, locking, and concurrency safety.** The minimum-fee validation and the collected-total computation run
   **inside the RPC transaction**, which locks the enrollment row `FOR UPDATE` and takes the same advisory lock key that
   `post_receipt_with_allocations` uses for that enrollment, so a concurrent receipt-posting and a concurrent fee change
   **cannot** interleave into a state where `collected_total > new_course_value`. Concurrent fee changes serialize to one
   correct final value with complete audit history (no lost update). The fee update and its audit record **commit or roll
   back together**.

5. **Narrow, non-forgeable firewall exception — firewall otherwise absolute.** `enforce_enrollment_financial_firewall`
   is amended to permit a **`course_value`-only** change **solely** under a transaction-local GUC set **only inside** this
   owner RPC; it continues to block any change to `id` / `student_id` / `course_id` / `course_name` / `created_at`, even
   under that GUC. The exception cannot be forged by ordinary authenticated SQL/API calls: `authenticated` holds no
   `UPDATE` grant on `enrollments`, so the GUC is inert without the definer RPC, whose `is_owner()` gate governs. **No
   other** financial-firewall protection is weakened: receipt/payment/fee-obligation immutability, the append-only
   `financial_movement_ledger` lock, and every delete-guard remain **absolute**.

6. **Historical financial facts are immutable.** `receipt_vouchers`, `receipt_allocations`, `payment_vouchers`, and
   `financial_movement_ledger` are **not** modified, deleted, or re-allocated by a fee change; no cash moves and no ledger
   row is written (a course due is a receivable, not cash). The remaining balance re-derives per **DB-126** (FRP −
   Collected) — in the `student_statement_lines` view (which already `coalesce`s to `enrollments.course_value`) and in the
   canonical app selectors (`app/src/lib/aggregate.ts`, `app/src/lib/courses.ts`); **no second/competing balance formula
   is introduced.**

7. **Per-enrollment independence; catalog price untouched.** Only the selected enrollment's fee changes. Another
   enrollment of the same student (including in another course), the course's `base_fee`, student identity, course
   identity, receipts, and `fee_obligations` are **never** changed. `fee_obligations.amount` stays generally immutable —
   this decision concerns the **course fee of a specific enrollment**, not standalone exam/certificate/other fee
   obligations.

8. **Immutable audit trail.** Every adjustment records, in the system's existing owner-only `audit_log` (written only via
   `SECURITY DEFINER`, client-immutable), an entry carrying the **enrollment id, old amount, new amount, reason (mandatory
   non-empty), actor, and timestamp**.

9. **Value validation.** `p_amount` must be finite, positive, whole-shekel (per the existing `enrollments` CHECKs) and
   within existing monetary limits; a malformed UUID, empty reason, or non-existent/ineligible enrollment is rejected
   with a clear domain error.

10. **Tracked divergence; frozen text not edited now.** Consistent with ADR-0074 / 0076 / 0077, the frozen **BC-001
    (BR-013)** and **DAT-003 (DB-047 / DB-039)** documents are **left unedited**; the Owner-adjustable-FRP behavior is
    recorded **here** as a **tracked divergence** of the product work-line, to be **reconciled at Documentation Freeze —
    toward the specs, never the reverse, never silent drift.** The **full GOV-004 §5 amendment** rewriting BR-013 / DB-047
    as authoritative text (with the Phase-4 / business-constitution eight-gate re-run under GOV-013) is **deferred** to a
    separate Owner-ordered governance task (Route B).

11. **Production remains READ-ONLY.** The migration (`app/supabase/migrations/20260928HHMMSS_owner_edit_enrollment_fee.sql`)
    is created **in the repository only**; it is **not** applied to Production, and no Production schema, RLS, trigger,
    function, data, or setting is changed and nothing is deployed without a further explicit Owner order. Verification runs
    only on a **disposable local** Postgres/Supabase harness with **synthetic** data.

12. **Owner-Decision ADR.** This records an Owner decision under GOV-010, not contested design; the GOV-013 Multi-Agent
    Review Panel is **not** invoked for Route A (ADR-0074 / 0076 / 0077 precedent). It **opens and advances no phase.**

## Consequences

- **Positive.** The Owner can correct a specific student's total course fee (up or down to the collected floor) with the
  remaining balance re-deriving automatically, while every historical receipt, allocation, and ledger row stays immutable
  and the financial firewall stays absolute except for the one narrow, owner-gated, non-forgeable `course_value` edit.
- **Negative / cost.** The product's enrollment-price behavior now **diverges** from the frozen post-receipt immutability
  (BR-013 / DB-047). This is a **tracked divergence** owed a **reconciliation** at Documentation Freeze (Decision §10);
  until then the Owner-adjustable-FRP behavior carries **no** authority in the constitutions and must not be cited as
  such. The authoritative rewrite of BR-013 / DB-047 (Route B) remains outstanding.
- **Boundary preserved except as stated.** No CP atom authored, no phase opened/advanced, the Documentation-Freeze gate
  unmoved, and — apart from the enrollment-price divergence recorded here — no frozen constitution modified; all
  receipt / allocation / ledger / payment behavior and every other financial invariant unchanged.
- **Blast radius (Doc IDs changed in this commit — GOV-004 §5):**
  - **DEC-000** (`docs/decisions/DECISION-LOG.md`): ADR-0078 register row appended; next-number advanced **→ ADR-0079**.
  - **IDX-001** (`docs/INDEX.md`): ADR-0078 registered under §2.6; ACCEPTED-ADR count 77 → 78; version bumped.
  - **GOV-009** (`docs/governance/GOV-009_REPOSITORY_HEALTH.md`): ACCEPTED-ADR count 77 → 78; refresh entry + history row.
  - **RDM-001** (`docs/roadmap/ROADMAP.md`): Phase-5 product-work-line note for ADR-0078; version bumped.
  - **New file:** this ADR; and (on implementation) one migration, app changes, and tests.
  - **Unchanged:** every frozen constitution's text (PC / BC / UX / DAT / DOM / PLP / CMP-001) — **including BR-013 and
    DAT-003 DB-047/DB-039** — and every receipt / allocation / ledger / payment behavior and financial invariant.

## Notes

- **Authority model.** "Ard Kanaan wins": the frozen constitutions, ACCEPTED ADRs, and financial invariants bind the
  work-line. This is a **product** decision recorded as an explicit Owner authorization; it creates no design authority
  and does not itself alter the authoritative data model, which is reconciled at Documentation Freeze (or by the deferred
  Route-B amendment).
- **Why an ADR and not silent execution.** Editing the FRP after the first receipt crosses the frozen BR-013 / DB-047;
  GOV-010 and the Gateway require the boundary crossing be surfaced and recorded — the operation is **not** renamed or
  disguised to evade governance.
- **Reversibility.** The change is additive and reversible: reverting the migration and product commits restores the
  prior immutable-FRP state with no loss of financial logic (the migration adds one narrow firewall exception + one RPC;
  it deletes nothing and moves no money).
- **Verification.** A local throwaway Postgres harness applies the full migration chain and proves acceptance criteria
  A–L: edit before first receipt; edit after a receipt; atomic rejection below collected; correct remaining after a raise;
  receipts/allocations/ledger unchanged (before/after diff); other enrollment unaffected; cancelled receipts excluded from
  valid collected; owner-only enforced at DB/RPC; concurrent receipt + fee change never over-collects; audit row carries
  old/new/reason/actor/timestamp; all existing tests still pass; no Production change. Production is never touched by the
  harness.
