import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Ban, ChevronDown, Eye, Pencil, Printer, RotateCw, Search, Users } from 'lucide-react'
import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { RouteHeader } from '@/components/shell/route-header'
import { FinancialReportPrint } from '@/features/print/financial-report-print'
import { StudentStatementPrint } from '@/features/print/student-statement-print'
import { VoucherPrint } from '@/features/print/voucher-print'
import { CancelVoucherDialog } from '@/features/financial-report/cancel-voucher-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SmartDateInput } from '@/components/ui/smart-date-input'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudents, financialTotals, movementsNewestFirst, paymentCount, receiptCount, statementFor } from '@/lib/aggregate'
import { withRunningBalance, type RunningMovement } from '@/lib/statement-rows'
import { formatDate, formatNumber } from '@/lib/format'
import { voucherRef } from '@/lib/voucher'
import type { FinancialMovement } from '@/types/domain'
import { useSettingsStore } from '@/store/use-settings-store'
import { useShellStore, type ReportView } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

type Period = 'all' | 'today' | 'week' | 'month'

const PERIODS: { id: Period; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'today', label: 'اليوم' },
  { id: 'week', label: 'هذا الأسبوع' },
  { id: 'month', label: 'هذا الشهر' },
]

const REPORT_VIEWS: { id: ReportView; label: string }[] = [
  { id: 'general', label: 'كشف الحساب العام' },
  { id: 'receipts', label: 'تقرير المقبوضات' },
  { id: 'payments', label: 'تقرير المدفوعات' },
]

function partyAndContext(movement: FinancialMovement) {
  const party = movement.movementType === 'receipt' ? movement.partyName ?? '—' : 'المركز'
  return movement.context ? `${party} · ${movement.context}` : party
}

