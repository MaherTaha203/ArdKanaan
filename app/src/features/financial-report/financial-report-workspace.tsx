import { useMemo, useState } from 'react'

import { Ban, Pencil, Printer, RotateCw, Search } from 'lucide-react'
import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { FinancialReportPrint } from '@/features/print/financial-report-print'
import { StudentStatementPrint } from '@/features/print/student-statement-print'
import { VoucherPrint } from '@/features/print/voucher-print'
import { CancelVoucherDialog } from '@/features/financial-report/cancel-voucher-dialog'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { SmartDateInput } from '@/components/ui/smart-date-input'
import { aggregateStudents, externalPartyStatement, financialTotals, paymentCount, receiptCount, studentLedger } from '@/lib/aggregate'
import { formatDate, formatNumber } from '@/lib/format'
import { voucherRef } from '@/lib/voucher'
import type { FinancialMovement } from '@/types/domain'
import { useSettingsStore } from '@/store/use-settings-store'
import { useShellStore, type ReportView } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

type Period = 'all' | 'today' | 'week' | 'month'
const PERIODS: { id: Period; label: string }[] = [
  { id: 'all', label: 'الكل' }, { id: 'today', label: 'اليوم' }, { id: 'week', label: 'هذا الأسبوع' }, { id: 'month', label: 'هذا الشهر' },
]
function partyAndContext(movement: FinancialMovement) {
  const party = movement.movementType === 'receipt' ? movement.partyName ?? '—' : 'المركز'
  return movement.context ? `${party} · ${movement.context}` : party
}
function periodStartIso(period: Period, today = new Date()): string | null {
  if (period === 'all') return null
  const year = today.getFullYear(), month = today.getMonth()
  if (period === 'today') return `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  if (period === 'month') return `${year}-${String(month + 1).padStart(2, '0')}-01`
  const daysSinceSaturday = (today.getDay() + 1) % 7
  const start = new Date(year, month, today.getDate() - daysSinceSaturday)
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
}
export function FinancialReportWorkspace({ view }: { view: ReportView }) {
  const movements = useWorkspaceStore((state) => state.movements)
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const feeObligations = useWorkspaceStore((state) => state.feeObligations)
  const isLoading = useWorkspaceStore((state) => state.isLoading)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)
  const openEditReceipt = useShellStore((state) => state.openEditReceipt)
  const openEditPayment = useShellStore((state) => state.openEditPayment)
  const defaultReportPeriod = useSettingsStore((state) => state.settings.defaultReportPeriod)
  const [period, setPeriod] = useState<Period>(defaultReportPeriod)
  const [printing, setPrinting] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<FinancialMovement | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [printStudentId, setPrintStudentId] = useState<string | null>(null)
  const [accountName, setAccountName] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const studentStatements = useMemo(() => aggregateStudents(students, statementLines, enrollments, feeObligations), [students, statementLines, enrollments, feeObligations])
  const printStudent = useMemo(() => printStudentId ? studentStatements.find((item) => item.student.id === printStudentId) ?? null : null, [studentStatements, printStudentId])
  const printStudentLedger = useMemo(() => printStudentId ? studentLedger(printStudentId, statementLines, enrollments, feeObligations) : { entries: [], totalDebit: 0, totalCredit: 0, balance: 0 }, [printStudentId, statementLines, enrollments, feeObligations])
  const start = fromDate || periodStartIso(period)
  const scoped = useMemo(() => movements.filter((movement) => {
    const fromOk = !start || movement.voucherDate >= start
    const toOk = !toDate || movement.voucherDate <= toDate
    const accountOk = !accountName.trim() || partyAndContext(movement).includes(accountName.trim())
    return fromOk && toOk && accountOk
  }), [movements, start, toDate, accountName])
  const opening = useMemo(() => start ? financialTotals(movements.filter((movement) => movement.voucherDate < start)).net : 0, [movements, start])
  const totals = useMemo(() => financialTotals(scoped), [scoped])
  const viewMovements = useMemo(() => view === 'receipts' ? scoped.filter((m) => m.movementType === 'receipt') : view === 'payments' ? scoped.filter((m) => m.movementType === 'payment') : view === 'external' ? scoped.filter((m) => m.movementType === 'receipt' && (m.externalShare ?? 0) > 0) : scoped, [scoped, view])
  const viewTotal = useMemo(() => viewMovements.reduce((sum, movement) => sum + movement.amount, 0), [viewMovements])
  const viewExternalHeld = useMemo(() => view === 'receipts' ? viewMovements.reduce((sum, movement) => sum + (movement.externalShare ?? 0), 0) : 0, [viewMovements, view])
  const externalStatement = useMemo(() => externalPartyStatement(viewMovements), [viewMovements])
  const printTitle = view === 'receipts' ? 'تقرير المقبوضات' : view === 'payments' ? 'تقرير المدفوعات' : view === 'external' ? 'كشف الجهات الخارجية' : 'كشف الحساب العام'
  const previewMovement = useMemo(() => previewId ? viewMovements.find((movement) => movement.id === previewId) ?? null : null, [previewId, viewMovements])
  // The same figures the old summary band showed — now rendered as compact chips in the
  // toolbar. Pure display; every value below is unchanged.
  const summaryChips: { label: string; value: number; tone?: string }[] =
    view === 'external'
      ? [
          { label: 'لصالح الجهات الخارجية', value: externalStatement.totalExternal },
          { label: 'إجمالي المحصَّل', value: externalStatement.totalAmount },
          { label: 'حصة المركز', value: externalStatement.totalInstitute },
        ]
      : view === 'receipts'
        ? [
            { label: 'إجمالي المقبوضات', value: viewTotal, tone: 'text-gold' },
            ...(viewExternalHeld > 0
              ? [{ label: 'إيراد المعهد', value: viewTotal - viewExternalHeld }, { label: 'لصالح جهة خارجية', value: viewExternalHeld }]
              : []),
          ]
        : view === 'payments'
          ? [{ label: 'إجمالي المدفوعات', value: totals.totalOut, tone: 'text-clay' }]
          : [
              { label: 'صافي الحركة', value: totals.net },
              ...(totals.externalHeld > 0
                ? [{ label: 'مقبوضات المركز', value: totals.instituteRevenue }, { label: 'لصالح جهات خارجية', value: totals.externalHeld }]
                : []),
            ]
  return (
    <div className="space-y-3">
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="editorial text-[clamp(1.2rem,1.9vw,1.45rem)] text-foreground">{printTitle}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="quiet" onClick={() => setPrinting(true)} disabled={!loaded || viewMovements.length === 0 || view === 'external'}><Printer className="size-4" />طباعة</Button>
          <Button variant="outline" onClick={() => void reload()} disabled={isLoading}><RotateCw className="size-4" />{isLoading ? 'جارٍ التحديث…' : 'تحديث'}</Button>
        </div>
      </header>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-xl border border-border bg-highlight/60 px-3 py-2.5">
        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-panel p-1">
          {PERIODS.map((item) => <button key={item.id} type="button" onClick={() => setPeriod(item.id)} aria-pressed={period === item.id} className={`rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${period === item.id ? 'bg-brand-weak text-olive' : 'text-muted-foreground hover:text-foreground'}`}>{item.label}</button>)}
        </div>
        <label className="flex min-w-[170px] flex-1 items-center gap-2 rounded-lg border border-border-strong bg-panel px-3 py-2 focus-within:border-olive">
          <Search aria-hidden className="size-4 flex-none text-faint" />
          <input value={accountName} onChange={(event) => setAccountName(event.target.value)} aria-label="بحث الحساب" placeholder="بحث الحساب…" className="w-full bg-transparent text-sm outline-none placeholder:text-faint" />
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-muted-foreground">من</span>
          <SmartDateInput aria-label="من تاريخ" placeholder="أي تاريخ" className="h-10 w-44" value={fromDate} max={toDate || undefined} onChange={setFromDate} />
          <span className="text-[12px] font-medium text-muted-foreground">إلى</span>
          <SmartDateInput aria-label="إلى تاريخ" placeholder="أي تاريخ" className="h-10 w-44" value={toDate} onChange={setToDate} />
        </div>
        <div className="flex flex-wrap items-center gap-2 md:ms-auto">
          {summaryChips.map((chip) => <div key={chip.label} className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-1.5"><span className="text-[11px] text-faint">{chip.label}</span><Money value={chip.value} currency={false} className={`figure text-[15px] font-bold ${chip.tone ?? 'text-foreground'}`} /></div>)}
        </div>
      </div>
      {isLoading || !loaded ? <SkeletonRows rows={8} /> : view === 'external' ? <section className="border-y border-border"><div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-sm"><thead><tr className="text-[11px] text-faint"><th className="border-b border-border px-4 py-3 text-start">التاريخ</th><th className="border-b border-border px-4 py-3 text-start">رقم السند</th><th className="border-b border-border px-4 py-3 text-start">البيان</th><th className="border-b border-border px-4 py-3 text-end">إجمالي المقبوض</th><th className="border-b border-border px-4 py-3 text-end">حصة المركز</th><th className="border-b border-border px-4 py-3 text-end">لصالح الجهة الخارجية</th></tr></thead><tbody>{externalStatement.lines.map((line) => <tr key={line.id}><td className="figure border-b border-border px-4 py-3">{formatDate(line.voucherDate)}</td><td className="figure border-b border-border px-4 py-3">{voucherRef('receipt', line.voucherNumber)}</td><td className="border-b border-border px-4 py-3 text-muted-foreground">{line.context ? `${line.party} · ${line.context}` : line.party}</td><td className="figure border-b border-border px-4 py-3 text-end font-semibold">{formatNumber(line.amount)}</td><td className="figure border-b border-border px-4 py-3 text-end">{formatNumber(line.instituteShare)}</td><td className="figure border-b border-border px-4 py-3 text-end font-semibold text-gold">{formatNumber(line.externalShare)}</td></tr>)}{externalStatement.lines.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-faint">لا توجد مبالغ لجهات خارجية في هذه الفترة.</td></tr> : null}</tbody>{externalStatement.lines.length > 0 ? <tfoot><tr className="font-semibold"><td className="border-t border-border-strong px-4 py-3" colSpan={3}>الإجمالي</td><td className="figure border-t border-border-strong px-4 py-3 text-end">{formatNumber(externalStatement.totalAmount)}</td><td className="figure border-t border-border-strong px-4 py-3 text-end">{formatNumber(externalStatement.totalInstitute)}</td><td className="figure border-t border-border-strong px-4 py-3 text-end text-gold">{formatNumber(externalStatement.totalExternal)}</td></tr></tfoot> : null}</table></div></section> : <section className="border-y border-border"><div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-sm"><thead><tr className="text-[11px] text-faint"><th className="border-b border-border px-4 py-3 text-start">التاريخ</th><th className="border-b border-border px-4 py-3 text-start">رقم السند</th><th className="border-b border-border px-4 py-3 text-start">البيان</th><th className="border-b border-border px-4 py-3 text-end">المبلغ</th><th className="border-b border-border px-4 py-3 text-start">إجراء</th></tr></thead><tbody>{viewMovements.map((movement) => <tr key={`${movement.movementType}-${movement.id}`}><td className="figure border-b border-border px-4 py-3">{formatDate(movement.voucherDate)}</td><td className="figure border-b border-border px-4 py-3">{voucherRef(movement.movementType, movement.voucherNumber)}</td><td className="border-b border-border px-4 py-3 text-muted-foreground">{partyAndContext(movement)}</td><td className={`figure border-b border-border px-4 py-3 text-end font-semibold ${movement.movementType === 'receipt' ? 'text-gold' : 'text-clay'}`}>{formatNumber(movement.amount)}</td><td className="border-b border-border px-4 py-3"><div className="flex flex-wrap gap-2"><Button variant="quiet" size="sm" onClick={() => setPreviewId(movement.id)}>معاينة</Button>{movement.movementType === 'receipt' ? <Button variant="quiet" size="sm" onClick={() => openEditReceipt(movement.id)}><Pencil className="size-4" />تعديل</Button> : <Button variant="quiet" size="sm" onClick={() => openEditPayment(movement.id)}><Pencil className="size-4" />تعديل</Button>}<Button variant="quiet" size="sm" aria-label={`إبطال سند ${movement.movementType === 'receipt' ? 'القبض' : 'الصرف'} رقم ${voucherRef(movement.movementType, movement.voucherNumber)}`} onClick={() => setCancelTarget(movement)}><Ban className="size-4" />إبطال</Button></div></td></tr>)}{viewMovements.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-faint">لا توجد حركات في هذه الفترة.</td></tr> : null}</tbody></table></div></section>}
      {previewMovement ? <VoucherPrint movement={previewMovement} onClose={() => setPreviewId(null)} /> : null}
      {printing ? <FinancialReportPrint view={view} title={printTitle} net={totals.net} totalIn={totals.totalIn} totalOut={totals.totalOut} opening={opening} receiptCount={receiptCount(scoped)} paymentCount={paymentCount(scoped)} movements={scoped} externalHeld={totals.externalHeld} instituteRevenue={totals.instituteRevenue} onClose={() => setPrinting(false)} /> : null}
      {printStudent ? <StudentStatementPrint studentName={printStudent.student.name} courses={printStudent.courses} entries={printStudentLedger.entries} totalDebit={printStudentLedger.totalDebit} totalCredit={printStudentLedger.totalCredit} balance={printStudentLedger.balance} onClose={() => setPrintStudentId(null)} /> : null}
      {cancelTarget ? <CancelVoucherDialog movement={cancelTarget} onClose={() => setCancelTarget(null)} onCancelled={async () => { setCancelTarget(null); setPreviewId(null); await reload() }} /> : null}
    </div>
  )
}
