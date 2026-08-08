import { useMemo } from 'react'

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { PositionPanel } from '@/components/shell/position-panel'
import { RouteHeader } from '@/components/shell/route-header'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import {
  aggregateStudents,
  attentionList,
  financialTotals,
  movementsNewestFirst,
  paymentCount,
  receiptCount,
} from '@/lib/aggregate'
import { formatDate, formatNumber } from '@/lib/format'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

export function HomeWorkspace() {
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const movements = useWorkspaceStore((state) => state.movements)
  const isLoading = useWorkspaceStore((state) => state.isLoading)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)

  const navigate = useShellStore((state) => state.navigate)
  const selectStudent = useShellStore((state) => state.selectStudent)
  const openOverlay = useShellStore((state) => state.openOverlay)

  const totals = useMemo(() => financialTotals(movements), [movements])
  const attention = useMemo(
    () => attentionList(aggregateStudents(students, statementLines)),
    [students, statementLines],
  )
  const recent = useMemo(() => movementsNewestFirst(movements).slice(0, 7), [movements])

  return (
    <div>
      <RouteHeader
        eyebrow="مساحة العمل"
        title="دفتر المركز — الآن"
        description="كل رقم هنا مشتقٌّ من السندات وقابلٌ للتتبع. لا رصيد مخزَّن."
        actions={
          <>
            <Button variant="gold" onClick={() => openOverlay('receive')}>
              <ArrowDownLeft className="size-4" />
              استلام مبلغ
            </Button>
            <Button variant="quiet" onClick={() => openOverlay('expense')}>
              <ArrowUpRight className="size-4" />
              تسجيل مصروف
            </Button>
          </>
        }
      />

      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <PositionPanel
            net={totals.net}
            totalIn={totals.totalIn}
            totalOut={totals.totalOut}
            label="الموقف المالي"
            context={`مشتق من ${formatNumber(receiptCount(movements))} سند قبض و ${formatNumber(
              paymentCount(movements),
            )} سند صرف`}
          />

          <section className="rounded-lg border border-border bg-panel">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">
                يحتاج انتباهك — طلاب عليهم متبقٍّ
              </h2>
              <button
                type="button"
                onClick={() => navigate('students')}
                className="text-xs text-gold hover:underline"
              >
                كل الطلاب
              </button>
            </div>
            <div className="px-5 py-2">
              {attention.length > 0 ? (
                attention.map((item) => (
                  <div
                    key={item.student.id}
                    className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                  >
                    <span className="grid size-8 flex-none place-items-center rounded-full bg-olive-weak text-sm font-bold text-olive">
                      {item.student.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-foreground">{item.student.name}</div>
                      <div className="text-xs text-faint">
                        متبقٍّ على {formatNumber(item.courses)} دورة
                      </div>
                    </div>
                    <Money value={item.remaining} currency={false} className="text-sm text-clay" />
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => selectStudent(item.student.id)}
                    >
                      فتح
                    </Button>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-faint">
                  {loaded && !isLoading
                    ? 'لا مبالغ متبقية — كل التسجيلات مكتملة.'
                    : 'جاري تحميل بيانات المركز...'}
                </p>
              )}
            </div>
          </section>
        </div>

        <aside>
          <section className="rounded-lg border border-border bg-panel">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">الحركة المالية</h2>
              <button
                type="button"
                onClick={() => navigate('report')}
                className="text-xs text-gold hover:underline"
              >
                التقرير
              </button>
            </div>
            <div className="px-5 py-2">
              {recent.length > 0 ? (
                recent.map((movement) => {
                  const isReceipt = movement.movementType === 'receipt'
                  return (
                    <div
                      key={`${movement.movementType}-${movement.id}`}
                      className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                    >
                      <span
                        className={`size-2 flex-none rounded-full ${
                          isReceipt ? 'bg-olive' : 'bg-clay'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] text-foreground">
                          {isReceipt ? 'قبض' : 'صرف'} · {movement.partyName ?? 'المركز'}
                        </div>
                        <div className="truncate text-[11.5px] text-faint">
                          {(movement.context ?? '—') + ' · ' + formatDate(movement.voucherDate)}
                        </div>
                      </div>
                      <Money
                        value={movement.amount}
                        currency={false}
                        sign={isReceipt ? 'plus' : 'minus'}
                        className={`text-[13.5px] font-semibold ${
                          isReceipt ? 'text-olive' : 'text-clay'
                        }`}
                      />
                    </div>
                  )
                })
              ) : (
                <p className="py-8 text-center text-sm text-faint">لا توجد حركات لعرضها بعد.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
