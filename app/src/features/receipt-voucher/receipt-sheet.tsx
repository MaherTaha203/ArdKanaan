import { useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
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
import { formatNumber, todayIsoDate } from '@/lib/format'
import { toWesternDigits } from '@/lib/numbers'
import { useMoneyInStore } from '@/store/use-money-in-store'
import { useSettingsStore } from '@/store/use-settings-store'
import { useShellStore } from '@/store/use-shell-store'
import { useToastStore } from '@/components/ui/use-toast-store'
import { useVoucherAdminStore } from '@/store/use-voucher-admin-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import type { FinancialMovement, FeeObligation } from '@/types/domain'

type SavedReceiptPrint = FinancialMovement & {
  allocations: Array<{ type: 'course' | 'fee'; label: string; amount: number }>
  autoPrint: boolean
}

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
  const [savedVoucher, setSavedVoucher] = useState<SavedReceiptPrint | null>(null)

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
  function addCourseAllocation(course: { enrollmentId?: string; courseName: string; fee: number; remaining: number }) {
    const enrollment = course.enrollmentId ? studentEnrollments.find((item) => item.id === course.enrollmentId) : undefined
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
    const maxRemaining = current.type === 'course'
      ? studentCourses.find((course) => course.enrollmentId === current.enrollmentId)?.remaining
      : studentFees.find((item) => item.fee.id === current.feeObligationId)?.remaining
    if (maxRemaining == null || amount > maxRemaining) {
      form.setError('amountReceived', { message: `المبلغ لا يمكن أن يتجاوز الذمة المتبقية (${formatNumber(maxRemaining ?? 0)})` })
      return
    }
    form.clearErrors('amountReceived')
    const next = watchedAllocations.slice(); next[index] = { ...current, amount }; setAllocations(next)
  }
  function normalizeDigits(value: string) {
    return toWesternDigits(value).replace(/[^0-9]/g, '')
  }
  function updateReceiptAmount(rawValue: string) {
    const normalized = normalizeDigits(rawValue)
    const amount = normalized ? Number(normalized) : undefined
    if (watchedAllocations.length === 1) {
      if (amount == null) return
      const allocation = watchedAllocations[0]
      const maxRemaining = allocation.type === 'course'
        ? studentCourses.find((course) => course.enrollmentId === allocation.enrollmentId)?.remaining
        : studentFees.find((item) => item.fee.id === allocation.feeObligationId)?.remaining
      if (amount <= 0 || maxRemaining == null || amount > maxRemaining) {
        form.setError('amountReceived', { message: `المبلغ لا يمكن أن يتجاوز الذمة المتبقية (${formatNumber(maxRemaining ?? 0)})` })
        return
      }
      form.clearErrors('amountReceived')
      updateAllocation(0, amount)
      return
    }
    if (amount == null) form.resetField('amountReceived')
    else form.setValue('amountReceived', amount, { shouldValidate: true, shouldDirty: true })
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
    const printableAllocations = values.allocations.map((allocation) => {
      if (allocation.type === 'course') {
        const enrollment = allocation.enrollmentId ? studentEnrollments.find((item) => item.id === allocation.enrollmentId) : undefined
        return { type: 'course' as const, label: enrollment?.courseName ?? 'دورة', amount: allocation.amount }
      }
      const fee = allocation.feeObligationId ? studentFees.find((item) => item.fee.id === allocation.feeObligationId)?.fee : undefined
      return { type: 'fee' as const, label: fee?.description ?? 'رسم', amount: allocation.amount }
    })
    const currentStudent = useMoneyInStore.getState().activeStudent
    setSavedVoucher({
      id: saved.id,
      movementType: 'receipt',
      voucherNumber: saved.voucherNumber,
      voucherDate: saved.voucherDate,
      amount: saved.amount,
      partyName: currentStudent?.name ?? saved.studentName,
      context: printableAllocations.length === 1 ? printableAllocations[0].label : 'تحصيل متعدّد',
      allocations: printableAllocations,
      autoPrint: true,
    })
    await reloadWorkspace()
    const refreshedStudent = useMoneyInStore.getState().activeStudent
    if (refreshedStudent) selectStudent(refreshedStudent.id)
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
        {!isEdit && pickedStudentId ? <section className="space-y-3 border-y border-border py-4"><div><div className="text-[13px] font-semibold text-foreground">بنود التحصيل</div></div>
          {studentCourses.filter((course) => course.remaining > 0).map((course) => { const selected = course.enrollmentId ? watchedAllocations.some((item) => item.type === 'course' && item.enrollmentId === course.enrollmentId) : false; return <button key={course.enrollmentId ?? `legacy-${course.courseName}`} type="button" disabled={!course.enrollmentId || selected} onClick={() => addCourseAllocation(course)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-border-strong bg-panel px-4 py-3 text-start disabled:opacity-60"><span className="min-w-0"><span className="block text-sm font-semibold text-foreground">{course.courseName}</span><span className="text-[12px] text-muted-foreground">متبقّي الدورة: {formatNumber(course.remaining)}</span></span><span className="text-[12px] font-medium text-olive">{selected ? 'مضاف' : 'إضافة'}</span></button> })}
          {studentFees.map((item) => { const selected = watchedAllocations.some((allocation) => allocation.type === 'fee' && allocation.feeObligationId === item.fee.id); return <button key={item.fee.id} type="button" disabled={selected} onClick={() => addFeeAllocation(item)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-border-strong bg-panel px-4 py-3 text-start disabled:opacity-60"><span className="min-w-0"><span className="block text-sm font-semibold text-foreground">{item.fee.description}</span><span className="text-[12px] text-muted-foreground">رسم · متبقّي: {formatNumber(item.remaining)} · {item.fee.feeCategory === 'institute' ? 'للمعهد' : item.fee.feeCategory === 'external' ? 'لجهة خارجية' : 'مشترك'}</span></span><span className="text-[12px] font-medium text-olive">{selected ? 'مضاف' : 'إضافة'}</span></button> })}
          {studentCourses.every((course) => course.remaining <= 0) && studentFees.length === 0 ? <p className="py-5 text-center text-sm text-faint">لا توجد مستحقات مفتوحة لهذا الطالب.</p> : null}
          {hasAllocations ? <div className="space-y-2 pt-2">{watchedAllocations.map((allocation, index) => { const label = allocation.type === 'fee' ? feeObligations.find((fee) => fee.id === allocation.feeObligationId)?.description ?? 'رسم' : enrollments.find((enrollment) => enrollment.id === allocation.enrollmentId)?.courseName ?? 'دورة'; const fee = allocation.type === 'fee' ? feeObligations.find((item) => item.id === allocation.feeObligationId) : null; return <div key={`${allocation.type}-${allocation.enrollmentId ?? allocation.feeObligationId}`} className="flex items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2.5"><span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{label}{fee ? ` · ${fee.feeCategory === 'institute' ? 'للمعهد' : fee.feeCategory === 'external' ? 'لجهة خارجية' : 'مشترك'}` : ''}</span><input type="text" inputMode="numeric" dir="ltr" minLength={1} value={allocation.amount} onChange={(event) => { const normalized = normalizeDigits(event.currentTarget.value); event.currentTarget.value = normalized; if (normalized) updateAllocation(index, Number(normalized)) }} className="figure-input w-28 rounded-lg border border-border bg-background px-2 py-1.5 text-sm" aria-label={`مبلغ تحصيل ${label}`} /><button type="button" aria-label={`حذف ${label}`} onClick={() => removeAllocation(index)} className="p-1.5 text-muted-foreground" title="حذف"><Trash2 className="size-4" /></button></div> })}<div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold"><span>إجمالي البنود</span><span>{formatNumber(selectedAmount)} {currencySymbol}</span></div></div> : null}
        </section> : null}
        <div className="grid gap-4 sm:grid-cols-2"><Field label="تاريخ السند">{(control) => <SmartDateInput {...control} value={paymentDate} max={maxDate} onChange={(iso) => form.setValue('paymentDate', iso, { shouldValidate: true })} />}</Field><Field label="المبلغ المقبوض" error={form.formState.errors.amountReceived?.message}>{(control) => <Input key={`${pickedStudentId}-${watchedAllocations.map((item) => item.enrollmentId ?? item.feeObligationId).join('|')}`} {...control} {...form.register('amountReceived')} type="text" inputMode="numeric" dir="ltr" defaultValue={watchedAllocations.length > 0 ? String(selectedAmount) : ''} onChange={(event) => { const normalized = normalizeDigits(event.currentTarget.value); event.currentTarget.value = normalized; updateReceiptAmount(normalized) }} onBlur={(event) => { const normalized = normalizeDigits(event.currentTarget.value); if (!normalized || Number(normalized) <= 0 || form.formState.errors.amountReceived) event.currentTarget.value = watchedAllocations.length > 0 ? String(selectedAmount) : '' }} readOnly={watchedAllocations.length > 1} placeholder="أدخل المبلغ أو اختر بند التحصيل" />}</Field></div>
        <Field label="اسم الدافع">{(control) => <Input {...control} placeholder="اختياري" />}</Field>
        <Field label="ملاحظات">{(control) => <Textarea {...control} rows={3} placeholder="اختياري" />}</Field>
        <Button type="button" size="lg" className="w-full" disabled={busy} onClick={buildAndSubmit}>{busy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ التعديل' : 'حفظ سند القبض'}</Button>
      </form>}
    </ActionSheet>
    {savedVoucher ? <VoucherPrint movement={savedVoucher} allocations={savedVoucher.allocations} autoPrint={savedVoucher.autoPrint} onClose={closeOverlay} /> : null}
  </>
}
