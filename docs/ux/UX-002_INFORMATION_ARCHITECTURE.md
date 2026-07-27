# UX-002 — Information Architecture

| Field | Value |
|---|---|
| Doc ID | UX-002 |
| Title | Information Architecture |
| Phase | 3 (UX Constitution) |
| Status | FROZEN |
| Version | 1.1.0 |
| Depends on | UX-001 (frozen — philosophy & invariants); PC-003 (frozen — Product Mental Model, **consumed only**); **DOM-004 DR-018/DR-020 via the BC-009 §7 / §9 BX-6 delegation to UX** (IA-08); via UX-001: BC-000…BC-009, PC-001…008, DOM, GOV-012 |
| Answers | "How is information organized from the Owner's perspective so that the Owner can understand it, locate it, and navigate through it?" |

---

> **Nature of this document.** UX-002 is the **first structural document** of Phase 3. It fixes the
> **Information Architecture (IA)** — the organizing structure through which the frozen product
> concepts become perceivable, locatable, and traversable by one Owner. It **consumes PC-003 and
> never redefines, interprets, expands, corrects, or replaces it.** Its purpose is to **organize
> information from the Owner's perspective, not to rebuild the product's model.** It defines **no**
> screen, workspace, menu, navigation component, layout, form, interaction, visual language, or
> accessibility rule — those belong to later documents.

## 1. Purpose & consumption

PC-003 fixes **what the product believes exists** — 19 concepts, their meanings and relationships.
It says nothing about how those concepts are *found* or *moved through*. UX-002 answers exactly one
question: **how that frozen world is organized so one Owner can understand it, locate any part of
it, and navigate between its parts.**

- **Consumes PC-003 as its primary source.** Every domain, grouping, hierarchy, and relationship
  below is *derived from* a PC-003 concept and cites it — with a **single explicit exception, IA-08
  (The Activity View)**, which additionally consumes **DOM-004 DR-018/DR-020** under the **BC-009 §7 /
  §9 BX-6** delegation of those rules to the UX layer. PC-003 is **never** redefined, reinterpreted,
  expanded, corrected, or replaced (UX-001 §2; MMI integrity untouched).
- **Owner's perspective, not the product's model.** UX-002 does not restate what a Program or a
  Teacher *is*; it fixes how the Owner *reaches and traverses* them. The concepts remain PC-003's;
  only their **organization for perception** is fixed here.
- **Governed by UX-001.** Every structural decision obeys UX-001's invariants — especially UXV-01
  (creates no behavior), UXV-03 (reveals, never computes), and UXV-04 (organization never alters a
  truth).

## 2. Information domains *(the areas of information)* — IA-01, IA-02

An **information domain** is an *area of information* the Owner works within — the territory of
everything knowable about a kind of subject. A domain is **not an entity**; it is where the
information about a kind of subject lives. Domains are derived from PC-003.

Two structural kinds are distinguished, **differing only by level**: a **domain** is a *top-level*
area of information (a root the Owner works within — IA-01); a **secondary structure** is information
organized *within or between* domains, never a root of its own (IA-02). Both are derived from PC-003;
the difference is level (root vs. within), not kind.

**IA-01 — Primary information domains (three).** The top-level areas within which all information is
found:

| Primary information domain | Organizes information about (PC-003) |
|---|---|
| **Programs** | the offering — Training Program, its Revenue Distribution Policy, its Registrations, its Receipts (§C, §D) |
| **Teachers** | the teacher party — their Programs, per-program Teacher Balance/Debt, Payments, and Financial Standing (§B, §E) |
| **Students** | the student party — their Registrations, Receipts / Refunds / Non-Program Revenue, and Financial Standing (§B, §D, §E) |

**Context — not a domain.** The **Center** is the single implicit **context** within which every
domain lives (PC-003 §A). It is **not** an information domain. Center-wide revealed truths (the
Three Balances) and the Activity Record are surfaced *at the context level* (the overview), never as
an information area of their own.

**IA-02 — Secondary information structures.** Information reached **within or across** the primary
domains, never a domain of its own:

- **Registration** — shared information **between** the Students and Programs domains; PC-003 places
  the enrolment obligation *between* the two (§C).
- **Revenue Distribution Policy** — within the Programs domain (§C).
- **Recorded facts** (Receipt Voucher, Payment Voucher, Refund Voucher, Non-Program Educational
  Revenue) — within the domain of the subject each references (§D).
- **Center-context financial records** — center **expenses**, their **Expense Category**, and
  **Expense Returns** are surfaced at the **context** level, referencing no party (§D).

Derived truths (Teacher Balance, Teacher Debt, Party Financial Standing) are **not** domains — they
are *revealed within* the domain they belong to; the Three Balances are revealed at the context
(§E; IA-07). Operational Status is an attribute, never a place (§F).

