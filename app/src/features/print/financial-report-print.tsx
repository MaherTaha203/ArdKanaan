import { PrintPreview } from '@/components/print/print-preview'
import { formatDate, formatNumber, todayIsoDate } from '@/lib/format'
import type { FinancialMovement } from '@/types/domain'

type FinancialReportPrintProps = {
  net: number
  totalIn: number
  totalOut: number
  receiptCount: number
  paymentCount: number
  movements: FinancialMovement[]
  periodLabel?: string
  onClose: () => void
}

const INK = 'text-[#0f172a]'
const MUTED = 'text-[#475569]'
const HAIR = 'border-[#e2e8f0]'
const HEAD = 'border-[#cbd5e1]'

function partyAndContext(movement: FinancialMovement) {
  const party = movement.movementType === 'receipt' ? movement.partyName ?? '—' : 'المركز'
  return movement.context ? `${party} · ${movement.context}` : party
}

/**
 * The printable financial report — a branded A4 rendering of the derived
 * position and the full movement log. Presentation only; nothing is stored and
 * no figure is recomputed here beyond formatting.
 */
export function FinancialReportPrint({
  net,
  totalIn,
  totalOut,
  receiptCount,
  paymentCount,
  movements,
  periodLabel,
  onClose,
}: FinancialReportPrintProps) {
  return (
    <PrintPreview
      docTitle="التقرير المالي"
      documentTitle="التقرير المالي — أرض كنعان"
      onClose={onClose}
      meta={
        <>
          <div className="font-semibold text-[#0f172a]">الموقف والحركة</div>
          {periodLabel ? <div>الفترة · {periodLabel}</div> : null}
          <div>
            التاريخ <span className="figure">{formatDate(todayIsoDate())}</span>
          </div>
          <div>
            عدد الحركات <span className="figure">{formatNumber(movements.length)}</span>
          </div>
        </>
      }
    >
      {/* Position summary */}
      <div className={`grid grid-cols-3 gap-4 rounded-xl border ${HAIR} p-4`}>
        <div>
          <div className={`text-[11px] ${MUTED}`}>صافي الموقف</div>
          <div className={`figure mt-1 text-2xl font-semibold ${INK}`}>{formatNumber(net)}</div>
        </div>
        <div>
          <div className={`text-[11px] ${MUTED}`}>
            الوارد · <span className="figure">{formatNumber(receiptCount)}</span> سند
          </div>
          <div className="figure mt-1 text-2xl font-semibold text-[#059669]">
            {formatNumber(totalIn)}
          </div>
        </div>
        <div>
          <div className={`text-[11px] ${MUTED}`}>
            الصادر · <span className="figure">{formatNumber(paymentCount)}</span> سند
          </div>
          <div className="figure mt-1 text-2xl font-semibold text-[#dc2626]">
            {formatNumber(totalOut)}
          </div>
        </div>
      </div>

      {/* Movements */}
      <h3 className={`mt-6 mb-2 text-[13px] font-bold ${INK}`}>سجل الحركات — من الأحدث</h3>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className={`text-[10.5px] ${MUTED}`}>
            <th className={`border-b ${HEAD} px-2 py-2 text-start font-semibold`}>النوع</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-start font-semibold`}>رقم السند</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-start font-semibold`}>التاريخ</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-start font-semibold`}>البيان</th>
            <th className={`border-b ${HEAD} px-2 py-2 text-end font-semibold`}>المبلغ</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => {
            const isReceipt = movement.movementType === 'receipt'
            return (
              <tr key={`${movement.movementType}-${movement.id}`} className={INK}>
                <td className={`border-b ${HAIR} px-2 py-2.5`}>
                  <span className={isReceipt ? 'text-[#059669]' : 'text-[#dc2626]'}>
                    {isReceipt ? 'قبض' : 'صرف'}
                  </span>
                </td>
                <td className={`figure border-b ${HAIR} px-2 py-2.5 ${MUTED}`}>
                  {formatNumber(movement.voucherNumber)}
                </td>
                <td className={`border-b ${HAIR} px-2 py-2.5`}>{formatDate(movement.voucherDate)}</td>
                <td className={`border-b ${HAIR} px-2 py-2.5 ${MUTED}`}>
                  {partyAndContext(movement)}
                </td>
                <td
                  className={`figure border-b ${HAIR} px-2 py-2.5 text-end font-semibold ${
                    isReceipt ? 'text-[#059669]' : 'text-[#dc2626]'
                  }`}
                >
                  {isReceipt ? '+' : '−'}
                  {formatNumber(movement.amount)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </PrintPreview>
  )
}
