import { useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  Archive,
  ArchiveRestore,
  Ban,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Info,
  Search,
  ShieldCheck,
  TriangleAlert,
  User,
} from 'lucide-react'

import { RouteHeader } from '@/components/shell/route-header'
import { Button } from '@/components/ui/button'
import { formatDate, formatNumber } from '@/lib/format'
import {
  activeStudents,
  archivedStudents,
  hasActiveCourse,
  PREVIEW_STUDENTS,
  type PreviewStudent,
} from '@/features/archive-preview/fixtures'

// ---------------------------------------------------------------------------
// STUDENT ARCHIVING — LIVE PREVIEW (design prototype, no data is written).
// Every screen below is fed by in-memory fixtures; no Supabase call, no
// mutation, no financial effect. It shows the Owner how the archiving lifecycle
// would look and behave inside the real app before any code/migration is built.
// ---------------------------------------------------------------------------

type Scenario =
  | 'operational'
  | 'archived-list'
  | 'archived-detail'
  | 'archive-dialog'
  | 'blocked'
  | 'balance'
  | 'reactivate'
  | 'statement'
  | 'voucher'
  | 'regression'

const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: 'operational', label: 'قائمة الطلاب' },
  { id: 'archived-list', label: 'الطلاب المؤرشفون' },
  { id: 'archived-detail', label: 'تفاصيل مؤرشف' },
  { id: 'archive-dialog', label: 'حوار الأرشفة' },
  { id: 'blocked', label: 'منع الأرشفة' },
  { id: 'balance', label: 'رصيد مستحق' },
  { id: 'reactivate', label: 'إعادة التفعيل' },
  { id: 'statement', label: 'كشف بعد الأرشفة' },
  { id: 'voucher', label: 'سند تاريخي' },
  { id: 'regression', label: 'التحقّق المالي' },
]

export function ArchivePreviewWorkspace() {
  const [scenario, setScenario] = useState<Scenario>('operational')

  return (
    <div>
      <RouteHeader eyebrow="معاينة تجريبية" title="نظام أرشفة الطلاب" />

      <div className="mb-5 flex items-start gap-2 rounded-xl border border-gold/30 bg-gold-weak/50 px-4 py-3 text-[12.5px] text-foreground">
        <Info aria-hidden className="mt-0.5 size-4 flex-none text-gold" />
        <p>
          معاينة تصميم فقط ببيانات وهمية — لا تُكتب أي بيانات ولا يتأثر أي سجل مالي. الغرض عرض شكل النظام
          وسلوكه قبل اعتماد أي كود أو Migration.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5 border-y border-border py-3">
        {SCENARIOS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setScenario(item.id)}
            aria-pressed={scenario === item.id}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${scenario === item.id ? 'bg-olive-weak text-olive' : 'text-muted-foreground'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {scenario === 'operational' ? <OperationalList onArchived={() => setScenario('archived-list')} /> : null}
      {scenario === 'archived-list' ? <ArchivedList /> : null}
      {scenario === 'archived-detail' ? <ArchivedDetail /> : null}
      {scenario === 'archive-dialog' ? <ArchiveDialogScenario /> : null}
      {scenario === 'blocked' ? <BlockedScenario /> : null}
      {scenario === 'balance' ? <BalanceScenario /> : null}
      {scenario === 'reactivate' ? <ReactivateScenario /> : null}
      {scenario === 'statement' ? <StatementScenario /> : null}
      {scenario === 'voucher' ? <VoucherScenario /> : null}
      {scenario === 'regression' ? <RegressionScenario /> : null}
    </div>
  )
}

// --- shared bits -----------------------------------------------------------

function ArchivedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-highlight px-2.5 py-0.5 text-[11.5px] font-medium text-muted-foreground">
      <Archive aria-hidden className="size-3" />
      مؤرشف
    </span>
  )
}

function MoneyState({ remaining }: { remaining: number }) {
  return remaining > 0 ? (
    <span className="figure font-semibold text-warn">مستحقّ {formatNumber(remaining)}</span>
  ) : (
    <span className="font-medium text-muted-foreground">مسدَّد بالكامل</span>
  )
}

function Avatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'size-11' : size === 'sm' ? 'size-8' : 'size-9'
  const icon = size === 'lg' ? 'size-5' : 'size-4'
  return (
    <span aria-hidden className={`grid ${cls} flex-none place-items-center rounded-full bg-olive-weak text-olive`}>
      <User className={icon} />
    </span>
  )
}

function PreviewDialog({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-black/30" />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative z-10 w-full max-w-md rounded-2xl border border-border-strong bg-panel p-5 shadow-lg">
        <h2 className="mb-4 text-base font-bold text-foreground">{title}</h2>
        {children}
        <div className="mt-5 flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  )
}

function CourseRow({ name, status, endDate }: { name: string; status: 'active' | 'ended'; endDate: string | null }) {
  const done = status === 'ended'
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-b-0">
      <span className="flex items-center gap-2 text-[13px] text-foreground">
        {done ? <CheckCircle2 aria-hidden className="size-4 text-olive" /> : <TriangleAlert aria-hidden className="size-4 text-warn" />}
        {name}
      </span>
      <span className={`text-[12px] ${done ? 'text-muted-foreground' : 'font-semibold text-warn'}`}>
        {done ? `منتهية · ${endDate ? formatDate(endDate) : '—'}` : 'نشطة'}
      </span>
    </div>
  )
}

function FinancialSummary({ student }: { student: PreviewStudent }) {
  return (
    <div className="flex gap-6 rounded-xl border border-border bg-panel px-4 py-3">
      <div>
        <div className="text-[11px] font-medium text-faint">إجمالي المدفوع</div>
        <div className="figure text-lg font-semibold text-foreground">{formatNumber(student.paid)}</div>
      </div>
      <div>
        <div className="text-[11px] font-medium text-faint">الرصيد المتبقّي</div>
        <div className={`figure text-lg font-semibold ${student.remaining > 0 ? 'text-warn' : 'text-foreground'}`}>{formatNumber(student.remaining)}</div>
      </div>
    </div>
  )
}

// --- 1. operational list (after archiving exists) --------------------------

function OperationalList({ onArchived }: { onArchived: () => void }) {
  const [target, setTarget] = useState<PreviewStudent | null>(null)
  const [justArchived, setJustArchived] = useState<string | null>(null)
  const rows = useMemo(() => activeStudents().filter((s) => s.id !== justArchived), [justArchived])
  const archivedCount = archivedStudents().length + (justArchived ? 1 : 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">دليل الطلاب</h2>
        <div className="flex items-center gap-2">
          <Button variant="quiet" size="sm" onClick={onArchived}>
            <Archive className="size-4" />
            الطلاب المؤرشفون
            <span className="figure ms-1 rounded-full bg-highlight px-1.5 text-[11px] text-muted-foreground">{archivedCount}</span>
          </Button>
          <Button variant="default" size="sm">إضافة طالب</Button>
        </div>
      </div>
      <p className="mt-1 text-[12.5px] text-muted-foreground">القائمة التشغيلية تُظهر الطلاب النشطين فقط؛ المؤرشفون ينتقلون إلى قسم مستقل دون فقدان أي بيان.</p>

      {justArchived ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-olive/30 bg-olive-weak/50 px-4 py-2.5 text-[12.5px] text-olive">
          <CheckCircle2 aria-hidden className="size-4" />
          تمت أرشفة الطالب (معاينة) — انتقل إلى «الطلاب المؤرشفون» لرؤيته. لم تتغيّر أي سجلات مالية.
        </div>
      ) : null}

      <div className="mt-4 border-t border-border-strong">
        {rows.map((s) => (
          <div key={s.id} className="flex items-center gap-3 border-b border-border px-1 py-2.5 last:border-b-0">
            <Avatar />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{s.name}</span>
            <span className="text-[12px]"><MoneyState remaining={s.remaining} /></span>
            <button
              type="button"
              onClick={() => setTarget(s)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1 text-[12px] font-medium text-muted-foreground"
            >
              <Archive className="size-3.5" />
              أرشفة
            </button>
          </div>
        ))}
      </div>

      {target ? (
        <ArchiveDialog
          student={target}
          onClose={() => setTarget(null)}
          onConfirm={() => {
            setJustArchived(target.id)
            setTarget(null)
          }}
        />
      ) : null}
    </div>
  )
}

// --- reusable archive dialog (handles eligible / blocked / balance) --------