## 3. Information grouping *(thematic clusters)* — IA-03

**IA-03 — The Owner's information falls into five clusters,** each a faithful grouping of PC-003
concepts (grouping only; no concept is redefined):

1. **Parties** — Teacher, Student *(the "who")*.
2. **Offering & commitment** — Training Program, Revenue Distribution Policy, Registration *(the "what
   is offered and committed to")*.
3. **Recorded money facts** — Receipt Voucher, Payment Voucher, Refund Voucher, Expense Return,
   Non-Program Educational Revenue, Expense Category *(the "what happened to money", authored & permanent)*.
4. **Derived financial truths** — The Three Balances, Teacher Balance, Teacher Debt, Party Financial
   Standing *(the "what is true now", revealed, never entered)*.
5. **Center-wide knowledge** — Activity Record, Operational Status *(cross-cutting)*.

The clusters are a perception aid; they introduce no new concept and no behavior.

## 4. Information hierarchy *(levels of depth)* — IA-04

**IA-04 — Information is organized in four depth levels,** derived from PC-003's containment
(Center contains all; subjects carry attached facts; facts have detail):

- **L0 — Context (the Center overview):** center-wide revealed truths (Three Balances) and the
  Activity Record are surfaced here.
- **L1 — Information domains:** the three primary domains (Programs, Teachers, Students).
- **L2 — Domain detail:** one Program / Teacher / Student together with its recorded facts, its
  revealed truths (Party Financial Standing; per-program Teacher Balance/Debt), its Registrations,
  and its Operational Status.
- **L3 — Individual recorded fact:** one voucher (Receipt / Payment / Refund / Expense Return /
  Non-Program Revenue) and its detail.

**Registration** spans L2 between the Students and Programs domains. Depth expresses reach, never
storage or a screen.

## 5. Entry points — IA-05

**IA-05 — The Owner begins from a fixed, small set of entry points:**

- the **context overview** (L0) as the default starting place;
- the three **information domains** (Programs, Teachers, Students) at L1.

Every recorded fact is created **from the subject it belongs to** (e.g., a program-fee receipt from a
Student's Registration in a Program), never from nowhere. There is **no** entry point that originates
information detached from a domain or the context.

## 6. Informational relationships — IA-06

**IA-06 — The information in one domain is related to the information in another** (PC-003's
*meaning-dependence* fixed as an **informational relationship** — what belongs with what, what refers
to what; the concept is unchanged). These are relationships **between information**, establishing
connectedness — **not** an organization of navigation, movement, or flow (that is not UX-002's
concern):

- **Program** information relates to — its Teacher · its Registrations · its Students · its Receipts
  · its Distribution Policy · its per-program Teacher Balance/Debt · its Operational Status.
- **Teacher** information relates to — their Programs · their per-program Balances and Debts · their
  Payments · their Financial Standing · their Operational Status.
- **Student** information relates to — their Registrations · their Programs · their Receipts / Refunds
  / Non-Program Revenue · their Financial Standing · their Operational Status.
- **Registration** information relates to — its Student · its Program · its Receipts.
- **Any recorded fact** relates to — the subject(s) it references (never orphaned).
- **Any party** relates to — its Financial Standing (all of that party's facts, revealed).
- **Any domain or the context** relates to — its slice of the Activity Record.

These are **informational** relationships only. How the Owner *moves* along them — navigation,
movement, flow — is deliberately **not** decided here.

## 7. Information discoverability — IA-07

**IA-07 — Discoverability (constitutional definition).** Every business fact has **exactly one
primary information home** — a single place in this architecture from which it is discovered,
determined by the subject it is primarily authored against (PC-003). A fact stays **reachable** from
related information through IA-06 relationships, but it is **discovered from one home only**: no
business fact has two homes, and none has none.

Primary homes, derived from PC-003:

| Business fact | Primary information home |
|---|---|
| program-fee **Receipt Voucher** | its **Registration** (the student's enrolment in the program) |
| **Refund Voucher** | the **Student**'s enrolment (Student × Program) |
| **teacher Payment Voucher** | the **Teacher** (Teacher × Program) |
| **center-expense Payment Voucher**, **Expense Return**, **Expense Category** | the **context** (center financial records) |
| **Non-Program Educational Revenue** | its **Student** |
| **Teacher Balance / Teacher Debt** *(revealed)* | the **Teacher** (per Teacher × Program) |
| **Party Financial Standing** *(revealed)* | the **party's** domain (Student or Teacher) |
| **The Three Balances** *(revealed)* | the **context** |

Supporting findability (never a second home): the **Activity Record** makes any recorded event
findable chronologically; **Party Financial Standing** gathers all of a party's facts for reading;
**derived truths are discovered where they are revealed and never entered** (UXV-03).

No business fact is orphaned; none has two homes; nothing reveals a value it did not derive.

## 7a. The Activity View — IA-08 *(added by amendment ADR-0058; consumes DR-018 / DR-020)*

**IA-08 — The Activity View.** The **Activity Record** (IA-03 cluster 5; homed at the context, L0) is
revealed to the Owner through an **Activity View** — a chronological reading of recorded events. This
atom discharges the two Domain Rules that **BC-009 (§7 disposition / §9 BX-6) explicitly delegates to
the UX layer**, consuming each exactly as frozen and redefining no Activity Record semantics:

- **DR-018 — the view creates no business logic.** The Activity View is a *reveal* of the Activity
  Record (whose append-only nature is fixed upstream by DR-019); it originates, computes, and stores
  nothing (UXV-01, UXV-03). It is the context-level information home's chronological face — **not** a
  second home (IA-07) and **not** work (WA-09).
- **DR-020 — each row carries its Source and Financial-Impact, standalone.** Every activity row
  **presents** the two things the Owner must see without opening the underlying record: its **Source**
  (the originating record, action, or event the row reflects, exactly as DR-020 defines that source)
  and its **Financial-Impact** indication. Each row is understandable on its own.

The Activity View is **information presentation, not work**, confers no authority (UXV-04), and
reveals only values the business derived (UXV-03). *(Consumes: DR-018, DR-020 [DOM-004] (append-only
per DR-019), delegated to UX by BC-009 §7 / §9 BX-6; PC-003 §A context; obeys UXV-01/03/04.)*

## 8. Boundaries

> **This document organizes information. It does not organize work.** Organizing the Owner's work
> into working areas is UX-003 (Workspace Architecture); organizing movement is later still. UX-002
> fixes only how information is structured to be understood and found.

**UX-002 owns** — the constitutional structure of information, derived from PC-003: primary
information domains (IA-01), secondary information structures (IA-02), information grouping (IA-03),
information hierarchy (IA-04), entry points (IA-05), informational relationships (IA-06),
information discoverability (IA-07), and the **Activity View (IA-08)** — the reveal of the Activity
Record discharging the DOM-004 DR-018/DR-020 delegation (BC-009 §7 / §9 BX-6).

**UX-002 never owns** — Business Rules; Product Rules; **mental-model definitions** (PC-003 is
consumed, never redefined); **the organization of work or tasks** (UX-003); the organization of
navigation, movement, or flow; screens; workspaces; navigation components; menus; layouts; forms;
interactions; visual language; colours; typography; components; accessibility; engineering;
implementation.

## 9. Dependencies

- **Consumes (exactly as frozen, modifies nothing):** **PC-003** (the concepts organized here) and
  **UX-001** (the philosophy and invariants every IA decision obeys); and, **for IA-08 only,
  DOM-004 DR-018/DR-020** via the **BC-009 §7 / §9 BX-6** delegation of those rules to the UX layer.
- **Produces (the structural foundation later documents obey):** UX-003 (Workspace Architecture)
  organizes work *over* this IA; UX-004 (Interaction & Forms) surfaces actions *within* it; UX-005
  (Language / RTL / Accessibility) labels and orients it; UX-006 (Traceability) maps every UX element
  back through it.
- **Never modifies upstream.** CDC — *Consumes only. No modification. No narrowing. No
  reinterpretation.*

## 10. Strict-Scope Self-Check

Every section of UX-002 answers only *"how is information constitutionally organized?"* It fixes
information domains, grouping, hierarchy, entry points, informational relationships,
discoverability, and the **Activity View (IA-08)** — each **derived from and citing PC-003**, except
IA-08, which additionally consumes the **DOM-004 DR-018/DR-020** delegated to UX by **BC-009 §7 / §9
BX-6**; and each obeying UX-001's invariants.
**This document organizes information; it does not organize work.** It **redefines no PC-003
concept**, introduces **no** Business or Product rule, and defines **no** workspace, screen, menu,
navigation component, layout, form, interaction, visual language, accessibility rule, or engineering
decision. It consumes PC-003 and UX-001 exactly as frozen and modifies nothing upstream.

---

*FROZEN v1.1.0 — the Information-Architecture foundation of Phase 3, the organizing structure through
which the frozen PC-003 concepts become perceivable, locatable, and findable; the frozen structural
authority every later UX document consumes and cites. Originally frozen at v1.0.0 (ADR-0051 /
AUD-P3-003); amended to **v1.1.0 by ADR-0058** (GOV-004 §5), adding **IA-08 (The Activity View)** to
discharge the DR-018/DR-020 presentation requirements that BC-009 (§7 / §9 BX-6) delegates to the UX
layer — pure information presentation, redefining no Activity Record semantics and changing no
business/product ownership (verified by the UX-006 Readiness Verification, 6/6 SOUND). No further
modification is permitted except through the Constitutional Amendment process (GOV-004 §5 / BC-000
§BCG-3).*
