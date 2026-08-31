import { create } from 'zustand'

import type { StudentEditFormValues } from '@/features/students/schema'
import { getSupabaseBrowserClient } from '@/lib/supabase'

// Administrative student action: correct an existing student's identity record
// (name / id_number / phone / notes). Students are never deleted; the change is
// audited server-side by the students_activity trigger. This is identity only —
// it asserts no financial fact and touches no voucher.

type StudentAdminStore = {
  isBusy: boolean
  error: string | null
  clearError: () => void
  updateStudent: (id: string, values: StudentEditFormValues) => Promise<boolean>
}

const NOT_CONFIGURED = 'الاتصال بقاعدة البيانات غير مهيأ بعد.'

export const useStudentAdminStore = create<StudentAdminStore>((set) => ({
  isBusy: false,
  error: null,
  clearError: () => set({ error: null }),

  updateStudent: async (id, values) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    set({ isBusy: true, error: null })

    const idNumber = values.idNumber.trim()
    const phone = values.phone.trim()
    const notes = values.notes.trim()

    const { error } = await supabase
      .from('students')
      .update({
        name: values.name.trim(),
        id_number: idNumber || null,
        phone: phone || null,
        notes: notes || null,
      })
      .eq('id', id)
    set({ isBusy: false })
    if (error) {
      set({ error: 'تعذّر حفظ بيانات الطالب.' })
      return false
    }
    return true
  },
}))
