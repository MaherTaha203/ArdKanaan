# CMP-001 — Design Language Constitution

| Field | Value |
|---|---|
| Doc ID | CMP-001 |
| Title | Design Language Constitution |
| Phase | 5 (Component Library Specification) |
| Status | FROZEN v1.0.0 (Phase 5 · CC1) — adopted & frozen by ADR-0072 (2026-07-29); GOV-013 lifecycle complete (adversarial Panel + independent Judge READY; Owner-approved) |
| Version | 1.0.0 |
| Depends on | GOV-011 (§Phase 5); GOV-012 (layer ownership); GOV-003 (gates); GOV-004 (amendment); GOV-006 (traceability); GOV-010 (Owner Decision Protocol); GOV-013 (review protocol); P5-000 (P5-1…P5-7, §4, §5 VEM, §6, §7, §9); UX-001…UX-006 (frozen); PLP-001 (frozen); PC-001…PC-008 (frozen & locked); BC-000…BC-009 (frozen & locked); DAT-001…DAT-006 (frozen); ADR-0069 (Phase-5 commencement); ADR-0070 (Visual Exploration Mechanism); ADR-0071 (approved **structural** direction + **LIGHT** constraint — carried in per §11; its palette *descriptors* are reclassified non-authoritative by ADR-0072, §11.2) |
| Answers | "What is a CP atom, what may the component layer specify (the Presentation Boundary), and how is the design language expressed as a technology-neutral vocabulary the screens consume — without freezing a single visual value?" |
| Governed by | GOV-011 §2 · GOV-010 · GOV-013 · P5-000 |

---

> **Nature of this document.** CMP-001 is the **framework** of Phase 5 — the Component-layer analog of
> **BC-000 / UX-001 / DAT-001**. It fixes the *grammar* of the presentation vocabulary and the *boundary*
> of what the component layer may specify. Exactly as BC-000 states no Business Rule and DAT-001
> specifies no entity, **CMP-001 decides no colour, typography, spacing, size, radius, border, shadow,
> motion, icon, component appearance, or state value, and authors no CP atom.** Every concrete value
> arrives only through a one-at-a-time Owner-approved design decision, transcribed afterwards (P5-000
> §4; VEM-6). This document is **specification, never code, HTML, or CSS** (P5-1) and names no
> framework, CSS methodology, component library, icon set, or design tool (P5-6).

## 1. Constitutional position

CMP-001 sits **below** the frozen constitutions and the UX Constitution, and **above** Phase-6 screens
and Phase-12 implementation (P5-000 §1):

```
BC/PC+PLP/DOM/DAT  ─┐
UX-001…UX-006       ├─ consumed exactly as frozen (Consume-Don't-Change) ─► Phase 5
                    ┘                                                          │
                         CMP-001 (this framework)                             │ produces the
                             → CMP-002…CMP-009 (family contracts, CP atoms)    ▼ presentation
                             → CMP-FINAL (CP traceability sink)            vocabulary only
                                        │
                                        ▼
                       Phase 6 Screen Blueprints → Phase 12 Frontend
                       (built *from* these documents, never authored *in* them)
```

CMP-001 is authored **first** in Phase 5 (checkpoint CC1) because the *unit* of the vocabulary (what a
CP atom is) and — above all — the *boundary* of what the vocabulary may specify must be fixed before
any component contract or token exists; otherwise each family document would re-invent the CP atom and
re-draw the line between presentation and truth. This is the same first-document logic DAT-001 gives.

## 2. Mission & the one question (three axes)

> **1. What is a CP atom?  ·  2. What may the component layer specify — the *Presentation Boundary*?  ·
> 3. How is the design language expressed as a technology-neutral vocabulary the screens consume?**

Axis 1 fixes the **unit** (§4). Axis 2 fixes the **boundary that protects frozen truth and UX** (§3) —
the Component-layer analog of DAT-001's Authority Boundary. Axis 3 fixes **implementation-neutrality**
(§5–§7; P5-1/P5-6). The framework introduces no design value; it produces the CP grammar, the token and
component-contract architecture, the Presentation Boundary, the cross-component grammar, the Phase-5
specification discipline, and the invariants that CMP-002…CMP-009 and the CP sink obey.

