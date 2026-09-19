import { create } from 'zustand'

import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { FeeCategory } from '@/types/domain'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// A fee obligation is anchored on the student (ADR-0077). Course and enrollment
// are optional context — omit both for a standalone fee (exam, certificate, …).
type AddFeeInput = {
  studentIds: string[]
  description: string
  amount: number
  feeCategory: FeeCategory
  externalShare: number
  courseId?: string | null
  enrollmentId?: string | null
}

type FeeObligationStore = {
  isSaving: boolean
  error: string | null
  clearError: () => void
  addFeeObligations: (input: AddFeeInput) => Promise<boolean>
}

// The Supabase RPC surfaces a Postgres error whose message carries the raised
// code; map the ones the user can act on to clear Arabic, everything else to a
// safe generic message. Handles plain `{ message }` objects and Error instances.
function messageOf(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return ''
}

function feeErrorMessage(error: unknown): string {
  const message = messageOf(error)
  if (message.includes('OWNER_ONLY')) return 'غير مصرّح لك بإضافة الرسوم.'
  if (message.includes('COURSE_NOT_FOUND')) return 'الدورة المرتبطة غير موجودة.'
  if (message.includes('FEE_OBLIGATION_ENROLLMENT_MISMATCH')) return 'التسجيل المختار لا يخصّ هذا الطالب أو هذه الدورة.'
  if (message.includes('INVALID_FEE_PAYLOAD')) return 'تحقّق من بيانات الرسم (الوصف والقيمة والتصنيف).'
  return 'تعذّر إضافة الرسوم. تحقّق من البيانات ثم حاول مرّة أخرى.'
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
      set({ error: 'اختر الطالب واكتب وصف الرسم وقيمته.' })
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
      // course_id / enrollment_id are optional — only included when provided, so a
      // standalone fee sends neither. The RPC validates any context it receives.
      const payload: Record<string, unknown> = {
        student_ids: uniqueStudentIds,
        description: input.description.trim(),
        amount: input.amount,
        fee_category: input.feeCategory,
        external_share: input.externalShare,
      }
      if (input.courseId) payload.course_id = input.courseId
      if (input.enrollmentId) payload.enrollment_id = input.enrollmentId

      const { error } = await supabase.rpc('create_fee_obligations', { payload })
      if (error) throw error

      await useWorkspaceStore.getState().load()
      set({ isSaving: false })
      return true
    } catch (error) {
      console.error('addFeeObligations failed', error)
      set({ isSaving: false, error: feeErrorMessage(error) })
      return false
    }
  },
}))
