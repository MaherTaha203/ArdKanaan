import { useMemo } from 'react'

import { HandCoins, Search, User, UserPlus, Wallet } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudentsFromSummaries, attentionList, movementsNewestFirst } from '@/lib/aggregate'
import { formatDate, formatNumber } from '@/lib/format'
import type { FinancialMovement } from '@/types/domain'
import { useSettingsStore } from '@/store/use-settings-store'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// ── Alternative B — Fast-workflow home (launcher) ──────────────────────────
// A deliberately spare launcher: one big search prompt (the ⌘K palette), the
// two most-used actions, then compact recent + dues lists. No KPI wall — the
// goal is to start the next task in as few moves as possible. Dues come from the
// payment-netted student_financial_summary (studentSummaries), so they are
// correct on first load.

const RECENT_LIMIT = 6

function statement(movement: FinancialMovement): string {
  const party = movement.movementType === 'receipt' ? movement.partyName ?? '—' : 'المركز'
  return movement.context ? `${party} · ${movement.context}` : party
}

export function GlanceWorkspace({ onOpenSearch }: { onOpenSearch?: () => void }) {
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

  const recent = useMemo(() => movementsNewestFirst(movements).slice(0, RECENT_LIMIT), [movements])
  const attention = useMemo(
    () => attentionList(aggregateStudentsFromSummaries(students, studentSummaries)).slice(0, attentionCount),
    [students, studentSummaries, attentionCount],
  )

  return (
    <div className="space-y-5">
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

      {/* Launcher — search is the first thing the operator reaches for. */}
      <div className="rounded-2xl border border-border bg-panel px-5 py-6 text-center shadow-card sm:px-8 sm:py-8">
        <h1 className="editorial text-[clamp(1.25rem,2.2vw,1.6rem)] text-foreground">ابدأ بالبحث</h1>
        <p className="mt-1 text-sm text-muted-foreground">اعثر على أيّ طالب أو شغّل أيّ إجراء من مكانٍ واحد.</p>
        <button
          type="button"
          onClick={() => onOpenSearch?.()}
          className="mx-auto mt-4 flex w-full max-w-xl items-center gap-3 rounded-full border border-border-strong bg-background px-5 py-3 text-start text-muted-foreground transition-colors hover:border-olive hover:bg-panel"
        >
          <Search className="size-5 flex-none text-faint" />
          <span className="min-w-0 flex-1 truncate text-sm">ابحث عن طالب بالاسم أو الرقم، أو اكتب إجراءً…</span>
          <kbd className="figure hidden flex-none rounded border border-border-strong bg-highlight px-1.5 py-0.5 text-[11px] text-faint sm:block">⌘K</kbd>
        </button>
        <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2">
          <QuickChip icon={HandCoins} label="سند قبض" tone="olive" onClick={() => openOverlay('receive')} />
          <QuickChip icon={Wallet} label="سند صرف" tone="clay" onClick={() => openOverlay('expense')} />
          <QuickChip icon={UserPlus} label="إضافة طالب" tone="olive" onClick={() => openAddStudent()} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="recent-heading" className="rounded-2xl border border-border bg-panel">
          <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-3.5">
            <h2 id="recent-heading" className="text-base font-bold text-foreground">آخر العمليات</h2>
            <button type="button" onClick={() => navigate('report')} className="text-xs font-semibold text-olive">عرض الكل</button>
          </div>
          <div className="overflow-x-auto">
            {!loaded ? <div className="p-4"><SkeletonRows rows={5} /></div> : recent.length > 0 ? (
              <table className="w-full min-w-[440px] border-collapse text-sm">
                <tbody>{recent.map((movement) => { const isReceipt = movement.movementType === 'receipt'; return (
                  <tr key={`${movement.movementType}-${movement.id}`} className="border-b border-border last:border-b-0">
                    <td className="figure whitespace-nowrap px-5 py-2.5 text-[12px] text-faint">{formatDate(movement.voucherDate)}</td>
                    <td className="px-2 py-2.5"><span className={`text-xs font-medium ${isReceipt ? 'text-gold' : 'text-clay'}`}>{isReceipt ? 'قبض' : 'صرف'}</span></td>
                    <td className="px-2 py-2.5 text-[13px] text-muted-foreground">{statement(movement)}</td>
                    <td className={`figure px-5 py-2.5 text-end font-bold ${isReceipt ? 'text-gold' : 'text-clay'}`}>{isReceipt ? '+' : '−'}{formatNumber(movement.amount)}</td>
                  </tr>
                ) })}</tbody>
              </table>
            ) : <p className="px-5 py-10 text-center text-sm text-faint">لا توجد عمليات بعد.</p>}
          </div>
        </section>

        <section aria-labelledby="attention-heading" className="rounded-2xl border border-border bg-panel">
          <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-3.5"><h2 id="attention-heading" className="text-base font-bold text-foreground">مستحقات قائمة</h2><button type="button" onClick={() => navigate('students')} className="text-xs font-semibold text-olive">عرض الطلاب</button></div>
          <div className="px-2 py-1.5">
            {!loaded ? <div className="p-3"><SkeletonRows rows={3} /></div> : attention.length > 0 ? attention.map((item) => (
              <button key={item.student.id} type="button" onClick={() => selectStudent(item.student.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start hover:bg-highlight">
                <span aria-hidden className="grid size-8 flex-none place-items-center rounded-full bg-olive-weak text-olive"><User className="size-4" /></span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{item.student.name}</span>
                <Money value={item.remaining} currency={false} className="figure flex-none text-sm font-bold text-warn" />
              </button>
            )) : <p className="px-3 py-8 text-center text-sm text-faint">لا توجد مستحقات قائمة.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

function QuickChip({ icon: Icon, label, tone, onClick }: { icon: typeof HandCoins; label: string; tone: 'olive' | 'clay'; onClick: () => void }) {
  const toneClass = tone === 'clay'
    ? 'border-clay/40 bg-clay-weak/50 text-clay hover:bg-clay-weak'
    : 'border-border-strong bg-panel text-muted-foreground hover:bg-highlight hover:text-foreground'
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${toneClass}`}>
      <Icon className="size-4" />
      {label}
    </button>
  )
}
