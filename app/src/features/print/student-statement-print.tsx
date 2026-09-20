import { PrintPreview } from '@/components/print/print-preview'
import { SiteQr } from '@/components/print/site-qr'
import type { LedgerEntry } from '@/lib/aggregate'
import { formatDate, formatNumber, todayIsoDate } from '@/lib/format'

type StudentStatementPrintProps = {
  studentName: string
  courses: number
  entries: LedgerEntry[]
  totalDebit: number
  totalCredit: number
  balance: number
  onClose: () => void
}

const INK = 'text-[#0f172a]'
const MUTED = 'text-[#475569]'
const FAINT = 'text-[#94a3b8]'
const HAIR = 'border-[#e2e8f0]'
const HEAD = 'border-[#cbd5e1]'
const DEBIT = 'text-[#b4530a]'
const CREDIT = 'text-[#15803d]'

export function StudentStatementPrint({ studentName, courses, entries, totalDebit, totalCredit, balance, onClose }: StudentStatementPrintProps) {
  return (
    <PrintPreview
      docTitle="كشف حساب الطالب"
      docTitleEn="Student Statement"
      documentTitle={`كشف حساب الطالب — ${studentName}`}
      onClose={onClose}
      meta={
        <>
          <div className="font-semibold text-[#0f172a]">{studentName}</div>
          <div>التاريخ <span className="figure">{formatDate(todayIsoDate())}</span></div>
          <div>عدد الدورات <span className="figure">{formatNumber(courses)}</span></div>
        </>
      }
    >
      <div className={`grid grid-cols-3 gap-3`}>
        <div className={`rounded-xl border ${HAIR} p-3.5`}>
          <div className={`text-[11px] ${MUTED}`}>إجمالي المستحق</div>
          <div className={`figure mt-1 text-xl font-semibold ${DEBIT}`}>{formatNumber(totalDebit)}</div>
        </div>
        <div className={`rounded-xl border ${HAIR} p-3.5`}>
          <div className={`text-[11px] ${MUTED}`}>إجمالي المسدَّد</div>
          <div className={`figure mt-1 text-xl font-semibold ${CREDIT}`}>{formatNumber(totalCredit)}</div>
        </div>
        <div className="rounded-xl border border-[#f0dcc4] bg-[#fbf3ea] p-3.5">
          <div className={`text-[11px] ${MUTED}`}>الرصيد المستحق</div>
          <div className={`figure mt-1 text-xl font-semibold ${DEBIT}`}>{formatNumber(balance)}</div>
        </div>
      </div>

      <h3 className={`mt-6 mb-2 text-[13px] font-bold ${INK}`}>الحركة بالتتابع الزمني</h3>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className={`text-[10.5px] ${MUTED}`}>
            <th className={`border-b ${HEAD} px-2 py-2 text-start font-semibold`}>التاريخ</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-start font-semibold`}>البيان</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-end font-semibold`}>مدين (عليه)</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-end font-semibold`}>دائن (له)</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-end font-semibold`}>الرصيد الجاري</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className={INK}>
              <td className={`figure border-b ${HAIR} px-2 py-2.5 ${MUTED} whitespace-nowrap`}>{formatDate(entry.date)}</td>
              <td className={`border-b ${HAIR} px-2 py-2.5`}>
                <span className="font-semibold">{entry.label}</span>
                <span className={`${FAINT}`}> · {entry.meta}</span>
              </td>
              <td className={`figure border-b ${HAIR} px-2 py-2.5 text-end ${entry.debit > 0 ? DEBIT + ' font-semibold' : FAINT}`}>{entry.debit > 0 ? formatNumber(entry.debit) : '—'}</td>
              <td className={`figure border-b ${HAIR} px-2 py-2.5 text-end ${entry.credit > 0 ? CREDIT + ' font-semibold' : FAINT}`}>{entry.credit > 0 ? formatNumber(entry.credit) : '—'}</td>
              <td className={`figure border-b ${HAIR} px-2 py-2.5 text-end font-bold`}>{formatNumber(entry.balance)}</td>
            </tr>
          ))}
          {entries.length === 0 ? (
            <tr><td colSpan={5} className={`px-2 py-6 text-center ${MUTED}`}>لا توجد حركات على هذا الطالب.</td></tr>
          ) : null}
        </tbody>
        {entries.length > 0 ? (
          <tfoot>
            <tr className={`${INK} font-bold`}>
              <td className={`border-t-2 ${HEAD} px-2 py-2.5`} colSpan={2}>الإجمالي</td>
              <td className={`figure border-t-2 ${HEAD} px-2 py-2.5 text-end ${DEBIT}`}>{formatNumber(totalDebit)}</td>
              <td className={`figure border-t-2 ${HEAD} px-2 py-2.5 text-end ${CREDIT}`}>{formatNumber(totalCredit)}</td>
              <td className={`figure border-t-2 ${HEAD} px-2 py-2.5 text-end ${DEBIT}`}>{formatNumber(balance)}</td>
            </tr>
          </tfoot>
        ) : null}
      </table>

      <div className="mt-10 flex justify-start">
        <SiteQr />
      </div>
    </PrintPreview>
  )
}
