# GOV-012 — Layer Ownership Constitution

| Field | Value |
|---|---|
| Doc ID | GOV-012 |
| Title | Layer Ownership Constitution |
| Phase | 0 (governance; spans all phases) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | GOV-000, GOV-001, GOV-003, GOV-004, GOV-006 |
| Referenced by | all future phases, ADRs, and governance (ownership authority) |

---

## 1. Purpose & authority

This document is the **permanent, mechanical authority for deciding which layer owns
any engineering decision** in the Ard Kanaan project. Its goal is to remove
subjective ownership debates forever: after this constitution exists, ownership is
determined by an **algorithm**, not by opinion, seniority, or preference. It applies
to every phase, every ADR, and every future governance document. It is amendable
only by the Owner (GOV-004 §5).

## 2. The model

Ownership is defined over **three structures**, not one:

1. **The Product Stack** — five strictly ordered layers, the *substance* of the
   product: **Business ▷ Product ▷ UX ▷ Visual Design ▷ Engineering.** Dependencies
   and change-forcing flow **downward only**.
2. **The Governance Plane** — orthogonal to the stack; owns decisions about *how
   engineering is conducted* (phase order, gates, reviews, IDs, ADR process, this
   document itself).
3. **Reflective Concerns** — Documentation, Testing, Audit, Logging, Traceability.
   These have **no independent layer**; each **inherits the layer of the decision it
   reflects**.

> Every decision the project will ever make is (a) a *substance* decision → exactly
> one stack layer, (b) a *process* decision → Governance, or (c) a *reflection* of
> some decision X → inherits X's layer. This exhaustiveness is the **Totality
> Theorem** (Law 6).

## 3. The five stack layers

| Layer | The one question it answers | Edited when… | Survives redesign of… |
|---|---|---|---|
| **Business** | What is true about the domain, with or without software? | the business changes | everything below |
| **Product** | What must the software be and do — identity, capability, scope, guarantee, vocabulary? | scope / capability / identity changes | UX, Visual, Engineering |
| **UX** | How is the product operated — structure-for-use, flow, interaction logic and result? | the operation is redesigned | Visual, Engineering |
| **Visual Design** | How does it look and feel — sensory expression only? | it is re-skinned | Engineering |
| **Engineering** | How is it built to satisfy all of the above? | the implementation changes | — |

Full layer definitions (question / exclusive decisions / forbidden decisions /
artifacts / survives / changes) are as established in the Layer Ownership analysis;
the table above is the operative summary.

## 4. Constitutional laws

**L1 — Atomic Ownership.** Ownership is assigned only to *atomic decisions* (one
choice that could be made otherwise). Every atomic decision has **exactly one** owner.

**L2 — Decomposition.** No concept is classified as a bundle. Decompose until atomic.

**L3 — Edit-Locality (core rule).** The owner of a decision D is the single layer
whose artifact you would **edit** to change D, editing no other layer. If changing D
forces edits in two layers, D is not atomic (→ L2).

**L4 — Minimal Perturbation (intuition of L3).** Equivalently: the owner is the
**lowest layer that can change D unilaterally** — the highest layer D is essentially
bound to.

**L5 — Determinism Theorem.** The stack is totally ordered and its five ladder gates
are mutually exclusive at the atomic level ⇒ every atomic stack-decision has exactly
one owner.

**L6 — Totality Theorem.** Every atomic decision maps to exactly one of {five stack
layers, Governance}; Reflective concerns resolve by inheritance (L11). No decision is
unclassifiable.

**L7 — Layer Survival (Invariance).** Each layer survives redesign of every layer
below it. If an artifact changes when a lower layer is redesigned, it was
mis-assigned — promote it.

**L8 — Downward Dependency.** Dependencies and change-forcing flow downward only. An
upward force is a boundary violation, not a decision.

**L9 — Tie Resolution.** A genuine tie between layers is impossible for an atomic
decision. A perceived tie proves non-atomicity → decompose (L2).

**L10 — Guarantee / Mechanism.** A non-functional requirement decomposes into a
**Guarantee** (owned by the layer that promises it — usually Product) and a
**Mechanism** (Engineering).

