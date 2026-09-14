import { useLayoutEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useToastStore } from '@/components/ui/use-toast-store'
import { enrollFormSchema, type EnrollFormValues } from '@/features/courses/schema'
import { normalizeArabic } from '@/lib/text'
import { useCourseAdminStore } from '@/store/use-course-admin-store'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

const MAX_SUGGESTIONS = 8

// Register an existing student in a course. Picking a student is required; the fee
// defaults to the course's base fee and is editable, and it is stored as the
// authoritative enrollment fee (unchanged by later course-fee edits).
export function EnrollStudentSheet() {
  const closeOverlay = useShellStore((state) => state.closeOverlay)
  const enrollCourseId = useShellStore((state) => state.enrollCourseId)
  const courses = useWorkspaceStore((state) => state.courses)
  const students = useWorkspaceStore((state) => state.students)
  const reloadWorkspace = useWorkspaceStore((state) => state.load)

  const registerStudent = useCourseAdminStore((state) => state.registerStudent)
  const isBusy = useCourseAdminStore((state) => state.isBusy)
  const error = useCourseAdminStore((state) => state.error)
  const clearError = useCourseAdminStore((state) => state.clearError)

  const course = enrollCourseId ? (courses.find((item) => item.id === enrollCourseId) ?? null) : null

  const form = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollFormSchema),
    defaultValues: {
      studentId: '',
      studentName: '',
      fee: course?.baseFee ?? 0,
    },
  })

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const studentId = useWatch({ control: form.control, name: 'studentId' })
  const studentName = useWatch({ control: form.control, name: 'studentName' })

  useLayoutEffect(() => {
    clearError()
  }, [clearError])

  const suggestions = useMemo(() => {
    const term = normalizeArabic(query.trim())
    if (!term) return []
    return students
      .filter((student) => normalizeArabic(student.name).includes(term))
      .slice(0, MAX_SUGGESTIONS)
  }, [students, query])

  if (!course) {
    return (
      <ActionSheet title="تسجيل طالب" onClose={closeOverlay}>
        <p className="py-10 text-center text-sm text-faint">تعذّر العثور على الدورة.</p>
      </ActionSheet>
    )
  }

  function pick(id: string, name: string) {
    form.setValue('studentId', id, { shouldValidate: true })
    form.setValue('studentName', name)
    setQuery(name)
    setOpen(false)
  }

  async function onSubmit(values: EnrollFormValues) {
    if (!enrollCourseId) return
    const ok = await registerStudent(enrollCourseId, values)
    if (!ok) return
    await reloadWorkspace()
    useToastStore.getState().show('تم تسجيل الطالب في الدورة بنجاح')
    closeOverlay()
  }

  return (
    <ActionSheet title="تسجيل طالب" eyebrow={course.name} onClose={closeOverlay}>
      {error ? (
        <div role="alert" className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <input type="hidden" {...form.register('studentId')} />
        <Field label="الطالب" error={form.formState.errors.studentId?.message}>
          {(control) => (
            <div className="relative">
              <Input
                {...control}
                autoComplete="off"
                placeholder="ابحث عن الطالب بالاسم"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setOpen(true)
                  if (studentId) {
                    form.setValue('studentId', '', { shouldValidate: true })
                    form.setValue('studentName', '')
                  }
                }}
                onFocus={() => setOpen(true)}
              />
              {open && suggestions.length > 0 ? (
                <ul
                  role="listbox"
                  className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border-strong bg-panel py-1 shadow-lg"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {suggestions.map((student) => (
                    <li
                      key={student.id}
                      role="option"
                      aria-selected={studentId === student.id}
                      onClick={() => pick(student.id, student.name)}
                      className="flex cursor-pointer flex-col items-start gap-0.5 px-3.5 py-2 text-start hover:bg-highlight"
                    >
                      <span className="text-sm font-medium text-foreground">{student.name}</span>
                      {student.idNumber || student.phone ? (
                        <span className="figure text-[11.5px] text-faint" dir="ltr">
                          {[student.idNumber, student.phone].filter(Boolean).join(' · ')}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </Field>

        {studentId ? (
          <p className="text-[12.5px] text-muted-foreground">
            الطالب المختار: <span className="font-semibold text-foreground">{studentName}</span>
          </p>
        ) : null}

        <Field label="رسوم التسجيل" error={form.formState.errors.fee?.message}>
          {(control) => (
            <Input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              className="figure"
              placeholder="0"
              {...control}
              {...form.register('fee')}
            />
          )}
        </Field>

        <Button type="submit" size="lg" variant="default" className="w-full" disabled={isBusy}>
          <Check className="size-4" />
          {isBusy ? 'جارٍ التسجيل…' : 'تسجيل الطالب'}
        </Button>
      </form>
    </ActionSheet>
  )
}
