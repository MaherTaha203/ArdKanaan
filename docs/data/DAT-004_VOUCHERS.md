# DAT-004 — Vouchers (Receipt · Payment · Refund · Expense Return · Expense Category)

| Field | Value |
|---|---|
| Doc ID | DAT-004 |
| Title | Vouchers |
| Phase | 4 (DDL Specification) |
| Status | DRAFT |
| Version | 0.1.0 |
| Depends on | DAT-001 (framework); DAT-002 (Student DB-001, Teacher DB-002 — FROZEN); DAT-003 (Program DB-022, Revenue Distribution Policy DB-033, Registration DB-038 — FROZEN); P4-000; BC-003, BC-005, BC-006, BC-008 (frozen & locked); BC-007 (balances "store nothing"); PC-003…PC-008; DOM-002 (§7, §8, §13, §14, §15, §15a); DOM-004 (DR-006/015/016/017/019/021/023/024/025/026/028/030/032/034/036/037/040/041/042/043/044/045/046/047/048/049…061/074…085/090); GOV-006/011/012/013 |
| Answers | "What are the financial voucher entities — Receipt, Payment, Refund, Expense Return, Expense Category — their stored facts, relationships, identity, constraints, and lifecycle integrity, expressed as logical Data Atoms over frozen truth?" |
| Governed by | GOV-013 — Multi-Agent Review Protocol (Stage 2 — Constitutional Draft) |

---

> **Nature of this document.** DAT-004 is the third Phase-4 entity-specification document. It specifies the
> **financial voucher** cluster — the authored money-movement records — as logical Data Atoms (`DB-NNN`)
> under DAT-001: the six-kind taxonomy, the Authority Boundary (only truth may be persisted; **derived
> balances are never stored**), and technology-neutral logical representation (no table/column/type/key/
> index/SQL/Phase-10). It **introduces no new truth** — every atom cites a frozen BR/PR/DR. The load-
> bearing atom is the **immutable split snapshot** on the Receipt Voucher: a *computed* value that is
> nonetheless a **stored fact** because a frozen authority (DR-006) commands its persistence (DAT-001 §4).

## 1. Constitutional position

```
DAT-001 (framework) · DAT-002 (Student DB-001, Teacher DB-002) · DAT-003 (Program DB-022, Policy DB-033, Registration DB-038)
        │  obeyed / referenced exactly (all voucher anchors already frozen)
        ▼
DAT-004 — Vouchers:  Receipt (DB-063) · Payment (DB-078) · Refund (DB-086) · Expense Return (DB-095) · Expense Category (DB-102)
        │  stores authored voucher facts + the immutable split snapshot; declares voucher→anchor relationships
        ▼
DAT-005 (derived balances — the three balances, entitlement, debt, standings) → DAT-006 (activity timeline)
```

Every voucher anchor — Student (DB-001), Teacher (DB-002), Program (DB-022), Registration (DB-038) — is
already frozen, so every voucher relationship is **homed here**, in the dependent's document (DAT-001
§3.1). The running **balances** those vouchers move are **derived revelations** that "store nothing"
(BC-007) and belong to **DAT-005** (§5).

## 2. Scope

- **In scope:** the five authored financial-voucher entities and their attributes, identity, constraints,
  lifecycle integrity, and relationships; the shared voucher discipline (numbering · posting · immutability
  · cancellation); the **immutable split snapshot** on the Receipt Voucher.
