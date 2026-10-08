import { useState } from 'react'

import { Ban, Pencil, Printer } from 'lucide-react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { VoucherPrint } from '@/features/print/voucher-print'
import { formatDate } from '@/lib/format'
import { voucherRef, voucherTypeLabel } from '@/lib/voucher'
import type { Enrollment, FeeObligation, FinancialMovement, StudentStatementLine } from '@/types/domain'
import { getSupabaseBrowserClient } from '@/lib/supabase'

type VoucherDetailsSheetProps = {
  movement: FinancialMovement
  statementLines?: StudentStatementLine[]
  enrollments?: Enrollment[]
  feeObligations?: FeeObligation[]
  onClose: () => void
  onEdit: () => void
  onCancel: () => void
}

export function VoucherDetailsSheet({ movement, statementLines = [], enrollments = [], feeObligations = [], onClose, onEdit, onCancel }: VoucherDetailsSheetProps) {
  const [printing, setPrinting] = useState(false)
  const [receiptAllocations, setReceiptAllocations] = useState<{ type: 'course' | 'fee'; label: string; amount: number }[]>([])
  const typeLabel = voucherTypeLabel(movement.movementType)
  const reference = voucherRef(movement.movementType, movement.voucherNumber)
  async function handlePrintReceipt() {
    if (movement.movementType !== 'receipt') return
    const supabase = getSupabaseBrowserClient()
    if (supabase) {
      const result = await supabase
        .from('receipt_allocations')
        .select('allocation_type, enrollment_id, fee_obligation_id, amount')
        .eq('receipt_voucher_id', movement.id)
      if (!result.error && result.data.length > 0) {
        const resolved = await Promise.all(result.data.map(async (row) => {
          const isFee = row.allocation_type === 'fee'
          if (isFee) {
            const localFee = feeObligations.find((item) => item.id === row.fee_obligation_id)
            if (localFee) return { type: 'fee' as const, label: localFee.description, amount: Number(row.amount) }
            if (row.fee_obligation_id) {
              const feeResult = await supabase
                .from('fee_obligations')
                .select('description')
                .eq('id', row.fee_obligation_id)
                .maybeSingle()
              if (!feeResult.error && feeResult.data?.description) {
                return { type: 'fee' as const, label: String(feeResult.data.description), amount: Number(row.amount) }
              }
            }
            return { type: 'fee' as const, label: 'رسم', amount: Number(row.amount) }
          }

          const localEnrollment = enrollments.find((item) => item.id === row.enrollment_id)
          if (localEnrollment) return { type: 'course' as const, label: localEnrollment.courseName, amount: Number(row.amount) }
          if (row.enrollment_id) {
            const enrollmentResult = await supabase
              .from('enrollments')
              .select('course_name')
              .eq('id', row.enrollment_id)
              .maybeSingle()
            if (!enrollmentResult.error && enrollmentResult.data?.course_name) {
              return { type: 'course' as const, label: String(enrollmentResult.data.course_name), amount: Number(row.amount) }
            }
          }
          return { type: 'course' as const, label: movement.context ?? 'دورة', amount: Number(row.amount) }
        }))
        setReceiptAllocations(resolved)
      } else {
        setReceiptAllocations(fallbackAllocations(statementLines, movement.voucherNumber))
      }
    } else {
      setReceiptAllocations(fallbackAllocations(statementLines, movement.voucherNumber))
    }
    setPrinting(true)
  }

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
              <Button variant="outline" className="sm:flex-1" onClick={() => void handlePrintReceipt()}>
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

function fallbackAllocations(lines: StudentStatementLine[], voucherNumber: number) {
  return lines
    .filter((line) => line.voucherNumber === voucherNumber)
    .map((line) => ({ type: (line.entryType === 'fee' ? 'fee' : 'course') as 'course' | 'fee', label: line.courseName, amount: line.amountReceived }))
}

function Detail({ label, value, figure = false }: { label: string; value: string; figure?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-faint">{label}</div>
      <div className={`mt-1 text-sm font-semibold text-foreground ${figure ? 'figure' : ''}`}>{value}</div>
    </div>
  )
}
