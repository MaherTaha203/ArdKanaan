# DAT-005 — Derived Balances

| Field | Value |
|---|---|
| Doc ID | DAT-005 |
| Title | Derived Balances |
| Phase | 4 (DDL Specification) |
| Status | DRAFT |
| Version | 0.2.0 |
| Depends on | DAT-001 (framework); DAT-002 (Student DB-001, Teacher DB-002 — FROZEN); DAT-003 (Program DB-022, Registration DB-038, FRP DB-039 — FROZEN); DAT-004 (voucher stored facts — FROZEN); P4-000; BC-004, BC-006, BC-007 (frozen & locked); DOM-002 (§10 Account Statement, §11 The Three Balances, §12 Teacher Balance, §15a Non-Program Revenue, §16 Teacher Debt); DOM-004 (DR-009/010/011/012/015/016/017/024/028/030/031/034/036/037/042/052/060/062/063/064/065/067/068/069/081); GOV-006/011/012/013 |
| Answers | "What are the derived financial quantities — the three balances, teacher entitlement/outstanding/debt, registration and Student×Program readings — expressed as logical derivation bases over the frozen stored voucher facts, together with their invariants, while storing nothing?" |
| Governed by | GOV-013 — Multi-Agent Review Protocol (Stage 2 — Constitutional Draft) |

---

> **Nature of this document.** DAT-005 is the fourth Phase-4 entity-specification document, and a *mirror*
> of the others: where DAT-002/003/004 fixed **stored** facts, DAT-005 specifies the quantities those
> documents deliberately **excluded** as "store nothing" (BC-007). It **stores nothing** — every atom is a
> **derived** revelation recomputed on read, or an **invariant** it must satisfy. It creates **no Entity, no
> Relationship, no Identity, and no stored Attribute**; each derived Attribute is anchored to an
> already-frozen subject. It introduces no new truth (DV-8): every derived quantity is one BC-004/006/007
> already establishes, re-expressed as a data-layer derivation basis over DAT-004's stored voucher facts.

## 1. Constitutional position

```
DAT-002 (Student · Teacher) · DAT-003 (Program · Registration · FRP) · DAT-004 (voucher stored facts + split snapshot)
        │  read as frozen inputs (aggregated, never re-run)
        ▼
DAT-005 — Derived Balances:  three balances (DB-118…DB-120) · teacher entitlement/outstanding/debt (DB-121…DB-124) · registration & Student×Program readings (DB-125…DB-127) + invariants (DB-128…DB-143)
        │  reveals; stores nothing (BC-007)
        ▼
DAT-006 (activity timeline)
```

