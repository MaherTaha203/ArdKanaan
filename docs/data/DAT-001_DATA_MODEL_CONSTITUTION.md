# DAT-001 — Data Model Constitution (of the Logical Data Model)

| Field | Value |
|---|---|
| Doc ID | DAT-001 |
| Title | Data Model Constitution |
| Phase | 4 (DDL Specification) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | P4-000 (governing plan); BC-000…BC-009 (frozen & locked); PC-001…PC-008 + PLP-001 (frozen); DOM-001…005 + DR-001…090 (frozen); GOV-006 (traceability), GOV-011, GOV-012, GOV-003, GOV-004 |
| Answers | "What is a Data Atom, what may become persisted truth, and how is logical data represented independently of technology?" |
| Governed by | GOV-013 — Multi-Agent Review Protocol (FROZEN v1.0.0, ADR-0061 / AUD-P4-001) |

---

> **Nature of this document.** DAT-001 is the **Constitution of the Logical Data Model** — the
> framework of Phase 4. It works at the **logical** level (Entity, Attribute, Relationship, Identity,
> Ownership, Cardinality, Referential meaning, Stored-vs-Derived), **not** at the DDL/physical level.
> It knows **nothing** of SQL, PostgreSQL, data types, indexes, or execution constraints — those are
> the physical realization of Phase 10, implemented *from* these documents, never *in* them. DAT-001
> defines the grammar of the logical model and the boundary of what may become persisted truth; it
> specifies **no** concrete entity (DAT-002+) and introduces **no** new business/product/domain truth.

## 1. Constitutional position

Phase 4 documents the product's **logical data model** as specification, consuming the three frozen
constitutions and modifying nothing:

```
Business (BC-000…009) · Product (PC + PLP-001) · Domain (DOM/DR)   ← frozen truth
        │  consumed exactly as frozen (CDC)
        ▼
Phase 4 — Logical Data Model:  DAT-001 (this constitution) → DAT-002…N (entities) → the DDL sink
        │  records structure for frozen truth; invents none; knows no SQL
        ▼
Phase 10 — Database (physical DDL, implemented *exactly* from the frozen DAT documents)
```

DAT-001 is authored **first** because the grammar of the model — and, above all, the boundary of what
may be stored — must be fixed before any entity is specified. Without it, each entity document would
re-invent what a data atom is and, fatally, the line between what may and may not become truth.

**On the name.** Phase 4 is titled *DDL Specification* because it produces the specification the
Phase-10 DDL is implemented *from*; DAT-001 is the **logical** constitution *within* that phase. There
is no tension: the phase specifies the model; this document constitutes it **logically** and
technology-neutrally, and its physical DDL realization is Phase 10 — never here.

## 2. The Constitutional Question — three axes

> **1. What is a Data Atom? · 2. What may become persisted truth (the Authority Boundary)? · 3. How is
> logical data represented independently of technology?**

These three axes are the spine of Phase 4: the **unit** (§3), the **boundary that protects truth**
(§4), and the **logical independence from technology** (§5). The invariants (§6) make them testable;
the closure criteria (§8) make Phase 4 provable.

## 3. AXIS 1 — What is a Data Atom?

**A Data Atom (`DB-NNN`) is the smallest constitutionally-ownable statement about the product's
logical data model — traceable to the frozen truth it represents, expressed independently of any
database technology.** Every DB atom is **exactly one** of **six** kinds:

| Kind | States | Owns |
|---|---|---|
| **Entity** | a thing that must be persistable | the existence of a stored subject |
| **Attribute** | a value an entity carries | one persisted **or** derived value of an entity |
| **Relationship** | a constitutional association *between* entities | **ownership**, **cardinality**, and **referential meaning** (see §3.1) |
| **Identity** | how an instance is uniquely known | primary identity and the uniqueness **of that identity** |
| **Constraint** | a rule one or more values must satisfy | a domain / range / presence rule, a **non-identity uniqueness** rule, or a **static invariant across values (including aggregates)** |
| **Integrity rule** | a rule about change over time | immutability, append-only, referential integrity, **monotonic generation** |

Every DB atom **must**: carry an ID (`DB-NNN`); **cite ≥1 frozen authority** (BR / PR / DR); for an
attribute, be **classified stored or derived** (§4); and **introduce no new truth**. A Data Atom is
**not** a table, column, type, index, or SQL statement.

