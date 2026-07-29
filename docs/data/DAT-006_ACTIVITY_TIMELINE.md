# DAT-006 — Activity Timeline

| Field | Value |
|---|---|
| Doc ID | DAT-006 |
| Title | Activity Timeline |
| Phase | 4 (DDL Specification) |
| Status | DRAFT |
| Version | 0.2.0 |
| Depends on | DAT-001 (framework); DAT-002 (Teacher DB-002, teacher-status-transition pointer DB-021 — FROZEN); DAT-003 (Program DB-022, Registration DB-038 — FROZEN); DAT-004 (voucher entities + statuses + cancellation metadata DB-057…DB-059, append-only pointer DB-065 — FROZEN); DAT-005 (derived balances — FROZEN); P4-000; BC-007/BC-008; DOM-002 (§9 Operations — System Activity View; §17 Operational Status Lifecycle); DOM-004 (DR-007/018/019/020/047/048/088/090); ADR-0010; GOV-006/011/012/013 |
| Answers | "What is the append-only Activity Timeline (Operations) — the stored record of every business event, its attributes, its relationship to the originating source, its identity, and its append-only / never-a-second-source-of-truth invariants — expressed as logical Data Atoms over frozen truth?" |
| Governed by | GOV-013 — Multi-Agent Review Protocol (Stage 2 — Constitutional Draft) |

---

> **Nature of this document.** DAT-006 is the fifth and final Phase-4 entity-specification document. It
> specifies the **Activity Timeline** (Operations) — the append-only history that DAT-002/003/004/005 kept
> pointing to ("→ DAT-006"). It is a **stored append-only event-log Entity**: DAT-001 §4 lists "Timeline
> events — the append-only activity record (DR-019)" on the **MAY-be-persisted** side of the Authority
> Boundary (distinct from the balances it forbids persisting), and DV-4's *insert-only* rule presupposes
> stored rows. Its Authority Boundary is a precisely-drawn **hybrid**: each Operation **stores** only its own
> event metadata and the change-deltas homed nowhere else, and **references** — never re-authors — every
> business fact already stored on its source (DR-018: "never a second source of truth"). It introduces no
> new truth (DV-8).

## 1. Constitutional position

```
DAT-002 (Teacher · status pointer) · DAT-003 (Program · Registration) · DAT-004 (vouchers) · DAT-005 (derived balances)
        │  events happen ON these; DAT-006 records that they happened, referencing their stored facts
        ▼
DAT-006 — Activity Timeline:  Operation entity (DB-144) + event metadata + Operation→Source + append-only invariants (DB-144…DB-159)
        │  stores its own event facts; references source facts; never a second source of truth (DR-018)
        ▼
(Phase-4 DDL specification complete: DAT-001…DAT-006)
```

Every source an Operation records is already frozen (the vouchers, Program, Teacher, Registration) or is a
named system facility (Settings, Backup, System — DR-020), so the Operation→Source relationship is **homed
here**. The **balances** an event moves stay derived in DAT-005; the **voucher facts** it records stay
authoritative in DAT-004; DAT-006 references them, never re-stores them.

## 2. Scope

- **In scope:** the Activity-Timeline **Operation** entity; its stored event metadata (occurrence timestamp,
  operation type, actor, the DR-048 descriptive-edit old→new change record); its derived presentation facts
  (financial-impact flag, "what happened" descriptor); the Operation→Source relationship; identity; and the
  append-only / never-a-second-source-of-truth invariants.
