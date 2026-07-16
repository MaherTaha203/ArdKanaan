# DOM-002 — Business Entities

| Field | Value |
|---|---|
| Doc ID | DOM-002 |
| Title | Business Entities |
| Phase | 1A |
| Status | FROZEN |
| Version | 1.0.0 |
| Depends on | GOV-001 (F-04…F-08), DOM-001 |
| Referenced by | DOM-003, DOM-004, DOM-005 |

---

The business entities below are exactly those fixed by F-04 and F-05, plus the
Training Center and the Owner themselves. Descriptions use **business terminology
only** — no software terms. Where the business meaning of an aspect is not yet
established, the entry cites `UNK-NNN` (→ DOM-005) instead of guessing.

---

## 1. The Training Center (مركز التدريب)

- **Purpose:** the business itself — the place where training is delivered and
  through which all money flows. It is the **core of the domain** (F-04), not the
  vouchers.
- **Responsibility:** offering programs, collecting payments, honoring teacher
  shares, covering its own expenses.
- **Relationships:** employs/hosts Teachers (engagement terms → UNK-017); offers
  Training Programs; receives money from Students/Payers; holds the Center Balance.
- **Lifecycle:** permanent — exactly one center, for the life of the business (F-02).
- **Owns:** its programs' center shares, its balance, its records (vouchers,
  statements).
- **Never owns:** the teacher share of any receipt — that portion belongs to the
  teacher from the moment of the split (F-07).
- **Example:** Ard Kanaan itself.

## 2. The Owner (المالك)

- **Purpose:** the single person who operates the center and its finances (F-02).
- **Responsibility:** recording receipts and payments, paying teachers, reading
  balances and statements. The owner never calculates splits by hand (F-08).
- **Relationships:** operates the Training Center; the only human actor in the
  domain established so far (others → UNK-017).
- **Lifecycle:** permanent, singular.
- **Owns:** the center and all its decisions.
- **Never owns:** teacher shares (they are owed to teachers).
- **Example:** the proprietor of Ard Kanaan.

## 3. Training Program (البرنامج التدريبي)

- **Purpose:** a unit of instruction that students pay for; the anchor to which
  every receipt belongs (F-06).
- **Responsibility:** connecting money to a teacher and to a distribution policy:
  each program belongs to exactly one teacher and carries exactly one revenue
  distribution policy (F-06).
- **Relationships:** belongs to one Teacher; has one Revenue Distribution Policy;
  receives Receipt Vouchers.
- **Lifecycle:** not yet established — how a program starts, whether it has dates,
  cohorts, capacity, or an end → UNK-016; its price structure → UNK-005; whether
  its policy can change during its life → UNK-003.
- **Owns:** its identity, its teacher assignment, its policy assignment.
- **Never owns:** money — money is held in balances; the program is what receipts
  refer to, not an account (whether programs also act as accounts → UNK-013).