*The six kinds are exhaustive and mutually exclusive for the logical model. A value-domain or
enumeration (e.g., the set of allowed operational statuses) is a **Constraint** on an Attribute, not a
seventh kind; a derived value is an **Attribute** classified live-derived (§4); a **static invariant
across several values or records** (e.g., an aggregate ceiling such as "the sum of a registration's
receipts may never exceed its final fee") is a **Constraint**, not a gap. Two discriminators keep the
kinds disjoint: (i) **uniqueness** is an **Identity** matter when it defines how an instance is known,
and a **Constraint** when it restricts a non-identity value; (ii) a rule holding at a single point in
time is a **Constraint**, while a rule governing **change over time** is an **Integrity rule**. Thus
sequential numbering decomposes cleanly: the number is an **Attribute**, its non-identity uniqueness a
**Constraint**, and its monotonic, gap-free generation an **Integrity rule**.*

### 3.1 Relationship is not a foreign key

A **Relationship** is a *constitutional association*, not a foreign key. A foreign key is one possible
**physical realization** (Phase 10); the Relationship is the *meaning* the model must preserve. Every
Relationship fixes three things:

- **Ownership** — which entity is the **anchor** and which is the **dependent** (a dependent record's
  existence and lifecycle are governed by its anchor). Ownership governs later lifecycle (cascades,
  cancellation propagation) — decided here in *meaning*, never in mechanism.
- **Cardinality** — 1:1 · 1:N · N:M: how many instances of each entity the association admits.
- **Referential meaning** — what the reference *means* (e.g., "payment toward", "membership in"), not
  merely that a pointer exists.

*(The specific ownership, cardinality, and referential meaning of any concrete association — which
entity anchors which — is DAT-002+ content, decided there against the governing frozen rule; this
constitution defines only what a Relationship atom must fix, never any particular one.)*

Relationships are their own atom kind precisely because *ownership*, *cardinality*, and *referential
meaning* are constitutional facts that a mere key cannot carry — and they become decisive when
Phase 10 must decide cascades and lifecycle.

**Relationship (meaning) vs referential integrity (enforcement).** A Relationship fixes the
*meaning* of an association; the *enforcement over time* that no reference may dangle is a separate
**Integrity rule** (referential integrity) **implied by** the Relationship. The two are distinct
atoms: the Relationship says *what the association is*; the Integrity rule says *what must always hold
about it*. Ownership within a Relationship likewise decides only the *meaning* of lifecycle
dependence; the cascade *mechanism* is Phase 10.

## 4. AXIS 2 — What may become persisted truth? *(The Authority Boundary)*

This is the **central doctrine** of Phase 4 — not one invariant among many, but the **Authority
Boundary** that protects truth itself. It answers the dangerous question **"what is *allowed* to
become persisted truth?"** — far stronger than "what is stored?":

> **Only truth may be persisted. A derived value is a *revelation* of truth (BC-007), never truth
> itself, and may never become persisted data.**

**MAY become persisted truth** (authored facts + immutable snapshots of authored acts):

- **Authored facts** — parties (teacher / student / guardian), programs, registrations, the vouchers
  (Receipt / Payment / Refund), expenses, expense returns, non-program revenue, operational statuses;
- **Immutable snapshots** frozen at the instant of an authored act — the receipt **split**
  snapshot (computed from the policy *at posting* and stored, so a later policy change never
  retro-alters a posted receipt — BC-001/BC-003), sequential voucher **numbers** (DR-090), timestamps;
- **Timeline events** — the append-only activity record (DR-019).

**MAY NEVER become persisted truth** (derived — a live view, recomputed on read):

- the **three balances** — Cash, Teacher Payables, Center Net (DR-016, BC-007);
- **Teacher Debt**, **Party Financial Standing**, **Outstanding Balance**, **Teacher Balance**.

**Why this is an Authority Boundary, not a storage rule.** You do not merely forbid storing *a
balance*; you forbid persisting **anything that is not truth**. A stored value that could ever diverge
from the facts it derives from is a second, competing source of truth (DR-018) — which the constitution
forbids on two fronts: a derived quantity **stores nothing** (BC-007, BR-070/BR-067; DR-010/DR-016),
and nothing derivable is **entered by hand** (DR-007 / F-08). The boundary therefore **guards the
integrity of truth itself**: the data model may hold facts and the immutable snapshots of past acts,
and nothing else.

**The classifying test** for any candidate value is a question of **authority**, not of mathematics:
*does a frozen constitutional authority (a BR / PR / DR) establish this value as a **truth of
record**?*

- If a frozen authority establishes the value as an **authored fact**, or **mandates that it be
  captured as an immutable snapshot at the instant of an authored act**, it is *truth* and **may be
  persisted**.
- If **no** frozen authority establishes it as truth — the value is merely a **revelation** computed
  from truths (BC-007) — it **may never be persisted**, whether its inputs are open or closed, and
  regardless of how easily or hardly it could be recomputed.

**The boundary is drawn by constitutional authority, never by derivability.** Derivability is a
*symptom*, not the criterion: two values may be equally computable yet fall on opposite sides of the
line because one is authorized as truth and the other is not. Worked cases —

- the **three balances** are revelations that a frozen authority declares *store nothing* (BC-007
  BR-067/BR-070) → never persisted;
- a **closed-set aggregate** (e.g., a sum over immutable lines) is likewise a revelation that **no**
  authority mandates be stored → never persisted; it is revealed on demand from the facts it reads;
- the **receipt split** is persisted because a frozen authority **commands** it: DR-006
  (*"each receipt voucher permanently holds the split that was applied to it; later policy changes
  never affect existing vouchers"*) makes the snapshot the mandated content of the posting act
  (BC-001 BR-014 / BC-003 BR-035) — its persistence is an act of constitutional authority, not a
  consequence of whether it could be recomputed;
- **sequential voucher numbers** (DR-090) and **timestamps** are authored/generated facts of the act,
  authorized as truth → persisted.

This is why a snapshot is truth though it looks derived — an authority mandates it — and a balance is a
revelation though it looks storable — no authority permits it.

## 5. AXIS 3 — Logical representation, independent of technology

DAT documents fix **what must be modelled and constrained**, in **domain vocabulary**, never in
physical constructs:

| Logical (Phase 4 — *what*) | Never (Phase 10 — *how*) |
|---|---|
| Entity | table |
| Attribute | column |
| Relationship (ownership · cardinality · referential meaning) | foreign key, join table, cascade clause |
| Identity | auto-increment, sequence, surrogate-key strategy |
| Value domain — *money as a whole-number amount of the base currency (no fractional / decimal part — DR-025); date; enumerated status; text* | `DECIMAL(…)`, `VARCHAR(…)`, `INTEGER`, engine storage types |
| Constraint / integrity rule as an **invariant** ("posted attributes never change") | `CHECK`, triggers, app-code |
| A derived value as a **specified computation over stored atoms** | a stored / cached column |

The logical model asserts only **entities, attributes, relationships, identity, constraints, and
integrity rules**, using domain-level value kinds — so **any** conformant technology can realize it.
No RDBMS, engine, index strategy, ORM, storage type, or normalization *mechanism* is named. Per
GOV-012, *what must be persisted* is Business/Product truth (Phase 4); *how it is built* is
Engineering (Phase 10). Logical independence is achieved **by construction**.

## 6. Invariants *(testable; a violation blocks propagation)*

- **DV-1 — Traceability.** Every DB atom cites ≥1 frozen authority (BR/PR/DR); **0 orphan**.
- **DV-2 — Authority Boundary (persistable truth).** Every attribute is classified **fact/snapshot**
  (persisted) or **live-derived revelation** (never persisted). **A value may be persisted only if a
  frozen constitutional authority establishes it as a truth of record — an authored fact, or an
  immutable snapshot that authority mandates be captured at an authored act; a value that no authority
  establishes as truth — a mere revelation of other truths — is never persisted, whether its inputs are
  open or closed.** The line is drawn by authority, not by derivability (enforces §4; a derived
  quantity *stores nothing* — BC-007 BR-070/BR-067, DR-010/DR-016/DR-018; a mandated snapshot is stored
  by authority — DR-006, BC-001/BC-003; distinct from **DV-5**, which fixes that a stored snapshot
  never changes).
- **DV-3 — Immutability.** A posted/authored record's attributes never change; a correction is a new
  fact (cancel + recreate), never an edit (BR-037/BR-040; PA-5).
- **DV-4 — Append-only timeline.** The activity timeline is insert-only — no update, no delete (DR-019).
- **DV-5 — Snapshot fixity.** A stored snapshot (split, number, timestamp) is fixed at
  creation and never recomputed or altered (BC-001/BC-003; DR-090).
- **DV-6 — Relationship meaning.** Every Relationship fixes ownership, cardinality, and referential
  meaning — never merely a key (§3.1).
- **DV-7 — Technology neutrality.** No DB atom names a physical / DDL / engine construct (enforces §5).
- **DV-8 — Representational non-creation.** No DB atom introduces or modifies a Business Rule, Product
  decision, or Domain fact.

## 7. Naming, identity & document discipline

- **Documents:** `DAT-NNN` (this constitution is DAT-001). **Atoms:** `DB-NNN`, numbered continuously
  across the phase.
- **Atom record (minimum):** ID · kind (§3) · statement · **stored/derived class** (attributes) ·
  for relationships **ownership + cardinality + referential meaning** · **citation** (≥1 frozen
  BR/PR/DR).
- **CDC:** every DAT document *Consumes only — no modification, no narrowing, no reinterpretation* of
  BC/PC/PLP/DOM. A need unmeetable without changing an upper layer is escalated as an amendment
  (GOV-004 §5), never absorbed into the model.

## 8. Closure criteria (Phase-4 exit — the analog of BX-1…6)

Phase 4 may close only when a DDL/logical traceability sink objectively demonstrates:

- **DX-1 — Completeness.** Every in-scope Business Rule is **representable**; the three balances
  (derived), the stored immutable split snapshots, and the append-only timeline are all
  expressible.
- **DX-2 — Traceability.** Every DB atom cites a frozen authority; **0 orphan**.
- **DX-3 — Authority Boundary integrity.** Every attribute correctly classified; **no derived value
  persisted**.
- **DX-4 — Relationship integrity.** Every Relationship carries ownership, cardinality, and referential
  meaning.
- **DX-5 — Immutability & append-only.** Both represented as integrity rules, not conventions.
- **DX-6 — Technology neutrality & no new truth.** No physical construct anywhere; **0** BR/PR/DR
  introduced; BC/PC/PLP/DOM consumed exactly as frozen.

## 9. Dependencies & boundaries

- **Consumes (as frozen, modifies nothing):** BC-000…BC-009; PC-001…PC-008 + PLP-001; DOM/DR;
  GOV-006/011/012; P4-000.
- **Produces:** the six-kind Data-Atom grammar (§3), the Authority Boundary (§4), the logical
  representation discipline (§5), and the invariants/closure criteria (§6, §8) that DAT-002…N and the
  DDL sink obey.
- **Out of scope:** any concrete entity/attribute/relationship (DAT-002+); physical DDL and database
  implementation (Phase 10); any RDBMS/ORM/type/engine; any new business/product/domain truth.

## 10. Self-validation

- **Three axes, one responsibility** — Data Atom (§3), Authority Boundary (§4), logical independence
  (§5); the constitutional grammar of the logical data model (§2).
- **Constitution, not DDL** — logical vocabulary only; no SQL/type/index/engine; physical realization
  deferred to Phase 10.
- **Authority Boundary is first-class** — *only truth may be persisted*; a value is persisted only when
  a frozen constitutional authority establishes it as truth (an authored fact, or a snapshot it
  mandates — DR-006/BC-001/BC-003), never merely because it is or is not derivable; a revelation
  **stores nothing** (BC-007 BR-070/BR-067; DR-010/DR-016/DR-018) and is never entered by hand
  (DR-007/F-08). The line is drawn by authority, not by mathematics.
- **Relationship is a distinct kind** — ownership + cardinality + referential meaning, not a key.
- **Upstream-immutable** — consumes BC/PC/PLP/DOM exactly as frozen; every later DB atom must cite one
  of them (DV-1); gaps escalate as amendments, never absorbed.

---

*FROZEN (v1.0.0) — the Data Model Constitution (of the logical data model), the framework of Phase 4,
authored and reviewed under **GOV-013** and built around the Owner's three axes with the Authority
Boundary elevated to constitutional first-class. Lifecycle: Architectural Discovery → Constitutional
Draft → Adversarial Self-Hardening → Readiness Verification #1 (NOT READY — integer/technology-leak,
re-derivation-criterion hole, §3.1 concrete content, citation mis-anchors) → Revision (two-part
re-derivability gate) → Readiness Verification #2 (NOT READY — the gate wrongly forbade the mandated
split; §5 "minor units" contradicted DR-025) → Revision (Authority Boundary regrounded in
**constitutional authority, not derivability**; "minor units" removed) → Readiness Verification #3
(**READY** — 6/6 Panel SOUND, 0 Blocking / 0 Major; independent Judge READY) → editorial touch-up
("allocation" → "split" per DR-034/DR-040) → Owner Approval → this freeze (ADR-0061 / AUD-P4-001). It
introduces **no** business/product/domain truth and consumes BC/PC/PLP/DOM exactly as frozen. No
further modification is permitted except through the Constitutional Amendment process (GOV-004 §5).*
