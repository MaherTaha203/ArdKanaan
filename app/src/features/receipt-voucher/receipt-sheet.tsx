import { useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDownLeft, Trash2 } from 'lucide-react'
import { useForm, useWatch, type DefaultValues } from 'react-hook-form'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SmartDateInput } from '@/components/ui/smart-date-input'
import { Textarea } from '@/components/ui/textarea'
import { VoucherPrint } from '@/features/print/voucher-print'
import { receiptVoucherFormSchema, type ReceiptAllocationFormValue, type ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'
import { StudentPicker } from '@/features/receipt-voucher/student-picker'
import { studentCourseBreakdown } from '@/lib/aggregate'
import { formatDate, formatNumber, todayIsoDate } from '@/lib/format'
import { useMoneyInStore } from '@/store/use-money-in-store'
import { useSettingsStore } from '@/store/use-settings-store'
import { useShellStore } from '@/store/use-shell-store'
import { useToastStore } from '@/components/ui/use-toast-store'
import { useVoucherAdminStore } from '@/store/use-voucher-admin-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import type { FinancialMovement, FeeObligation } from '@/types/domain'

function buildDefaults(studentName: string | null): DefaultValues<ReceiptVoucherFormValues> {
  return { paymentDate: todayIsoDate(), studentName: studentName ?? '', studentId: '', studentIdNumber: '', studentPhone: '', courseName: '', courseValue: undefined, amountReceived: undefined, payerName: '', notes: '', entryType: 'course', feeCategory: undefined, externalShare: undefined, allocations: [] }
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
  const feeObligations = useWorkspaceStore((state) => state.feeObligations)
  const currencySymbol = useSettingsStore((state) => state.settings.currencySymbol)
  const maxAmount = useSettingsStore((state) => state.settings.maxVoucherAmount)
  const blockFutureDate = useSettingsStore((state) => state.settings.blockFutureDate)
  const maxDate = blockFutureDate ? todayIsoDate() : undefined
  const [loadingEdit, setLoadingEdit] = useState(isEdit)
  const [editStudentName, setEditStudentName] = useState('')
  const [savedVoucher, setSavedVoucher] = useState<FinancialMovement | null>(null)

  const form = useForm<ReceiptVoucherFormValues>({ resolver: zodResolver(receiptVoucherFormSchema, undefined, { mode: 'sync' }), defaultValues: buildDefaults(prefillName) })
  const paymentDate = useWatch({ control: form.control, name: 'paymentDate' }) ?? ''
  const pickedStudentId = useWatch({ control: form.control, name: 'studentId' }) ?? ''
  const watchedAllocations = useWatch({ control: form.control, name: 'allocations' }) ?? []

  const studentCourses = useMemo(() => (!isEdit && pickedStudentId ? studentCourseBreakdown(pickedStudentId, statementLines, enrollments) : []), [isEdit, pickedStudentId, statementLines, enrollments])
  const studentEnrollments = useMemo(() => (pickedStudentId ? enrollments.filter((item) => item.studentId === pickedStudentId) : []), [pickedStudentId, enrollments])
  const studentFees = useMemo(() => {
    if (!pickedStudentId) return []
    return feeObligations.filter((fee) => fee.studentId === pickedStudentId && !fee.cancelledAt).map((fee) => {
      const paid = statementLines.filter((line) => line.entryType === 'fee' && line.feeObligationId === fee.id).reduce((sum, line) => sum + line.amountReceived, 0)
      return { fee, remaining: Math.max(0, fee.amount - paid) }
    }).filter((item) => item.remaining > 0)
  }, [pickedStudentId, feeObligations, statementLines])

  useLayoutEffect(() => { clearError(); clearAdminError() }, [clearError, clearAdminError])
  useEffect(() => { if (!pickedStudentId) return; form.setValue('allocations', [], { shouldValidate: false }); form.resetField('amountReceived') }, [pickedStudentId, form])
  useEffect(() => {
    if (!editVoucherId) return
    let active = true
    void (async () => {
      const data = await fetchReceipt(editVoucherId)
      if (!active) return
      if (data) {
        setEditStudentName(data.studentName)
        form.reset({ paymentDate: data.paymentDate, studentName: data.studentName, studentId: '', studentIdNumber: '', studentPhone: '', courseName: data.courseName, courseValue: data.courseValue, amountReceived: data.amountReceived, payerName: data.payerName, notes: data.notes, entryType: 'course', feeCategory: undefined, externalShare: undefined, allocations: [] })
      }
      setLoadingEdit(false)
    })()
    return () => { active = false }
  }, [editVoucherId, fetchReceipt, form])

  const selectedAmount = watchedAllocations.reduce((sum, item) => sum + item.amount, 0)
  const activeType: 'course' | 'fee' | 'mixed' = watchedAllocations.length === 0 ? 'course' : watchedAllocations.every((item) => item.type === 'fee') ? 'fee' : watchedAllocations.every((item) => item.type === 'course') ? 'course' : 'mixed'

  function setAllocations(next: ReceiptAllocationFormValue[]) {
    form.setValue('allocations', next, { shouldValidate: false, shouldDirty: true })
    if (next.length > 0) form.setValue('amountReceived', next.reduce((sum, item) => sum + item.amount, 0), { shouldValidate: false, shouldDirty: true })
    else form.resetField('amountReceived')
  }
  function addCourseAllocation(course: { courseName: string; fee: number; remaining: number }) {
    const enrollment = studentEnrollments.find((item) => item.courseName === course.courseName)
    if (!enrollment || course.remaining <= 0 || watchedAllocations.some((item) => item.type === 'course' && item.enrollmentId === enrollment.id)) return
    setAllocations([...watchedAllocations, { type: 'course', enrollmentId: enrollment.id, amount: course.remaining }])
  }
  function addFeeAllocation(item: { fee: FeeObligation; remaining: number }) {
    if (item.remaining <= 0 || watchedAllocations.some((allocation) => allocation.type === 'fee' && allocation.feeObligationId === item.fee.id)) return
    setAllocations([...watchedAllocations, { type: 'fee', feeObligationId: item.fee.id, amount: item.remaining }])
  }
  function updateAllocation(index: number, amount: number) {
    const current = watchedAllocations[index]
    if (!current || !Number.isInteger(amount) || amount <= 0) return
    const next = watchedAllocations.slice(); next[index] = { ...current, amount }; setAllocations(next)
  }
  function removeAllocation(index: number) { setAllocations(watchedAllocations.filter((_, itemIndex) => itemIndex !== index)) }

  async function onSubmit(values: ReceiptVoucherFormValues) {
    if (isEdit && editVoucherId) {
      const ok = await updateReceipt(editVoucherId, values); if (!ok) return
      await reloadWorkspace(); useToastStore.getState().show('تم حفظ التعديل'); closeOverlay(); return
    }
    if (values.amountReceived > maxAmount) { form.setError('amountReceived', { message: `المبلغ أكبر من الحدّ المسموح (${formatNumber(maxAmount)})` }); return }
    if (values.courseValue != null && values.courseValue > maxAmount) { form.setError('courseValue', { message: `القيمة أكبر من الحدّ المسموح (${formatNumber(maxAmount)})` }); return }
    const saved = await saveReceiptVoucher({ ...values, entryType: activeType }); if (!saved) return
    await reloadWorkspace()
    const activeStudent = useMoneyInStore.getState().activeStudent
    const latestLine = useMoneyInStore.getState().statementLines.at(-1)
    if (activeStudent) selectStudent(activeStudent.id)
    if (latestLine) setSavedVoucher({ id: latestLine.id, movementType: 'receipt', voucherNumber: latestLine.voucherNumber, voucherDate: latestLine.voucherDate, amount: values.amountReceived, partyName: latestLine.studentName, context: latestLine.courseName })
    useToastStore.getState().show('رُحّل سند القبض بنجاح')
  }

  function buildAndSubmit() {
    const current = form.getValues()
    const values: ReceiptVoucherFormValues = {
      ...current,
      allocations: watchedAllocations,
      amountReceived: watchedAllocations.length > 0 ? selectedAmount : current.amountReceived,
      entryType: activeType,
    }

    // Allocation mode is assembled from the rendered, already-validated controls.
    // Do not send it through RHF's resolver again: that resolver is coupled to the
    // legacy single-course fields, while allocation mode deliberately leaves those
    // fields empty. The store/RPC remain the authoritative validation boundary.
    if (values.allocations.length > 0) {
      void onSubmit(values)
      return
    }

    const result = receiptVoucherFormSchema.safeParse(values)
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') form.setError(field as keyof ReceiptVoucherFormValues, { type: issue.code, message: issue.message })
      }
      return
    }
    void onSubmit(result.data)
  }

  const busy = isEdit ? adminBusy : isSaving
  const showError = error || adminError
  const hasAllocations = watchedAllocations.length > 0

  return <>
    <ActionSheet title="سند قبض" onClose={closeOverlay}>
      {showError ? <div role="alert" className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">{isEdit ? adminError ?? 'تعذّر حفظ التعديل.' : error ?? 'تعذّر حفظ السند.'}</div> : null}
      {loadingEdit ? <p className="py-10 text-center text-sm text-faint">جارٍ تحميل السند…</p> : savedVoucher ? <div className="py-3"><p className="mb-4 text-center text-sm font-semibold text-foreground">تم حفظ السند</p><Button type="button" variant="outline" className="w-full" onClick={closeOverlay}>إغلاق بعد الطباعة</Button></div> : <form className="space-y-4" noValidate>
        {isEdit ? <Field label="اسم الطالب">{(control) => <Input {...control} value={editStudentName} readOnly />}</Field> : <StudentPicker form={form} students={students} />}
        {!isEdit && pickedStudentId ? <section className="space-y-3 border-y border-border py-4"><div><div className="text-[13px] font-semibold text-foreground">بنود التحصيل</div><p className="mt-1 text-[12px] text-muted-foreground">أضف الدورة والرسوم التي سيدفعها الطالب، ثم يصدرها النظام في سند قبض واحد.</p></div>
          {studentCourses.filter((course) => course.remaining > 0).map((course) => { const enrollment = studentEnrollments.find((item) => item.courseName === course.courseName); const selected = enrollment ? watchedAllocations.some((item) => item.type === 'course' && item.enrollmentId === enrollment.id) : false; return <button key={course.courseName} type="button" disabled={!enrollment || selected} onClick={() => addCourseAllocation(course)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-border-strong bg-panel px-4 py-3 text-start disabled:opacity-60"><span className="min-w-0"><span className="block text-sm font-semibold text-foreground">{course.courseName}</span><span className="text-[12px] text-muted-foreground">متبقّي الدورة: {formatNumber(course.remaining)}</span></span><span className="text-[12px] font-medium text-olive">{selected ? 'مضاف' : 'إضافة'}</span></button> })}
          {studentFees.map((item) => { const selected = watchedAllocations.some((allocation) => allocation.type === 'fee' && allocation.feeObligationId === item.fee.id); return <button key={item.fee.id} type="button" disabled={selected} onClick={() => addFeeAllocation(item)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-border-strong bg-panel px-4 py-3 text-start disabled:opacity-60"><span className="min-w-0"><span className="block text-sm font-semibold text-foreground">{item.fee.description}</span><span className="text-[12px] text-muted-foreground">رسم · متبقّي: {formatNumber(item.remaining)} · {item.fee.feeCategory === 'institute' ? 'للمعهد' : item.fee.feeCategory === 'external' ? 'لجهة خارجية' : 'مشترك'}</span></span><span className="text-[12px] font-medium text-olive">{selected ? 'مضاف' : 'إضافة'}</span></button> })}
          {studentCourses.every((course) => course.remaining <= 0) && studentFees.length === 0 ? <p className="py-5 text-center text-sm text-faint">لا توجد مستحقات مفتوحة لهذا الطالب.</p> : null}
          {hasAllocations ? <div className="space-y-2 pt-2">{watchedAllocations.map((allocation, index) => { const label = allocation.type === 'fee' ? feeObligations.find((fee) => fee.id === allocation.feeObligationId)?.description ?? 'رسم' : enrollments.find((enrollment) => enrollment.id === allocation.enrollmentId)?.courseName ?? 'دورة'; const fee = allocation.type === 'fee' ? feeObligations.find((item) => item.id === allocation.feeObligationId) : null; return <div key={`${allocation.type}-${allocation.enrollmentId ?? allocation.feeObligationId}`} className="flex items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2.5"><span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{label}{fee ? ` · ${fee.feeCategory === 'institute' ? 'للمعهد' : fee.feeCategory === 'external' ? 'لجهة خارجية' : 'مشترك'}` : ''}</span><input type="number" min="1" step="1" value={allocation.amount} readOnly={allocation.type === 'fee'} onChange={(event) => updateAllocation(index, Number(event.target.value))} className="figure w-28 rounded-lg border border-border-strong bg-transparent px-2 py-1.5 text-end text-sm outline-none" aria-label={`قيمة ${label}`} /><button type="button" className="p-1 text-muted-foreground" onClick={() => removeAllocation(index)} aria-label={`إزالة ${label}`}><Trash2 className="size-4" /></button></div> })}</div> : null}
        </section> : null}
        {!hasAllocations ? <><Field label="اسم الدورة" error={form.formState.errors.courseName?.message}>{(control) => <Input placeholder="اكتب اسم الدورة" readOnly={isEdit} {...control} {...form.register('courseName')} />}</Field><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="قيمة الدورة" error={form.formState.errors.courseValue?.message}>{(control) => <Input type="number" min="0" step="1" placeholder="0" readOnly={isEdit} className="figure" {...control} {...form.register('courseValue', { valueAsNumber: true })} />}</Field><Field label="تاريخ الدفع" error={form.formState.errors.paymentDate?.message}>{(control) => isEdit ? <Input readOnly dir="ltr" className="figure" value={formatDate(paymentDate)} {...control} /> : <SmartDateInput max={maxDate} value={paymentDate} onChange={(iso) => form.setValue('paymentDate', iso, { shouldValidate: true })} {...control} />}</Field></div></> : <Field label="تاريخ الدفع" error={form.formState.errors.paymentDate?.message}>{(control) => <SmartDateInput max={maxDate} value={paymentDate} onChange={(iso) => form.setValue('paymentDate', iso, { shouldValidate: true })} {...control} />}</Field>}
        <Field label="المبلغ المقبوض" error={form.formState.errors.amountReceived?.message}>{(control) => <div className="flex items-center gap-2 rounded-xl border border-olive/30 bg-olive-weak/40 px-4 py-1 focus-within:border-olive"><input type="number" min="1" step="1" inputMode="numeric" readOnly={hasAllocations} className="figure h-12 w-full bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-faint" placeholder="0" {...control} {...form.register('amountReceived', { valueAsNumber: true })} /><span className="text-sm font-medium text-muted-foreground">{currencySymbol}</span></div>}</Field>
        {hasAllocations ? <p className="text-[12.5px] text-muted-foreground">إجمالي البنود: <span className="figure font-semibold text-foreground">{formatNumber(selectedAmount)}</span></p> : null}
        <Field label="اسم الدافع (اختياري)" error={form.formState.errors.payerName?.message}>{(control) => <Input placeholder="اسم من يدفع نيابةً عن الطالب" {...control} {...form.register('payerName')} />}</Field>
        <Field label="الملاحظات (اختياري)" error={form.formState.errors.notes?.message}>{(control) => <Textarea placeholder="ملاحظات اختيارية" {...control} {...form.register('notes')} />}</Field>
        <Button type="button" size="lg" className="w-full" disabled={busy} onClick={buildAndSubmit}><ArrowDownLeft className="size-4" />{busy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ التعديل' : 'حفظ سند القبض'}</Button>
      </form>}
    </ActionSheet>
    {savedVoucher ? <VoucherPrint movement={savedVoucher} onClose={closeOverlay} /> : null}
  </>
}
