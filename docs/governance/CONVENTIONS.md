# GOV-002 — Engineering & Naming Conventions

| Field | Value |
|---|---|
| Doc ID | GOV-002 |
| Title | Engineering & Naming Conventions |
| Phase | 0 |
| Status | FROZEN |
| Version | 1.3.0 |
| Depends on | GOV-000, GOV-001 |
| Referenced by | IDX-001, GOV-006, GOV-007, TPL-001, TPL-002, TPL-003, ADR-0003, ADR-0006 |

---

## 1. Repository layout conventions

1. All documentation lives under `docs/`. The repository root contains only
   `README.md`, `.gitignore`, and (after documentation freeze) implementation
   directories introduced by their own ADRs.
2. One directory per documentation domain, exactly as mapped in IDX-001 §1.
3. Audit reports live in `docs/audits/phase-N/`, one folder per phase.
4. Directory names are lowercase kebab-case. Document files are named per §2.

## 2. Document naming rules

| Document class | File name pattern | Example |
|---|---|---|
| Governance (founding, GOV-001…GOV-006) | `UPPER-KEBAB.md` in `docs/governance/` | `QUALITY-GATES.md` |
| Governance (platform, GOV-000 and GOV-007+) | `GOV-NNN_UPPER_SNAKE.md` in `docs/governance/` (→ ADR-0006 §3) | `GOV-007_AI_EXECUTION_PROTOCOL.md` |
| Domain Discovery (Phase 1A) | `DOMAIN-NNN_UPPER_SNAKE.md` in `docs/domain/`; filename word `DOMAIN` maps to Doc-ID prefix `DOM` (→ ADR-0007 §2) | `DOMAIN-004_BUSINESS_RULES_CATALOG.md` |
| Index | `INDEX.md` in `docs/` | `INDEX.md` |
| Roadmap | `ROADMAP.md` in `docs/roadmap/` | `ROADMAP.md` |
| Decision log | `DECISION-LOG.md` in `docs/decisions/` | `DECISION-LOG.md` |
| ADR | `ADR-NNNN-kebab-title.md` (NNNN = zero-padded, sequential, never reused) | `ADR-0003-document-identity-and-lifecycle.md` |
| Template | `NAME-TEMPLATE.md` in `docs/templates/` | `AUDIT-TEMPLATE.md` |
| Audit report | `AUDIT-PN-SUBJECT.md` in `docs/audits/phase-N/` | `AUDIT-P0-REPOSITORY.md` |
| Phase constitution docs | `UPPER-KEBAB.md` inside the phase directory; exact names fixed by that phase's opening ADR | `docs/product/PRODUCT-CONSTITUTION.md` |

## 3. Canonical document header

Every document begins with a level-1 title `# <Doc ID> — <Title>` followed by this
header table (fields in this order):

```markdown
| Field | Value |
|---|---|
| Doc ID | XXX-NNN |
| Title | ... |
| Phase | N |
| Status | DRAFT / IN-REVIEW / FROZEN / LIVING / SUPERSEDED |
| Version | MAJOR.MINOR.PATCH |
| Depends on | Doc IDs or — |
| Referenced by | Doc IDs (optional for LIVING docs) |
```

ADRs use the ADR-specific header defined in TPL-002 (statuses PROPOSED / ACCEPTED /
SUPERSEDED).

## 4. Doc ID scheme

| Prefix | Domain | Phase |
|---|---|---|
| `GOV-NNN` | Governance | 0 |
| `IDX-NNN` | Index | 0 |
| `RDM-NNN` | Roadmap | 0 |
| `DEC-NNN` | Decision log | 0 (spans all phases) |
| `ADR-NNNN` | Architecture Decision Record | any |
| `TPL-NNN` | Templates | 0 |
| `AUD-PN-NNN` | Audit report for phase N (N may be a label such as `1A`) | any |
| `DOM-NNN` | Domain Discovery documents | 1A |
| `PRD-NNN` | Product Constitution documents | 1 |
| `BUS-NNN` | Business Constitution documents | 2 |
| `UXC-NNN` | UX Constitution documents | 3 |
| `DAT-NNN` | DDL Specification documents | 4 |
| `CMP-NNN` | Component Library documents | 5 |
| `SCR-NNN` | Screen Blueprint documents | 6 |

Doc IDs are permanent. A deleted document's ID is retired, never reused.

## 5. Requirement & rule ID scheme (traceability atoms)

Fine-grained, referencable statements inside documents use these prefixes
(full usage rules in GOV-006):

| ID prefix | Meaning | Defined in phase |
|---|---|---|
| `M-NN` | Manifesto principle | 0 (GOV-000) |
| `F-NN` | Immutable project fact | 0 (GOV-001 §2) |
| `AI-NN` | AI execution protocol rule | 0 (GOV-007) |
| `LES-NNN` | Engineering lesson | 0 (GOV-008, spans all phases) |
| `DR-NNN` | Domain rule | 1A (DOM-004) |
| `WF-NN` | Domain workflow (descriptive, non-normative) | 1A (DOM-003) |
| `UNK-NNN` | Unknown business fact | 1A (DOM-005, LIVING) |
| `ASM-NNN` | Working assumption (no normative force) | 1A (DOM-005, LIVING) |
| `PR-NNN` | Product requirement | 1 |
| `BR-NNN` | Business rule | 2 |
| `UX-NNN` | UX rule / principle | 3 |
| `DB-NNN` | Data model rule (entities, constraints) | 4 |
| `CP-NNN` | Component contract | 5 |
| `SC-NNN` | Screen blueprint requirement | 6 |

Rule IDs are permanent within their document set and never reused after retirement.

## 6. Document lifecycle & versioning

Statuses: `DRAFT` → `IN-REVIEW` → `FROZEN`; plus `LIVING` (registers, logs, index,
templates — always current, changes audited via git history) and `SUPERSEDED`.

Versioning is semantic for documents:
- **MAJOR** — meaning changed (requires amendment procedure if FROZEN, GOV-004 §5)
- **MINOR** — content added without changing existing meaning
- **PATCH** — typos, formatting, link repairs

## 7. Writing conventions

1. **Language:** engineering documentation is written in English. Domain terms keep
   their Arabic original on first use, e.g. “Receipt Voucher (سند قبض)” (ADR-0005).
   The product's UI language is decided in Phase 3 (UX Constitution), not here.
2. **Terminology is fixed** — use exactly: Training Program, Teacher, Student (Payer),
   Revenue Distribution Policy, Receipt Voucher, Payment Voucher, Operation,
   Account Statement, Teacher Balance; and for the three never-merged balances
   (ADR-0008 D5): **Cash Balance**, **Teacher Payables**, **Center Net Balance**
   (the founding term “Center Balance” is refined by these — use the precise
   terms in all post-Session-1 text). Synonyms (e.g. “course”, “instructor”,
   “invoice”) are forbidden in normative text.
3. Normative language: **MUST / MUST NOT / SHOULD / MAY** per RFC 2119 spirit.
4. Every cross-document reference uses a Doc ID plus a relative Markdown link.
5. One sentence per requirement atom; each atom carries exactly one ID.

## 8. Git conventions

1. Branch names: `claude/ard-kanaan-phase-N-*` or `phase-N/<topic>`.
2. Commit messages: `phase-0: <imperative summary>` — prefix matches the phase the
   commit belongs to; body lists Doc IDs touched.
3. A commit is atomic with respect to consistency (GOV-001 §6): a repo checkout at
   any commit must be internally consistent.
4. No binary files before documentation freeze except nothing — Phase 0–6 commits
   are Markdown and `.gitignore` only.
