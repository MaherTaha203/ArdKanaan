# ADR-0048 — Phase 2 Closure & Lock; Phase 3 Authorization

| Field | Value |
|---|---|
| ADR | 0048 |
| Title | Phase 2 Constitutional Closure & Lock; Phase 3 Authorization |
| Phase | 2 → 3 |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

Phase 2 (Business Constitution) was authorized by ADR-0037 and governed by P2-000. Its
ten-document set was authored one at a time, each DRAFT → Owner review → propagation: BC-000
(ADR-0038), BC-001 (ADR-0039), BC-002 (ADR-0040), BC-003 (ADR-0041), BC-004 (ADR-0042), BC-005
(ADR-0043), BC-006 (ADR-0044), BC-007 (ADR-0045), BC-008 (ADR-0046), BC-009 (ADR-0047). BC-009 —
the constitutional sink — proved coverage, traceability, and completeness and demonstrated
BX-1…BX-6 (AUD-P2-011), while explicitly **not** declaring closure (Proof precedes Authorization).

On 2026-07-20, after successful BC-009 propagation and verification, the Owner issued the
Engineering Order **"Phase 2 Constitutional Closure and Phase 3 Authorization."** This ADR records
Parts I, II, and III (authorization) and Part IV (governing principles) of that order. It performs
**administrative authorization only**: it introduces no constitutional truth, and modifies no
Business Rule, Product Constitution statement, or Governance principle. Decision category
(GOV-010 §5): Governance (phase-lifecycle).

## Decision

**PART I — Close Phase 2.** Declare **Phase 2 (Business Constitution) CLOSED**. Record that
BX-1…BX-6 (BC-000 §8) are satisfied (AUD-P2-FINAL); the Business Constitution is complete; BC-009
remains the constitutional proof artifact; and **closure is authorized by this Owner Engineering
Order, not by BC-009 itself.**

**PART II — Lock Phase 2.** The complete Business Constitution is **FROZEN & LOCKED**. The ten
artifacts below become read-only constitutional references — no direct editing, no clarification
document may redefine them, no downstream phase may reinterpret a Business Rule:

- **BC-000** Business Constitution Framework (Dual Authority Doctrine).
- **BC-001** Programs, Pricing & Distribution Policy Rules (BR-001…018).
- **BC-002** Registration, Installment & Payer Rules (BR-019…027).
- **BC-003** Receipt, Voucher & Numbering Rules (BR-028…040).
- **BC-004** Teacher Entitlement & Debt Rules (BR-041…048).
- **BC-005** Refund & Adjustment Rules (BR-049…057).
- **BC-006** Teacher Payment & Settlement Rules (BR-058…066).
- **BC-007** Balances & Party Financial Standing Rules (BR-067…073).
- **BC-008** Non-Program Revenue, Expense & Lifecycle Rules (BR-074…087).
- **BC-009** Phase 2 Traceability Matrix & Coverage (proof; INV-41).

The Business Constitution becomes the single authoritative source for business behavior. Any
future modification to BC-000…BC-009 proceeds **only** through the constitutional Amendment
process (GOV-004 §5 / BC-000 §BCG-3) — never by ad-hoc reading.

**PART III — Authorize Phase 3.** Open **Phase 3 — UX Constitution** under the universal
phase-entry law (GOV-011 §2: Phase 2 frozen ✓, all gates passed ✓, explicit Owner authorization ✓).
Its mission: transform the frozen Business Constitution into a complete User Experience
Constitution **without changing business behavior**. Phase 3 **consumes** BC-000…BC-009 exactly as
frozen. The commencement act and the P3-000 master-plan adoption are recorded separately in
ADR-0049.

**PART IV — Phase 3 governing principles.** Phase 3 obeys: Business before UX; UX explains
business, it never defines business; every interaction traces back to frozen Business Rules; every
screen is derivable from constitutional behavior; and **if UX cannot be produced without changing
business behavior — STOP and raise a Constitutional Amendment request; never compensate through
UX.** No UX artifact may introduce new/modified Business Rules, accounting behavior, financial
calculations, workflow reinterpretation, or constitutional exceptions.

## Interpretation boundaries

- Closure and lock are **governance acts, not business decisions**: they certify the ten existing
  documents and introduce no new constitutional statement.
- The lock takes effect from this closure: no later phase, document, or decision may reinterpret,
  weaken, or override a Business Rule; release is only by an Owner-authorized amendment (GOV-004 §5).
- **This ADR authorizes Phase 3 but does not itself commence it or adopt its master plan** —
  ADR-0049 does that. UX ownership boundaries are governed by GOV-012 (Business ▷ UX).
- No Domain, Product, or frozen Governance/Business content is modified.

## Consequences

- **Phase 2 CLOSED & LOCKED**; BC-000…BC-009 are the sole, immutable business reference for all
  later phases, accepted-against, never reinterpreted.
- **Phase 3 authorized** (opened/commenced via ADR-0049).
- **Registers:** RDM-001 (Phase 2 → CLOSED & LOCKED; Phase 3 → authorized), DEC-000 (next ADR-0050
  after ADR-0049), IDX-001, GOV-009, P2-000 tracker (phase complete).
- **Audit:** AUD-P2-FINAL — Business Constitution Completion Report; BX-1…BX-6 all met.
- **Blast radius:** RDM-001, IDX-001, DEC-000, GOV-009, P2-000 (all LIVING). No frozen content
  changed.
