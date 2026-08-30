import { useMemo, useState } from 'react'

import { ArrowDownLeft, Printer, Search } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { RouteHeader } from '@/components/shell/route-header'
import { StudentStatementPrint } from '@/features/print/student-statement-print'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudents, statementFor, type StudentAggregate } from '@/lib/aggregate'
import { formatDate, formatNumber } from '@/lib/format'
import { formatVoucherNo } from '@/lib/voucher'
import { normalizeArabic } from '@/lib/text'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// Below this residual, a course row is treated as fully paid (guards float noise).
const REMAINING_EPSILON = 0.0001

type StudentStatus = 'ok' | 'due' | 'none'

// Derived, from voucher-sourced figures only. "Due" = still owes; "none" = nothing
// paid yet; "ok" = settled. There is no due-date in the data model, so no "late"
// state is invented here.
function statusOf(item: StudentAggregate): StudentStatus {
  if (item.remaining <= REMAINING_EPSILON) return 'ok'
  if (item.paid <= REMAINING_EPSILON) return 'none'
  return 'due'
}

const STATUS_BAR: Record<StudentStatus, string> = {
  ok: 'bg-gold', // settled — emerald
  due: 'bg-warn', // still owes — amber
  none: 'bg-border-strong', // nothing paid yet — neutral
}

