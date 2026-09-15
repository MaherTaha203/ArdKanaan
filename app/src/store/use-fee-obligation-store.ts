import { create } from 'zustand'

import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { FeeCategory } from '@/types/domain'
import { useWorkspaceStore } from '@/store/use-workspace-store'

type AddFeeInput = {
  courseId: string
  courseName: string
  studentIds: string[]
  description: string
  amount: number
  feeCategory: FeeCategory
  externalShare: number
}

type FeeObligationStore = {
  isSaving: boolean
  error: string | null
  addFeeObligations: (input: AddFeeInput) => Promise<boolean>
  clearError: () => void
}

export const useFeeObligationStore = create<FeeObligationStore>((set) => ({
  isSaving: false,
  error: null,
  clearError: () => set({ error: null }),
  addFeeObligations: async (input) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.' })
      return false
    }
    const uniqueStudentIds = [...new Set(input.studentIds.filter(Boolean))]
    if (uniqueStudentIds.length === 0 || !input.description.trim() || !Number.isInteger(input.amount) || input.amount <= 0) {
      set({ error: 'تحقّق من الطلاب ووصف الرسم وقيمته.' })
      return false
    }
    if (
      (input.feeCategory === 'institute' && input.externalShare !== 0) ||
      (input.feeCategory === 'external' && input.externalShare !== input.amount) ||
      (input.feeCategory === 'shared' && (input.externalShare <= 0 || input.externalShare >= input.amount))
    ) {
      set({ error: 'توزيع الرسم غير صحيح.' })
      return false
    }

    set({ isSaving: true, error: null })
    try {
      const rows = uniqueStudentIds.map((studentId) => ({
        student_id: studentId,
        course_id: input.courseId,
        course_name: input.courseName.trim(),
        description: input.description.trim(),
        amount: input.amount,
        fee_category: input.feeCategory,
        external_share: input.externalShare,
      }))

      const { error } = await supabase.from('fee_obligations').insert(rows)
      if (error) throw error

      await useWorkspaceStore.getState().load()
      set({ isSaving: false })
      return true
    } catch (error) {
      console.error('addFeeObligations failed', error)
      set({ isSaving: false, error: 'تعذّر إضافة الرسوم. تحقّق من البيانات وحاول مرّة أخرى.' })
      return false
    }
  },
}))
