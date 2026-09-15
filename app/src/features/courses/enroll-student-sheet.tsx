import { useEffect, useId, useLayoutEffect, useMemo, useState } from 'react'

import type { KeyboardEvent } from 'react'
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

// Register an existing student in a course. The amount shown here comes from the
// course catalog price and is read-only. The server/store also derives the enrollment
// snapshot from that same course price, so the client cannot create a different fee.
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
      fee: course?.baseFee != null ? String(course.baseFee) : '',
    },
  })

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const listId = useId()
  const optionId = (index: number) => `${listId}-opt-${index}`
  const studentId = useWatch({ control: form.control, name: 'studentId' })
  const pickedName = studentId ? (students.find((item) => item.id === studentId)?.name ?? '') : ''

  useLayoutEffect(() => {
    clearError()
  }, [clearError])

  const suggestions = useMemo(() => {
    const term = normalizeArabic(query.trim())
    if (!term) return []
    return students.filter((student) => normalizeArabic(student.name).includes(term)).slice(0, MAX_SUGGESTIONS)
  }, [students, query])

  const showDropdown = open && query.trim().length > 0
  const activeOptionId = showDropdown && highlighted >= 0 ? optionId(highlighted) : undefined

  useEffect(() => {
    if (showDropdown && highlighted >= 0) {
      document.getElementById(optionId(highlighted))?.scrollIntoView?.({ block: 'nearest' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlighted, showDropdown])

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
    setHighlighted(-1)
  }

  function onType(value: string) {
    setQuery(value)
    setOpen(true)
    setHighlighted(-1)
    if (studentId) {
      form.setValue('studentId', '', { shouldValidate: true })
      form.setValue('studentName', '')
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) setOpen(true)
      setHighlighted((index) => Math.min(index + 1, suggestions.length - 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((index) => Math.max(index - 1, 0))
      return
    }
    if (event.key === 'Enter' && showDropdown && highlighted >= 0 && suggestions[highlighted]) {
      event.preventDefault()
      event.stopPropagation()
      const chosen = suggestions[highlighted]
      pick(chosen.id, chosen.name)
      return
    }
    if (event.key === 'Escape' && showDropdown) {
      event.stopPropagation()
      setOpen(false)
      setHighlighted(-1)
    }
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
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={activeOptionId}
                onChange={(event) => onType(event.target.value)}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                  setOpen(false)
                  setHighlighted(-1)
                }}
                onKeyDown={onKeyDown}
              />
              {showDropdown ? (
                <ul
                  id={listId}
                  role="listbox"
                  className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border-strong bg-panel py-1 shadow-lg"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((student, index) => (
                      <li
                        key={student.id}
                        id={optionId(index)}
                        role="option"
                        aria-selected={highlighted === index}
                        onMouseMove={() => setHighlighted(index)}
                        onClick={() => pick(student.id, student.name)}
                        className={`flex w-full cursor-pointer flex-col items-start gap-0.5 px-3.5 py-2 text-start ${highlighted === index ? 'bg-highlight' : ''}`}
                      >
                        <span className="text-sm font-medium text-foreground">{student.name}</span>
                        {student.idNumber || student.phone ? (
                          <span className="figure text-[11.5px] text-faint" dir="ltr">
                            {[student.idNumber, student.phone].filter(Boolean).join(' · ')}
                          </span>
                        ) : null}
                      </li>
                    ))
                  ) : (
                    <li role="option" aria-disabled aria-selected={false} className="px-3.5 py-3 text-center text-[12.5px] text-faint">
                      لا يوجد طلاب مطابقون.
                    </li>
                  )}
                </ul>
              ) : null}
            </div>
          )}
        </Field>

        {studentId ? (
          <p className="text-[12.5px] text-muted-foreground">
            الطالب المختار: <span className="font-semibold text-foreground">{pickedName}</span>
          </p>
        ) : null}

        <Field label="رسوم الدورة" error={form.formState.errors.fee?.message}>
          {(control) => (
            <Input
              type="text"
              inputMode="numeric"
              className="figure"
              placeholder="0"
              readOnly
              {...control}
              {...form.register('fee')}
            />
          )}
        </Field>

        {course.baseFee == null ? <p role="alert" className="text-sm text-clay">لا يمكن تسجيل الطالب قبل تحديد رسوم الدورة.</p> : null}

        <Button type="submit" size="lg" variant="default" className="w-full" disabled={isBusy || course.baseFee == null}>
          <Check className="size-4" />
          {isBusy ? 'جارٍ التسجيل…' : 'تسجيل الطالب'}
        </Button>
      </form>
    </ActionSheet>
  )
}
