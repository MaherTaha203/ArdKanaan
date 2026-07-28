# ADR-0064 — DAT-003 Programs & Registrations Adoption & Freeze

| Field | Value |
|---|---|
| ADR | 0064 |
| Title | DAT-003 Programs & Registrations Adoption & Freeze |
| Phase | 4 (DDL Specification) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 4 checkpoint DC2 (Entities & attributes) continues after DAT-002 froze the party anchors (ADR-0063;
DAT-001 is the frozen framework, ADR-0061; ADR-0060 governs Phase 4). With Student (DB-001) and Teacher
(DB-002) specified, the next entity family is the offering and the enrolment obligation. A Stage-1
Architectural Discovery mapped the Program and Registration atoms from frozen truth and resolved the one
open modeling boundary — how to represent the **Revenue Distribution Policy** — in favour of a distinct
entity owned 1:1 by the Program (the frozen layer names it as its own entity: DOM-002 §6 dedicated
section, PC-003, BR-010), rather than dissolving it into anonymous Program fields.

**DAT-003 — Programs & Registrations** (`docs/data/DAT-003_PROGRAMS_AND_REGISTRATIONS.md`) specifies the
Program entity, its owned Revenue Distribution Policy, and the Registration entity as logical Data Atoms
under DAT-001's six-kind taxonomy and Authority Boundary, and is the **first** Phase-4 document to declare
Relationship atoms. It ran the full GOV-013 lifecycle: Discovery → Draft → Stage-3 Adversarial
Self-Hardening → Constitutional Readiness Verification (4-lens Panel + independent Readiness Judge).

## Decision

1. **Adopt DAT-003 — Programs & Registrations** as **FROZEN v1.0.0** — the second Phase-4
   entity-specification document, subordinate to DAT-001 and P4-000.
2. **What it fixes (31 Data Atoms, DB-022…DB-052; structure only, no new truth):**
   - **Entities** DB-022 Program, DB-033 Revenue Distribution Policy, DB-038 Registration.
   - **Program attributes** DB-023…DB-027 — service-name (label only), base price (DR-072), documentary
     start/end dates (DR-077), Open/Closed status (DR-078); **identity** DB-028 (each run distinct; name
     is a non-key label per DR-071); constraints DB-029/DB-030 and integrity DB-031 (Open/Closed
     lifecycle) and **DB-032** (Teacher-assignment permanence, BR-004 "whole life").
   - **Revenue Distribution Policy** — a **weak (existence-dependent) entity** owned 1:1 by the Program:
     teacher %/center % (DB-034/DB-035, DR-013), the =100% split Constraint (DB-036), and the
     immutability Integrity rule (DB-037, BR-014/DR-076). It stores **only percentages, never money**.
   - **Registration** — the Final Registration Price (DB-039; single stored value, default = base price,
     per-registration override, no discount — BR-006/007/008/DR-072/073/074), Active/Ended-Withdrawn
     status (DB-040), **identity** DB-041 (the distinct obligation; new only for a new Student×Program
     obligation, BR-027/DR-087); constraints DB-042…DB-046 (one Student × one Program; the status
     value-domain; the overpayment cap; the sole-amount-due reference; installments-divide-settlement)
     and integrity DB-047/DB-048 (FRP-lock at first receipt; the status lifecycle).
   - **Relationships (first in Phase 4)** DB-049…DB-052 — Program→Teacher (Teacher 1:N Program),
     Program→Policy (1:1, owned), Registration→Student (Student 1:N Registration), Registration→Program
     (Program 1:N Registration); each fixes ownership + cardinality + referential meaning, homed here
     because both endpoints now exist (DAT-001 §3.1).
   - **Authority Boundary applied:** the registration's collected-total/outstanding, the per-receipt
     Teacher/Center money shares (computed at posting, snapshotted on the voucher — DR-006), and the
     Teacher entitlement/balance/debt are **excluded** as derived — never stored attributes; they are
     specified as computations in DAT-004/DAT-005.
3. **Review outcome:** Stage-3 hardening rebutted H1 (the Policy-as-owned-entity model confirmed
   faithful) and returned Authority Boundary / citations CLEAN, repairing one Major (the Registration
   status enumeration atomized as Constraint DB-043). The Readiness Verification returned **4/4 Panel
   READY-WITH-NITS (0 Blocking / 0 Major)** and the independent Judge issued **READY**. Two Minors (the
   teacher-assignment permanence folded into the DB-049 relationship meaning; a §6 DV-3 FRP-lock
   cross-reference miscite) were resolved by editorial touch-up — the permanence atomized as its own
   Integrity rule DB-032 — before freeze; four Nits were judged acceptable-as-flagged.

## Consequences

- DAT-003 is FROZEN and is the authoritative logical specification of the Program, Revenue Distribution
  Policy, and Registration entities; the vouchers (DAT-004) and derived balances (DAT-005) reference
  these. Amendments only via GOV-004 §5.
- **No** business/product/domain truth is introduced (DV-8); BC/PC/DOM are consumed exactly as frozen.
- **Modeling precedent set:** an existence-dependent, frozen-named component (the Revenue Distribution
  Policy) is modelled as a **weak entity owned 1:1** via a Relationship + ownership + immutability
  integrity, not dissolved into attributes — preserving the frozen concept and its traceability. The
  first Relationship atoms in Phase 4 (DB-049…DB-052) establish the homing discipline (DAT-001 §3.1) for
  DAT-004+.
- Registers updated in this commit: IDX-001 (DAT-003 + ADR-0064 + AUD-P4-003), DEC-000 (next →
  ADR-0065), GOV-009 (counts + refresh + history row), RDM-001 (Phase-4 DC2 — DAT-003 frozen), P4-000
  (document-map DAT-003 status), data/README.

## Notes

DAT-003 is the first Phase-4 document to declare relationships, and the clean Readiness (0 Blocking / 0
Major) held on a genuinely contestable modeling call — the Revenue Distribution Policy as a distinct
owned entity — because the choice was grounded in the frozen layer's own naming (DOM-002 §6, PC-003,
BR-010) rather than invented. The next Phase-4 deliverable is **DAT-004 (Vouchers — Receipt / Payment /
Refund)**, pending a separate Owner order.
