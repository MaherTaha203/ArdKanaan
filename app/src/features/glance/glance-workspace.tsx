import { useMemo } from 'react'

import { ArrowDownLeft, ArrowUpRight, PanelsTopLeft } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudents, attentionList, financialTotals } from '@/lib/aggregate'
import { formatNumber } from '@/lib/format'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// How many students to surface on the glance. The glance stays low-information by
// design: one figure, a short "needs your attention" list, and the day's actions.
const ATTENTION_LIMIT = 5

// The Glance — the calm, wide landing. It answers only three things: how much cash
// is on hand, who needs following up today, and the day's actions — then it hands
// the Owner into the cockpit for the actual work. Every figure is derived from the
// vouchers (financial firewall untouched); nothing here writes.
export function GlanceWorkspace() {
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const movements = useWorkspaceStore((state) => state.movements)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)

  const navigate = useShellStore((state) => state.navigate)
  const selectStudent = useShellStore((state) => state.selectStudent)
  const openOverlay = useShellStore((state) => state.openOverlay)

  const totals = useMemo(() => financialTotals(movements), [movements])
  const attention = useMemo(
    () => attentionList(aggregateStudents(students, statementLines)).slice(0, ATTENTION_LIMIT),
    [students, statementLines],
  )

  return (
    <div className="mx-auto max-w-3xl space-y-9">
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} />

      <header className="space-y-1">
        <h1 className="editorial text-3xl text-foreground">أرض كنعان</h1>
        <p className="text-sm text-muted-foreground">
          إطلالة اليوم — ما يحتاج انتباهك، ثمّ ادخل القُمرة للعمل.
        </p>
      </header>

      {/* The one figure. Cash on hand = derived net (receipts − payments). */}
      <section aria-label="الرصيد النقدي">
        <div className="text-[12.5px] tracking-wide text-faint">الرصيد النقديّ للمركز</div>
        <Money
          value={totals.net}
          className="mt-1 block text-[44px] font-semibold leading-none text-olive-ink md:text-[56px]"
          currencyClassName="text-[0.32em]"
        />
        <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-1 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-olive" aria-hidden />
            قبض <Money value={totals.totalIn} currency={false} className="text-olive" />
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-clay" aria-hidden />
            صرف <Money value={totals.totalOut} currency={false} className="text-clay" />
          </span>
        </div>
      </section>

      {/* The day's actions. */}
      <section className="flex flex-wrap gap-3">
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
          ادخل القُمرة
        </Button>
      </section>

      {/* The short attention list. */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-foreground">
            يحتاج انتباهك اليوم — طلاب عليهم متبقٍّ
          </h2>
          <button
            type="button"
            onClick={() => navigate('students')}
            className="text-xs text-gold hover:underline"
          >
            كل الطلاب
          </button>
        </CardHeader>
        <CardContent className="px-5 py-2">
          {!loaded ? (
            <SkeletonRows rows={3} />
          ) : attention.length > 0 ? (
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
                <Button variant="quiet" size="sm" onClick={() => selectStudent(item.student.id)}>
                  فتح
                </Button>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-faint">
              لا مبالغ متبقية — كل التسجيلات مكتملة.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
