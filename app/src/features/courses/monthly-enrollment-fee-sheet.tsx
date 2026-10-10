import { useMemo, useState, type ReactNode } from 'react'

import { Coins, TriangleAlert } from 'lucide-react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Money } from '@/components/ui/money'
import { Textarea } from '@/components/ui/textarea'
import { useToastStore } from '@/components/ui/use-toast-store'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// A per-enrollment override affects future monthly obligations only. Existing
// fee obligations, receipts, allocations, and ledger entries remain immutable.
export function MonthlyEnrollmentFeeSheet() {
  const closeOverlay = useShellStore((state) => state.closeOverlay)
  const enrollmentId = useShellStore((state) => state.editFeeEnrollmentId)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const courses = useWorkspaceStore((state) => state.courses)
  const students = useWorkspaceStore((state) => state.students)
  const reloadWorkspace = useWorkspaceStore((state) => state.load)

  const enrollment = useMemo(
    () => enrollments.find((item) => item.id === enrollmentId && item.billingModel === 'monthly') ?? null,
    [enrollments, enrollmentId],
  )
  const course = useMemo(
    () => enrollment ? courses.find((item) => item.id === enrollment.courseId) ?? null : null,
    [courses, enrollment],
  )
  const student = useMemo(
    () => enrollment ? students.find((item) => item.id === enrollment.studentId) ?? null : null,
    [students, enrollment],
  )
  const [amount, setAmount] = useState(() => {
    const selected = useWorkspaceStore.getState().enrollments.find((item) => item.id === useShellStore.getState().editFeeEnrollmentId)
    const selectedCourse = useWorkspaceStore.getState().courses.find((item) => item.id === selected?.courseId)
    const initial = selected?.monthlyFeeOverride ?? selectedCourse?.monthlyFee
    return initial == null ? '' : String(initial)
  })
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amountValid = /^[0-9]+$/.test(amount) && Number.isSafeInteger(Number(amount)) && Number(amount) > 0 && Number(amount) <= 100000000
  const currentAmount = enrollment?.monthlyFeeOverride ?? course?.monthlyFee ?? null
  const unchanged = amountValid && Number(amount) === currentAmount && enrollment?.monthlyFeeOverride != null
  const canSubmit = Boolean(enrollment && course && amountValid && reason.trim() && !unchanged && !busy)

  async function onSubmit() {
    if (!canSubmit || !enrollment) return
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setError('الاتصال بقاعدة البيانات غير مهيأ بعد.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { error: rpcError } = await supabase.rpc('update_monthly_enrollment_fee', {
        p_enrollment_id: enrollment.id,
        p_amount: Number(amount),
        p_reason: reason.trim(),
      })
      if (rpcError) throw rpcError
      await reloadWorkspace()
      useToastStore.getState().show('تم تعديل الاشتراك الشهري لهذا الطالب')
      closeOverlay()
    } catch (cause) {
      const message = cause && typeof cause === 'object' && 'message' in cause ? String((cause as { message: unknown }).message) : ''
      setError(message.includes('OWNER_ONLY')
        ? 'غير مصرّح لك بتعديل رسوم الاشتراك الشهري.'
        : message.includes('MONTHLY_ENROLLMENT_NOT_FOUND')
          ? 'هذا التسجيل غير موجود أو ليس اشتراكًا شهريًا.'
          : message.includes('MONTHLY_FEE_ADJUSTMENT_REASON_REQUIRED')
            ? 'أدخل سبب التعديل.'
            : message.includes('INVALID_MONTHLY_FEE_AMOUNT')
              ? 'أدخل مبلغًا صحيحًا موجبًا بالأرقام الإنجليزية ومن دون كسور.'
              : 'تعذّر حفظ تعديل الاشتراك الشهري. لم تُعدّل الاستحقاقات أو السجلات السابقة.')
    } finally {
      setBusy(false)
    }
  }

  if (!enrollment || !course || !student) {
    return <ActionSheet title="تعديل الاشتراك الشهري" eyebrow="ملف الطالب" onClose={closeOverlay}>
      <p className="py-10 text-center text-sm text-muted-foreground">تعذّر العثور على تسجيل شهري صالح.</p>
    </ActionSheet>
  }

  return (
    <ActionSheet title="تعديل الاشتراك الشهري" eyebrow={course.name} onClose={closeOverlay}>
      <p className="text-sm text-muted-foreground">
        تعديل سعر الاشتراك الشهري لهذا الطالب في هذه الدورة فقط. سيُستخدم السعر الجديد عند إنشاء الاستحقاقات الشهرية المستقبلية. الاستحقاقات التي أُنشئت سابقًا وسندات القبض والتخصيصات والسجل المالي لا تتغير.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Summary label="الطالب" value={student.name} />
        <Summary label="السعر الافتراضي للدورة" value={course.monthlyFee == null ? '—' : <Money value={course.monthlyFee} currency={false} />} />
        <Summary label="السعر الحالي لهذا الطالب" value={currentAmount == null ? '—' : <Money value={currentAmount} currency={false} />} />
      </div>
      {error ? <div role="alert" className="mt-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">{error}</div> : null}
      <div className="mt-5 space-y-4">
        <label className="block text-[13px] font-medium text-muted-foreground">
          الاشتراك الشهري الجديد (بالأرقام الإنجليزية)
          <Input className="mt-1.5 figure" type="text" inputMode="numeric" autoComplete="off" value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ''))} placeholder="0" />
        </label>
        <label className="block text-[13px] font-medium text-muted-foreground">
          سبب التعديل (إلزامي)
          <Textarea className="mt-1.5" value={reason} onChange={(event) => setReason(event.target.value)}
            placeholder="اكتب سبب تعديل اشتراك هذا الطالب؛ سيُحفظ في سجل التدقيق." />
        </label>
      </div>
      {amountValid && currentAmount != null && Number(amount) !== currentAmount ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-highlight px-4 py-3 text-sm text-foreground">
          <TriangleAlert className="mt-0.5 size-4 flex-none" />
          <span>سيصبح سعر هذا الطالب <Money value={Number(amount)} currency={false} className="font-bold" /> بدلًا من <Money value={currentAmount} currency={false} className="font-bold" />. لن يتغير السعر الافتراضي للدورة أو أسعار الطلاب الآخرين.</span>
        </div>
      ) : null}
      <Button type="button" size="lg" className="mt-5 w-full" disabled={!canSubmit} onClick={onSubmit}>
        <Coins className="size-4" />
        {busy ? 'جارٍ الحفظ…' : 'حفظ سعر الاشتراك'}
      </Button>
    </ActionSheet>
  )
}

function Summary({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-xl border border-border bg-panel px-3 py-2.5">
    <div className="text-[11.5px] text-muted-foreground">{label}</div>
    <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
  </div>
}
