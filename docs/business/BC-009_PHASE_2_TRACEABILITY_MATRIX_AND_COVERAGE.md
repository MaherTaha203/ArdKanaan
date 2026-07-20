# BC-009 — Phase 2 Traceability Matrix & Coverage

| Field | Value |
|---|---|
| Doc ID | BC-009 |
| Title | Phase 2 Traceability Matrix & Coverage |
| Phase | 2 (Business Constitution) |
| Status | DRAFT |
| Version | 0.1.0 (draft — awaiting constitutional review) |
| Depends on | BC-000 (framework + §8 BX-1…BX-6); BC-001…BC-008 (frozen, the proof subjects); P2-000 §5/§7/§8; DOM-004 (DR-001…090, frozen); PC-001…PC-008 (frozen); GOV-006 (traceability), GOV-004 §5 (amendment) |
| Answers | "How is the constitutional completeness, traceability, and closure of the Phase 2 Business Constitution objectively demonstrated?" |

---

> **Nature of this document — Constitutional Closure (the Sink).** BC-009 is **not** a
> Business Rules document and **not** an Observation document in the sense of BC-007. It is the
> **constitutional sink** of BC-001…BC-008: its responsibility is **proof, never production**.
> It creates, modifies, interprets, narrows, broadens, and legitimizes **nothing**. It defines
> **no** BR, no DR, no terminology, no behavior, no workflow, no lifecycle, no responsibility.
> Every statement below is **objectively reproducible** from the frozen repository; no human
> interpretation is required to verify it.

## 1. Constitutional Question

*How is the constitutional completeness, traceability, and closure of the Phase 2 Business
Constitution objectively demonstrated?*

## 2. Primary Constitutional Principle

**BC-009 never creates, modifies, interprets, narrows, broadens, or legitimizes any
constitutional truth. It only demonstrates that the frozen constitutional rule set satisfies
the constitutional closure criteria (BC-000 §8, BX-1…BX-6).**

If any demonstration below fails, BC-009 **STOPS** and records an **Amendment candidate** per
GOV-004 §5 / BC-000 §BCG-3. BC-009 never repairs a gap and never compensates by authoring a
new rule.

## 3. The five constitutional responsibilities

1. **Coverage** — every in-scope frozen Domain Rule is covered by ≥1 frozen Business Rule (§6).
2. **Completeness** — no constitutional gap exists inside Phase 2 (§7).
3. **Traceability** — every Business Rule traces to an Authority of Truth (DR) **and** an
   Authority of Constitutional Legitimacy (PC) (§8).
4. **Closure** — objective satisfaction of BX-1…BX-6 is demonstrated (§9). BC-009 demonstrates
   satisfaction only; it does **not** declare Phase 2 closed — only an Owner Engineering Order
   may authorize constitutional closure.
5. **Validation** — every matrix, count, and claim is directly auditable from the frozen
   constitutional artifacts (§10).

## 4. Constitutional statistics *(counts only — reproducible)*

| Metric | Value | Reproduction |
|---|---|---|
| Frozen business documents | 8 (BC-001…BC-008) + framework BC-000 | `ls docs/business/BC-00[0-8]_*.md` |
| Business Rules total | **87** (BR-001…BR-087, contiguous) | unique `BR-NNN` headings in BC-001…008 |
| BR per document | BC-001 18 · BC-002 9 · BC-003 13 · BC-004 8 · BC-005 9 · BC-006 9 · BC-007 7 · BC-008 14 | 18+9+13+8+9+9+7+14 = 87 |
| Business Rule Principles | **40** (RP-1…RP-40) | unique `RP-NN` |
| Business Invariants | **40** (INV-1…INV-40) | unique `INV-NN` |
| Frozen Domain Rules | **90** (DR-001…DR-090) | DOM-004 |
| In-scope DR covered by ≥1 BR | **76** | §6 union |
| DR accounted out of BR-scope | **14** | §7 disposition |
| BR dual-cited (Truth + Legitimacy) | **87 / 87** | §8 |
| Orphan BR (missing DR or PC) | **0** | §8 |
| Uncovered in-scope DR | **0** | §7 |
| Coverage exceptions | **0** | §11 |
| Amendment candidates | **0** | §12 |