- **Modeling decisions (architect-level, grounded in frozen truth):**
  1. **A stored append-only event-log entity, not a derived projection.** DAT-001 §4 enumerates timeline
     events as *persistable truth*; DV-4/DX-5 phrase append-only as an integrity rule over **stored rows**;
     and three fact-classes are recorded nowhere else — the recording-moment timestamp, the DR-048 edit
     old→new pair (the source keeps only the new value; DAT-004 routes the edit change-logs here), and the
     status-transition history (the entities store only their *current* status). DR-018's dependency "the
     view is derived — nothing is entered into it by hand" (DR-007) is reconciled as **auto-generated-and-
     stored** (a byproduct of the originating act, like sequential numbers/timestamps — DV-5), **not**
     recomputed-on-read.
  2. **Hybrid Authority Boundary — store the event's own facts, reference the source's.** An Operation stores
     only occurrence metadata + change-deltas homed nowhere else; every business fact already stored on the
     source (amount, split, cancellation date/reason/actor DB-057…DB-059, current status) is **referenced by
     the Operation→Source relationship and projected on read**, never copied — storing it would make the
     timeline a forbidden second source of truth (DR-018; DAT-001 §4).
  3. **Status transitions are recorded by the operation-type verb, not a stored from→to.** A binary status
     change (Program Open↔Closed, Teacher Active↔Inactive-Left, Registration Active↔Ended-Withdrawn) is fully
     captured by the operation type (e.g. *closed / reopened / ended / reactivated / set-inactive*) plus the
     Source reference; the prior value is implied by the verb and reconstructable from the append-only
     sequence — so DAT-006 stores **no** redundant from→to duplicating entity state. This honors the
     DAT-002 DB-021 pointer (a teacher transition *is* an append-only event) without re-storing status.
  4. **The financial-impact flag is derived.** DR-020 requires each operation be *distinguishable* by money
     effect — satisfied by a revelation fully determined by operation type/source; storing it risks a second
     source of truth (DR-018), so it is class `derived`.
