import { create } from 'zustand'

import type { CourseFormValues, EnrollFormValues } from '@/features/courses/schema'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// Course catalog administration + student registration. Courses are pure catalog
// metadata (no financial fact). Registering a student writes an ENROLLMENT — the
// authoritative (student, course, fee) link the financial firewall relies on — so
// this stays consistent with the existing money logic; it never touches a voucher.

const NOT_CONFIGURED = 'الاتصال بقاعدة البيانات غير مهيأ بعد.'

type CourseAdminStore = {
  isBusy: boolean
  error: string | null
  clearError: () => void
  createCourse: (values: CourseFormValues) => Promise<boolean>
  updateCourse: (id: string, values: CourseFormValues) => Promise<boolean>
  registerStudent: (courseId: string, values: EnrollFormValues) => Promise<boolean>
}

function coursePayload(values: CourseFormValues) {
  const baseFee = values.baseFee === '' ? null : Number(values.baseFee)
  return {
    name: values.name.trim(),
    base_fee: baseFee,
    start_date: values.startDate.trim() || null,
    end_date: values.endDate.trim() || null,
    status: values.status,
    notes: values.notes.trim(),
  }
}

export const useCourseAdminStore = create<CourseAdminStore>((set) => ({
  isBusy: false,
  error: null,
  clearError: () => set({ error: null }),

  createCourse: async (values) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    set({ isBusy: true, error: null })
    try {
      const { error } = await supabase.from('courses').insert(coursePayload(values))
      if (error) throw error
      set({ isBusy: false })
      return true
    } catch (error) {
      console.error('createCourse failed', error)
      set({ isBusy: false, error: 'تعذّر حفظ الدورة. قد يكون الاسم مكرّرًا؛ حاول باسم مختلف.' })
      return false
    }
  },

  updateCourse: async (id, values) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    set({ isBusy: true, error: null })
    try {
      const { error } = await supabase.from('courses').update(coursePayload(values)).eq('id', id)
      if (error) throw error
      set({ isBusy: false })
      return true
    } catch (error) {
      console.error('updateCourse failed', error)
      set({ isBusy: false, error: 'تعذّر حفظ الدورة. قد يكون الاسم مكرّرًا؛ حاول باسم مختلف.' })
      return false
    }
  },

  registerStudent: async (courseId, values) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    set({ isBusy: true, error: null })
    try {
      const course = useWorkspaceStore.getState().courses.find((item) => item.id === courseId)
      if (!course) throw new Error('COURSE_NOT_FOUND')

      // The enrollment is keyed UNIQUE(student_id, course_name). If the student is
      // already enrolled, do not silently change their (authoritative) fee — report it.
      const { data: existing, error: lookupError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', values.studentId)
        .eq('course_name', course.name)
        .limit(1)
      if (lookupError) throw lookupError
      if (existing?.[0]) {
        set({ isBusy: false, error: 'هذا الطالب مسجّل في هذه الدورة بالفعل.' })
        return false
      }

      const { error: insertError } = await supabase.from('enrollments').insert({
        student_id: values.studentId,
        course_id: courseId,
        course_name: course.name,
        course_value: values.fee,
      })
      if (insertError) throw insertError
      set({ isBusy: false })
      return true
    } catch (error) {
      console.error('registerStudent failed', error)
      set({ isBusy: false, error: 'تعذّر تسجيل الطالب في الدورة.' })
      return false
    }
  },
}))
