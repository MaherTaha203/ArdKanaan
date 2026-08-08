# SPEC-003 — Data Model

| Field | Value |
|---|---|
| Doc ID | SPEC-003 |
| Title | Data Model |
| Phase | RESET |
| Status | DRAFT |
| Version | 0.1.0 |
| Depends on | ARK-000, ARK-001, ARK-002, SPEC-000, SPEC-001, SPEC-002 |
| Referenced by | Future implementation documents |

---

## 1. Purpose

This document defines the logical data model of Ard Kanaan.

It is the implementation-independent bridge between the approved constitutional and specification documents and future implementation work.

## 2. Owner-Approved Scope

This document defines only the logical entities required by the approved documents and the conceptual information boundaries of those entities.

It assumes the constitutional principles defined by:

- ARK-000
- ARK-001
- ARK-002
- SPEC-000
- SPEC-001
- SPEC-002

## 3. Business Facts

The logical data model contains only these entities:

1. Student
2. Receipt Voucher
3. Payment Voucher
4. Student Statement
5. Course

No additional logical entity is required by the approved documents.

Financial Report is not included as a logical data entity because the approved documents justify it as a presentation object that derives from voucher-created financial facts rather than owning independent truth.

### 3.1 Student

Purpose:
To serve as the central business entity around which financial history is organized.

Why it exists:
The approved model is student-centered, and voucher-created financial facts belong to a Student's financial history.

What it represents:
The person whose financial history the product records and reveals.

Primary relationships:
- one Student has one Student Statement
- one Student may be referenced by many Receipt Vouchers
- one Student may be referenced by many Payment Vouchers where applicable
- one Student may have financial obligations across multiple Courses

Information it owns:
- Student identity as a logical business entity
- the continuity of one Student across all related financial history

Information it references:
- none required from another entity to remain itself as a logical entity

Information it derives:
- none

Information it never stores:
- derived balances as truth
- voucher-created financial facts as if they originated from the Student
- academic-management information
- reporting information as independent truth

### 3.2 Receipt Voucher

Purpose:
To create incoming financial facts.

Why it exists:
Incoming money exists inside the product only through voucher truth.

What it represents:
One incoming financial event.

Primary relationships:
- many Receipt Vouchers may reference one Student
- a Receipt Voucher may reference one Course as financial context
- Receipt Vouchers contribute facts later presented by one Student Statement

Information it owns:
- the fact that an incoming payment occurred
- its own incoming financial event as voucher truth
- the human-entered financial context captured at the time of the event

Information it references:
- the Student to whom the payment belongs
- the Course when Course financial context exists

Information it derives:
- none

Information it never stores:
- derived balances as truth
- Student Statement presentation data as independent truth
- Financial Report presentation data as independent truth
- academic-management information

### 3.3 Payment Voucher

Purpose:
To create outgoing financial facts.

Why it exists:
Outgoing money exists inside the product only through voucher truth.

What it represents:
One outgoing financial event.

Primary relationships:
- many Payment Vouchers may reference one Student where applicable
- a Payment Voucher may reference one Course as financial context
- Payment Vouchers may contribute facts later presented by one Student Statement where applicable

Information it owns:
- the fact that an outgoing payment occurred
- its own outgoing financial event as voucher truth
- the human-entered financial context captured at the time of the event

Information it references:
- the Student when the outgoing payment belongs to Student financial history
- the Course when Course financial context exists

Information it derives:
- none

Information it never stores:
- derived balances as truth
- Student Statement presentation data as independent truth
- Financial Report presentation data as independent truth
- academic-management information

### 3.4 Student Statement

Purpose:
To present the Student's financial history as one chronological statement.

Why it exists:
The product must reveal Student financial information without turning the statement into a source of truth.

What it represents:
The chronological financial history of one Student, including obligations and voucher-contributed financial information.