## 3. The Presentation Boundary (the central doctrine)

Where DAT-001 asks *"what may become persisted truth?"*, CMP-001 asks *"what may the component layer
specify?"* — and the answer is **far narrower than "what looks good"**:

> **The component layer may specify only the *presentation vocabulary* that already-frozen truth and
> already-frozen UX rules require — plus the pure presentation chrome that carries that vocabulary —
> and never any truth, calculation, workflow meaning, information home, action, term, language, role,
> or judgment.**

### 3.1 MAY specify (the presentation vocabulary)
- **Design-token slots** (§5) — the named value-slots of the vocabulary (+ their Owner-decided values,
  transcribed later);
- **Component contracts** (§6) — structure, states, and behaviour of each component family;
- **Cross-component grammar** (§7) — the relationship and constraint laws that make the vocabulary one
  system.

### 3.2 CONSUMES as frozen and must NEVER redefine
- **UX rules** — IA information homes (UX-002), WA workspaces & the 17-action registry (UX-003), IX
  interaction lifecycle/classes/invariants (UX-004), LA language/RTL/perceivability (UX-005). A
  component never re-sequences a workflow (IX-10), re-homes information, adds/removes a WA-06 action, or
  re-decides adjudication (IX-07).
- **PLP language** — Arabic-only (PLP-2); the vocabulary *presents* Arabic and builds no localization
  or locale-switching machinery (LA-10).
- **PC actors** — the single Owner-user (PC-005: AX-1/AX-2/AX-4); **no** role, permission, or
  multi-tenant component, state, or theming (P5-5).
- **BC/DAT truth** — the vocabulary **reveals** business-derived values, never computes or stores them
  (UXV-03); a derived value is revealed **read-only** (IX-08), never an editable field.

### 3.3 The classifying test (authority, not visual desirability)
*Does a frozen UX atom (and through it a BR/PR) require a surface vocabulary for this?*
- **Yes** → it may be a CP atom **citing that authority**.
- **No frozen authority requires it, but it is pure presentation chrome** that conveys no business
  truth and starts no business action → it may exist as chrome **without a citation of its own**
  (**UXV-02**), owned by the vocabulary it carries.
- **No frozen authority requires it and it is not carrying an authorised element** → it is decoration
  the constitution does not need → **not authored** (P5-5/P5-2).

This yields the rule **"no CP atom without an upstream trace — direct, transitive, or the explicit
UXV-02 chrome disposition"** (P5-2 read with UXV-02): the component layer stays presentation and never
becomes a second author of truth or behaviour (UXV-01/03/04; P5-4).

### 3.4 Binding constraints the vocabulary must honour (first-class)
- **Specification-only** — no code, HTML, or CSS (P5-1); **technology-neutral** — the specification
  names no framework, CSS methodology, library, icon set, or design tool (P5-6).
- **Single-user simplicity** — no role/permission/multi-tenant components, states, or theming
  (PC-005; PA-2; P5-5).
- **Arabic-first / RTL default** — direction is RTL by default (LA-04) and mutates no datum, order, or
  digit (LA-05/LA-06); spacing and layout use **logical** start/end properties (the mechanism of the
  LA-04 mirroring), never physical left/right.
- **Perceivable presentation** — business meaning and every distinguishable state must be perceivable
  (LA-07).
