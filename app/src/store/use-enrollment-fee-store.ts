import { create } from 'zustand'

import { getSupabaseBrowserClient } from '@/lib/supabase'

// ADR-0078 — owner-adjustable per-enrollment registration price. The owner may
// change the total course fee (enrollments.course_value) for ONE enrollment. The
// new fee may never fall below what has already been validly collected for that
// enrollment; the floor check and the collected total are computed atomically
// inside the owner-only update_enrollment_fee RPC. This store never mutates a
// balance client-side — it calls the RPC and maps its domain errors to calm
// Arabic messages. Historical receipts, allocations and the ledger are untouched.

type EnrollmentFeeStore = {
  isBusy: boolean
  error: string | null
  clearError: () => void
  updateFee: (enrollmentId: string, amount: number, reason: string) => Promise<boolean>
}

const NOT_CONFIGURED = 'الاتصال بقاعدة البيانات غير مهيأ بعد.'

// Map a Postgres RAISE'd domain error (its text appears in error.message) to a
// user-facing message. Anything unrecognized falls back to a safe generic line.
function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  // Supabase surfaces a plain object with a `message` string, not an Error.
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string') return message
  }
  return ''
}

function feeErrorMessage(error: unknown, fallback: string): string {
  const message = extractMessage(error)
  if (message.includes('OWNER_ONLY')) return 'غير مصرّح لك بتعديل رسوم التسجيل.'
  if (message.includes('FEE_BELOW_COLLECTED')) return 'لا يمكن أن تقلّ الرسوم الجديدة عن المبلغ المحصّل فعليًا لهذا التسجيل.'
  if (message.includes('FEE_ADJUSTMENT_REASON_REQUIRED')) return 'يجب إدخال سبب التعديل.'
  if (message.includes('FEE_AMOUNT_TOO_LARGE')) return 'قيمة الرسوم كبيرة جدًا.'
  if (message.includes('INVALID_FEE_AMOUNT')) return 'قيمة الرسوم غير صحيحة (رقم صحيح موجب بلا كسور).'
  if (message.includes('ENROLLMENT_NOT_FOUND')) return 'تعذّر العثور على التسجيل.'
  return fallback
}

export const useEnrollmentFeeStore = create<EnrollmentFeeStore>((set) => ({
  isBusy: false,
  error: null,
  clearError: () => set({ error: null }),

  updateFee: async (enrollmentId, amount, reason) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    set({ isBusy: true, error: null })
    try {
      const trimmed = reason.trim()
      const { error } = await supabase.rpc('update_enrollment_fee', {
        p_enrollment_id: enrollmentId,
        p_amount: amount,
        p_reason: trimmed,
      })
      if (error) throw error
      set({ isBusy: false })
      return true
    } catch (error) {
      console.error('updateEnrollmentFee failed', error)
      set({ isBusy: false, error: feeErrorMessage(error, 'تعذّر تعديل رسوم التسجيل.') })
      return false
    }
  },
}))
