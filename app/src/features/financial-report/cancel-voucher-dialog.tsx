import { useState } from 'react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Money } from '@/components/ui/money'
import { formatDate } from '@/lib/format'
import { formatVoucherNo, voucherTypeLabel } from '@/lib/voucher'
import type { FinancialMovement } from '@/types/domain'
import { useToastStore } from '@/components/ui/use-toast-store'
import { useVoucherAdminStore } from '@/store/use-voucher-admin-store'

type CancelVoucherDialogProps = {
  movement: FinancialMovement
  onClose: () => void
  onCancelled: () => void | Promise<void>
}

/**
 * Confirms cancelling a voucher. Cancelling never deletes: the voucher keeps its
 * number, drops out of active totals, and stays reviewable. A reason is mandatory
 * and the audit log captures who/when server-side.
 */
export function CancelVoucherDialog({ movement, onClose, onCancelled }: CancelVoucherDialogProps) {
  const cancelVoucher = useVoucherAdminStore((state) => state.cancelVoucher)
  const isBusy = useVoucherAdminStore((state) => state.isBusy)
  const error = useVoucherAdminStore((state) => state.error)
  const [reason, setReason] = useState('')

  const typeLabel = voucherTypeLabel(movement.movementType)

  async function handleConfirm() {
    const ok = await cancelVoucher(movement.movementType, movement.id, reason)
    if (!ok) return
    useToastStore.getState().show('تم إلغاء السند')
    await onCancelled()
  }

  return (
    <ActionSheet title={`إلغاء ${typeLabel}`} onClose={onClose}>
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay"
        >
          {error}
        </div>
      ) : null}

      <div className="mb-5 rounded-xl border border-border bg-highlight/60 p-4 text-sm">
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">رقم السند</span>
          <span className="figure font-semibold text-foreground">
            {formatVoucherNo(movement.voucherNumber)}
          </span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">التاريخ</span>
          <span className="figure text-foreground">{formatDate(movement.voucherDate)}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">المبلغ</span>
          <Money
            value={movement.amount}
            currency={false}
            className={`font-semibold ${movement.movementType === 'receipt' ? 'text-gold' : 'text-clay'}`}
          />
        </div>
      </div>

      <p className="mb-4 text-[13px] leading-6 text-muted-foreground">
        لا يُحذف السند؛ يبقى برقمه ويخرج من الإجماليات، ويظل متاحًا للمراجعة.
      </p>

      <Field label="سبب الإلغاء" error={!reason.trim() ? 'سبب الإلغاء مطلوب' : undefined}>
        {(control) => (
          <Textarea
            placeholder="اكتب سبب الإلغاء"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            {...control}
          />
        )}
      </Field>

      <div className="mt-6 flex gap-3">
        <Button
          variant="destructive"
          className="flex-1"
          onClick={handleConfirm}
          disabled={isBusy || !reason.trim()}
        >
          {isBusy ? 'جارٍ الإلغاء…' : 'تأكيد الإلغاء'}
        </Button>
        <Button variant="quiet" onClick={onClose} disabled={isBusy}>
          تراجع
        </Button>
      </div>
    </ActionSheet>
  )
}
