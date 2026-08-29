import { useMemo } from 'react'

import { RotateCw } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { PositionPanel } from '@/components/shell/position-panel'
import { RouteHeader } from '@/components/shell/route-header'
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
import type { FinancialMovement } from '@/types/domain'
import { useWorkspaceStore } from '@/store/use-workspace-store'

function partyAndContext(movement: FinancialMovement) {
  const party = movement.movementType === 'receipt' ? movement.partyName ?? '—' : 'المركز'
  return movement.context ? `${party} · ${movement.context}` : party
}

export function FinancialReportWorkspace() {
  const movements = useWorkspaceStore((state) => state.movements)
  const isLoading = useWorkspaceStore((state) => state.isLoading)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)

  const totals = useMemo(() => financialTotals(movements), [movements])
  const ordered = useMemo(() => movementsNewestFirst(movements), [movements])

  return (
    <div>
      <RouteHeader
        eyebrow="التقرير المالي"
        title="الموقف والحركة"
        description="عرضٌ مشتقٌّ من القبض والصرف — لا يُنشئ حقيقة مالية، ولا يخزّن رصيدًا، وكل حركة تقود إلى سندها الأصلي."
        actions={
          <Button variant="outline" onClick={() => void reload()} disabled={isLoading}>
            <RotateCw className="size-4" />
            {isLoading ? 'جاري التحديث...' : 'تحديث'}
          </Button>
        }
      />

      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} />

      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <PositionPanel
          net={totals.net}
          totalIn={totals.totalIn}
          totalOut={totals.totalOut}
          label="صافي الموقف"
          context="وارد − صادر"
        />

        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-foreground">ملخّص</h2>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-x-10 gap-y-4 px-6 py-6">
            <SummaryFigure label="عدد الحركات" value={movements.length} />
            <SummaryFigure label="سندات قبض" value={receiptCount(movements)} tone="in" />
            <SummaryFigure label="سندات صرف" value={paymentCount(movements)} tone="out" />
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
                        {formatNumber(movement.voucherNumber)}
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
                    لا توجد حركات مالية لعرضها.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
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