**L11 — Reflective Inheritance.** Documentation-of-X, Test-of-X, Audit-of-X,
Log-of-X, Trace-of-X inherit **X's** layer.

**L12 — Governance Orthogonality.** Decisions about the *process of building* belong
to the Governance Plane, never to the stack.

**L13 — Semantic-vs-Sensory.** A decision that changes *functional/semantic content*
is UX-or-above; a decision that changes only *sensory rendering* is Visual.

**L14 — Single-Owner.** Shared ownership is forbidden. "Shared" is only ever a set of
atomic decisions, each singly owned.

**L15 — No-Upward-Invention.** A layer may not create what a higher layer owns:
Engineering invents no rule, UX invents no capability, Visual invents no flow, no
layer invents a business fact.

**L16 — Capability Decomposition Law (NEW).** Every **capability** decomposes into
three ordered strata, which are classified separately:
- **Capability** — *that it exists / what it must do* → the **declaring layer**
  (Business if a domain truth, otherwise **Product**).
- **Behavior** — *how it is used / operated / its result* → **UX** (semantic
  behavior); sensory behavior → **Visual**.
- **Implementation** — *how it is built* → **Engineering**.

This is the canonical, mandatory decomposition template for any feature/capability
(Search, Reports, Dashboards, Printing, Notifications, …). Applying L16 first makes
classification of features immediate.

**L17 — Behavior Separation Law (NEW).** The three strata of L16 are **mutually
exclusive and independently owned**: *the existence of a feature ≠ the way it is used
≠ the way it is built*. No stratum may absorb, override, or silently decide another.
Existence (Product) is never decided by construction (Engineering); usage (UX/Visual)
never redefines whether a feature exists (Product); construction never invents usage
or existence.

### 4.1 Consistency of L16–L17 with LOA and Minimal Perturbation (proof obligation)

L16 and L17 are **specializations and corollaries** of the pre-existing laws, not new
mechanisms:

- **L16 ⊂ L2 (Decomposition).** L16 is the named, canonical instance of L2 for the
  common shape "a capability." Each stratum it produces is then classified by the
  *same* LOA ladder — Capability answers Q2 → Product (or Q1 → Business), Behavior
  answers Q3 → UX (or Q4 → Visual), Implementation answers Q5 → Engineering.
  It introduces no owner the ladder would not already assign.
- **L17 ⊂ L3 + L14 + L15.** The three strata have three distinct edit localities
  (edit Product to change existence; edit UX/Visual to change usage; edit Engineering
  to change construction), so by Edit-Locality (L3) they are necessarily three owners
  — which is exactly L14 (single-owner per atom) and L15 (no upward invention)
  restated for capabilities.
- **Minimal Perturbation preserved.** Existence changes only under a product-scope
  perturbation; usage under an experience redesign; construction under an
  implementation change — three different minimal perturbations, consistent with L4.

Therefore L16–L17 strengthen determinism (they give engineers a ready template) while
**introducing no conflict** with LOA, Edit-Locality, or Minimal Perturbation.

## 5. The Layer Ownership Algorithm (LOA) — deterministic

```
CLASSIFY(decision D) -> exactly one owner

STEP 0  NORMALIZE
  If D is a concept/term (not a single choice):
     - If D is a capability/feature, apply L16: split into
       Capability | Behavior | Implementation.
     - Else decompose per L2 into atomic decisions.
     CLASSIFY each atom; return the set. (No bundle owner.)

STEP 1  PLANES
  (a) Is D about HOW ENGINEERING IS CONDUCTED (phase order, gates, reviews,
      IDs, ADR process, governance itself)?            -> GOVERNANCE.  (L12)
  (b) Does D merely DOCUMENT / TEST / AUDIT / LOG / TRACE another decision X?
                                                        -> OWNER(CLASSIFY(X)). (L11)

STEP 2  NFR SPLIT
  Is D a non-functional requirement (speed, security, a11y, i18n, reliability)?
      -> split into Guarantee (-> STEP 3) and Mechanism (-> ENGINEERING). (L10)

STEP 3  STACK LADDER  (ask in order; FIRST "yes" is the owner)
  Q1  Would a domain expert assert D with zero software?                 -> BUSINESS
  Q2  Must EVERY correct implementation AND EVERY possible UI honor D
      identically (capability / scope / guarantee / actor / term /
      product invariant)?                                               -> PRODUCT
  Q3  Does D change SEMANTIC OPERATION — what can be done, the flow, the
      result, the structure-for-use — not merely rendering? (L13)       -> UX
  Q4  Does changing D alter ONLY sensory rendering?                      -> VISUAL DESIGN
  Q5  Otherwise (only how it is built)                                  -> ENGINEERING

STEP 4  VERIFY (Edit-Locality, L3)
  "To change D I edit exactly ONE layer's artifact."
  If more than one -> D was not atomic -> return to STEP 0.
```

