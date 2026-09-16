import { create } from 'zustand'

import type { PaymentVoucherFormValues } from '@/features/payment-voucher/schema'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { PaymentVoucherLine } from '@/types/domain'

type MoneyOutStore = {
  currentView: 'payment-voucher' | 'expense-record'
  vouchers: PaymentVoucherLine[]
  isSaving: boolean
  error: string | null
  savePaymentVoucher: (values: PaymentVoucherFormValues) => Promise<boolean>
  goToPaymentVoucher: () => void
  clearError: () => void
}

type PaymentVoucherRow = {
  id: string
  voucher_number: number
  voucher_date: string
  expense_type: string
  amount: number | string
  notes: string | null
}

function normalizePaymentVoucher(row: PaymentVoucherRow): PaymentVoucherLine {
  return {
    id: row.id,
    voucherNumber: row.voucher_number,
    voucherDate: row.voucher_date,
    expenseType: row.expense_type,
    amount: Number(row.amount),
    notes: row.notes ?? '',
  }
}

async function fetchPaymentVouchers() {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) throw new Error('عميل قاعدة البيانات غير مهيأ.')

  const { data, error } = await supabase
    .from('payment_vouchers')
    .select('id, voucher_number, voucher_date, expense_type, amount, notes')
    .order('voucher_date', { ascending: true })
    .order('voucher_number', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => normalizePaymentVoucher(row as PaymentVoucherRow))
}

export const useMoneyOutStore = create<MoneyOutStore>((set, get) => ({
  currentView: 'payment-voucher',
  vouchers: [],
  isSaving: false,
  error: null,
  clearError: () => set({ error: null }),
  goToPaymentVoucher: () => set({ currentView: 'payment-voucher' }),
  savePaymentVoucher: async (values) => {
    if (get().isSaving) {
      set({ error: 'جارٍ حفظ سند الصرف بالفعل.' })
      return false
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.' })
      return false
    }

    set({ isSaving: true, error: null })
    const idempotencyKey = crypto.randomUUID()

    try {
      const { error: voucherError } = await supabase.rpc('post_payment_voucher', {
        payload: {
          voucher_date: values.paymentDate,
          expense_type: values.expenseType.trim(),
          amount: values.amount,
          notes: values.notes.trim(),
          idempotency_key: idempotencyKey,
        },
      })
      if (voucherError) throw voucherError

      const vouchers = await fetchPaymentVouchers()
      set({ vouchers, currentView: 'expense-record', isSaving: false })
      return true
    } catch (error) {
      console.error('savePaymentVoucher failed', error)
      set({ isSaving: false, error: 'تعذّر حفظ سند الصرف. تحقّق من البيانات وحاول مرّة أخرى.' })
      return false
    }
  },
}))
