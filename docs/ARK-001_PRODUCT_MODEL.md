# ARK-001 — Product Model

| Field | Value |
|---|---|
| Doc ID | ARK-001 |
| Title | Product Model |
| Phase | RESET |
| Status | DRAFT |
| Version | 0.1.0 |
| Depends on | ARK-000 |
| Referenced by | — |

---

## 1. Purpose

This document defines the conceptual business model of Ard Kanaan under ARK-000. It defines what currently exists inside the product as business objects and how those objects relate conceptually to one another. It does not define how anything works.

The Product Model defines the permanent conceptual structure of Ard Kanaan.

Business behavior, workflows, business rules, and implementation are defined elsewhere.

## 2. Scope

This document defines only the conceptual business objects justified by ARK-000:

- Student
- Receipt Voucher
- Payment Voucher
- Student Statement
- Course
- Financial Report

For each object, this document defines only its purpose, why it exists, what it represents, what it does not represent, and its conceptual relationship with the other objects.

This document does not define workflows, business rules, implementation, UI, database, fields, attributes, validation, numbering, calculations, printing, permissions, architecture, APIs, or storage structure.

## 3. Student

### Purpose

The Student exists as the central business entity of the product.

### Why it exists

The product revolves around student-centered financial truth.

### What it represents

The Student represents the person whose financial history the product records and reveals.

### What it does not represent

The Student does not represent a general academic record, a student-management record, or a CRM record.

### Conceptual relationship with other objects

The Student is the center of the Student Statement.

Receipt Vouchers and Payment Vouchers contribute financial facts that belong to the Student's financial history where applicable.

Courses exist as financial context within the Student's financial history.

Financial Reports may present financial information derived from Student-related financial facts.

## 4. Receipt Voucher

### Purpose

The Receipt Voucher exists to create incoming financial facts.

### Why it exists

Incoming money must exist in the product only through voucher truth.

### What it represents

The Receipt Voucher represents one incoming financial event.

### What it does not represent

The Receipt Voucher does not represent a statement, a report, an academic record, or a general-purpose business document.

### Conceptual relationship with other objects

The Receipt Voucher contributes financial facts.

Those facts contribute to the Student Statement.

Those facts may be presented by a Financial Report.

The Receipt Voucher may carry Course financial context.

The Receipt Voucher may be the first financial transaction that creates a Student.

## 5. Payment Voucher

### Purpose

The Payment Voucher exists to create outgoing financial facts.

### Why it exists

Outgoing money must exist in the product only through voucher truth.

### What it represents

The Payment Voucher represents one outgoing financial event.

### What it does not represent

The Payment Voucher does not represent a statement, a report, an academic record, or a general-purpose business document.

### Conceptual relationship with other objects

The Payment Voucher contributes financial facts.

Those facts may contribute to the Student Statement where applicable.

Those facts may be presented by a Financial Report.

The Payment Voucher may carry Course financial context.

## 6. Student Statement

### Purpose

The Student Statement exists to present the Student's financial information.

### Why it exists

The product must reveal student financial truth without turning the statement into a source of truth.

### What it represents

The Student Statement represents the chronological financial history of one Student.

It represents the financial obligations that exist inside that Student's financial history.

### What it does not represent

The Student Statement does not represent an independent financial record, an editable source of truth, or a separate student entity.

### Conceptual relationship with other objects

Each Student has one Student Statement.

Receipt Vouchers and Payment Vouchers contribute financial facts that the Student Statement presents.

Courses appear inside the Student Statement only as financial context.

The Student Statement is distinct from the Financial Report.

## 7. Course

### Purpose

The Course exists only as financial context.

### Why it exists

The product needs financial context for obligations inside the Student Statement.

### What it represents

The Course represents the financial context within which a financial obligation exists.

### What it does not represent

The Course does not represent an academic-management object.

The Course does not represent a separately managed educational entity inside the product.

### Conceptual relationship with other objects

The Course exists inside the Student Statement as financial context.

The Course may be referenced by Receipt Vouchers and Payment Vouchers as financial context.

The Course does not create a second Student Statement.

## 8. Financial Report

### Purpose

The Financial Report exists to present the financial information generated by the product.

### Why it exists

The product needs a product-bounded way to present derived financial information without becoming a reporting platform.

### What it represents

The Financial Report represents presented financial information derived from voucher-created financial facts.

### What it does not represent

The Financial Report does not represent a source of financial truth.

The Financial Report does not represent a general-purpose reporting platform, analytics platform, business intelligence system, or decision-support system.

### Conceptual relationship with other objects

The Financial Report derives from financial facts created by Receipt Vouchers and Payment Vouchers.

The Financial Report may present financial information related to Students, Student Statements, and Course financial context.

## 9. Conceptual Relationship Summary

The Student is the central business entity.

The Student has one chronological Student Statement.

The Voucher is the sole financial source of truth.

Receipt Vouchers create incoming financial facts.

Payment Vouchers create outgoing financial facts.

Student Statements present Student financial information derived from voucher-created financial facts.

Courses exist only as financial context inside the product.

Financial Reports present financial information derived from voucher-created financial facts.

## 10. Out Of Scope For This Document

This document does not define:

- fields
- attributes
- forms
- screens
- numbering
- IDs
- validation
- calculations
- report formats
- printing
- business rules
- workflows
- permissions
- architecture
- APIs
- database

## 11. Change History

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-08-04 | Initial draft of the product model under ARK-000 |