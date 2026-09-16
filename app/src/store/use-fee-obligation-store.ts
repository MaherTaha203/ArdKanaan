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
  clearError: () => void
  addFeeObligations: (input: AddFeeInput) => Promise<boolean>
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
    if (!input.courseId || uniqueStudentIds.length === 0 || !input.description.trim() || !Number.isInteger(input.amount) || input.amount <= 0) {
      set({ error: 'تحقّق من الدورة والطلاب ووصف الرسم وقيمته.' })
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
      const { error } = await supabase.rpc('create_fee_obligations', {
        payload: {
          course_id: input.courseId,
          student_ids: uniqueStudentIds,
          description: input.description.trim(),
          amount: input.amount,
          fee_category: input.feeCategory,
          external_share: input.externalShare,
        },
      })
      if (error) throw error

      await useWorkspaceStore.getState().load()
      set({ isSaving: false })
      return true
    } catch (error) {
      console.error('addFeeObligations failed', error)
      set({ isSaving: false, error: 'تعذّر إضافة الرسوم. تأكد من أن كل طالب مرتبط بالدورة ثم حاول مرة أخرى.' })
      return false
    }
  },
}))
