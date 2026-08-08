import { create } from 'zustand'

import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { FinancialMovement } from '@/types/domain'

type FinancialReportStore = {
  movements: FinancialMovement[]
  totalReceipts: number
  totalPayments: number
  netBalance: number
  isLoading: boolean
  loaded: boolean
  error: string | null
  loadReport: () => Promise<void>
  clearError: () => void
}

type FinancialMovementRow = {
  id: string
  movement_type: 'receipt' | 'payment'
  voucher_number: number
  voucher_date: string
  amount: number | string
  party_name: string | null
  context: string | null
}

function normalizeMovement(row: FinancialMovementRow): FinancialMovement {
  return {
    id: row.id,
    movementType: row.movement_type,
    voucherNumber: row.voucher_number,
    voucherDate: row.voucher_date,
    amount: Number(row.amount),
    partyName: row.party_name,
    context: row.context,
  }
}

export const useFinancialReportStore = create<FinancialReportStore>((set) => ({
  movements: [],
  totalReceipts: 0,
  totalPayments: 0,
  netBalance: 0,
  isLoading: false,
  loaded: false,
  error: null,
  clearError: () => set({ error: null }),
  loadReport: async () => {
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.', loaded: true })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('financial_movements')
        .select('id, movement_type, voucher_number, voucher_date, amount, party_name, context')
        .order('voucher_date', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      const movements = (data ?? []).map((row) => normalizeMovement(row as FinancialMovementRow))

      // Derived by the presentation layer only — never stored as an independent balance.
      const totalReceipts = movements
        .filter((movement) => movement.movementType === 'receipt')
        .reduce((sum, movement) => sum + movement.amount, 0)
      const totalPayments = movements
        .filter((movement) => movement.movementType === 'payment')
        .reduce((sum, movement) => sum + movement.amount, 0)

      set({
        movements,
        totalReceipts,
        totalPayments,
        netBalance: totalReceipts - totalPayments,
        isLoading: false,
        loaded: true,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء تحميل التقرير المالي.'

      set({ isLoading: false, loaded: true, error: message })
    }
  },
}))