export function StudentsWorkspace() {
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)

  const selectedStudentId = useShellStore((state) => state.selectedStudentId)
  const selectStudent = useShellStore((state) => state.selectStudent)
  const openReceiveFor = useShellStore((state) => state.openReceiveFor)

  const [query, setQuery] = useState('')
  const [printing, setPrinting] = useState(false)

  const aggregates = useMemo(
    () => aggregateStudents(students, statementLines),
    [students, statementLines],
  )

  // Smart order: the most urgent (largest remaining) first, then by name. This is a
  // presentation ordering only — it never changes any figure.
  const sorted = useMemo(
    () =>
      aggregates
        .slice()
        .sort(
          (a, b) => b.remaining - a.remaining || a.student.name.localeCompare(b.student.name, 'ar'),
        ),
    [aggregates],
  )

  const filtered = useMemo(() => {
    const term = normalizeArabic(query)
    if (!term) return sorted
    return sorted.filter((item) => normalizeArabic(item.student.name).includes(term))
  }, [sorted, query])

  const activeId = selectedStudentId ?? sorted[0]?.student.id ?? null
  const active = useMemo(
    () => aggregates.find((item) => item.student.id === activeId) ?? null,
    [aggregates, activeId],
  )
  const activeLines = useMemo(
    () => (activeId ? statementFor(statementLines, activeId) : []),
    [statementLines, activeId],
  )

  return (
    <div>
      <RouteHeader eyebrow="الطلاب" title="سجلّات الطلاب" />

      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} />

      <div className="grid gap-6 md:grid-cols-[300px_minmax(0,1fr)]">
        <div>
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-border-strong bg-panel px-3.5 py-2.5 shadow-sm transition focus-within:border-olive focus-within:ring-2 focus-within:ring-olive/20">
            <Search aria-hidden className="size-4 flex-none text-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && filtered[0]) selectStudent(filtered[0].student.id)
              }}
              aria-label="ابحث عن طالب"
              placeholder="ابحث عن طالب… (Enter لفتح الأول)"
              className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-faint"
            />
          </div>

          <Card className="overflow-hidden">
            {!loaded ? (
              <div className="p-3">
                <SkeletonRows rows={6} />
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <StudentRow
                  key={item.student.id}
                  item={item}
                  active={item.student.id === activeId}
                  onSelect={() => selectStudent(item.student.id)}
                  onQuickReceive={() => openReceiveFor(item.student.name)}
                />
              ))
            ) : (
              <p className="px-4 py-8 text-center text-sm text-faint">لا نتائج مطابقة.</p>
            )}
          </Card>
        </div>

        <Card className="p-6">
          {active ? (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-border pb-6">
                <span className="editorial grid size-14 flex-none place-items-center rounded-full bg-olive text-2xl text-white">
                  {active.student.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <h2 className="editorial text-2xl text-foreground">{active.student.name}</h2>
                  <div className="text-[13px] text-muted-foreground">
                    {formatNumber(active.courses)} دورة · آخر حركة{' '}
                    {active.lastActivity ? formatDate(active.lastActivity) : '—'}
                  </div>
                </div>
                <div className="ms-auto flex gap-8">
                  <RecordFigure label="المدفوع" value={active.paid} tone="ink" />
                  <RecordFigure label="المتبقّي" value={active.remaining} tone="warn" />
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">
                  البيان المالي — مشتق من السندات
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant="quiet" size="sm" onClick={() => setPrinting(true)}>
                    <Printer className="size-4" />
                    طباعة البيان
                  </Button>
                  <Button variant="quiet" size="sm" onClick={() => openReceiveFor(active.student.name)}>
                    <ArrowDownLeft className="size-4" />
                    استلام مبلغ
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-[11px] tracking-wide text-faint">
                      <th className="border-b border-border-strong px-2 py-2.5 text-start font-semibold">
                        التاريخ
                      </th>
                      <th className="border-b border-border-strong px-2 py-2.5 text-start font-semibold">
                        الوصف
                      </th>
                      <th className="border-b border-border-strong px-2 py-2.5 text-start font-semibold">
                        الدورة
                      </th>
                      <th className="border-b border-border-strong px-2 py-2.5 text-end font-semibold">
                        قيمة الدورة
                      </th>
                      <th className="border-b border-border-strong px-2 py-2.5 text-end font-semibold">
                        المدفوع
                      </th>
                      <th className="border-b border-border-strong px-2 py-2.5 text-end font-semibold">
                        المتبقّي
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLines.length > 0 ? (
                      activeLines.map((line) => (
                        <tr key={line.id}>
                          <td className="border-b border-border px-2 py-3">
                            {formatDate(line.voucherDate)}
                          </td>
                          <td className="border-b border-border px-2 py-3">
                            سند قبض — رقم {formatVoucherNo(line.voucherNumber)}
                          </td>
                          <td className="border-b border-border px-2 py-3 text-muted-foreground">
                            {line.courseName}
                          </td>
                          <td className="figure border-b border-border px-2 py-3 text-end">
                            {formatNumber(line.courseValue)}
                          </td>
                          <td className="figure border-b border-border px-2 py-3 text-end">
                            {formatNumber(line.amountReceived)}
                          </td>
                          <td className="figure border-b border-border px-2 py-3 text-end">
                            {formatNumber(line.remainingBalance)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-2 py-10 text-center text-sm text-faint">
                          لا توجد حركة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-sm text-faint">
              {loaded ? 'لا يوجد طلاب.' : 'جاري التحميل…'}
            </div>
          )}
        </Card>
      </div>

      {printing && active ? (
        <StudentStatementPrint
          studentName={active.student.name}
          paid={active.paid}
          remaining={active.remaining}
          courses={active.courses}
          lines={activeLines}
          onClose={() => setPrinting(false)}
        />
      ) : null}
    </div>
  )
}

function StudentRow({
  item,
  active,
  onSelect,
  onQuickReceive,
}: {
  item: StudentAggregate
  active: boolean
  onSelect: () => void
  onQuickReceive: () => void
}) {
  const status = statusOf(item)
  return (
    <div
      className={`relative flex items-center gap-2 border-b border-border last:border-b-0 transition ${
        active ? 'bg-highlight' : 'hover:bg-highlight'
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-2 start-0 w-[3px] rounded-e ${active ? 'bg-olive' : STATUS_BAR[status]}`}
      />
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? 'true' : undefined}
        className="flex min-w-0 flex-1 items-center gap-3 py-3 pe-1 ps-4 text-start"
      >
        <span className="grid size-8 flex-none place-items-center rounded-full bg-olive-weak text-[13px] font-bold text-olive">
          {item.student.name.charAt(0)}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.student.name}</span>
        {item.remaining > REMAINING_EPSILON ? (
          <Money value={item.remaining} currency={false} className="text-xs font-semibold text-warn" />
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden />
            مكتمل
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onQuickReceive}
        aria-label={`سند قبض لـ ${item.student.name}`}
        title="سند قبض"
        className="me-2 flex flex-none items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-gold transition hover:bg-gold-weak"
      >
        <ArrowDownLeft className="size-3.5" />
        قبض
      </button>
    </div>
  )
}

function RecordFigure({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'ink' | 'warn'
}) {
  return (
    <div>
      <div className="text-[11px] font-medium text-faint">{label}</div>
      <Money
        value={value}
        currency={false}
        className={`text-xl font-semibold ${tone === 'warn' && value > 0 ? 'text-warn' : 'text-foreground'}`}
      />
    </div>
  )
}