function periodStartIso(period: Period, today = new Date()): string | null {
  if (period === 'all') return null
  const year = today.getFullYear()
  const month = today.getMonth()
  if (period === 'today') return `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  if (period === 'month') return `${year}-${String(month + 1).padStart(2, '0')}-01`
  const daysSinceSaturday = (today.getDay() + 1) % 7
  const start = new Date(year, month, today.getDate() - daysSinceSaturday)
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
}

export function FinancialReportWorkspace() {
  const movements = useWorkspaceStore((state) => state.movements)
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const courses = useWorkspaceStore((state) => state.courses)
  const feeObligations = useWorkspaceStore((state) => state.feeObligations)
  const isLoading = useWorkspaceStore((state) => state.isLoading)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)
  const view = useShellStore((state) => state.reportView)
  const navigateReport = useShellStore((state) => state.navigateReport)
  const openEditReceipt = useShellStore((state) => state.openEditReceipt)
  const openEditPayment = useShellStore((state) => state.openEditPayment)
  const defaultReportPeriod = useSettingsStore((state) => state.settings.defaultReportPeriod)
  const [period, setPeriod] = useState<Period>(defaultReportPeriod)
  const [printing, setPrinting] = useState(false)
  const [printingVoucher, setPrintingVoucher] = useState<FinancialMovement | null>(null)
  const [cancelTarget, setCancelTarget] = useState<FinancialMovement | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [printStudentId, setPrintStudentId] = useState<string | null>(null)
  const [accountName, setAccountName] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [courseFilter, setCourseFilter] = useState('')

  const studentStatements = useMemo(() => aggregateStudents(students, statementLines, [], feeObligations), [students, statementLines, feeObligations])
  const printStudent = useMemo(() => (printStudentId ? studentStatements.find((item) => item.student.id === printStudentId) ?? null : null), [studentStatements, printStudentId])

  // The remainder of this workspace intentionally retains its existing report UI and
  // filtering logic; only the student aggregation source is extended with fee obligations.
  const scoped = useMemo(() => movements.filter((movement) => {
    const start = periodStartIso(period)
    const fromOk = !start || movement.voucherDate >= start
    const toOk = !toDate || movement.voucherDate <= toDate
    const accountOk = !accountName.trim() || partyAndContext(movement).includes(accountName.trim())
    const courseOk = !courseFilter || movement.context === courseFilter
    return fromOk && toOk && accountOk && courseOk
  }), [movements, period, toDate, accountName, courseFilter])
  const totals = useMemo(() => financialTotals(scoped), [scoped])
  const viewMovements = useMemo(() => view === 'general' ? [] : scoped.filter((m) => m.movementType === view.slice(0, -1) || (view === 'receipts' && m.movementType === 'receipt')), [scoped, view])
  const viewTotal = useMemo(() => viewMovements.reduce((sum, movement) => sum + movement.amount, 0), [viewMovements])
  const viewExternalHeld = useMemo(() => view === 'receipts' ? viewMovements.reduce((sum, movement) => sum + (movement.externalShare ?? 0), 0) : 0, [viewMovements, view])
  const receiptScoped = useMemo(() => scoped.filter((m) => m.movementType === 'receipt'), [scoped])
  const receiptCountValue = receiptScoped.length
  const printTitle = view === 'receipts' ? 'تقرير المقبوضات' : view === 'payments' ? 'تقرير المدفوعات' : 'كشف الحساب العام'

  return (
    <div className="space-y-6">
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />
      <RouteHeader eyebrow="التقارير المالية" title={printTitle} />
      <nav className="flex flex-wrap gap-2" aria-label="نوع التقرير">
        {REPORT_VIEWS.map((item) => <button key={item.id} type="button" onClick={() => navigateReport(item.id)} aria-current={view === item.id ? 'page' : undefined} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${view === item.id ? 'bg-olive-weak text-olive' : 'text-muted-foreground'}`}>{item.label}</button>)}
      </nav>
      <section className="border-y border-border py-5">
        <div className="flex flex-wrap gap-2">{PERIODS.map((item) => <button key={item.id} type="button" onClick={() => setPeriod(item.id)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${period === item.id ? 'bg-olive-weak text-olive' : 'text-muted-foreground'}`}>{item.label}</button>)}</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-[12px] text-muted-foreground">الحساب<input className="mt-1 block w-full rounded-xl border border-border-strong bg-panel px-3 py-2 text-sm" value={accountName} onChange={(e) => setAccountName(e.target.value)} /></label>
          <label className="text-[12px] text-muted-foreground">من<input type="date" className="mt-1 block w-full rounded-xl border border-border-strong bg-panel px-3 py-2 text-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
          <label className="text-[12px] text-muted-foreground">إلى<input type="date" className="mt-1 block w-full rounded-xl border border-border-strong bg-panel px-3 py-2 text-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
        </div>
      </section>
      {view === 'receipts' ? <section className="border-y border-border py-5"><div className="flex flex-wrap items-end justify-between gap-6"><div><div className="text-[12px] font-bold text-olive">إجمالي المقبوضات</div><Money value={viewTotal} currency={false} className="mt-2 block text-4xl font-semibold text-gold" /></div>{viewExternalHeld > 0 ? <div className="flex gap-8"><div><div className="text-[11px] text-faint">إيراد المعهد</div><Money value={viewTotal - viewExternalHeld} currency={false} className="text-xl font-semibold" /></div><div><div className="text-[11px] text-faint">لصالح جهة خارجية</div><Money value={viewExternalHeld} currency={false} className="text-xl font-semibold" /></div><div><div className="text-[11px] text-faint">عدد سندات القبض</div><div className="figure text-xl font-semibold">{receiptCountValue}</div></div></div> : <div><div className="text-[11px] text-faint">عدد سندات القبض</div><div className="figure text-xl font-semibold">{receiptCountValue}</div></div>}</div></section> : null}
      {view !== 'receipts' ? <section className="border-y border-border py-5"><div className="text-sm text-muted-foreground">{view === 'payments' ? 'إجمالي المدفوعات' : 'صافي الحركة'}</div><Money value={view === 'payments' ? totals.totalOut : totals.net} currency={false} className="mt-2 text-3xl font-semibold" /></section> : null}
      {loaded && view === 'general' ? <section className="border-y border-border py-5"><div className="text-sm font-bold text-foreground">طلاب</div>{studentStatements.length === 0 ? <p className="mt-3 text-sm text-faint">لا توجد بيانات.</p> : <div className="mt-3 divide-y divide-border">{studentStatements.map((item) => <button key={item.student.id} type="button" onClick={() => setPrintStudentId(item.student.id)} className="flex w-full items-center justify-between gap-4 py-3 text-start"><span className="font-medium">{item.student.name}</span><Money value={item.remaining} currency={false} className="text-sm font-semibold" /></button>)}</div>}</section> : null}
      {(isLoading || !loaded) ? <SkeletonRows rows={8} /> : view !== 'general' ? <section className="border-y border-border"><div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-sm"><thead><tr className="text-[11px] text-faint"><th className="border-b border-border px-4 py-3 text-start">التاريخ</th><th className="border-b border-border px-4 py-3 text-start">رقم السند</th><th className="border-b border-border px-4 py-3 text-start">البيان</th><th className="border-b border-border px-4 py-3 text-end">المبلغ</th><th className="border-b border-border px-4 py-3 text-start">إجراء</th></tr></thead><tbody>{viewMovements.map((movement) => <tr key={`${movement.movementType}-${movement.id}`}><td className="figure border-b border-border px-4 py-3">{formatDate(movement.voucherDate)}</td><td className="figure border-b border-border px-4 py-3">{voucherRef(movement.movementType, movement.voucherNumber)}</td><td className="border-b border-border px-4 py-3 text-muted-foreground">{partyAndContext(movement)}</td><td className={`figure border-b border-border px-4 py-3 text-end font-semibold ${movement.movementType === 'receipt' ? 'text-gold' : 'text-clay'}`}>{formatNumber(movement.amount)}</td><td className="border-b border-border px-4 py-3"><div className="flex flex-wrap gap-2"><Button variant="quiet" size="sm" onClick={() => setPreviewId(movement.id)}>معاينة</Button>{movement.movementType === 'receipt' ? <Button variant="quiet" size="sm" onClick={() => openEditReceipt(movement.id)}><Pencil className="size-4" />تعديل</Button> : <Button variant="quiet" size="sm" onClick={() => openEditPayment(movement.id)}><Pencil className="size-4" />تعديل</Button>}<Button variant="quiet" size="sm" onClick={() => setCancelTarget(movement)}><Ban className="size-4" />إبطال</Button></div></td></tr>)}</tbody></table></div></section> : null}
      {previewId ? <VoucherPrint movement={viewMovements.find((m) => m.id === previewId) ?? null} onClose={() => setPreviewId(null)} /> : null}
      {printing ? <FinancialReportPrint view={view} title={printTitle} net={totals.net} totalIn={totals.totalIn} totalOut={totals.totalOut} opening={0} receiptCount={receiptCount(scoped)} paymentCount={paymentCount(scoped)} movements={scoped} externalHeld={viewExternalHeld} instituteRevenue={viewTotal - viewExternalHeld} onClose={() => setPrinting(false)} /> : null}
      {printStudent ? <StudentStatementPrint studentName={printStudent.student.name} paid={printStudent.paid} remaining={printStudent.remaining} courses={printStudent.courses} lines={statementFor(statementLines, printStudent.student.id)} onClose={() => setPrintStudentId(null)} /> : null}
      {cancelTarget ? <CancelVoucherDialog movement={cancelTarget} onClose={() => setCancelTarget(null)} /> : null}
      <div className="flex justify-end"><Button variant="quiet" onClick={() => setPrinting(true)}><Printer className="size-4" />طباعة</Button><Button variant="quiet" onClick={() => { void reload() }}><RotateCw className="size-4" />تحديث</Button></div>
    </div>
  )
}