Every input is already frozen (DAT-004's posted receipt amounts and split snapshots, payment amounts,
refund amounts, expense-return amounts, and Posted/Cancelled statuses; DAT-003's Final Registration Price).
DAT-005 **aggregates** those stored facts; it never re-runs the split computation (BC-001 BR-011/BR-012,
consumed) and persists nothing.

## 2. Scope

- **In scope:** the derivation basis of every frozen derived financial quantity (the three balances,
  teacher entitlement/outstanding/debt per Teacher×Program, the settlement-lifecycle reading, and the
  registration / Student×Program readings) and the invariants they must satisfy.
- **Modeling decisions (architect-level, grounded in frozen truth):**
  1. **DAT-005 stores nothing and creates no new subject** (BC-007 BR-067/BR-070; DAT-001 §4 / DV-2). The
     six-kind taxonomy has no "balance" or "view" kind: a derived value is an **Attribute classed
     `derived`** (DAT-001 §3/§4), a static invariant across aggregates is a **Constraint**, and a
     change-over-time / read-only doctrine is an **Integrity rule**. So DAT-005 uses exactly those three
     kinds — **zero Entities/Relationships/Identities/stored Attributes**.
  2. **Each derived Attribute is anchored to an already-frozen subject** (an Attribute must belong to an
     entity, DAT-001 §3). The three center-level balances attach to the **frozen Training-Center singleton**
     (DOM-002 §1/§2 — referenced, never re-created as a stored entity, which would be a forbidden second
     source of truth); the teacher quantities attach to the **Teacher×Program** pairing realized by
     the frozen Program (DB-022) under its permanent Program→Teacher relationship (DAT-003 DB-049/DB-032,
     Teacher DB-002); the registration readings to the frozen Registration (DB-038); Student×Program
     Net-Paid to the frozen Student (DB-001) at Student×Program scope. *(A stored balance would be a
     forbidden second source of truth — center balances are derived, never maintained by hand (DR-010),
     as are the teacher-side balances (DR-009).)*
  3. **Party Financial Standing and the Account Statement are NOT modeled as Attributes or Entities.** The
     statement is frozen as a view that "records nothing" and is "not an entity" (DOM-002 §10 / BC-007
     BR-071); a standing is a multi-value composite, not the single value an Attribute owns. Both are
     captured by one read-only/records-nothing **Integrity rule** (DB-143) that assembles the
     already-declared derived Attributes without re-declaring their values (avoiding a DV-8 duplication).
  4. **Teacher Debt is derived per its frozen definition; its discharge *record* is out of scope.** Teacher
     Debt is revealed as `max(0, Total Teacher Settlements − Final Teacher Entitlement)` per Teacher×Program
     (BC-004 BR-046; DR-065) — fully derivable from stored facts. Its two discharge paths (DR-068) resolve
     without any new stored input on the derivation side: same-program **future-entitlement deduction**
     self-derives as entitlement accrues, and **direct repayment** is, per the frozen UNK-026 resolution,
     "a deferred design decision, not a domain unknown" — so DAT-005 fixes no repayment record and treats it
     as a future derivation input, consistent with BC-004's stance that debt is a derived balance.
- **Out of scope (frozen-truth boundaries):**
  - **Persistence of any kind** — no stored column, cached value, or hand-entered figure; aggregation is a
    mechanism of revelation, never a source of truth (BR-067/BR-070; DR-010; DR-009).
  - **The split computation** (round-half-up teacher/center amounts, BC-001 BR-011/BR-012) — consumed;
    DAT-005 aggregates the stored share snapshots (DB-073/DB-074), it does not re-run the split. *(The one
    place a stored policy percentage is read is the **refund** teacher/center reduction — DR-062 applies "the
    original program teacher percentage" (DB-034/DB-035) to the refunded amount, rounded per DR-063; this is
    reading a stored policy fact for a refund reversal, not re-deriving the consumed receipt split.)*
  - **The teacher-debt discharge / repayment record** (deferred design decision, UNK-026 resolution;
    BC-006 BR-064) and general share-deduction models (UNK-021, Owner-postponed).
  - **The activity timeline** (DAT-006), **statement scope/period** (UNK-013 — a presentation concern), and
    physical DDL / materialization / indexes — Phase 10.

## 3. The atoms

Each atom is one of DAT-001's six kinds and cites ≥1 frozen authority. Numbering continues at **DB-118**
(DAT-004 closed at DB-117).

### 3.1 Derived quantities (Attributes, class = **derived** — a live view, recomputed on read, stored nowhere)

| Atom | Anchor | Statement (derivation basis over DAT-004 stored facts) | Cites |
|---|---|---|---|
| **DB-118** | Center | **Cash Balance** — all cash currently held = Σ posted receipt amounts (DB-069) − Σ posted payment amounts (DB-084, both kinds) − Σ posted refund amounts (DB-092) + Σ posted expense-return amounts (DB-101); cancelled vouchers contribute nothing | DR-010; DR-016; DR-017; DR-042; DR-060; DOM-002 §11a |
| **DB-119** | Center | **Teacher Payables** — money currently owed to teachers, the aggregate of all Teacher×Program balances = Σ teacher-share snapshots (DB-073) of posted program-fee receipts − Σ posted teacher-payment amounts (DB-084/DB-086) − teacher portion of refunds (unpaid case), floored at zero | DR-015; DR-016; DR-031; DR-030; DR-034; DR-042; DR-062; DR-064; DOM-002 §11b |
| **DB-120** | Center | **Center Net Balance** — the center's own earned share = Σ center-share snapshots (DB-074) of posted program-fee receipts **+ Σ posted non-program receipt amounts (DB-069 where revenue source DB-072 ≠ program fee, per DB-077/DB-080 — non-program income is entirely center revenue)** − center portion of posted refunds (DB-092) − Σ posted center-expense amounts (DB-084) + Σ posted expense-return amounts (DB-101); never includes any teacher share | DR-016; DR-017; DR-042; DR-052; DR-060; DR-012; DR-081; DOM-002 §11c; DOM-002 §15a |
| **DB-121** | Teacher×Program | **Total Teacher Entitlement** — cumulative Σ teacher-share snapshots (DB-073) of that program's posted program-fee receipts, reduced by each refund's original-percentage recalculation (DR-062/DR-063), floored at zero; accrues at posting, per Teacher×Program only | DR-015; DR-062; DR-063; DR-064; BC-004 BR-041; DOM-002 §12 |
| **DB-122** | Teacher×Program | **Teacher Outstanding (Teacher Balance)** = `max(0, Total Teacher Entitlement (DB-121) − Total Teacher Settlements)` (settlements = Σ posted teacher-payment amounts DB-084 scoped to the program via DB-113); a single per-program subtraction, no receipt allocation; any below-zero excess surfaces as **Teacher Debt (DB-123)**, never as negative Outstanding | DR-034; BC-006 BR-060; BC-006 BR-061; BC-007 BR-068; DOM-002 §12 |
| **DB-123** | Teacher×Program | **Teacher Debt** = `max(0, Total Teacher Settlements − Final Teacher Entitlement)` per Teacher×Program — revealed only when settlements exceed the final (post-refund) entitlement; the excess is the debt | BC-004 BR-046; DR-065; DOM-002 §16 |
| **DB-124** | Teacher×Program | **Settlement-lifecycle reading** — "Partially Settled" when Outstanding (DB-122) > 0, "Fully Settled" when Outstanding = 0; a derived reading of Outstanding, never an authored state | BC-006 BR-062 |
| **DB-125** | Registration | **Registration Collected-Total** (paid-to-date) = Σ amounts (DB-069) of that registration's posted, non-cancelled program-fee receipts (via DB-110); excludes non-program and cancelled receipts | DR-024; DAT-004 DB-110; DAT-003 §5 |
| **DB-126** | Registration | **Registration Outstanding** = Final Registration Price (DB-039) − Registration Collected-Total (DB-125); the FRP is the sole amount-due reference (DB-045), not `base − discount` | DR-024; DAT-003 §5 |
| **DB-127** | Student×Program | **Student×Program Net-Paid** = Σ posted program-fee receipt amounts (DB-069) − Σ posted refund amounts (DB-092) for that Student×Program (receipts scoped via DB-110/the Registration; refunds scoped via DB-115/DB-116); recalculated after every refund; the quantity a refund is bounded by (also the "Program Revenue" of DR-037 viewed at Student×Program scope) | DR-036; DR-037; DR-040 |

### 3.2 Invariants (Constraints — static invariants every revealed value must satisfy)

| Atom | Statement | Cites |
|---|---|---|
| **DB-128** | **Three balances never merged** — Cash, Teacher Payables, and Center Net are three separate revealed values, never merged into one figure in any view; separation is absolute | DR-016; BC-007 BR-067; BC-007 INV-33 |
| **DB-129** | **Value conservation (receipt split and refund reversal)** — for each posted program-fee receipt, Teacher Share (DB-073) + Center Share (DB-074) = receipt amount (DB-069) exactly; and for each refund's entitlement reduction, the teacher portion + center portion sum exactly to the refunded amount; rounding never creates an independent difference | DR-028; DR-063; DAT-004 DB-079; BC-004 BR-044; BC-007 INV-35 |
| **DB-130** | **Teacher Payables non-negativity** — the teacher-portion refund reduction floors at zero; Payables is never driven negative — the already-paid case raises a Teacher Debt instead | DR-038; DR-062; DR-064; DR-039; DR-065 |
| **DB-131** | **Held-not-owned separation** — the portion of Cash Balance matching Teacher Payables is cash the center holds but never owns; Center Net never includes any teacher share | DR-012; DOM-002 §11a; DOM-002 §11c |
| **DB-132** | **Teacher×Program isolation** — entitlement, outstanding, and debt are computed and revealed per Teacher×Program and **never merged or offset across programs**, even for the same teacher; no cross-program deduction is ever a settlement path | DR-031; DR-066; BC-004 BR-047; BC-007 BR-069 |
| **DB-133** | **Entitlement zero-floor** — unpaid entitlement never displays negative; it floors at zero; a would-be negative is the signal that a Teacher Debt arises, never a negative entitlement | BC-004 BR-045; DR-064; BC-004 INV-17 |
| **DB-134** | **Outstanding definitional invariant & non-negativity** — Outstanding = Total Entitlement − Total Settlements; it stays in [0, Total Entitlement]; no settlement exceeds Outstanding (advances forbidden), and every settlement leaves Total Entitlement unchanged | BC-006 BR-060; BC-006 BR-061; DR-033; DR-034 |
| **DB-135** | **Teacher Debt definitional invariant** — Teacher Debt is exactly the excess of total settlement over final entitlement, recognized only when positive | BC-004 BR-046; DR-065; BC-004 INV-18 |
| **DB-136** | **Teacher Debt bounded & closed at zero** — a finite balance in the range **[0, original]**; never negative, and closed (settled) at zero (the change-over-time discharge lifecycle is the Integrity rule DB-142) | BC-004 BR-048; DR-067; BC-004 INV-19 |
| **DB-137** | **Registration overpayment ceiling honored** — Collected-Total never exceeds the Final Registration Price and Registration Outstanding is never negative; this reading honors the frozen ceiling (DAT-003 DB-044), referenced not re-declared | DAT-003 DB-044; DR-024 |
| **DB-138** | **Refund ceiling** — a refund can never exceed the Student×Program Net-Paid (DB-127); a reversal is bounded by previously recognized revenue | DR-036; DR-037 |
| **DB-139** | **Posted-only derivation scope** — every sum aggregates only **Posted, non-cancelled** vouchers (DAT-004 statuses DB-056/DB-075/DB-087/DB-095/DB-103); a cancelled settlement restores the pre-settlement Outstanding/Debt without a new obligation | BC-006 BR-066 |
| **DB-140** | **Full derivability / traceability** — every revealed value is fully decomposable to its constitutional components (the posted vouchers and their stored amounts/snapshots); a value that cannot be fully derived is not revealed | BC-007 BR-072; DR-035; BC-007 INV-31 |
| **DB-141** | **Authority-Boundary conformance (stores nothing)** — none of these quantities may ever become persisted truth; each is a live revelation recomputed on read, never a stored/cached/hand-entered value; aggregation reveals, it never authors | DAT-001 §4; BC-007 BR-067; BC-007 BR-070; DR-010; DR-009 |

### 3.3 Integrity rules (change-over-time / read-only doctrines)

| Atom | Statement | Cites |
|---|---|---|
| **DB-142** | **Teacher Debt non-expiry** — a recognized debt has no expiry; elapsed time never reduces or writes it off; it stays open until actually settled | BC-004 BR-048; DR-069 |
| **DB-143** | **Read-only revelation / statement records nothing** — producing any balance view, Party Financial Standing, or Account Statement creates/modifies/reverses/discharges no truth and writes nothing, needs no input the records do not already contain, and preserves every frozen separation; the Account Statement and a standing are **views, not entities** (they assemble DB-118…DB-127 without re-declaring them) | BC-007 BR-071; BC-007 BR-073; DR-011; DOM-002 §10 |

## 4. Authority Boundary — the whole document lives on the "revelation, never truth" side

DAT-005 is the concrete expression of DAT-001 §4's Authority Boundary: it specifies the quantities the
constitution names as **MAY NEVER become persisted truth**. Accordingly:

- **Nothing here is stored.** DB-118…DB-127 are derived Attributes (class `derived`); DB-128…DB-143 are
  invariants over them. No Entity is created — the anchors (Training-Center singleton, Teacher×Program,
  Registration, Student×Program) are already frozen; a stored balance would be a forbidden second source of
  truth — the center balances are derived, never maintained by hand (DR-010), as are the teacher-side
  balances (DR-009).
- **The stored inputs are DAT-004's** (posted amounts + the DR-006 split snapshots) **and DAT-003's** (the
  Final Registration Price). DAT-005 reads and sums them; it re-runs no computation the frozen layer already
  performed and snapshotted.
- **Deferred inputs are not invented:** the teacher-debt discharge / direct-repayment record is a deferred
  design decision (UNK-026 resolution; BC-006 BR-064) — DAT-005 fixes no such record and derives the debt
  exactly as BC-004 BR-046 defines it.

## 5. Conformance to DAT-001 invariants

- **DV-1 (Traceability).** Every atom cites ≥1 frozen authority; **0 orphan**.
- **DV-2 (Authority Boundary).** **Nothing is persisted** — every DB-118…DB-127 Attribute is `derived`; the
  document creates no stored subject (DB-141).
- **DV-6 (Relationship meaning).** No Relationship is declared (none is needed — derived Attributes anchor to
  frozen subjects; the frozen relationships DB-049/DB-110/DB-113/DB-115/DB-116 are *read*, not re-declared).
- **DV-7 (Technology neutrality).** No table/column/type/key/index/SQL/materialized-view; "recomputed on
  read" is a logical property, not a storage instruction.
- **DV-8 (Representational non-creation).** No new BR/PR/DR; each quantity is one BC-004/006/007 already
  establishes, re-expressed as a derivation basis + invariant; the split computation and (except the refund
  recalculation) the distribution percentages are consumed, not re-derived.

## 6. Atom register

**DB-118…DB-143** (this document): Derived Attributes DB-118…DB-127 (three balances DB-118…DB-120;
teacher entitlement/outstanding/debt/lifecycle DB-121…DB-124; registration & Student×Program readings
DB-125…DB-127); Constraints DB-128…DB-141; Integrity rules DB-142/DB-143. **Zero** Entities, Relationships,
Identities, and stored Attributes. Continuous numbering resumes at **DB-144** in DAT-006.

## 7. Dependencies & boundaries

- **Consumes (as frozen, modifies nothing):** DAT-001; DAT-002; DAT-003; DAT-004; BC-004/BC-006/BC-007;
  DOM-002/DOM-004; GOV-006/011/012; P4-000.
- **Produces:** the derivation basis and invariants of every frozen derived financial quantity — storing
  nothing.
- **Out of scope:** all persistence; the split computation & (non-refund) percentages (consumed); the
  teacher-debt discharge record (deferred, UNK-026); statement scope/period (UNK-013); the activity timeline
  (DAT-006); physical DDL / materialization / indexes (Phase 10); any new business/product/domain truth.

## 8. Self-validation

- **The mirror document** — it specifies exactly what DAT-002/003/004 excluded as "store nothing," and
  itself stores nothing (DB-141).
- **Three kinds only** — derived Attributes, invariant Constraints, read-only Integrity rules; no Entity /
  Relationship / Identity / stored Attribute is created.
- **Full derivability** — every revealed value decomposes to posted DAT-004 vouchers and DAT-003's FRP
  (DB-140); the Teacher×Program isolation, non-negativity, never-merged, and conservation invariants are all
  homed (DB-128…DB-139).
- **No invented truth** — every atom cites frozen truth; the debt is derived per BR-046, its discharge
  record honestly left to the deferred design decision it already is (UNK-026).

---

*DRAFT (v0.2.0) — the fourth Phase-4 entity-specification document and the *mirror* of the stored-fact
documents: 26 Data Atoms (DB-118…DB-143) — 10 derived Attributes, 14 invariant Constraints, 2 Integrity
rules — specifying the derivation basis of every frozen derived financial quantity while **storing nothing**
(BC-007). Zero Entities/Relationships/Identities/stored Attributes. Introduces no new truth (DV-8). Stage-3
Adversarial Self-Hardening (five hypotheses) confirmed the "stores nothing" model and every derivation basis
sound (H2 CLEAN) and the teacher-debt derivability + deferred-discharge treatment faithful (H3); repairs
applied — the **Blocking** Center-Net omission of non-program revenue fixed (DB-120 + DR-081/§15a), the
DR-018→DR-010/DR-009 balance-persistence citation corrected (DB-141/§2/§4), the Teacher-Outstanding
zero-floor added (DB-122), a refund-reversal conservation invariant homed (DB-129), and citation-precision
repairs (DB-119/DB-125/DB-127/DB-136). Not frozen; not propagated. Subject to Constitutional Readiness
Verification (Panel + Judge), the Readiness Gate, and Owner Approval before any freeze.*
