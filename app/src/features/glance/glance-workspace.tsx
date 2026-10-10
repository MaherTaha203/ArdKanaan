import { useMemo, type ComponentType, type ReactNode } from 'react'

import { BookOpen, HandCoins, Landmark, User, UserPlus, Users, Wallet } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudentsFromSummaries, attentionList, financialTotals, movementsNewestFirst } from '@/lib/aggregate'
import { formatDate, formatNumber, todayIsoDate } from '@/lib/format'
import type { FinancialMovement } from '@/types/domain'
import { useSettingsStore } from '@/store/use-settings-store'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// ── Alternative A — Operational home (cockpit) ─────────────────────────────
// A balanced operations surface: a restrained figure row (center funds + today's
// cash + outstanding dues), direct quick-actions for the most-used entries, then
// the two live work queues. Balances come from the payment-netted
// student_financial_summary view (studentSummaries), not the globally-empty
// statementLines the old home used — so dues are correct on first load.

const RECENT_LIMIT = 7

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
  const openOverlay = useShellStore((state) => state.openOverlay)
  const openAddStudent = useShellStore((state) => state.openAddStudent)
  const attentionCount = useSettingsStore((state) => state.settings.attentionCount)

  const today = todayIsoDate()
  const totals = useMemo(() => financialTotals(movements), [movements])
  const todayCash = useMemo(() => {
    let inSum = 0, inCount = 0, outSum = 0, outCount = 0
    for (const m of movements) {
      if (m.voucherDate !== today) continue
      if (m.movementType === 'receipt') { inSum += m.amount; inCount += 1 } else { outSum += m.amount; outCount += 1 }
    }
    return { inSum, inCount, outSum, outCount }
  }, [movements, today])

  const recent = useMemo(() => movementsNewestFirst(movements).slice(0, RECENT_LIMIT), [movements])
  const dues = useMemo(
    () => attentionList(aggregateStudentsFromSummaries(students, studentSummaries)),
    [students, studentSummaries],
  )
  const dueTotal = useMemo(() => dues.reduce((sum, item) => sum + item.remaining, 0), [dues])
  const attention = useMemo(() => dues.slice(0, attentionCount), [dues, attentionCount])

  return (
    <div className="space-y-5">
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="editorial text-[clamp(1.35rem,2.4vw,1.75rem)] text-foreground">لوحة التشغيل</h1>
        <div className="text-[13px] text-muted-foreground">اليوم <span className="figure font-semibold text-foreground">{todayLong()}</span></div>
      </header>

      {/* Figure row — four balanced tiles, not a KPI wall. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile icon={Landmark} label="صافي أموال المركز" loading={!loaded}>
          <Money value={totals.centerNet} className={`figure block text-2xl font-bold leading-none ${totals.centerNet < 0 ? 'text-clay' : 'text-foreground'}`} currencyClassName="text-[0.5em]" />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[11.5px] text-muted-foreground">
            <span>المقبوضات <span className="figure font-semibold text-gold">{formatNumber(totals.instituteRevenue)}</span></span>
            <span>المدفوعات <span className="figure font-semibold text-clay">{formatNumber(totals.totalOut)}</span></span>
          </div>
        </KpiTile>
        <KpiTile icon={HandCoins} label="مقبوضات اليوم" loading={!loaded} tone="gold">
          <Money value={todayCash.inSum} className="figure block text-2xl font-bold leading-none text-gold" currencyClassName="text-[0.5em]" />
          <div className="mt-2 text-[11.5px] text-muted-foreground"><span className="figure font-semibold text-foreground">{formatNumber(todayCash.inCount)}</span> سند قبض اليوم</div>
        </KpiTile>
        <KpiTile icon={Wallet} label="مدفوعات اليوم" loading={!loaded} tone="clay">
          <Money value={todayCash.outSum} className="figure block text-2xl font-bold leading-none text-clay" currencyClassName="text-[0.5em]" />
          <div className="mt-2 text-[11.5px] text-muted-foreground"><span className="figure font-semibold text-foreground">{formatNumber(todayCash.outCount)}</span> سند صرف اليوم</div>
        </KpiTile>
        <KpiTile icon={Users} label="مستحقات قائمة" loading={!loaded} tone="warn">
          <Money value={dueTotal} className="figure block text-2xl font-bold leading-none text-warn" currencyClassName="text-[0.5em]" />
          <div className="mt-2 text-[11.5px] text-muted-foreground"><span className="figure font-semibold text-foreground">{formatNumber(dues.length)}</span> طالبًا عليهم رصيد</div>
        </KpiTile>
      </div>

      {/* Quick actions — the most-used entries, one click from the home. */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuickAction icon={HandCoins} label="سند قبض" sub="تسجيل مبلغ مقبوض" tone="olive" onClick={() => openOverlay('receive')} />
        <QuickAction icon={Wallet} label="سند صرف" sub="تسجيل مبلغ مدفوع" tone="clay" onClick={() => openOverlay('expense')} />
        <QuickAction icon={UserPlus} label="إضافة طالب" sub="تسجيل طالب جديد" tone="olive" onClick={() => openAddStudent()} />
        <QuickAction icon={BookOpen} label="الدورات" sub="إدارة الدورات والتسجيل" tone="olive" onClick={() => navigate('courses')} />
      </div>

      {/* Work queues */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="recent-heading" className="rounded-2xl border border-border bg-panel">
          <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4">
            <h2 id="recent-heading" className="text-base font-bold text-foreground">آخر العمليات</h2>
            <button type="button" onClick={() => navigate('report')} className="text-xs font-semibold text-olive">عرض الكل</button>
          </div>
          <div className="overflow-x-auto">
            {!loaded ? <div className="p-4"><SkeletonRows rows={5} /></div> : recent.length > 0 ? (
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead><tr className="text-[11px] tracking-wide text-faint"><th className="border-b border-border px-4 py-2.5 text-start font-semibold">التاريخ</th><th className="border-b border-border px-4 py-2.5 text-start font-semibold">النوع</th><th className="border-b border-border px-4 py-2.5 text-start font-semibold">البيان</th><th className="border-b border-border px-4 py-2.5 text-end font-semibold">المبلغ</th></tr></thead>
                <tbody>{recent.map((movement) => { const isReceipt = movement.movementType === 'receipt'; return <tr key={`${movement.movementType}-${movement.id}`}><td className="figure whitespace-nowrap border-b border-border px-4 py-2.5 text-muted-foreground">{formatDate(movement.voucherDate)}</td><td className="border-b border-border px-4 py-2.5"><span className={`text-xs font-medium ${isReceipt ? 'text-gold' : 'text-clay'}`}>{isReceipt ? 'سند قبض' : 'سند صرف'}</span></td><td className="border-b border-border px-4 py-2.5 text-muted-foreground">{statement(movement)}</td><td className={`figure border-b border-border px-4 py-2.5 text-end font-bold ${isReceipt ? 'text-gold' : 'text-clay'}`}>{isReceipt ? '+' : '−'}{formatNumber(movement.amount)}</td></tr> })}</tbody>
              </table>
            ) : <p className="px-5 py-10 text-center text-sm text-faint">لا توجد عمليات بعد.</p>}
          </div>
        </section>

        <section aria-labelledby="attention-heading" className="rounded-2xl border border-border bg-panel">
          <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4"><h2 id="attention-heading" className="text-base font-bold text-foreground">طلاب عليهم مستحقات</h2><button type="button" onClick={() => navigate('students')} className="text-xs font-semibold text-olive">عرض الطلاب</button></div>
          <div className="px-2 py-1.5">
            {!loaded ? <div className="p-3"><SkeletonRows rows={3} /></div> : attention.length > 0 ? attention.map((item) => (
              <button key={item.student.id} type="button" onClick={() => selectStudent(item.student.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start hover:bg-highlight">
                <span aria-hidden className="grid size-9 flex-none place-items-center rounded-full bg-olive-weak text-olive"><User className="size-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{item.student.name}</span>
                  <span className="block truncate text-[11px] text-faint"><span className="figure">{formatNumber(item.courses)}</span> دورات · آخر حركة <span className="figure">{item.lastActivity ? formatDate(item.lastActivity) : '—'}</span></span>
                </span>
                <Money value={item.remaining} currency={false} className="figure text-sm font-bold text-warn" />
              </button>
            )) : <p className="px-3 py-8 text-center text-sm text-faint">لا توجد مستحقات قائمة.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

function KpiTile({ icon: Icon, label, loading, tone = 'olive', children }: { icon: ComponentType<{ className?: string }>; label: string; loading?: boolean; tone?: 'olive' | 'gold' | 'clay' | 'warn'; children: ReactNode }) {
  const toneClass = tone === 'gold' ? 'bg-gold-weak text-gold' : tone === 'clay' ? 'bg-clay-weak text-clay' : tone === 'warn' ? 'bg-warn-weak text-warn' : 'bg-olive-weak text-olive'
  return (
    <div className="rounded-2xl border border-border bg-panel px-4 py-3.5 shadow-card">
      <div className="mb-2.5 flex items-center gap-2">
        <span aria-hidden className={`grid size-7 flex-none place-items-center rounded-lg ${toneClass}`}><Icon className="size-4" /></span>
        <span className="text-[12.5px] font-medium text-muted-foreground">{label}</span>
      </div>
      {loading ? <div className="h-7 w-24 animate-pulse rounded bg-highlight" /> : children}
    </div>
  )
}

function QuickAction({ icon: Icon, label, sub, tone = 'olive', onClick }: { icon: ComponentType<{ className?: string }>; label: string; sub: string; tone?: 'olive' | 'clay'; onClick: () => void }) {
  const toneClass = tone === 'clay' ? 'bg-clay-weak text-clay' : 'bg-olive-weak text-olive'
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-2xl border border-border bg-panel px-4 py-3.5 text-start shadow-card transition-colors hover:border-border-strong hover:bg-highlight">
      <span aria-hidden className={`grid size-10 flex-none place-items-center rounded-xl ${toneClass}`}><Icon className="size-5" /></span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="block truncate text-[11.5px] text-muted-foreground">{sub}</span>
      </span>
    </button>
  )
}
