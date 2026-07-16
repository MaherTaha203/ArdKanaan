# GOV-006 — Traceability & Cross-Reference Strategy

| Field | Value |
|---|---|
| Doc ID | GOV-006 |
| Title | Traceability & Cross-Reference Strategy |
| Phase | 0 |
| Status | FROZEN |
| Version | 1.1.0 |
| Depends on | GOV-000, GOV-001, GOV-002 |
| Referenced by | GOV-003 (Gates 5–7), GOV-007, ADR-0004, ADR-0006 |

---

## 1. Goal

Every artifact in this repository must be answerable to two questions at all times:

1. **Why does this exist?** (upward trace — to a fact, requirement, rule, or ADR)
2. **What depends on this?** (downward trace — to documents, and later screens,
   schema, and code)

## 2. Traceability atoms

The atoms of traceability are the IDs defined in GOV-002 §4 (documents) and §5
(requirements/rules). Prose without an ID is explanatory and carries **no normative
weight**; only ID-bearing statements can be traced, reviewed, or implemented.

## 3. The trace chain across phases

```
M-NN (manifesto principles, Phase 0 — GOV-000)
  └─► F-NN (facts, Phase 0 — GOV-001 §2)
        └─► PR-NNN (product requirements, Phase 1)
              └─► BR-NNN (business rules, Phase 2)
                    ├─► UX-NNN (UX rules, Phase 3)
                    ├─► DB-NNN (data model rules, Phase 4)
                    ├─► CP-NNN (component contracts, Phase 5)
                    └─► SC-NNN (screen requirements, Phase 6)
                          └─► implementation artifacts (post-freeze)
```

Rules per link:

0. Every `F` cites at least one `M` (the *Derives from* column of GOV-001 §2).
   `AI-NN` and `LES-NNN` atoms (→ GOV-002 §5) govern execution rather than the
   product and stand outside this chain; `AI` atoms cite `M-09`.
1. Every `PR` cites at least one `F`. Every `BR` cites at least one `PR` or `F`.
2. Every `UX`, `DB`, `CP` cites at least one `BR` or `PR`.
3. Every `SC` cites the `UX`/`CP`/`DB` atoms it composes.
4. **No orphans:** an atom cited by nothing after its consuming phase freezes is a
   Gate 5 finding — either it gains a consumer or it is retired with an ADR.
5. **No inventions:** an atom citing nothing upstream is a DEFECT.

## 4. Cross-reference mechanics

1. In-document reference format: `(→ GOV-002 §5)` or `(→ BR-014)`.
2. Cross-document references use the target's Doc ID and, on first mention in a
   section, a relative Markdown link:
   `[GOV-003](../governance/QUALITY-GATES.md)`.
3. References point to IDs, never to page/line positions.
4. Bidirectionality: a document's `Depends on` header field lists upstream Doc IDs;
   `Referenced by` lists known downstream Doc IDs. Gate 5 verifies both directions.

## 5. Traceability matrices

1. Each phase from Phase 1 onward ships a traceability matrix document
   (`<PREFIX>-TRACE`) mapping its new atoms to their upstream atoms.
2. Matrices are LIVING within their phase and FROZEN at phase close.
3. The Final Audit composes all matrices to demonstrate an unbroken chain
   M → F → PR → BR → {UX, DB, CP} → SC → code.

## 6. Retirement

An atom is never deleted. It is marked `RETIRED` in place with a pointer to the ADR
that retired it, and all downstream citations are repaired in the same commit
(GOV-001 §6).
