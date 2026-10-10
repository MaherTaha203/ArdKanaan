import { useMemo, useState } from 'react'

import { Archive, ChevronLeft, ReceiptText, Search, User, UserPlus } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudentsFromSummaries, selectNonArchived, type StudentAggregate } from '@/lib/aggregate'
import { formatDate, formatNumber } from '@/lib/format'
import { toWesternDigits } from '@/lib/numbers'
import { normalizeArabic } from '@/lib/text'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

const REMAINING_EPSILON = 0.0001

type StudentStatus = 'ok' | 'due' | 'none' | 'no-obligations'

function hasStudentObligations(studentId: string, enrollments: { studentId: string }[], feeObligations: { studentId: string; cancelledAt: string | null }[]): boolean {
  return enrollments.some((item) => item.studentId === studentId) || feeObligations.some((item) => item.studentId === studentId && !item.cancelledAt)
}

function statusOf(item: StudentAggregate, hasObligations: boolean): StudentStatus {
  if (!hasObligations) return 'no-obligations'
  if (item.remaining <= REMAINING_EPSILON) return 'ok'
  if (item.paid <= REMAINING_EPSILON) return 'none'
  return 'due'
}

export function StudentDirectoryWorkspace() {
  const students = useWorkspaceStore((state) => state.students)
  const studentSummaries = useWorkspaceStore((state) => state.studentSummaries)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const feeObligations = useWorkspaceStore((state) => state.feeObligations)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)
  const selectStudent = useShellStore((state) => state.selectStudent)
  const openAddStudent = useShellStore((state) => state.openAddStudent)
  const openArchive = useShellStore((state) => state.openArchive)
  const openReceiveFor = useShellStore((state) => state.openReceiveFor)

  const [query, setQuery] = useState('')
  const [previewId, setPreviewId] = useState<string | null>(null)

  // The active roster excludes archived students (they live in the archive view).
  const roster = useMemo(() => selectNonArchived(students), [students])
  const aggregates = useMemo(() => aggregateStudentsFromSummaries(roster, studentSummaries), [roster, studentSummaries])
  const sorted = useMemo(
    () => aggregates.slice().sort((a, b) => b.remaining - a.remaining || a.student.name.localeCompare(b.student.name, 'ar')),
    [aggregates],
  )
  const filtered = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return sorted
    const term = normalizeArabic(trimmed)
    const digits = trimmed.replace(/\D/g, '')
    return sorted.filter((item) => {
      if (normalizeArabic(item.student.name).includes(term)) return true
      if (digits.length === 0) return false
      const phoneHit = item.student.phone ? item.student.phone.replace(/\D/g, '').includes(digits) : false
      const idHit = item.student.idNumber ? item.student.idNumber.replace(/\D/g, '').includes(digits) : false
      return phoneHit || idHit
    })
  }, [sorted, query])

  const preview = useMemo(
    () => (previewId ? filtered.find((item) => item.student.id === previewId) ?? null : null),
    [filtered, previewId],
  )

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="editorial text-[clamp(1.2rem,1.9vw,1.45rem)] text-foreground">دليل الطلاب</h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex w-60 max-w-full items-center gap-2 rounded-lg border border-border-strong bg-panel px-3 py-2 focus-within:border-olive">
            <Search aria-hidden className="size-4 flex-none text-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(toWesternDigits(event.currentTarget.value))
              }}
              aria-label="البحث عن طالب"
              placeholder="بالاسم أو الهاتف أو الرقم التعريفي"
              className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-faint"
            />
          </label>
          <Button variant="default" onClick={openAddStudent}>
            <UserPlus className="size-4" />
            إضافة طالب
          </Button>
        </div>
      </header>
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 border-t border-border-strong">
          {/* Aligned column header (md+). Each row uses the same responsive grid
              template, so columns line up across the list without an expandable
              details row that would grow each row's height. */}
          {loaded && filtered.length > 0 ? (
            <div className="hidden items-center gap-x-3 border-b border-border px-4 py-2 text-[11px] font-semibold text-faint md:grid md:grid-cols-[auto_minmax(0,1fr)_8rem_auto_auto] lg:grid-cols-[auto_minmax(0,1fr)_8rem_6rem_7rem_auto]">
              <span aria-hidden className="size-9" />
              <span>الطالب</span>
              <span>الهاتف</span>
              <span className="hidden lg:block">الرقم التعريفي</span>
              <span>الحالة</span>
              <span className="justify-self-end">الرصيد المستحق</span>
            </div>
          ) : null}
          {!loaded ? (
            <div className="p-3"><SkeletonRows rows={8} /></div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => <DirectoryRow key={item.student.id} item={item} selected={item.student.id === previewId} hasObligations={hasStudentObligations(item.student.id, enrollments, feeObligations)} onSelect={() => setPreviewId(item.student.id)} />)
          ) : roster.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-faint">لا يوجد طلاب بعد.</p>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-faint">لا نتائج مطابقة.</p>
          )}
        </div>

        <StudentPreviewPanel
          item={preview}
          hasObligations={preview ? hasStudentObligations(preview.student.id, enrollments, feeObligations) : false}
          onOpenStatement={() => {
            if (!preview) return
            selectStudent(preview.student.id)
          }}
          onArchive={() => {
            if (!preview) return
            openArchive(preview.student.id)
          }}
          onReceipt={() => {
            if (!preview) return
            openReceiveFor(preview.student.name)
          }}
        />
      </div>
    </div>
  )
}