## 6. The Decision Tree

```
 any decision D
   ├─ about the build PROCESS? ───────────────────────────► GOVERNANCE
   ├─ reflects another decision X? ──────────────► inherit OWNER(X)
   ├─ a capability/feature? ── yes ──► split (L16): existence | usage | build,
   │                                    classify each below
   ├─ a non-functional requirement? ── yes ──► Guarantee ▼ | Mechanism ► ENGINEERING
   └─ atomic substance decision:
        Q1 true on paper, no software?        → BUSINESS
        Q2 every UI & impl must honor it?     → PRODUCT
        Q3 changes operation/flow/result?     → UX
        Q4 changes only look/feel?            → VISUAL
        Q5 else (only how it's built)         → ENGINEERING
        → verify Edit-Locality; if >1 layer, not atomic → decompose
```

## 7. Conflict resolution (always ends in one owner)

1. **State** the disputed decision in one sentence.
2. **Test atomicity** (L2/L9/L16). If two credible layers are claimed, the unit is
   not atomic → **decompose** (use L16 for capabilities). The dispute usually
   dissolves here.
3. **Run the LOA** (§5) on each atom; record each ladder gate's yes/no.
4. **Verify Edit-Locality** (L3).
5. **Residual disagreement** can only be about a *specific factual gate answer* (e.g.
   "operation or only rendering?"). Escalate **only that fact**, resolved by the
   gate's definition (L13 etc.) — never by seniority.
6. **Genuine gap** (the tree cannot classify a decision) is a **Governance event** →
   an amendment to GOV-012 (Owner authority, GOV-004 §5), never an ad-hoc ruling.

**Invariants:** shared ownership is never an outcome (L14); the process is finite
(each decomposition strictly reduces scope); the output is always singly-owned atoms.

## 8. Maintenance, scalability & amendment

- **Mechanical → stable.** New concepts are classified by the same questions in year
  1 or year 10; past decisions are never re-litigated.
- **Deterministic → scalable.** Any two engineers reach the same owner; disagreement
  is redirected to a single factual gate.
- **Cited, not copied.** Phases and ADRs reference GOV-012 for ownership.
- **Amendable only by the Owner** (GOV-004 §5). Practice gaps become amendments,
  keeping the constitution complete over time.
- **Self-applying.** GOV-012 is itself a Governance-plane artifact (L12).

---

## Appendix A — Theory validation (self-challenge record)

Six attempts to disprove the theory were made before adoption; each surfaced a real
weakness that was fixed and integrated:

| # | Attack | Fix |
|---|---|---|
| A1 | Minimal-perturbation direction ambiguity | Edit-Locality (L3) as the core; L4 as its intuition |
| A2 | 5 layers cannot classify Docs/Tests/Governance/ADRs | Governance Plane + Reflective Concerns (§2; L11–L12; Totality Theorem L6) |
| A3 | NFRs straddle two layers | Guarantee/Mechanism Law (L10) |
| A4 | Blind-Operator test fails for visual products | generalized to Semantic-vs-Sensory (L13) |
| A5 | "Terminology" itself overloaded | decomposed (Appendix C): domain term (Product) / UI copy (UX) / translation (Engineering) |
| A6 | Possible genuine ties | disproved; Tie Resolution (L9) + Determinism/Totality theorems |

