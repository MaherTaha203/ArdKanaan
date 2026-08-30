import { create } from 'zustand'

import { getSupabaseBrowserClient } from '@/lib/supabase'
import {
  BACKUP_APP,
  BACKUP_VERSION,
  type BackupPayload,
  type RestorePayload,
} from '@/lib/backup'

// Backup = a read snapshot of the three source-of-truth tables. Restore = one
// atomic server-side call (restore_center_data RPC) that replaces everything or
// nothing. The store owns only the async I/O; file download/parse live in lib/backup.

export type RestoreCounts = {
  students: number
  receipt_vouchers: number
  payment_vouchers: number
}

type BackupState = {
  isBusy: boolean
  error: string | null
  clearError: () => void
  exportBackup: () => Promise<BackupPayload | null>
  restore: (payload: RestorePayload) => Promise<RestoreCounts | null>
}

const NOT_CONFIGURED = 'الاتصال بقاعدة البيانات غير مهيأ بعد.'

export const useBackupStore = create<BackupState>((set) => ({
  isBusy: false,
  error: null,
  clearError: () => set({ error: null }),

  exportBackup: async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return null
    }
    set({ isBusy: true, error: null })
    const [students, receipts, payments] = await Promise.all([
      supabase.from('students').select('*'),
      supabase.from('receipt_vouchers').select('*'),
      supabase.from('payment_vouchers').select('*'),
    ])
    set({ isBusy: false })
    if (students.error || receipts.error || payments.error) {
      set({ error: 'تعذّر إنشاء النسخة الاحتياطيّة.' })
      return null
    }
    return {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exported_at: new Date().toISOString(),
      students: students.data ?? [],
      receipt_vouchers: receipts.data ?? [],
      payment_vouchers: payments.data ?? [],
    }
  },

  restore: async (payload) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return null
    }
    set({ isBusy: true, error: null })
    const { data, error } = await supabase.rpc('restore_center_data', { payload })
    set({ isBusy: false })
    if (error) {
      set({ error: 'تعذّرت الاستعادة؛ لم تتغيّر البيانات الحاليّة.' })
      return null
    }
    const counts = (data ?? {}) as RestoreCounts
    return counts
  },
}))