- **Example:** an English-language course taught by teacher Ahmad with a 70/30
  split policy (illustrative composition of the owner's stated example).

## 4. Teacher (المدرّب / المعلّم)

- **Purpose:** the person who delivers a training program and earns a share of its
  revenue (F-06, F-07).
- **Responsibility:** teaching; being the beneficiary of the teacher share.
- **Relationships:** has one or more Training Programs (each program has exactly
  one teacher; nothing stated limits how many programs one teacher may have —
  confirmed reading of F-06); has a Teacher Balance; receives teacher payments
  (mechanics → UNK-008).
- **Lifecycle:** not yet established — how teachers join or leave, and what happens
  to a departing teacher's balance and programs → UNK-019.
- **Owns:** the teacher share recorded in each receipt voucher of their programs;
  their balance.
- **Never owns:** the center share; other teachers' shares.
- **Example:** teacher Ahmad, whose program produced a 1000 receipt, is owed 700
  (owner's example, F-07).

## 5. Student / Payer (الطالب / الدافع)

- **Purpose:** the person who receives training and/or pays for it (F-05 names
  this entity "Students (or Payers)").
- **Responsibility:** paying for programs.
- **Relationships:** pays money that becomes Receipt Vouchers tied to one program.
- **Lifecycle:** not yet established — whether students are registered persons
  with continuing records or names on vouchers → UNK-011; whether joining a
  program is recorded before/without payment → UNK-012.
- **Owns:** nothing inside the center's finances (whether prepaid amounts create
  an obligation toward the student, e.g. refunds → UNK-006).
- **Never owns:** any part of the revenue split.
- **Example:** a student paying 1000 for a program (owner's example).

## 6. Revenue Distribution Policy (سياسة توزيع الإيراد)

- **Purpose:** the agreement that determines how each receipt of a program is
  divided into teacher share and center share (F-06, F-07).
- **Responsibility:** supplying the split automatically applied at receipt time.
- **Relationships:** exactly one policy per program (F-06). Whether one policy is
  shared by several programs or each program has its own → UNK-002.
- **Lifecycle:** may change over time — but past vouchers keep the split that was
  applied (F-07). What triggers a change and who agrees to it → UNK-003.
- **Owns:** the definition of the split (its form — percentage, fixed amounts,
  tiers — is established only by one example, 700/300 of 1000 → UNK-002).
- **Never owns:** the recorded splits inside vouchers — those belong to the
  vouchers permanently (F-07).
- **Example:** "teacher 70% / center 30%" — consistent with the owner's example;
  the general form is unconfirmed (UNK-002).

## 7. Receipt Voucher (سند قبض)

- **Purpose:** the permanent record of money received, belonging to exactly one
  training program (F-06).
- **Responsibility:** preserving, forever, the amount received and the exact split
  applied to it (F-07).
- **Relationships:** belongs to one Training Program (and through it to one
  Teacher and one policy); contributes the teacher share to the Teacher Balance
  and the center share to the Center Balance (accrual timing → UNK-020).
- **Lifecycle:** created when money is received. Whether it can ever be cancelled
  or corrected, and how → UNK-007.
- **Owns:** its amount, its date, its stored split (teacher share + center share).
- **Never owns:** the current policy — it holds a *copy* of the applied split,
  immune to later policy changes (F-07).
- **Example:** receipt of 1000 → stored inside it: teacher share 700, center
  share 300 (owner's example).

## 8. Payment Voucher (سند صرف)

- **Purpose:** the permanent record of money paid out (F-05).
- **Responsibility:** documenting outgoing money.
- **Relationships:** not yet established — what a payment voucher may be tied to
  (a teacher payment? a center expense category? a program?) → UNK-008, UNK-009,
  UNK-015.
- **Lifecycle:** created when money is paid. Cancellation/correction → UNK-007.
- **Owns:** its amount, its date, its purpose (categories → UNK-009).
- **Never owns:** revenue splits — splits belong to receipt vouchers only.
- **Example:** none stated by the owner yet (UNK-009).

## 9. Operation (عملية)

- **Purpose:** listed by the owner as a core entity (F-05), but its business
  meaning is **not yet defined** → **UNK-001**.
- **Responsibility / Relationships / Lifecycle / Owns / Never owns / Example:**
  unknown — deliberately not invented (AI-10). Plausible readings (a ledger line;
  any money movement; a generic term covering both voucher types) are recorded as
  candidate interpretations under UNK-001 for the owner to confirm.

## 10. Account Statement (كشف حساب)

- **Purpose:** a readable listing of financial activity for some party or scope
  (F-05).
- **Responsibility:** letting the owner see what happened without calculating
  anything (F-08, M-07).
- **Relationships:** whose statements exist (teacher, center, program, student)
  and over what periods → UNK-013.
- **Lifecycle:** derived on demand from recorded vouchers; it records nothing of
  its own (follows from F-08's no-manual-computation principle; presentation
  specifics → UNK-013).
- **Owns:** nothing — it is a view of existing records.
- **Never owns:** vouchers or balances.
- **Example:** "statement of teacher Ahmad" — scope and content to be confirmed
  (UNK-013).

## 11. Center Balance (رصيد المركز)

- **Purpose:** what the center currently holds/is entitled to (F-05).
- **Responsibility:** answering "how much does the center have?" at any moment
  without manual computation (F-08).
- **Relationships:** increased by center shares of receipts; affected by outgoing
  payments — exact composition (does it include cash held on behalf of teachers?)
  → UNK-020.
- **Lifecycle:** continuous; recalculated from records, never entered by hand
  (F-08).
- **Owns:** nothing — it is a derived quantity.
- **Never owns:** teacher shares (they belong to teachers, F-07).
- **Example:** after the single 1000 receipt (split 700/300) and no payments, the
  center share standing is 300; whether "center balance" equals 300 or 1000-held-
  minus-obligations depends on UNK-020.

## 12. Teacher Balance (رصيد المدرّب)

- **Purpose:** what a teacher is currently owed (F-05).
- **Responsibility:** answering "how much is teacher X owed?" at any moment
  without manual computation (F-08).
- **Relationships:** increased by teacher shares of receipts on the teacher's
  programs (F-07); decreased by teacher payments (mechanics → UNK-008); accrual
  timing (at receipt vs. other) → UNK-020.
- **Lifecycle:** continuous; derived from records.
- **Owns:** nothing — derived quantity.
- **Never owns:** center shares.
- **Example:** after the 1000 receipt on Ahmad's program, Ahmad's balance shows
  700 owed (owner's example, subject to UNK-020 timing confirmation).
