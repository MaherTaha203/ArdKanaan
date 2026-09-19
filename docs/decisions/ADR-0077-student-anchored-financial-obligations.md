# ADR-0077 — Student-Anchored Financial Obligations (fee obligations become independent of course enrollment; course/enrollment demoted to optional context; financial firewall absolute; tracked divergence reconciled at Documentation Freeze)

| Field | Value |
|---|---|
| ADR | 0077 |
| Title | Student-Anchored Financial Obligations (enrollment-independent fees; course/enrollment optional; financial firewall absolute) |
| Phase | 5 (Component Library Specification) — **product work-line; opens and advances no phase; the documentation track and the rest of the implementation track stay gated** |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

A recorded diagnosis (Phase-1 investigation, accepted by the Owner) established that
"adding a fee from the Courses page" was rejected because the `app/` product models a
fee obligation as a **course-enrollment fee, mandatorily**:

- `public.fee_obligations.enrollment_id` was **`NOT NULL`**;
- `public.create_fee_obligations(payload jsonb)` raised
  `ENROLLMENT_REQUIRED_FOR_SELECTED_STUDENTS` for any student without an enrollment in the
  target course;
- two triggers — `resolve_fee_obligation_enrollment` (which **invented** an enrollment or
  raised `ENROLLMENT_REQUIRED_FOR_FEE_OBLIGATION`) and
  `enforce_fee_obligation_financial_identity` (which raised
  `FEE_OBLIGATION_ENROLLMENT_REQUIRED`) — rejected any obligation not backed by a matching
  enrollment.

The consequence: **exam / certificate / external / other fees, and any fee for a student
not enrolled in that course, were impossible.** On the running product database this showed
as an empty roster + a disabled button on courses with no enrollments, and a swallowed
`ENROLLMENT_REQUIRED_FOR_SELECTED_STUDENTS` behind a generic "تعذّر إضافة الرسوم" message.