function ArchiveDialog({ student, onClose, onConfirm }: { student: PreviewStudent; onClose: () => void; onConfirm: () => void }) {
  const [reason, setReason] = useState('')
  const blocked = hasActiveCourse(student)
  const hasBalance = student.remaining > 0

  return (
    <PreviewDialog
      title={blocked ? 'لا يمكن أرشفة الطالب حاليًا' : 'أرشفة الطالب'}
      onClose={onClose}
      footer={
        <>
          <Button variant="quiet" size="sm" onClick={onClose}>إلغاء</Button>
          {!blocked ? (
            <Button variant="default" size="sm" onClick={onConfirm} disabled={reason.trim().length === 0}>
              <Archive className="size-4" />
              تأكيد الأرشفة
            </Button>
          ) : null}
        </>
      }
    >
      <div className="flex items-center gap-2 text-sm">
        <Avatar size="sm" />
        <span className="font-semibold text-foreground">{student.name}</span>
      </div>

      <div className="mt-3 text-[12px] font-medium text-muted-foreground">الدورات</div>
      <div className="mt-1">
        {student.courses.map((c) => (
          <CourseRow key={c.name} name={c.name} status={c.status} endDate={c.endDate} />
        ))}
      </div>

      {blocked ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-clay/30 bg-clay-weak px-3 py-2.5 text-[12.5px] text-clay">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 flex-none" />
          يجب إنهاء جميع دورات الطالب قبل الأرشفة. لا يظهر زر التأكيد ما دامت هناك دورة نشطة.
        </div>
      ) : (
        <>
          <div className="mt-3 text-[12px] font-medium text-muted-foreground">الحالة المالية</div>
          <div className="mt-1"><FinancialSummary student={student} /></div>

          {hasBalance ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-warn/30 bg-gold-weak/60 px-3 py-2.5 text-[12.5px] text-foreground">
              <TriangleAlert aria-hidden className="mt-0.5 size-4 flex-none text-warn" />
              على الطالب رصيد مستحقّ <span className="figure font-semibold text-warn">{formatNumber(student.remaining)}</span>. يبقى الرصيد
              محفوظًا ومرئيًّا بعد الأرشفة (قرار السياسة في تبويب «رصيد مستحق»).
            </div>
          ) : null}

          <div className="mt-3 flex items-start gap-2 rounded-lg bg-highlight/60 px-3 py-2 text-[12px] text-muted-foreground">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 flex-none text-olive" />
            الأرشفة لن تحذف أي سجل مالي أو سند سابق ولن تغيّر أي مبلغ أو رصيد.
          </div>

          <label className="mt-3 block text-[12px] font-medium text-muted-foreground">
            سبب الأرشفة
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="مثال: أنهت جميع دوراتها"
              className="mt-1 w-full rounded-xl border border-border-strong bg-panel px-3 py-2 text-[13px] text-foreground outline-none focus:border-olive"
            />
          </label>
        </>
      )}
    </PreviewDialog>
  )
}

// --- 2. archived students section ------------------------------------------

