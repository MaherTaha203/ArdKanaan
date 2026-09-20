import { useMemo, useState } from 'react'

import { Ban, Pencil, Printer, RotateCw } from 'lucide-react'
import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { RouteHeader } from '@/components/shell/route-header'
import { FinancialReportPrint } from '@/features/print/financial-report-print'
import { StudentStatementPrint } from '@/features/print/student-statement-print'
import { VoucherPrint } from '@/features/print/voucher-print'
import { CancelVoucherDialog } from '@/features/financial-report/cancel-voucher-dialog'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudents, financialTotals, paymentCount, receiptCount, statementFor, studentDues } from '@/lib/aggregate'
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
const REPORT_VIEWS: { id: ReportView; label: string }[] = [
  { id: 'general', label: 'كشف الحساب العام' }, { id: 'receipts', label: 'تقرير المقبوضات' }, { id: 'payments', label: 'تقرير المدفوعات' },
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
export function FinancialReportWorkspace() {
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
  const view = useShellStore((state) => state.reportView)
  const navigateReport = useShellStore((state) => state.navigateReport)
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
  const printStudentDues = useMemo(() => printStudentId ? studentDues(printStudentId, statementLines, enrollments, feeObligations) : { courseDues: [], fees: [] }, [printStudentId, statementLines, enrollments, feeObligations])
  const start = fromDate || periodStartIso(period)
  const scoped = useMemo(() => movements.filter((movement) => {
    const fromOk = !start || movement.voucherDate >= start
    const toOk = !toDate || movement.voucherDate <= toDate
    const accountOk = !accountName.trim() || partyAndContext(movement).includes(accountName.trim())
    return fromOk && toOk && accountOk
  }), [movements, start, toDate, accountName])
  const opening = useMemo(() => start ? financialTotals(movements.filter((movement) => movement.voucherDate < start)).net : 0, [movements, start])
  const totals = useMemo(() => financialTotals(scoped), [scoped])
  const viewMovements = useMemo(() => view === 'receipts' ? scoped.filter((m) => m.movementType === 'receipt') : view === 'payments' ? scoped.filter((m) => m.movementType === 'payment') : scoped, [scoped, view])
  const viewTotal = useMemo(() => viewMovements.reduce((sum, movement) => sum + movement.amount, 0), [viewMovements])
  const viewExternalHeld = useMemo(() => view === 'receipts' ? viewMovements.reduce((sum, movement) => sum + (movement.externalShare ?? 0), 0) : 0, [viewMovements, view])
  const printTitle = view === 'receipts' ? 'تقرير المقبوضات' : view === 'payments' ? 'تقرير المدفوعات' : 'كشف الحساب العام'
  const previewMovement = useMemo(() => previewId ? viewMovements.find((movement) => movement.id === previewId) ?? null : null, [previewId, viewMovements])
  return (
    <div className="space-y-6">
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />
      <RouteHeader eyebrow="التقارير المالية" title={printTitle} actions={<><Button variant="quiet" onClick={() => setPrinting(true)} disabled={!loaded || viewMovements.length === 0}><Printer className="size-4" />طباعة</Button><Button variant="outline" onClick={() => void reload()} disabled={isLoading}><RotateCw className="size-4" />{isLoading ? 'جارٍ التحديث…' : 'تحديث'}</Button></>} />
      <nav className="flex flex-wrap gap-2" aria-label="نوع التقرير">{REPORT_VIEWS.map((item) => <button key={item.id} type="button" onClick={() => navigateReport(item.id)} aria-current={view === item.id ? 'page' : undefined} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${view === item.id ? 'bg-olive-weak text-olive' : 'text-muted-foreground'}`}>{item.label}</button>)}</nav>
      <section className="border-y border-border py-5"><div className="flex flex-wrap gap-2">{PERIODS.map((item) => <button key={item.id} type="button" onClick={() => setPeriod(item.id)} aria-pressed={period === item.id} className={`rounded-full px-3 py-1.5 text-xs font-medium ${period === item.id ? 'bg-olive-weak text-olive' : 'text-muted-foreground'}`}>{item.label}</button>)}</div><div className="mt-4 grid gap-3 md:grid-cols-3"><label className="text-[12px] text-muted-foreground">الحساب<input className="mt-1 block w-full rounded-xl border border-border-strong bg-panel px-3 py-2 text-sm" value={accountName} onChange={(event) => setAccountName(event.target.value)} /></label><label className="text-[12px] text-muted-foreground">من<input type="date" className="mt-1 block w-full rounded-xl border border-border-strong bg-panel px-3 py-2 text-sm" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label><label className="text-[12px] text-muted-foreground">إلى<input type="date" className="mt-1 block w-full rounded-xl border border-border-strong bg-panel px-3 py-2 text-sm" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label></div></section>
      <section className="border-y border-border py-5"><div className="text-sm text-muted-foreground">{view === 'receipts' ? 'إجمالي المقبوضات' : view === 'payments' ? 'إجمالي المدفوعات' : 'صافي الحركة'}</div><Money value={view === 'receipts' ? viewTotal : view === 'payments' ? totals.totalOut : totals.net} currency={false} className="mt-2 text-3xl font-semibold" />{view === 'receipts' && viewExternalHeld > 0 ? <div className="mt-4 flex gap-8"><div><div className="text-[11px] text-faint">إيراد المعهد</div><Money value={viewTotal - viewExternalHeld} currency={false} className="text-xl font-semibold" /></div><div><div className="text-[11px] text-faint">لصالح جهة خارجية</div><Money value={viewExternalHeld} currency={false} className="text-xl font-semibold" /></div></div> : null}</section>
      {isLoading || !loaded ? <SkeletonRows rows={8} /> : <section className="border-y border-border"><div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-sm"><thead><tr className="text-[11px] text-faint"><th className="border-b border-border px-4 py-3 text-start">التاريخ</th><th className="border-b border-border px-4 py-3 text-start">رقم السند</th><th className="border-b border-border px-4 py-3 text-start">البيان</th><th className="border-b border-border px-4 py-3 text-end">المبلغ</th><th className="border-b border-border px-4 py-3 text-start">إجراء</th></tr></thead><tbody>{viewMovements.map((movement) => <tr key={`${movement.movementType}-${movement.id}`}><td className="figure border-b border-border px-4 py-3">{formatDate(movement.voucherDate)}</td><td className="figure border-b border-border px-4 py-3">{voucherRef(movement.movementType, movement.voucherNumber)}</td><td className="border-b border-border px-4 py-3 text-muted-foreground">{partyAndContext(movement)}</td><td className={`figure border-b border-border px-4 py-3 text-end font-semibold ${movement.movementType === 'receipt' ? 'text-gold' : 'text-clay'}`}>{formatNumber(movement.amount)}</td><td className="border-b border-border px-4 py-3"><div className="flex flex-wrap gap-2"><Button variant="quiet" size="sm" onClick={() => setPreviewId(movement.id)}>معاينة</Button>{movement.movementType === 'receipt' ? <Button variant="quiet" size="sm" onClick={() => openEditReceipt(movement.id)}><Pencil className="size-4" />تعديل</Button> : <Button variant="quiet" size="sm" onClick={() => openEditPayment(movement.id)}><Pencil className="size-4" />تعديل</Button>}<Button variant="quiet" size="sm" aria-label={`إبطال سند ${movement.movementType === 'receipt' ? 'القبض' : 'الصرف'} رقم ${voucherRef(movement.movementType, movement.voucherNumber)}`} onClick={() => setCancelTarget(movement)}><Ban className="size-4" />إبطال</Button></div></td></tr>)}{viewMovements.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-faint">لا توجد حركات في هذه الفترة.</td></tr> : null}</tbody></table></div></section>}
      {previewMovement ? <VoucherPrint movement={previewMovement} onClose={() => setPreviewId(null)} /> : null}
      {printing ? <FinancialReportPrint view={view} title={printTitle} net={totals.net} totalIn={totals.totalIn} totalOut={totals.totalOut} opening={opening} receiptCount={receiptCount(scoped)} paymentCount={paymentCount(scoped)} movements={scoped} externalHeld={viewExternalHeld} instituteRevenue={view === 'receipts' ? viewTotal - viewExternalHeld : 0} onClose={() => setPrinting(false)} /> : null}
      {printStudent ? <StudentStatementPrint studentName={printStudent.student.name} paid={printStudent.paid} remaining={printStudent.remaining} courses={printStudent.courses} lines={statementFor(statementLines, printStudent.student.id)} courseDues={printStudentDues.courseDues} fees={printStudentDues.fees} onClose={() => setPrintStudentId(null)} /> : null}
      {cancelTarget ? <CancelVoucherDialog movement={cancelTarget} onClose={() => setCancelTarget(null)} onCancelled={async () => { setCancelTarget(null); setPreviewId(null); await reload() }} /> : null}
    </div>
  )
}
