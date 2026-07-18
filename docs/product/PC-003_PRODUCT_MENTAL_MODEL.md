# PC-003 — Product Mental Model

| Field | Value |
|---|---|
| Doc ID | PC-003 |
| Title | Product Mental Model |
| Phase | 1 (Product Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | PC-001, PC-002, P1-000, GOV-012, DOM-002 (frozen, 1:1 source), DOM-001/003/004 |
| Answers | "What does the product believe exists?" — nothing about display, navigation, storage, or implementation |

---

## 0. The Product's World

The product's world begins with a single center run by a single owner, and it never
imagines a second of either. Within it, teachers deliver training programs, and each
program is one independent offering with its own price and its own fixed split between
teacher and center. Students enter this world by **registering** in a program, and
each registration is the point where a person commits to an offering at an agreed
amount. Money appears only as **recorded facts** — receipts, payments, refunds,
expense returns, and non-program educational income — each authored by the owner and,
once recorded, permanent. From these facts the product **derives**, and never asks
anyone to state, the truths the owner cares about: three separate balances, what each
teacher is owed per program, and what a teacher must return when a refund reverses
money already paid. Some income divides by a program's policy the moment it is
received; some belongs wholly to the center and never touches a teacher. Nothing
recorded is ever erased — corrections are new facts placed beside the old ones. Every
meaningful event leaves a trace, so the sequence of what happened is always knowable.
Programs, teachers, and registrations each carry a simple open-or-closed state the
owner controls, which stops new activity without disturbing any past record. This is
the whole world the product believes in — parties, offerings, recorded facts, and the
derived truths that follow from them — and deliberately nothing beyond it.

## 1. Scope & method

This is the product's **conceptual vocabulary**: the concepts the product believes
exist, each with its meaning, single responsibility, relationships, ownership
boundary, and reason to exist. Every concept corresponds to a frozen DOM-002 concept
(or is a **necessary product abstraction** derived from it, flagged as such).
**Validation applied to every concept:** *if every screen disappeared, would this
concept still exist?* — all pass (derived concepts pass because the *knowledge* exists
independent of any rendering). Concepts that are **derived** are marked *(Reveal)* per
PP-1; they are known, never entered. *Out of scope by directive: cultural identity,
branding, and visual symbolism (later design phases).*

## 2. Concepts

### A. Context & actor

**Training Center** — *(context)*
- **Definition:** the single, implicit context all records belong to.
- **Responsibility:** be the one scope within which every fact exists.
- **Relationships:** contains every other concept; is never contained.
- **Ownership boundary:** owns *that there is exactly one context*; owns no money or record itself.
- **Reason for existing:** anchors PA-2 (Scope Singularity) — one center, never many.

**Owner** — *(actor)*
- **Definition:** the sole party whose recorded actions originate every change.
- **Responsibility:** be the origin of all recorded facts.
- **Relationships:** author of every primary record; the only actor.
- **Ownership boundary:** owns *authorship of facts*; owns no derived value.
- **Reason for existing:** anchors PP-6 (owner initiates) and PA-6 (non-authority).

### B. Parties

**Teacher**
- **Definition:** a party who delivers a program and is owed a share of its revenue.
- **Responsibility:** be the beneficiary of the teacher share and the subject of per-program balances and debts.
- **Relationships:** teaches Programs (one teacher per program); has Teacher Balances and possibly Teacher Debts; carries an Operational Status.
- **Ownership boundary:** owns *the identity of the beneficiary*; does not own the amounts (derived).
- **Reason for existing:** the split has a beneficiary (F-06/F-07); the product must know who is owed.

**Student** *(carries Guardian contact)*
- **Definition:** the party who receives training and to whom every educational revenue is tied; may carry Guardian contact information (DR-089).
- **Responsibility:** be the subject of registrations and of all money received for training.
- **Relationships:** holds Registrations in Programs; is referenced by every inflow record; has a knowable Financial Standing.
- **Ownership boundary:** owns *the identity of the paying/receiving party and its guardian contact*; does not own program price or policy.
- **Reason for existing:** money-in and standing attach to a person (ADR-0013); the Guardian exists because that person may be a minor (S12).

### C. The offering

**Training Program** — *(a single run/offering)*
- **Definition:** one independent training offering with its own teacher, price, and policy.
- **Responsibility:** be the unit to which every receipt, registration, and teacher balance attaches.
- **Relationships:** belongs to one Teacher; carries one Distribution Policy and one base price; receives Registrations and Receipts; carries an Operational Status.
- **Ownership boundary:** owns *its base price, policy assignment, teacher assignment, and lifecycle status*; owns no money.
- **Reason for existing:** the offering is the anchor of all financial relationships (ADR-0022); same-named runs are distinct.

**Revenue Distribution Policy**
- **Definition:** the fixed percentage split between teacher and center for a program.
- **Responsibility:** define how a program's receipt divides.
- **Relationships:** belongs to exactly one Program; consumed when a receipt is split.
- **Ownership boundary:** owns *the percentage*; does not own the resulting amounts and never changes within a run (DR-076).
- **Reason for existing:** every receipt must divide unambiguously (F-08).

**Registration** — *(necessary product abstraction; DR-022, DR-072–075, DR-086–087)*
- **Definition:** a student's enrolment in a program, carrying that enrolment's Final Registration Price and lifecycle status.
- **Responsibility:** hold the agreed amount due for one student in one program, and whether it is Active or Ended.
- **Relationships:** links one Student to one Program; is referenced by that student's Receipts; carries a Final Registration Price and an Operational Status.
- **Ownership boundary:** owns *the amount due and the enrolment status*; does not own payments (Receipts) or the program's base price.
- **Reason for existing:** Registration exists as an independent concept because **a commitment between two independent parties is itself a first-class thing, not a property of either.** A Student is one person across many programs, so they cannot hold any single program's price or state; a Program has one base price for all its students, so it cannot hold one student's agreed amount or standing. The obligation — *this* person, *this* offering, at *this* agreed price, in *this* state — is born only when the two meet, and must live **between** them. Forcing it into the Student would deny that terms differ per program; forcing it into the Program would deny that each student's terms and status are their own. Registration is therefore the **conceptual home of the enrolment obligation** — the point at which a relationship becomes a financial fact. *(Traces to the frozen domain: DR-022, DR-072–075, DR-086–087.)*

### D. Recorded facts (primary records — authored by the Owner)

**Receipt Voucher** *(program fee)*
- **Definition:** the permanent record of one program-fee payment, holding the split applied to it.
- **Responsibility:** record one student's one payment for one program and the shares it produced.
- **Relationships:** references one Student, one Program (hence Teacher and Policy), one Registration; drives the Three Balances and Teacher Balance.
- **Ownership boundary:** owns *the amount received and the stored split*; does not own current balances; never altered (PA-5).
- **Reason for existing:** money-in for training must be permanently and divisibly recorded (F-06/F-07).

**Payment Voucher** *(teacher payment | center expense)*
- **Definition:** the permanent record of money paid out — settling a teacher's entitlement or a center expense.
- **Responsibility:** record one outflow and what it settles.
- **Relationships:** a teacher payment references one Teacher × Program; a center expense references one Expense Category; neither is a refund.
- **Ownership boundary:** owns *the amount paid and what it settles*; does not own the resulting balance.
- **Reason for existing:** every outflow must be recorded (F-05); the two kinds settle two different things (DR-030, DR-049).

**Refund Voucher**
- **Definition:** the permanent record of a student refund — a reversal of recognized revenue.
- **Responsibility:** record that revenue was returned to a student, for one student and program.
- **Relationships:** references one Student × Program; reduces the Three Balances; recalculates entitlement and may raise a Teacher Debt.
- **Ownership boundary:** owns *the refunded amount and reason*; never edits the original receipt (PA-5).
- **Reason for existing:** returned revenue must be recorded without falsifying history (ADR-0016).

**Expense Return**
- **Definition:** the permanent record of value returning to the center because of a prior expense.
- **Responsibility:** record that a specific past expense was reduced by a return.
- **Relationships:** references exactly one prior center-expense; raises the Cash and Center Net truths.
- **Ownership boundary:** owns *the returned amount and its link to one expense*; never touches a teacher (DR-060).
- **Reason for existing:** money back for a cost is a smaller cost, and must be recorded as such (ADR-0020).

**Non-Program Educational Revenue**
- **Definition:** the permanent record of exam-fee, certificate-fee, or book/material-sale income — entirely the center's.
- **Responsibility:** record center-only educational income tied to a student.
- **Relationships:** references one Student (optionally a Program); raises Cash and Center Net only; never enters distribution.
- **Ownership boundary:** owns *the amount, its revenue source, and its student*; carries no teacher share (DR-081).
- **Reason for existing:** the center earns from services beyond program delivery (ADR-0023). *(Kin to Receipt Voucher; whether they share one record structure is a deferred architectural decision — UNK-031 — not a mental-model concern.)*

**Expense Category** — *(classifier)*
- **Definition:** the named kind an expense belongs to.
- **Responsibility:** classify each center expense as exactly one kind.
- **Relationships:** applied to center-expense Payment Vouchers only.
- **Ownership boundary:** owns *its name*; owns no money.
- **Reason for existing:** the owner needs per-kind expense knowledge (DR-051).

### E. Derived truths — *(Reveal; known, never entered)*

**The Three Balances** *(Cash / Teacher Payables / Center Net)*
- **Definition:** the three never-merged financial truths of the center.
- **Responsibility:** answer, at any moment, "what is held / owed to teachers / earned."
- **Relationships:** derived from all recorded facts; never combined.
- **Ownership boundary:** own *nothing* — pure derivations (Category C); no party sets them.
- **Reason for existing:** the owner must know these three separately without computing (ADR-0008 D5).

**Teacher Balance** *(per Teacher × Program)*
- **Definition:** what one teacher is owed for one program (value = entitlement − payments).
- **Responsibility:** answer "how much is teacher X owed on program Y."
- **Relationships:** derived per Teacher × Program; feeds Teacher Payables; independent across programs.
- **Ownership boundary:** owns nothing (Category C); distinct from Teacher Payables (aggregate) and Teacher Debt (opposite direction).
- **Reason for existing:** per-program settlement requires per-relationship knowledge (DR-031/DR-034).

**Teacher Debt** *(per Teacher × Program)*
- **Definition:** what a teacher owes the center when a refund pushed final entitlement below what was already paid.
- **Responsibility:** answer "how much must teacher X return on program Y."
- **Relationships:** derived per Teacher × Program; never merged/offset across programs; settled by repayment or same-program deduction.
- **Ownership boundary:** owns nothing (derived existence & amount, Category C); the *settlement method* is the Owner's (Category B).
- **Reason for existing:** already-paid, later-reversed money must be knowable as owed back (ADR-0021).

**Party Financial Standing** — *(derived — Reveal; DOM-002 §10, replacing the report-flavored "Account Statement")*
- **Definition:** the complete, knowable financial position of a party at any moment, derived from all of that party's recorded facts (a student's paid/refunded position; a teacher's per-program entitlement, payments, and any debt).
- **Responsibility:** make one party's full financial position knowable.
- **Relationships:** derived from that party's Receipts, Refunds, Payments, Balances, and Debts.
- **Ownership boundary:** owns nothing (Category C); how it is later listed or scoped is a Phase-3 concern (UNK-013).
- **Reason for existing:** the owner must be able to know exactly where any party stands (F-05, DR-011, DR-035) — modeled as *standing* (knowledge), never as a document. *("Standing" names a state of truth, not a produced report.)*

### F. Cross-cutting concepts

**Activity Record** *(the timeline)*
- **Definition:** the append-only, chronological knowledge of every meaningful event that happened.
- **Responsibility:** make the sequence of events permanently knowable.
- **Relationships:** every recorded fact and status change emits one; belongs to its source, never stands alone.
- **Ownership boundary:** owns *the event trace*; holds no business rule and no balance.
- **Reason for existing:** total auditability (PA-7, DR-019); distinct from Party Financial Standing (system-wide events vs one party's position).

**Operational Status** *(lifecycle)*
- **Definition:** the Owner-controlled, reversible state (open/active vs closed/ended/inactive) that Program, Teacher, and Registration each carry.
- **Responsibility:** express whether a concept accepts new business, without rewriting history.
- **Relationships:** an attribute-concept carried by Program, Teacher, and Registration; governed by one shared pattern.
- **Ownership boundary:** owns *the state and its reversibility*; changes no recorded financial fact (DR-088).
- **Reason for existing:** the product must know what is open vs closed while preserving all records (ADR-0023 S11-D9).

## 3. Traceability

| Concept | Source in DOM-002 | Why the product exposes it | Future documents affected |
|---|---|---|---|
| Training Center | §1 | The one context (PA-2) | PC-007, Phase 4 |
| Owner | §2 | The sole actor/origin (PP-6) | PC-005, PC-007 |
| Teacher | §4 | Beneficiary of the split | PC-007, Phase 2, Phase 4, Testing |
| Student (+Guardian) | §5, DR-089 | Subject of money-in & standing | PC-007, Phase 4, Testing |
| Training Program | §3 | Anchor of all financial relationships | PC-007, Phase 2, Phase 4 |
| Revenue Distribution Policy | §6 | Defines the split | PC-007, Phase 2 |
| Registration | §3/§5, DR-022/072–075/086–087 | Holds amount due + enrolment status | PC-007, Phase 2, Phase 3, Phase 4 |
| Receipt Voucher | §7 | Records divisible money-in | PC-007, Phase 2, Phase 4, Testing |
| Payment Voucher | §8 | Records outflow (payment/expense) | PC-007, Phase 2, Phase 4, Testing |
| Refund Voucher | §13 | Records revenue reversal | PC-007, Phase 2, Phase 4, Testing |
| Expense Return | §15 | Records value returned on an expense | PC-007, Phase 2, Phase 4 |
| Non-Program Educational Revenue | §15a | Records center-only income | PC-007, Phase 2, Phase 4 |
| Expense Category | §14 | Classifies expenses | PC-007, Phase 4 |
| The Three Balances | §11 | The core financial truths | PC-007, Phase 2, Phase 3, Testing |
| Teacher Balance | §12 | Per-program amount owed | PC-007, Phase 2, Testing |
| Teacher Debt | §16 | Per-program amount owed back | PC-007, Phase 2, Testing |
| Party Financial Standing | §10 | A party's full financial position | PC-007, Phase 3 (rendering), Testing |
| Activity Record | §9 | Total auditability | PC-007, Phase 2, Phase 4 |
| Operational Status | §17 | What is open vs closed | PC-007, Phase 2, Phase 3, Testing |

## 4. Mental Model Integrity Rules

These govern **every** concept; a concept violating any is rejected.

- **MMI-1 — One meaning.** Each concept has exactly one meaning and one responsibility; no two overlap (Teacher Payables ≠ Teacher Balance ≠ Teacher Debt; Activity Record ≠ Party Financial Standing; Receipt ≠ Non-Program Revenue).
- **MMI-2 — Traceability.** Every concept traces to a DOM-002 concept, or to a cited frozen rule as a **necessary abstraction** (Registration). Nothing is admitted for resonance, branding, or identity.
- **MMI-3 — Screen-independence.** Every concept survives the disappearance of all screens; if it would not, it is not a product concept.
- **MMI-4 — Derived concepts are Reveals.** The Three Balances, Teacher Balance, Teacher Debt, and Party Financial Standing are known, never authored (PA-3, PP-1, Category C).
- **MMI-5 — Records are permanent.** Recorded-fact concepts are never edited or deleted; correction is a new fact beside the old (PA-5, PP-3).
- **MMI-6 — Relationships are conceptual only.** A relationship expresses meaning-dependence — never navigation, storage, or a call.
- **MMI-7 — Language purity.** No UI, UX, visual, database, implementation, or branding term may appear in a concept's definition.
- **MMI-8 — One context, one actor.** Every concept lives within the single Center; every recorded fact originates from the single Owner (PA-2, PP-6).
- **MMI-9 — Category-classifiable.** Every decision a concept participates in is classifiable A/B/C under PC-002 (AB-1).
