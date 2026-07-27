# UX-006 — UX Traceability Matrix & Coverage

| Field | Value |
|---|---|
| Doc ID | UX-006 |
| Title | UX Traceability Matrix & Coverage |
| Phase | 3 (UX Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | UX-001, UX-002 (v1.1.0 — includes IA-08), UX-003, UX-004, UX-005 (all frozen); the Business (BC-000…BC-009) and Product (PC-001…PC-008, PLP-001) authorities they cite; GOV-006 (traceability strategy); P3-000 (governing plan); GOV-013 (governing review protocol) |
| Answers | "Does the UX Constitution completely and traceably present the frozen business/product behavior that requires a surface — with no orphan UX rule and no uncovered presentation-requiring authority?" |
| Governed by | GOV-013 — Multi-Agent Review Protocol (FROZEN v1.0.0, ADR-0057 / AUD-P3-007) |

---

> **Nature of this document.** UX-006 is the **UX sink** — the coverage/traceability proof of Phase 3,
> the UX analog of BC-009. It introduces **no** new UX rule (no IA/WA/IX/LA/UXP/UXV), no workspace, no
> interaction, no screen, component, or visual. Its responsibility is **proof, never production**: it
> demonstrates that every UX rule (UX-002…UX-005) traces to a frozen Authority of Behavior, and that
> every frozen business/product behavior *which requires a surface* is presented by ≥1 UX rule — with
> **zero orphan and zero gap**. It changes no business truth and no UX rule; it only proves.

## 1. Executive Summary

Phase 3 fixed **how** the frozen truth is seen and operated: information architecture (UX-002),
workspaces (UX-003), interaction & forms (UX-004), and language/RTL/accessibility (UX-005), under the
philosophy of UX-001. Each document asserts traceability **locally** (every rule cites its authority
via UXV-02). UX-006 supplies the one thing none of them can: the **composite proof of completeness** —
that the UX Constitution presents *all* of the frozen behavior that needs a surface, and *only* that,
with nothing invented and nothing missed.

The proof has two directions and one filter:
- **Traceability (§5):** every UX rule → the frozen authority it presents or serves — **0 orphan.**
- **Coverage (§6):** every presentation-requiring authority → its UX rule(s) — **0 gap.** The
  **17** Owner-authored business actions (UX-003 WA-06) are each assigned to exactly one workspace and
  classified into exactly one of UX-004's five action classes (**17/17**); every revealed business
  fact has exactly one information home — recorded/derived facts at their UX-002 IA-07 primary homes,
  and center-wide knowledge (the Three Balances, the Activity Record) at the context (IA-01 / IA-04
  L0), the Activity Record revealed through the Activity View (IA-08).
- **The presentation-relevance filter (§4)** separates authorities that *require a surface* (facts to
  reveal, actions to operate) from those that are *non-presenting* (pure calculation, derivation,
  immutability, numbering) — the latter are honored **as constraints** (IX-08, UXV-03, UXV-04), never
  as screens.

UX-006 states **six closure criteria (UXC-1…UXC-6)** it must satisfy, all demonstrated here.

## 2. Constitutional Question

> **Does the UX Constitution completely and traceably present the frozen business/product behavior
> that requires a surface — with no orphan UX rule and no uncovered presentation-requiring authority?**

One question, answerable only by a sink: neither a single UX rule nor BC-009 (which proves the
*Business* edge, DR→BR) can answer it. UX-006 proves the **BR/PC → UX** edge.

## 3. Responsibility Analysis

**Single responsibility: proof of UX coverage & traceability — nothing produced.** UX-006 owns four
inseparable proof obligations (the UX analog of BC-009's Coverage/Completeness/Traceability/Closure;
BC-009's fifth responsibility, Validation, appears here as **UXC-6 Reproducibility**, §8):

- **Coverage** — every presentation-requiring frozen authority is presented by ≥1 UX rule.
- **Traceability** — every UX rule traces to ≥1 frozen Authority of Behavior (or is justified
  pure-presentation chrome).
- **Completeness** — the two directions are exhaustive: **0 orphan** (no UX rule presents a
  non-existent/non-frozen authority) and **0 gap** (no presentation-requiring authority is
  unpresented); every non-presenting authority is dispositioned with a reason.
- **Closure** — the criteria (UXC-1…6) are objectively demonstrated, enabling (by a *separate* Owner
  order) Phase-3 closure. **Proof precedes Authorization** (P3-000 §12).

**Why proof, not production.** UX-006 introduces no rule because a sink that produced would be able to
*hide* a coverage gap behind a rule of its own. Its power is precisely that it owns nothing to present
— it can only reveal whether the *other* documents already do.

## 4. The Presentation-Relevance Filter

Coverage is undefined until "requires a surface" is fixed. A frozen authority **requires a surface**
iff it is one of:

- **(R) A revealed business fact** — a truth the Owner must *see*: the derived truths of the
  Observation layer (BC-007 — the Three Balances, Teacher Balance, Teacher Debt, Party Financial
  Standing); the recorded facts that carry them (the vouchers, Non-Program Educational Revenue,
  Expense, Expense Return, Expense Category); the **Activity Record** (append-only per DR-019),
  revealed as a derived **view** (DR-018) — the **Activity View** — with each row carrying its Source
  and Financial-Impact (DR-020); and Operational Status. Presentation obligation: **reveal** it, in
  exactly one information home.
- **(O) An Owner-authored business action** — a thing the Owner must *do*: the 17 actions the Business
  Constitution authorizes the Owner to perform (UX-003 WA-06). Presentation obligation: make it
  **operable**, in exactly one workspace, through exactly one interaction class.

An authority is **non-presenting (N)** iff it is honored by the surface but has no direct surface of
its own — pure **calculation/derivation** (share splits; BC-007 aggregation), **immutability**
(BR-037/BR-040), **numbering** (DR-090), or **lifecycle-internal** mechanics. These are covered by
**constraint**, not by a presentation rule: the surface must *reveal* their results without
recomputing (UXV-03), never request or accept a derivable value (IX-08 / DR-007 / F-08), and never let
presentation alter them (UXV-04). Class **N** is legitimately *not* a coverage gap — §7 dispositions
each with its constraining UX rule.

## 5. Traceability Matrix A — every UX rule → the authority it presents / serves

*Direction: UX rule → frozen authority. Purpose: prove **0 orphan** — no UX rule invents behavior.
Authorities quoted from each atom's frozen trace (UX-005) or its inline/derivation citations
(UX-001…UX-004).*

### UX-001 — Philosophy & invariants (framework)
| Atom | Traces to (frozen authority) |
|---|---|
| UXP-01 | GOV-012 (layer ownership) |
| UXP-02, UXP-03 | the Business/Product layers (subordination stance) |
| UXP-04 | BC / PC (authority of action) |
| UXP-05 | GOV-004 §5 / BC-000 §BCG-3 (amendment) |
| UXV-01 | BC-000…BC-009 (behavioral non-creation) |
| UXV-02 | any BR-NNN / frozen Product/Domain statement |
| UXV-03 | DR-007, BC-007 |
| UXV-04 | (presentation-neutrality guarantee over BC facts) |
| UXV-05 | PC-005, PC-006 |

*UXV-01 and UXV-04 are **framework guarantees**, not presenting rules; UXV-02's trace requirement
binds only an element that **presents business information or initiates a business action**, so a
guarantee carries no external citation and is not an orphan.*

### UX-002 — Information Architecture
| Atom | Traces to |
|---|---|
| IA-01 | PC-003 (Programs/Teachers/Students domains; Center = context) |
| IA-02 | PC-003 §C/§D (Registration, Policy, recorded facts) + IA-07 |
| IA-03 | PC-003 (grouping of the five clusters incl. BC-007 derived truths) |
| IA-04 | PC-003 (containment/hierarchy) |
| IA-05 | PC-003 (entry points) |
| IA-06 | PC-003 (meaning-dependence relationships) |
| IA-07 | PC-003 + **UXV-03** (one primary home per fact; derived truths revealed, never entered) |
| IA-08 | **DR-018, DR-020** [DOM-004] (the Activity View — delegated to UX by BC-009 §7 / §9 BX-6); PC-003 §A |

### UX-003 — Workspace Architecture
| Atom | Traces to |
|---|---|
| WA-01 | BC-000…BC-009 (workspace = operating context over frozen actions) |
| WA-02 | UX-002 (work ⊥ information) |
| WA-03 | BC-000…BC-009 (derive from Owner-authored actions; BC-004/007/009 contribute none) |
| WA-04 | WA-06 (single membership) |
| WA-05 | BC-001, BC-002, BC-003+BC-008, BC-006 (BR-077), BC-008, BC-005 (the six families) |
| WA-06 | BC-001/002/003/005/006/008, BR-086 (the 17 actions — see §6) |
| WA-07 | UX-002 (outcome lands in its primary home) |
| WA-08 | BC + WA-06 (assignment completeness) |
| WA-09 | **BC-007** (observation is information, not work) |

### UX-004 — Interaction & Forms
| Atom | Traces to |
|---|---|
| IX-01 | DR-023, BR-084; UX-001 §1 (interaction ≡ one action) |
| IX-02 | IX-01 (Form cardinality) |
| IX-03 | PP-6, UXP-04, DR-043, UXV-03, WA-06, UX-002 (performance lifecycle) |
| IX-04 | UXV-02, UXV-01, DR-043, BR-037/BR-040, PP-3/PA-5, PC-006 (rule surfacing) |
| IX-05 | BC-001/002/008, BR-087, BR-064/065, BC-003/005 + per-class BRs (five classes) |
| IX-06 | UX-003 WA-06 (class coverage of the 17) |
| IX-07 | UXP-04, UXV-01 (adjudication → business layer) |
| IX-08 | DR-007, F-08, PP-1 (nothing derivable requested/accepted) |
| IX-09 | IX-06, WA-06 (performance coverage complete) |
| IX-10 | UXV-05, frozen Business Constitution (workflow integrity) |
| C1…C5 | BR-010/019/023/079 + DR-013 / BC-001 INV-3 · BR-034/035/050/051/058/080/085 + DR-005/043/090 · BR-016/025/086/087 · BR-064/065 · BR-037/040/055/056/057 |

### UX-005 — Language, RTL & Accessibility (verbatim traces)
| Atom | Traces to |
|---|---|
| LA-01 | UXV-05; PC-006 NR-1/NR-2/NR-3 |
| LA-02 | PLP-001 [PLP-1/PLP-2/PLP-5]; GOV-012 L8; PC-006 NR-3 |
| LA-03 | UXP-02; UXV-01; UX-004 IX guidance |
| LA-04 | LA-02; PLP-001; GOV-012 #32; ADR-0005 §3 |
| LA-05 | UXV-04; UXV-03; BC-007 |
| LA-06 | UXV-03; UXV-04 |
| LA-07 | GOV-012 #30 [guarantee→Product; focus→UX]; PLP-001 [PLP-3]; UX-001 §1; UXV-02 |
| LA-08 | UXV-05; PC-006; UXV-04 |
| LA-09 | UXV-04; UXP-04 |
| LA-10 | PC-006 §3; PLP-001; UXP-05 |
| LAV-01…06 | specialize UXV-05/04/04-UXP04/01-02/05/02; enforce LA-01/05-06/09/03/08/07 |

**Result:** every UX atom (UXP-01…05, UXV-01…05, IA-01…08, WA-01…09, IX-01…10, C1…C5, LA-01…10,
LAV-01…06) traces to ≥1 frozen Authority of Behavior or specializes a frozen UX invariant. **0 orphan.**

## 6. Coverage Matrix B — every presentation-requiring authority → its UX rule(s)

### 6.1 Owner actions (O) — 17/17 operable
*Each of the 17 WA-06 actions is assigned to exactly one workspace (UX-003) and exactly one interaction
class (UX-004 IX-05/IX-06). Coverage = 17/17.*

| # | Owner action | Business source | Workspace | Class |
|---|---|---|---|---|
| 1 | Define a Program (teacher, base price, policy) | BC-001 | WS-01 | C1 |
| 2 | Close / reopen a Program | BC-001 | WS-01 | C3 |
| 3 | Set a Teacher's status (Active/Inactive-Left) | BC-008 BR-086 | WS-01 | C3 |
| 4 | Create a Registration (student×program, final price) | BC-002 | WS-02 | C1 |
| 5 | Define the installment split of a Registration | BC-002 | WS-02 | C1 |
| 6 | Record payer / guardian information | BC-002 | WS-02 | C1 |
| 7 | End / reactivate a Registration | BC-002 | WS-02 | C3 |
| 8 | Record (post) a program-fee Receipt Voucher | BC-003 | WS-03 | C2 |
| 9 | Record Non-Program Educational Revenue | BC-008 | WS-03 | C2 |
| 10 | Record a Teacher Payment Voucher | BC-006 | WS-04 | C2 |
| 11 | Settle a Teacher Debt (repayment/deduction path) | BC-006 | WS-04 | C4 |
| 12 | Record a center Expense | BC-008 | WS-05 | C2 |
| 13 | Record an Expense Return | BC-008 | WS-05 | C2 |
| 14 | Extend the Expense Category list | BC-008 | WS-05 | C1 |
| 15 | Record a Refund Voucher | BC-005 | WS-06 | C2 |
| 16 | Cancel a posted financial document | BC-003/BC-005 | WS-06 | C5 |
| 17 | Record a logged descriptive edit | BC-003/BC-005 | WS-06 | C5 |

**Class tally:** C1=5 · C2=6 · C3=3 · C4=1 · C5=2 → **17** (matches IX-06). Every action has exactly
one workspace (WA-04) and one class (IX-06); the WA-06 registry is the sole registry (IX-06/WA-08).

**Provenance of exhaustiveness.** That these 17 are *all* the Owner-authored business actions is not
UX-006's assertion: it rests on frozen **WA-08** (assignment completeness — the WA-06 registry is
exhaustive, and any new BC action must be assigned before any surface presents it) and on **BC-009**
(the frozen Business-layer coverage proof). UX-006 consumes both as frozen (CDC) and re-derives
nothing; it proves only the **BR/PC → UX** edge above them.

### 6.2 Revealed business facts (R) — each homed exactly once
*Coverage = each fact has one UX-002 home — an IA-07 primary home for authored/derived facts, or the
context (IA-01 / IA-04 L0) for center-wide knowledge — and is revealed as information, never worked
(WA-09), never recomputed (UXV-03).*

| Revealed fact (authority) | Home (UX-002) |
|---|---|
| Programs / Teachers / Students (the parties & the offering) | their information **domain** (IA-01) |
| Registration · Revenue Distribution Policy · installment split | **secondary structures** within their domains (IA-02) |
| The Three Balances (BC-007) | the context (overview) |
| Teacher Balance / Teacher Debt (BC-007) | the Teacher (per Teacher×Program) |
| Party Financial Standing (BC-007) | the party's domain (Student / Teacher) |
| program-fee Receipt Voucher | its Registration |
| Refund Voucher | the Student's enrolment (Student×Program) |
| teacher Payment Voucher | the Teacher (Teacher×Program) |
| center-expense Payment Voucher, Expense Return, Expense Category | the context |
| Non-Program Educational Revenue | its Student |
| Activity Record *(derived view, DR-018; append-only per DR-019)* | the context (IA-01 / IA-04 L0), revealed via the **Activity View** — presentation governed by **IA-08** |
| per-row **Source + Financial-Impact** (DR-018 / DR-020, delegated by BC-009 §7 / §9 BX-6) | the context — **covered by IA-08** (a rule, not a home) |
| Operational Status *(an attribute, not a home — §F / IA-03 cluster 5)* | with its subject |

## 7. Completeness — 0 orphan · 0 gap · disposition of non-presenting authorities

- **0 orphan (UXC-3):** §5 shows every UX atom traces to a frozen authority. No UX rule presents a
  non-frozen or invented behavior.
- **0 gap (UXC-4):** §6.1 covers all 17 Owner actions (17/17); §6.2 homes every revealed fact. No
  presentation-requiring authority is unpresented. **Business→UX delegations closed:** the two Domain
  Rules BC-009 (§7 / §9 BX-6) explicitly hands to the UX layer — **DR-018** (Operations is an activity
  view) and **DR-020** (each activity row carries Source + Financial-Impact, standalone) — are now
  owned by **UX-002 IA-08 (The Activity View)** and covered here (§5, §6.2). *(This closes the F1 gap
  found in the prior Readiness Verification, via the authorized Path-1 amendment to the owning
  document UX-002 — GOV-004 §5.)*
- **Non-presenting authorities (N) — dispositioned, not gaps:**

| Non-presenting authority (kind) | Why no surface | Covered by constraint |
|---|---|---|
| Share/split & entitlement **calculation** | derived, never entered | UXV-03; IX-08 (revealed, never requested); IX-07 (adjudication → business) |
| BC-007 **aggregation** (balances) | revealed, never computed by UX | UXV-03; WA-09; LA-05 (value kept as derived) |
| **Immutability** (BR-037/BR-040) | not an action surface; a prohibition | IX-04 (irreversibility surfaced); C5 correction is cancel+recreate, not edit |
| **Numbering** (DR-090) | system-assigned, never entered | IX-08 (nothing derivable requested) |
| **Adjudication / validity** | decided by business, not surface | IX-07; UXV-01 |

Each N-authority is honored by a **constraint** rule, confirming the filter (§4): they require no
screen, and their absence from §6 is correct, not a gap.

## 8. Closure criteria (UXC-1…UXC-6) — demonstrated

- **UXC-1 — Traceability.** Every UX rule traces to ≥1 frozen Authority of Behavior or specializes a
  frozen UX invariant (§5). ✔
- **UXC-2 — Coverage.** Every presentation-requiring authority is presented: 17/17 actions operable
  (§6.1); every revealed fact homed (§6.2). ✔
- **UXC-3 — No orphan.** No UX rule presents a non-frozen authority (§5). ✔
- **UXC-4 — No gap.** No presentation-requiring authority is unpresented; every non-presenting
  authority is dispositioned (§7). ✔
- **UXC-5 — Layer purity.** UX-006 introduces no Business Rule, calculation, workflow, status effect,
  UI, or technique; every citation is a frozen authority quoted, not reinterpreted. ✔
- **UXC-6 — Reproducibility.** The matrices (§5–§6) and dispositions (§7) are derivable from the
  frozen text of UX-001…UX-005 and the authorities they cite, by any reader, without UX-006 storing a
  single new truth. ✔

## 9. Constitutional posture

UX-006 is a **proof, not a production**: its only "output" is the demonstrated fact that Phase 3 is
complete and traceable. It creates no atom that any later layer (Phase 5/6) must obey — it certifies
that everything Phase 5/6 must obey already exists in UX-001…UX-005. Its closure criteria (UXC-1…6)
are **success conditions of the proof**, not new behavior. (Analog: BC-009's INV-41 — Constitutional
Reproducibility — as a sink property, not a generative rule.)

## 10. Dependencies

- **Consumes (exactly as frozen, modifies nothing):** UX-001…UX-005 (**UX-002 at v1.1.0 — includes
  IA-08, the Activity View covering DR-018/DR-020**); the Business (BC-000…BC-009) and
  Product (PC-001…PC-008, PLP-001) authorities they cite; GOV-006 (traceability strategy); P3-000
  (phase plan).
- **Produces:** the two matrices (§5–§6), the non-presenting disposition (§7), and the six closure
  criteria demonstrated (§8) — **no new UX atom.**
- **Never modifies upstream.** CDC applies — *Consumes only. No modification. No narrowing. No
  reinterpretation.* Any coverage gap this proof were to reveal would be repaired in the **owning** UX
  document by amendment (GOV-004 §5), never patched inside UX-006.
- **Governed by GOV-013**, from this draft through freeze.

## 11. Self Validation

- **One question, one responsibility.** UX-006 answers exactly one question (§2) and owns exactly one
  responsibility — proof of UX coverage & traceability (§3).
- **Proof, never production.** Zero new UX rule/workspace/interaction/screen; zero business behavior.
- **Both directions exhaustive.** §5 (rule→authority, 0 orphan) and §6 (authority→rule, 0 gap) meet at
  §7's disposition of the non-presenting remainder — the coverage graph is closed.
- **Filter defined.** "Requires a surface" is fixed (§4: R/O vs N), so "coverage" is well-defined and
  non-presenting authorities are not miscounted as gaps.
- **Reproducible & upstream-immutable.** Everything is derived from frozen text; nothing upstream is
  changed; a revealed gap routes to the owning document, never into UX-006.

---

*FROZEN (v1.0.0, ADR-0057 / AUD-P3-007). UX-006 is the **UX coverage sink** of Phase 3 — proof, never
production: it demonstrates that every UX rule (UX-001…UX-005) traces to a frozen authority (0 orphan)
and that every presentation-requiring business/product behavior is presented by a UX rule (0 gap),
including the DR-018/DR-020 delegation discharged by UX-002 IA-08. Lifecycle under GOV-013: Draft →
Adversarial Self-Hardening → Readiness Verification (NOT READY — F1: DR-018/DR-020 uncovered) →
Revision 1 + Path-1 amendment (UX-002 IA-08) → Readiness Verification (NOT READY — integration slips
N1–N4) → Amendment Completion → Readiness Verification (**READY** — 6/6 SOUND, 0 blocking/major) →
Owner Approval → this freeze. It introduces no UX rule and changes no business/product truth; BC-009
is preserved exactly as frozen. No further modification is permitted except through the Constitutional
Amendment process (GOV-004 §5).*
