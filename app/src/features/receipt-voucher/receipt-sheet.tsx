import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDownLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  receiptVoucherFormSchema,
  type ReceiptVoucherFormValues,
} from '@/features/receipt-voucher/schema'
import { todayIsoDate } from '@/lib/format'
import { useMoneyInStore } from '@/store/use-money-in-store'
import { useShellStore } from '@/store/use-shell-store'
import { useToastStore } from '@/components/ui/use-toast-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

function buildDefaults(studentName: string | null): ReceiptVoucherFormValues {
  return {
    paymentDate: todayIsoDate(),
    studentName: studentName ?? '',
    courseName: '',
    courseValue: 0,
    amountReceived: 0,
    payerName: '',
    notes: '',
  }
}

export function ReceiptSheet() {
  const closeOverlay = useShellStore((state) => state.closeOverlay)
  const selectStudent = useShellStore((state) => state.selectStudent)
  const prefillName = useShellStore((state) => state.receivePrefillName)

  const saveReceiptVoucher = useMoneyInStore((state) => state.saveReceiptVoucher)
  const isSaving = useMoneyInStore((state) => state.isSaving)
  const error = useMoneyInStore((state) => state.error)
  const clearError = useMoneyInStore((state) => state.clearError)

  const reloadWorkspace = useWorkspaceStore((state) => state.load)

  const form = useForm<ReceiptVoucherFormValues>({
    resolver: zodResolver(receiptVoucherFormSchema),
    defaultValues: buildDefaults(prefillName),
  })

  useEffect(() => {
    // Clear any stale error from a previous attempt when the sheet mounts.
    clearError()
  }, [clearError])

  async function onSubmit(values: ReceiptVoucherFormValues) {
    const saved = await saveReceiptVoucher(values)
    if (!saved) return

    // Refresh the derived read model, then jump to the student's record.
    await reloadWorkspace()
    const activeStudent = useMoneyInStore.getState().activeStudent
    if (activeStudent) {
      selectStudent(activeStudent.id)
    }
    useToastStore.getState().show('تم تسجيل سند القبض بنجاح')
    closeOverlay()
  }

  return (
    <ActionSheet title="استلام مبلغ" eyebrow="سند قبض" onClose={closeOverlay}>
      <p className="mb-5 text-[13px] leading-6 text-muted-foreground">
        سند قبض جديد. يُنشأ الطالب إن لم يوجد، ثم يُحفظ السند ويظهر في بيانه وفي التقرير مباشرة.
      </p>

      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay"
        >
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="اسم الطالب" error={form.formState.errors.studentName?.message}>
          {(control) => (
            <Input placeholder="اكتب اسم الطالب" {...control} {...form.register('studentName')} />
          )}
        </Field>

        <Field label="اسم الدورة" error={form.formState.errors.courseName?.message}>
          {(control) => (
            <Input placeholder="نص حر" {...control} {...form.register('courseName')} />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="قيمة الدورة" error={form.formState.errors.courseValue?.message}>
            {(control) => (
              <Input
                type="number"
                min="0"
                step="0.01"
                className="figure"
                {...control}
                {...form.register('courseValue', { valueAsNumber: true })}
              />
            )}
          </Field>

          <Field label="المبلغ المقبوض" error={form.formState.errors.amountReceived?.message}>
            {(control) => (
              <Input
                type="number"
                min="0.01"
                step="0.01"
                className="figure"
                {...control}
                {...form.register('amountReceived', { valueAsNumber: true })}
              />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="تاريخ الدفع" error={form.formState.errors.paymentDate?.message}>
            {(control) => (
              <Input type="date" className="figure" {...control} {...form.register('paymentDate')} />
            )}
          </Field>

          <Field label="اسم الدافع (اختياري)" error={form.formState.errors.payerName?.message}>
            {(control) => (
              <Input
                placeholder="الاسم المدفوع باسمه"
                {...control}
                {...form.register('payerName')}
              />
            )}
          </Field>
        </div>

        <Field label="الملاحظات (اختياري)" error={form.formState.errors.notes?.message}>
          {(control) => (
            <Textarea placeholder="ملاحظات اختيارية" {...control} {...form.register('notes')} />
          )}
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={isSaving}>
          <ArrowDownLeft className="size-4" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ سند القبض'}
        </Button>
      </form>
    </ActionSheet>
  )
}
