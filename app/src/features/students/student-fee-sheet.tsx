import { useMemo, useState } from 'react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatNumber } from '@/lib/format'
import { useFeeObligationStore } from '@/store/use-fee-obligation-store'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import type { FeeCategory } from '@/types/domain'

// ADR-0077: a fee added to a student directly. The course is OPTIONAL — leave it
// on "بدون دورة" for an independent obligation (exam, certificate, other), or pick
// a course to tie the fee to it (and to the student's enrollment when one exists).
const CATEGORIES: { id: FeeCategory; label: string }[] = [
  { id: 'institute', label: 'للمعهد' },
  { id: 'external', label: 'لجهة خارجية' },
  { id: 'shared', label: 'مشترك' },
]

export function StudentFeeSheet() {
  const feeStudentId = useShellStore((state) => state.feeStudentId)
  const closeOverlay = useShellStore((state) => state.closeOverlay)
  const students = useWorkspaceStore((state) => state.students)
  const courses = useWorkspaceStore((state) => state.courses)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const addFeeObligations = useFeeObligationStore((state) => state.addFeeObligations)
  const isSaving = useFeeObligationStore((state) => state.isSaving)
  const error = useFeeObligationStore((state) => state.error)
  const clearError = useFeeObligationStore((state) => state.clearError)

  const student = useMemo(() => students.find((item) => item.id === feeStudentId) ?? null, [students, feeStudentId])

  // The student's own courses first, plus any other active course.
  const courseOptions = useMemo(() => {
    const enrolledIds = new Set(enrollments.filter((item) => item.studentId === feeStudentId).map((item) => item.courseId))
    return courses
      .filter((course) => course.status === 'active' || enrolledIds.has(course.id))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
  }, [courses, enrollments, feeStudentId])

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<FeeCategory>('institute')
  const [externalShare, setExternalShare] = useState('')
  const [courseId, setCourseId] = useState('')

  const amountNumber = Number(amount)
  const externalNumber = category === 'institute' ? 0 : category === 'external' ? amountNumber : Number(externalShare)
  const instituteShare = Math.max(0, amountNumber - (Number.isFinite(externalNumber) ? externalNumber : 0))

  if (!student) return null

  async function submit() {
    clearError()
    const ok = await addFeeObligations({
      studentIds: [student!.id],
      courseId: courseId || null,
      description,
      amount: amountNumber,
      feeCategory: category,
      externalShare: externalNumber,
    })
    if (ok) closeOverlay()
  }

  const disabled =
    isSaving ||
    !description.trim() ||
    !Number.isInteger(amountNumber) ||
    amountNumber <= 0 ||
    (category === 'shared' && (!Number.isInteger(externalNumber) || externalNumber <= 0 || externalNumber >= amountNumber))

  return (
    <ActionSheet title={`إضافة رسم — ${student.name}`} onClose={closeOverlay}>
      <div className="space-y-5">
        {error ? <div role="alert" className="rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">{error}</div> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-[13px] font-medium text-muted-foreground">
            اسم الرسم
            <Input className="mt-1.5" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="مثال: رسوم امتحان" />
          </label>
          <label className="block text-[13px] font-medium text-muted-foreground">
            قيمة الرسم
            <Input className="mt-1.5 figure" inputMode="numeric" type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" />
          </label>
        </div>

        <label className="block text-[13px] font-medium text-muted-foreground">
          الدورة المرتبطة
          <select
            className="mt-1.5 w-full rounded-xl border border-border-strong bg-panel px-3 py-2.5 text-sm text-foreground"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
          >
            <option value="">بدون دورة (رسم مستقل)</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </label>

        <div>
          <div className="mb-1.5 text-[13px] font-medium text-muted-foreground">المستفيد</div>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setCategory(item.id); if (item.id === 'institute') setExternalShare(''); if (item.id === 'external') setExternalShare(amount) }} className={`rounded-xl border px-3 py-2 text-[13px] font-medium ${category === item.id ? 'border-olive bg-olive-weak text-olive' : 'border-border-strong bg-panel text-muted-foreground'}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {category === 'shared' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-[13px] font-medium text-muted-foreground">
              حصة الجهة الخارجية
              <Input className="mt-1.5 figure" inputMode="numeric" type="number" min="1" max={Math.max(0, amountNumber - 1)} step="1" value={externalShare} onChange={(event) => setExternalShare(event.target.value)} placeholder="0" />
            </label>
            <div className="rounded-xl border border-border bg-panel px-4 py-3">
              <div className="text-[12px] text-muted-foreground">حصة المعهد</div>
              <div className="figure mt-1 text-lg font-semibold text-olive">{formatNumber(instituteShare)}</div>
            </div>
          </div>
        ) : null}

        <Button type="button" size="lg" className="w-full" disabled={disabled} onClick={submit}>
          {isSaving ? 'جارٍ الحفظ…' : 'إضافة الرسم'}
        </Button>
      </div>
    </ActionSheet>
  )
}
