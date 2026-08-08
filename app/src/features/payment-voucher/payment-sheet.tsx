import { type ReactNode, useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowUpRight } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  paymentVoucherFormSchema,
  type PaymentVoucherFormValues,
} from '@/features/payment-voucher/schema'
import { todayIsoDate } from '@/lib/format'
import { useMoneyOutStore } from '@/store/use-money-out-store'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

const defaultValues: PaymentVoucherFormValues = {
  paymentDate: todayIsoDate(),
  expenseType: '',
  amount: 0,
  notes: '',
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-clay">{message}</p>
}

function Field({
  label,
  children,
  error,
}: {
  label: string
  children: ReactNode
  error?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] text-muted-foreground">{label}</label>
      {children}
      <FieldError message={error} />
    </div>
  )
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
    defaultValues,
  })

  useEffect(() => {
    clearError()
  }, [clearError])

  async function onSubmit(values: PaymentVoucherFormValues) {
    const saved = await savePaymentVoucher(values)
    if (!saved) return

    await reloadWorkspace()
    navigate('report')
    closeOverlay()
  }

  return (
    <ActionSheet title="تسجيل مصروف" eyebrow="سند صرف" onClose={closeOverlay}>
      <p className="mb-5 text-[13px] leading-6 text-muted-foreground">
        حركة صادرة للمركز. لا ترتبط بطالب أو دورة، ولا تؤثر على بيان أي طالب — وتظهر في التقرير المالي.
      </p>

      {error ? (
        <div className="mb-4 rounded-md border border-clay/30 bg-clay-weak px-4 py-3 text-sm text-clay">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="نوع المصروف" error={form.formState.errors.expenseType?.message}>
          <Input placeholder="مثال: إيجار، كهرباء، رواتب" {...form.register('expenseType')} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="المبلغ المصروف" error={form.formState.errors.amount?.message}>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              className="figure"
              {...form.register('amount', { valueAsNumber: true })}
            />
          </Field>

          <Field label="تاريخ الصرف" error={form.formState.errors.paymentDate?.message}>
            <Input type="date" className="figure" {...form.register('paymentDate')} />
          </Field>
        </div>

        <Field label="الملاحظات" error={form.formState.errors.notes?.message}>
          <Textarea placeholder="ملاحظات اختيارية" {...form.register('notes')} />
        </Field>

        <Button type="submit" size="lg" variant="default" className="w-full" disabled={isSaving}>
          <ArrowUpRight className="size-4" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ سند الصرف'}
        </Button>
      </form>
    </ActionSheet>
  )
}
