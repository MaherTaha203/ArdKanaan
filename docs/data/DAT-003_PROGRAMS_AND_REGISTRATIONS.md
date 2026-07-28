# DAT-003 — Programs & Registrations

| Field | Value |
|---|---|
| Doc ID | DAT-003 |
| Title | Programs & Registrations |
| Phase | 4 (DDL Specification) |
| Status | FROZEN |
| Version | 1.0.0 |
| Frozen by | ADR-0064 (AUD-P4-003) |
| Depends on | DAT-001 (framework); DAT-002 (Party Entities — Student & Teacher, FROZEN); P4-000 (governing plan); BC-001, BC-002 (frozen & locked); PC-003…PC-008 (frozen); DOM-002 (§3 Program, §5 Registration, §6 Revenue Distribution Policy); DOM-004 (DR-002/013/022/023/024/071…079/085…088); GOV-006/011/012/013 |
| Answers | "What are the Program and Registration entities and their owned Revenue Distribution Policy — their attributes, relationships, identity, constraints, and lifecycle integrity — expressed as logical Data Atoms over frozen truth?" |
| Governed by | GOV-013 — Multi-Agent Review Protocol (full lifecycle: Discovery → Draft → Stage-3 Self-Hardening → Readiness Verification) |

---

> **Nature of this document.** DAT-003 is the second Phase-4 entity-specification document. It specifies
> the **Program** and **Registration** entities and the Program-owned **Revenue Distribution Policy**,
> as logical Data Atoms (`DB-NNN`) under DAT-001: the six-kind taxonomy, the Authority Boundary (only
> truth may be persisted), and technology-neutral logical representation (no table/column/type/key/
> index/SQL/Phase-10). It **introduces no new truth** — every atom cites a frozen BR/PR/DR — and it is
> the **first** Phase-4 document to *declare* Relationship atoms (DAT-002 declared none): Program→Teacher,
> Program→Policy, Registration→Student, Registration→Program.

## 1. Constitutional position

DAT-003 consumes the frozen truth exactly as frozen and records the structure of the offering and the
enrolment obligation:

```
DAT-001 (framework) · DAT-002 (Student DB-001, Teacher DB-002 — the anchors)
        │  obeyed / referenced exactly
        ▼
DAT-003 — Programs & Registrations:  Program (DB-022) · Revenue Distribution Policy (DB-033) · Registration (DB-038)
        │  declares the Program↔Teacher, Program↔Policy, Registration↔Student, Registration↔Program relationships
        ▼
DAT-004 (vouchers — reference Program & Registration) → DAT-005 (derived balances) → DAT-006 (timeline)
```

DAT-003 follows DAT-002 because Program is anchored by the frozen **Teacher** (DB-002) and Registration
binds the frozen **Student** (DB-001) to a Program — both anchors are already specified, so these
relationships can be homed here (DAT-001 §3.1: a Relationship is homed where **both** entities exist).

## 2. Scope

- **In scope:** the **Program** entity and its owned **Revenue Distribution Policy**; the **Registration**
  entity; their attributes, identity, constraints, lifecycle integrity; and the four relationships listed
  above (ownership · cardinality · referential meaning).