- **Modeling decisions (architect-level, grounded in frozen truth):**
  1. **One DAT-004 for the whole voucher cluster**, including the BC-008 center-only vouchers (center-
     expense Payment Voucher, Expense Return, Expense Category, non-program revenue). Grounds: DAT-001 §4
     lists "the vouchers (Receipt / Payment / Refund), expenses, expense returns, non-program revenue" as
     **one** authored-fact set; the frozen DAT-003 §1 diagram places all vouchers in a single DAT-004
     (DAT-005 = balances, DAT-006 = timeline); BC-008 reuses BC-003 posting/immutability/numbering and
     BC-005 cancellation — the same mechanics.
  2. **Non-Program Educational Revenue is folded into the Receipt Voucher entity via a mandatory
     revenue-source attribute**, not a separate entity. Grounds: **BR-074** puts a revenue source on
     *every* receipt ("no generic or unattributed receipt exists"), and DOM-002 §15a explicitly delegates
     "the record/document structure that holds them" to the architect. The program-fee source carries the
     split snapshot and a Registration; non-program sources (exam/certificate/book) carry no split and link
     a Student (mandatory) + Program (optional). *(Alternative considered: a sibling non-program entity —
     rejected because BR-074 unifies receipts under a typed source and this mirrors the Payment-Voucher
     one-entity-two-kinds shape.)*
  3. **Payment Voucher is one entity with two kinds** — {teacher payment, center expense} — via a kind
     discriminator (DOM-002 §8 "Two kinds (V1)"); "Expense" is the center-expense *kind*, not a separate
     entity.
- **Out of scope (frozen-truth boundaries):**
  - **All running balances** — the three balances (Cash / Teacher Payables / Center Net), teacher
    entitlement / balance / outstanding, teacher debt, and party financial standing — are **derived** and
    "store nothing" (BC-007); they are specified as computations in **DAT-005** (§5).
  - **The split computation** (round-half-up teacher/center amounts, BC-001 BR-011/BR-012) — consumed, not
    re-described (DV-8); DAT-004 stores only *that* the snapshot exists (DR-006), never *how* it is computed.
  - **Cancellation / reversal ledger mechanics** — consumed from BC-005; DAT-004 stores only the Cancelled
    status + its date, mandatory reason, and actor.
  - **The activity timeline / Operations events and edit change-logs** — DAT-006.
  - **The overpayment ceiling** (sum of a registration's receipts ≤ Final Registration Price) — already
    frozen as **DB-044/DB-045** on Registration (DAT-003); referenced, never re-declared.
  - **DDL / keys / indexes / numbering scheme / go-live start numbers / storage** — Phase 10.

## 3. The atoms

Each atom is exactly one of DAT-001's six kinds, carries a `DB-NNN` id, cites ≥1 frozen authority, and (for
attributes) is classified **stored** or **derived**. Numbering continues at **DB-053** (DAT-003 closed at
DB-052).

### 3.1 Shared voucher discipline (applies to every financial voucher below)

| Atom | Kind | Statement | Cites |
|---|---|---|---|
| **DB-053** | Constraint | A financial voucher's money amount is a **whole-shekel** value — decimals/fractions are never used | DR-025; DAT-001 §5 |
| **DB-054** | Constraint | Where a voucher records a payment method, its value-domain = exactly **{cash, bank transfer}** — one method per voucher, never mixed | DR-025 |
| **DB-055** | Constraint | Each financial-voucher **type** bears an official number that is **unique and never reused or duplicated within its own independent per-type series** | DR-090 |
| **DB-056** | Constraint | A financial voucher's operational-status **value-domain = exactly {Posted, Cancelled}** | DR-043; DR-045 |
| **DB-057** | Integrity rule | **Posted-on-save** — recording a financial voucher posts it immediately (no Draft state in V1); posting is the act that gives rise to its effects | DR-043; BR-034 |
| **DB-058** | Integrity rule | **Voucher immutability** — a Posted voucher's financial attributes are never edited or deleted; correction is by **cancellation + a new voucher**, never in place; descriptive (non-financial) fields may be edited with logging | DR-044; DR-048; DAT-001 DV-3 |
| **DB-059** | Integrity rule | **Numbering generation** — each per-type series advances monotonically and gap-free and **never resets** (not yearly, not ever), from an Owner-specified go-live start | DR-026; DR-090 |
| **DB-060** | Integrity rule | **Cancellation status** — a cancelled voucher preserves the original and stores its **cancellation date, a mandatory reason, and the actor (the Owner)**; the reversal is effected through new events, its ledger mechanics consumed from BC-005 | DR-047; BC-005 BR-054; BC-005 BR-056 |
| **DB-061** | Integrity rule | **Cancellation ordering** — a voucher may not be cancelled while a later **dependent** voucher draws on it; dependents are cancelled **newest-first** (a teacher-payment or refund before the receipt/revenue it drew from; an expense-return before its expense) | DR-046; BC-005 BR-055 |
| **DB-062** | Integrity rule | **Append-only history** — every posted or cancelled voucher is an append-only event on the immutable activity timeline; corrections are new appended events, never overwrites (the timeline entity is DAT-006) | DR-019; DAT-001 DV-4 |