## Appendix B — Overloaded-term decompositions

**Information Architecture** is not atomic — it is six concepts across three layers:
Domain Information Model (Business), Product Information Model (Product), Information
Taxonomy (UX), Navigation Architecture (UX), Screen Information Structure (UX;
expression → Visual), Storage Model (Engineering).

**Workspace** is not atomic — six concepts across four layers: Workspace Purpose
(Product), Workspace Constraints (Product, rooted Business), Workspace Operation (UX),
Workspace Layout Logic (UX), Workspace Expression (Visual), Workspace Implementation
(Engineering).

## Appendix C — Worked examples (34 atomic decisions)

*MP = minimal perturbation (smallest change that alters the decision).*

| # | Domain | Atomic decision | MP class | Owner |
|---|---|---|---|---|
| 1 | Business | Receipts split 70/30 permanently | business | Business |
| 2 | Business | A refund reverses recognized revenue | business | Business |
| 3 | Product | A teacher-balance view must exist | product scope | Product |
| 4 | Product | No multi-company in V1 | product scope | Product |
| 5 | Product | "Derive, never ask" invariant | product principle | Product |
| 6 | Product | Canonical term "Receipt Voucher" | product vocabulary | Product |
| 7 | UX | Balances reached from top nav | experience redesign | UX |
| 8 | UX | Saving refreshes the list to show "Posted" | UX redesign | UX |
| 9 | UX | Receipt captured via single-column form | UX redesign | UX |
| 10 | UX | Ctrl+N starts a new receipt | UX redesign | UX |
| 11 | Visual | Primary action colour is teal | reskin | Visual |
| 12 | Visual | Headings 20px semibold | reskin | Visual |
| 13 | Visual | Dialog fades in 150ms | reskin | Visual |
| 14 | Engineering | Amount stored as integer | impl | Engineering |
| 15 | Architecture | App is offline-capable (requirement) | product scope | Product |
| 16 | Architecture | Hexagonal code layering | impl | Engineering |
| 17 | Database | Voucher numbers unique & sequential | regulatory (DR-090) | Business/Product |
| 18 | Database | Surrogate primary key on receipts | schema design | Engineering |
| 19 | Database | A refund references an existing receipt | business rule (DR-040) | Business |
| 20 | Components | A DatePicker's code contract | impl | Engineering |
| 21 | Components | Button "primary vs secondary" meaning | UX redesign | UX |
| 22 | Documentation | Documenting the split rule | reflects Business | Business (L11) |
| 23 | Testing | Test 1001@70/30 → 701/300 | reflects Business | Business (L11) |
| 24 | Testing | Test cancel-row turns grey | reflects Visual | Visual (L11) |
| 25 | Governance | Phases execute in fixed order | process | Governance (L12) |
| 26 | Governance | Every rule needs an ID before code | process | Governance (L12) |
| 27 | Reports | Student statement must exist & list receipts/refunds | product scope | Product (L16: layout→UX, styling→Visual) |
| 28 | API | Internal endpoint to create a receipt | impl boundary | Engineering |
| 29 | Security | Only the owner can access (guarantee) | product/business | Product (L10; mechanism→Eng) |
| 30 | Accessibility | Fully keyboard-operable (guarantee) | product | Product (L10; focus→UX, ARIA→Eng, contrast→Visual) |
| 31 | Performance | Balances appear <200ms (guarantee) | product | Product (L10; index/cache→Eng) |
| 32 | i18n | Support Arabic + RTL (requirement) | product scope | Product (mirroring→UX, glyphs→Visual, strings→Eng) |
| 33 | Audit | Every financial action on append-only timeline | business (DR-019) | Business (storage→Eng) |
| 34 | Search | Search exists (existence) | product scope | Product (L16: behavior→UX, index→Eng) |

Additional (via L16 existence/usage/build): Notifications, Printing, Validation
(overpayment rejected → Business DR-024; inline behavior → UX; impl → Engineering),
Caching / Synchronization / Offline (guarantee → Product; mechanism → Engineering),
Logging (technical → Engineering; audit → Business).
