import { useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDownLeft } from 'lucide-react'
import { useForm, useWatch, type DefaultValues } from 'react-hook-form'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SmartDateInput } from '@/components/ui/smart-date-input'
import { Textarea } from '@/components/ui/textarea'
import { VoucherPrint } from '@/features/print/voucher-print'
import { receiptVoucherFormSchema, type ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'
import { StudentPicker } from '@/features/receipt-voucher/student-picker'
import { studentCourseBreakdown } from '@/lib/aggregate'
import { formatDate, formatNumber, todayIsoDate } from '@/lib/format'
import { useMoneyInStore } from '@/store/use-money-in-store'
import { useSettingsStore } from '@/store/use-settings-store'
import { useShellStore } from '@/store/use-shell-store'
import { useToastStore } from '@/components/ui/use-toast-store'
import { useVoucherAdminStore } from '@/store/use-voucher-admin-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import type { FinancialMovement } from '@/types/domain'

const ENTRY_TYPES = [
  { id: 'course', label: 'دفعة دورة' },
  { id: 'fee', label: 'رسم' },
] as const

const FEE_CATEGORIES = [
  { id: 'institute', label: 'للمعهد' },
  { id: 'external', label: 'لجهة خارجية' },
  { id: 'shared', label: 'مشترك' },
] as const

function buildDefaults(studentName: string | null): DefaultValues<ReceiptVoucherFormValues> {
  // Amount fields start empty (not 0) so typing doesn't produce a leading zero
  // like "0500"; the input shows a grey "0" placeholder instead.
  return { paymentDate: todayIsoDate(), studentName: studentName ?? '', studentId: '', studentIdNumber: '', studentPhone: '', courseName: '', courseValue: undefined, amountReceived: undefined, payerName: '', notes: '', entryType: 'course', feeCategory: undefined, externalShare: undefined }
}

export function ReceiptSheet() {
  const closeOverlay = useShellStore((state) => state.closeOverlay)
  const selectStudent = useShellStore((state) => state.selectStudent)
  const prefillName = useShellStore((state) => state.receivePrefillName)
  const editVoucherId = useShellStore((state) => state.editVoucherId)
  const isEdit = Boolean(editVoucherId)
  const saveReceiptVoucher = useMoneyInStore((state) => state.saveReceiptVoucher)
  const isSaving = useMoneyInStore((state) => state.isSaving)
  const error = useMoneyInStore((state) => state.error)
  const clearError = useMoneyInStore((state) => state.clearError)
  const fetchReceipt = useVoucherAdminStore((state) => state.fetchReceipt)
  const updateReceipt = useVoucherAdminStore((state) => state.updateReceipt)
  const adminBusy = useVoucherAdminStore((state) => state.isBusy)
  const adminError = useVoucherAdminStore((state) => state.error)
  const clearAdminError = useVoucherAdminStore((state) => state.clearError)
  const reloadWorkspace = useWorkspaceStore((state) => state.load)
  const students = useWorkspaceStore((state) => state.students)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const currencySymbol = useSettingsStore((state) => state.settings.currencySymbol)
  const maxAmount = useSettingsStore((state) => state.settings.maxVoucherAmount)
  const blockFutureDate = useSettingsStore((state) => state.settings.blockFutureDate)
  const maxDate = blockFutureDate ? todayIsoDate() : undefined
  const [loadingEdit, setLoadingEdit] = useState(isEdit)
  const [editStudentName, setEditStudentName] = useState('')
  const [savedVoucher, setSavedVoucher] = useState<FinancialMovement | null>(null)

  const form = useForm<ReceiptVoucherFormValues>({ resolver: zodResolver(receiptVoucherFormSchema), defaultValues: buildDefaults(prefillName) })
  const paymentDate = useWatch({ control: form.control, name: 'paymentDate' }) ?? ''
  const pickedStudentId = useWatch({ control: form.control, name: 'studentId' }) ?? ''
  const courseName = useWatch({ control: form.control, name: 'courseName' }) ?? ''
  const entryType = useWatch({ control: form.control, name: 'entryType' }) ?? 'course'
  const feeCategory = useWatch({ control: form.control, name: 'feeCategory' })
  const externalShareValue = useWatch({ control: form.control, name: 'externalShare' })
  const amountValue = useWatch({ control: form.control, name: 'amountReceived' })
  const isFee = entryType === 'fee'

  // Live "institute share = total − external" preview for a shared fee.
  const amountNumber = typeof amountValue === 'number' && Number.isFinite(amountValue) ? amountValue : 0
  const externalNumber = typeof externalShareValue === 'number' && Number.isFinite(externalShareValue) ? externalShareValue : 0
  const instituteShare = Math.max(0, amountNumber - externalNumber)

  // Courses the picked student is enrolled in, each with its remaining balance —
  // offered as quick-pick so the operator chooses the right course (and its
  // authoritative fee) instead of re-typing it. Only in create mode, course entry.
  const studentCourses = useMemo(
    () => (!isEdit && !isFee && pickedStudentId ? studentCourseBreakdown(pickedStudentId, statementLines, enrollments) : []),
    [isEdit, isFee, pickedStudentId, statementLines, enrollments],
  )
  const selectedCourse = studentCourses.find((course) => course.courseName === courseName) ?? null

  useLayoutEffect(() => { clearError(); clearAdminError() }, [clearError, clearAdminError])

  useEffect(() => {
    if (!editVoucherId) return
    let active = true
    void (async () => {
      const data = await fetchReceipt(editVoucherId)
      if (!active) return
      if (data) {
        setEditStudentName(data.studentName)
        form.reset({ paymentDate: data.paymentDate, studentName: data.studentName, studentId: '', studentIdNumber: '', studentPhone: '', courseName: data.courseName, courseValue: data.courseValue, amountReceived: data.amountReceived, payerName: data.payerName, notes: data.notes, entryType: 'course', feeCategory: undefined, externalShare: undefined })
      }
      setLoadingEdit(false)
    })()
    return () => { active = false }
  }, [editVoucherId, fetchReceipt, form])

  function switchEntryType(next: (typeof ENTRY_TYPES)[number]['id']) {
    form.setValue('entryType', next, { shouldValidate: false })
    if (next === 'course') {
      form.setValue('feeCategory', undefined)
      form.setValue('externalShare', undefined)
      form.clearErrors(['feeCategory', 'externalShare'])
    } else {
      // A fee derives its course_value from the amount; clear the (now hidden) field
      // so a stray NaN from the numeric input can't fail validation.
      form.setValue('courseValue', undefined)
      form.clearErrors(['courseValue'])
    }
  }

  async function onSubmit(values: ReceiptVoucherFormValues) {
    if (isEdit && editVoucherId) {
      const ok = await updateReceipt(editVoucherId, values)
      if (!ok) return
      await reloadWorkspace()
      useToastStore.getState().show('تم حفظ التعديل')
      closeOverlay()
      return
    }

    // Soft data-entry guard: the operator's configurable ceiling catches a
    // fat-fingered extra zero before it reaches the server. The DB financial
    // firewall stays the authoritative limit.
    if (values.amountReceived > maxAmount) {
      form.setError('amountReceived', { message: `المبلغ أكبر من الحدّ المسموح (${formatNumber(maxAmount)})` })
      return
    }
    if (values.courseValue != null && values.courseValue > maxAmount) {
      form.setError('courseValue', { message: `القيمة أكبر من الحدّ المسموح (${formatNumber(maxAmount)})` })
      return
    }

    const saved = await saveReceiptVoucher(values)
    if (!saved) return

    await reloadWorkspace()
    const activeStudent = useMoneyInStore.getState().activeStudent
    const latestLine = useMoneyInStore.getState().statementLines.at(-1)
    if (activeStudent) selectStudent(activeStudent.id)
    if (latestLine) {
      setSavedVoucher({ id: latestLine.id, movementType: 'receipt', voucherNumber: latestLine.voucherNumber, voucherDate: latestLine.voucherDate, amount: latestLine.amountReceived, partyName: latestLine.studentName, context: latestLine.courseName })
    }
    useToastStore.getState().show(isFee ? 'رُحّل الرسم بنجاح' : 'رُحّل سند القبض بنجاح')
  }

  const busy = isEdit ? adminBusy : isSaving
  const showError = error || adminError

  return (
    <>
      <ActionSheet title={isEdit ? 'تعديل سند قبض' : isFee ? 'سند قبض — رسم' : 'سند قبض'} onClose={closeOverlay}>
        {showError ? <div role="alert" className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">{isEdit ? adminError ?? 'تعذّر حفظ التعديل.' : error ?? 'تعذّر حفظ السند.'}</div> : null}
        {loadingEdit ? <p className="py-10 text-center text-sm text-faint">جارٍ تحميل السند…</p> : savedVoucher ? (
          <div className="py-3"><p className="mb-4 text-center text-sm font-semibold text-foreground">تم حفظ السند</p><Button type="button" variant="outline" className="w-full" onClick={closeOverlay}>إغلاق بعد الطباعة</Button></div>
        ) : (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {isEdit ? <Field label="اسم الطالب">{(control) => <Input {...control} value={editStudentName} readOnly />}</Field> : <StudentPicker form={form} students={students} />}
            {!isEdit ? (
              <div role="radiogroup" aria-label="نوع القيد" className="grid grid-cols-2 gap-1 rounded-xl border border-border-strong bg-panel p-1">
                {ENTRY_TYPES.map((option) => {
                  const active = entryType === option.id
                  return (
                    <button key={option.id} type="button" role="radio" aria-checked={active} onClick={() => switchEntryType(option.id)} className={`rounded-lg px-3 py-2 text-[13px] font-medium ${active ? 'bg-olive-weak text-olive' : 'text-muted-foreground'}`}>
                      {option.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
            {studentCourses.length > 0 ? (
              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-muted-foreground">دورات الطالب</span>
                <div className="flex flex-wrap gap-2">
                  {studentCourses.map((course) => {
                    const active = course.courseName === courseName
                    return (
                      <button
                        key={course.courseName}
                        type="button"
                        onClick={() => {
                          form.setValue('courseName', course.courseName, { shouldValidate: true })
                          form.setValue('courseValue', course.fee, { shouldValidate: true })
                        }}
                        className={`rounded-xl border px-3 py-2 text-start text-[13px] ${active ? 'border-olive bg-olive-weak text-olive' : 'border-border-strong bg-panel text-muted-foreground'}`}
                      >
                        <span className="font-semibold">{course.courseName}</span>
                        <span className="figure ms-2 text-[12px]">المتبقّي {formatNumber(course.remaining)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
            <Field label={isFee ? 'اسم الرسم' : studentCourses.length > 0 ? 'الدورة (أو اكتب دورة جديدة)' : 'اسم الدورة'} error={form.formState.errors.courseName?.message}>{(control) => <Input placeholder={isFee ? 'مثال: رسوم تخريج' : 'اكتب اسم الدورة'} readOnly={isEdit} {...control} {...form.register('courseName')} />}</Field>
            {isFee ? (
              <div>
                <span id="fee-category-label" className="mb-1.5 block text-[13px] font-medium text-muted-foreground">تصنيف الرسم</span>
                <div role="radiogroup" aria-labelledby="fee-category-label" className="grid grid-cols-3 gap-2">
                  {FEE_CATEGORIES.map((option) => {
                    const active = feeCategory === option.id
                    return (
                      <button key={option.id} type="button" role="radio" aria-checked={active} onClick={() => form.setValue('feeCategory', option.id, { shouldValidate: true })} className={`rounded-xl border px-3 py-2 text-[13px] font-medium ${active ? 'border-olive bg-olive-weak text-olive' : 'border-border-strong bg-panel text-muted-foreground'}`}>
                        {option.label}
                      </button>
                    )
                  })}
                </div>
                {form.formState.errors.feeCategory ? <p className="mt-1.5 text-[12px] text-clay">{form.formState.errors.feeCategory.message}</p> : null}
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {!isFee ? <Field label="قيمة الدورة" error={form.formState.errors.courseValue?.message}>{(control) => <Input type="number" min="0" step="1" placeholder="0" readOnly={isEdit} className="figure" {...control} {...form.register('courseValue', { valueAsNumber: true })} />}</Field> : null}
              <Field label="تاريخ الدفع" error={form.formState.errors.paymentDate?.message}>{(control) => isEdit ? <Input readOnly dir="ltr" className="figure" value={formatDate(paymentDate)} {...control} /> : <SmartDateInput max={maxDate} value={paymentDate} onChange={(iso) => form.setValue('paymentDate', iso, { shouldValidate: true })} {...control} />}</Field>
            </div>
            {!isFee && selectedCourse ? (
              <p className="text-[12.5px] text-muted-foreground">
                الرصيد المستحقّ لهذه الدورة: <span className="figure font-semibold text-warn">{formatNumber(selectedCourse.remaining)}</span>
              </p>
            ) : null}
            <Field label={isFee ? 'إجمالي الرسم' : 'المبلغ المقبوض'} error={form.formState.errors.amountReceived?.message}>
              {(control) => (
                <div className="flex items-center gap-2 rounded-xl border border-olive/30 bg-olive-weak/40 px-4 py-1 focus-within:border-olive">
                  <input type="number" min="1" step="1" inputMode="numeric" readOnly={isEdit} className="figure h-12 w-full bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-faint" placeholder="0" {...control} {...form.register('amountReceived', { valueAsNumber: true })} />
                  <span className="text-sm font-medium text-muted-foreground">{currencySymbol}</span>
                </div>
              )}
            </Field>
            {isFee && feeCategory === 'shared' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="حصة الجهة الخارجية" error={form.formState.errors.externalShare?.message}>{(control) => <Input type="number" min="0" step="1" inputMode="numeric" placeholder="0" className="figure" {...control} {...form.register('externalShare', { valueAsNumber: true })} />}</Field>
                <div className="flex flex-col justify-center rounded-xl border border-border bg-panel px-4 py-2">
                  <span className="text-[12px] font-medium text-muted-foreground">حصة المعهد</span>
                  <span className="figure text-lg font-semibold text-olive">{formatNumber(instituteShare)}</span>
                </div>
              </div>
            ) : null}
            <Field label="اسم الدافع (اختياري)" error={form.formState.errors.payerName?.message}>{(control) => <Input placeholder="اسم من يدفع نيابةً عن الطالب" {...control} {...form.register('payerName')} />}</Field>
            <Field label="الملاحظات (اختياري)" error={form.formState.errors.notes?.message}>{(control) => <Textarea placeholder="ملاحظات اختيارية" {...control} {...form.register('notes')} />}</Field>
            <Button type="submit" size="lg" className="w-full" disabled={busy}><ArrowDownLeft className="size-4" />{busy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ التعديل' : isFee ? 'حفظ الرسم' : 'حفظ سند القبض'}</Button>
          </form>
        )}
      </ActionSheet>
      {savedVoucher ? <VoucherPrint movement={savedVoucher} onClose={closeOverlay} /> : null}
    </>
  )
}