### 3.2 Receipt Voucher (سند قبض) — incoming money; the only voucher carrying the split snapshot

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-063** | Entity | **Receipt Voucher** — the center's permanent internal record of one incoming payment; it carries a **mandatory revenue source**, and the **program-fee** source additionally carries the immutable split snapshot | stored | BR-028; BR-029; DR-023; DOM-002 §7; BR-074; DOM-002 §15a |
| **DB-064** | Attribute | **Receipt number** — the sequential number in the independent receipt series | stored | BR-030; DR-090; DOM-002 §7 |
| **DB-065** | Attribute | **Receipt date** — the voucher's own date, fixed at posting | stored | BR-032; DR-043; DOM-002 §7 |
| **DB-066** | Attribute | **Receipt amount** — the whole-shekel amount received | stored | DR-025; BR-035; DOM-002 §7 |
| **DB-067** | Attribute | **Payment method** — the single method (cash or bank transfer) of the payment | stored | DR-025; BR-036; DOM-002 §7 |
| **DB-068** | Attribute | **Payer Name** — optional descriptive field (a parent/company/other payer); never an entity; editable with logging | stored | DR-021; BR-037; DOM-002 §7 |
| **DB-069** | Attribute | **Revenue source** — the mandatory source of the income (program fee / exam / certificate-issuance / book-material); no generic or unattributed receipt exists | stored | BR-074; BR-075; DOM-002 §15a |
| **DB-070** | Attribute | **Teacher Share** — the teacher portion of the applied split, captured as the **immutable snapshot on the voucher** at posting (program-fee source); a stored fact mandated by DR-006, **not** the running Teacher Payables balance | stored | DR-006; BR-038; DOM-002 §7; DAT-001 §4 |
| **DB-071** | Attribute | **Center Share** — the center portion of the applied split, captured as the **immutable snapshot on the voucher** at posting (program-fee source); a stored fact mandated by DR-006, **not** the running Center Net balance | stored | DR-006; BR-038; DOM-002 §7; DAT-001 §4 |
| **DB-072** | Attribute | **Receipt operational status** — Posted / Cancelled (shared value-domain, DB-056) | stored | BR-040; DR-045 |
| **DB-073** | Identity | A Receipt Voucher record denotes **one distinct incoming payment**, known by its own identity; its receipt number is unique and never reused within the receipt series (per DB-055); no natural-key uniqueness imposed (surrogate = Phase-10) | — | BR-028; DR-090; DR-026 |
| **DB-074** | Constraint | **Receipt atomicity** — a receipt records exactly one payment; a **program-fee** receipt binds exactly one Student and one Program **via that student's one Registration**; it never spans two students, two programs, or two payments | — | BR-033; BR-036; DR-023 |
| **DB-075** | Constraint | **Split conservation** — for a program-fee receipt, **Teacher Share + Center Share = receipt amount** exactly; rounding never creates an independent difference | — | DR-028; DR-006 |
| **DB-076** | Constraint | **Revenue-source-conditioned structure** — every receipt carries exactly one revenue source; a **program-fee** receipt carries the split snapshot and a Registration; a **non-program** receipt (exam/certificate/book) carries **no split** and links a **Student (mandatory) + Program (optional)** | — | BR-074; DR-081; DR-082; DOM-002 §15a |
| **DB-077** | Integrity rule | **Split-snapshot fixity** — the teacher/center split stored at posting is fixed at creation and never recomputed; a later change to any distribution policy never alters an existing receipt's stored split | — | DR-006; BR-038; DAT-001 DV-5 |

