import { PrintPreview } from '@/components/print/print-preview'
import { SiteQr } from '@/components/print/site-qr'
import type { StatementFee, StudentCourseBreakdown } from '@/lib/aggregate'
import { formatDate, formatNumber, todayIsoDate } from '@/lib/format'
import { voucherRef } from '@/lib/voucher'
import type { FeeCategory, StudentStatementLine } from '@/types/domain'

type StudentStatementPrintProps = {
  studentName: string
  paid: number
  remaining: number
  courses: number
  lines: StudentStatementLine[]
  courseDues?: StudentCourseBreakdown[]
  fees?: StatementFee[]
  onClose: () => void
}

const INK = 'text-[#0f172a]'
const MUTED = 'text-[#475569]'
const HAIR = 'border-[#e2e8f0]'
const HEAD = 'border-[#cbd5e1]'

function beneficiaryLabel(category: FeeCategory): string {
  return category === 'institute' ? 'للمعهد' : category === 'external' ? 'لجهة خارجية' : 'مشترك'
}

export function StudentStatementPrint({ studentName, paid, remaining, courses, lines, courseDues = [], fees = [], onClose }: StudentStatementPrintProps) {
  // The obligations owed by the student — course dues and every open fee — shown
  // in full so the statement reflects what is due even before any payment.
  const dueRows = [
    ...courseDues.map((course) => ({ key: `course-${course.enrollmentId ?? course.courseName}`, label: `دورة · ${course.courseName}`, total: course.fee, paid: course.paid, remaining: course.remaining })),
    ...fees.map((fee) => ({ key: `fee-${fee.id}`, label: `رسم · ${fee.description} · ${fee.courseName ?? 'بدون دورة'} · ${beneficiaryLabel(fee.feeCategory)}`, total: fee.amount, paid: fee.paid, remaining: fee.remaining })),
  ]
  const duesTotal = dueRows.reduce((sum, row) => sum + row.total, 0)
  const duesPaid = dueRows.reduce((sum, row) => sum + row.paid, 0)
  const duesRemaining = dueRows.reduce((sum, row) => sum + row.remaining, 0)

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
      <div className={`grid grid-cols-2 gap-4 rounded-xl border ${HAIR} p-4 sm:grid-cols-2`}>
        <div>
          <div className={`text-[11px] ${MUTED}`}>إجمالي المسدَّد</div>
          <div className={`figure mt-1 text-2xl font-semibold ${INK}`}>{formatNumber(paid)}</div>
        </div>
        <div>
          <div className={`text-[11px] ${MUTED}`}>إجمالي الرصيد المستحق</div>
          <div className="figure mt-1 text-2xl font-semibold text-[#b45309]">{formatNumber(remaining)}</div>
        </div>
      </div>

      {dueRows.length > 0 ? (
        <>
          <h3 className={`mt-6 mb-2 text-[13px] font-bold ${INK}`}>المستحقات على الطالب</h3>
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className={`text-[10.5px] ${MUTED}`}>
                <th className={`border-b ${HEAD} px-2 py-2 text-start font-semibold`}>البيان</th>
                <th className={`border-b ${HEAD} px-2 py-2 text-end font-semibold`}>الإجمالي</th>
                <th className={`border-b ${HEAD} px-2 py-2 text-end font-semibold`}>المسدَّد</th>
                <th className={`border-b ${HEAD} px-2 py-2 text-end font-semibold`}>المتبقّي</th>
              </tr>
            </thead>
            <tbody>
              {dueRows.map((row) => (
                <tr key={row.key} className={INK}>
                  <td className={`border-b ${HAIR} px-2 py-2.5 ${MUTED}`}>{row.label}</td>
                  <td className={`figure border-b ${HAIR} px-2 py-2.5 text-end`}>{formatNumber(row.total)}</td>
                  <td className={`figure border-b ${HAIR} px-2 py-2.5 text-end`}>{formatNumber(row.paid)}</td>
                  <td className={`figure border-b ${HAIR} px-2 py-2.5 text-end font-semibold ${row.remaining > 0 ? 'text-[#b45309]' : ''}`}>{formatNumber(row.remaining)}</td>
                </tr>
              ))}
              <tr className={`font-bold ${INK}`}>
                <td className={`border-t ${HEAD} px-2 py-2.5`}>الإجمالي</td>
                <td className={`figure border-t ${HEAD} px-2 py-2.5 text-end`}>{formatNumber(duesTotal)}</td>
                <td className={`figure border-t ${HEAD} px-2 py-2.5 text-end`}>{formatNumber(duesPaid)}</td>
                <td className={`figure border-t ${HEAD} px-2 py-2.5 text-end text-[#b45309]`}>{formatNumber(duesRemaining)}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : null}

      <h3 className={`mt-6 mb-2 text-[13px] font-bold ${INK}`}>حركات القبض</h3>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className={`text-[10.5px] ${MUTED}`}>
            <th className={`border-b ${HEAD} px-2 py-2 text-start font-semibold`}>التاريخ</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-start font-semibold`}>رقم السند</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-start font-semibold`}>البيان</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-end font-semibold`}>القيمة</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-end font-semibold`}>المسدَّد</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-end font-semibold`}>الرصيد المستحق</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className={INK}>
              <td className={`border-b ${HAIR} px-2 py-2.5`}>{formatDate(line.voucherDate)}</td>
              <td className={`figure border-b ${HAIR} px-2 py-2.5 ${MUTED}`}>{voucherRef('receipt', line.voucherNumber)}</td>
              <td className={`border-b ${HAIR} px-2 py-2.5 ${MUTED}`}>{line.entryType === 'fee' ? `رسم · ${line.courseName}` : line.courseName}</td>
              <td className={`figure border-b ${HAIR} px-2 py-2.5 text-end`}>{formatNumber(line.courseValue)}</td>
              <td className={`figure border-b ${HAIR} px-2 py-2.5 text-end`}>{formatNumber(line.amountReceived)}</td>
              <td className={`figure border-b ${HAIR} px-2 py-2.5 text-end`}>{formatNumber(line.remainingBalance)}</td>
            </tr>
          ))}
          {lines.length === 0 ? (
            <tr>
              <td colSpan={6} className={`px-2 py-6 text-center ${MUTED}`}>لا توجد حركات قبض بعد.</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="mt-10 flex justify-start">
        <SiteQr />
      </div>
    </PrintPreview>
  )
}
