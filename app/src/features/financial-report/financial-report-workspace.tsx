import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { appEnv } from '@/lib/env'
import { formatDate, formatNumber } from '@/lib/format'
import { useFinancialReportStore } from '@/store/use-financial-report-store'
import type { FinancialMovement } from '@/types/domain'

function movementTypeLabel(movement: FinancialMovement) {
  return movement.movementType === 'receipt' ? 'قبض' : 'صرف'
}

function movementReference(movement: FinancialMovement) {
  const noun = movement.movementType === 'receipt' ? 'سند قبض' : 'سند صرف'
  return `${noun} رقم ${formatNumber(movement.voucherNumber)}`
}

function movementDescription(movement: FinancialMovement) {
  if (movement.movementType === 'receipt') {
    const party = movement.partyName ?? '—'
    return movement.context ? `${party} · ${movement.context}` : party
  }

  return movement.context ?? '—'
}

function SummaryFigure({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <span className="text-xs tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold text-foreground">{formatNumber(value)}</span>
    </div>
  )
}

export function FinancialReportWorkspace() {
  const {
    movements,
    totalReceipts,
    totalPayments,
    netBalance,
    isLoading,
    loaded,
    error,
    loadReport,
    clearError,
  } = useFinancialReportStore()

  useEffect(() => {
    void loadReport()
  }, [loadReport])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex w-fit rounded-full border border-border bg-panel px-3 py-1 text-xs tracking-[0.24em] text-muted-foreground">
              التقرير المالي
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              التقرير المالي
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              طبقة عرض مشتقة فقط من سندات القبض والصرف. لا تنشئ حقيقة مالية جديدة، ولا تخزّن الرصيد، وكل حركة قابلة للتتبع إلى سندها الأصلي.
            </p>
          </div>

          <Button variant="outline" onClick={() => void loadReport()} disabled={isLoading}>
            {isLoading ? 'جاري التحديث...' : 'تحديث'}
          </Button>
        </header>

        {!appEnv.isSupabaseConfigured ? (
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
            التطبيق جاهز تقنيًا لكن الاتصال بقاعدة البيانات يحتاج إلى استكمال بيانات البيئة المحلية
            قبل عرض التقرير.
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button variant="ghost" className="justify-start text-red-700" onClick={clearError}>
              إخفاء
            </Button>
          </div>
        ) : null}

        <Card className="mb-6 bg-background">
          <div className="grid divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:[&>*]:border-border/70">
            <SummaryFigure label="إجمالي المقبوضات" value={totalReceipts} />
            <SummaryFigure label="إجمالي المصروفات" value={totalPayments} />
            <SummaryFigure label="صافي الرصيد" value={netBalance} />
          </div>
        </Card>

        <Card className="bg-background">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">سجل الحركات المالية</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  الحركات الداخلة والخارجة في سجل واحد، كل حركة مرتبطة برقم سندها الأصلي.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-panel px-4 py-3 text-xs text-muted-foreground">
                {formatNumber(movements.length)} حركة/حركات
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-3xl border border-border bg-panel">
              <div className="grid grid-cols-[0.8fr_0.9fr_0.7fr_1.8fr_0.9fr] gap-2 border-b border-border/80 bg-highlight px-4 py-3 text-xs font-medium text-muted-foreground">
                <span>رقم السند</span>
                <span>التاريخ</span>
                <span>النوع</span>
                <span>البيان</span>
                <span>المبلغ</span>
              </div>

              {movements.length > 0 ? (
                <div className="divide-y divide-border/80">
                  {movements.map((movement) => (
                    <div
                      key={`${movement.movementType}-${movement.id}`}
                      className="grid grid-cols-[0.8fr_0.9fr_0.7fr_1.8fr_0.9fr] gap-2 px-4 py-4 text-sm text-foreground"
                    >
                      <span title={movementReference(movement)}>{formatNumber(movement.voucherNumber)}</span>
                      <span>{formatDate(movement.voucherDate)}</span>
                      <span>{movementTypeLabel(movement)}</span>
                      <span className="text-muted-foreground">{movementDescription(movement)}</span>
                      <span>{formatNumber(movement.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-12 text-center text-sm leading-7 text-muted-foreground">
                  {loaded ? 'لا توجد حركات مالية لعرضها.' : 'جاري تحميل الحركات المالية...'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