### 3.3 Payment Voucher (سند صرف) — outgoing money; one entity, two kinds

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-078** | Entity | **Payment Voucher** — the permanent record of money paid out; **one entity with two kinds**: a **teacher-payment** kind (discharging one Teacher×Program entitlement) and a **center-expense** kind (carrying one Expense Category) | stored | DOM-002 §8; BC-006 BR-058; BC-006 BR-059; DR-030; DR-049 |
| **DB-079** | Attribute | **Payment-voucher number** — the sequential number in the independent payment series | stored | DR-090; DR-026; DOM-002 §8 |
| **DB-080** | Attribute | **Payment amount** — the whole-shekel amount paid out | stored | DR-025; BC-006 BR-060; DOM-002 §8 |
| **DB-081** | Attribute | **Payment date** — the voucher's own date, fixed at posting | stored | DR-043; DOM-002 §8 |
| **DB-082** | Attribute | **Payment kind** — the discriminator {teacher payment, center expense} | stored | DOM-002 §8 |
| **DB-083** | Attribute | **Payment operational status** — Posted / Cancelled (shared value-domain, DB-056) | stored | DR-045; DOM-002 §8 |
| **DB-084** | Identity | A Payment Voucher record denotes **one distinct payout act**, known by its own number within the payment series (unique/non-reused per DB-055); surrogate = Phase-10 | — | DOM-002 §8; DR-090 |
| **DB-085** | Constraint | **Kind-conditioned structure** — kind ∈ {teacher payment, center expense}; a **teacher-payment** references exactly one Program (one Teacher×Program) and carries no expense category; a **center-expense** references exactly one Expense Category, carries no program/teacher, and never owns a revenue split | — | DOM-002 §8; DR-032; DR-051; BC-006 BR-059 |

### 3.4 Refund Voucher (سند استرجاع) — reversal of recognized revenue

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-086** | Entity | **Refund Voucher** — the permanent record of a student refund as a **reversal of recognized revenue** (never an expense, never a Payment Voucher) | stored | DOM-002 §13; BC-005 BR-049; BC-005 BR-050; DR-036; DR-041 |
| **DB-087** | Attribute | **Refund number** — the sequential number in the independent refund series | stored | BC-005 BR-050; DR-041; DR-090 |
| **DB-088** | Attribute | **Refund amount** — the whole-shekel refunded amount | stored | DR-025; DR-042; DOM-002 §13 |
| **DB-089** | Attribute | **Refund date** — the voucher's own date, fixed at posting | stored | DR-043; DOM-002 §13 |
| **DB-090** | Attribute | **Refund reason** — a **mandatory** recorded reason for the refund | stored | BC-005 BR-050; DR-042; DOM-002 §13 |
| **DB-091** | Attribute | **Refund operational status** — Posted / Cancelled (shared value-domain, DB-056) | stored | DR-045; DOM-002 §13 |
| **DB-092** | Identity | A Refund Voucher record denotes **one distinct refund act**, known by its own number within the refund series (unique/non-reused per DB-055); surrogate = Phase-10 | — | DOM-002 §13; DR-090 |
| **DB-093** | Constraint | **Refund reference** — a Refund Voucher references exactly **one Student and one Program (Student×Program)** and is **never allocated or matched to any individual Receipt Voucher or Registration** (no receipt-matching of any kind) | — | BC-005 BR-052; DR-040 |
| **DB-094** | Integrity rule | **Refund–registration independence** — posting or cancelling a refund **never** automatically changes a registration's Active/Ended-Withdrawn status, in either direction | — | BC-005 BR-053; DR-085 |

