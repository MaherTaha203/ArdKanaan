# UX-001 — UX Constitutional Philosophy & Layer Responsibility

| Field | Value |
|---|---|
| Doc ID | UX-001 |
| Title | UX Constitutional Philosophy & Layer Responsibility |
| Phase | 3 (UX Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | P3-000 (governing plan); BC-000…BC-009 (frozen & locked); PC-001…PC-008 (frozen & locked); DOM-001…005 + DR-001…090 (frozen); GOV-012 (layer ownership), GOV-011, GOV-003, GOV-004, GOV-006 |
| Answers | "What is the constitutional responsibility of the User Experience layer?" |

---

> **Nature of this document.** UX-001 is the **framework** of Phase 3 — the UX analog of BC-000.
> It fixes the **constitutional philosophy** of the User Experience layer: what UX is, what it owns,
> what it never owns, and the few permanent principles and invariants every later UX document must
> obey. It defines **no** screen, component, visual language, layout, navigation, colour,
> typography, spacing, design token, usability technique, concrete interaction, or workflow — those
> belong to later documents. It answers **exactly one** question.

## 1. What the User Experience is — and why it exists

**The User Experience is the single surface through which one Owner sees and operates the center's
frozen reality** — its money, its people, its documents, its balances. It is *the window and the
hand*: the window through which frozen truth is seen, and the hand through which frozen actions are
performed. It is **never the author of that truth.**

**Why it exists.** A constitution of frozen business behavior (BC-000…BC-009) is complete but not
yet *livable* — it cannot be seen, navigated, or operated by a human being. The User Experience
makes the frozen business usable by exactly one Owner **without changing a single truth it
presents.** UX is therefore the first layer that touches a *person* and the last layer that may
touch the *truth* — it touches the person and leaves the truth untouched.

This document is authored **first** in Phase 3 because that promise must be fixed before any screen
exists: the interface will handle money, teacher rights, refunds, and balances already frozen in
BC-000…BC-009, and a surface that recomputes a share, alters a status's financial effect, or invents
an approval would be a **constitutional breach disguised as design**. UX-001 makes that class of
error impossible by fixing the boundary every later UX document inherits.

## 2. Constitutional Responsibility

**The UX layer owns (UX-001 fixes the *philosophy* only; it defines no concrete artifact):**

- the **presentation** of frozen business facts, rights, vouchers, balances, and statuses;
- the **operation** of frozen business actions as *surfaces over* Business Rules — the Owner
  initiates; the business layer decides, never the surface;
- the **presentation** of the product's language — UX *shows* the terminology fixed by PC-006; it
  does **not** own, define, or alter it (language ownership belongs to the Product Constitution).

The concrete responsibilities through which this remit is exercised — information architecture,
workspace organization, forms, **usability**, and language/RTL/accessibility presentation — are
owned by the UX **layer** but **allocated to UX-002…UX-007**. **UX-001 defines none of them and
states no usability technique, layout, or interaction.**

**UX never owns (constitutionally forbidden):**

- any **Business Rule** — new, modified, narrowed, or broadened (owned by BC-000…BC-009);
- any **financial calculation** or the **derivation of any truth** (owned by the business layer:
  DR-007, BC-007);
- the **meaning of a workflow**, a status's **financial effect**, or a document's **lifecycle**
  (owned by BC);
- **product scope, actors, or glossary definitions** (owned by PC-004/PC-005/PC-006);
- **domain truth** (owned by DOM);
- concrete **components, screens, visual language, layouts, colours, typography, spacing, design
  tokens, navigation and interaction specifics** (later UX documents + Phases 5–6);
- anything at the **engineering** layer.

## 3. Layer Boundaries

```
Business  (WHAT is true / WHAT may happen)        ← BC-000…BC-009 (frozen & locked)
   ↓ consumes, never modifies
UX        (HOW it is seen & operated)              ← Phase 3
   ↓ consumes, never modifies
Components(the reusable experience vocabulary)     ← Phase 5
   ↓ consumes, never modifies
Screens   (concrete task surfaces)                 ← Phase 6
   ↓ consumes, never modifies
Engineering(implementation of the blueprints)      ← Phases 7+
```

Each layer **consumes the layer above exactly as frozen and modifies nothing upstream.** The
Business → UX boundary is the one this document guards: **truth is never re-decided in
presentation** — a balance shown is the balance the business derived, not a number the surface
produced. A need that cannot be met without changing an upper layer is escalated as an amendment,
never absorbed downward.

## 4. Constitutional Principles *(the stance — why)*

Principles are the permanent **stance** of the UX layer. They are the *why*: directional truths
that guide every judgment. A principle is not itself a pass/fail check — it is the value an
invariant (§5) then makes testable. There are **five**.

- **UXP-01 — Business before UX.** UX is subordinate to the Business and Product Constitutions; on
  any conflict, the higher layer wins (GOV-012).
- **UXP-02 — UX explains business; it never defines it.** Presentation clarifies frozen behavior
  and originates none.
- **UXP-03 — The interface reveals truth; it never produces it.** What the Owner sees is derived by
  the business layer; the surface shows — it does not compute, decide, or store truth.
- **UXP-04 — Authority comes from the constitution, not the screen.** The right to perform an
  action, and the validity of what is performed, come from BC/PC — never from a control's presence,
  prominence, or absence.
- **UXP-05 — Truth wins; the rule is amended, never bent.** When a desired experience cannot exist
  without changing business behavior, work **STOPS** and a Constitutional Amendment is raised
  (GOV-004 §5 / BC-000 §BCG-3); UX never compensates.

## 5. Constitutional Invariants *(the binding guarantees — what must always hold)*

Invariants are the **testable, binding guarantees** every UX artifact must preserve. Unlike a
principle, an invariant is checkable pass/fail and can be violated by a single concrete artifact; a
violation **blocks propagation**. There are **five**.

- **UXV-01 — Behavioral non-creation.** No UX artifact introduces or modifies a Business Rule,
  financial calculation, workflow meaning, status effect, or document lifecycle.
- **UXV-02 — Traceable presentation.** Every UX element that **presents business information or
  initiates a business action** traces to ≥1 frozen **Authority of Behavior** — a Business Rule
  (BR-NNN), or a frozen Product/Domain statement. Pure presentation chrome that conveys no business
  truth and starts no business action needs no such citation.
- **UXV-03 — No UX-computed truth.** No value the UX displays is computed or authoritatively stored
  by the UX; every value is business-derived (DR-007, BC-007).
- **UXV-04 — Presentation neutrality.** No presentation state — visible, hidden, ordered, grouped,
  or formatted — alters a recorded fact, balance, right, or status, or confers any permission.
- **UXV-05 — Product fidelity.** The UX presents exactly one Owner-user (PC-005), invents no role,
  permission, or approval the business does not define, and shows only PC-006 canonical terminology.

## 6. Scope

**In scope of UX-001 (philosophy only):** the definition of the UX layer, its constitutional
responsibility, the layer boundaries, the five principles (UXP), the five invariants (UXV), and the
*allocation* of concrete responsibilities to later UX documents.

**Owned by the UX layer but NOT by UX-001 (allocated to UX-002…UX-007):** information architecture,
workspace organization, forms, usability, and language/RTL/accessibility presentation.

**Outside the UX layer entirely:** business behavior, calculation, workflow meaning, status effect,
and document lifecycle (BC-000…BC-009); product scope, actors, and glossary *definitions* (PC);
domain truth (DOM); concrete components, screens, visual language, layouts, colours, typography,
spacing, design tokens, navigation and interaction specifics (later UX + Phases 5–6); engineering.
**Scope intentionally closed at the philosophy level.**

## 7. Dependencies

- **Consumes (exactly as frozen, modifies nothing):** BC-000…BC-009 (business behavior); P3-000
  (phase plan and boundaries); PC-001…PC-008 (product); DOM-001…005 + DR-001…090 (domain); GOV-012
  (layer ownership).
- **Produces (the frame later documents must obey):** UX-002…UX-007. Each later UX document cites
  UX-001's principles and invariants as its philosophical authority.
- **Never modifies upstream.** CDC applies — *Consumes only. No modification. No narrowing. No
  reinterpretation.*

## 8. Propagation Rule

Every later UX document is checked against the **five invariants (§5)** at its propagation, within
the standard eight quality gates (GOV-003, **Gate 4 (Design / UX consistency)** in focus). UX-001
defines **no** new gate — it only fixes *what those gates verify for UX*. A single invariant
violation blocks propagation.

## 9. Success Criteria

UX-001 is complete when it: defines the UX layer and why it exists (§1); fixes **owns / never-owns**
unambiguously (§2, §6); states a small, permanent set of **principles (UXP)** and **invariants
(UXV)** that every later UX document can cite (§4, §5); introduces **zero** concrete artifacts; is
fully consistent with the Business and Product Constitution locks and P3-000; and contains **only**
constitutional philosophy — no design guidance.

## 10. Strict-Scope Self-Check

UX-001 defines **only** the constitutional philosophy of the UX layer: what it is, its
responsibility, boundaries, five principles (UXP-01…05), and five invariants (UXV-01…05). It authors
**no** screen, component, visual language, layout, navigation, colour, typography, spacing, design
token, usability technique, interaction, or workflow. It introduces **no** Business Rule, no
calculation, no workflow meaning, and reinterprets no Product/Domain/Business statement. It consumes
BC-000…BC-009, P3-000, PC, and DOM exactly as frozen and modifies nothing upstream. Everything
outside constitutional philosophy is explicitly deferred (§6).

---

*FROZEN (v1.0.0, ADR-0050 / AUD-P3-002). UX-001 is the framework of Phase 3 — the constitutional
philosophy of the User Experience layer. It is now the frozen authority every later UX document
(UX-002…) consumes and cites; no further modification is permitted except through the Constitutional
Amendment process (GOV-004 §5 / BC-000 §BCG-3).*
