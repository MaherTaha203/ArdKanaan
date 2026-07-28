# DAT-002 — Party Entities (Student & Teacher)

| Field | Value |
|---|---|
| Doc ID | DAT-002 |
| Title | Party Entities (Student & Teacher) |
| Phase | 4 (DDL Specification) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | DAT-001 (Data Model Constitution — the framework); P4-000 (governing plan); BC-001…BC-009 (frozen & locked); PC-001…PC-008 + PLP-001 (frozen); DOM-002 (entities), DOM-004 (DR-001…091, incl. **DR-091** person identity, ADR-0062); GOV-006/011/012/013 |
| Answers | "What are the two anchor party entities — Student and Teacher — and their attributes, identity, constraints, and integrity, expressed as logical Data Atoms over frozen truth?" |
| Governed by | GOV-013 — Multi-Agent Review Protocol (FROZEN v1.0.0, ADR-0063 / AUD-P4-002) |

---

> **Nature of this document.** DAT-002 is the **first entity-specification document** of Phase 4 — the
> DDL analog of a single BC family. It specifies the two **authored-fact party entities**, **Student**
> and **Teacher**, as logical Data Atoms (`DB-NNN`) under the framework of **DAT-001**: the six-kind
> taxonomy (Entity · Attribute · Relationship · Identity · Constraint · Integrity rule), the Authority
> Boundary (only truth may be persisted), and technology-neutral logical representation (no table,
> column, key mechanism, type, or SQL). It **introduces no new truth** — every atom cites a frozen
> BR/PR/DR — and it specifies **no** relationship internal to the parties (a Relationship is homed in
> the dependent's document, once both entities exist).

## 1. Constitutional position

DAT-002 consumes the frozen truth exactly as frozen and records its **party structure**:

```
DAT-001 (framework: six-kind atoms · Authority Boundary · technology-neutrality)
        │  obeyed exactly
        ▼
DAT-002 — Party Entities:  Student (DB-001) · Teacher (DB-002)   ← the referential ANCHORS
        │  every downstream family (programs, registrations, vouchers, derived views, timeline)
        │  references a party specified here; nothing here references a not-yet-specified entity
        ▼
DAT-003 (programs & registrations) → DAT-004 (vouchers) → DAT-005 (derived views) → DAT-006 (timeline)
```

**Parties are specified first** because DAT-001 §3.1 makes every Relationship fix an anchor→dependent
ownership, and an anchor must exist before any dependent can reference it: Program is anchored by
Teacher (DR-002); Registration binds Student×Program (DR-022); every voucher belongs to a party;
every derived standing resolves to a party. Specifying parties first grounds all later reference atoms.

## 2. Scope

- **In scope:** two **Entity** atoms — **Student** and **Teacher** — and their intrinsic six-kind atom
  set: the person **name** (the essential identity attribute frozen by DR-091), the frozen attributes
  held on them (the Guardian contact group on the student, DR-089; the Teacher operational status,
  DR-083), their identity, their party-level constraints, and their party-level integrity.
- **Out of scope (frozen-truth boundaries, not omissions):**
  - **Guardian** is **not** an entity — it is an attribute group **on** the Student (DR-089/BR-022).
  - **Payer** is **not** an entity — it is the optional **Payer Name** attribute on the Receipt
    Voucher (DR-021/BR-021), specified in DAT-004.
  - **Owner** and **Training Center** are singletons (DOM-002 §1/§2), not part of this family.
  - The Student **Account Statement / outstanding-paid** and the **Teacher Balance / Teacher Debt** are
    **derived revelations** the Authority Boundary forbids persisting (§5); they are computations
    specified in DAT-005, never attributes here.
  - All **relationships** anchored by a party are declared in the dependent's document (§4).

## 3. The atoms

Every atom is exactly one of DAT-001's six kinds, carries a `DB-NNN` id, cites ≥1 frozen authority, and
(for attributes) is classified **stored** or **derived**. Atoms are numbered continuously across the
phase, opening at **DB-001**.

### 3.1 Student

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-001** | Entity | **Student** — the core person entity; an authored-fact party to whom registrations and receipts belong (the account statement is a *derived view* of that activity, never a stored attribute — §5) | stored | DR-021; DOM-002 §5; BC-002 BR-019/BR-020 |
| **DB-003** | Attribute | **Student name** — the name by which the individual is known; the essential identifying attribute of the person record | stored | **DR-091**; DR-021 |
| **DB-004** | Attribute | **Guardian name** — standing contact datum held on the student | stored | DR-089; BC-002 BR-022 |
| **DB-005** | Attribute | **Guardian relationship** — held on the student | stored | DR-089; BC-002 BR-022 |
| **DB-006** | Attribute | **Guardian phone** — held on the student | stored | DR-089; BC-002 BR-022 |
| **DB-007** | Attribute | **Guardian other contact means** — held on the student | stored | DR-089; BC-002 BR-022 |
| **DB-010** | Identity | A Student record denotes **one distinct real individual**; the **name** (DB-003) is its identifying attribute; **no automatic natural-key uniqueness** is imposed — distinctness is Owner-maintained (any machine identifier is a Phase-10 surrogate, never a business key) | — | **DR-091** |
| **DB-012** | Constraint | The **Guardian** contact group (DB-004…DB-007) is **optional** (presence rule — "a student *may* carry") | — | DR-089; DOM-002 §5 |
| **DB-013** | Constraint | Guardian data is **distinct** from the per-receipt **Payer Name** — standing student data vs one receipt's payer (a non-identity distinctness rule) | — | DR-089; DR-021 |
| **DB-014** | Constraint | The Student holds **no operational status** — the Active / Ended-Withdrawn lifecycle lives on the **Registration**, not the person; there is no student-level deactivation | — | DR-086; DR-088; DOM-002 §17 |
| **DB-015** | Constraint | The Student is **never a system user** and holds no financial-actor role beyond being the anchor person | — | PC-005 AX-3; DOM-002 §5 ("Never owns: any part of the revenue split"); §2 (Owner is the sole system user) |
| **DB-019** | Integrity rule | The Student person-record is a persisted authored fact whose **creation precedes payment** (a registration may exist with no payment; the person exists independent of money). *No frozen immutability governs the party record itself — DV-3 immutability governs posted vouchers, not party data; record editability is unfrozen and is not asserted here.* | — | DOM-002 §5 ("created at registration, even with no payment yet"); BC-002 BR-019; DR-022; RP-6 |

### 3.2 Teacher

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-002** | Entity | **Teacher** — the person who delivers a program and earns a share; an authored-fact party | stored | DOM-002 §4; DR-002; DR-083 |
| **DB-008** | Attribute | **Teacher name** — the name by which the individual is known; the essential identifying attribute of the person record | stored | **DR-091**; DR-002 |
| **DB-009** | Attribute | **Teacher operational status** ∈ {Active, Inactive-Left} — an Owner-controlled operational status | stored | DR-083; DR-088; DOM-002 §4/§17 |
| **DB-011** | Identity | A Teacher record denotes **one distinct real individual**; the **name** (DB-008) is its identifying attribute; **no automatic natural-key uniqueness** is imposed — distinctness is Owner-maintained (surrogate key = Phase-10) | — | **DR-091** |
| **DB-016** | Constraint | Teacher operational status **value-domain** = exactly {Active, Inactive-Left} (an enumeration is a Constraint on DB-009, not a seventh kind — DAT-001 §3) | — | DR-083; DOM-002 §17 |
| **DB-017** | Constraint | Setting a Teacher **Inactive-Left** blocks **only** the assignment of **new** programs; it gates no operation on existing entitlements/settlements | — | DR-083; DR-084 |
| **DB-018** | Constraint | The Teacher is **never a system user** and holds no permissions | — | PC-005 AX-3; DOM-002 §2; F-02 |
| **DB-020** | Integrity rule | The Teacher operational-status lifecycle is Owner-controlled, **reversible** (Inactive↔Active), **history-preserving**, blocks-only-new-business, and **never rewrites prior financial effects** | — | DR-083; DR-084; DR-088; DOM-002 §17 |
| **DB-021** | Integrity rule *(cross-cluster)* | A Teacher status transition is recorded as an **append-only** timeline event, never an in-place rewrite of history (referential to the DAT-006 Activity Timeline; DV-4) | — | DR-019; DR-020 |

### 3.3 Person-record identity — shared note

DB-003/DB-008 (name) and DB-010/DB-011 (identity) rest on **DR-091**, which freezes the name as the
essential identifying attribute and fixes that V1 imposes **no automatic de-duplication**. Consequently
DAT-002 mints **no** natural-key uniqueness Constraint and **no** descriptive field beyond the name and
the separately-frozen groups (DR-089, DR-083) — doing so would violate DV-8. The uniqueness *mechanism*
is fixed **nowhere** in Phase 4; it belongs to the Phase-10 "Never" column of DAT-001 §5 and is not
specified here.

## 4. Relationships (anchored here, declared in the dependent's document)

DAT-001 §3.1: a Relationship is fully fixable only once **both** entities exist, so each is homed in the
**dependent's** document. DAT-002 declares **no** relationship atom of its own; it establishes the
**anchors** the following later atoms will point at (ownership shown as anchor → dependent):

| Anchor (here) | Dependent (later doc) | Card. | Referential meaning | Cites |
|---|---|---|---|---|
| Student | Registration (DAT-003) | 1:N | the enrolment obligation of this student | DR-022; BR-020 |
| Student | Receipt Voucher (DAT-004) | 1:N | money received from / for this student | DR-023; DOM-002 §7 |
| Student | Non-Program Revenue (DAT-004) | 1:N | non-program income for this student (program link optional) | DR-082; BC-008 |
| Teacher | Training Program (DAT-003) | 1:N | the program's teacher / share beneficiary | DR-002; F-06 |
| Teacher *(via Teacher × Program)* | Payment Voucher (DAT-004) | 1:N | settlement of the teacher entitlement for this program | DR-030; DR-032 |

The party anchored here is the **Teacher** (DB-002); the *× Program* qualifier is a forward-reference to
the **Teacher × Program** relationship (DR-031) — the isolation unit that *carries* the derived Teacher
Balance/Debt, **never** modelled as stored balance columns (§5), and fixed in DAT-005.

## 5. Authority Boundary application (what is NOT an attribute here)

Per DAT-001 §4, the following **look** like party attributes but are **derived revelations** a frozen
authority forbids persisting — they are **never** stored columns on Student/Teacher and are specified as
computations in DAT-005:

- the Student **Account Statement** and **outstanding / paid-to-date** (DR-011; DR-007; BC-007);
- the **Teacher Balance / Outstanding Entitlement** and **Teacher Debt** — the on-point derived-standing
  rules are **BC-007 BR-068** (Teacher Balance revealed per Teacher×Program, derived) and **BR-069**
  (Teacher Debt standing, derived, never offset), under **BR-072** (full derivability) and BR-070 ("It
  stores nothing"); the underlying entitlement/debt truths are BC-004 BR-041/BR-046 (DR-009/DR-031/
  DR-065).

## 6. Conformance to DAT-001 invariants

- **DV-1 (Traceability).** Every atom above cites ≥1 frozen authority; **0 orphan**.
- **DV-2 (Authority Boundary).** Every attribute is classified; all are **stored authored facts**; the
  derived party quantities are excluded (§5), never persisted.
- **DV-3 (Immutability).** Not asserted on party records (DV-3 governs posted vouchers); no immutability
  claim is invented for editable party data (DB-019 note).
- **DV-4 (Append-only timeline).** DB-021 routes status transitions to the append-only timeline.
- **DV-6 (Relationship meaning).** No relationship atom is declared here; anchors are listed for the
  dependent docs (§4), each with ownership + cardinality + referential meaning.
- **DV-7 (Technology neutrality).** No table, column, key mechanism, type, index, or SQL is named.
- **DV-8 (Representational non-creation).** No new BR/PR/DR; the sole prior gap (person identity) was
  closed at the Domain layer by **DR-091** (ADR-0062), not invented here.

## 7. Atom register

**DB-001…DB-021** (this document): Entities DB-001, DB-002; Attributes DB-003…DB-009; Identities
DB-010, DB-011; Constraints DB-012…DB-018; Integrity rules DB-019…DB-021. Continuous numbering resumes
at **DB-022** in DAT-003.

## 8. Dependencies & boundaries

- **Consumes (as frozen, modifies nothing):** DAT-001; DOM-002/DOM-004 (incl. DR-091); BC-001…BC-009;
  PC-001…PC-008 + PLP-001; GOV-006/011/012; P4-000.
- **Produces:** the two anchor Entity atoms and their attribute/identity/constraint/integrity atoms that
  DAT-003…N and the DDL sink reference.
- **Out of scope:** Guardian/Payer as entities; any concrete relationship atom (homed downstream);
  derived party quantities (DAT-005); the activity-timeline entity (DAT-006); physical DDL (Phase 10);
  any new business/product/domain truth.

## 9. Self-validation

- **First entity family, correctly the anchor** — Student & Teacher; every later family references a
  party specified here, and nothing here forward-references an unspecified entity.
- **Six-kind discipline** — each atom is exactly one kind; the status enumeration is a Constraint, not a
  new kind; sequential-number/monotonicity concerns do not arise for parties.
- **Authority Boundary honored** — statements, balances, debt are excluded as derived (§5); only
  authored facts are stored.
- **No invented truth** — every atom cites frozen truth; the person-identity authority is DR-091, frozen
  by amendment before this document was drafted.

---

*FROZEN (v1.0.0) — the first Phase-4 entity-specification document, authored and reviewed under
**GOV-013** over the frozen party truth and the DAT-001 framework, resumed from the DR-091 amendment
(ADR-0062) that froze the person-record identity authority. Lifecycle: Architectural Discovery →
Constitutional Draft → Stage-3 Adversarial Self-Hardening (Authority Boundary, DV-8 non-invention, and
six-kind classification/completeness all CLEAN; three citation-precision repairs) → Constitutional
Readiness Verification (**6/6 Panel SOUND, 0 Blocking / 0 Major**; the Prosecutor's UNSOUND case failed;
independent Judge **READY**) → editorial touch-up (§5 cites the on-point BC-007 BR-068/BR-069/BR-072;
Guardian citations normalized; §3.3 and the DB-001 descriptor clarified) → Owner Approval → this freeze
(ADR-0063 / AUD-P4-002). It introduces **no** new business/product/domain truth (the person-identity
authority was frozen upstream as DR-091), consumes BC/PC/PLP/DOM exactly as frozen, and declares no
relationship of its own. No further modification is permitted except through the Constitutional
Amendment process (GOV-004 §5).*