### 3.5 Expense Return (استرداد مصروف) — cash returning against a prior center expense

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-095** | Entity | **Expense Return** — the permanent record of cash returning for one specific prior **center expense**; it **reduces that expense, never income**, and never mutates the immutable original | stored | DOM-002 §15; BC-008 BR-083; BC-008 BR-085; DR-055 |
| **DB-096** | Attribute | **Expense-return number** — the sequential number in the independent expense-return series | stored | DR-090; DR-055 |
| **DB-097** | Attribute | **Expense-return amount** — the whole-shekel amount returned | stored | DR-025; DOM-002 §15 |
| **DB-098** | Attribute | **Expense-return date** — the voucher's own date, fixed at posting | stored | DR-043; DOM-002 §15 |
| **DB-099** | Attribute | **Expense-return operational status** — Posted / Cancelled (shared value-domain, DB-056) | stored | DR-045; DOM-002 §15 |
| **DB-100** | Identity | An Expense Return record denotes **one distinct return act**, known by its own number within the expense-return series (unique/non-reused per DB-055); surrogate = Phase-10 | — | DOM-002 §15; DR-090 |
| **DB-101** | Constraint | **Expense-return reference & ceiling** — references exactly one **Posted, non-cancelled center-expense Payment Voucher**; the sum of returns against one expense may **never exceed** that expense; a return never spans two expenses and never mutates the original | — | BC-008 BR-084; BC-008 BR-085; DR-057; DR-058; DR-059 |

### 3.6 Expense Category (بند المصروف) — the classification list (not a financial voucher)

| Atom | Kind | Statement | Class | Cites |
|---|---|---|---|---|
| **DB-102** | Entity | **Expense Category** — an Owner-maintained, expandable classification list; it **owns only its name** and is **not a financial voucher** (no number, no money, no balance) | stored | DOM-002 §14; BC-008 BR-079; DR-051 |
| **DB-103** | Attribute | **Category name** — the label of the expense category | stored | DOM-002 §14; DR-051 |
| **DB-104** | Identity | An Expense Category record denotes **one distinct category**, known by its name; it applies only to center-expense Payment Vouchers; surrogate = Phase-10 | — | DOM-002 §14 |
| **DB-105** | Constraint | A center-expense Payment Voucher carries **exactly one** Expense Category; the category itself holds no money, balance, or voucher (per-category spending totals are **derived**, §5) | — | DOM-002 §14; DR-051; DR-052 |

## 4. Relationships (declared here — every anchor is already frozen)

Per DAT-001 §3.1 each Relationship fixes **ownership** (anchor → dependent), **cardinality**, and
**referential meaning**; the cascade/mechanism is Phase-10. Referential integrity (no dependent references
a non-existent anchor) is the implied Integrity rule, mechanism deferred to Phase 10.

