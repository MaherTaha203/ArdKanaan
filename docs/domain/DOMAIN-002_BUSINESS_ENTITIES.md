# DOM-002 — Business Entities

| Field | Value |
|---|---|
| Doc ID | DOM-002 |
| Title | Business Entities |
| Phase | 1A |
| Status | FROZEN |
| Version | 2.1.0 |
| Depends on | GOV-001 (F-04…F-08), ADR-0008 (owner decisions D2–D6), ADR-0009 (V1 scope), DOM-001 |
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

- **Purpose:** the agreement that determines the teacher's compensation for a
  program and thereby how each receipt divides into teacher share and center
  share (F-06, F-07).
- **Responsibility:** supplying the split automatically applied at receipt time.
  In Version 1 the policy is always a **percentage split** (DR-013, ADR-0009): a
  teacher percentage and a center percentage that always sum to 100%. Other
  compensation models are postponed Future Considerations (→ DOM-004 §Future
  considerations) and are not part of this entity in V1.
- **Relationships:** belongs to the Training Program — exactly one policy per
  program, never to the teacher directly; one teacher's programs may each carry
  different percentages (ADR-0008 D2). Rounding is never the policy's concern —
  it belongs to the currency (DR-014).
- **Lifecycle:** may change over time — but past vouchers keep the split that was
  applied (F-07). What triggers a change and who agrees to it → UNK-003.
- **Owns:** the definition of the percentage split (teacher % + center % = 100%).
- **Never owns:** the recorded splits inside vouchers — those belong to the
  vouchers permanently (F-07); rounding rules (currency-owned, DR-014).
- **Example:** English → Teacher 70% / Center 30%; Mathematics → Teacher 60% /
  Center 40% (owner's examples, ADR-0008 D2 as scoped by ADR-0009).

## 7. Receipt Voucher (سند قبض)

- **Purpose:** the permanent record of money received, belonging to exactly one
  training program (F-06).
- **Responsibility:** preserving, forever, the amount received and the exact split
  applied to it (F-07).
- **Relationships:** belongs to one Training Program (and through it to one
  Teacher and one policy). Posting it automatically creates three business
  effects: Cash Balance up by the full amount, Teacher Payables up by the teacher
  share (the teacher's entitlement begins at that moment — DR-015), Center Net
  Balance up by the center share (DR-017, ADR-0008 D4/D6).
- **Lifecycle:** created when money is received; posting it is what triggers the
  ledger effects. Whether it can ever be cancelled or corrected, and how →
  UNK-007.
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

## 11. The Three Balances (الأرصدة الثلاثة)

The owner distinguishes **three completely different balances that must never be
merged** (ADR-0008 D5, DR-016). This refines F-05's "Center Balance / Teacher
Balances" — see ADR-0008 interpretation boundaries. All three are derived
quantities, recalculated from records, never entered by hand (F-08), and all
three rise automatically when a receipt is posted (DR-017).

### 11a. Cash Balance (الرصيد النقدي)

- **Purpose:** all cash currently held by the center.
- **Responsibility:** answering "how much money is physically here?".
- **Relationships:** up by the full amount of every posted receipt; down when any
  money is paid out (DR-008).
- **Lifecycle:** continuous; derived.
- **Owns / Never owns:** nothing — a derived quantity; the portion matching
  Teacher Payables is held, not owned (DR-012).
- **Example:** after the single 1000 receipt: Cash Balance = 1000 (owner's
  example).

### 11b. Teacher Payables (مستحقات المدرّبين)

- **Purpose:** money currently owed to teachers — the aggregate of all individual
  teacher balances.
- **Responsibility:** answering "how much do I owe teachers in total?".
- **Relationships:** up by the teacher share the moment each receipt is posted
  (entitlement at posting, DR-015); down by teacher payments (mechanics →
  UNK-008).
- **Lifecycle:** continuous; derived.
- **Owns / Never owns:** derived quantity; its amounts belong to the teachers
  (DR-012).
- **Example:** after the 1000 receipt at 70/30: Teacher Payables = 700 (owner's
  example).

### 11c. Center Net Balance (صافي رصيد المركز)

- **Purpose:** the center's own earned share.
- **Responsibility:** answering "how much has the center itself earned?".
- **Relationships:** up by the center share of every posted receipt (DR-017);
  relation to center expenses (does it decrease with expenses?) → UNK-009,
  UNK-015.
- **Lifecycle:** continuous; derived.
- **Owns / Never owns:** derived quantity; never includes teacher shares.
- **Example:** after the 1000 receipt at 70/30: Center Net Balance = 300 (owner's
  example).

## 12. Teacher Balance (رصيد المدرّب)

- **Purpose:** what one specific teacher is currently owed (F-05); the per-teacher
  component of Teacher Payables (§11b).
- **Responsibility:** answering "how much is teacher X owed?" at any moment
  without manual computation (F-08).
- **Relationships:** increased by the teacher share the moment a receipt on the
  teacher's programs is posted — a teacher receivable is created then (DR-015,
  ADR-0008 D4); decreased by teacher payments (mechanics → UNK-008). Entitlement
  and payment are two different business events (D4).
- **Lifecycle:** continuous; derived from records.
- **Owns:** nothing — derived quantity.
- **Never owns:** center shares.
- **Example:** the moment the 1000 receipt on Ahmad's program is posted, Ahmad is
  owed 700 — even though he is paid later (owner's example + D4).
