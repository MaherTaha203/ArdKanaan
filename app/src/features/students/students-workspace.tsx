import { useMemo, useState } from 'react'

import { Archive, Pencil, Plus, Printer, RotateCcw, Search } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { StudentTabs } from '@/features/students/student-tabs'
import { StudentStatementPrint } from '@/features/print/student-statement-print'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { aggregateStudents, statementFor, studentLedger, type StudentAggregate } from '@/lib/aggregate'
import { formatDate, formatNumber } from '@/lib/format'
import { normalizeArabic } from '@/lib/text'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import './detail-table.css'

const REMAINING_EPSILON = 0.0001

type StudentStatus = 'ok' | 'due' | 'none'

function statusOf(item: StudentAggregate): StudentStatus {
  if (item.remaining <= REMAINING_EPSILON) return 'ok'
  if (item.paid <= REMAINING_EPSILON) return 'none'
  return 'due'
}

export function StudentsWorkspace() {
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const feeObligations = useWorkspaceStore((state) => state.feeObligations)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)

  const selectedStudentId = useShellStore((state) => state.selectedStudentId)
  const selectStudent = useShellStore((state) => state.selectStudent)
  const openEditStudent = useShellStore((state) => state.openEditStudent)
  const openArchive = useShellStore((state) => state.openArchive)
  const openStudentFee = useShellStore((state) => state.openStudentFee)
  const navigateStudents = useShellStore((state) => state.navigateStudents)

  const [query, setQuery] = useState('')
  const [printing, setPrinting] = useState(false)

  const aggregates = useMemo(() => aggregateStudents(students, statementLines, enrollments, feeObligations), [students, statementLines, enrollments, feeObligations])

  const sorted = useMemo(
    () => aggregates.slice().sort((a, b) => b.remaining - a.remaining || a.student.name.localeCompare(b.student.name, 'ar')),
    [aggregates],
  )

  const filtered = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return sorted
    const term = normalizeArabic(trimmed)
    const digits = trimmed.replace(/\D/g, '')
    return sorted.filter((item) => {
      const { name, phone, idNumber } = item.student
      if (normalizeArabic(name).includes(term)) return true
      if (digits.length > 0) {
        const phoneHit = phone ? phone.replace(/\D/g, '').includes(digits) : false
        const idHit = idNumber ? idNumber.replace(/\D/g, '').includes(digits) : false
        if (phoneHit || idHit) return true
      }
      return statementFor(statementLines, item.student.id).some((line) => normalizeArabic(line.courseName).includes(term))
    })
  }, [sorted, query, statementLines])

  const activeId = selectedStudentId ?? filtered[0]?.student.id ?? sorted[0]?.student.id ?? null
  const active = useMemo(() => aggregates.find((item) => item.student.id === activeId) ?? null, [aggregates, activeId])
  const activeLedger = useMemo(() => (activeId ? studentLedger(activeId, statementLines, enrollments, feeObligations) : { entries: [], totalDebit: 0, totalCredit: 0, balance: 0 }), [activeId, statementLines, enrollments, feeObligations])

  return (
    <div className="detail-workspace">
      <header className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="editorial text-[clamp(1.2rem,1.9vw,1.45rem)] text-foreground">كشف الحساب</h1>
        <StudentTabs active="statement" onPick={navigateStudents} />
      </header>
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

      <div className="grid gap-6 md:grid-cols-[380px_minmax(0,1fr)]">
        <div>
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-border-strong bg-panel px-3.5 py-2.5 shadow-sm focus-within:border-olive">
            <Search aria-hidden className="size-4 flex-none text-faint" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && filtered[0]) selectStudent(filtered[0].student.id) }} aria-label="البحث عن طالب" placeholder="الاسم أو الهاتف أو الرقم التعريفي أو الدورة" className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-faint" />
          </div>

          <div className="border-t border-border-strong">
            {!loaded ? <div className="p-3"><SkeletonRows rows={6} /></div> : filtered.length > 0 ? filtered.map((item) => <StudentRow key={item.student.id} item={item} active={item.student.id === activeId} onSelect={() => selectStudent(item.student.id)} />) : <p className="px-4 py-8 text-center text-sm text-faint">{students.length === 0 ? 'لا يوجد طلاب بعد.' : 'لا نتائج مطابقة.'}</p>}
          </div>
        </div>

        <section className="min-w-0 border-y border-border py-6" aria-label={`كشف حساب ${active?.student.name ?? ''}`}>
          {active ? (
            <>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-4 border-b border-border pb-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="editorial text-2xl text-foreground">{active.student.name}</h2>
                    {active.student.status === 'archived' ? <span className="rounded-full border border-border-strong bg-highlight px-2 py-0.5 text-[11px] font-medium text-muted-foreground">مؤرشف</span> : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px]">
                    <span><span className="text-faint">الدورات</span> <span className="figure font-semibold text-foreground">{formatNumber(active.courses)}</span></span>
                    <span><span className="text-faint">آخر حركة</span> <span className="figure font-semibold text-foreground">{active.lastActivity ? formatDate(active.lastActivity) : '—'}</span></span>
                    {active.student.idNumber ? <span><span className="text-faint">الرقم التعريفي</span> <span className="figure font-semibold text-foreground" dir="ltr">{active.student.idNumber}</span></span> : null}
                    {active.student.phone ? <span><span className="text-faint">الهاتف</span> <span className="figure font-semibold text-foreground" dir="ltr">{active.student.phone}</span></span> : null}
                  </div>
                </div>
                <div className="flex gap-8"><RecordFigure label="المسدَّد" value={active.paid} tone="ink" /><RecordFigure label="الرصيد المستحق" value={active.remaining} tone="warn" /></div>
              </div>

              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-foreground">كشف الحساب الجاري</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="quiet" size="sm" onClick={() => openStudentFee(active.student.id)}><Plus className="size-4" />إضافة رسم</Button>
                  <Button variant="quiet" size="sm" onClick={() => openEditStudent(active.student.id)}><Pencil className="size-4" />تعديل بيانات الطالب</Button>
                  {active.student.status === 'active' ? <Button variant="quiet" size="sm" onClick={() => openArchive(active.student.id)}><Archive className="size-4" />أرشفة الطالب</Button> : null}
                  {active.student.status === 'archived' ? <Button variant="quiet" size="sm" onClick={() => openArchive(active.student.id)}><RotateCcw className="size-4" />إعادة التفعيل</Button> : null}
                  <Button variant="quiet" size="sm" onClick={() => setPrinting(true)}><Printer className="size-4" />طباعة الكشف</Button>
                </div>
              </div>

              <div className="detail-table-wrap">
                <table className="border-collapse text-sm">
                  <thead><tr className="text-[11.5px] tracking-wide text-faint">
                    <th className="border-b border-border px-2.5 py-3 text-start font-semibold">التاريخ</th>
                    <th className="border-b border-border px-2.5 py-3 text-start font-semibold">البيان</th>
                    <th className="border-b border-border px-2.5 py-3 text-end font-semibold">مدين (عليه)</th>
                    <th className="border-b border-border px-2.5 py-3 text-end font-semibold">دائن (له)</th>
                    <th className="border-b border-border px-2.5 py-3 text-end font-semibold">الرصيد الجاري</th>
                  </tr></thead>
                  <tbody>{activeLedger.entries.length > 0 ? activeLedger.entries.map((entry) => <tr key={entry.id}>
                    <td className="figure whitespace-nowrap border-b border-border px-2.5 py-3.5 text-muted-foreground">{formatDate(entry.date)}</td>
                    <td className="border-b border-border px-2.5 py-3.5"><span className="font-medium text-foreground">{entry.label}</span><span className="text-faint"> · {entry.meta}</span></td>
                    <td className={`figure border-b border-border px-2.5 py-3.5 text-end ${entry.debit > 0 ? 'font-semibold text-warn' : 'text-faint'}`}>{entry.debit > 0 ? formatNumber(entry.debit) : '—'}</td>
                    <td className={`figure border-b border-border px-2.5 py-3.5 text-end ${entry.credit > 0 ? 'font-semibold text-gold' : 'text-faint'}`}>{entry.credit > 0 ? formatNumber(entry.credit) : '—'}</td>
                    <td className="figure border-b border-border px-2.5 py-3.5 text-end font-bold text-foreground">{formatNumber(entry.balance)}</td>
                  </tr>) : <tr><td colSpan={5} className="px-2.5 py-10 text-center text-sm text-faint">لا توجد حركات.</td></tr>}</tbody>
                </table>
              </div>
            </>
          ) : <div className="py-16 text-center text-sm text-faint">{loaded ? 'لا يوجد طلاب.' : 'جارٍ التحميل…'}</div>}
        </section>
      </div>

      {printing && active ? <StudentStatementPrint studentName={active.student.name} courses={active.courses} entries={activeLedger.entries} totalDebit={activeLedger.totalDebit} totalCredit={activeLedger.totalCredit} balance={activeLedger.balance} onClose={() => setPrinting(false)} /> : null}
    </div>
  )
}