| Atom | Relationship | Ownership | Card. | Referential meaning | Cites |
|---|---|---|---|---|---|
| **DB-106** | **Receipt (program-fee) → Registration** | anchor **Registration** (DB-038); dependent Receipt | Registration **1:N** Receipt | payment toward the enrolment obligation this receipt settles (Student & Program reached via the Registration) | BR-029; BR-033; DR-023 |
| **DB-107** | **Receipt (non-program) → Student** | anchor **Student** (DB-001); dependent Receipt | Student **1:N** Receipt | the student the non-program income is tied to (**mandatory**) | BR-074; BR-076; DR-082 |
| **DB-108** | **Receipt (non-program) → Program** | anchor **Program** (DB-022); dependent Receipt | Program **1:N** Receipt | the **optional** program a non-program income relates to | BR-076; DR-082 |
| **DB-109** | **Payment (teacher-payment) → Program** | anchor **Program** (DB-022); dependent Payment | Program **1:N** Payment | settles teacher entitlement on this one Program (Teacher×Program isolation; the Teacher is reached via the frozen Program→Teacher DB-049 under DB-032) | BC-006 BR-059; DR-032; DR-034 |
| **DB-110** | **Payment (center-expense) → Expense Category** | anchor **Expense Category** (DB-102); dependent Payment | Category **1:N** Payment | classifies what this center expense was for; no program/teacher link | DR-051; DR-052 |
| **DB-111** | **Refund → Student** | anchor **Student** (DB-001); dependent Refund | Student **1:N** Refund | reversal of revenue recognized for this student | BC-005 BR-052; DR-040 |
| **DB-112** | **Refund → Program** | anchor **Program** (DB-022); dependent Refund | Program **1:N** Refund | the program whose recognized revenue is reversed (no receipt/registration link) | BC-005 BR-052; DR-037; DR-040 |
| **DB-113** | **Expense Return → Payment Voucher (center-expense kind)** | anchor the center-expense **Payment Voucher** (DB-078); dependent Expense Return | Expense **1:N** Expense Return | reduces this one prior center expense | BC-008 BR-085; DR-058; DR-059 |

**Anchors reached transitively (not re-declared):** a program-fee receipt's Student and Program are carried
by its Registration (DB-042/DB-051/DB-052), and a teacher-payment's Teacher by its Program (DB-049/DB-032);
declaring direct edges there would duplicate a truth an existing atom already fixes.

## 5. Authority Boundary application (what is NOT stored here)

Per DAT-001 §4, the following **rise and fall** as vouchers post/cancel but are **derived revelations** that
"store nothing" (BC-007) — never a stored voucher attribute; all are specified as computations in **DAT-005**:

- the **three balances** — Cash Balance, Teacher Payables, Center Net Balance (BC-007 BR-067/BR-070; DR-016/
  DR-017); the voucher's balance footprints (receipt ↑, refund/expense ↓, expense-return ↑) are **derivation
  rules read by DAT-005**, not stored here;
- **teacher entitlement / Teacher Balance / Outstanding** per Teacher×Program (BC-004; DR-015/DR-031/DR-034)
  — the payment's settled amount is stored; the Outstanding it reduces is not;
- **Teacher Debt** per Teacher×Program (BC-007 BR-069; DR-065; DOM-002 §16);
- **party financial standing** (student/teacher) and the **Account Statement** (BC-007 BR-070/BR-071;
  DOM-002 §10) — views that record nothing;
- the **registration collected-total / outstanding** (DAT-003 §5) and the **Student×Program net-paid** that
  bounds a refund (DR-037) — derived, never stored;
- **settlement readings** "Partially/Fully Settled" (BC-006 BR-062) and **per-category spending totals**
  (DR-051) — derived, never stored states;
- the **split computation** (round-half-up, BC-001 BR-011/BR-012) — consumed, not re-described (DV-8);
- the **distribution percentages** (teacher %/center %, DB-034/DB-035 on the Policy) — DAT-004 stores the
  computed money **snapshot**, never the percentages, and there is **no Receipt→Policy relationship** (the
  receipt holds only a copy — DOM-002 §7 "Never owns");