- **Modeling decision — Revenue Distribution Policy is a distinct Entity owned 1:1 by the Program.** The
  frozen layer names it as its own entity with explicit 1:1 ownership (DOM-002 §6; PC-003; BR-010 "A
  Program **owns exactly one** Revenue Distribution Policy") and gives it its own attributes (teacher %,
  center %) and lifecycle (immutable for the program's life — BR-014). DAT-001 §3.1's Relationship +
  ownership kind expresses exactly this owned, existence-dependent component; modelling it so preserves
  the frozen concept and its traceability rather than dissolving a named frozen entity into anonymous
  fields.
- **Out of scope (frozen-truth boundaries):**
  - **Financial vouchers** (Receipt / Payment / Refund) and the per-receipt **Teacher Share / Center
    Share** computed at posting — DAT-004; the Policy stores only the **percentages**, never money (§5).
  - **Derived balances** — the registration's collected-total / outstanding, teacher entitlement /
    balance / debt — DAT-005 (§5).
  - **Activity timeline** (status-change events, DR-019/020) — DAT-006.
  - **DDL implementation / keys / indexes / storage** — Phase 10.
  - **Owner-intervention policy** — not a data-model concern.

## 3. The atoms

Every atom is exactly one of DAT-001's six kinds, carries a `DB-NNN` id, cites ≥1 frozen authority, and
(for attributes) is classified **stored** or **derived**. Numbering continues at **DB-022** (DAT-002
closed at DB-021).

### 3.1 Program

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-022** | Entity | **Program** — a single Program Run with its own financial identity; the basic financial unit and the anchor to which registrations and receipts refer | stored | BR-001; BR-004; DR-071; DOM-002 §3 |
| **DB-023** | Attribute | **Program service-name** — a label only; a shared service-name creates no financial link between runs | stored | BR-002; DR-071 |
| **DB-024** | Attribute | **Program base price** — exactly one, set at creation; the default amount due for its registrations | stored | BR-005; DR-072 |
| **DB-025** | Attribute | **Program documentary start date** — drives no automatic behavior | stored | BR-015; DR-077 |
| **DB-026** | Attribute | **Program documentary end date** — drives no automatic behavior | stored | BR-015; DR-077 |
| **DB-027** | Attribute | **Program Open/Closed operational status** — Owner-controlled | stored | BR-016; DR-078 |
| **DB-028** | Identity | A Program record denotes **one distinct Program Run** known by its own run-identity; a shared **service-name is a label only and is *not* a uniqueness key** (same-named runs are distinct); no natural-key uniqueness is imposed (surrogate = Phase-10) | — | BR-001; BR-002; DR-071 |
| **DB-029** | Constraint | Program Open/Closed status **value-domain = exactly {Open, Closed}** | — | BR-016; DR-078 |
| **DB-030** | Constraint | Each Program Run is **financially independent** of every other (no cross-program link or offset); a shared service-name creates no link; **any number of Programs may be concurrently open** (no cap) | — | BR-001; BR-002; BR-003; DR-071 |
| **DB-031** | Integrity rule | **Program Open/Closed lifecycle:** Owner-controlled and **reversible**; Closed **blocks only new business** (new registrations and new receipts) while all existing records stay visible and legitimate operations on them remain; it changes no identity, price, percentage, date, or history | — | BR-016; BR-017; DR-078; DR-079 |
| **DB-032** | Integrity rule | **Program Teacher-assignment permanence:** a Program is owned by exactly one Teacher for its **whole life**; the teacher assignment is not reassigned in place | — | BR-004; DR-002 |

### 3.2 Revenue Distribution Policy (owned 1:1 by the Program)

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-033** | Entity | **Revenue Distribution Policy** — the fixed teacher/center percentage split a Program owns; it has **no independent existence** (created with the Program, one per Program) | stored | BR-010; DR-076; DOM-002 §6 |
| **DB-034** | Attribute | **Teacher percentage** of the policy | stored | BR-010; DR-013; DOM-002 §6 |
| **DB-035** | Attribute | **Center percentage** of the policy | stored | BR-010; DR-013; DOM-002 §6 |
| **DB-036** | Constraint | **Teacher percentage + Center percentage = 100%** (a percentage split) | — | DR-013; DOM-002 §6 |
| **DB-037** | Integrity rule | The distribution percentage is **immutable for the program's whole life**; a different split is realized only by creating a **new Program**, never by editing an existing policy | — | BR-014; DR-076 |

*The Revenue Distribution Policy is a **weak (existence-dependent) entity**: it carries no Identity atom
of its own and is identified **through its owning Program** (DB-050), consistent with its 1:1 ownership
and no-independent-existence (BR-010/BR-014).*

### 3.3 Registration

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-038** | Entity | **Registration** — an independent enrolment obligation binding **one Student to one Program**; a recorded business event that **precedes payment** | stored | BR-019; BR-020; DR-022; DOM-002 §5 |
| **DB-039** | Attribute | **Final Registration Price** — a **single stored** amount due for the registration; defaults to the program base price, may be **overridden per registration**; there is **no discount** concept | stored | BR-006; BR-007; BR-008; DR-072; DR-073; DR-074 |
| **DB-040** | Attribute | **Registration Active/Ended-Withdrawn operational status** — Owner-controlled | stored | BR-025; DR-086 |
| **DB-041** | Identity | A Registration record denotes **one distinct enrolment obligation**; a new registration exists **only** for a new Student×Program obligation (a same-Program continuation is a *reactivation*, not a new registration); Student×Program is **not** a uniqueness key; no natural-key uniqueness (surrogate = Phase-10) | — | BR-020; BR-027; DR-022; DR-087 |
| **DB-042** | Constraint | A registration **links exactly one Student to exactly one Program** — it never spans two students or two programs | — | BR-020; DR-022 |
| **DB-043** | Constraint | Registration **Active/Ended-Withdrawn status value-domain = exactly {Active, Ended-Withdrawn}** | — | BR-025; DR-086 |
| **DB-044** | Constraint | The **sum of a registration's receipts may never exceed its Final Registration Price** (no overpayment in V1) | — | BR-024; DR-024 |
| **DB-045** | Constraint | The Final Registration Price is a **single stored value** and the **sole amount-due reference** for the registration's receipts, refunds, and overpayment checks; it is not derived from `base − discount` | — | BR-008; BR-009; DR-074 |
| **DB-046** | Constraint | **Installments divide only the *settlement*** of the obligation, never the obligation itself — the Final Registration Price remains one indivisible amount due | — | BR-023; DR-023 |
| **DB-047** | Integrity rule | The Final Registration Price is **editable until the first receipt, then permanently locked**; later corrections are made through financial operations, never by editing the price | — | BR-013; DR-075 |
| **DB-048** | Integrity rule | **Registration Active/Ended-Withdrawn lifecycle:** Owner-controlled and **reversible**; Ended-Withdrawn **blocks new receipts** while preserving all history and still allowing refunds on prior receipts; reactivation **resumes the same registration** with its locked price; refund and registration status are **independent** | — | BR-025; BR-026; DR-085; DR-086; DR-087; DR-088 |

## 4. Relationships (declared here — both entities exist)

Per DAT-001 §3.1, each Relationship fixes **ownership** (anchor → dependent), **cardinality**, and
**referential meaning**; the cascade/mechanism is Phase-10.

| Atom | Relationship | Ownership | Card. | Referential meaning | Cites |
|---|---|---|---|---|---|
| **DB-049** | **Program → Teacher** | anchor **Teacher** (DB-002, DAT-002); dependent Program | Teacher **1:N** Program | the program's teacher / revenue-share beneficiary (assignment permanence is DB-032) | BR-004; DR-002 |
| **DB-050** | **Program → Revenue Distribution Policy** | anchor **Program** (DB-022); dependent Policy (DB-033) | **1:1** | the fixed split the program applies; the Policy has **no independent existence** | BR-010; DR-076 |
| **DB-051** | **Registration → Student** | anchor **Student** (DB-001, DAT-002); dependent Registration | Student **1:N** Registration | this student's enrolment obligation | BR-020; DR-022 |
| **DB-052** | **Registration → Program** | anchor **Program** (DB-022); dependent Registration | Program **1:N** Registration | enrolment of a student in this program | BR-020; DR-022 |

**Referential integrity** (that no dependent may reference a non-existent anchor) is an Integrity rule
implied by each Relationship (DAT-001 §3.1); it is stated here as a consequence, its enforcement
mechanism deferred to Phase 10.

**Anchors for later documents:** Program and Registration are themselves the anchors of the vouchers
(Receipt/Refund → DAT-004) and of the derived Teacher×Program balances (BR-018/DR-031 → DAT-005); those
relationships are homed in the dependent's document.

## 5. Authority Boundary application (what is NOT stored here)

Per DAT-001 §4, the following are **derived** or **computed** and are **never** stored attributes of a
Program, Policy, or Registration:

- the registration's **collected total / paid-to-date / outstanding** — a derived view over its receipts
  (DAT-004), measured against the Final Registration Price (DB-044/DB-045); it is specified as a
  computation in DAT-005, never a stored column;
- the per-receipt **Teacher Share / Center Share** — **computed at posting** from the policy percentage
  (round-half-up, BR-011/BR-012) and captured as the immutable split snapshot **on the voucher** (DR-006,
  DAT-004); the Policy stores only the **percentages** (DB-034/DB-035), never money;
- **Teacher entitlement / balance / debt** per Teacher×Program (BC-004; BR-018/DR-031) — derived
  revelations (BC-007 "stores nothing"), specified in DAT-005.

## 6. Conformance to DAT-001 invariants

- **DV-1 (Traceability).** Every atom cites ≥1 frozen authority; **0 orphan**.
- **DV-2 (Authority Boundary).** Every attribute is a **stored authored fact** (price, %, dates, status,
  FRP); all derived/computed quantities are excluded (§5).
- **DV-3 (Immutability).** Applied where frozen: the Teacher assignment (DB-032), the distribution %
  (DB-037), and the FRP-after-first-receipt (DB-047) are immutable; no immutability is invented for
  editable fields (e.g. dates, Open/Closed).
- **DV-6 (Relationship meaning).** DB-049…DB-052 each fix ownership + cardinality + referential meaning,
  never a bare key.
- **DV-7 (Technology neutrality).** No table/column/type/key/index/SQL; physical constructs appear only
  in negative Phase-10 disclaimers.
- **DV-8 (Representational non-creation).** No new BR/PR/DR; every atom records frozen structure.

## 7. Atom register

**DB-022…DB-052** (this document): Entities DB-022 (Program), DB-033 (Policy), DB-038 (Registration);
Attributes DB-023…DB-027, DB-034/DB-035, DB-039/DB-040; Identities DB-028, DB-041; Constraints DB-029/
DB-030, DB-036, DB-042…DB-046; Integrity rules DB-031, **DB-032** (Teacher-assignment permanence),
DB-037, DB-047/DB-048; Relationships DB-049…DB-052. Continuous numbering resumes at **DB-053** in DAT-004.

## 8. Dependencies & boundaries

- **Consumes (as frozen, modifies nothing):** DAT-001; DAT-002; BC-001/BC-002; PC-003…PC-008; DOM-002/
  DOM-004; GOV-006/011/012; P4-000.
- **Produces:** the Program, Revenue Distribution Policy, and Registration entities and their
  attribute/identity/constraint/integrity/relationship atoms.
- **Out of scope:** vouchers (DAT-004); derived balances (DAT-005); activity timeline (DAT-006); physical
  DDL / keys / indexes (Phase 10); owner-intervention policy; any new business/product/domain truth.

## 9. Self-validation

- **Second entity family, correctly ordered** — Program is anchored by the frozen Teacher and Registration
  by the frozen Student; all four relationships have both endpoints specified, so they are homed here.
- **Six-kind discipline** — each atom is exactly one kind; the Open/Closed and Active/Ended-Withdrawn
  enumerations are Constraints; the percentage split is a Constraint (=100%); the immutabilities and
  lifecycles are Integrity rules.
- **Authority Boundary honored** — only fixed authored facts stored (price, %, dates, status, FRP); the
  money shares (computed at posting), the collected total, and teacher balances are excluded as
  derived/computed (§5).
- **No invented truth** — every atom cites frozen truth; the Revenue Distribution Policy is modelled as
  the frozen named entity it is (DOM-002 §6; BR-010), not a new structure.

---

*FROZEN v1.0.0 (ADR-0064 / AUD-P4-003) — the second Phase-4 entity-specification document and the
**first** to declare Relationship atoms (DB-049…DB-052: Program→Teacher, Program→Policy,
Registration→Student, Registration→Program). Thirty-one Data Atoms (DB-022…DB-052) over the frozen
Program/Registration truth and the DAT-001 framework; introduces no new truth (DV-8). Full GOV-013
lifecycle: Discovery → Draft → Stage-3 Adversarial Self-Hardening (H1 rebutted — the
Revenue-Distribution-Policy-as-owned-entity model confirmed faithful; citations / Authority Boundary
CLEAN; one Major repaired — the Registration status enumeration atomized as Constraint DB-043) →
Constitutional Readiness Verification (4-lens Panel all READY-WITH-NITS + independent Judge **READY**, 0
Blocking / 0 Major) → editorial touch-up (two Minors: the teacher-assignment permanence atomized as
Integrity rule DB-032 and dropped from the DB-049 relationship meaning; the §6 DV-3 FRP-lock
cross-reference corrected) → Owner Approval. Amendments only via GOV-004 §5.*
