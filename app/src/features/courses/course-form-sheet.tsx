import { useLayoutEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SmartDateInput } from '@/components/ui/smart-date-input'
import { Textarea } from '@/components/ui/textarea'
import { useToastStore } from '@/components/ui/use-toast-store'
import { courseFormSchema, type CourseFormValues } from '@/features/courses/schema'
import { useCourseAdminStore } from '@/store/use-course-admin-store'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// Add or edit a catalog course. Central, RTL, fast — no side drawer, no hover
// animation. Editing base_fee never changes already-registered students' fees
// (their enrollment keeps its own snapshot).
export function CourseFormSheet() {
  const closeOverlay = useShellStore((state) => state.closeOverlay)
  const editCourseId = useShellStore((state) => state.editCourseId)
  const courses = useWorkspaceStore((state) => state.courses)
  const reloadWorkspace = useWorkspaceStore((state) => state.load)

  const createCourse = useCourseAdminStore((state) => state.createCourse)
  const updateCourse = useCourseAdminStore((state) => state.updateCourse)
  const isBusy = useCourseAdminStore((state) => state.isBusy)
  const error = useCourseAdminStore((state) => state.error)
  const clearError = useCourseAdminStore((state) => state.clearError)

  const editing = editCourseId ? (courses.find((item) => item.id === editCourseId) ?? null) : null

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: editing?.name ?? '',
      baseFee: editing?.baseFee == null ? '' : String(editing.baseFee),
      // (baseFee is a string field; '' = no standard fee)
      startDate: editing?.startDate ?? '',
      endDate: editing?.endDate ?? '',
      status: editing?.status ?? 'active',
      notes: editing?.notes ?? '',
    },
  })

  const status = useWatch({ control: form.control, name: 'status' })
  const startDate = useWatch({ control: form.control, name: 'startDate' }) ?? ''
  const endDate = useWatch({ control: form.control, name: 'endDate' }) ?? ''

  useLayoutEffect(() => {
    clearError()
  }, [clearError])

  async function onSubmit(values: CourseFormValues) {
    const ok = editCourseId ? await updateCourse(editCourseId, values) : await createCourse(values)
    if (!ok) return
    await reloadWorkspace()
    useToastStore.getState().show(editCourseId ? 'تم حفظ الدورة' : 'تمت إضافة الدورة بنجاح')
    closeOverlay()
  }

  const title = editCourseId ? 'تعديل الدورة' : 'إضافة دورة'

  return (
    <ActionSheet title={title} eyebrow="الدورات" onClose={closeOverlay}>
      {error ? (
        <div role="alert" className="mb-4 rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Field label="اسم الدورة" error={form.formState.errors.name?.message}>
          {(control) => <Input placeholder="مثال: الرياضيات" {...control} {...form.register('name')} />}
        </Field>

        <Field label="الرسوم الأساسية" error={form.formState.errors.baseFee?.message}>
          {(control) => (
            <Input
              type="text"
              inputMode="numeric"
              className="figure"
              placeholder="اختياري"
              {...control}
              {...form.register('baseFee')}
            />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="تاريخ البداية">
            {(control) => (
              <SmartDateInput
                value={startDate}
                onChange={(value) => form.setValue('startDate', value)}
                className="figure h-11 w-full"
                {...control}
              />
            )}
          </Field>
          <Field label="تاريخ النهاية">
            {(control) => (
              <SmartDateInput
                value={endDate}
                onChange={(value) => form.setValue('endDate', value)}
                className="figure h-11 w-full"
                {...control}
              />
            )}
          </Field>
        </div>

        <div>
          <span id="course-status-label" className="mb-1.5 block text-[13px] font-medium text-muted-foreground">الحالة</span>
          <div role="radiogroup" aria-labelledby="course-status-label" className="inline-flex overflow-hidden rounded-xl border border-border-strong">
            {(['active', 'ended'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={status === value}
                onClick={() => form.setValue('status', value)}
                className={`px-5 py-2 text-sm font-medium ${
                  status === value ? 'bg-olive text-white' : 'bg-panel text-muted-foreground'
                }`}
              >
                {value === 'active' ? 'نشطة' : 'منتهية'}
              </button>
            ))}
          </div>
        </div>

        <Field label="الملاحظات">
          {(control) => <Textarea placeholder="ملاحظات اختيارية" {...control} {...form.register('notes')} />}
        </Field>

        <Button type="submit" size="lg" variant="default" className="w-full" disabled={isBusy}>
          <Check className="size-4" />
          {isBusy ? 'جارٍ الحفظ…' : editCourseId ? 'حفظ الدورة' : 'إضافة الدورة'}
        </Button>
      </form>
    </ActionSheet>
  )
}
