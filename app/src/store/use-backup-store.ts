import { create } from 'zustand'

import { fetchAllRows } from '@/lib/fetch-all'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import {
  BACKUP_APP,
  BACKUP_VERSION,
  type BackupPayload,
  type RestorePayload,
} from '@/lib/backup'

// Backup = a read snapshot of the source-of-truth tables. Restore = one atomic
// server-side call (restore_center_data RPC) that replaces everything or nothing.
// The store owns only the async I/O; file download/parse live in lib/backup.

export type RestoreCounts = {
  students: number
  receipt_vouchers: number
  payment_vouchers: number
  courses: number
  enrollments: number
  fee_obligations: number
  receipt_allocations: number
}

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

    const [students, courses, enrollments, fees, receipts, allocations, payments] = await Promise.all([
      dumpTable('students'),
      dumpTable('courses'),
      dumpTable('enrollments'),
      dumpTable('fee_obligations'),
      dumpTable('receipt_vouchers'),
      dumpTable('receipt_allocations'),
      dumpTable('payment_vouchers'),
    ])
    set({ isBusy: false })

    if (
      students.error || courses.error || enrollments.error || fees.error || receipts.error || allocations.error || payments.error ||
      !students.rows || !courses.rows || !enrollments.rows || !fees.rows || !receipts.rows || !allocations.rows || !payments.rows
    ) {
      set({ error: 'تعذّر إنشاء نسخة احتياطيّة كاملة؛ لم يُنشأ الملف.' })
      return null
    }

    return {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exported_at: new Date().toISOString(),
      students: students.rows,
      courses: courses.rows,
      enrollments: enrollments.rows,
      fee_obligations: fees.rows,
      receipt_vouchers: receipts.rows,
      receipt_allocations: allocations.rows,
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