function ArchivedList() {
  const [query, setQuery] = useState('')
  const rows = useMemo(() => {
    const term = query.trim()
    const all = archivedStudents()
    return term ? all.filter((s) => s.name.includes(term)) : all
  }, [query])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">الطلاب المؤرشفون</h2>
        <Button variant="quiet" size="sm"><ChevronLeft className="size-4" />العودة إلى الطلاب</Button>
      </div>

      <div className="mt-3 mb-3 flex items-center gap-2 rounded-xl border border-border-strong bg-panel px-3.5 py-2.5 shadow-sm focus-within:border-olive">
        <Search aria-hidden className="size-4 flex-none text-faint" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث في المؤرشفين" aria-label="بحث" className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-faint" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="text-[11px] tracking-wide text-faint">
              <th className="border-b border-border-strong px-3 py-2.5 text-start font-semibold">الطالب</th>
              <th className="border-b border-border-strong px-3 py-2.5 text-start font-semibold">آخر دورة</th>
              <th className="border-b border-border-strong px-3 py-2.5 text-start font-semibold">انتهاء الدورة</th>
              <th className="border-b border-border-strong px-3 py-2.5 text-start font-semibold">تاريخ الأرشفة</th>
              <th className="border-b border-border-strong px-3 py-2.5 text-start font-semibold">الحالة المالية</th>
              <th className="border-b border-border-strong px-3 py-2.5 text-end font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const last = s.courses[s.courses.length - 1]
              return (
                <tr key={s.id}>
                  <td className="border-b border-border px-3 py-2.5">
                    <span className="flex items-center gap-2"><Avatar size="sm" /><span className="text-foreground">{s.name}</span></span>
                  </td>
                  <td className="border-b border-border px-3 py-2.5 text-muted-foreground">{last?.name ?? '—'}</td>
                  <td className="figure border-b border-border px-3 py-2.5 text-muted-foreground">{last?.endDate ? formatDate(last.endDate) : '—'}</td>
                  <td className="figure border-b border-border px-3 py-2.5 text-muted-foreground">{s.archivedAt ? formatDate(s.archivedAt) : '—'}</td>
                  <td className="border-b border-border px-3 py-2.5"><MoneyState remaining={s.remaining} /></td>
                  <td className="border-b border-border px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1.5 text-[12px]">
                      <span className="rounded-full border border-border-strong px-2.5 py-1 text-muted-foreground">فتح</span>
                      <span className="rounded-full border border-border-strong px-2.5 py-1 text-muted-foreground">كشف الحساب</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-olive/30 bg-olive-weak px-2.5 py-1 font-medium text-olive"><ArchiveRestore className="size-3.5" />إعادة تفعيل</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">كل صف يفتح الطالب وكشف حسابه وسنداته التاريخية كما هي، ويتيح إعادة التفعيل — دون إنشاء طالب جديد.</p>
    </div>
  )
}

// --- 3. archived student detail --------------------------------------------

function ArchivedDetail() {
  const student = archivedStudents()[0]
  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
            <ArchivedBadge />
          </div>
          <div className="text-[12.5px] text-muted-foreground">{student.phone ?? 'لا يوجد هاتف'}{student.idNumber ? ` · ${student.idNumber}` : ''}</div>
        </div>
        <div className="ms-auto flex gap-2">
          <Button variant="quiet" size="sm"><FileText className="size-4" />كشف الحساب</Button>
          <Button variant="default" size="sm"><ArchiveRestore className="size-4" />إعادة التفعيل</Button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-highlight/40 px-4 py-2.5 text-[12.5px] text-muted-foreground">
        أُرشِف في <span className="figure text-foreground">{student.archivedAt ? formatDate(student.archivedAt) : '—'}</span>
        {student.archivedBy ? <> · بواسطة <span className="text-foreground">{student.archivedBy}</span></> : null}
        {student.archivedReason ? <> · السبب: {student.archivedReason}</> : null}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border-strong bg-panel p-4">
          <div className="mb-2 text-[12px] font-bold text-muted-foreground">الدورات السابقة</div>
          {student.courses.map((c) => <CourseRow key={c.name} name={c.name} status={c.status} endDate={c.endDate} />)}
        </div>
        <div className="rounded-xl border border-border-strong bg-panel p-4">
          <div className="mb-2 text-[12px] font-bold text-muted-foreground">الحالة المالية</div>
          <div className="flex gap-6">
            <div><div className="text-[11px] text-faint">إجمالي المدفوع</div><div className="figure text-xl font-semibold text-foreground">{formatNumber(student.paid)}</div></div>
            <div><div className="text-[11px] text-faint">الرصيد</div><div className={`figure text-xl font-semibold ${student.remaining > 0 ? 'text-warn' : 'text-foreground'}`}>{formatNumber(student.remaining)}</div></div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border-strong bg-panel p-4">
        <div className="mb-2 text-[12px] font-bold text-muted-foreground">السندات</div>
        <VoucherTable student={student} />
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground"><ShieldCheck className="size-4 text-olive" />الأرشفة إدارية فقط — كل الأرقام أعلاه هي نفسها قبل الأرشفة وبعدها.</p>
    </div>
  )
}