- **Status is never single-channel** — business meaning (e.g. a voucher's posted/cancelled state)
  always carries its PC-006 **word**; colour, icon, or position may only reinforce it, never replace it
  (LA-08).
- **Derived is read-only** — no input affordance ever requests or accepts a value the system can derive
  (IX-08).
- **Light interface** — the intended application UI is **light** (Owner-approved high-level constraint,
  ADR-0071; §11). "Light" fixes only the high-level environment; it fixes **no** value (§11.2).

## 4. CP-atom taxonomy

> **A CP atom (`CP-NNN`) is the smallest constitutionally-ownable statement of presentation vocabulary
> — traceable to the frozen UX authority it serves (and through it a BR/PR), or explicitly dispositioned
> as pure presentation chrome (UXV-02) — expressed independently of any rendering technology.**

Every CP atom is **exactly one** of **five kinds**. Each carries an ID (`CP-NNN`), is **traceable per
§3.3** (a cited UX atom → BR/PR, transitively, or the UXV-02 chrome disposition), introduces **no new
truth or behaviour** (P5-4), and **names no** technology (P5-6). Structure, State, and Behaviour are
**three separate atom types** (Owner-ratified) — the separation serves traceability and verification.

| Kind | States | Owns | Trace (§3.3) |
|---|---|---|---|
| **CP · Design-Token** | that a named presentation value-slot **exists**, at a category (§5.2) and a **semantic/component** layer (§5.1) | one named semantic or component slot — *the slot and its meaning, never its Owner-decided value* | the presentation rule the slot serves (status→LA-08; derived-display→IX-08; legibility→LA-07; logical spacing→LA-04) **or** the explicit UXV-02 chrome disposition (motion, elevation, z-index, focus/selection, decorative iconography — §5.2). Primitive values are pooled sub-slots (§5.1/§5.3), not independent atoms |
| **CP · Component-Structure** | the compositional anatomy (named parts/slots and their arrangement roles) of one component family, implementation-neutral | one component family's structural contract | the UX surface-need requiring it — a WA action/workspace, an IA information home, an IX Form (IX-02) |
| **CP · Component-State** | one presentation state a component must be able to express, asserting only that the state is **perceivably distinguishable** | one distinguishable state of one component | the rule requiring the state be perceivable — LA-07 (+ the specific rule: derived-display→IX-08; guidance/invalid→IX-04; status→LA-08). *A State atom never re-cites a lifecycle guarantee — that is a Behaviour (tie-break, below)* |
| **CP · Component-Behaviour** | one presentation-level guarantee a component makes (never a business judgment — IX-07) | one behavioural contract | the IX lifecycle rule it realizes — reveal-derived-read-only→IX-08; permanence-before-act→C2/IX-04; RTL default→LA-04 |
| **CP · Grammar / Relationship** | a consistency law holding **across ≥2 vocabulary elements — components *or* token slots** — the "one unified grammar" and the foundational token relationships/constraints | a cross-element relationship or constraint (the analog of DAT-001's Relationship **and** Constraint kinds) — e.g. a token scale/ramp/ladder ordering, the layer-reference cardinality (§5.1), action-emphasis consistency, the form-flow order, data-display hierarchy, screen↔output parity | the cross-cutting authority it unifies (form-flow lifecycle→IX-03; irreversible-action distinction→IX-04; single-channel-meaning→LA-08; emphasis-never-confers-authority→UXP-04) **or** the UXV-02 chrome disposition for a purely-chrome relationship (e.g. an elevation ladder) |

**Disjointness discriminator (mirrors DAT-001 §3).** A value-slot is a **Token**; a component family's
anatomy is **Structure**; a condition it can be *in* is a **State**; a guarantee about how it *acts* is
a **Behaviour**; a law spanning **two or more vocabulary elements** (components or token slots) is
**Grammar**. The five kinds are **exhaustive and mutually exclusive** for the presentation vocabulary.

**Tie-breaks (to preserve mutual exclusivity):**
1. **State vs Behaviour.** A lifecycle *guarantee* mandated by an IX rule (e.g. non-acceptance of a
   derived value, IX-08; not-accepting input while disabled) is authored as **Behaviour** only; the
   corresponding **State** atom asserts only *perceivable distinguishability* (LA-07) and does **not**
   re-cite the lifecycle authority.
2. **Structure vs Grammar (the unit of a "component family").** A *component family* is the unit a
   CMP-00N contracts as one nameable component (e.g. "the shell", "a table", "a field"). A law
   *internal* to one family is Structure/State/Behaviour; a law *relating two independent families or
   token slots* is Grammar. The application shell is **one** family: its internal pane/region anatomy is
   **Structure**; a law relating the shell to an independent family (e.g. table-in-content behaviour) is
   **Grammar**.

## 5. Token architecture

### 5.1 Three layers (Owner-ratified)
**primitive → semantic → component.**
- **Primitive** — a raw, implementation-independent **pooled value** with **no meaning**; **not an
  independently-citable atom** — it is owned by the semantic token(s) that reference it.
- **Semantic** — a **purpose alias** that carries the **authoritative design meaning and the upstream
  trace** (a cited presentation rule, or the UXV-02 chrome disposition); references a primitive.
- **Component** — a per-family slot that **consumes a semantic token**.
- **Layer-reference cardinality** (a Grammar constraint, §4): a semantic references ≥1 primitive; a
  component consumes ≥1 semantic; no component references a primitive directly.

### 5.2 Token categories (structure only — NO values)
For each category CMP-001 fixes the category, the three layers, its **trace disposition** (authority-
bearing vs pure chrome), and the frozen constraint it must honour. **Every concrete value is an Owner
decision, transcribed (VEM-6).** The **responsive** stance is §8.

| Category | Trace disposition | Frozen constraint |
|---|---|---|
| Colour | authority-bearing where it conveys meaning (status→LA-08); otherwise chrome (UXV-02) | status never sole channel (LA-08); light (§11) |
| Typography | authority-bearing (legibility/perceivability→LA-07; Arabic/RTL→LA-04/06) | Arabic-first; datum/digit-safe (LA-05/06) |
| Spacing / sizing | logical start/end (LA-04); otherwise chrome | balanced density is discipline, not a value (§7/§11) |
| Radii / borders | chrome (UXV-02), except a border that *carries* a perceivable state (LA-07) | — |
| Elevation / shadow | pure chrome (UXV-02) | restraint is discipline, not a value (§7); light (§11) |
| Motion | pure chrome (UXV-02) | conveys no meaning alone (LA-08 spirit) |
| Iconography | reinforcing icon → LA-08; decorative icon → chrome (UXV-02) | icon reinforces, never replaces the word (LA-08) |
| Z-index / layering | pure chrome (UXV-02) | — |
| Focus / selection affordance | pure chrome (UXV-02) — perceivable (LA-07) | perceivable (LA-07) |

### 5.3 Traceability chain (Owner-ratified, mechanically legible)
Every presentation value is traceable along one legible chain:

> **Frozen authority (BR/PR via a UX atom) → presentation requirement (or the UXV-02 chrome
> disposition) → semantic token / component contract → primitive value where applicable.**

The **semantic and component** layers carry the trace. A **primitive** is a pooled sub-slot with no
trace of its own, reached through the semantic token that owns it. **No orphan:** every primitive is
referenced by ≥1 semantic token; every semantic token is either traced to a cited presentation rule or
explicitly dispositioned as UXV-02 chrome; every component value resolves to a semantic → a presentation
requirement (or chrome) → a frozen authority. The CP sink (CMP-FINAL) verifies this mechanically.

## 6. Component-contract architecture

A component family (specified in a CMP-00N) is contracted through the three separate atom types (§4):
- **Structure** — the implementation-neutral anatomy (named parts/slots and their arrangement roles),
  citing the UX surface-need it serves. Structure names roles, never pixels, colours, or CSS.
- **State** — the set of presentation states the component must be able to express, each a separate
  atom asserting *perceivable distinguishability* (LA-07) and citing the specific rule that requires
  the state exist (e.g. read-only/derived because IX-08 requires derived values be revealed and
  non-editable; invalid/guidance because IX-04 requires rule surfacing). A State atom fixes that the
  state is enumerated and perceivable; it fixes **no** visual treatment and does not re-cite the
  lifecycle authority (tie-break §4.1).
- **Behaviour** — the presentation-level guarantees the component makes (e.g. reveals a derived value
  read-only; surfaces permanence before an irreversible act), each citing its IX rule. Behaviour is a
  presentation guarantee, **never** a business judgment (adjudication stays in the business layer,
  IX-07).

No component contract may introduce a component the frozen UX rules do not require (§3.3), a role/
permission variant (§3.4), or any value (§5).

## 7. Cross-component grammar

The "unified grammar" is the set of **Grammar / Relationship** atoms (§4) that make the vocabulary one
system. CMP-001 fixes that these laws exist and are traced; **their concrete visual treatment is a
later CP decision** (§10). The grammar carried in from the approved **structural direction** (ADR-0071
"Sophisticated Operational Simplicity", as *discipline*, not values — §11.1) includes, at minimum:
- **Action-emphasis consistency** — a **consistent, perceivable action-emphasis hierarchy exists** and
  is applied predictably across the product, so the operator distinguishes actions at a glance. *Its
  ranks and their visual treatment are later CP decisions.* Cites ADR-0071 (the "action hierarchy"
  grammar element), **UXP-04** (emphasis never confers authority — the constraint the hierarchy obeys),
  and **IX-04** for the irreversible/destructive distinction. *(IX-05 is not cited — its five
  consequence classes are a business classification, not a presentation-emphasis ladder.)*
- **Form-flow order** — a form realizes the IX-03 interaction lifecycle (**meaning** order only — IX-03
  prescribes no surface arrangement), and the approved direction adds the reading-order discipline
  *context → required input → derived information → consequence → action*, with derived revealed
  read-only (IX-08) and permanence surfaced before the act (C2/IX-04). *The spatial/visual treatment is
  a later CP decision.*
- **Data-display hierarchy** — dense information is made legible primarily through typography,
  alignment, spacing, and grouping (cites the IA information homes + LA-07 perceivability + LA-08 status
  rule). *"Balanced density", and the presence/weight/treatment of any separators or chrome, are a
  later CP decision.*
- **Screen ↔ output parity** — screen and printable output share one grammar (§9). Cites ADR-0071 (+
  LA-08 for status-language parity, §9). *The visual treatment is a later CP decision.*

Goal (P5-000 §Phase 5 success criterion): **predictable relationships**, not visually identical
components.

## 8. Responsive stance — desktop-first, responsively resilient (Owner-ratified)

CMP-001 does **not** freeze Ard Kanaan as a rigid desktop-only interface, and does **not** design a
separate mobile product. The stance is **desktop-first, responsively resilient**:
- The primary operational target is **desktop/laptop financial administration**.
- Component and layout grammar must **not depend on one exact viewport width**; reasonable resizing and
  common laptop/desktop viewport variation must remain usable.
- **Unnecessary breakpoint complexity is avoided.** If breakpoints are ultimately required, each must
  be **justified by actual layout behaviour**, not copied from a framework.
- CMP-001 introduces **no framework/library breakpoint terminology or system**; the exact breakpoint
  system (if any) is a **later design decision**.

## 9. Outputs & print are first-class

Printable outputs (statements, vouchers, reports, printable financial documents) are a **first-class
part of the Ard Kanaan design language**, not an afterthought (CMP-009). Screen and output **share**:
typography principles, hierarchy, spacing logic, semantic status language where applicable (LA-08), and
institutional identity. But **print/output is optimized for its own medium** — it is **not** a
screenshot of the screen UI. That print is optimized for print legibility and information-first
economy is a **medium discipline; its concrete output values are a later Owner design decision** (§10).
CMP-001 fixes that screen↔output parity is a grammar law (§7) and that outputs are first-class; it
fixes **no** output value.

## 10. Phase-5 specification discipline & the design-decision process

Every **material visual decision** follows the Owner-approved process (P5-000 §4; VEM):

> **RESEARCH → CURATED REFERENCES → PRINCIPLES WORTH BORROWING → ORIGINAL ARD KANAAN ALTERNATIVES →
> VEM COMPARISON → OWNER REVIEW → OWNER APPROVAL → CP TRANSCRIPTION.**

- **Research** actively uses the available design resources — installed UI/UX/design Skills, relevant
  session MCP capabilities, and third-party component/reference resources (including 21st.dev/Magic)
  **when actually available and authenticated** (recorded as unavailable when they are not). External
  examples are **research inputs, not design authority**: none is copied wholesale, and nothing becomes
  authoritative because an external source proposes it (P5-7; GOV-001 §7.2). *(This process may name
  research resources; the authoritative specification and vocabulary still name no design tool —
  CMV-08.)*
- **VEM comparison** stays **NON-AUTHORITATIVE** (VEM-1…VEM-6): a lens for the Owner's eye, never a
  source of truth; it does not open the implementation track (Phase 7 stays gated).
- **CP transcription** occurs **only** after explicit Owner approval, recorded via an ADR and the
  relevant CP atom (VEM-6).

**Decision order (Owner-ratified flexibility).** The Phase-5 decisions proceed **foundation-first**
(the D0…D11 sequence of P5-000 §4), but the sequence is **not irreversible**: tightly-related decisions
are evaluated **together** when separating them would force artificial choices — in particular
typography, surfaces, spacing, borders, and colour interact perceptually and their **relationships are
evaluated visually before any isolated numeric value is frozen**. The Owner approves **every** material
design decision regardless of grouping.

## 11. Approved high-level constraints carried in (and what is NOT authoritative)

### 11.1 Carried in as approved
- **Structural direction** — Direction ④ "**Sophisticated Operational Simplicity**" (ADR-0071), carried
  in as **design discipline and grammar** (§7): the interface recedes behind the work; balanced
  density; one unified component grammar; the form-flow reading order; data-display hierarchy from
  typography; screen↔output parity. **These are grammar/discipline, not visual values**, and each
  carries "visual treatment deferred to a later CP decision" (§7).
- **Light interface** — the intended application UI is **LIGHT** (Owner-approved high-level constraint;
  ADR-0071).

### 11.2 Exact values deferred; palette descriptors reclassified non-authoritative
Per **ADR-0071** (its Decision point 3), every **exact token value is DEFERRED** — the exact background
colour, white vs. off-white, surface contrast, **borders (presence, weight, colour)**, **accent** (role
scope and colour), **action colours**, shadows, elevation, and warmth/coolness — all remain **future
Owner design decisions**. More broadly, **no** colour, font, radius, shadow, spacing, dimension, button
shape, surface treatment, or component appearance is authoritative unless the Owner has explicitly
approved it as a design decision.

Per the **Owner's CMP-001 framework review (amendments 4–5)**, the specific palette **descriptors** used
to *characterize* the approved direction (monochrome · black primary · single blue accent ·
"Vercel-style") and everything shown in the VEM explorations are **NON-AUTHORITATIVE** exploratory
characterization; the only high-level visual constraint carried forward is **LIGHT** (with the
operational-simplicity structure of §11.1). **Governance note (Consume-Don't-Change):** this
reclassification narrows ADR-0071's own point-2 characterization and is therefore recorded as
**ADR-0072**, which amends ADR-0071 (GOV-004 §5); this document **cites ADR-0072 as its authority** —
it does not override ADR-0071 inline. The VEM remains exploratory evidence only (VEM-2/VEM-5).

## 12. Document decomposition (working architecture — neutral names)

Accepted as a **working architecture** (not a reason to prescribe visual values). Indicative (P5-000
§6), refined before drafting; **no CMP-00N is authored until its upstream Owner decisions are approved**
(P5-000 §4). Titles/descriptions carry **no VEM-derived visual decision**. *(P5-000 §6's map uses the
casing "CMP-final / Component Traceability Matrix & Coverage"; the Owner-ratified names below govern and
P5-000 §6 is reconciled to them at freeze.)*

| Doc | Title (Owner-ratified, neutral) |
|---|---|
| **CMP-001** | Design Language Constitution *(this framework)* |
| **CMP-002** | Foundations & Tokens |
| **CMP-003** | Shell & Navigation |
| **CMP-004** | Surfaces & Containers |
| **CMP-005** | Actions & Action Hierarchy |
| **CMP-006** | Inputs & Forms |
| **CMP-007** | Tables & Data Display |
| **CMP-008** | Feedback & States |
| **CMP-009** | Outputs & Print |
| **CMP-FINAL** | CP Traceability Matrix |

CMP-002 (Foundations & Tokens) is authored first among the families because every other family consumes
it; CMP-FINAL is the CP sink (the analog of BC-009 / UX-006 / the DDL sink): every CP → its UX/BR
authority or explicit UXV-02 chrome disposition (0 orphan), and every surface-requiring UX rule and
every Phase-6 screen need expressible from the contracts (0 gap).

## 13. Invariants (CMV — each testable at freeze)

- **CMV-01 — No value.** CMP-001 fixes no colour/type/spacing/size/radius/border/shadow/motion/icon/
  component-appearance/state value; it authors no CP atom.
- **CMV-02 — Traceable or it does not exist.** Every CP atom is traceable — directly via a cited UX
  atom (→ BR/PR), transitively via its owning semantic token, or by the explicit UXV-02 pure-chrome
  disposition; no orphan CP (P5-2 read with UXV-02).
- **CMV-03 — Presentation Boundary holds.** No CP specifies truth, calculation, workflow meaning,
  information home, action, term, language, role, or judgment (§3; P5-4).
- **CMV-04 — Reveal, never author.** Derived/business values are revealed read-only (IX-08/UXV-03);
  the vocabulary never computes or stores.
- **CMV-05 — Single channel forbidden.** Business meaning always carries its word; colour/icon/position
  only reinforce (LA-08).
- **CMV-06 — RTL-logical & datum-safe.** Direction is RTL-default and logical (start/end); it mutates
  no value, order, or digit (LA-04/05/06).
- **CMV-07 — Single-user.** No role/permission/multi-tenant component, state, or theming (PC-005; P5-5).
- **CMV-08 — Specification-only & technology-neutral.** No code/HTML/CSS; the **specification and the
  vocabulary** name no framework/CSS/library/icon-set/design-tool (P5-1/P5-6). *(The §10 research
  process may name research resources; the vocabulary may not.)*
- **CMV-09 — VEM & descriptors non-authoritative.** No VEM item and no ADR-0071 palette descriptor is
  authoritative; authority arrives only by an Owner-approved decision transcribed into a CP atom
  (VEM-6; §11.2, recorded via ADR-0072).
- **CMV-10 — Five kinds, disjoint & exhaustive.** Every CP atom is exactly one of Design-Token /
  Component-Structure / Component-State / Component-Behaviour / Grammar-Relationship; Grammar covers
  relationship and constraint laws across components **or token slots** (§4).
- **CMV-11 — Traceability chain legible.** Frozen authority → presentation requirement (or UXV-02
  chrome) → semantic token/component contract → primitive value where applicable; every primitive is
  referenced by ≥1 semantic (§5.3).
- **CMV-12 — Outputs first-class, medium-optimized.** Screen and output share the grammar (§7/§9); print
  is optimized for print, never a screenshot of the screen.

## 14. Governance & review

- **Full GOV-013 lifecycle** — CMP-001 runs Architectural Discovery (Owner-approved, with 10
  amendments) → Constitutional Draft → Adversarial Self-Hardening → Revision → Readiness Verification
  (Panel + independent Judge) → Gate → **Owner Approval** → Propagation → **Freeze** (P5-000 §9). CMP-001
  freezes on the Owner's explicit freeze approval, recorded via **ADR-0072 — a single freeze ADR that
  both adopts (freezes) CMP-001 and amends ADR-0071** — which also records the 10 amendments and the
  ADR-0071 palette-descriptor reclassification (§11.2). Every "Owner-ratified" stance in this document
  (the §4/§5 architecture, §8 responsive stance, §10 process and order) is anchored to ADR-0072.
- **Eight quality gates (GOV-003)** — Gate 4 gains visual-design-language scope; the register and
  traceability are verified per GOV-003.
- **Amendments** — post-freeze changes only via GOV-004 §5.
- **CMP-00N & CP atoms** — authored only after their upstream Owner design decisions are approved
  (P5-000 §4). This document authors none.

---

*FROZEN v1.0.0 (ADR-0072) — the Design Language Constitution, the framework of Phase 5, subordinate to
GOV-011 and P5-000. It decides no design value and authors no CP atom; it fixes the Presentation
Boundary, the CP atom taxonomy, the token and component-contract architecture, the cross-component
grammar, the responsive stance, the outputs-first-class principle, the design-decision process, and the
invariants that every CMP-00N and the CP sink obey. GOV-013 lifecycle complete — Architectural
Discovery (Owner-approved, 10 amendments) → Draft → adversarial four-lens Panel → Revision → independent
Judge READY → Owner freeze approval. Post-freeze changes only via GOV-004 §5.*
