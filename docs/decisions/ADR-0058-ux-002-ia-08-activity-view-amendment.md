# ADR-0058 — UX-002 Amended to v1.1.0: IA-08 (The Activity View) — Constitutional Amendment

| Field | Value |
|---|---|
| ADR | 0058 |
| Title | UX-002 IA-08 (The Activity View) Amendment Adopted (v1.1.0) |
| Phase | 3 (UX Constitution) |
| Status | ACCEPTED |
| Supersedes | — |
| Superseded by | — |

## Context

The UX-006 Readiness Verification found (F1) that **BC-009 §7 / §9 BX-6 explicitly delegates two
Domain Rules to the UX layer** — **DR-018** (Operations is an activity view; creates no business
logic) and **DR-020** (every operation carries a Source + Financial-Impact; each row understandable
standalone) — but no UX rule covered them. The Owner authorized **Path 1**: close the gap at the
owning UX document. The owner of information structure and reveal is **UX-002** (Information
Architecture), and WA-09 already fixes that *revealing* is UX-002's domain, not work.

Because UX-002 is a **frozen** constitutional document, this is a **Constitutional Amendment under
GOV-004 §5** (not a redesign): minimum wording only, adding a single atom.

## Decision

1. **Amend UX-002 to v1.1.0** by adding **IA-08 — The Activity View** (§7a): the Activity Record is
   revealed through an Activity View that (DR-018) creates no business logic — a pure reveal — and
   (DR-020) presents each row's **Source** and **Financial-Impact**, understandable standalone.
   Append-only remains upstream (DR-019); the view redefines no Activity Record semantics.
2. **Scope of the amendment:** IA-08 plus the consistency updates that make the document admit its new
   input — §1 (consumption), §8 (owns), §9 (CDC/Consumes), §10 (self-check), and the header now cite
   **DOM-004 DR-018/DR-020 via the BC-009 §7 / §9 BX-6 delegation** as IA-08's sole additional input.
   No other atom changed; PC-003 consumption and all IA-01…07 are untouched.
3. **Purity:** IA-08 is **pure information presentation** — introduces no Business Rule/behavior,
   redefines no Activity Record semantics, and alters **no** Business (BC-009 preserved exactly as
   frozen) or Product ownership.

## Verification

Adopted on the evidence of the **UX-006 Constitutional Readiness Verification (6/6 Panel SOUND,
independent Judge READY)**, which confirmed IA-08 pure and the DR-018/DR-020 delegation covered (0
gap), and the amendment-completion re-verification which confirmed the integration consistent
(N1–N4 resolved). No separate phase-audit is created; the RV consolidated reports are the audit
evidence, referenced by AUD-P3-FINAL.

## Consequences

- The Business→UX delegation of DR-018/DR-020 is discharged; UX-006 consumes UX-002 v1.1.0 and proves
  0 gap on it.
- UX-002's frozen baseline moves to **v1.1.0**; amendments only via GOV-004 §5.
- Registers updated in the closure commit (IDX-001, DEC-000, GOV-009).
