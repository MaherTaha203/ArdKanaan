# DOM-002 — Business Entities

| Field | Value |
|---|---|
| Doc ID | DOM-002 |
| Title | Business Entities |
| Phase | 1A |
| Status | FROZEN |
| Version | 8.3.0 |
| Depends on | GOV-001 (F-04…F-08), ADR-0008 (owner decisions D2–D6), ADR-0009 (V1 scope), ADR-0010 (Operations definition), ADR-0013 (Session 3 decisions), ADR-0015 (Session 4 teacher payments), ADR-0016 (Session 5 student refunds), ADR-0017 (register restructure), ADR-0018 (Session 6 corrections & cancellations), ADR-0019 (Session 7 expense categories), ADR-0020 (Session 8 expense returns), ADR-0021 (Session 9 refund entitlement & teacher debt), ADR-0022 (Session 10 program definition, pricing & policy), ADR-0023 (Session 11 business boundary & operational completeness), DOM-001 |
| Referenced by | DOM-003, DOM-004, DOM-005 |

---

The business entities below are those fixed by F-04 and F-05, plus the Training
Center and the Owner themselves, plus the **Refund Voucher** (ADR-0016 S5-D6),
the **Expense Category** (ADR-0019 S7-D3), and the **Expense Return**
(ADR-0020 S8-D1) added by Owner decision. One exception: §9 "Operations" is, by the owner's
definitive ruling, **not an entity** but a system activity view (ADR-0010) — it
stays in this catalog only so the founding term is defined in one place. Descriptions use **business terminology
only** — no software terms. Where the business meaning of an aspect is not yet
established, the entry cites `UNK-NNN` (→ DOM-005) instead of guessing.

**Common lifecycle for the three financial vouchers (Receipt §7, Payment §8,
Refund §13):** each is Posted immediately on save (DR-043) and is thereafter
immutable (DR-044). A financial error is fixed by
cancellation — a **"Cancelled"** status on the original that reverses all
effects automatically and is preserved and visible (DR-045, DR-047) — followed
by recreation (DR-048); a document cannot be cancelled while later documents
depend on it (DR-046). Descriptive (non-financial) fields may be edited in place
with full change logging (DR-048).

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

**In V1 a Program represents a single Program Run (Offering)** — one independent
training offering with its own financial identity (ADR-0022 S10-D1; the entity
name stays "Program"). Each new run of a same-named service is a distinct Program;
the shared service name (e.g. "ICDL") is only a label and creates no financial
link between runs (DR-071).

- **Purpose:** a single training offering that students pay for; the anchor to
  which every receipt belongs (F-06). It is the basic financial unit on which all
  student and teacher operations are built.
- **Responsibility:** connecting money to a teacher and to a distribution policy:
  each program belongs to exactly one teacher (DR-002; one teacher per run
  confirmed for V1 — S10-D3) and carries exactly one revenue distribution policy
  (F-06). It also holds the program's base price (DR-072).
- **Relationships:** belongs to one Teacher; has one Revenue Distribution Policy;
  receives Receipt Vouchers; Students register in it as an independent event
  before paying (DR-022). Fully independent of every other program, including
  same-named runs; any number of programs may be open at once (DR-071). Settings
  copied from a prior run at creation are initial values only, not a live link.
- **Lifecycle:** created by the Owner with a base price (DR-072), a fixed
  distribution percentage (DR-076), and a documentary **start date** and **end
  date** that drive no automatic behavior (DR-077). Actual operation is governed by
  an Owner-controlled **Open/Closed** status: closing blocks new registrations and
  new receipts while keeping all records visible and allowing legitimate operations
  on existing records (DR-078); a closed program may be reopened at any time
  (DR-079). No capacity limit and no internal cohorts exist in V1 (§Future
  considerations, DOM-004).
- **Owns:** its identity, its teacher assignment, its policy assignment, its base
  price, its start/end dates, and its Open/Closed status.
- **Never owns:** money — money is held in balances; the program is what receipts
  refer to, not an account (whether programs also act as accounts → UNK-013).
- **Example:** "ICDL — January 2026", taught by teacher Ahmad, 70/30 split, base
  price 1000, Open — an independent program; "ICDL — September 2026" is a separate
  independent program sharing only the name.

## 4. Teacher (المدرّب / المعلّم)

- **Purpose:** the person who delivers a training program and earns a share of its
  revenue (F-06, F-07).
