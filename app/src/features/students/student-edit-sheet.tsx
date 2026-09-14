import { useLayoutEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToastStore } from '@/components/ui/use-toast-store'
import { studentEditFormSchema, type StudentEditFormValues } from '@/features/students/schema'
import { useShellStore } from '@/store/use-shell-store'
import { useStudentAdminStore } from '@/store/use-student-admin-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// Edits a student's identity record. The student data is already loaded in the
// workspace store, so the form fills from there — no extra fetch.
export function StudentEditSheet() {
  const closeOverlay = useShellStore((state) => state.closeOverlay)
  const editStudentId = useShellStore((state) => state.editStudentId)
  const students = useWorkspaceStore((state) => state.students)
  const reloadWorkspace = useWorkspaceStore((state) => state.load)

  const createStudent = useStudentAdminStore((state) => state.createStudent)
  const updateStudent = useStudentAdminStore((state) => state.updateStudent)
  const isBusy = useStudentAdminStore((state) => state.isBusy)
  const error = useStudentAdminStore((state) => state.error)
  const clearError = useStudentAdminStore((state) => state.clearError)

  const isEdit = Boolean(editStudentId)
  const student = students.find((item) => item.id === editStudentId) ?? null

  const form = useForm<StudentEditFormValues>({
    resolver: zodResolver(studentEditFormSchema),
    defaultValues: {
      name: student?.name ?? '',
      idNumber: student?.idNumber ?? '',
      phone: student?.phone ?? '',
      notes: student?.notes ?? '',
    },
  })

  // Clear any leftover store error before the first paint so a stale message never
  // flashes when the sheet reopens (the store is a singleton across mounts).
  useLayoutEffect(() => {
    clearError()
  }, [clearError])

  // In edit mode the record can only be missing if it was cancelled mid-edit; guard.
  if (isEdit && !student) {
    return (
      <ActionSheet title="تعديل بيانات الطالب" onClose={closeOverlay}>
        <p className="py-10 text-center text-sm text-faint">تعذّر العثور على الطالب.</p>
      </ActionSheet>
    )
  }

  async function onSubmit(values: StudentEditFormValues) {
    const ok = editStudentId ? await updateStudent(editStudentId, values) : await createStudent(values)
    if (!ok) return
    await reloadWorkspace()
    useToastStore.getState().show(editStudentId ? 'تم حفظ بيانات الطالب' : 'تمت إضافة الطالب بنجاح')
    closeOverlay()
  }

  const title = isEdit ? 'تعديل بيانات الطالب' : 'إضافة طالب'

  return (
    <ActionSheet title={title} eyebrow="الطلاب" onClose={closeOverlay}>
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay"
        >
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="اسم الطالب" error={form.formState.errors.name?.message}>
          {(control) => <Input placeholder="الاسم الكامل" {...control} {...form.register('name')} />}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="الرقم التعريفي">
            {(control) => (
              <Input
                className="figure"
                dir="ltr"
                inputMode="numeric"
                placeholder="اختياري"
                {...control}
                {...form.register('idNumber')}
              />
            )}
          </Field>
          <Field label="الهاتف">
            {(control) => (
              <Input
                className="figure"
                dir="ltr"
                inputMode="tel"
                placeholder="اختياري"
                {...control}
                {...form.register('phone')}
              />
            )}
          </Field>
        </div>

        <Field label="الملاحظات">
          {(control) => (
            <Textarea placeholder="ملاحظات اختيارية" {...control} {...form.register('notes')} />
          )}
        </Field>

        <Button type="submit" size="lg" variant="default" className="w-full" disabled={isBusy}>
          <Check className="size-4" />
          {isBusy ? 'جارٍ الحفظ…' : isEdit ? 'حفظ بيانات الطالب' : 'إضافة الطالب'}
        </Button>
      </form>
    </ActionSheet>
  )
}