- **Out of scope (frozen-truth boundaries):**
  - **The balances** (three balances, entitlement/outstanding/debt, standing) — derived, homed in DAT-005;
    the timeline records balance-affecting events but never re-authors a balance (BC-007; DR-018).
  - **Voucher business facts** (amount, split snapshot, per-type number, posting date, Posted/Cancelled
    status, cancellation date/reason/actor) — authoritative in DAT-004; referenced, never re-stored.
  - **Current operational-status values** (Teacher DB-009, Program DB-027, Registration DB-040) — stay in
    DAT-002/003; only the *fact that a transition happened* is recorded here.
  - **Settings / Backup / Restore / System event attributes** — named as sources by DR-020 and enumerated in
    the source value-domain, but their attribute-level specification is deferred (ADR-0010: "their
    specification belongs to later phases").
  - **Presentation** — periods, ordering, searchability, statement scope (UNK-013) — Phase 10 / product; and
    physical DDL / keys / indexes / sequence mechanism / log-file format — Phase 10.

## 3. The atoms

Each atom is one of DAT-001's six kinds and cites ≥1 frozen authority. Numbering continues at **DB-144**
(DAT-005 closed at DB-143).

### 3.1 The Operation entity, its attributes, and identity

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-144** | Entity | **Activity Timeline Event (Operation)** — the append-only stored record of one business event that happened inside the system; it records and displays events, holding no business authority | stored | DAT-001 §4; DR-018; DR-019; DR-020; DOM-002 §9; DAT-004 DB-065; DAT-002 DB-021 |
| **DB-145** | Attribute | **Occurrence timestamp** — the recording moment of the act; the timeline's own chronological ordering key. It is **distinct from, and never re-stores, a source's own business dates** (the voucher document date DAT-004 DB-068, the cancellation date DB-057), which stay authoritative on the source and are referenced/projected | stored | DR-019; DAT-001 §4; DOM-002 §9 |
| **DB-146** | Attribute | **Operation type** — the event's verb (e.g. *created, posted, cancelled, edited, closed, reopened, ended, reactivated, set-inactive, set-active, settings-changed, backup, restore*); the event's own kind, carried by no source; for a binary status change it records the transition (§2 decision 3) | stored | DR-020; DR-019; ADR-0010 |
| **DB-147** | Attribute | **Actor** — the party who performed the act (the Owner, the single user — F-02). Stored on the event **only where the actor is homed nowhere else** (descriptive edits DR-048, status changes, other non-voucher operations); for a **voucher cancellation** the actor is already authoritative on the voucher (DAT-004 DB-059) and is **referenced, never re-stored** | stored | DR-047; DR-048; F-02 |
| **DB-148** | Attribute | **Descriptive-edit change record** — for a DR-048 descriptive-field edit (e.g. Payer Name, notes), the edited-field identifier and its **old value → new value**; this is the **sole home** of the old value (the source retains only the new value) | stored | DR-048; DR-019; DAT-004 §5 |
| **DB-149** | Attribute | **Financial-impact flag** — whether the operation affects money (*yes / no*); a revelation fully determined by the operation type and source, not stored (avoiding a second source of truth) | derived | DR-020; ADR-0010; DAT-001 §4 |
| **DB-150** | Attribute | **"What happened" display descriptor** — re-presents the source's own facts (amount, split, party, program name, cancellation date/reason/actor) by reference so the Owner understands the row without opening the source; a projection, never a stored copy | derived | DR-020; DR-018; DOM-002 §9 |
| **DB-151** | Identity | An Operation record denotes **one distinct recorded event**, ordered by its occurrence timestamp (DB-145); no natural-key uniqueness and **no per-type sequential number** (DR-090 governs financial-voucher types only); surrogate identity = Phase-10 | — | DR-019; DR-090 (by contrast) |

### 3.2 Relationship (declared here — every source exists)

| Atom | Relationship | Ownership | Card. | Referential meaning | Cites |
|---|---|---|---|---|---|
| **DB-152** | **Operation → Source** | anchor **Source** (the originating record or system facility); dependent Operation | Source **1:N** Operation | the activity recorded **about** this source; an operation **never exists by itself** and never re-authors the source's facts | DR-020; DR-018; DAT-001 §3.1 |

The source is an already-frozen entity (a voucher, Program, Teacher, or Registration) or a named system
facility (Settings / Backup / System); the relationship is homed here because every such source exists in or
before DAT-006. Referential integrity (no Operation references a non-existent source) is the implied
Integrity rule, its mechanism deferred to Phase 10.

### 3.3 Constraints

| Atom | Statement | Cites |
|---|---|---|
| **DB-153** | **Source value-domain** — because the timeline records *everything that happened inside the system* (DR-018), an Operation's source is any originating record of the model (the frozen voucher entities of DAT-004, Training Program, Teacher, Registration) or a named system facility (Settings, Backup, System). DR-020's Phase-1A source enumeration is **illustrative** and predates the Refund Voucher, Expense Return, and Registration lifecycle; the governing authority for their inclusion is **DR-018** (on which DR-020 depends), not a reinterpretation of DR-020. An operation never exists without exactly one source | DR-018; DR-020 |
| **DB-154** | **Operation-type value-domain** — the operation type is one of a closed set of recognized event verbs (posted / cancelled / created / edited / the status-change verbs / settings-changed / backup / restore); enables the DR-020 distinguishability | DR-020; ADR-0010 |
| **DB-155** | **Financial-impact value-domain** = exactly **{affects money, does not affect money}** | DR-020; ADR-0010 |
| **DB-156** | **Never a second source of truth / no business logic** — a static Authority-Boundary invariant: the timeline originates no business rule and re-authors no source fact; every business rule belongs to the originating entity; facts already stored elsewhere are referenced, never re-stored (consistent with the DAT-005 DB-141 precedent) | DR-018; DAT-001 §4; DAT-001 DV-8 |

### 3.4 Integrity rules

| Atom | Statement | Cites |
|---|---|---|
| **DB-157** | **Append-only / insert-only** — the timeline is insert-only: no update, no delete; existing operations are never edited or deleted; history never disappears | DR-019; DAT-001 DV-4 |
| **DB-158** | **Corrections generate new operations** — a mistake is corrected by appending a **new** operation, never by editing or removing an existing event | DR-019; ADR-0010 |
| **DB-159** | **Auto-generated, never hand-entered** — an operation arises as a byproduct of the originating act, never keyed in by hand; it is auto-generated **and stored** (like sequential numbers/timestamps, DV-5), not recomputed on read (the "never hand-entered" half rests on DR-007/DR-018; the "stored, not recomputed" half on DAT-001 §4 / DV-5) | DR-007; DR-018; DAT-001 §4; DAT-001 DV-5 |

## 4. Authority Boundary application

DAT-006 sits on the **persistable** side of DAT-001 §4 (timeline events MAY be stored) but is fenced by
DR-018 ("never a second source of truth"):

- **Stored here** (recorded nowhere else): the occurrence timestamp (DB-145), operation type (DB-146), actor
  (DB-147), and the DR-048 descriptive-edit old→new change record (DB-148).
- **Referenced, never re-stored** (authoritative on the source): all voucher business facts — amount, the
  DR-006 split snapshot, per-type number, posting date, Posted/Cancelled status, cancellation date/reason/
  actor (DAT-004 DB-057…DB-059) — and the current operational-status values (DAT-002/003). The financial-
  impact flag (DB-149) and the "what happened" descriptor (DB-150) are **derived** projections of these.
- **Never here:** the running balances (DAT-005), any business rule or workflow (DR-018), and physical
  storage/sequence realization (Phase 10).

## 5. Conformance to DAT-001 invariants

- **DV-1 (Traceability).** Every atom cites ≥1 frozen authority; **0 orphan**.
- **DV-2 (Authority Boundary).** Only the event's own facts are stored (DB-145…DB-148); source-owned facts
  and the financial-impact flag are referenced/derived (DB-149/DB-150/DB-156), never re-authored.
- **DV-4 (Append-only timeline).** Insert-only, no update/delete (DB-157); corrections append (DB-158).
- **DV-6 (Relationship meaning).** DB-152 fixes ownership + cardinality + referential meaning ("about this
  source"), never a bare key.
- **DV-7 (Technology neutrality).** No table/column/type/key/index/SQL/log-file/sequence mechanism; the
  old→new pair is a logical typed value pair with a field identifier, naming no physical type.
- **DV-8 (Representational non-creation).** No new BR/PR/DR; every stored fact traces to DR-019/DR-020/
  DR-047/DR-048; status transitions are recorded via the DR-020 operation type, inventing no new stored
  status fact.

## 6. Atom register

**DB-144…DB-159** (this document): Entity DB-144; Attributes DB-145…DB-150 (stored DB-145…DB-148; derived
DB-149/DB-150); Identity DB-151; Relationship DB-152; Constraints DB-153…DB-156 (incl. DB-156, the
never-a-second-source-of-truth Authority-Boundary invariant); Integrity rules DB-157…DB-159. **DAT-006 is
the final Phase-4 entity-specification document — the DB-atom sequence completes at DB-159.**

## 7. Dependencies & boundaries

- **Consumes (as frozen, modifies nothing):** DAT-001; DAT-002; DAT-003; DAT-004; DAT-005; BC-007/BC-008;
  DOM-002/DOM-004; ADR-0010; GOV-006/011/012; P4-000.
- **Produces:** the Activity-Timeline Operation entity and its attribute/identity/relationship/constraint/
  integrity atoms — storing only the event's own facts.
- **Out of scope:** the balances (DAT-005); voucher business facts (DAT-004, referenced); current status
  values (DAT-002/003); Settings/Backup/System event attributes (deferred, ADR-0010); presentation & period
  scope (UNK-013 / Phase 10); physical DDL / keys / indexes / sequence (Phase 10); any new truth.

## 8. Self-validation

- **The final entity document** — it homes the append-only history every prior document pointed to, and
  completes the DB-atom sequence (DB-001…DB-159).
- **Stored, but not a second source of truth** — DAT-001 §4 places timeline events on the persistable side;
  DR-018 fences the entity so it stores only its own event facts and references the rest (DB-158).
- **Append-only discipline** — insert-only, corrections-append, auto-generated-not-hand-keyed (DB-156…159),
  honoring the DAT-002 DB-021 and DAT-004 DB-065 pointers.
- **No invented truth** — status transitions are recorded via the DR-020 operation type (no new stored
  status fact); the only genuinely-new stored delta, the DR-048 edit old→new, is explicitly mandated.

---

*DRAFT (v0.1.0) — the fifth and final Phase-4 entity-specification document: the append-only **Activity
Timeline** (Operations), 16 Data Atoms (DB-144…DB-159). A **stored** append-only event-log entity (DAT-001
§4 persistable side; DV-4) with a precisely-drawn hybrid Authority Boundary — it stores its own event
metadata and the DR-048 edit old→new, and **references** every source-owned fact (DR-018: never a second
source of truth). Status transitions are recorded via the operation-type verb, not a stored from→to;
the financial-impact flag is derived. Introduces no new truth (DV-8). Completes the Phase-4 DB-atom sequence
at DB-159. Stage-3 Adversarial Self-Hardening (five hypotheses) **refuted the amendment risk** — the
source-domain inclusion of Registration/Refund/Expense-Return is faithful consumption of DR-018 (on which
DR-020 depends), not an amendment (H3); repairs applied — the actor/timestamp rescoped to reference (never
re-store) the voucher's cancellation actor/date (DAT-004 DB-057/DB-059, H5), "never a second source of
truth" reclassified as a Constraint DB-156 matching DAT-005 DB-141 (H4), and citation precision on
DB-147/DB-153/DB-159 (H2). Not frozen; not propagated. Subject to Constitutional Readiness Verification
(Panel + Judge), the Readiness Gate, and Owner Approval before any freeze.*
