import { useMemo, useState } from 'react'

import { ArrowDownLeft, Search } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { RouteHeader } from '@/components/shell/route-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudents, statementFor, type StudentAggregate } from '@/lib/aggregate'
import { formatDate, formatNumber } from '@/lib/format'
import { normalizeArabic } from '@/lib/text'

// Below this residual, a course row is treated as fully paid (guards float noise).
const REMAINING_EPSILON = 0.0001
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

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

  const aggregates = useMemo(
    () => aggregateStudents(students, statementLines),
    [students, statementLines],
  )

  const filtered = useMemo(() => {
    const term = normalizeArabic(query)
    if (!term) return aggregates
    return aggregates.filter((item) => normalizeArabic(item.student.name).includes(term))
  }, [aggregates, query])

  const activeId = selectedStudentId ?? aggregates[0]?.student.id ?? null
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
      <RouteHeader
        eyebrow="الطلاب"
        title="سجلّات الطلاب"
        description="الطالب سجلٌّ كامل: هويّته، بيانه المالي المشتق، وحركته. اختر طالبًا من الفهرس."
      />

      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} />

      <div className="grid gap-6 md:grid-cols-[300px_minmax(0,1fr)]">
        <div>
          <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-2">
            <Search aria-hidden className="size-4 flex-none text-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="ابحث عن طالب"
              placeholder="ابحث عن طالب…"
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
              <div className="mb-6 flex flex-wrap items-center gap-4 border-b-2 border-foreground/85 pb-5">
                <span className="editorial grid size-14 flex-none place-items-center rounded-full bg-olive text-2xl text-[#f7f4ea]">
                  {active.student.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <h2 className="editorial text-2xl text-foreground">{active.student.name}</h2>
                  <div className="text-[12.5px] text-muted-foreground">
                    {formatNumber(active.courses)} دورة · آخر حركة{' '}
                    {active.lastActivity ? formatDate(active.lastActivity) : '—'}
                  </div>
                </div>
                <div className="ms-auto flex gap-8">
                  <RecordFigure label="المدفوع" value={active.paid} tone="ink" />
                  <RecordFigure label="المتبقّي" value={active.remaining} tone="clay" />
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  البيان المالي — مشتق من السندات
                </h3>
                <Button variant="quiet" size="sm" onClick={() => openReceiveFor(active.student.name)}>
                  <ArrowDownLeft className="size-4" />
                  استلام مبلغ
                </Button>
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
                            سند قبض رقم {formatNumber(line.voucherNumber)}
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
                          لا توجد حركة لعرضها لهذا الطالب.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-sm text-faint">
              {loaded ? 'لا يوجد طلاب بعد — سجّل سند قبض لإنشاء أول طالب.' : 'جاري التحميل...'}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function StudentRow({
  item,
  active,
  onSelect,
}: {
  item: StudentAggregate
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-start last:border-b-0 transition ${
        active ? 'bg-highlight shadow-[inset_3px_0_0_var(--olive)]' : 'hover:bg-highlight'
      }`}
    >
      <span className="grid size-8 flex-none place-items-center rounded-full bg-olive-weak text-[13px] font-bold text-olive">
        {item.student.name.charAt(0)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.student.name}</span>
      {item.remaining > REMAINING_EPSILON ? (
        <Money value={item.remaining} currency={false} className="text-xs text-clay" />
      ) : null}
    </button>
  )
}

function RecordFigure({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'ink' | 'clay'
}) {
  return (
    <div>
      <div className="text-[11px] text-faint">{label}</div>
      <Money
        value={value}
        currency={false}
        className={`text-xl ${tone === 'clay' && value > 0 ? 'text-clay' : 'text-foreground'}`}
      />
    </div>
  )
}