- **Responsibility:** teaching; being the beneficiary of the teacher share.
- **Relationships:** has one or more Training Programs (each program has exactly
  one teacher; nothing stated limits how many programs one teacher may have —
  confirmed reading of F-06); holds one independent balance **per program**
  (Teacher × Program, DR-031); receives owner-initiated teacher payments per
  program, partial or full up to the outstanding balance, never in advance
  (DR-030, DR-032, DR-033); may owe the center a **teacher debt** — per
  Teacher × Program — when a refund reverses revenue they were already paid for
  beyond their final entitlement (DR-039, DR-065, §16), settled by direct
  repayment or by same-program future-entitlement deduction (DR-068).
- **Lifecycle:** carries an Owner-controlled status, **Active / Inactive-Left**
  (DR-083, §18). Setting Inactive-Left blocks assigning **new** programs but has no
  automatic financial or historical effect: all prior programs, vouchers,
  entitlements, payments, balances, debts, and history persist, and every operation
  on existing balances (payouts, refunds, entitlement recalculation, debt
  create/settle) stays available until obligations are settled (DR-084). How a
  teacher first joins is an administrative act (no system rule).
- **Owns:** the teacher share recorded in each receipt voucher of their programs;
  their independent per-program balances (DR-031).
- **Never owns:** the center share; other teachers' shares.
- **Example:** teacher Ahmad, whose program produced a 1000 receipt, is owed 700
  (owner's example, F-07).

## 5. Student (الطالب)

- **Purpose:** the person who receives training — the **core person entity** of
  the system (ADR-0013 S3-D1; refines F-05's "Students (or Payers)").
- **Responsibility:** registering in programs and paying for them (or having a
  payer pay on their behalf).
- **Relationships:** registers in Training Programs — registration is an
  independent recorded event that precedes payment (DR-022); every receipt
  voucher belongs to exactly one student (DR-023); the account statement belongs
  to the student (S3-D1; other statement scopes → UNK-013). When someone else
  pays (parent, company, other party), their name is recorded on the voucher as
  the optional **Payer Name** field — the payer is information, never an entity
  in V1 (DR-021).
- **Lifecycle:** created at registration, even with no payment yet; each
  registration carries a **Final Registration Price** — the program's base price
  by default (DR-072), which the Owner may override for that registration only
  (DR-073). It is a single stored amount with no discount concept (DR-074),
  editable until the first receipt and locked thereafter (DR-075). The student may
  pay later, in installments up to that amount (DR-023, DR-024); may withdraw
  before paying (S3-D2); may receive a refund, recorded by a Refund Voucher (§13,
  DR-041) — the amount and conditions are the Owner's practice (a free input,
  S5-D7). A registration itself carries an Owner-controlled status, **Active /
  Ended-Withdrawn** (DR-086, §18), independent of any refund (DR-085): Ended blocks
  new receipts while preserving history and still allowing refunds on prior
  receipts, and is reversible — reactivation resumes the same registration with its
  Final Registration Price preserved (DR-087). A genuinely new relationship
  (another program, or a new obligation) is a new registration.
- **Owns:** their registrations and their statement.
- **Never owns:** any part of the revenue split.
- **Example:** a student registers today in the English program, pays 600 next
  week and 400 the week after — two receipt vouchers, each with its own number
  and date, each split at its own posting moment (owner's rulings S3-D2/S3-D3).

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
- **Lifecycle:** **fixed for the program's whole life** — a program's percentage
  is set at creation and never changes in place (DR-076); a different agreement is
  realized by creating a new Program (run), and past vouchers always keep the split
  that was applied (F-07, DR-006).
- **Owns:** the definition of the percentage split (teacher % + center % = 100%).
- **Never owns:** the recorded splits inside vouchers — those belong to the
  vouchers permanently (F-07); rounding rules (currency-owned, DR-014).
- **Example:** English → Teacher 70% / Center 30%; Mathematics → Teacher 60% /
  Center 40% (owner's examples, ADR-0008 D2 as scoped by ADR-0009).

## 7. Receipt Voucher (سند قبض)

- **Purpose:** the permanent record of one payment received — always exactly
  **one student + one program + one payment** (F-06, DR-023).
- **Responsibility:** preserving, forever, the amount received and the exact split
  applied to it (F-07).
- **Relationships:** belongs to one Student (DR-021) and one Training Program
  (and through it to one Teacher and one policy). Posting it automatically
  creates three business effects: Cash Balance up by the full amount, Teacher
  Payables up by the teacher share (the teacher's entitlement begins at that
  moment — DR-015), Center Net Balance up by the center share (DR-017, ADR-0008
  D4/D6). The system prevents an amount larger than what is due (DR-024).
- **Lifecycle:** created and Posted immediately on save (DR-043); posting is
  what triggers the ledger effects. Carries its own number from the
  continuous receipt sequence (DR-026). Once Posted it is immutable (DR-044): a
  financial mistake is fixed by cancellation (a "Cancelled" status that reverses
  all effects, DR-045/DR-047) then recreation (DR-048); it cannot be cancelled
  while a teacher payment or refund depends on it (DR-046). Descriptive fields
  (e.g. Payer Name) may be edited with logging (DR-048).
- **Owns:** its sequential number, its date, its whole-shekel amount (DR-025),
  its single payment method — cash or bank transfer (DR-025), its optional Payer
  Name (DR-021), and its stored split (teacher share + center share).
- **Never owns:** the current policy — it holds a *copy* of the applied split,
  immune to later policy changes (F-07). Refunds never attach to it — they
  attach to the Student × Program only (DR-040).
- **Example:** receipt of 1000 → stored inside it: teacher share 700, center
  share 300 (owner's example).

## 8. Payment Voucher (سند صرف)

- **Purpose:** the permanent record of money paid out (F-05).
- **Responsibility:** documenting outgoing money — permanently: every payment
  voucher remains recorded forever for auditing (DR-034).
- **Two kinds (V1):** (a) **Teacher payment** — issued by the Owner, belonging
  to exactly one Program, settling teacher entitlement (DR-030, DR-032); (b)
  **Center expense** — a general, center-borne operating cost carrying exactly
  one expense category (DR-049…DR-054), not attached to any program or teacher.
- **Relationships:** a teacher payment relates to one Teacher × Program; a
  center expense relates to one **Expense Category** (§14) and to no program or
  teacher (DR-052). Neither is a refund (refunds use the Refund Voucher, §13).
- **Lifecycle:** created and Posted immediately on save (DR-043); carries its
  own number from the continuous payment sequence, independent of
  the receipt sequence (DR-026). Once Posted it is immutable (DR-044); an error
  is fixed by cancellation + recreation (DR-045…DR-048). A teacher-payment
  voucher must be cancelled before the receipt it drew from can be cancelled
  (DR-046). An expense is recorded only when cash has actually left the center
  (DR-053).
- **Owns:** its sequential number, its amount, its date; for a center expense,
  its single expense category (DR-051); for a teacher payment, the Program it
  settles.
- **Never owns:** revenue splits — splits belong to receipt vouchers only.
- **Example:** teacher payment — 400 to teacher Ahmad for the Excel program
  (settles Excel outstanding). Center expense — 300 rent, category "Rent"
  (reduces Cash Balance and Center Net Balance; no teacher affected).

## 9. Operations — System Activity View (سجل النشاط / العمليات)

**Reclassified by the owner (ADR-0010): Operations is NOT a business entity.**
It is a **chronological activity timeline** of everything that happened inside
the system — an activity log presented in a business-friendly way. F-05's listing
names this view within the core vocabulary; it does not make it a domain object.
It is described here so the founding term stays defined in one place:

- **Purpose:** letting the owner see the center's history — everything that
  happened, newest first, searchable (ADR-0010 §8).
- **Responsibility:** *recording and displaying* meaningful business events
  (voucher created/edited/cancelled, teacher payment recorded, program
  created/modified, policy changed, settings changed, backup/restore). It
  creates **no business logic** — rules belong to the originating entity
  (DR-018).
- **Relationships:** every operation belongs to a source (Receipt Voucher,
  Payment Voucher, Training Program, Teacher, Settings, Backup, System); an
  operation never exists by itself (DR-020). Some operations carry financial
  impact, some do not (DR-020).
- **Lifecycle:** append-only history — operations are immutable historical
  events; corrections generate new operations; history never disappears
  (DR-019).
- **Owns:** nothing — it displays events.
- **Never owns:** business rules, balances, or documents.
- **Example:** a timeline row: "Receipt Voucher posted — 1000 — English program
  (Teacher Ahmad) — split 700/300 — financial impact: yes."

## 10. Account Statement (كشف حساب)

- **Purpose:** a readable listing of financial activity for some party or scope
  (F-05).
- **Responsibility:** letting the owner see what happened without calculating
  anything (F-08, M-07).
- **Relationships:** the account statement belongs to the **Student** (ADR-0013
  S3-D1); whether teacher/center/program statements also exist, and over what
  periods with what content → UNK-013.
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
  money is paid out (DR-008) — teacher payments (DR-030), center expenses
  (DR-052/DR-053), and refunds (DR-042); up again when cash returns for a prior
  expense (expense return, DR-060).
- **Lifecycle:** continuous; derived.
- **Owns / Never owns:** nothing — a derived quantity; the portion matching
  Teacher Payables is held, not owned (DR-012).
- **Example:** after the single 1000 receipt: Cash Balance = 1000 (owner's
  example).

### 11b. Teacher Payables (مستحقات المدرّبين)

- **Purpose:** money currently owed to teachers — the aggregate of all
  Teacher × Program balances (DR-031).
- **Responsibility:** answering "how much do I owe teachers in total?".
- **Relationships:** up by the teacher share the moment each receipt is posted
  (entitlement at posting, DR-015, DR-029); down by owner-issued teacher payment
  vouchers, per program (DR-030, DR-032…DR-034), and by the teacher portion of
  refunds when the teacher was not yet paid — floored at zero, never negative
  (DR-038, DR-062, DR-064); the already-paid case instead raises a teacher debt
  (DR-039, DR-065, §16).
- **Lifecycle:** continuous; derived.
- **Owns / Never owns:** derived quantity; its amounts belong to the teachers
  (DR-012).
- **Example:** after the 1000 receipt at 70/30: Teacher Payables = 700 (owner's
  example).

### 11c. Center Net Balance (صافي رصيد المركز)

- **Purpose:** the center's own earned share.
- **Responsibility:** answering "how much has the center itself earned?".
- **Relationships:** up by the center share of every posted receipt (DR-017);
  down by the center's portion of every refund (revenue reversal, DR-042); down
  by **every center expense** — the center bears all expenses in V1 (DR-052); and
  up again by every **expense return**, which reverses a center-borne expense
  (DR-056, DR-060).
- **Lifecycle:** continuous; derived.
- **Owns / Never owns:** derived quantity; never includes teacher shares.
- **Example:** after the 1000 receipt at 70/30: Center Net Balance = 300 (owner's
  example).

## 12. Teacher Balance (رصيد المدرّب) — per Teacher × Program

- **Purpose:** what one specific teacher is currently owed **for one specific
  program** (F-05 as refined by ADR-0015 S4-D4): every Teacher × Program
  combination is an independent financial relationship (DR-031). There is no
  global teacher balance.
- **Responsibility:** answering "how much is teacher X owed for program Y?" at
  any moment without manual computation (F-08), by the fixed arithmetic:
  Outstanding Balance = Total Teacher Entitlement − Total Payments issued for
  that Program (DR-034).
- **Relationships:** increased by the teacher share the moment a receipt on that
  program is posted — entitlement from posted receipts only, with no additional
  conditions (DR-015, DR-029); decreased by owner-issued Payment Vouchers for
  that program, partial or full, never exceeding the outstanding balance and
  never in advance (DR-030, DR-032, DR-033); settling one program leaves the
  teacher's other programs untouched (S4-D6). Payments are never allocated to
  specific receipts — no receipt-allocation algorithm (DR-034). Every component of the balance is
  inspectable: receipt voucher, student, program, amount, percentage, teacher
  share (DR-035).
- **Lifecycle:** continuous; derived from permanent records.
- **Owns:** nothing — derived quantity.
- **Never owns:** center shares; other programs' balances.
- **Example:** Teacher Ahmed teaches Excel, ICDL, and Accounting — three
  independent balances (owner's example, S4-D4). The moment a 1000 receipt on
  Excel is posted at 70/30, Ahmed's Excel balance shows 700 owed; paying him 400
  leaves Excel outstanding at 300, while ICDL and Accounting are unaffected.

## 13. Refund Voucher (سند استرجاع)

**Added by Owner decision (ADR-0016 S5-D6) — a dedicated, independent financial
document that extends the founding entity set (F-05).**

- **Purpose:** the permanent record of a student refund — a reversal of
  previously recognized revenue (DR-036), never an expense.
- **Responsibility:** recording the refund amount and reason; reversing
  recognized revenue; adjusting teacher entitlement (or creating a teacher
  debt, DR-039); appearing in the Student Statement; participating in the full
  audit trail (DR-042).
- **Relationships:** references exactly one Student and one Program (DR-040 —
  never individual receipts; no receipt-allocation algorithm); reduces the Student × Program paid
  amount and Program Revenue (DR-037); moves the three balances per DR-042.
- **Lifecycle:** created and Posted immediately on save (DR-043) — when the
  Owner grants a refund (the amount and conditions are the Owner's practice, a free
  input — S5-D7); it **never** changes the student's registration status
  automatically (DR-085). Permanent and immutable once recorded (DR-019, DR-044). An error is fixed by cancellation +
  recreation (DR-045…DR-048); it must be cancelled before the receipt it depends
  on can be cancelled (DR-046). Its numbering is a deferred design decision
  (ADR-0017 §2), not a domain unknown.
- **Owns:** its amount, its date, its recorded reason.
- **Never owns:** receipt vouchers' stored splits (DR-006 permanence is
  untouched — reversal happens beside history, never by editing it).
- **Example:** a student who paid 1000 for a program withdraws and the Owner
  grants a 400 refund: a Refund Voucher (student, program, 400, reason) is
  recorded; Program Revenue and the student's paid amount drop by 400; the
  teacher's entitlement reflects the net revenue (DR-038) — and if the teacher
  had already been paid for that portion, the teacher share of the 400 becomes
  a debt (DR-039).

## 14. Expense Category (بند المصروف)

**Added by Owner decision (ADR-0019 S7-D3) — a supporting classification for
center expenses.**

- **Purpose:** naming what a center expense was for (rent, utilities,
  stationery, cleaning, maintenance, government fees, subscriptions, …) so the
  owner can see per-category spending totals plus each expense's detail
  (DR-051).
- **Responsibility:** classifying every center expense; each expense carries
  exactly one category (DR-051).
- **Relationships:** an owner-maintained **expandable list** — the owner adds
  new categories when needed (DR-051). Categories apply only to center-expense
  Payment Vouchers (§8), never to receipts, refunds, or teacher payments.
- **Lifecycle:** created by the owner as needed; endures for classifying future
  expenses.
- **Owns:** its name.
- **Never owns:** money, balances, or vouchers — it only classifies expenses.
- **Example:** "Rent", "Electricity", "Maintenance". Buying a desk is recorded
  as an ordinary expense under (say) "Furniture" — V1 draws no fixed-asset
  distinction (DR-050).

## 15. Expense Return (استرداد مصروف)

**Added by Owner decision (ADR-0020 S8-D1) — the record of a financial value
returning to the center because of a prior expense.**

- **Purpose:** recording that cash has come back to the center for a specific
  prior expense, reducing/reversing that expense — never new income (DR-055,
  DR-056).
- **Responsibility:** reducing the original expense's real cost; in V1 realized
  by actual cash returning (DR-060).
- **Relationships:** references exactly **one** original expense that is Posted
  and not cancelled (DR-058, DR-059); one expense may have several returns, but
  a return never spans multiple expenses (DR-058). Because it depends on its
  expense, that expense cannot be cancelled while the return is attached
  (DR-046).
- **Lifecycle:** created when cash actually returns — no time limit (DR-061);
  bounded so total returns never exceed the original expense (DR-057). Posted on
  save and immutable; an error is fixed by cancellation + recreation
  (DR-043…DR-048). Its numbering is a deferred design decision, not a domain
  unknown.
- **Owns:** its amount, its date, and the reference to its original expense.
- **Never owns:** the original expense itself; it only reduces it. Never touches
  teachers.
- **Effect:** Cash Balance up by the returned amount; Center Net Balance up by
  the same (reversing the center-borne expense) — DR-060.
- **Example:** the center paid 1000 for supplies (expense), then the supplier
  returns 300: an Expense Return of 300 against that expense → real expense 700;
  Cash Balance +300, Center Net Balance +300. Credit notes and goods
  replacement are **not** expense returns in V1 (DR-060).

## 15a. Non-Program Educational Revenue (إيرادات تعليمية غير البرامج)

**Added by Owner decision (ADR-0023 S11-D1…D3).** Beyond program fees, V1 records
three other educational revenue sources; the record/document structure that holds
them is an architectural decision (not modeled here).

- **Purpose:** recording money the center earns from **exam fees**,
  **certificate-issuance fees**, and **book/material sales** — each charged
  separately from the program.
- **Responsibility:** capturing center income tied to a defined revenue source
  (DR-080) and to a student (DR-082).
- **Relationships:** each is **entirely center revenue** — no teacher share,
  entitlement, balance, or debt (DR-081); revenue distribution applies only to
  program fees. Each is **always tied to a student**, with a **program link
  optional** (DR-082). Recording one raises the **Cash Balance** and the **Center
  Net Balance** only (DR-081).
- **Lifecycle:** recorded when the money is received, against its named source; its
  refundability and any amount-due/overpayment handling are open questions
  (→ UNK-029, UNK-030).
- **Owns:** nothing beyond the recorded amount, its source, and its student link.
- **Never owns:** any teacher share — it never touches a teacher.
- **Out of scope (V1):** room rental, consulting, other services; general
  (non-student) educational sales (DOM-004 §Future considerations).
- **Example:** an exam fee of 120 charged to student Sara (optionally linked to the
  ICDL program): Cash Balance +120, Center Net Balance +120; no teacher affected.

## 16. Teacher Debt (دين المدرّب) — per Teacher × Program

**Specified by Owner decision (ADR-0021 S9-D4…D9).** Like the Teacher Balance
(§12), a teacher debt is a **derived per-program quantity**, not a voucher or a
new entity type. It is described here because it now has a fully defined
lifecycle.

- **Purpose:** what one teacher must return to the center **for one specific
  program** because a refund reversed revenue they had already been paid for
  beyond their final entitlement (DR-065). A teacher debt exists **only** when the
  total already paid to the teacher for a program exceeds that teacher's final
  entitlement for the program after all refund recalculations; the excess is the
  debt.
- **Responsibility:** answering "how much must teacher X return on program Y?"
  without manual computation (F-08). It is distinct from the Teacher Balance (§12,
  what the center owes the teacher) and is **never** modelled as a negative
  entitlement — unpaid entitlement floors at zero (DR-064).
- **Relationships:** tracked for each **Teacher × Program** independently and
  **never merged or offset across programs** (DR-066, DR-031) — an Excel debt is
  never cleared with ICDL entitlements. Settled by **either** direct repayment by
  the teacher **or** deduction from the teacher's future entitlements on the
  **same** program, or a mix of both, always at the Owner's case-by-case choice —
  never automatically (DR-068). Direct repayment brings cash back to the center
  (Cash Balance up); a deduction reduces a future entitlement on that program.
- **Lifecycle:** arises the moment a refund of already-paid revenue pushes final
  entitlement below what was paid (DR-065); a **settleable balance** that only
  decreases, in partial and/or multiple steps, never going negative, closing when
  it reaches **zero** (DR-067). It has **no expiry** — it stays open until
  actually settled (DR-069). If the program has no future entitlement, only direct
  repayment can clear it (DR-070). The record used to capture a settlement is a
  deferred design decision, not a domain unknown.
- **Owns:** nothing — a derived quantity.
- **Never owns:** other programs' balances or debts; it is never offset against
  entitlements on another program (DR-066).
- **Example:** a teacher paid 700 on Excel; a refund cuts final Excel entitlement
  to 420 → a 280 Excel debt. The teacher repays 100 directly (balance 180), and
  the Owner deducts the remaining 180 from the next Excel entitlement → debt
  closed. An ICDL amount owed to the same teacher is untouched throughout.

## 17. Operational Status Lifecycle (shared pattern)

**Documented by Owner decision (ADR-0023 S11-D9).** Three entities carry an
operational status, and all follow **one shared pattern** (DR-088):

| Entity | Status values | Blocks (new business) | Preserves |
|---|---|---|---|
| **Program** (§3) | Open / Closed | new registrations, new receipts (DR-078) | all records; operations on existing records allowed |
| **Teacher** (§4) | Active / Inactive-Left | new program assignment (DR-083) | all balances; all operations on existing balances allowed (DR-084) |
| **Registration** (§5) | Active / Ended-Withdrawn | new receipts (DR-086) | all records; refunds on prior receipts allowed |

Every one of these statuses is:

- **Owner-controlled** — changed only by a deliberate Owner action, never
  automatically;
- **Reversible** — a Closed program reopens (DR-079), an Inactive teacher can
  return, an Ended registration reactivates (DR-087);
- **History-preserving** — nothing is deleted or hidden;
- **New-business-blocking only** — it stops *new* activity, not operations on
  already-existing records;
- **Never rewrites financial history** — no prior entitlement, balance, receipt, or
  refund is altered by a status change.

Any future operational status in V1 follows this same pattern (DR-088).