function DirectoryRow({ item, selected, onSelect, hasObligations }: { item: StudentAggregate; selected: boolean; onSelect: () => void; hasObligations: boolean }) {
  const status = statusOf(item, hasObligations)
  const statusLabel = status === 'no-obligations' ? 'لا توجد التزامات' : status === 'ok' ? 'مسدَّد بالكامل' : status === 'due' ? 'رصيد مستحق' : 'غير مسدَّد'
  return (
    <div className={`border-b border-border last:border-b-0 ${selected ? 'bg-highlight' : ''}`}>
      {/* Single aligned row: name stays clear in its own flexible column and
          truncates rather than sprawling; phone/id reveal as aligned columns on
          wider screens (md/lg) instead of an expander that adds row height. */}
      <button type="button" onClick={onSelect} aria-pressed={selected} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-3 px-4 py-2.5 text-start md:grid-cols-[auto_minmax(0,1fr)_8rem_auto_auto] lg:grid-cols-[auto_minmax(0,1fr)_8rem_6rem_7rem_auto]">
        <span aria-hidden className="grid size-9 flex-none place-items-center rounded-full bg-olive-weak text-olive"><User className="size-4" /></span>
        <span className="min-w-0 truncate text-sm text-foreground" title={item.student.name}>{item.student.name}</span>
        <span className="figure hidden truncate text-xs text-muted-foreground md:block" dir="ltr">{item.student.phone || '—'}</span>
        <span className="figure hidden truncate text-xs text-muted-foreground lg:block" dir="ltr">{item.student.idNumber || '—'}</span>
        <span className="truncate text-xs font-medium text-muted-foreground">{statusLabel}</span>
        <Money value={item.remaining} currency={false} className={`justify-self-end text-sm font-bold ${item.remaining > REMAINING_EPSILON ? 'text-warn' : 'text-foreground'}`} />
      </button>
    </div>
  )
}

function StudentPreviewPanel({ item, hasObligations, onOpenStatement, onArchive, onReceipt }: { item: StudentAggregate | null; hasObligations: boolean; onOpenStatement: () => void; onArchive: () => void; onReceipt: () => void }) {
  if (!item) {
    return <div className="hidden rounded-xl border border-dashed border-border-strong p-5 text-center text-sm text-faint md:block">اختر طالبًا من القائمة لعرض ملخّص حسابه هنا.</div>
  }

  return (
    <div className="rounded-xl border border-border-strong bg-panel p-4">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-11 flex-none place-items-center rounded-full bg-olive-weak text-olive"><User className="size-5" /></span>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-foreground">{item.student.name}</div>
          <div className="text-[12px] text-muted-foreground">{item.student.phone ? item.student.phone : 'لا يوجد رقم هاتف'}{item.student.idNumber ? ` · ${item.student.idNumber}` : ''}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-faint">{formatNumber(item.courses)} دورة · آخر حركة {item.lastActivity ? formatDate(item.lastActivity) : '—'}</div>
      {!hasObligations ? <p className="mt-3 rounded-lg border border-border-strong bg-highlight px-3 py-2 text-xs text-muted-foreground">لا توجد التزامات مالية مسجلة؛ لم يُصنّف الطالب على أنه مسدَّد بالكامل.</p> : null}
      <div className="mt-4 flex gap-6 border-t border-border pt-4">
        <div><div className="text-[11px] font-medium text-faint">المسدَّد</div><Money value={item.paid} currency={false} className="text-lg font-semibold text-foreground" /></div>
        <div><div className="text-[11px] font-medium text-faint">الرصيد المستحق</div><Money value={item.remaining} currency={false} className={`text-lg font-semibold ${item.remaining > REMAINING_EPSILON ? 'text-warn' : 'text-foreground'}`} /></div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="default" size="sm" onClick={onReceipt}><ReceiptText className="size-4" />سند قبض</Button>
        <Button variant="quiet" size="sm" onClick={onOpenStatement}><ChevronLeft className="size-4" />فتح الكشف الكامل</Button>
        {item.student.status === 'active' ? <Button variant="quiet" size="sm" onClick={onArchive}><Archive className="size-4" />أرشفة</Button> : null}
      </div>
    </div>
  )
}