function VoucherTable({ student }: { student: PreviewStudent }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="text-[11px] tracking-wide text-faint">
            <th className="border-b border-border-strong px-3 py-2 text-start font-semibold">رقم السند</th>
            <th className="border-b border-border-strong px-3 py-2 text-start font-semibold">التاريخ</th>
            <th className="border-b border-border-strong px-3 py-2 text-start font-semibold">الدورة</th>
            <th className="border-b border-border-strong px-3 py-2 text-end font-semibold">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          {student.vouchers.map((v) => (
            <tr key={v.ref}>
              <td className="figure border-b border-border px-3 py-2 text-muted-foreground">{v.ref}</td>
              <td className="figure border-b border-border px-3 py-2">{formatDate(v.date)}</td>
              <td className="border-b border-border px-3 py-2 text-muted-foreground">{v.course}</td>
              <td className="figure border-b border-border px-3 py-2 text-end font-semibold text-gold">{formatNumber(v.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// --- 4. archive dialog scenario (eligible) ---------------------------------

function ArchiveDialogScenario() {
  const student = activeStudents().find((s) => !hasActiveCourse(s) && s.remaining === 0) ?? activeStudents()[0]
  const [open, setOpen] = useState(true)
  return (
    <div>
      <p className="mb-4 text-[13px] text-muted-foreground">حوار الأرشفة عند استيفاء الشروط (جميع الدورات منتهية، لا رصيد): يعرض الدورات والحالة المالية وحقل السبب قبل التأكيد.</p>
      <Button variant="quiet" size="sm" onClick={() => setOpen(true)}>عرض الحوار</Button>
      {open ? <ArchiveDialog student={student} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} /> : null}
    </div>
  )
}

// --- 5. blocked (active course) --------------------------------------------

function BlockedScenario() {
  const student = activeStudents().find(hasActiveCourse) ?? activeStudents()[0]
  const [open, setOpen] = useState(true)
  return (
    <div>
      <p className="mb-4 text-[13px] text-muted-foreground">حين تكون لدى الطالب دورة نشطة، لا تُتاح الأرشفة: يظهر الحوار بحالة منع، وزر التأكيد غير موجود.</p>
      <Button variant="quiet" size="sm" onClick={() => setOpen(true)}>عرض حالة المنع</Button>
      {open ? <ArchiveDialog student={student} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} /> : null}
    </div>
  )
}

// --- 6. outstanding balance (policy decision) ------------------------------

function BalanceScenario() {
  const student = PREVIEW_STUDENTS.find((s) => s.remaining > 0 && s.archivedAt === null) ?? PREVIEW_STUDENTS[1]
  const [policy, setPolicy] = useState<'allow' | 'block'>('allow')
  return (
    <div className="max-w-xl">
      <p className="mb-4 text-[13px] text-muted-foreground">
        عند انتهاء الدورات مع بقاء رصيد مستحقّ، هناك سياستان محتملتان. الأرقام لا تتغيّر في الحالتين؛ الاختلاف في السماح فقط.
        اختر لرؤية كلٍّ منهما — القرار لك.
      </p>
      <div className="mb-4 inline-flex rounded-xl border border-border-strong bg-panel p-1">
        <button type="button" onClick={() => setPolicy('allow')} className={`rounded-lg px-3 py-1.5 text-[13px] font-medium ${policy === 'allow' ? 'bg-olive-weak text-olive' : 'text-muted-foreground'}`}>سماح مع تنبيه (موصى به)</button>
        <button type="button" onClick={() => setPolicy('block')} className={`rounded-lg px-3 py-1.5 text-[13px] font-medium ${policy === 'block' ? 'bg-olive-weak text-olive' : 'text-muted-foreground'}`}>منع حتى التسوية</button>
      </div>

      <div className="rounded-2xl border border-border-strong bg-panel p-5">
        <div className="flex items-center gap-2 text-sm"><Avatar size="sm" /><span className="font-semibold text-foreground">{student.name}</span></div>
        <div className="mt-3 text-[12px] font-medium text-muted-foreground">الدورات: <span className="text-foreground">مكتملة</span></div>
        <div className="mt-2"><FinancialSummary student={student} /></div>

        {policy === 'allow' ? (
          <>
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-warn/30 bg-gold-weak/60 px-3 py-2.5 text-[12.5px] text-foreground">
              <TriangleAlert aria-hidden className="mt-0.5 size-4 flex-none text-warn" />
              رصيد مستحقّ <span className="figure font-semibold text-warn">{formatNumber(student.remaining)}</span> — يُسمح بالأرشفة، ويبقى الرصيد ظاهرًا في قائمة المستحقّات وفي كشف الطالب حتى لا يُنسى.
            </div>
            <div className="mt-4 flex justify-end"><Button variant="default" size="sm"><Archive className="size-4" />تأكيد الأرشفة</Button></div>
          </>
        ) : (
          <>
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-clay/30 bg-clay-weak px-3 py-2.5 text-[12.5px] text-clay">
              <Ban aria-hidden className="mt-0.5 size-4 flex-none" />
              رصيد مستحقّ <span className="figure font-semibold">{formatNumber(student.remaining)}</span> — الأرشفة ممنوعة حتى تسوية الرصيد أو إبطاله رسميًّا.
            </div>
            <div className="mt-4 flex justify-end"><Button variant="quiet" size="sm" disabled>تأكيد الأرشفة</Button></div>
          </>
        )}
      </div>
    </div>
  )
}

// --- 7. reactivate ---------------------------------------------------------

function ReactivateScenario() {
  const student = archivedStudents()[0]
  const [open, setOpen] = useState(true)
  const [done, setDone] = useState(false)
  return (
    <div>
      <p className="mb-4 text-[13px] text-muted-foreground">إعادة التفعيل تُرجِع الطالب إلى القائمة التشغيلية دون إنشاء طالب جديد ودون أي تغيير مالي.</p>
      <Button variant="quiet" size="sm" onClick={() => { setOpen(true); setDone(false) }}>عرض الحوار</Button>
      {done ? <div className="mt-4 flex items-center gap-2 rounded-xl border border-olive/30 bg-olive-weak/50 px-4 py-2.5 text-[12.5px] text-olive"><CheckCircle2 className="size-4" />أُعيد تفعيل الطالب (معاينة) — عاد إلى قائمة الطلاب بالسجلات نفسها.</div> : null}
      {open ? (
        <PreviewDialog
          title="إعادة تفعيل الطالب"
          onClose={() => setOpen(false)}
          footer={<><Button variant="quiet" size="sm" onClick={() => setOpen(false)}>إلغاء</Button><Button variant="default" size="sm" onClick={() => { setOpen(false); setDone(true) }}><ArchiveRestore className="size-4" />إعادة التفعيل</Button></>}
        >
          <div className="flex items-center gap-2 text-sm"><Avatar size="sm" /><span className="font-semibold text-foreground">{student.name}</span></div>
          <div className="mt-3 text-[13px] text-muted-foreground">الحالة الحالية: <ArchivedBadge /></div>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-highlight/60 px-3 py-2 text-[12.5px] text-muted-foreground">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 flex-none text-olive" />
            ستعود إلى قائمة الطلاب التشغيلية. لن يُنشأ طالب جديد ولن تتغيّر أي سجلات مالية.
          </div>
        </PreviewDialog>
      ) : null}
    </div>
  )
}

// --- 8. statement after archiving ------------------------------------------

function StatementScenario() {
  const student = archivedStudents()[0]
  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">كشف حساب {student.name}</h2>
        <ArchivedBadge />
      </div>
      <div className="mt-2 flex gap-6 border-y border-border py-3">
        <div><div className="text-[11px] text-faint">المسدَّد</div><div className="figure text-lg font-semibold text-foreground">{formatNumber(student.paid)}</div></div>
        <div><div className="text-[11px] text-faint">الرصيد المستحق</div><div className={`figure text-lg font-semibold ${student.remaining > 0 ? 'text-warn' : 'text-foreground'}`}>{formatNumber(student.remaining)}</div></div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="text-[11px] tracking-wide text-faint">
              <th className="border-b border-border-strong px-3 py-2 text-start font-semibold">التاريخ</th>
              <th className="border-b border-border-strong px-3 py-2 text-start font-semibold">رقم السند</th>
              <th className="border-b border-border-strong px-3 py-2 text-start font-semibold">الدورة</th>
              <th className="border-b border-border-strong px-3 py-2 text-end font-semibold">المقبوض</th>
              <th className="border-b border-border-strong px-3 py-2 text-end font-semibold">الرصيد الجاري</th>
            </tr>
          </thead>
          <tbody>
            {student.statement.map((l) => (
              <tr key={l.ref}>
                <td className="figure border-b border-border px-3 py-2">{formatDate(l.date)}</td>
                <td className="figure border-b border-border px-3 py-2 text-muted-foreground">{l.ref}</td>
                <td className="border-b border-border px-3 py-2 text-muted-foreground">{l.course}</td>
                <td className="figure border-b border-border px-3 py-2 text-end font-semibold text-gold">{formatNumber(l.received)}</td>
                <td className={`figure border-b border-border px-3 py-2 text-end font-bold ${l.running > 0 ? 'text-warn' : 'text-foreground'}`}>{formatNumber(l.running)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">الكشف مطابق تمامًا لكشف الطالب التاريخي — الأرشفة تضيف فقط مؤشّر «مؤرشف».</p>
    </div>
  )
}

// --- 9. historical voucher (unchanged) -------------------------------------

function VoucherScenario() {
  const student = archivedStudents()[0]
  const v = student.vouchers[0]
  return (
    <div className="max-w-md">
      <p className="mb-4 text-[13px] text-muted-foreground">سند قبض سابق لطالب مؤرشف — يظهر بنفس بياناته التاريخية دون أي تغيير.</p>
      <div className="rounded-2xl border border-border-strong bg-panel p-5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold text-muted-foreground">سند قبض</span>
          <span className="figure text-sm font-extrabold text-clay">رقم {v.ref}</span>
        </div>
        <div className="mt-4 space-y-2 text-[14px]">
          <Row label="استلمنا من" value={v.payer} />
          <Row label="عن الدورة" value={v.course} />
          <Row label="التاريخ" value={formatDate(v.date)} />
        </div>
        <div className="mt-4 border-t border-border pt-4 text-end">
          <div className="text-[12px] font-medium text-muted-foreground">المبلغ المقبوض</div>
          <div className="figure text-3xl font-bold text-foreground">{formatNumber(v.amount)} <span className="text-lg font-medium text-faint">₪</span></div>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground"><ShieldCheck className="size-4 text-olive" />رقم السند والمبلغ والتاريخ واسم الطالب التاريخي والدورة — كلّها ثابتة (السند يحمل لقطة الاسم وقت الإصدار).</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}

// --- 10. financial regression preview --------------------------------------

function RegressionScenario() {
  const rows = [
    { metric: 'عدد سندات القبض', before: 8, after: 8 },
    { metric: 'إجمالي المقبوضات', before: 3650, after: 3650 },
    { metric: 'عدد التخصيصات (سطور الكشف)', before: 8, after: 8 },
    { metric: 'إجمالي أرصدة الطلاب المستحقة', before: 350, after: 350 },
    { metric: 'الحركات المالية (financial_movements)', before: 8, after: 8 },
    { metric: 'صافي التدفّق النقدي', before: 3650, after: 3650 },
  ]
  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-[13px] text-muted-foreground">
        آلية التحقّق: نلتقط الإجماليات المالية قبل الأرشفة وبعدها. يجب أن يكون الفرق صفرًا في كل بند — التغيير الوحيد المسموح هو حقل
        الأرشفة الإداري على جدول الطلاب.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border-strong">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="text-[11px] tracking-wide text-faint">
              <th className="border-b border-border-strong px-3 py-2.5 text-start font-semibold">البند المالي</th>
              <th className="border-b border-border-strong px-3 py-2.5 text-end font-semibold">قبل</th>
              <th className="border-b border-border-strong px-3 py-2.5 text-end font-semibold">بعد</th>
              <th className="border-b border-border-strong px-3 py-2.5 text-end font-semibold">الفرق</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.metric}>
                <td className="border-b border-border px-3 py-2.5 text-foreground">{r.metric}</td>
                <td className="figure border-b border-border px-3 py-2.5 text-end text-muted-foreground">{formatNumber(r.before)}</td>
                <td className="figure border-b border-border px-3 py-2.5 text-end text-muted-foreground">{formatNumber(r.after)}</td>
                <td className="figure border-b border-border px-3 py-2.5 text-end font-bold text-olive">0</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="px-3 py-3 font-bold text-foreground" colSpan={3}>Financial Difference</td>
              <td className="figure px-3 py-3 text-end text-lg font-bold text-olive">0</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-olive/30 bg-olive-weak/50 px-4 py-2.5 text-[12.5px] text-olive">
        <ShieldCheck aria-hidden className="size-4" />
        الأرشفة الإدارية لا تغيّر أي حقيقة مالية تاريخية — Financial Difference = 0.
      </div>
    </div>
  )
}