- the **overpayment ceiling** (sum of a registration's receipts ≤ Final Registration Price) — already frozen
  as **DB-044/DB-045** on Registration (DAT-003); referenced, **never re-declared**;
- **cancellation/reversal ledger mechanics** — consumed from BC-005; the **activity-timeline events** and
  descriptive-field **edit logs** — DAT-006; the **numbering scheme / go-live start numbers** and physical
  DDL/keys/indexes — Phase 10.

## 6. Conformance to DAT-001 invariants

- **DV-1 (Traceability).** Every atom cites ≥1 frozen authority; **0 orphan**.
- **DV-2 (Authority Boundary).** Only authored facts and the DR-006-mandated split snapshot are stored; every
  running balance/entitlement/debt/standing is excluded as derived (§5).
- **DV-3 (Immutability).** Posted vouchers are immutable (DB-058); descriptive-field edits are the sole
  exception (with logging); no immutability is invented for the editable descriptive fields.
- **DV-5 (Snapshot fixity).** The stored split is fixed at posting and never recomputed (DB-077).
- **DV-6 (Relationship meaning).** DB-106…DB-113 each fix ownership + cardinality + referential meaning,
  never a bare key; transitively-reachable anchors are not re-declared.
- **DV-7 (Technology neutrality).** No table/column/type/key/index/SQL; the numbering scheme, go-live start
  numbers, and surrogate keys are named only as negative Phase-10 disclaimers.
- **DV-8 (Representational non-creation).** No new BR/PR/DR; the split *computation* and the *percentages*
  are consumed, not re-described; the overpayment ceiling is referenced, not re-created.

## 7. Atom register

**DB-053…DB-113** (this document): Shared discipline DB-053…DB-062 (4 Constraints, 6 Integrity rules);
**Receipt** DB-063 (Entity), DB-064…DB-072 (Attributes), DB-073 (Identity), DB-074…DB-076 (Constraints),
DB-077 (Integrity); **Payment** DB-078 (Entity), DB-079…DB-083 (Attributes), DB-084 (Identity), DB-085
(Constraint); **Refund** DB-086 (Entity), DB-087…DB-091 (Attributes), DB-092 (Identity), DB-093
(Constraint), DB-094 (Integrity); **Expense Return** DB-095 (Entity), DB-096…DB-099 (Attributes), DB-100
(Identity), DB-101 (Constraint); **Expense Category** DB-102 (Entity), DB-103 (Attribute), DB-104
(Identity), DB-105 (Constraint); **Relationships** DB-106…DB-113. Continuous numbering resumes at **DB-114**
in DAT-005.

## 8. Dependencies & boundaries

- **Consumes (as frozen, modifies nothing):** DAT-001; DAT-002; DAT-003; BC-003/BC-005/BC-006/BC-007/BC-008;
  PC-003…PC-008; DOM-002/DOM-004; GOV-006/011/012; P4-000.
- **Produces:** the five voucher entities and their attribute/identity/constraint/integrity/relationship
  atoms, including the immutable split snapshot.
- **Out of scope:** derived balances/entitlement/debt/standing (DAT-005); activity timeline (DAT-006);
  cancellation ledger mechanics (BC-005); the split computation & percentages (consumed); physical DDL /
  keys / indexes / numbering scheme (Phase 10); any new business/product/domain truth.

## 9. Self-validation

- **Correctly ordered** — every voucher anchor (Student, Teacher, Program, Registration) is already frozen,
  so all relationships are homed here.
- **Six-kind discipline** — each atom is exactly one kind; the shared discipline factors the cross-cutting
  numbering/posting/immutability/cancellation rules once; the status and method value-domains are
  Constraints; the immutabilities and snapshot fixity are Integrity rules.
- **Authority Boundary honored** — the DR-006 split snapshot is stored *because a frozen authority commands
  it*; every running balance is excluded as derived (§5); the overpayment ceiling is referenced, not
  re-declared.
- **No invented truth** — every atom cites frozen truth; non-program revenue is folded into the frozen
  receipt concept via BR-074's mandatory revenue source; the refund is Student×Program-only (DR-040), with
  no receipt-matching invented.

---

*DRAFT (v0.1.0) — the third Phase-4 entity-specification document, authored under GOV-013 (Stage 2 —
Constitutional Draft) over the frozen voucher truth (BC-003/005/006/008) and the DAT-001 framework. 61 Data
Atoms (DB-053…DB-113) across five voucher entities; the load-bearing atoms are the immutable split snapshot
(DB-070/DB-071) and its fixity (DB-077). Not frozen; not propagated. Subject to Stage 3 (Adversarial
Self-Hardening), Constitutional Readiness Verification (Panel + Judge), the Readiness Gate, and Owner
Approval before any freeze.*