## 5. Scope of this document

**BC-009 governs:** the final DR→BR coverage matrix; the final BR→DR/PC traceability matrix;
the constitutional completeness verification; the closure verification against BX-1…BX-6; the
validation (reproducibility) evidence; the constitutional statistics; and the coverage-exception
and amendment-candidate registers.

**BC-009 does NOT govern:** any business behavior, rule, workflow, lifecycle, terminology,
product interpretation, implementation, UX, or reporting. It contains none of these and, being
the sink, adds none.

## 6. Final DR → BR coverage matrix *(in-scope Domain Rules)*

Every row is the primary coverage declared in the frozen document's own §7 Coverage Report;
`grep -hoE 'DR-[0-9]+ \| BR-[0-9]+' docs/business/BC-00[1-8]_*.md` reproduces it.

| DR | BR | DR | BR | DR | BR | DR | BR |
|---|---|---|---|---|---|---|---|
| DR-006 | BR-035 | DR-034 | BR-060 | DR-055 | BR-083 | DR-074 | BR-008 |
| DR-009 | BR-068 | DR-035 | BR-072 | DR-056 | BR-083 | DR-075 | BR-013 |
| DR-010 | BR-067 | DR-036 | BR-049 | DR-057 | BR-084 | DR-076 | BR-010 |
| DR-011 | BR-070 | DR-037 | BR-051 | DR-058 | BR-084 | DR-077 | BR-015 |
| DR-012 | BR-073 | DR-040 | BR-052 | DR-059 | BR-085 | DR-078 | BR-016 |
| DR-015 | BR-041 | DR-041 | BR-050 | DR-060 | BR-085 | DR-079 | BR-017 |
| DR-016 | BR-012 / BR-067 | DR-042 | BR-050 | DR-061 | BR-085 | DR-080 | BR-074 |
| DR-017 | BR-035 | DR-043 | BR-034 | DR-062 | BR-042 | DR-081 | BR-075 |
| DR-019 | BR-039 | DR-044 | BR-037 | DR-063 | BR-044 | DR-082 | BR-076 |
| DR-021 | BR-021 | DR-045 | BR-054 | DR-064 | BR-045 | DR-083 | BR-086 |
| DR-022 | BR-019 | DR-046 | BR-055 | DR-065 | BR-046 | DR-084 | BR-086 |
| DR-023 | BR-023 / BR-028 | DR-047 | BR-056 | DR-066 | BR-047 | DR-085 | BR-053 |
| DR-024 | BR-024 | DR-048 | BR-057 | DR-067 | BR-048 | DR-086 | BR-025 |
| DR-025 | BR-036 | DR-049 | BR-077 | DR-068 | BR-064 | DR-087 | BR-026 |
| DR-026 | BR-030 | DR-050 | BR-078 | DR-069 | BR-048 | DR-088 | BR-087 |
| DR-028 | BR-011 | DR-051 | BR-079 | DR-070 | BR-065 | DR-089 | BR-022 |
| DR-029 | BR-041 | DR-052 | BR-082 | DR-071 | BR-001 | DR-090 | BR-028 |
| DR-030 | BR-058 | DR-053 | BR-080 | DR-072 | BR-005 | | |
| DR-031 | BR-018 / BR-043 | DR-054 | BR-081 | DR-073 | BR-007 | | |
| DR-032 | BR-059 | | | | | | |
| DR-033 | BR-061 | | | | | | |

**76 in-scope Domain Rules, each covered by ≥1 frozen Business Rule.** Many DRs are additionally
cited as supporting authorities inside other BRs (§8); the table above lists the **primary**
coverage each frozen document declared.

## 7. Constitutional completeness verification

The 14 frozen Domain Rules **not** listed in §6 are **out of Business-Rule scope by an
objective, citable disposition** — none is an uncovered in-scope business behavior. Each
disposition is anchored to the frozen text named in the last column (reproducible; no
interpretation).

