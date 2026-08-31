import { useEffect, useState } from 'react'

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
import { useVoucherAdminStore } from '@/store/use-voucher-admin-store'
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
  const editVoucherId = useShellStore((state) => state.editVoucherId)
  const isEdit = Boolean(editVoucherId)

  const savePaymentVoucher = useMoneyOutStore((state) => state.savePaymentVoucher)
  const isSaving = useMoneyOutStore((state) => state.isSaving)
  const error = useMoneyOutStore((state) => state.error)
  const clearError = useMoneyOutStore((state) => state.clearError)

  const fetchPayment = useVoucherAdminStore((state) => state.fetchPayment)
  const updatePayment = useVoucherAdminStore((state) => state.updatePayment)
  const adminBusy = useVoucherAdminStore((state) => state.isBusy)
  const adminError = useVoucherAdminStore((state) => state.error)
  const clearAdminError = useVoucherAdminStore((state) => state.clearError)

  const reloadWorkspace = useWorkspaceStore((state) => state.load)

  const [loadingEdit, setLoadingEdit] = useState(isEdit)

  const form = useForm<PaymentVoucherFormValues>({
    resolver: zodResolver(paymentVoucherFormSchema),
    defaultValues: buildDefaults(),
  })

  useEffect(() => {
    clearError()
    clearAdminError()
  }, [clearError, clearAdminError])

  useEffect(() => {
    if (!editVoucherId) return
    let active = true
    void (async () => {
      const data = await fetchPayment(editVoucherId)
      if (!active) return
      if (data) {
        form.reset({
          paymentDate: data.paymentDate,
          expenseType: data.expenseType,
          amount: data.amount,
          notes: data.notes,
        })
      }
      setLoadingEdit(false)
    })()
    return () => {
      active = false
    }
  }, [editVoucherId, fetchPayment, form])

  async function onSubmit(values: PaymentVoucherFormValues) {
    if (isEdit && editVoucherId) {
      const ok = await updatePayment(editVoucherId, values)
      if (!ok) return
      await reloadWorkspace()
      useToastStore.getState().show('تم حفظ التعديل')
      closeOverlay()
      return
    }

    const saved = await savePaymentVoucher(values)
    if (!saved) return

    await reloadWorkspace()
    navigate('report')
    useToastStore.getState().show('تم تسجيل سند الصرف بنجاح')
    closeOverlay()
  }

  const busy = isEdit ? adminBusy : isSaving
  const showError = error || adminError

  if (loadingEdit) {
    return (
      <ActionSheet title="تعديل سند صرف" onClose={closeOverlay}>
        <p className="py-10 text-center text-sm text-faint">جارٍ تحميل السند…</p>
      </ActionSheet>
    )
  }

  return (
    <ActionSheet title={isEdit ? 'تعديل سند صرف' : 'سند صرف'} onClose={closeOverlay}>
      {showError ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay"
        >
          {isEdit ? adminError ?? 'تعذّر حفظ التعديل.' : error ?? 'تعذّر حفظ السند.'}
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

        {/* The amount spent — the figure that moves money. Given visual weight. */}
        <Field label="المبلغ المصروف" error={form.formState.errors.amount?.message}>
          {(control) => (
            <div className="flex items-center gap-2 rounded-xl border border-clay/30 bg-clay-weak/40 px-4 py-1 focus-within:border-clay focus-within:ring-2 focus-within:ring-clay/20">
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className="figure h-12 w-full bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-faint"
                placeholder="0"
                {...control}
                {...form.register('amount', { valueAsNumber: true })}
              />
              <span className="text-sm font-medium text-muted-foreground">₪</span>
            </div>
          )}
        </Field>

        <Field label="تاريخ الصرف" error={form.formState.errors.paymentDate?.message}>
          {(control) => (
            <Input type="date" className="figure" {...control} {...form.register('paymentDate')} />
          )}
        </Field>

        <Field label="الملاحظات" error={form.formState.errors.notes?.message}>
          {(control) => (
            <Textarea placeholder="ملاحظات اختيارية" {...control} {...form.register('notes')} />
          )}
        </Field>

        <Button type="submit" size="lg" variant="default" className="w-full" disabled={busy}>
          <ArrowUpRight className="size-4" />
          {busy ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديل' : 'حفظ سند الصرف'}
        </Button>
        <p className="text-center text-[11.5px] text-faint">
          Enter للتالي · Ctrl+Enter للحفظ · Esc للإغلاق
        </p>
      </form>
    </ActionSheet>
  )
}
