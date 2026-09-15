import { useMemo, useState } from 'react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFeeObligationStore } from '@/store/use-fee-obligation-store'
import type { Course, Enrollment, Student, FeeCategory } from '@/types/domain'
import { formatNumber } from '@/lib/format'

const CATEGORIES: { id: FeeCategory; label: string }[] = [
  { id: 'institute', label: 'للمعهد' },
  { id: 'external', label: 'لجهة خارجية' },
  { id: 'shared', label: 'مشترك' },
]

export function FeeObligationSheet({
  course,
  enrollments,
  students,
  onClose,
}: {
  course: Course
  enrollments: Enrollment[]
  students: Student[]
  onClose: () => void
}) {
  const addFeeObligations = useFeeObligationStore((state) => state.addFeeObligations)
  const isSaving = useFeeObligationStore((state) => state.isSaving)
  const error = useFeeObligationStore((state) => state.error)
  const clearError = useFeeObligationStore((state) => state.clearError)

  const roster = useMemo(() => {
    const byId = new Map(students.map((student) => [student.id, student]))
    return enrollments
      .filter((enrollment) => enrollment.courseId === course.id || enrollment.courseName === course.name)
      .map((enrollment) => ({ enrollment, student: byId.get(enrollment.studentId) ?? null }))
      .filter((entry): entry is { enrollment: Enrollment; student: Student } => Boolean(entry.student))
      .sort((a, b) => a.student.name.localeCompare(b.student.name, 'ar'))
  }, [course.id, course.name, enrollments, students])

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<FeeCategory>('institute')
  const [externalShare, setExternalShare] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const amountNumber = Number(amount)
  const externalNumber = category === 'institute' ? 0 : category === 'external' ? amountNumber : Number(externalShare)
  const instituteShare = Math.max(0, amountNumber - (Number.isFinite(externalNumber) ? externalNumber : 0))

  function selectAll() {
    setSelectedIds(roster.map((entry) => entry.student.id))
  }

  function toggleStudent(studentId: string) {
    setSelectedIds((current) => (current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]))
  }

  async function submit() {
    clearError()
    const ok = await addFeeObligations({
      courseId: course.id,
      courseName: course.name,
      studentIds: selectedIds,
      description,
      amount: amountNumber,
      feeCategory: category,
      externalShare: externalNumber,
    })
    if (ok) onClose()
  }

  return (
    <ActionSheet title={`إضافة رسوم — ${course.name}`} onClose={onClose}>
      <div className="space-y-5">
        {error ? <div role="alert" className="rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">{error}</div> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-[13px] font-medium text-muted-foreground">
            وصف الرسم
            <Input className="mt-1.5" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="مثال: رسوم تخريج" />
          </label>
          <label className="block text-[13px] font-medium text-muted-foreground">
            قيمة الرسم للطالب
            <Input className="mt-1.5 figure" inputMode="numeric" type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" />
          </label>
        </div>

        <div>
          <div className="mb-1.5 text-[13px] font-medium text-muted-foreground">تصنيف الرسم</div>
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

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-[13px] font-medium text-muted-foreground">الطلاب المستهدفون</div>
            <Button type="button" variant="quiet" size="sm" onClick={selectAll}>تحديد الجميع ({roster.length})</Button>
          </div>
          <div className="max-h-64 overflow-y-auto border-y border-border">
            {roster.length > 0 ? roster.map((entry) => {
              const selected = selectedIds.includes(entry.student.id)
              return (
                <button key={entry.student.id} type="button" onClick={() => toggleStudent(entry.student.id)} className={`flex w-full items-center gap-3 border-b border-border px-3 py-3 text-start last:border-b-0 ${selected ? 'bg-highlight' : ''}`}>
                  <span className={`grid size-5 flex-none place-items-center rounded border text-[11px] ${selected ? 'border-olive bg-olive text-white' : 'border-border-strong'}`}>{selected ? '✓' : ''}</span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{entry.student.name}</span>
                </button>
              )
            }) : <p className="py-8 text-center text-sm text-faint">لا يوجد طلاب مسجّلون في هذه الدورة.</p>}
          </div>
        </div>

        <Button type="button" size="lg" className="w-full" disabled={isSaving || selectedIds.length === 0 || !description.trim() || !Number.isInteger(amountNumber) || amountNumber <= 0 || (category === 'shared' && (!Number.isInteger(externalNumber) || externalNumber <= 0 || externalNumber >= amountNumber))} onClick={submit}>
          {isSaving ? 'جارٍ الحفظ…' : `إضافة الرسم إلى ${selectedIds.length} طالب`}
        </Button>
      </div>
    </ActionSheet>
  )
}
