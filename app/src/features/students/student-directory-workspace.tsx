import { useMemo, useState } from 'react'

import { Archive, ChevronDown, ChevronLeft, Plus, Search, User } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { RouteHeader } from '@/components/shell/route-header'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudents, selectNonArchived, type StudentAggregate } from '@/lib/aggregate'
import { formatDate, formatNumber } from '@/lib/format'
import { normalizeArabic } from '@/lib/text'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

const REMAINING_EPSILON = 0.0001

type StudentStatus = 'ok' | 'due' | 'none'

function statusOf(item: StudentAggregate): StudentStatus {
  if (item.remaining <= REMAINING_EPSILON) return 'ok'
  if (item.paid <= REMAINING_EPSILON) return 'none'
  return 'due'
}

export function StudentDirectoryWorkspace() {
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const feeObligations = useWorkspaceStore((state) => state.feeObligations)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)
  const selectStudent = useShellStore((state) => state.selectStudent)
  const navigateStudents = useShellStore((state) => state.navigateStudents)
  const openAddStudent = useShellStore((state) => state.openAddStudent)
  const openArchive = useShellStore((state) => state.openArchive)

  const [query, setQuery] = useState('')
  const [previewId, setPreviewId] = useState<string | null>(null)

  // The active roster excludes archived students (they live in the archive view).
  const roster = useMemo(() => selectNonArchived(students), [students])
  const aggregates = useMemo(() => aggregateStudents(roster, statementLines, enrollments, feeObligations), [roster, statementLines, enrollments, feeObligations])
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
      <RouteHeader
        eyebrow="الطلاب"
        title="دليل الطلاب"
        actions={
          <>
            <div className="flex w-64 max-w-full items-center gap-2 rounded-xl border border-border-strong bg-panel px-3 py-2 shadow-sm focus-within:border-olive">
              <Search aria-hidden className="size-4 flex-none text-faint" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="البحث عن طالب" placeholder="بالاسم أو الهاتف أو الرقم التعريفي" className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-faint" />
            </div>
            <Button variant="default" onClick={openAddStudent}>
              <Plus className="size-4" />
              إضافة طالب
            </Button>
          </>
        }
      />
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => navigateStudents('directory')} aria-current="page" className="rounded-full bg-olive-weak px-3.5 py-1.5 text-sm font-medium text-olive">دليل الطلاب</button>
        <button type="button" onClick={() => navigateStudents('statement')} className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground">كشف الحساب</button>
        <button type="button" onClick={() => navigateStudents('archived')} className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground">المؤرشفون</button>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border-t border-border-strong">
          {!loaded ? (
            <div className="p-3"><SkeletonRows rows={8} /></div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => <DirectoryRow key={item.student.id} item={item} selected={item.student.id === previewId} onSelect={() => setPreviewId(item.student.id)} />)
          ) : roster.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-faint">لا يوجد طلاب بعد.</p>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-faint">لا نتائج مطابقة.</p>
          )}
        </div>

        <StudentPreviewPanel
          item={preview}
          onOpenStatement={() => {
            if (!preview) return
            selectStudent(preview.student.id)
            navigateStudents('statement')
          }}
          onArchive={() => {
            if (!preview) return
            openArchive(preview.student.id)
          }}
        />
      </div>
    </div>
  )
}

function DirectoryRow({ item, selected, onSelect }: { item: StudentAggregate; selected: boolean; onSelect: () => void }) {
  const status = statusOf(item)
  const statusLabel = status === 'ok' ? 'مسدَّد بالكامل' : status === 'due' ? 'رصيد مستحق' : 'غير مسدَّد'
  return (
    <div className={`border-b border-border last:border-b-0 ${selected ? 'bg-highlight' : ''}`}>
      <button type="button" onClick={onSelect} aria-pressed={selected} className="flex w-full items-center gap-3 px-4 py-2.5 text-start">
        <span aria-hidden className="grid size-9 flex-none place-items-center rounded-full bg-olive-weak text-olive"><User className="size-4" /></span>
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.student.name}</span>
        <span className="text-xs font-medium text-muted-foreground">{statusLabel}</span>
        <Money value={item.remaining} currency={false} className={item.remaining > REMAINING_EPSILON ? 'text-sm font-bold text-warn' : 'text-sm font-bold text-foreground'} />
      </button>
      <details className="group px-4 pb-2 ps-[3.25rem]">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-[11px] font-medium text-olive">
          <ChevronDown aria-hidden className="size-3 transition-transform group-open:-rotate-180" />
          التفاصيل
        </summary>
        <div className="mt-1 text-xs text-faint">
          {item.student.phone ? item.student.phone : 'لا يوجد رقم هاتف'}
          {item.student.idNumber ? ` · ${item.student.idNumber}` : ''}
          {` · ${formatNumber(item.courses)} دورة`}
        </div>
      </details>
    </div>
  )
}

function StudentPreviewPanel({ item, onOpenStatement, onArchive }: { item: StudentAggregate | null; onOpenStatement: () => void; onArchive: () => void }) {
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
      <div className="mt-4 flex gap-6 border-t border-border pt-4">
        <div><div className="text-[11px] font-medium text-faint">المسدَّد</div><Money value={item.paid} currency={false} className="text-lg font-semibold text-foreground" /></div>
        <div><div className="text-[11px] font-medium text-faint">الرصيد المستحق</div><Money value={item.remaining} currency={false} className={`text-lg font-semibold ${item.remaining > REMAINING_EPSILON ? 'text-warn' : 'text-foreground'}`} /></div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="quiet" size="sm" onClick={onOpenStatement}><ChevronLeft className="size-4" />فتح الكشف الكامل</Button>
        {item.student.status === 'active' ? <Button variant="quiet" size="sm" onClick={onArchive}><Archive className="size-4" />أرشفة</Button> : null}
      </div>
    </div>
  )
}