| DR | Statement (DOM-004) | Disposition | Anchor (frozen citation) |
|---|---|---|---|
| DR-001 | One center, one owner | **Foundational structural axiom** — the fixed shape of the business; owned by the Product Constitution and consumed as a universal precondition, not a discrete behavior. | DR-001 "root rule"; PC-005 (Owner sole user), PC-001 |
| DR-002 | One teacher per program | **Consumed as supporting Authority of Truth** inside a covered BR. | BC-001 BR-001 Authority of Truth: "DR-071 (DR-002/003/004 supporting)" |
| DR-003 | One distribution policy per program | **Consumed as supporting Authority** + encoded as Business Invariant. | BC-001 BR-001 (as above); BC-001 §8 INV (one policy per program) |
| DR-004 | Receipt belongs to one program | **Consumed as supporting Authority** of BR-001; program-fee receipt scope. | BC-001 BR-001 (as above) |
| DR-005 | Split calculated automatically at receipt | **Meta-derivation principle** — realized across the posting/distribution BRs, not a discrete rule. | Realized by BC-003 BR-035 + BC-001 BR-008/010/011/012; reinforced by DR-027 |
| DR-007 | Nothing computable entered by hand | **Meta-derivation principle (the Absolute Rule)** — realized by every derivation/reveal BR. | Realized across all BRs; explicitly by BC-007 BR-071/BR-072 (full derivability) |
| DR-008 | Outgoing money is a payment voucher | **Parent rule realized via covered concrete instances.** | DR-008 Unknown-status → DR-030 (teacher payment, BR-058) and DR-049…054 (expense, BR-077…081) |
| DR-013 | V1 compensation = percentage of posted receipts (sum 100%) | **Consumed as supporting Authority** + encoded as Invariant. | Cited in BC-001 BR-010 (DR-076/013) & BC-004 BR-042 (DR-013/…); BC-001 §8 INV (shares total 100%) |
| DR-014 | Rounding belongs exclusively to the currency | **Negative/boundary rule** (the business defines no rounding of its own); realized via the covered rounding rule. | DR-014 → DR-028 (round-half-up), covered by BC-003 BR-011 |
| DR-018 | Operations is an activity view that **creates no business logic** | **Out of Business-Constitution scope** — a system-activity view; a BR here would contradict DR-018. Belongs to Phase 3 (UX). | DR-018 text ("creates no business logic"); ADR-0010 |
| DR-020 | Every operation has a source + financial-impact flag | **Out of Business-Constitution scope** — presentation/structure of the activity view; Phase 3 (UX). | DR-018/DR-020; ADR-0010 §5/§6/§8 |
| DR-027 | V1 Simplicity Principle (what is NOT in V1) | **Negative scope-exclusion** — forbids behavior; honored by the absence of those behaviors + Invariants, never by adding a BR. | DR-027 text ("reinforces DR-005/DR-006"); BC-002 (one student), BC-001 BR-004 (one program) |
| DR-038 | Entitlement reflects net revenue after refunds | **Refined-forward** — the concrete behavior lives in its covered successor DRs. | DR-038 Unknown-status → DR-062 (BR-042), DR-063 (BR-044), DR-064 (BR-045) |
| DR-039 | Refunded, already-paid teacher share becomes a debt | **Refined-forward** — behavior lives in its covered successor DRs. | DR-039 Unknown-status → DR-065…070 (BR-046/047/048/064/065) |

**Result:** every frozen Domain Rule is either (a) covered by ≥1 BR (§6, 76 DRs) or
(b) accounted for out of BR-scope by a citable disposition (14 DRs). 76 + 14 = 90 = all frozen
DRs. **No constitutional gap exists inside Phase 2. No Amendment candidate arises.**

*Workflows.* The Phase-1A workflows WF-01…WF-16 are narrative sequences over the same entities
and financial state-transitions; each money-moving step a workflow performs is owned atomically
by a BR in §6. A workflow carries no atom of its own beyond the DRs it sequences, so DR-level
coverage above is the atomic completeness proof for the workflows as well.

## 8. Final BR → DR / PC traceability matrix *(all 87 Business Rules)*

Every Business Rule cites an **Authority of Truth (DR)** and an **Authority of Constitutional
Legitimacy (PC)**. Reproduce with `grep -hnE '^\| BR-[0-9]+ \|' docs/business/BC-00[1-8]_*.md`.

