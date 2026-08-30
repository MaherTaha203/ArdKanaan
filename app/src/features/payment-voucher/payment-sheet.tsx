import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowUpRight } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  paymentVoucherFormSchema,
  type PaymentVoucherFormValues,
} from '@/features/payment-voucher/schema'
import { todayIsoDate } from '@/lib/format'
import { useMoneyOutStore } from '@/store/use-money-out-store'
import { useShellStore } from '@/store/use-shell-store'
import { useToastStore } from '@/components/ui/use-toast-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

function buildDefaults(): PaymentVoucherFormValues {
  // Built per-mount (not a module-level constant) so the date is today's whenever
  // the sheet opens — not frozen at bundle-load time for a long-lived tab.
  return {
    paymentDate: todayIsoDate(),
    expenseType: '',
    amount: 0,
    notes: '',
  }
}

export function PaymentSheet() {
  const closeOverlay = useShellStore((state) => state.closeOverlay)
  const navigate = useShellStore((state) => state.navigate)

  const savePaymentVoucher = useMoneyOutStore((state) => state.savePaymentVoucher)
  const isSaving = useMoneyOutStore((state) => state.isSaving)
  const error = useMoneyOutStore((state) => state.error)
  const clearError = useMoneyOutStore((state) => state.clearError)

  const reloadWorkspace = useWorkspaceStore((state) => state.load)

  const form = useForm<PaymentVoucherFormValues>({
    resolver: zodResolver(paymentVoucherFormSchema),
    defaultValues: buildDefaults(),
  })

  useEffect(() => {
    clearError()
  }, [clearError])

  async function onSubmit(values: PaymentVoucherFormValues) {
    const saved = await savePaymentVoucher(values)
    if (!saved) return

    await reloadWorkspace()
    navigate('report')
    useToastStore.getState().show('تم تسجيل سند الصرف بنجاح')
    closeOverlay()
  }

  return (
    <ActionSheet title="سند صرف" onClose={closeOverlay}>
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay"
        >
          تعذّر حفظ السند.
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="نوع المصروف" error={form.formState.errors.expenseType?.message}>
          {(control) => (
            <Input
              placeholder="مثال: إيجار، كهرباء، رواتب"
              {...control}
              {...form.register('expenseType')}
            />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="المبلغ المصروف" error={form.formState.errors.amount?.message}>
            {(control) => (
              <Input
                type="number"
                min="0.01"
                step="0.01"
                className="figure"
                {...control}
                {...form.register('amount', { valueAsNumber: true })}
              />
            )}
          </Field>

          <Field label="تاريخ الصرف" error={form.formState.errors.paymentDate?.message}>
            {(control) => (
              <Input type="date" className="figure" {...control} {...form.register('paymentDate')} />
            )}
          </Field>
        </div>

        <Field label="الملاحظات" error={form.formState.errors.notes?.message}>
          {(control) => (
            <Textarea placeholder="ملاحظات اختيارية" {...control} {...form.register('notes')} />
          )}
        </Field>

        <Button type="submit" size="lg" variant="default" className="w-full" disabled={isSaving}>
          <ArrowUpRight className="size-4" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ سند الصرف'}
        </Button>
      </form>
    </ActionSheet>
  )
}
