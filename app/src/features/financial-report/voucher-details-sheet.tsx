import { useState } from 'react'

import { Ban, Pencil, Printer } from 'lucide-react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { VoucherPrint } from '@/features/print/voucher-print'
import { formatDate } from '@/lib/format'
import { voucherRef, voucherTypeLabel } from '@/lib/voucher'
import type { FinancialMovement, StudentStatementLine } from '@/types/domain'

type VoucherDetailsSheetProps = {
  movement: FinancialMovement
  statementLines?: StudentStatementLine[]
  onClose: () => void
  onEdit: () => void
  onCancel: () => void
}

export function VoucherDetailsSheet({ movement, statementLines = [], onClose, onEdit, onCancel }: VoucherDetailsSheetProps) {
  const [printing, setPrinting] = useState(false)
  const typeLabel = voucherTypeLabel(movement.movementType)
  const reference = voucherRef(movement.movementType, movement.voucherNumber)
  const receiptAllocations = movement.movementType === 'receipt'
    ? statementLines
        .filter((line) => line.voucherNumber === movement.voucherNumber)
        .map((line) => ({
          type: (line.entryType === 'fee' ? 'fee' : 'course') as 'course' | 'fee',
          label: line.courseName,
          amount: line.amountReceived,
        }))
    : []

  return (
    <>
      <ActionSheet title={reference} eyebrow={typeLabel} onClose={onClose}>
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-highlight/60 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="رقم السند" value={reference} figure />
              <Detail label="التاريخ" value={formatDate(movement.voucherDate)} figure />
              <Detail label={movement.movementType === 'receipt' ? 'الطالب / الدافع' : 'الجهة'} value={movement.partyName ?? '—'} />
              <Detail label="البيان" value={movement.context ?? '—'} />
              <div className="sm:col-span-2">
                <div className="text-[11px] font-medium text-faint">المبلغ</div>
                <Money
                  value={movement.amount}
                  currency={false}
                  className={`mt-1 figure text-xl font-bold ${movement.movementType === 'receipt' ? 'text-gold' : 'text-clay'}`}
                />
              </div>
            </div>
          </div>

          {movement.movementType === 'receipt' && (movement.externalShare ?? 0) > 0 ? (
            <div className="rounded-xl border border-border px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">حصة الجهة الخارجية</span>
                <Money value={movement.externalShare ?? 0} currency={false} className="figure font-semibold text-gold" />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row">
            <Button variant="quiet" className="sm:flex-1" onClick={onClose}>
              إغلاق
            </Button>
            {movement.movementType === 'receipt' ? (
              <Button variant="outline" className="sm:flex-1" onClick={() => setPrinting(true)}>
                <Printer className="size-4" />
                طباعة السند
              </Button>
            ) : null}
            <Button variant="outline" className="sm:flex-1" onClick={onEdit}>
              <Pencil className="size-4" />
              تعديل السند
            </Button>
            <Button variant="destructive" className="sm:flex-1" onClick={onCancel}>
              <Ban className="size-4" />
              إبطال السند
            </Button>
          </div>
        </div>
      </ActionSheet>

      {printing ? (
        <VoucherPrint
          movement={movement}
          allocations={receiptAllocations}
          onClose={() => setPrinting(false)}
        />
      ) : null}
    </>
  )
}

function Detail({ label, value, figure = false }: { label: string; value: string; figure?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-faint">{label}</div>
      <div className={`mt-1 text-sm font-semibold text-foreground ${figure ? 'figure' : ''}`}>{value}</div>
    </div>
  )
}
