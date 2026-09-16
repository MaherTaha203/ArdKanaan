import { create } from 'zustand'

import type { CourseFormValues, EnrollFormValues } from '@/features/courses/schema'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// Course catalog administration + student registration. Courses are pure catalog
// metadata. Registering a student writes an enrollment using the course's pre-defined
// price as the authoritative financial snapshot; it never asks the receipt to re-enter
// the course price.

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
      if (course.baseFee == null) {
        set({ isBusy: false, error: 'لا يمكن تسجيل الطالب قبل تحديد رسوم الدورة.' })
        return false
      }

      const { error } = await supabase.rpc('create_enrollment', {
        payload: {
          student_id: values.studentId,
          course_id: courseId,
        },
      })
      if (error) throw error

      set({ isBusy: false })
      return true
    } catch (error) {
      console.error('registerStudent failed', error)
      const code = (error as { code?: string; message?: string }).code ?? ''
      const message = (error as { message?: string }).message ?? ''
      const isDuplicate = code === '23505' || message.includes('ENROLLMENT_ALREADY_EXISTS')
      set({
        isBusy: false,
        error: isDuplicate ? 'هذا الطالب مسجّل في هذه الدورة بالفعل.' : 'تعذّر تسجيل الطالب في الدورة.',
      })
      return false
    }
  },
}))
