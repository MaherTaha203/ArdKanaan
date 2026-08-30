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
import { StudentPicker } from '@/features/receipt-voucher/student-picker'
import { todayIsoDate } from '@/lib/format'
import { useMoneyInStore } from '@/store/use-money-in-store'
import { useShellStore } from '@/store/use-shell-store'
import { useToastStore } from '@/components/ui/use-toast-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

function buildDefaults(studentName: string | null): ReceiptVoucherFormValues {
  return {
    paymentDate: todayIsoDate(),
    studentName: studentName ?? '',
    studentId: '',
    studentIdNumber: '',
    studentPhone: '',
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
  const students = useWorkspaceStore((state) => state.students)

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
    <ActionSheet title="سند قبض" onClose={closeOverlay}>
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay"
        >
          تعذّر حفظ السند.
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <StudentPicker form={form} students={students} />

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

          <Field label="تاريخ الدفع" error={form.formState.errors.paymentDate?.message}>
            {(control) => (
              <Input type="date" className="figure" {...control} {...form.register('paymentDate')} />
            )}
          </Field>
        </div>

        {/* The amount received — the figure that moves money. Given visual weight. */}
        <Field label="المبلغ المقبوض" error={form.formState.errors.amountReceived?.message}>
          {(control) => (
            <div className="flex items-center gap-2 rounded-xl border border-olive/30 bg-olive-weak/40 px-4 py-1 focus-within:border-olive focus-within:ring-2 focus-within:ring-olive/20">
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className="figure h-12 w-full bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-faint"
                placeholder="0"
                {...control}
                {...form.register('amountReceived', { valueAsNumber: true })}
              />
              <span className="text-sm font-medium text-muted-foreground">₪</span>
            </div>
          )}
        </Field>

        <Field label="اسم الدافع (اختياري)" error={form.formState.errors.payerName?.message}>
          {(control) => (
            <Input placeholder="الاسم المدفوع باسمه" {...control} {...form.register('payerName')} />
          )}
        </Field>

        <Field label="الملاحظات (اختياري)" error={form.formState.errors.notes?.message}>
          {(control) => (
            <Textarea placeholder="ملاحظات اختيارية" {...control} {...form.register('notes')} />
          )}
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={isSaving}>
          <ArrowDownLeft className="size-4" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ سند القبض'}
        </Button>
        <p className="text-center text-[11.5px] text-faint">
          Enter للتالي · Ctrl+Enter للحفظ · Esc للإغلاق
        </p>
      </form>
    </ActionSheet>
  )
}