### BC-001 (BR-001…BR-018)
| BR | Authority of Truth (DR) | Authority of Constitutional Legitimacy (PC) |
|---|---|---|
| BR-001 | DR-071 | PC-003/004/006 |
| BR-002 | DR-071 | PC-003/006 |
| BR-003 | DR-071 | PC-003/004 |
| BR-004 | DR-071/031 | PC-003 |
| BR-005 | DR-072 | PC-003/004 |
| BR-006 | DR-072/022 | PC-003/006 |
| BR-007 | DR-073 | PC-003/004 |
| BR-008 | DR-074 | PC-003/004/006 |
| BR-009 | DR-074/024 | PC-003/004 |
| BR-010 | DR-076/013 | PC-003/006 |
| BR-011 | DR-028 | PC-003/004 |
| BR-012 | DR-028/016 | PC-004 AP-7 / PR-014 / AC-10 / PC-006 |
| BR-013 | DR-075 | PC-002 PP-3 / AP-3 / PR-004 / AC-03 |
| BR-014 | DR-076 | PC-004 AP-3 / PR-017 / PC-003 |
| BR-015 | DR-077 | PC-004/003 |
| BR-016 | DR-078 | PC-003/004 |
| BR-017 | DR-079 | PC-003/004 |
| BR-018 | DR-031/016 | PR-014 / AC-10 / PC-003 |

### BC-002 (BR-019…BR-027)
| BR | Authority of Truth (DR) | Authority of Constitutional Legitimacy (PC) |
|---|---|---|
| BR-019 | DR-022 | PC-003/004 |
| BR-020 | DR-022/021 | PC-003/004 |
| BR-021 | DR-021 | PC-003/004/006 |
| BR-022 | DR-089 | PC-005 AX-3 / PC-003/006 |
| BR-023 | DR-023 | PC-003/004 |
| BR-024 | DR-024 | PC-003/004 |
| BR-025 | DR-086 | PC-003/004 / PP-3 |
| BR-026 | DR-087 | PC-003/004 |
| BR-027 | DR-087/071/022 | PC-003/004 |

### BC-003 (BR-028…BR-040)
| BR | Authority of Truth (DR) | Authority of Constitutional Legitimacy (PC) |
|---|---|---|
| BR-028 | DR-023/090 | PC-003/006/004 |
| BR-029 | DR-023 | PC-003/004 |
| BR-030 | DR-090/026 | SC-12 / PR-018 / AC-14 |
| BR-031 | DR-026 | SC-12 / PR-018 |
| BR-032 | DR-023/043 | PC-003/004 |
| BR-033 | DR-023 | PC-003/004 |
| BR-034 | DR-043 | PC-003/004 |
| BR-035 | DR-017/006 | AP-7 / PR-014 / AC-10 / PC-006 |
| BR-036 | DR-023/025 | PC-003/004 |
| BR-037 | DR-044 | PP-3 / AP-3 / PR-004 / AC-03 |
| BR-038 | DR-006 | PP-3 / PR-017 |
| BR-039 | DR-019 | PR-031/032 / AC-21 |
| BR-040 | DR-043/044/019 | PP-3 / AP-3 / AC-03 |

### BC-004 (BR-041…BR-048)
| BR | Authority of Truth (DR) | Authority of Constitutional Legitimacy (PC) |
|---|---|---|
| BR-041 | DR-015/029 | PC-003 / PP-1 / PR-015 |
| BR-042 | DR-013/062/031 | PC-003 / PR-020 |
| BR-043 | DR-031 | AP-7 / PR-014 / AC-10 |
| BR-044 | DR-062/063 | AP-7 / PC-003 |
| BR-045 | DR-064 | PC-003 / PR-015 / PP-1 |
| BR-046 | DR-065 | PC-003 / PR-015/020 / AC-11 |
| BR-047 | DR-066 | AP-7 / PR-014 / AC-10 |
| BR-048 | DR-067/069 | PC-003 / PR-015 |

