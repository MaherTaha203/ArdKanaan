import { useMemo, useState } from 'react'

import { ChevronLeft, RotateCcw, Search, User } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { StudentTabs } from '@/features/students/student-tabs'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudents, selectArchived, type StudentAggregate } from '@/lib/aggregate'
import { formatDate } from '@/lib/format'
import { normalizeArabic } from '@/lib/text'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

const REMAINING_EPSILON = 0.0001

export function ArchivedStudentsWorkspace() {
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
  const openArchive = useShellStore((state) => state.openArchive)

  const [query, setQuery] = useState('')

  const archived = useMemo(() => selectArchived(students), [students])
  const aggregates = useMemo(
    () => aggregateStudents(archived, statementLines, enrollments, feeObligations),
    [archived, statementLines, enrollments, feeObligations],
  )
  const sorted = useMemo(
    () => aggregates.slice().sort((a, b) => {
      const at = a.student.archivedAt ?? ''
      const bt = b.student.archivedAt ?? ''
      if (at !== bt) return bt.localeCompare(at)
      return a.student.name.localeCompare(b.student.name, 'ar')
    }),
    [aggregates],
  )
  const filtered = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return sorted
    const term = normalizeArabic(trimmed)
    return sorted.filter((item) => normalizeArabic(item.student.name).includes(term))
  }, [sorted, query])

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="editorial text-[clamp(1.2rem,1.9vw,1.45rem)] text-foreground">الطلاب المؤرشفون</h1>
          <StudentTabs active="archived" onPick={navigateStudents} />
        </div>
        <label className="flex w-60 max-w-full items-center gap-2 rounded-lg border border-border-strong bg-panel px-3 py-2 focus-within:border-olive">
          <Search aria-hidden className="size-4 flex-none text-faint" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="البحث في الطلاب المؤرشفين" placeholder="بحث بالاسم" className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-faint" />
        </label>
      </header>
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

      <div className="border-t border-border-strong">
        {!loaded ? (
          <div className="p-3"><SkeletonRows rows={6} /></div>
        ) : filtered.length > 0 ? (
          filtered.map((item) => (
            <ArchivedRow
              key={item.student.id}
              item={item}
              onOpenStatement={() => { selectStudent(item.student.id); navigateStudents('statement') }}
              onReactivate={() => openArchive(item.student.id)}
            />
          ))
        ) : archived.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-faint">لا يوجد طلاب مؤرشفون.</p>
        ) : (
          <p className="px-4 py-12 text-center text-sm text-faint">لا نتائج مطابقة.</p>
        )}
      </div>
    </div>
  )
}

function ArchivedRow({ item, onOpenStatement, onReactivate }: { item: StudentAggregate; onOpenStatement: () => void; onReactivate: () => void }) {
  const { student } = item
  const hasOutstanding = item.remaining > REMAINING_EPSILON
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span aria-hidden className="grid size-9 flex-none place-items-center rounded-full bg-highlight text-muted-foreground"><User className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{student.name}</div>
        <div className="mt-0.5 text-[11.5px] text-faint">
          أُرشف {student.archivedAt ? formatDate(student.archivedAt) : '—'}
          {student.archiveReason ? ` · ${student.archiveReason}` : ''}
        </div>
      </div>
      {hasOutstanding ? (
        <span className="flex flex-col items-end">
          <span className="text-[10px] font-medium text-faint">رصيد مستحق</span>
          <Money value={item.remaining} currency={false} className="text-sm font-bold text-warn" />
        </span>
      ) : null}
      <div className="flex items-center gap-1.5">
        <Button variant="quiet" size="sm" onClick={onOpenStatement}><ChevronLeft className="size-4" />الكشف</Button>
        <Button variant="quiet" size="sm" onClick={onReactivate}><RotateCcw className="size-4" />إعادة التفعيل</Button>
      </div>
    </div>
  )
}