function StudentRow({ item, active, onSelect }: { item: StudentAggregate; active: boolean; onSelect: () => void }) {
  const status = statusOf(item)
  const statusLabel = status === 'ok' ? 'مسدَّد بالكامل' : status === 'due' ? 'رصيد مستحق' : 'غير مسدَّد'
  return <div className={`border-b border-border last:border-b-0 ${active ? 'bg-highlight' : ''}`}>
    <button type="button" onClick={onSelect} aria-current={active ? 'true' : undefined} className="flex w-full min-w-0 items-center gap-3 py-2.5 pe-3 ps-4 text-start">
      <span className="grid size-8 flex-none place-items-center rounded-full bg-olive-weak text-[13px] font-bold text-olive">{item.student.name.charAt(0)}</span>
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.student.name}</span>
      {item.student.status === 'archived' ? <span className="rounded-full border border-border-strong bg-highlight px-1.5 py-0.5 text-[10px] font-medium text-faint">مؤرشف</span> : null}
      <span className="text-[11px] font-medium text-muted-foreground">{statusLabel}</span>
      {item.remaining > REMAINING_EPSILON ? <Money value={item.remaining} currency={false} className="text-xs font-semibold text-warn" /> : null}
    </button>
  </div>
}

function RecordFigure({ label, value, tone }: { label: string; value: number; tone: 'ink' | 'warn' }) {
  return <div><div className="text-[11px] font-medium text-faint">{label}</div><Money value={value} currency={false} className={`text-xl font-semibold ${tone === 'warn' && value > 0 ? 'text-warn' : 'text-foreground'}`} /></div>
}
