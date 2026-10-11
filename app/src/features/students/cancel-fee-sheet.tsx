import { useLayoutEffect, useState } from 'react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import { useFeeObligationStore } from '@/store/use-fee-obligation-store'

// BC-005 (BR-054/055/056/057): an erroneous fee is corrected by cancellation, never
// by editing or deletion. Cancellation preserves the record with a "cancelled" status
// and a mandatory reason, and is refused on a fee that already has collected money
// (the receipt must be voided first). All of that is enforced by the RPC; this sheet
// only collects the reason and confirms the owner's intent.
export type CancellableFee = { id: string; label: string; amount: number }

export function CancelFeeSheet({ fee, onClose }: { fee: CancellableFee; onClose: () => void }) {
  const cancelFeeObligation = useFeeObligationStore((state) => state.cancelFeeObligation)
  const isCancelling = useFeeObligationStore((state) => state.isCancelling)
  const error = useFeeObligationStore((state) => state.error)
  const clearError = useFeeObligationStore((state) => state.clearError)

  const [reason, setReason] = useState('')

  // The fee store's `error` is a singleton shared with the add-fee sheet; clear any
  // stale error on open so a prior flow's message never flashes in this sheet.
  useLayoutEffect(() => {
    clearError()
  }, [clearError])

  async function submit() {
    clearError()
    const ok = await cancelFeeObligation(fee.id, reason)
    if (ok) onClose()
  }

  const disabled = isCancelling || !reason.trim()

  return (
    <ActionSheet eyebrow="تصحيح" title="إلغاء رسم" onClose={onClose}>
      <div className="space-y-5">
        {error ? <div role="alert" className="rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">{error}</div> : null}

        <div className="rounded-xl border border-border bg-panel px-4 py-3">
          <div className="text-[12px] text-muted-foreground">الرسم المراد إلغاؤه</div>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <span className="font-medium text-foreground">{fee.label}</span>
            <span className="figure font-semibold text-foreground">{formatNumber(fee.amount)}</span>
          </div>
        </div>

        <p className="rounded-xl border border-warn/25 bg-warn-weak px-4 py-3 text-[13px] leading-relaxed text-warn">
          الإلغاء لا يحذف الرسم؛ يبقى محفوظًا بحالة «ملغى» مع السبب. ولا يمكن إلغاء رسمٍ حُصِّل عليه مبلغ — أبطِل سند القبض المرتبط أولًا.
        </p>

        <label className="block text-[13px] font-medium text-muted-foreground">
          سبب الإلغاء
          <textarea
            className="mt-1.5 min-h-20 w-full rounded-xl border border-border-strong bg-panel px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-olive"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="مثال: أُدخل الاشتراك مرّتين بالخطأ"
          />
        </label>

        <Button type="button" size="lg" variant="destructive" className="w-full" disabled={disabled} onClick={submit}>
          {isCancelling ? 'جارٍ الإلغاء…' : 'تأكيد إلغاء الرسم'}
        </Button>
      </div>
    </ActionSheet>
  )
}
