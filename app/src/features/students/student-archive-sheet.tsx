import { useLayoutEffect, useMemo, useState } from 'react'

import { Archive, ArchiveRestore, TriangleAlert } from 'lucide-react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Money } from '@/components/ui/money'
import { Textarea } from '@/components/ui/textarea'
import { useToastStore } from '@/components/ui/use-toast-store'
import { aggregateStudents, hasActiveCourse } from '@/lib/aggregate'
import { useShellStore } from '@/store/use-shell-store'
import { useStudentArchiveStore } from '@/store/use-student-archive-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

const REMAINING_EPSILON = 0.0001

// Archive / restore a student. Archiving is administrative only — it never
// settles a balance, changes an amount, or writes a financial row. A student on
// an active course cannot be archived; an outstanding balance only warns.
export function StudentArchiveSheet() {
  const closeOverlay = useShellStore((state) => state.closeOverlay)
  const archiveStudentId = useShellStore((state) => state.archiveStudentId)
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const feeObligations = useWorkspaceStore((state) => state.feeObligations)
  const courses = useWorkspaceStore((state) => state.courses)
  const reloadWorkspace = useWorkspaceStore((state) => state.load)

  const archiveStudent = useStudentArchiveStore((state) => state.archiveStudent)
  const unarchiveStudent = useStudentArchiveStore((state) => state.unarchiveStudent)
  const isBusy = useStudentArchiveStore((state) => state.isBusy)
  const error = useStudentArchiveStore((state) => state.error)
  const clearError = useStudentArchiveStore((state) => state.clearError)

  const [reason, setReason] = useState('')

  const student = students.find((item) => item.id === archiveStudentId) ?? null
  const isArchived = student?.status === 'archived'

  const remaining = useMemo(() => {
    if (!student) return 0
    return aggregateStudents([student], statementLines, enrollments, feeObligations)[0]?.remaining ?? 0
  }, [student, statementLines, enrollments, feeObligations])

  const activeCourseBlocked = useMemo(
    () => (student && !isArchived ? hasActiveCourse(student.id, enrollments, courses) : false),
    [student, isArchived, enrollments, courses],
  )

  useLayoutEffect(() => {
    clearError()
  }, [clearError])

  if (!student) {
    return (
      <ActionSheet title="أرشفة الطالب" eyebrow="الطلاب" onClose={closeOverlay}>
        <p className="py-10 text-center text-sm text-faint">تعذّر العثور على الطالب.</p>
      </ActionSheet>
    )
  }

  async function onArchive() {
    if (!student || activeCourseBlocked) return
    const ok = await archiveStudent(student.id, reason)
    if (!ok) return
    await reloadWorkspace()
    useToastStore.getState().show('تمت أرشفة الطالب')
    closeOverlay()
  }

  async function onReactivate() {
    if (!student) return
    const ok = await unarchiveStudent(student.id)
    if (!ok) return
    await reloadWorkspace()
    useToastStore.getState().show('تمت إعادة تفعيل الطالب')
    closeOverlay()
  }

  const hasOutstanding = remaining > REMAINING_EPSILON

  if (isArchived) {
    return (
      <ActionSheet title="إعادة تفعيل الطالب" eyebrow="الطلاب" onClose={closeOverlay}>
        {error ? <div role="alert" className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">{error}</div> : null}
        <p className="text-sm text-muted-foreground">إعادة «{student.name}» إلى قائمة الطلاب النشطين. لا يؤثّر ذلك على أي بيان ماليّ.</p>
        <Button type="button" size="lg" variant="default" className="mt-5 w-full" disabled={isBusy} onClick={onReactivate}>
          <ArchiveRestore className="size-4" />
          {isBusy ? 'جارٍ التنفيذ…' : 'إعادة التفعيل'}
        </Button>
      </ActionSheet>
    )
  }

  return (
    <ActionSheet title="أرشفة الطالب" eyebrow="الطلاب" onClose={closeOverlay}>
      {error ? <div role="alert" className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">{error}</div> : null}

      <p className="text-sm text-muted-foreground">أرشفة «{student.name}» تُخرجه من قائمة الطلاب النشطين. بياناته المالية وكشف حسابه يبقيان محفوظين ومتاحين، والأرشفة لا تُسوّي أي رصيد ولا تنشئ أي حركة ماليّة.</p>

      {activeCourseBlocked ? (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 flex-none" />
          <span>لا يمكن أرشفة الطالب لوجود دورة نشطة مسجَّل بها. أنهِ الدورة أولًا ثم أعِد المحاولة.</span>
        </div>
      ) : hasOutstanding ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-warn/30 bg-warn-weak px-4 py-3 text-sm text-warn">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 flex-none" />
          <span>على الطالب رصيد مستحق قدره <Money value={remaining} currency={false} className="font-bold" />. الأرشفة مسموحة لكنها لن تُسوّي هذا الرصيد ولن تغيّره.</span>
        </div>
      ) : null}

      <div className="mt-4">
        <Field label="سبب الأرشفة (اختياري)">
          {(control) => <Textarea placeholder="سبب اختياري يُحفظ مع سجلّ الأرشفة" value={reason} onChange={(event) => setReason(event.target.value)} {...control} />}
        </Field>
      </div>

      <Button type="button" size="lg" variant="default" className="mt-5 w-full" disabled={isBusy || activeCourseBlocked} onClick={onArchive}>
        <Archive className="size-4" />
        {isBusy ? 'جارٍ الأرشفة…' : 'أرشفة الطالب'}
      </Button>
    </ActionSheet>
  )
}
