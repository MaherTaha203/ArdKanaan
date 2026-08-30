import { useMemo, useState } from 'react'

import { Printer, RotateCw } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { PositionPanel } from '@/components/shell/position-panel'
import { RouteHeader } from '@/components/shell/route-header'
import { FinancialReportPrint } from '@/features/print/financial-report-print'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import {
  financialTotals,
  movementsNewestFirst,
  paymentCount,
  receiptCount,
} from '@/lib/aggregate'
import { formatDate, formatNumber } from '@/lib/format'
import { formatVoucherNo } from '@/lib/voucher'
import type { FinancialMovement } from '@/types/domain'
import { useWorkspaceStore } from '@/store/use-workspace-store'

function partyAndContext(movement: FinancialMovement) {
  const party = movement.movementType === 'receipt' ? movement.partyName ?? '—' : 'المركز'
  return movement.context ? `${party} · ${movement.context}` : party
}

type Period = 'all' | 'month' | 'week'

const PERIODS: { id: Period; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'month', label: 'هذا الشهر' },
  { id: 'week', label: 'هذا الأسبوع' },
]

// Presentation-only: the inclusive ISO (YYYY-MM-DD) start of the selected period,
// or null for "all". Never a source of truth — it only narrows the derived
// movements before they are summed for display.
function periodStartIso(period: Period, today = new Date()): string | null {
  if (period === 'all') return null
  const year = today.getFullYear()
  const month = today.getMonth()
  if (period === 'month') {
    return `${year}-${String(month + 1).padStart(2, '0')}-01`
  }
  // Current calendar week, starting Saturday (Arabic locale convention).
  const daysSinceSaturday = (today.getDay() + 1) % 7 // Sat=0 … Fri=6
  const start = new Date(year, month, today.getDate() - daysSinceSaturday)
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(
    start.getDate(),
  ).padStart(2, '0')}`
}

export function FinancialReportWorkspace() {
  const movements = useWorkspaceStore((state) => state.movements)
  const isLoading = useWorkspaceStore((state) => state.isLoading)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)

  const [period, setPeriod] = useState<Period>('all')
  const [printing, setPrinting] = useState(false)

  // The report is a period → totals → summary → traceable-transactions view.
  // Everything below derives from this filtered slice of the read-only movements.
  const scoped = useMemo(() => {
    const start = periodStartIso(period)
    if (!start) return movements
    return movements.filter((movement) => movement.voucherDate >= start)
  }, [movements, period])

  const totals = useMemo(() => financialTotals(scoped), [scoped])
  const ordered = useMemo(() => movementsNewestFirst(scoped), [scoped])
  const periodLabel = PERIODS.find((item) => item.id === period)?.label ?? 'الكل'

  return (
    <div>
      <RouteHeader
        eyebrow="التقرير المالي"
        title="الموقف والحركة"
        actions={
          <>
            <Button variant="quiet" onClick={() => setPrinting(true)} disabled={!loaded || movements.length === 0}>
              <Printer className="size-4" />
              طباعة
            </Button>
            <Button variant="outline" onClick={() => void reload()} disabled={isLoading}>
              <RotateCw className="size-4" />
              {isLoading ? 'جاري التحديث...' : 'تحديث'}
            </Button>
          </>
        }
      />

      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} />

      {/* PERIOD — narrows the derived view. */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-[13px] font-medium text-muted-foreground">الفترة</span>
        <div className="flex items-center gap-1 rounded-full border border-border bg-panel p-1">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              aria-pressed={period === item.id}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                period === item.id
                  ? 'bg-olive text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOTALS + SUMMARY */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <PositionPanel
          net={totals.net}
          totalIn={totals.totalIn}
          totalOut={totals.totalOut}
          label={`صافي الموقف · ${periodLabel}`}
          context="وارد − صادر"
        />

        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-foreground">ملخّص</h2>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-x-10 gap-y-4 px-6 py-6">
            <SummaryFigure label="عدد الحركات" value={ordered.length} />
            <SummaryFigure label="سندات قبض" value={receiptCount(scoped)} tone="in" />
            <SummaryFigure label="سندات صرف" value={paymentCount(scoped)} tone="out" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-foreground">سجل الحركات — من الأحدث</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto px-6 py-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-[11px] tracking-wide text-faint">
                <th className="border-b border-border-strong px-2 py-2.5 text-start font-semibold">
                  النوع
                </th>
                <th className="border-b border-border-strong px-2 py-2.5 text-start font-semibold">
                  رقم السند
                </th>
                <th className="border-b border-border-strong px-2 py-2.5 text-start font-semibold">
                  التاريخ
                </th>
                <th className="border-b border-border-strong px-2 py-2.5 text-start font-semibold">
                  البيان
                </th>
                <th className="border-b border-border-strong px-2 py-2.5 text-end font-semibold">
                  المبلغ
                </th>
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                <tr>
                  <td colSpan={5} className="px-2 py-3">
                    <SkeletonRows rows={5} />
                  </td>
                </tr>
              ) : ordered.length > 0 ? (
                ordered.map((movement) => {
                  const isReceipt = movement.movementType === 'receipt'
                  return (
                    <tr key={`${movement.movementType}-${movement.id}`} className="transition hover:bg-highlight/60">
                      <td className="border-b border-border px-2 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${
                            isReceipt
                              ? 'border-gold/30 bg-gold-weak text-gold'
                              : 'border-clay/30 bg-clay-weak text-clay'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${isReceipt ? 'bg-gold' : 'bg-clay'}`}
                            aria-hidden
                          />
                          {isReceipt ? 'قبض' : 'صرف'}
                        </span>
                      </td>
                      <td className="figure border-b border-border px-2 py-3.5 text-muted-foreground">
                        {formatVoucherNo(movement.voucherNumber)}
                      </td>
                      <td className="border-b border-border px-2 py-3.5">
                        {formatDate(movement.voucherDate)}
                      </td>
                      <td className="border-b border-border px-2 py-3.5 text-muted-foreground">
                        {partyAndContext(movement)}
                      </td>
                      <td
                        className={`figure border-b border-border px-2 py-3.5 text-end font-semibold ${
                          isReceipt ? 'text-gold' : 'text-clay'
                        }`}
                      >
                        {isReceipt ? '+' : '−'}
                        {formatNumber(movement.amount)}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-2 py-12 text-center text-sm text-faint">
                    {movements.length > 0
                      ? 'لا توجد حركات في هذه الفترة.'
                      : 'لا توجد حركات مالية لعرضها.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {printing ? (
        <FinancialReportPrint
          net={totals.net}
          totalIn={totals.totalIn}
          totalOut={totals.totalOut}
          receiptCount={receiptCount(scoped)}
          paymentCount={paymentCount(scoped)}
          movements={ordered}
          periodLabel={periodLabel}
          onClose={() => setPrinting(false)}
        />
      ) : null}
    </div>
  )
}

function SummaryFigure({
  label,
  value,
  tone = 'ink',
}: {
  label: string
  value: number
  tone?: 'ink' | 'in' | 'out'
}) {
  const color = tone === 'in' ? 'text-gold' : tone === 'out' ? 'text-clay' : 'text-foreground'
  return (
    <div>
      <div className="text-[11px] font-medium text-faint">{label}</div>
      <Money value={value} currency={false} className={`text-2xl font-semibold ${color}`} />
    </div>
  )
}
