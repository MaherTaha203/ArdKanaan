import { useMemo, useState } from 'react'

import { Search } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { RouteHeader } from '@/components/shell/route-header'
import { Card } from '@/components/ui/card'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudents, type StudentAggregate } from '@/lib/aggregate'
import { formatNumber } from '@/lib/format'
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
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)
  const selectStudent = useShellStore((state) => state.selectStudent)
  const navigateStudents = useShellStore((state) => state.navigateStudents)

  const [query, setQuery] = useState('')

  const aggregates = useMemo(() => aggregateStudents(students, statementLines), [students, statementLines])
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

  return (
    <div>
      <RouteHeader eyebrow="الطلاب" title="دليل الطلاب" />
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

      <div className="max-w-[1080px]">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => navigateStudents('directory')} aria-current="page" className="rounded-full bg-olive-weak px-3.5 py-1.5 text-sm font-medium text-olive">دليل الطلاب</button>
          <button type="button" onClick={() => navigateStudents('statement')} className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground">كشف الحساب</button>
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-xl border border-border-strong bg-panel px-3.5 py-2.5 shadow-sm focus-within:border-olive focus-within:ring-2 focus-within:ring-olive/20">
          <Search aria-hidden className="size-4 flex-none text-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="البحث عن طالب"
            placeholder="بالاسم أو الهاتف أو الرقم التعريفي"
            className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-faint"
          />
        </div>

        <Card className="overflow-hidden">
          {!loaded ? (
            <div className="p-3"><SkeletonRows rows={8} /></div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => <DirectoryRow key={item.student.id} item={item} onSelect={() => { selectStudent(item.student.id); navigateStudents('statement') }} />)
          ) : (
            <p className="px-4 py-10 text-center text-sm text-faint">لا نتائج مطابقة.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

function DirectoryRow({ item, onSelect }: { item: StudentAggregate; onSelect: () => void }) {
  const status = statusOf(item)
  const statusLabel = status === 'ok' ? 'مسدَّد بالكامل' : status === 'due' ? 'رصيد مستحق' : 'غير مسدَّد'
  return (
    <button type="button" onClick={onSelect} className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-start last:border-b-0">
      <span className="grid size-9 flex-none place-items-center rounded-full bg-olive-weak text-sm font-bold text-olive">{item.student.name.charAt(0)}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-foreground">{item.student.name}</span>
        <span className="block text-xs text-faint">
          {item.student.phone ? item.student.phone : 'لا يوجد رقم هاتف'}
          {item.student.idNumber ? ` · ${item.student.idNumber}` : ''}
          {` · ${formatNumber(item.courses)} دورة`}
        </span>
      </span>
      <span className="text-xs font-medium text-muted-foreground">{statusLabel}</span>
      <Money value={item.remaining} currency={false} className={item.remaining > REMAINING_EPSILON ? 'text-sm font-semibold text-warn' : 'text-sm font-semibold text-foreground'} />
    </button>
  )
}