### BC-005 (BR-049…BR-057)
| BR | Authority of Truth (DR) | Authority of Constitutional Legitimacy (PC) |
|---|---|---|
| BR-049 | DR-036 | PC-003/004 |
| BR-050 | DR-041/042/090 | PC-006 / SC-12 / PR-018 / AC-14 / PR-006 |
| BR-051 | DR-037/042 | AP-7 / PR-014 / AC-10 / PC-006 |
| BR-052 | DR-040 | PC-003/004 |
| BR-053 | DR-085 | PC-003/004 |
| BR-054 | DR-045 | AP-3 / AC-03 |
| BR-055 | DR-046 | AP-3 / PR-031 |
| BR-056 | DR-047 | PP-3 / AP-3 / PR-004/031/032 / AC-21 |
| BR-057 | DR-048 | AP-3 / PR-004 / AC-03 / PR-031 |

### BC-006 (BR-058…BR-066)
| BR | Authority of Truth (DR) | Authority of Constitutional Legitimacy (PC) |
|---|---|---|
| BR-058 | DR-030 | PR-019 / AC-15 / PC-003 |
| BR-059 | DR-032 (DR-090 consumed) | AP-7 / PC-006 (SC-12/PR-018 consumed) |
| BR-060 | DR-034 | AP-7 / PR-014 / PC-006 |
| BR-061 | DR-033 | PC-003/004 |
| BR-062 | DR-033/034 | PC-003 / PR-015 |
| BR-063 | DR-068/067 | AP-7 / PC-003 |
| BR-064 | DR-068 | PR-019 / AC-15 / AP-7 |
| BR-065 | DR-070 | AP-7 |
| BR-066 | DR-034/045 | AP-3 / AC-03 |

### BC-007 (BR-067…BR-073)
| BR | Authority of Truth (DR) | Authority of Constitutional Legitimacy (PC) |
|---|---|---|
| BR-067 | DR-016/010 | AP-7 / PR-014 / PR-020 / AC-10 / PC-006 |
| BR-068 | DR-009/034 | PR-020 / PC-006 |
| BR-069 | DR-009/031 | AP-7 / PR-020 / PC-003 |
| BR-070 | DR-011/035 | PR-020 / AC-11 / PC-003 |
| BR-071 | DR-011 | PP-1 / MMI-4 / AC-11 |
| BR-072 | DR-035 | PR-032 / AC-21 / PR-020 |
| BR-073 | DR-016/012 | AP-7 / PR-014 / AC-10 / PP-1 |

### BC-008 (BR-074…BR-087)
| BR | Authority of Truth (DR) | Authority of Constitutional Legitimacy (PC) |
|---|---|---|
| BR-074 | DR-080 | PR-006 / PC-003 |
| BR-075 | DR-081 | AP-7 / PR-014 / PC-006 |
| BR-076 | DR-082 | PC-003/004 |
| BR-077 | DR-049 | PC-003/004 |
| BR-078 | DR-050 | PC-004 §2 |
| BR-079 | DR-051 | PC-003 |
| BR-080 | DR-053 | PC-004 §2 |
| BR-081 | DR-054 | PA-6 / AP-4 / PC-005 |
| BR-082 | DR-052 | AP-7 / PR-014 / PC-006 |
| BR-083 | DR-055/056 | PC-003/004 |
| BR-084 | DR-057/058 | PC-004 |
| BR-085 | DR-059/060/061 | AP-7 / PC-006 |
| BR-086 | DR-083/084 | PC-003 |
| BR-087 | DR-088 | PP-3 / PC-003 |

**87 / 87 Business Rules are dual-cited.** No BR lacks an Authority of Truth; no BR lacks an
Authority of Constitutional Legitimacy. **Zero orphan Business Rules.** No citation above is
reinterpreted — each is copied from the frozen document's own §6 matrix.

## 9. Constitutional closure verification against BX-1…BX-6 (BC-000 §8)

BC-009 **demonstrates** satisfaction; it does **not** declare closure. Constitutional closure
is authorized only by a separate Owner Engineering Order.

