# UX-005 — Language, RTL & Accessibility

| Field | Value |
|---|---|
| Doc ID | UX-005 |
| Title | Language, RTL & Accessibility |
| Phase | 3 (UX Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | UX-001 (philosophy & invariants); UX-002 (information architecture); UX-003 (workspace architecture); UX-004 (interaction & forms); **PLP-001 (Product UI Language Policy — language selection, frozen)**; PC-006 (product language & glossary, frozen); ADR-0005 (documentation language); BC-000…BC-009 (frozen & locked); P3-000 (governing plan); GOV-012 (layer ownership); GOV-004 §5 (amendment process); GOV-013 (governing review protocol) |
| Answers | "How is the frozen truth made *perceivable* — in the product's own words, in its reading direction, and within reach of the one Owner's senses — without the surface owning the words, the direction, or the truth?" |
| Governed by | GOV-013 — Multi-Agent Review Protocol (FROZEN v1.0.0, ADR-0056 / AUD-P3-006) |

---

> **Nature of this document.** UX-005 is a **structural** UX document under UX-001. It fixes the
> constitutional rules of **perceivable presentation**: the language the surface speaks, the
> direction it reads, and that every presented business fact and every business action the Owner may
> perform is perceivable to the one Owner. It defines **no** screen, component, font, colour,
> contrast value, layout, icon, ARIA attribute, technology, locale file, or translation mechanism —
> those are Phases 5–6 / engineering. It owns **no word** (PC-006 is the naming authority) and **no
> truth** (BC-000…BC-009). It answers **exactly one** constitutional question.

## 1. Executive Summary

A constitution of frozen business behavior (BC-000…BC-009), organized into information (UX-002),
worked in workspaces (UX-003), and operated through interactions and forms (UX-004), is still not
*perceivable* until three things are guaranteed: it is expressed **in the product's own words**, it
is read **in the correct direction**, and it is **reachable by the senses of the one Owner** who
must operate it. UX-005 owns exactly that — **perceivable presentation** — and nothing
else.

These three concerns (Language, Reading Direction/RTL, Accessibility) are not three responsibilities
but **three facets of one**: making the already-frozen, already-organized truth perceivable without
changing it. UX-005 therefore states **ten constitutional rules (LA-01…LA-10)** and **six
invariants (LAV-01…LAV-06)**. Every one is a *presentation* guarantee: the surface renders the truth
faithfully, defers every word to PC-006, **defers the choice of language to the Product Constitution
(PLP-001)**, defers every fact to the business layer, and adds, hides, reorders, and alters
**nothing**. Language, direction, and accessibility are places the surface could *silently distort*
the truth; UX-005 makes that distortion a constitutional violation.

## 2. Constitutional Question

> **How is the frozen truth made *perceivable* — in the product's own words, in its reading
> direction, and within reach of the one Owner's senses — without the surface owning the words, the
> direction, or the truth?**

This is one question, not three. "In the product's own words" is language; "in its reading
direction" is RTL; "within reach of the senses" is accessibility — but the unifier is single:
**faithful *and* perceivable presentation**. (Fidelity covers the Language facet — a coined synonym
is perceivable yet unfaithful — and perceivability covers the accessibility facet; the two together,
not "perceivable" alone, are the responsibility.) The clause "without owning the words, the
direction, or the truth" is the constitutional boundary that keeps the answer inside the UX layer
(UX-001 §2–§3).

## 3. Responsibility Analysis

**The single responsibility: perceivable, faithful presentation.** UX-005 guarantees that the truth
BC froze, PC-006 named, and UX-002/003/004 arranged, is delivered to the one Owner **legibly,
directionally, and perceivably — and identically in meaning to what the business derived.**

**Why the three concerns are one responsibility.**

- **Language** is *which words carry the truth.* The words already exist and are owned elsewhere
  (PC-006). UX-005's concern is only that the surface **speaks those exact words** and coins none of
  its own — a fidelity guarantee, not a naming act.
- **Reading direction (RTL)** is *the orientation in which those words are read.* The product's
  approved UI language is **Arabic** (fixed by the Product Constitution, PLP-001; its parties and
  vouchers — سند قبض / سند صرف / سند استرجاع — are Arabic), so the surface reads right-to-left.
  Direction is a property of *presentation*; it carries no meaning of its own and may change none.
- **Accessibility** is *whether those words, in that direction, actually reach the Owner.* A truth
  that is present but not perceivable has not been presented at all. UX-005's concern is that every
  business meaning is perceivable — never locked behind a single fragile channel.

All three are the same act — **present the truth so it is perceived, and change nothing while doing
so** — seen from three angles. A document that split them would fragment one responsibility;
UX-005 keeps it whole, exactly as UX-003 kept "workspace" whole and UX-004 kept "interaction &
forms" whole.

**What UX-005 does *not* decide.** It does not decide *what* the words mean (PC-006 / BC), *what* a
guidance message says (UX-004 binds that to a BR), *where* information sits (UX-002), *how* work is
grouped (UX-003), or *how* any of it looks or is built (Phases 5–6 / engineering). It decides only
that the presentation is faithful, directional, and perceivable.

### 3.1 Deletion Resistance Proof — why UX-005 must exist independently

The atomicity argument above rests on *dependency* (RTL derives from Language; Accessibility's
textual rule derives from terminology). Dependency alone does not prove a document must *exist*. The
stronger proof is **deletion resistance**: delete UX-005 and show that a specific constitutional
defect becomes possible which **no other frozen document can prevent.**

**The question.** *If UX-005 did not exist, what constitutional defect becomes possible?*

**The defect.** **Silent distortion of frozen truth at the moment of presentation** — the truth
rendered in *coined wording*, in a *direction that reorders or re-values it*, or through a *channel
that leaves a business meaning unperceived.* Because BC-000…BC-009 is complete but not yet livable
(UX-001 §1), this distortion would enter *below* the constitution, where no invariant reaches — a
"constitutional breach disguised as design" (UX-001 §1) with nothing frozen to forbid it.

**Proof that no other frozen document prevents it:**

| Frozen document | What it owns | Why it cannot prevent the defect |
|---|---|---|
| **PC-006** | canonical **terminology** (the words) | Explicitly **defers** UI language, microcopy, and RTL/direction to Phase 3 (PC-006 §1, §6; ADR-0005 §3). It fixes *what a term is*, never whether the surface *displays it*, in *which direction*, or *perceivably*. |
| **PLP-001** | **language selection** (V1: Arabic) | Fixes *which* language is approved (PLP-1/PLP-2), never whether the surface *presents* it faithfully, directionally, or perceivably. |
| **UX-001** | the UX **philosophy** & invariants | Philosophy only; it **allocates** language/RTL/accessibility *away* to a later document (UX-001 §2, §6). UXV-05 states the value ("show only PC-006 terminology") but makes no *presentation* guarantee testable. |
| **UX-002** | **where** information lives (IA) | Governs placement, not the language, direction, or perceivability of what is placed. |
| **UX-003** | **how** work is grouped (workspaces) | Governs grouping, not presentation faithfulness. |
| **UX-004** | **what** an interaction/message says | Fixes the *content* of guidance (bound to a BR); says nothing about the *language, direction, or reach* of that content. |
| **BC-000…BC-009** | business **truth** | Owns what is true, not how a surface renders it. |

Every neighbour either **defers** this concern (PC-006, ADR-0005), **allocates it away** (UX-001), or
owns a **different** responsibility (UX-002/003/004, BC). The guarantee has **no other home.** Absent
UX-005, presentation faithfulness/direction/perceivability would first appear as **Phase-5/6 design
and engineering decisions with no constitutional authority above them** — exactly the class of error
UX-001 §1 exists to make impossible.

**Conclusion.** UX-005 must exist as an **independent constitutional document** because it is the
*only* place the invariant "*the truth is presented in the right words, the right direction, and
within reach — and changed in nothing*" can be fixed *above* Phases 5–6. This also re-proves
atomicity from the opposite direction: the single defect has exactly **three faces** — wrong words,
wrong direction, unperceived meaning — which is precisely why one document owns exactly those three
facets. (LA-10 is a **cross-cutting boundary rule** serving the Language facet — the naming-authority
line — not a fourth facet.)

## 4. Boundary Analysis

UX-005 sits between documents that own the words and the truth (above) and documents that own the
pixels and the code (below). Its six sharpest boundaries:

| Neighbour | Owns | UX-005 owns instead | The line |
|---|---|---|---|
| **PC-006** (Product) | the **canonical terms** and banned synonyms — the *words* | that the surface **displays exactly those words** and coins none | PC-006 *names*; UX-005 *shows the name faithfully*. A term the surface needs but PC-006 lacks is escalated to Product (GG-2/GG-4), never invented here. |
| **PLP-001** (Product) | **which language(s) the product supports** — the *selection* (V1: Arabic only) | that the surface **presents** the Product-approved language faithfully, in its direction | PLP-001 *selects*; UX-005 *presents*. Adding a language is a Product decision (PLP-5) flowing down (L8) — never a UX edit. |
| **ADR-0005** (Governance) | that *documentation* is English-canonical and **UI language/RTL is a Phase-3 concern** | the **presentation & direction** stratum of that deferral (its *selection* stratum is Product, PLP-001) | ADR-0005 deferred UI-language to Phase 3; selection resolved to Product (PLP-001), presentation to UX. |
| **UX-004** (Interaction & Forms) | **what** a guidance/validation message says (bound to its BR) | the **language, direction, and perceivability** of that message | UX-004 fixes the *content*; UX-005 fixes that the content is shown in the right words, direction, and reach — it never edits the content. |
| **UX-002 / UX-003** | **where** information lives and **how** work is grouped | that whatever they present is **perceivable** and **directional** | UX-005 adds no information domain and no workspace; it conditions how any of them is perceived. |
| **Phases 5–6 / Engineering** | fonts, colours, contrast ratios, icons, ARIA, layout, locale files, bidi algorithms, technology | the **presentation-level constraints** those layers must honour — **consuming, not authoring**, the Product accessibility guarantee (GOV-012 #30) | UX-005 says *"business meaning must never depend on colour alone"*; it never says *which* colour, ratio, attribute, or library, and authors no guarantee. |

**Localization boundary (intentional non-scope).** The product serves **one** Owner, **one** center,
and its approved UI language is **Arabic** (PLP-001 / PLP-2). UX-005 builds **no**
internationalization/localization machinery: no locale switching, no translation-management, no
per-user language setting. PC-006's Arabic names are **communication aliases** (NR-3), not a second
locale. **The *scope* of supported languages is Product's, not the surface's** (PLP-1): should the
Owner ever approve a further language, it enters through a **Product** decision (PLP-5 / GOV-004 §5)
and flows **downward** to UX (GOV-012 L8) — the surface then *presents* it, having never selected
it. The UX invariants (LAV-01…06), being language-agnostic, are unaffected either way.

### 4.1 Ownership Boundary Proof — selection & terminology (Product) vs presentation (UX)

Two decisions sit above UX-005 and are **Product-owned**; UX-005 owns only what is left. The frozen
architecture (as resolved by the Owner Decision recorded in PLP-001) fixes this allocation:

- **Product owns *language selection*.** *Which* language(s) the product supports is a
  **capability / scope** decision every possible UI must honor identically → **Product** by GOV-012
  §5 LOA **Q2**, **L16** (capability existence → declaring layer), and **Appendix C #32** ("Support
  Arabic + RTL (requirement) → product scope → Product; mirroring→UX"). The Owner decided it: V1 =
  **Arabic only** (**PLP-001 / PLP-1 / PLP-2**). UX-005 does **not** select a language.
- **Product owns *terminology*.** A canonical term is a **product fact** — the same word in every
  context, fixed *before any surface exists* (PC-006 GG-2). PC-006 owns it via NR-1…NR-4 / GG-1…GG-4.
- **UX owns only *presentation*.** Given the Product-approved language and terms, UX owns how they
  are *presented* — reading direction (**RTL / mirroring**, GOV-012 #32 mirroring→UX), presentation
  fidelity, and perceivability (Owner Decision). These are properties of the **surface**, decided by
  no term and by no screen. UX-005 **consumes** PLP-001 and PC-006 and presents them; it selects,
  coins, and renames **nothing**.
- **The split runs with the layer stack.** GOV-012 / UX-001 §3 place Product above UX; GOV-012 **L8**
  sends the Product **selection** decision *downward* as a constraint UX must honour, and PLP-3
  delegates to UX only the **presentation** of the selected language. UX follows a Product decision;
  it never makes one
  by amending a UX atom (PLP-5).

**No narrowing, no reinterpretation of Product authority.** UX-005 consumes **PLP-001** and **PC-006**
exactly as frozen (CDC — *consumes only*). It cannot **narrow** them: it is *forbidden* to select a
language (LA-02) or coin/rename a term (LA-01/LA-10). It cannot **broaden** them: a new language is
escalated to Product (PLP-5) and a terminology gap to PC-006 (GG-2/GG-4) — both *upward*, never
absorbed downward. And it cannot **reinterpret** them: it restates no policy and re-defines no
meaning — it only guarantees the Product-approved language and terms are presented faithfully. The
Product's selection and terminology authority leave UX-005 exactly as they entered.

## 5. Constitutional Rules

*Rules are grouped by facet. Each rule is a presentation guarantee; none creates, names, or derives
anything. Trace column cites the frozen authority each rule serves (UXV-02).*

### Language (LA-01…LA-03)

- **LA-01 — Terminology is PC-006's, verbatim.** Every business term the surface displays is the
  **PC-006 canonical term** (or its PC-006-registered Arabic alias). The surface uses **no** banned
  synonym (PC-006 §4–§5) and **coins no term of its own**. *(Traces: UXV-05; PC-006 NR-1, NR-2,
  NR-3.)*
- **LA-02 — The surface presents the Product-approved language.** The surface presents the product
  in the **UI language fixed by the Product Constitution** — **Arabic** in V1 (**PLP-001 / PLP-2**).
  UX **consumes** this selection and presents it faithfully; it does **not** select, add, or remove a
  language. Canonical identifiers that PC-006 fixes in a specific form appear in that form. LA-02
  governs only *presenting* the approved language — **not** *which* language is approved (Product,
  PLP-1), and **not** how text is typeset, laid out, mirrored, or rendered (Phases 5–6). Adding or
  changing a supported language is a **Product** decision (PLP-5) that flows **downward** to UX
  (GOV-012 L8); it is never effected by amending this atom. *(Traces: PLP-001 [PLP-1/PLP-2/PLP-5];
  GOV-012 L8; PC-006 NR-3.)*
- **LA-03 — Microcopy is faithful, never authoritative.** The surface **owns the wording of
  non-term text** it must write — labels, prompts, and framing around a business value. Such wording
  may rephrase for clarity but must **assert, narrow, or broaden no business fact or rule**; where it
  surfaces a business meaning it states only what the frozen authority (BR / PC / BC) says.
  *(Traces: UXP-02; UXV-01; UX-004 IX guidance rules.)*

### Reading Direction / RTL (LA-04…LA-06)

- **LA-04 — Default direction is right-to-left.** The surface's default reading direction is **RTL**,
  following the Product-approved language (LA-02 / PLP-001: Arabic in V1). Direction/mirroring is a
  UX presentation property (GOV-012 #32 mirroring→UX) that carries no meaning of its own; if the
  Product ever approves a further language (PLP-5), the surface's direction follows that Product
  policy. *(Traces: LA-02; PLP-001; GOV-012 #32; ADR-0005 §3.)*
- **LA-05 — Direction never mutates a datum.** No reading-direction decision changes any **value,
  the order of any records, or the meaning** of anything shown. A balance, amount, date, voucher
  number, or identifier keeps exactly the value and sequence the business derived (BC-007);
  direction reorients the reading, never the record. *(Traces: UXV-04; UXV-03; BC-007.)*
- **LA-06 — Bidirectional presentation is display-only.** Where Arabic text carries Latin-script
  canonical terms or digits, the mixed-direction rendering **alters no character, no digit, and no
  value**. Bidirectionality is a display concern with **zero** effect on stored or derived truth.
  *(Traces: UXV-03; UXV-04.)*

### Accessibility / Perceivability (LA-07…LA-09)

- **LA-07 — Perceivable presentation of business meaning.** The **accessibility guarantee is owned
  by the Product Constitution** (GOV-012 App. C #30: *guarantee → Product*; focus → UX).
  UX-005 **consumes** that guarantee and owns only its **delegated presentation stratum**: the
  business meaning of every **presented business fact** and every **business action the Owner may
  perform** is **perceivable** to the one Owner — never present-but-imperceptible. UX-005 authors
  **no** accessibility guarantee and **no** technique (ARIA, contrast, keyboard, screen-reader →
  Engineering / Visual). *(Traces: GOV-012 #30 [guarantee→Product; focus→UX]; PLP-001
  [PLP-3 — perceivability delegated to UX]; UX-001 §1; UXV-02.)*
- **LA-08 — Business meaning is never single-channel.** No business status, right, distinction, or
  outcome is conveyed by a **single non-textual channel alone** — e.g., colour, position, or icon
  **without its word** (these are *illustrative* failure channels; UX-005 specifies **none** of
  them, and prescribes no colour, contrast, icon, or technique). Business meaning always carries its
  **PC-006 term**; non-textual channels may reinforce it but never replace it. *(Traces: UXV-05;
  PC-006; UXV-04.)*
- **LA-09 — Accommodation neutrality.** No accessibility or language accommodation may **add, hide,
  reorder, or alter** any business fact, right, balance, status, or permission, or confer any
  authority. Accessibility is presentation, never authority. *(Traces: UXV-04; UXP-04.)*

### Cross-cutting boundary rule — serves the Language facet (LA-10)

- **LA-10 — Naming authority stays with PC-006; no localization machinery at the surface.** When the
  surface must show a term, **PC-006 is the naming authority** (GG-1…GG-4); a needed term PC-006 does
  not define is escalated as a **Product amendment** (GG-2 / GG-4 / GOV-004 §5), never coined by the
  surface. The surface presents the **Product-approved** language (PLP-001) and builds **no**
  localization, translation, or locale-switching system — the *scope* of supported languages is
  **Product's** (PLP-1 / PLP-5), not the surface's. *(Traces: PC-006 §3; PLP-001; UXP-05.)*

## 6. Invariants

*Invariants are the testable, binding guarantees of UX-005. Each is pass/fail and a violation
**blocks propagation** (UX-001 §8). They specialize UX-001's UXV-01…05 (and, for LAV-03, principle
UXP-04) for language, direction, and perceivability. **Enforcement map:** LA-01→LAV-01, LA-03→LAV-04, LA-05/LA-06→LAV-02, LA-07→LAV-06,
LA-08→LAV-05, LA-09→LAV-03. LA-02 (selection deferred to Product, PLP-001), LA-04 (RTL derived from
LA-02), and LA-10 (a boundary rule) are constraints with **no dedicated invariant**.*

- **LAV-01 — Terminology fidelity.** Every business term the surface displays is a PC-006 canonical
  term or registered alias; **zero** banned synonyms; **zero** surface-coined terms. *(Specializes
  UXV-05; enforces LA-01.)*
- **LAV-02 — Direction neutrality.** No reading-direction or bidirectional-presentation decision
  changes any value, order, or meaning of anything shown. *(Specializes UXV-04; enforces
  LA-05/LA-06.)*
- **LAV-03 — Perceivability without authority.** No accessibility or language accommodation adds,
  removes, hides, reorders, or alters any business fact, right, balance, status, or permission, or
  confers any authority. *(Specializes UXV-04/UXP-04; enforces LA-09.)*
- **LAV-04 — No surface-owned truth.** The surface may own the wording of non-term microcopy but
  owns **no term, no truth, and no rule**; any text that asserts a business fact traces to a frozen
  authority. *(Specializes UXV-01/UXV-02; enforces LA-03.)*
- **LAV-05 — Business meaning is textual.** No business status, right, distinction, or **outcome** is
  conveyed by a single non-textual channel alone without its PC-006 term. *(Specializes UXV-05;
  enforces LA-08.)*
- **LAV-06 — Perceivability is testable.** Every presented business fact and every business action
  the Owner may perform has its business meaning **perceivable** to the one Owner; a business meaning
  that is present but not perceivable is a violation that blocks propagation. (UX-005 owns no
  accessibility guarantee — GOV-012 #30 assigns that to Product; this invariant tests only the
  delegated perceivability stratum.) *(Specializes UXV-02; enforces LA-07.)*

## 7. Dependencies

- **Consumes (exactly as frozen, modifies nothing):** UX-001 (principles & invariants — the
  philosophical authority); **PLP-001 (the language-selection authority — Arabic in V1)**; PC-006
  (the naming authority — the words); ADR-0005 (which deferred UI-language presentation to Phase 3);
  UX-002/UX-003/UX-004 (the information, workspaces, and interactions whose presentation this
  conditions); BC-000…BC-009 (the truth presented); P3-000 (phase plan); GOV-012 (layer ownership);
  GOV-004 §5 (the constitutional amendment process cited for upward escalation).
- **Produces:** LA-01…LA-10 and LAV-01…LAV-06 — the language-*presentation*, direction, and
  perceivability guarantees every later UX artifact, component (Phase 5), and screen (Phase 6) must
  obey.
- **Never modifies upstream.** CDC applies — *Consumes only. No modification. No narrowing. No
  reinterpretation.* A need that cannot be met without changing PC-006, a BR, or any upper layer is
  escalated as an amendment (UXP-05), never absorbed into presentation.
- **Governed by GOV-013** — Multi-Agent Review Protocol, from this draft through freeze.

## 8. Self Validation

- **One question, one responsibility.** UX-005 answers exactly one constitutional question (§2) and
  owns exactly one responsibility — perceivable, faithful presentation (§3). Language, RTL, and
  accessibility are demonstrated to be three facets of it, not three responsibilities.
- **No implementation, no UI design, no technology.** UX-005 states **no** font, colour, contrast
  value, icon, layout, ARIA attribute, bidi algorithm, locale file, library, or screen. Every rule
  is a constitutional *guarantee*, never a technique.
- **No duplicated governance.** **Language selection stays with Product (PLP-001)**; words stay with
  PC-006 (LA-01/LA-10); guidance *content* stays with UX-004 (LA-03); information placement stays
  with UX-002; workspace grouping stays with UX-003; looks and code stay with Phases 5–6. UX-005
  restates none of them — it conditions how they are *presented*.
- **No new business behavior.** UX-005 introduces no Business Rule, no calculation, no workflow
  meaning, no status effect, and no document lifecycle; it presents the frozen truth and changes
  nothing (LAV-02/03/04).
- **Boundaries closed.** Language **selection** is Product's (PLP-001, per GOV-012 #32/Q2/L16); UX
  owns only presentation (LA-02/LA-04). The **accessibility guarantee is Product's** (GOV-012 #30),
  consumed by UX-005, which owns only perceivable presentation (LA-07) and authors no guarantee.
  Localization machinery is non-scope at the surface; adding a language is a Product decision
  (PLP-5), never a UX amendment. Terminology authority is explicitly PC-006 (LA-10); accessibility
  confers no authority (LA-09/LAV-03).
- **Enforcement and traceability.** Each LA-/LAV- atom that presents business information or
  conditions a business action cites ≥1 frozen authority (UXV-02). The invariant-enforced rules are
  LA-01, LA-03, LA-05, LA-06, LA-07, LA-08, LA-09 (by LAV-01, LAV-04, LAV-02, LAV-02, LAV-06, LAV-05,
  LAV-03 respectively); LA-02 (selection deferred to PLP-001), LA-04 (RTL derived from LA-02), and
  LA-10 (a boundary rule) are constraints with **no dedicated invariant** (§6).

---

*FROZEN (v1.0.0, ADR-0056 / AUD-P3-006). UX-005 is the Language, RTL & Accessibility document of the
Phase-3 UX Constitution — the constitution of **perceivable, faithful presentation**: LA-01…LA-10
(three facets — Language, RTL, Accessibility — plus the LA-10 cross-cutting boundary rule) and
invariants LAV-01…LAV-06. Language **selection** is Product's (PLP-001); the **accessibility
guarantee** is Product's (GOV-012 #30); UX owns only presentation (RTL/mirroring, fidelity,
perceivability) and authors none of them. Lifecycle under GOV-013: Draft → Adversarial
Self-Hardening → Revision 1 → Readiness Verification (NOT READY — GOV-012 #32) → Revision 2 →
Readiness Verification (NOT READY — GOV-012 #30) → Revision 3 → Readiness Verification (**READY** —
6/6 SOUND, 0 blocking) → Editorial Touch-Up → Owner Approval → this freeze. It is now the frozen
authority every later UX artifact, component (Phase 5), and screen (Phase 6) consumes; no further
modification is permitted except through the Constitutional Amendment process (GOV-004 §5).*
