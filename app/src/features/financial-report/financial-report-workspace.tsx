import { useMemo, useState } from 'react'

import { Printer, RotateCw } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { PositionPanel } from '@/components/shell/position-panel'
import { RouteHeader } from '@/components/shell/route-header'
import { FinancialReportPrint } from '@/features/print/financial-report-print'
import { VoucherPrint } from '@/features/print/voucher-print'
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
import { useShellStore, type ReportView } from '@/store/use-shell-store'
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

const REPORT_VIEWS: { id: ReportView; label: string }[] = [
  { id: 'general', label: 'التقرير العام' },
  { id: 'receipts', label: 'تقرير القبض' },
  { id: 'payments', label: 'تقرير الصرف' },
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

  const view = useShellStore((state) => state.reportView)
  const navigateReport = useShellStore((state) => state.navigateReport)

  const [period, setPeriod] = useState<Period>('all')
  const [printing, setPrinting] = useState(false)
  const [printingVoucher, setPrintingVoucher] = useState<FinancialMovement | null>(null)

  const start = periodStartIso(period)
  const periodLabel = PERIODS.find((item) => item.id === period)?.label ?? 'الكل'

  // Every figure below derives from this filtered slice of the read-only movements.
  const scoped = useMemo(() => {
    if (!start) return movements
    return movements.filter((movement) => movement.voucherDate >= start)
  }, [movements, start])

  // Opening balance = net of everything BEFORE the period. Derived, not stored;
  // "all" has no prior movements so it opens at zero.
  const opening = useMemo(() => {
    if (!start) return 0
    return financialTotals(movements.filter((movement) => movement.voucherDate < start)).net
  }, [movements, start])

  const totals = useMemo(() => financialTotals(scoped), [scoped])
  const closing = opening + totals.net

  // The movements this view actually lists.
  const viewMovements = useMemo(() => {
    const ordered = movementsNewestFirst(scoped)
    if (view === 'receipts') return ordered.filter((m) => m.movementType === 'receipt')
    if (view === 'payments') return ordered.filter((m) => m.movementType === 'payment')
    return ordered
  }, [scoped, view])

  const title =
    view === 'receipts' ? 'تقرير القبض' : view === 'payments' ? 'تقرير الصرف' : 'التقرير العام'

  return (
    <div>
      <RouteHeader
        eyebrow="التقرير المالي"
        title={title}
        actions={
          <>
            <Button
              variant="quiet"
              onClick={() => setPrinting(true)}
              disabled={!loaded || viewMovements.length === 0}
            >
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

      {/* VIEW SWITCHER — mobile; desktop switches from the top-bar dropdown. */}
      <div className="mb-4 flex items-center gap-1 rounded-full border border-border bg-panel p-1 md:hidden">
        {REPORT_VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigateReport(item.id)}
            aria-pressed={view === item.id}
            className={`flex-1 rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
              view === item.id ? 'bg-olive text-white shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

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

      {view === 'general' ? (
        <GeneralSummary
          net={totals.net}
          totalIn={totals.totalIn}
          totalOut={totals.totalOut}
          opening={opening}
          closing={closing}
          periodLabel={periodLabel}
        />
      ) : (
        <SidedSummary
          view={view}
          amount={view === 'receipts' ? totals.totalIn : totals.totalOut}
          count={viewMovements.length}
          periodLabel={periodLabel}
        />
      )}

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-foreground">سجل الحركات — من الأحدث</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto px-6 py-2">
          <MovementTable
            view={view}
            loaded={loaded}
            movements={viewMovements}
            allEmpty={movements.length === 0}
            onPrintVoucher={setPrintingVoucher}
          />
        </CardContent>
      </Card>

      {printing ? (
        <FinancialReportPrint
          view={view}
          title={title}
          net={totals.net}
          totalIn={totals.totalIn}
          totalOut={totals.totalOut}
          opening={opening}
          closing={closing}
          receiptCount={receiptCount(scoped)}
          paymentCount={paymentCount(scoped)}
          movements={viewMovements}
          periodLabel={periodLabel}
          onClose={() => setPrinting(false)}
        />
      ) : null}

      {printingVoucher ? (
        <VoucherPrint movement={printingVoucher} onClose={() => setPrintingVoucher(null)} />
      ) : null}
    </div>
  )
}

function GeneralSummary({
  net,
  totalIn,
  totalOut,
  opening,
  closing,
  periodLabel,
}: {
  net: number
  totalIn: number
  totalOut: number
  opening: number
  closing: number
  periodLabel: string
}) {
  return (
    <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <PositionPanel
        net={net}
        totalIn={totalIn}
        totalOut={totalOut}
        label={`صافي الحركة · ${periodLabel}`}
        context="وارد − صادر"
      />

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-foreground">الأرصدة</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-6 sm:grid-cols-3">
          <BalanceFigure label="الرصيد الافتتاحي" value={opening} />
          <BalanceFigure label="إجمالي القبض" value={totalIn} tone="in" />
          <BalanceFigure label="إجمالي الصرف" value={totalOut} tone="out" />
          <BalanceFigure label="صافي الحركة" value={net} />
          <BalanceFigure label="الرصيد الختامي" value={closing} strong />
        </CardContent>
      </Card>
    </div>
  )
}

function SidedSummary({
  view,
  amount,
  count,
  periodLabel,
}: {
  view: Exclude<ReportView, 'general'>
  amount: number
  count: number
  periodLabel: string
}) {
  const isReceipts = view === 'receipts'
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-wrap items-end justify-between gap-6 px-6 py-6">
        <div>
          <div className="text-[12px] font-bold tracking-wide text-olive">
            {isReceipts ? 'إجمالي القبض' : 'إجمالي الصرف'} · {periodLabel}
          </div>
          <Money
            value={amount}
            currencyClassName="text-faint"
            className={`mt-2 block text-[clamp(2.2rem,5vw,3.2rem)] font-semibold leading-none ${
              isReceipts ? 'text-gold' : 'text-clay'
            }`}
          />
        </div>
        <BalanceFigure label={isReceipts ? 'عدد سندات القبض' : 'عدد سندات الصرف'} value={count} />
      </CardContent>
    </Card>
  )
}

function BalanceFigure({
  label,
  value,
  tone = 'ink',
  strong = false,
}: {
  label: string
  value: number
  tone?: 'ink' | 'in' | 'out'
  strong?: boolean
}) {
  const color = tone === 'in' ? 'text-gold' : tone === 'out' ? 'text-clay' : 'text-foreground'
  return (
    <div>
      <div className="text-[11px] font-medium text-faint">{label}</div>
      <Money
        value={value}
        currency={false}
        className={`${strong ? 'text-2xl' : 'text-xl'} font-semibold ${color}`}
      />
    </div>
  )
}

function MovementTable({
  view,
  loaded,
  movements,
  allEmpty,
  onPrintVoucher,
}: {
  view: ReportView
  loaded: boolean
  movements: FinancialMovement[]
  allEmpty: boolean
  onPrintVoucher: (movement: FinancialMovement) => void
}) {
  const showType = view === 'general'
  // Columns: [النوع?] رقم · تاريخ · بيان · مبلغ · إجراء(طباعة)
  const colCount = (showType ? 5 : 4) + 1

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-[11px] tracking-wide text-faint">
          {showType ? (
            <th className="border-b border-border-strong px-2 py-2.5 text-start font-semibold">
              النوع
            </th>
          ) : null}
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
          <th className="border-b border-border-strong px-2 py-2.5 text-end font-semibold">
            <span className="sr-only">طباعة</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {!loaded ? (
          <tr>
            <td colSpan={colCount} className="px-2 py-3">
              <SkeletonRows rows={5} />
            </td>
          </tr>
        ) : movements.length > 0 ? (
          movements.map((movement) => {
            const isReceipt = movement.movementType === 'receipt'
            return (
              <tr
                key={`${movement.movementType}-${movement.id}`}
                className="transition hover:bg-highlight/60"
              >
                {showType ? (
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
                ) : null}
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
                <td className="border-b border-border px-2 py-3.5 text-end">
                  <button
                    type="button"
                    onClick={() => onPrintVoucher(movement)}
                    aria-label={`طباعة ${isReceipt ? 'سند القبض' : 'سند الصرف'} رقم ${formatVoucherNo(movement.voucherNumber)}`}
                    title="طباعة السند"
                    className="rounded-full p-1.5 text-faint transition hover:bg-highlight hover:text-olive"
                  >
                    <Printer className="size-4" />
                  </button>
                </td>
              </tr>
            )
          })
        ) : (
          <tr>
            <td colSpan={colCount} className="px-2 py-12 text-center text-sm text-faint">
              {!allEmpty ? 'لا توجد حركات في هذه الفترة.' : 'لا توجد حركات مالية لعرضها.'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
