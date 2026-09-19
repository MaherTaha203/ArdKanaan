import { create } from 'zustand'

import { getSupabaseBrowserClient } from '@/lib/supabase'

// Administrative student archiving (ADR-0076). Archiving is a purely
// administrative lifecycle change on the students table — it asserts NO financial
// fact, touches NO voucher/allocation/obligation/ledger row, and never settles a
// balance. Eligibility and owner-only authorization are enforced server-side by
// the archive_student / unarchive_student RPCs; this store maps their domain
// errors to calm Arabic messages.

type StudentArchiveStore = {
  isBusy: boolean
  error: string | null
  clearError: () => void
  archiveStudent: (id: string, reason: string) => Promise<boolean>
  unarchiveStudent: (id: string) => Promise<boolean>
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

function archiveErrorMessage(error: unknown, fallback: string): string {
  const message = extractMessage(error)
  if (message.includes('student_has_active_course')) return 'لا يمكن أرشفة الطالب لوجود دورة نشطة مسجَّل بها. أنهِ الدورة أولًا.'
  if (message.includes('not_authorized')) return 'غير مخوَّل لتنفيذ هذه العملية.'
  if (message.includes('student_not_active')) return 'لا يمكن أرشفة هذا الطالب (حالته الحالية ليست «نشط»).'
  if (message.includes('student_not_archived')) return 'هذا الطالب غير مؤرشف.'
  if (message.includes('student_not_found')) return 'تعذّر العثور على الطالب.'
  return fallback
}

export const useStudentArchiveStore = create<StudentArchiveStore>((set) => ({
  isBusy: false,
  error: null,
  clearError: () => set({ error: null }),

  archiveStudent: async (id, reason) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    set({ isBusy: true, error: null })
    try {
      const trimmed = reason.trim()
      const { error } = await supabase.rpc('archive_student', { p_student_id: id, p_reason: trimmed || null })
      if (error) throw error
      set({ isBusy: false })
      return true
    } catch (error) {
      console.error('archiveStudent failed', error)
      set({ isBusy: false, error: archiveErrorMessage(error, 'تعذّرت أرشفة الطالب.') })
      return false
    }
  },

  unarchiveStudent: async (id) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    set({ isBusy: true, error: null })
    try {
      const { error } = await supabase.rpc('unarchive_student', { p_student_id: id })
      if (error) throw error
      set({ isBusy: false })
      return true
    } catch (error) {
      console.error('unarchiveStudent failed', error)
      set({ isBusy: false, error: archiveErrorMessage(error, 'تعذّرت إعادة تفعيل الطالب.') })
      return false
    }
  },
}))
