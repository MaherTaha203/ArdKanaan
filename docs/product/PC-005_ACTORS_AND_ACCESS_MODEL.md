# PC-005 — Actors & Access Model

| Field | Value |
|---|---|
| Doc ID | PC-005 |
| Title | Actors & Access Model |
| Phase | 1 (Product Constitution) |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | PC-001 (PA-2, PA-6), PC-002 (PP-6), PC-003 (Owner, Teacher, Student concepts), PC-004 (NS-1/NS-3, AP-4), F-02, DR-089 |
| Answers | "Who acts on this product, and who may operate it?" |

---

## 1. Purpose

Fix, permanently, **who the product's actors are** and **who may operate it.** The
single-user model is a product law, not an implementation detail; this document states
it as testable invariants that constrain every future PR.

## 2. Actor kinds

Every actor is exactly one of three kinds:

| Kind | Definition | Operates the product? |
|---|---|---|
| **System User** | an actor who *operates* the product — records facts and reads truth | **Yes** |
| **Party** | an actor who *appears in* records as a subject, but never operates the product | No |
| **Contact** | information about a party, held for communication; performs nothing | No |

## 3. The actors

**Owner** — *System User (the only one)*
- **Access:** total — may perform every capability; nothing is hidden from or forbidden to the Owner.
- **Product relationship:** authors every recorded fact and reads every derived truth; the sole origin of change (PP-6).
- **Reason:** the business is operated by one person (F-02); one owner, never many (PA-2).
- **Source:** F-02; DOM-002 §2; PC-003 Owner.

**Teacher** — *Party*
- **Access:** none — never operates the product.
- **Product relationship:** subject of programs, entitlements, balances, and debts.
- **Reason:** the split has a beneficiary who must be known (F-06/F-07).
- **Source:** DOM-002 §4; PC-003 Teacher.

**Student** — *Party*
- **Access:** none — never operates the product.
- **Product relationship:** subject of registrations and of all money received for training; has a Financial Standing.
- **Reason:** money-in and standing attach to a person (ADR-0013).
- **Source:** DOM-002 §5; PC-003 Student.

**Guardian** — *Contact*
- **Access:** none — performs nothing.
- **Product relationship:** contact information attached to a Student.
- **Reason:** a student may be a minor whose family the center contacts (S12).
- **Source:** DR-089; PC-003 Student (Guardian contact).

**No other actor exists.** There is no employee, accountant, secretary, assistant, or
partner in the product (UNK-017 closed; only the Guardian contact was added).
Introducing any is forbidden (AX-1/AX-2).

## 4. The Access Model (constitutional)

Because there is exactly one operator and no organizational structure, the access
model is **degenerate by constitution** and stated as invariants:

- **AX-1 — One system user.** The product has exactly one operator, the Owner, and
  **no concept of a second user, account, or login identity beyond the one.** *Test:*
  no PR introduces a second user/account.
- **AX-2 — No roles or permissions.** The product has **no** role, permission,
  access-level, or authorization concept. *Test:* no PR introduces a
  role/permission/authorization decision (PA-6; NS-3; AP-4).
- **AX-3 — Parties and contacts never operate.** Teachers, Students, and Guardians
  exist only as subjects or information in records; the product grants them **no**
  operating capability. *Test:* no PR gives a Teacher/Student/Guardian a capability to
  act.
- **AX-4 — Total access for the one user.** The Owner may perform every capability the
  product has; the product **hides nothing from and forbids nothing to** the Owner.
  *Test:* no PR restricts the Owner from a capability.
- **AX-5 — Guarantee, not mechanism.** "Only the Owner operates the product" is a
  **product guarantee**; the means of enforcing it (authentication) is **Engineering**
  (GOV-012 L10, Guarantee/Mechanism). PC-005 states the guarantee only; it specifies no
  mechanism.

## 5. Traceability

| Actor | Kind | Source | Why the product exposes it | Future documents affected |
|---|---|---|---|---|
| Owner | System User | F-02, DOM-002 §2 | The sole operator & origin of change | PC-007, Phase 2, Phase 3, Phase 4, Testing |
| Teacher | Party | DOM-002 §4 | Beneficiary subject of the split | PC-007, Phase 2, Phase 4, Testing |
| Student | Party | DOM-002 §5 | Subject of money-in & standing | PC-007, Phase 2, Phase 4, Testing |
| Guardian | Contact | DR-089 | Communication with a minor's family | PC-007, Phase 4, Testing |
| Access Model (AX-1…AX-5) | — | PA-2, PA-6, F-02 | Fixes single-user, no-roles as law | PC-007, Phase 3 (guarantee), Phase 4, Testing |