The coupling originates in a product-work-line implementation choice
(`20260915150000_financial_domain_identity_hardening.sql`: *"Enrollment is the authoritative
financial identity"*), applied to the product database ahead of the documentation pipeline.
The **authoritative** financial data model (DAT-003 Programs & Registrations, DAT-004
Vouchers, DAT-005 Derived Balances — all FROZEN under ADR-0064…0066) governs how obligations
relate to registrations in the specs; to the extent it ties an obligation to a registration,
demoting that link to optional is a **product-work-line divergence** owed a reconciliation at
Documentation Freeze — exactly the ADR-0074 / ADR-0075 / ADR-0076 model.

The Owner reviewed the diagnosis and **authorized Path B — the root fix** — explicitly: modify
the code and create a migration **in the repository only**, with **no** migration or schema
change applied to Production in this phase, preserving the existing financial system's
integrity in full.

The forces at play:

- **Product need vs. implemented identity.** The Owner wants obligations anchored on the
  student, with the course an optional context; the running product ties every obligation to a
  course enrollment.
- **Financial firewall.** The change must not weaken any financial protection: obligations
  stay immutable after creation, non-deletable, and move **no** cash; only a receipt moves
  money. The ADR-0074 / ADR-0075 / ADR-0076 financial firewall stays absolute.
- **Integrity where context IS given.** Relaxing the requirement must not relax **validation**:
  a linked enrollment must still belong to the student and agree with any course; a named
  course must still exist.
- **Precedent.** Owner-directed product decisions on the work-line ahead of the docs pipeline
  have been recorded as Owner-Decision ADRs (ADR-0074 product work-line; ADR-0075 visual
  baseline; ADR-0076 archive lifecycle). This is the same class of explicit, recorded,
  non-authoritative product decision.

## Decision

1. **Anchor the obligation on the student.** `fee_obligations.student_id` remains the required
   identity. **`course_id` and `enrollment_id` become OPTIONAL context.** A fee may be tied to
   a course (and to the student's enrollment when one exists) **or stand entirely alone**
   (`course_id = NULL`, `enrollment_id = NULL`) and remain fully valid.

2. **`create_fee_obligations` accepts optional context.** The RPC no longer requires an
   enrollment and no longer raises `ENROLLMENT_REQUIRED_FOR_SELECTED_STUDENTS`. When a
   `course_id` is supplied it must exist (`COURSE_NOT_FOUND`) and each student's enrollment in
   it is **linked when present, not required**; an explicit `enrollment_id` fixes a single
   student and its course; neither given produces a standalone obligation. All amount /
   category / `external_share` validation is **unchanged**.

3. **Triggers relaxed, integrity kept.** `resolve_fee_obligation_enrollment` allows a
   standalone obligation, links an **existing** enrollment when a course is set, and **never
   invents** a missing one. `enforce_fee_obligation_financial_identity` validates any linked
   enrollment (belongs to the student; agrees with a supplied course) and any named course's
   existence — but permits a null-context obligation. Both keep the `app.restoring` bypass.

4. **Schema.** `fee_obligations.enrollment_id` and `fee_obligations.course_name` are made
   **nullable** (`course_id` was already nullable). No column is dropped; nothing is deleted;
   no financial table is rebuilt.

5. **Financial firewall is absolute and preserved.** Creating a fee still creates **only** a
   financial obligation — **no** `receipt_vouchers`, `receipt_allocations`, `payment_vouchers`,
   `financial_movement_ledger` row, and **no** cash / bank / financial movement. Obligations
   remain **immutable after creation** (financial-identity trigger, UPDATE branch intact) and
   **non-deletable** (`prevent_financial_obligation_delete` unchanged). The receipt-posting and
   allocation logic (`post_receipt_with_allocations`, `receipt_allocations`) is **not modified**
   and continues to move money exactly once, on a real receipt. Zero cash/ledger impact is
   proven by a full local harness (T1–T12 + immutability + owner + mismatch guards).

6. **Beneficiary ≠ money destination.** `fee_category` (`institute` / `external` / `shared`)
   and `external_share` — the **beneficiary** split — are preserved unchanged. A cashbox / bank
   **money-destination** concept is explicitly **out of scope** here and left as an independent
   future decision; the current system has no such concept, and this migration is **not**
   widened to add one.

7. **UI, minimal and reused.** A fee may now be added **to a student directly** (a new
   `student-fee` action on the student statement, with an **optional** course selector),
   reusing the existing `useFeeObligationStore`. The Courses-page fee entry is keyed by
   **`course_id`** (never `course_name`) per §7 of the Owner instruction. No large new surface
   is introduced; the receipt sheet — which already lists open course dues **and** open fee
   obligations and enforces at-least-one allocation — is **not** rebuilt.

8. **Recorded as a tracked divergence; frozen DAT text is not edited now.** Consistent with the
   ADR-0074 / ADR-0076 product-work-line model, the frozen DAT-003/004/005 documents are **left
   unedited**; the enrollment-optional obligation model is recorded **here** as a **tracked
   divergence** of the product work-line, to be **reconciled at Documentation Freeze** —
   resolved **toward the specs**, never the reverse, never silent drift.

9. **Production remains READ-ONLY in this phase.** The migration
   (`20260919130000_allow_standalone_fee_obligations.sql`) is created **in the repository
   only**. It is **not** applied to Production; no Production schema, RLS, trigger, function, or
   data is changed; nothing is deployed to Production without a further explicit Owner order.

10. **Owner-Decision ADR.** This records an Owner decision under GOV-010, not contested design;
    the GOV-013 Multi-Agent Review Panel is **not** invoked (ADR-0074 / 0076 precedent).

## Consequences

- **Positive.** The obligation model becomes coherent and student-anchored: course fees, exam
  fees, certificate fees, external fees, and fees for never-enrolled students all work; the
  financial firewall stays intact and provably zero-impact; validation of supplied context is
  preserved; and the change is openly recorded rather than smuggled in.
- **Negative / cost.** The product's obligation model now **diverges** from the frozen
  registration-anchored financial specs. This is a **tracked divergence** owed a
  **reconciliation** at Documentation Freeze (per Decision §8); until then the
  enrollment-optional model carries **no** authority in the data model and must not be cited as
  such.
- **Boundary preserved except as stated.** No CP atom is authored, no phase is opened/advanced,
  the Documentation-Freeze gate is not moved, and — apart from the enrollment-optional
  obligation divergence recorded here — no frozen constitution is modified. Design authority
  remains exclusively in the Phase-5 specs.
- **Blast radius (Doc IDs changed in this commit — GOV-004 §5):**
  - **DEC-000** (`docs/decisions/DECISION-LOG.md`): ADR-0077 register row appended; next-number
    line advanced **→ ADR-0078**.
  - **IDX-001** (`docs/INDEX.md`): ADR-0077 registered under §2.6; ACCEPTED-ADR count 76 → 77;
    version bumped.
  - **GOV-009** (`docs/governance/GOV-009_REPOSITORY_HEALTH.md`): ACCEPTED-ADR count 76 → 77;
    refresh entry + history row added.
  - **RDM-001** (`docs/roadmap/ROADMAP.md`): Phase-5 product-work-line note for ADR-0077;
    version bumped.
  - **New file created:** this ADR.
  - **Unchanged:** every frozen constitution (PC / BC / UX / DAT / DOM / PLP / CMP-001) —
    including the DAT-003/004/005 text — and every receipt / allocation / ledger behaviour and
    financial invariant.

## Notes

- **Authority model.** "Ard Kanaan wins": the frozen constitutions, ACCEPTED ADRs, and
  financial invariants bind the work-line. This is a **product** decision recorded as an
  explicit Owner authorization (Path B); it creates no design authority and does not alter the
  authoritative data model, which is reconciled at Documentation Freeze.
- **Why an ADR and not silent execution.** Demoting the enrollment link on a financial
  obligation touches the financial-domain identity the product database implemented; the
  Engineering Gateway (Skill §2/§7) and GOV-010 require an Owner-authorized boundary change be
  surfaced and recorded — which this ADR is.
- **Reversibility.** The change is additive and reversible: reverting the migration and product
  commits restores the prior state with no loss of financial logic (the migration relaxes two
  `NOT NULL`s and re-relaxes two trigger/one RPC bodies; it deletes nothing and moves no money).
- **Verification.** A local, throwaway Postgres harness applies the full migration chain and
  proves: course fee for enrolled + non-enrolled students, standalone fees, external-beneficiary
  fees, fee-creates-no-receipt, fee-moves-no-cash, receipt-requires-allocation, partial payment,
  multi-allocation, over-remaining rejection, owner-only, obligation immutability, and
  cross-student enrollment-mismatch rejection. Production is never touched by the harness.