| BX | Criterion (BC-000 §8) | Objective demonstration | State |
|---|---|---|---|
| **BX-1** | BC-000 FROZEN and every planned BC document (P2-000 §5) FROZEN | BC-000…BC-008 all FROZEN (IDX-001 §2.3). BC-009 is the single last planned document; its freeze is the sole residual, subject to this review. | Demonstrated but for BC-009's own freeze |
| **BX-2** | Every in-scope business behavior (in-scope DR/WF) operationalized by ≥1 BR | §6: 76/76 in-scope DR covered; §7: 14 out-of-scope DR each accounted; WF-01…16 covered transitively (§7). Uncovered in-scope DR = 0. | ✓ demonstrated |
| **BX-3** | Every BR atomic, observable, traces upstream to F/DR/M **and** the Product Constitution | §8: 87/87 BR dual-cited in the 13-field normal form; contiguous BR-001…087; 0 orphans. | ✓ demonstrated |
| **BX-4** | No BR contradicts a DR, another BR, or any frozen product/governance statement | Every frozen document's §9 CDC declares "Consumes only. No modification. No narrowing. No reinterpretation."; §7 finds no gap requiring a contradicting rule; no contradiction detected across BC-001…008. | ✓ demonstrated |
| **BX-5** | A complete Phase-2 traceability matrix exists (GOV-006) + a closure audit | This document (§6 + §8) **is** the complete matrix. The closure audit (AUD-P2-011) is produced at BC-009 propagation, not here. | Matrix ✓ ; audit at propagation |
| **BX-6** | Phase 3 (UX) can begin with no further business interpretation | All business behavior is frozen and atomically covered; the activity-view concerns (DR-018/DR-020) are explicitly handed to UX; open unknowns (UNK-013 statement scope, UNK-021 deduction model, UNK-029/030 non-program refund) are deferred, non-blocking, and no BR depends on them. | ✓ demonstrated |

**All six closure criteria are objectively demonstrated** (BX-1 and BX-5 each name one residual
that belongs to the propagation/closure act itself — BC-009's freeze and the closure audit —
neither of which BC-009 may perform on its own authority).

## 10. Validation evidence *(reproducibility)*

Every claim in this document is regenerable from the frozen repository with no interpretation:

| Claim | Reproduction command (frozen repo) |
|---|---|
| 87 contiguous BR | `grep -hoE 'BR-[0-9]+' docs/business/BC-00[1-8]_*.md \| sort -u` → BR-001…087 |
| Per-document BR counts (18/9/13/8/9/9/7/14) | unique `BR-NNN` headings per file |
| BR → DR/PC matrix (§8) | `grep -hnE '^\| BR-[0-9]+ \|' docs/business/BC-00[1-8]_*.md` |
| DR → BR coverage (§6) | `grep -hoE 'DR-[0-9]+ \| BR-[0-9]+' docs/business/BC-00[1-8]_*.md` |
| 90 frozen DR | DOM-004 (`DR-001…DR-090`) |
| Out-of-scope DR dispositions (§7) | each DR's own text / Unknown-status line in DOM-004; BC-001 BR-001 Authority of Truth |
| 40 RP / 40 INV | `grep -hoE 'RP-[0-9]+' …` ; `grep -hoE 'INV-[0-9]+' …` |
| ADR continuity / registers | DEC-000, IDX-001 |

No claim in BC-009 requires reading anything beyond the frozen artifacts named above.

## 11. Coverage exceptions

**None.** Every in-scope Domain Rule is covered (§6); every out-of-scope Domain Rule is
accounted for by a citable disposition (§7). No exception is carried.

## 12. Amendment candidates

**None.** No gap, contradiction, orphan, or uncovered in-scope behavior was discovered. Had one
been found, BC-009 would have **STOPPED** and recorded it here as an Amendment candidate under
GOV-004 §5 / BC-000 §BCG-3, without repairing it.

## 13. Strict-scope self-check

BC-009 defines **no** Business Rule, **no** Domain Rule, and **no** terminology; it introduces
no business behavior, workflow, lifecycle, responsibility, implementation guidance, UX guidance,
or reporting guidance. It reinterprets no Product Constitution statement and repairs no gap. It
is **constitutional proof only** — the sink of BC-001…BC-008 — and every statement it makes is
directly auditable from the frozen constitutional artifacts.

---

*DRAFT — awaiting constitutional review. Not frozen. No ADR published, no register updated, no
frozen document modified. On approval, BC-009 is propagated (freeze + ADR-0047 + closure audit
AUD-P2-011 + registers) and Phase 2 constitutional closure is authorized by a separate Owner
Engineering Order.*
