import { create } from 'zustand'

import { fetchAllRows } from '@/lib/fetch-all'
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

// A restore either completes, needs an explicit "shrink" confirmation (the backup
// has fewer records than the live data), or fails.
export type RestoreResult =
  | { status: 'done'; counts: RestoreCounts }
  | { status: 'confirm'; message: string }
  | { status: 'error' }

type BackupState = {
  isBusy: boolean
  error: string | null
  clearError: () => void
  exportBackup: () => Promise<BackupPayload | null>
  restore: (payload: RestorePayload, force: boolean) => Promise<RestoreResult>
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
    const db = supabase

    // Fully paginate each table (never the first-1000-rows cap), then verify the
    // fetched count against an exact server count — a backup that is short even by
    // one row must NOT be written, because restoring it would delete the rest.
    async function dumpTable(table: string) {
      const rows = await fetchAllRows<Record<string, unknown>>((from, to) =>
        db.from(table).select('*').order('id', { ascending: true }).range(from, to),
      )
      if (rows.error) return { rows: null, error: rows.error }
      const { count, error: countError } = await db
        .from(table)
        .select('id', { count: 'exact', head: true })
      if (countError) return { rows: null, error: countError }
      if (typeof count === 'number' && rows.data.length !== count) {
        return { rows: null, error: new Error(`incomplete:${table}`) }
      }
      return { rows: rows.data, error: null }
    }

    const [students, receipts, payments] = await Promise.all([
      dumpTable('students'),
      dumpTable('receipt_vouchers'),
      dumpTable('payment_vouchers'),
    ])
    set({ isBusy: false })

    if (students.error || receipts.error || payments.error || !students.rows || !receipts.rows || !payments.rows) {
      set({ error: 'تعذّر إنشاء نسخة احتياطيّة كاملة؛ لم يُنشأ الملف.' })
      return null
    }

    return {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exported_at: new Date().toISOString(),
      students: students.rows,
      receipt_vouchers: receipts.rows,
      payment_vouchers: payments.rows,
    }
  },

  restore: async (payload, force) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return { status: 'error' }
    }
    set({ isBusy: true, error: null })
    const { data, error } = await supabase.rpc('restore_center_data', { payload, force })
    set({ isBusy: false })
    if (error) {
      const message = (error as { message?: string }).message ?? ''
      // The server guard asks for an explicit confirmation when the backup is smaller.
      if (message.includes('RESTORE_SHRINKS')) {
        return { status: 'confirm', message }
      }
      if (message.includes('RESTORE_REFUSED_EMPTY')) {
        set({ error: 'النسخة فارغة — رُفضت الاستعادة حمايةً لبياناتك.' })
        return { status: 'error' }
      }
      set({ error: 'تعذّرت الاستعادة؛ لم تتغيّر البيانات الحاليّة.' })
      return { status: 'error' }
    }
    return { status: 'done', counts: (data ?? {}) as RestoreCounts }
  },
}))