Primary relationships:
- one Student Statement belongs to one Student
- one Student Statement depends on Receipt Vouchers related to that Student
- one Student Statement may depend on Payment Vouchers related to that Student where applicable
- one Student Statement may include Course financial context across multiple Courses

Information it owns:
- statement identity as the single statement belonging to one Student

Information it references:
- the Student whose history is being presented
- Receipt Vouchers that contribute incoming facts
- Payment Vouchers that contribute outgoing facts where applicable
- Courses as financial context only

Information it derives:
- chronological presentation of Student financial history
- presented financial values derived from voucher truth
- presented obligations derived from voucher-related financial facts and Course context

Information it never stores:
- independent financial truth
- manually authored financial facts
- manual corrections as truth
- derived balances as truth
- academic-management information

### 3.5 Course

Purpose:
To provide financial context for Student obligations and voucher-related financial facts.

Why it exists:
The approved model requires Course context inside Student financial history without turning the product into course management.

What it represents:
The financial context within which an obligation or voucher-related fact exists.

Primary relationships:
- one Course may be referenced by many Receipt Vouchers
- one Course may be referenced by many Payment Vouchers where applicable
- one Course may appear within many Student Statement entries as financial context
- one Student may have obligations in multiple Courses without creating multiple Student Statements

Information it owns:
- Course identity as financial context

Information it references:
- none required beyond its own contextual identity

Information it derives:
- none

Information it never stores:
- financial truth
- derived balances as truth
- academic-management data
- Student Statement presentation truth

## 4. Inputs

This logical data model receives its justification from the approved constitutional and specification documents.

At the business level, the model accepts only:

- Student-centered identity continuity
- incoming voucher facts
- outgoing voucher facts
- Course financial context

## 5. Outputs

This logical data model provides the logical structure required to support:

- voucher-created financial truth
- one Student-centered financial history
- Course financial context inside that history
- traceable derivation into Student Statement presentation
- future implementation translation into physical storage design

## 6. Derived Effects

Because this logical data model separates truth-owning entities from presentation entities:

- voucher truth remains conceptually distinct from statement presentation
- Student Statement presentation can be derived without becoming stored truth
- Financial Report can remain a derived presentation surface rather than a logical truth-owning entity
- every displayed financial value can remain traceable to voucher-created facts

## 7. Dependencies

- Inherited from ARK-000 §5
- Inherited from ARK-000 §6
- Inherited from ARK-000 §7
- Inherited from ARK-000 §8
- Inherited from ARK-000 §10
- Inherited from ARK-000 §11
- Inherited from ARK-000 §12
- Inherited from ARK-000 §13
- Inherited from ARK-000 §14
- Inherited from ARK-000 §15
- Depends on ARK-001 §2
- Depends on ARK-001 §3
- Depends on ARK-001 §4
- Depends on ARK-001 §5
- Depends on ARK-001 §6
- Depends on ARK-001 §7
- Depends on ARK-001 §8
- Depends on ARK-002 §3
- Depends on ARK-002 §4
- Depends on ARK-002 §5
- Depends on ARK-002 §6
- Depends on ARK-002 §7
- Depends on ARK-002 §8
- Depends on ARK-002 §9
- Depends on SPEC-001
- Depends on SPEC-002

## 8. Restrictions

This logical data model must remain intentionally simple.

It must not introduce ERP concepts, accounting modules, educational-management entities, CRM entities, analytics entities, or general reporting entities.

It must not promote Student Statement to a truth-owning entity.

It must not promote Financial Report to a stored logical truth-owning entity.

It must not treat Course as anything beyond financial context.

It must not store derived values as truth.

## 9. Open Decisions

None.

## 10. Out Of Scope

This document does not define:

- SQL
- database engines
- database tables
- physical columns
- data types
- indexes
- constraints
- migrations
- APIs
- implementation
- UI
- printing
- calculations
- business workflows
- validation logic

## 11. Change History

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-08-04 | Initial draft of the logical data model under the approved constitutional and specification documents |