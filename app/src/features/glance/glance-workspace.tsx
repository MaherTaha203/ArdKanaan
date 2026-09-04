import { useMemo } from 'react'

import { ArrowDownLeft, ArrowUpRight, PanelsTopLeft } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { Skeleton, SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudents, attentionList, financialTotals } from '@/lib/aggregate'
import { formatNumber } from '@/lib/format'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

const ATTENTION_LIMIT = 5

// The Glance is a work entry point, not a dashboard: one cash position, a short
// attention list, and the day's actions. Figures remain derived from vouchers.
export function GlanceWorkspace() {
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const movements = useWorkspaceStore((state) => state.movements)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)

  const navigate = useShellStore((state) => state.navigate)
  const selectStudent = useShellStore((state) => state.selectStudent)
  const openOverlay = useShellStore((state) => state.openOverlay)

  const totals = useMemo(() => financialTotals(movements), [movements])
  const attention = useMemo(
    () => attentionList(aggregateStudents(students, statementLines)).slice(0, ATTENTION_LIMIT),
    [students, statementLines],
  )

  return (
    <div className="space-y-9">
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

      <header className="space-y-1.5">
        <div className="text-[12px] font-bold tracking-wide text-olive">أرض كنعان</div>
        <h1 className="editorial text-[clamp(1.8rem,3vw,2.5rem)] text-foreground">الإطلالة</h1>
      </header>

      <section aria-label="الرصيد النقديّ للمركز" className="border-y border-border py-7 sm:py-8">
        <div className="text-[13px] font-medium text-muted-foreground">الرصيد النقديّ للمركز</div>
        {!loaded ? (
          <div role="status" aria-label="جارٍ التحميل">
            <Skeleton className="mt-3 h-12 w-56 md:h-14" />
            <Skeleton className="mt-5 h-4 w-44" />
          </div>
        ) : (
          <>
            <Money
              value={totals.net}
              className={`mt-2 block text-[44px] font-semibold leading-none md:text-[56px] ${
                totals.net < 0 ? 'text-clay' : 'text-foreground'
              }`}
              currencyClassName="text-[0.32em]"
            />
            <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-1 text-[13px] text-muted-foreground">
              <span>
                قبض <Money value={totals.totalIn} currency={false} className="font-semibold text-gold" />
              </span>
              <span>
                صرف <Money value={totals.totalOut} currency={false} className="font-semibold text-clay" />
              </span>
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="attention-heading" className="border-b border-border pb-7 sm:pb-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="attention-heading" className="text-base font-semibold text-foreground">
            طلاب عليهم مبالغ متبقّية
          </h2>
          <button type="button" onClick={() => navigate('students')} className="text-xs font-semibold text-olive">
            كل الطلاب
          </button>
        </div>

        <div className="mt-2">
          {!loaded ? (
            <SkeletonRows rows={3} />
          ) : attention.length > 0 ? (
            attention.map((item) => (
              <div
                key={item.student.id}
                className="flex items-center gap-3 border-b border-border py-3.5 last:border-b-0"
              >
                <span className="grid size-9 flex-none place-items-center rounded-full bg-olive-weak text-sm font-bold text-olive">
                  {item.student.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{item.student.name}</div>
                  <div className="text-xs text-faint">متبقٍّ على {formatNumber(item.courses)} دورة</div>
                </div>
                <Money value={item.remaining} currency={false} className="text-sm font-semibold text-warn" />
                <Button variant="quiet" size="sm" onClick={() => selectStudent(item.student.id)}>
                  فتح
                </Button>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-faint">لا مبالغ متبقّية.</p>
          )}
        </div>
      </section>

      <section aria-label="إجراءات اليوم" className="flex flex-wrap gap-3">
        <Button variant="gold" onClick={() => openOverlay('receive')}>
          <ArrowDownLeft className="size-4" />
          سند قبض
        </Button>
        <Button variant="quiet" onClick={() => openOverlay('expense')}>
          <ArrowUpRight className="size-4" />
          سند صرف
        </Button>
        <Button variant="quiet" onClick={() => navigate('students')}>
          <PanelsTopLeft className="size-4" />
          أسماء الطلاب
        </Button>
      </section>
    </div>
  )
}
