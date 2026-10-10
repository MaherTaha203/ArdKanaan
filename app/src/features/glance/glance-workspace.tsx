import { useMemo, type ReactNode } from 'react'

import { User } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudentsFromSummaries, attentionList, financialTotals, movementsNewestFirst } from '@/lib/aggregate'
import { formatDate, formatNumber } from '@/lib/format'
import type { FinancialMovement } from '@/types/domain'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// ── Alternative C — Information-layout home (structured dashboard) ──────────
// Data-forward and scannable: a compact figure band across the top, then the
// recent-operations and outstanding-dues records as proper tables with a clear
// visual hierarchy. Balances come from the payment-netted
// student_financial_summary (studentSummaries), correct on first load.

const RECENT_LIMIT = 8
const DUES_LIMIT = 8

function todayLong(): string {
  return new Intl.DateTimeFormat('en-US', { numberingSystem: 'latn', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
}

function statement(movement: FinancialMovement): string {
  const party = movement.movementType === 'receipt' ? movement.partyName ?? '—' : 'المركز'
  return movement.context ? `${party} · ${movement.context}` : party
}

export function GlanceWorkspace() {
  const students = useWorkspaceStore((state) => state.students)
  const studentSummaries = useWorkspaceStore((state) => state.studentSummaries)
  const movements = useWorkspaceStore((state) => state.movements)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)

  const navigate = useShellStore((state) => state.navigate)
  const selectStudent = useShellStore((state) => state.selectStudent)

  const totals = useMemo(() => financialTotals(movements), [movements])
  const recent = useMemo(() => movementsNewestFirst(movements).slice(0, RECENT_LIMIT), [movements])
  const dues = useMemo(
    () => attentionList(aggregateStudentsFromSummaries(students, studentSummaries)),
    [students, studentSummaries],
  )
  const dueTotal = useMemo(() => dues.reduce((sum, item) => sum + item.remaining, 0), [dues])
  const topDues = dues.slice(0, DUES_LIMIT)

  return (
    <div className="space-y-6">
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

      <header className="border-b border-border pb-4">
        <div className="text-[12px] font-bold tracking-wide text-olive">لوحة المعلومات</div>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h1 className="editorial text-[clamp(1.35rem,2.4vw,1.75rem)] text-foreground">نظرة عامة على المركز</h1>
          <div className="text-[13px] text-muted-foreground">اليوم <span className="figure font-semibold text-foreground">{todayLong()}</span></div>
        </div>
      </header>

      {/* Figure band — scannable, information-dense, not a tile wall. */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3 xl:grid-cols-5">
        <Figure label="صافي أموال المركز" loading={!loaded}><Money value={totals.centerNet} currency={false} className={`figure block text-xl font-bold ${totals.centerNet < 0 ? 'text-clay' : 'text-foreground'}`} /></Figure>
        <Figure label="إجمالي المقبوضات" loading={!loaded}><span className="figure block text-xl font-bold text-gold">{formatNumber(totals.totalIn)}</span></Figure>
        <Figure label="إجمالي المدفوعات" loading={!loaded}><span className="figure block text-xl font-bold text-clay">{formatNumber(totals.totalOut)}</span></Figure>
        <Figure label="محتجز لجهات خارجية" loading={!loaded}><span className="figure block text-xl font-bold text-foreground">{formatNumber(totals.externalHeld)}</span></Figure>
        <Figure label="مستحقات قائمة" loading={!loaded}><span className="figure block text-xl font-bold text-warn">{formatNumber(dueTotal)}</span></Figure>
      </div>

      {/* Recent operations — a full record table. */}
      <section aria-labelledby="recent-heading" className="rounded-2xl border border-border bg-panel">
        <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <div className="text-[11px] font-bold tracking-wide text-faint">السجلّ الماليّ</div>
            <h2 id="recent-heading" className="text-base font-bold text-foreground">آخر العمليات</h2>
          </div>
          <button type="button" onClick={() => navigate('report')} className="text-xs font-semibold text-olive">عرض الكل</button>
        </div>
        <div className="overflow-x-auto">
          {!loaded ? <div className="p-4"><SkeletonRows rows={5} /></div> : recent.length > 0 ? (
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead><tr className="text-[11px] tracking-wide text-faint"><th className="border-b border-border px-5 py-2.5 text-start font-semibold">التاريخ</th><th className="border-b border-border px-3 py-2.5 text-start font-semibold">النوع</th><th className="border-b border-border px-3 py-2.5 text-start font-semibold">البيان</th><th className="border-b border-border px-5 py-2.5 text-end font-semibold">المبلغ</th></tr></thead>
              <tbody>{recent.map((movement) => { const isReceipt = movement.movementType === 'receipt'; return <tr key={`${movement.movementType}-${movement.id}`} className="border-b border-border last:border-b-0"><td className="figure whitespace-nowrap px-5 py-2.5 text-muted-foreground">{formatDate(movement.voucherDate)}</td><td className="px-3 py-2.5"><span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${isReceipt ? 'bg-gold-weak text-gold' : 'bg-clay-weak text-clay'}`}>{isReceipt ? 'سند قبض' : 'سند صرف'}</span></td><td className="px-3 py-2.5 text-muted-foreground">{statement(movement)}</td><td className={`figure px-5 py-2.5 text-end font-bold ${isReceipt ? 'text-gold' : 'text-clay'}`}>{isReceipt ? '+' : '−'}{formatNumber(movement.amount)}</td></tr> })}</tbody>
            </table>
          ) : <p className="px-5 py-10 text-center text-sm text-faint">لا توجد عمليات بعد.</p>}
        </div>
      </section>

      {/* Outstanding dues — a full record table, not a short list. */}
      <section aria-labelledby="dues-heading" className="rounded-2xl border border-border bg-panel">
        <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <div className="text-[11px] font-bold tracking-wide text-faint">المتابعة الماليّة</div>
            <h2 id="dues-heading" className="text-base font-bold text-foreground">طلاب عليهم مستحقات <span className="figure text-sm font-medium text-faint">({formatNumber(dues.length)})</span></h2>
          </div>
          <button type="button" onClick={() => navigate('students')} className="text-xs font-semibold text-olive">عرض الطلاب</button>
        </div>
        <div className="overflow-x-auto">
          {!loaded ? <div className="p-4"><SkeletonRows rows={4} /></div> : topDues.length > 0 ? (
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead><tr className="text-[11px] tracking-wide text-faint"><th className="border-b border-border px-5 py-2.5 text-start font-semibold">الطالب</th><th className="border-b border-border px-3 py-2.5 text-end font-semibold">الدورات</th><th className="border-b border-border px-3 py-2.5 text-start font-semibold">آخر حركة</th><th className="border-b border-border px-3 py-2.5 text-end font-semibold">المسدَّد</th><th className="border-b border-border px-5 py-2.5 text-end font-semibold">المتبقّي</th></tr></thead>
              <tbody>{topDues.map((item) => (
                <tr key={item.student.id} className="border-b border-border last:border-b-0 hover:bg-highlight">
                  <td className="px-5 py-2.5"><button type="button" onClick={() => selectStudent(item.student.id)} className="flex items-center gap-2.5 text-start"><span aria-hidden className="grid size-7 flex-none place-items-center rounded-full bg-olive-weak text-olive"><User className="size-3.5" /></span><span className="truncate font-medium text-foreground">{item.student.name}</span></button></td>
                  <td className="figure px-3 py-2.5 text-end text-muted-foreground">{formatNumber(item.courses)}</td>
                  <td className="figure px-3 py-2.5 text-muted-foreground">{item.lastActivity ? formatDate(item.lastActivity) : '—'}</td>
                  <td className="figure px-3 py-2.5 text-end text-muted-foreground">{formatNumber(item.paid)}</td>
                  <td className="figure px-5 py-2.5 text-end font-bold text-warn">{formatNumber(item.remaining)}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : <p className="px-5 py-10 text-center text-sm text-faint">لا توجد مستحقات قائمة.</p>}
        </div>
      </section>
    </div>
  )
}

function Figure({ label, loading, children }: { label: string; loading?: boolean; children: ReactNode }) {
  return (
    <div className="bg-panel px-5 py-4">
      <div className="mb-1.5 text-[11.5px] font-medium text-muted-foreground">{label}</div>
      {loading ? <div className="h-6 w-20 animate-pulse rounded bg-highlight" /> : children}
    </div>
  )
}
