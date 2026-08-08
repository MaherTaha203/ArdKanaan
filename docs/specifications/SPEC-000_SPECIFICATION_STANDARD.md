# SPEC-000 — Specification Standard

| Field | Value |
|---|---|
| Doc ID | SPEC-000 |
| Title | Specification Standard |
| Phase | RESET |
| Status | DRAFT |
| Version | 0.1.0 |
| Depends on | ARK-000, ARK-001, ARK-002 |
| Referenced by | All future SPEC documents |

---

## 1. Purpose

This document defines the writing standard for all specification documents in Ard Kanaan.

Its purpose is to prevent specification documents from repeating constitutional truth that is already defined in ARK-000, ARK-001, and ARK-002.

## 2. Owner-Approved Scope

This document defines only how specification documents must be written.

It does not define business truth again.

It assumes that constitutional truth is already defined by:

- ARK-000
- ARK-001
- ARK-002

## 3. Standard Principle

Constitution documents explain truth once.

Specification documents must not restate constitutional truth unless a document-specific statement cannot be expressed by reference alone.

If a truth already exists in the constitutional layer, the specification must inherit it by reference.

## 4. Required Structure For Every Specification

Every specification should use this structure unless the Owner explicitly approves a different one:

1. Purpose
2. Owner-approved scope
3. Business Facts
4. Inputs
5. Outputs
6. Derived Effects
7. Dependencies
8. Restrictions
9. Open Decisions
10. Out Of Scope

## 5. Business Facts

Business Facts contain only facts that are specific to the document being specified.

Business Facts must not repeat constitutional statements that already exist in ARK documents.

If a fact is inherited, the specification should reference the constitutional source instead of rewriting it.

## 6. Inputs

Inputs identify the business facts or human-entered facts that the specified object receives, captures, or depends on.

Inputs must remain specific to the object being specified.

Inputs must not expand into implementation details, field validation logic, screen behavior, database structure, or APIs.

## 7. Outputs

Outputs identify the direct business result produced by the specified object.

Outputs describe what the object creates, reveals, or makes available inside the product boundary.

Outputs must not restate general constitutional truths unless the output itself depends on that inherited rule.

## 8. Derived Effects

Derived Effects describe what later becomes visible, derivable, or presentable because the specified object exists.

Derived Effects must remain downstream and product-bounded.

Derived Effects must not redefine truth, storage, reporting theory, or system-wide principles already defined constitutionally.

## 9. Dependencies

Dependencies identify which constitutional documents or earlier specifications the current specification inherits from.

Dependencies should reference the governing source directly.

Preferred forms are:

- Inherited from ARK-000
- Depends on ARK-002
- Depends on ARK-000 §6

If a rule is fully inherited, the specification should reference it instead of rewriting it.

## 10. Restrictions

Restrictions define only the boundaries that are specific to the object being specified.

Restrictions may state what the object never becomes, never does, or never contains, when that boundary is necessary for the object itself.

Restrictions must not duplicate the general exclusions and platform boundaries already defined in the constitutional layer unless direct reference is insufficient.

## 11. Open Decisions

Open Decisions record unresolved matters only when an Owner-approved decision does not yet exist and the missing decision affects the specification.

Specifications must not invent content to fill unresolved gaps.

If there are no unresolved decisions, the section should state `None.`

## 12. Out Of Scope

Out Of Scope identifies what the specification does not define.

This section should remain short, stable, and non-repetitive.

It may exclude implementation, UI, database, APIs, validation logic, numbering, printing layout, and similar technical or presentational concerns where applicable.

## 13. Allowed Repetition

The following may be repeated inside a specification:

- document metadata
- document-specific facts
- document-specific boundaries
- document-specific unresolved decisions
- direct references to governing constitutional sources

## 14. Prohibited Repetition

The following should not be rewritten inside a specification when already defined constitutionally:

- product nature
- product exclusions
- central entity truth
- voucher truth
- statement truth
- correction truth
- traceability truth
- course boundary truth
- storage truth
- simplicity truth

These must normally be inherited by reference.

## 15. Inheritance Rule

If a specification sentence can be replaced by a precise dependency reference without losing meaning, the dependency reference is preferred.

The specification should spend its lines on what is unique to the specified object.

## 16. Writing Rule

Specifications should be shorter than constitution documents when repetition is removed.

Shorter is not the goal by itself.

Precision, inheritance discipline, and maintainability are the goal.

## 17. Change History

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-08-04 | Initial draft of the specification-writing standard for Ard Kanaan |