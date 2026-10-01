import { useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { Coins, TriangleAlert } from 'lucide-react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Money } from '@/components/ui/money'
import { Textarea } from '@/components/ui/textarea'
import { useToastStore } from '@/components/ui/use-toast-store'

import { useEnrollmentFeeStore } from '@/store/use-enrollment-fee-store'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// ADR-0078 — owner adjusts the total registration fee (course_value) for ONE
// enrollment. The base course price is shown for context but is never changed.
// The new fee is floored server-side at the amount already collected; the UI
// mirrors that floor and never optimistically changes any displayed balance —
// it reloads the authoritative workspace after the RPC confirms.
export function EnrollmentFeeSheet() {
  const closeOverlay = useShellStore((state) => state.closeOverlay)
  const editFeeEnrollmentId = useShellStore((state) => state.editFeeEnrollmentId)

  const courses = useWorkspaceStore((state) => state.courses)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const students = useWorkspaceStore((state) => state.students)
  const courseFinancialRows = useWorkspaceStore((state) => state.courseFinancialRows)
  const loadCourseFinancialRoster = useWorkspaceStore((state) => state.loadCourseFinancialRoster)
  const reloadWorkspace = useWorkspaceStore((state) => state.load)

  const updateFee = useEnrollmentFeeStore((state) => state.updateFee)
  const isBusy = useEnrollmentFeeStore((state) => state.isBusy)
  const error = useEnrollmentFeeStore((state) => state.error)
  const clearError = useEnrollmentFeeStore((state) => state.clearError)

  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!enrollment) return
    void loadCourseFinancialRoster(enrollment.courseId).catch((error) => console.error('course roster load failed', error))
  }, [enrollment, loadCourseFinancialRoster])

  const enrollment = useMemo(
    () => enrollments.find((item) => item.id === editFeeEnrollmentId) ?? null,
    [enrollments, editFeeEnrollmentId],
  )
  const course = useMemo(
    () => (enrollment ? courses.find((item) => item.id === enrollment.courseId) ?? null : null),
    [courses, enrollment],
  )
  const student = useMemo(
    () => (enrollment ? students.find((item) => item.id === enrollment.studentId) ?? null : null),
    [students, enrollment],
  )

  // Reuse the authoritative roster derivation (voucher-sourced) for paid/remaining.
  const entry = useMemo(() => {
    if (!course || !enrollment) return null
    const row = courseFinancialRows.find((item) => item.enrollmentId === enrollment.id)
    if (!row) return null
    return { enrollment, student, fee: enrollment.courseValue, paid: row.paid, remaining: row.remaining }
  }, [course, enrollment, student, courseFinancialRows])

  useLayoutEffect(() => {
    clearError()
  }, [clearError])

  if (!enrollment || !entry) {
    return (
      <ActionSheet title="تعديل رسوم التسجيل" eyebrow="الدورات" onClose={closeOverlay}>
        <p className="py-10 text-center text-sm text-faint">تعذّر العثور على التسجيل.</p>
      </ActionSheet>
    )
  }

  const currentFee = entry.fee
  const paid = entry.paid
  const amountNumber = Number(amount)
  const amountValid = amount.trim() !== '' && Number.isInteger(amountNumber) && amountNumber >= 0
  const belowCollected = amountValid && amountNumber < paid
  const unchanged = amountValid && amountNumber === currentFee
  const reasonValid = reason.trim() !== ''
  const canSubmit = amountValid && !belowCollected && !unchanged && reasonValid && !isBusy
  const newRemaining = amountValid ? amountNumber - paid : entry.remaining

  async function onSubmit() {
    if (!enrollment || !canSubmit) return
    const ok = await updateFee(enrollment.id, amountNumber, reason)
    if (!ok) return
    await reloadWorkspace()
    useToastStore.getState().show('تم تعديل رسوم التسجيل')
    closeOverlay()
  }

  return (
    <ActionSheet title="تعديل رسوم التسجيل" eyebrow="الدورات" onClose={closeOverlay}>
      {error ? <div role="alert" className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">{error}</div> : null}

      <p className="text-sm text-muted-foreground">
        تعديل إجمالي رسوم التسجيل للطالب «{student?.name ?? '—'}» في دورة «{course?.name ?? enrollment.courseName}». لا يغيّر ذلك السعر الأساسي للدورة، ولا يعدّل أو يحذف أي سند قبض أو تخصيص أو حركة في السجل المالي.
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCell label="السعر الأساسي للدورة" money={course?.baseFee ?? null} />
        <SummaryCell label="الرسوم الحالية" money={currentFee} tone="text-foreground" />
        <SummaryCell label="المحصّل" money={paid} tone="text-gold" />
        <SummaryCell label="المتبقّي الحالي" money={entry.remaining} tone={entry.remaining > 0 ? 'text-warn' : 'text-muted-foreground'} />
      </dl>

      <div className="mt-5 space-y-4">
        <label className="block text-[13px] font-medium text-muted-foreground">
          الرسوم الجديدة
          <Input
            className="mt-1.5 figure"
            inputMode="numeric"
            type="number"
            min={paid}
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={String(currentFee)}
          />
          <span className="mt-1 flex items-center gap-1 text-[12px] text-faint">لا يمكن أن تقلّ الرسوم الجديدة عن المبلغ المحصّل: <Money value={paid} currency={false} className="font-semibold" /></span>
        </label>

        <label className="block text-[13px] font-medium text-muted-foreground">
          سبب التعديل
          <Textarea className="mt-1.5" placeholder="سبب التعديل (إلزامي) — يُحفظ في سجل التدقيق" value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
      </div>

      {belowCollected ? (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 flex-none" />
          <span>لا يمكن أن تقلّ الرسوم الجديدة عن المبلغ المحصّل فعليًا (<Money value={paid} currency={false} className="font-bold" />).</span>
        </div>
      ) : amountValid && !unchanged ? (
        <div className="mt-4 rounded-xl border border-border bg-highlight px-4 py-3 text-sm text-foreground">
          مراجعة: تتغيّر الرسوم من <Money value={currentFee} currency={false} className="font-bold" /> إلى <Money value={amountNumber} currency={false} className="font-bold" />، ويصبح المتبقّي <Money value={newRemaining} currency={false} className="font-bold" />.
        </div>
      ) : null}

      <Button type="button" size="lg" variant="default" className="mt-5 w-full" disabled={!canSubmit} onClick={onSubmit}>
        <Coins className="size-4" />
        {isBusy ? 'جارٍ التعديل…' : 'تأكيد تعديل الرسوم'}
      </Button>
    </ActionSheet>
  )
}

function SummaryCell({ label, money, tone }: { label: string; money: number | null; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel px-3 py-2.5">
      <dt className="text-[11.5px] text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 ${tone ?? 'text-foreground'}`}>
        {money == null ? <span className="text-faint">—</span> : <Money value={money} currency={false} className="text-[15px] font-semibold" />}
      </dd>
    </div>
  )
}
