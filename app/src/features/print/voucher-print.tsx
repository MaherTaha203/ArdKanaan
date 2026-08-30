import { PrintPreview } from '@/components/print/print-preview'
import { formatDate, formatNumber } from '@/lib/format'
import { formatVoucherNo, voucherTypeLabel } from '@/lib/voucher'
import type { FinancialMovement } from '@/types/domain'

type VoucherPrintProps = {
  movement: FinancialMovement
  onClose: () => void
}

const INK = 'text-[#0f172a]'
const MUTED = 'text-[#475569]'
const HAIR = 'border-[#e2e8f0]'

/**
 * A single printable voucher — سند قبض or سند صرف — built from one derived
 * movement. Presentation only: the number, date, party and amount all come from
 * the voucher record, formatted; nothing is recomputed or stored.
 */
export function VoucherPrint({ movement, onClose }: VoucherPrintProps) {
  const isReceipt = movement.movementType === 'receipt'
  const typeLabel = voucherTypeLabel(movement.movementType)
  const voucherNo = formatVoucherNo(movement.voucherNumber)

  return (
    <PrintPreview
      docTitle={typeLabel}
      documentTitle={`${typeLabel} رقم ${voucherNo} — أرض كنعان`}
      onClose={onClose}
      meta={
        <>
          <div>
            رقم السند <span className="figure font-semibold text-[#0f172a]">{voucherNo}</span>
          </div>
          <div>
            التاريخ <span className="figure">{formatDate(movement.voucherDate)}</span>
          </div>
        </>
      }
    >
      {/* Party + context rows */}
      <div className={`rounded-xl border ${HAIR} p-5`}>
        {isReceipt ? (
          <Row label="استلمنا من" value={movement.partyName ?? '—'} />
        ) : (
          <Row label="صُرف لـ" value="المركز" />
        )}
        {movement.context ? (
          <Row label={isReceipt ? 'عن دورة' : 'نوع المصروف'} value={movement.context} />
        ) : null}

        {/* The amount — the figure that moves money. */}
        <div className={`mt-4 flex items-center justify-between border-t ${HAIR} pt-4`}>
          <span className={`text-[13px] font-medium ${MUTED}`}>
            {isReceipt ? 'المبلغ المقبوض' : 'المبلغ المصروف'}
          </span>
          <span className={`figure text-3xl font-bold ${INK}`}>
            {formatNumber(movement.amount)} <span className="text-lg font-medium text-[#64748b]">₪</span>
          </span>
        </div>
      </div>

      {/* Signature lines */}
      <div className="mt-16 grid grid-cols-2 gap-10">
        <Signature label={isReceipt ? 'توقيع المستلِم' : 'توقيع الصارف'} />
        <Signature label={isReceipt ? 'توقيع الدافع' : 'توقيع المستلِم'} />
      </div>
    </PrintPreview>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 text-[14px]`}>
      <span className={`${MUTED}`}>{label}</span>
      <span className={`font-semibold ${INK}`}>{value}</span>
    </div>
  )
}

function Signature({ label }: { label: string }) {
  return (
    <div className="text-center">
      <div className={`mb-2 border-t ${HAIR}`} />
      <span className={`text-[12px] ${MUTED}`}>{label}</span>
    </div>
  )
}
