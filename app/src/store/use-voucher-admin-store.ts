import { create } from 'zustand'

import type { PaymentVoucherFormValues } from '@/features/payment-voucher/schema'
import type { ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'
import { getSupabaseBrowserClient } from '@/lib/supabase'

// Administrative voucher actions: cancel (never delete) and descriptive-only edit.
// Financial fields are immutable after posting; every UPDATE is recorded server-side
// in voucher_audit_log by a trigger. The voucher number never changes.

export type ReceiptEditData = {
  paymentDate: string
  studentName: string
  courseName: string
  courseValue: number
  amountReceived: number
  payerName: string
  notes: string
}

export type PaymentEditData = {
  paymentDate: string
  expenseType: string
  amount: number
  notes: string
}

type VoucherAdminStore = {
  isBusy: boolean
  error: string | null
  clearError: () => void
  cancelVoucher: (type: 'receipt' | 'payment', id: string, reason: string) => Promise<boolean>
  restoreVoucher: (type: 'receipt' | 'payment', id: string) => Promise<boolean>
  fetchReceipt: (id: string) => Promise<ReceiptEditData | null>
  fetchPayment: (id: string) => Promise<PaymentEditData | null>
  updateReceipt: (id: string, values: ReceiptVoucherFormValues) => Promise<boolean>
  updatePayment: (id: string, values: PaymentVoucherFormValues) => Promise<boolean>
}

const NOT_CONFIGURED = 'الاتصال بقاعدة البيانات غير مهيأ بعد.'

export const useVoucherAdminStore = create<VoucherAdminStore>((set) => ({
  isBusy: false,
  error: null,
  clearError: () => set({ error: null }),

  cancelVoucher: async (type, id, reason) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    const trimmed = reason.trim()
    if (!trimmed) {
      set({ error: 'سبب الإلغاء مطلوب.' })
      return false
    }
    const table = type === 'receipt' ? 'receipt_vouchers' : 'payment_vouchers'
    set({ isBusy: true, error: null })
    const { error } = await supabase
      .from(table)
      .update({ cancelled_at: new Date().toISOString(), cancel_reason: trimmed })
      .eq('id', id)
      .is('cancelled_at', null)
    set({ isBusy: false })
    if (error) {
      set({ error: 'تعذّر إلغاء السند.' })
      return false
    }
    return true
  },

  // Cancellation is final by product rule. Keep this compatibility surface so old
  // callers fail safely rather than ever reopening a financial document.
  restoreVoucher: async () => {
    set({ error: 'السند الملغى لا يمكن استعادته.' })
    return false
  },

  fetchReceipt: async (id) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return null
    }
    const { data, error } = await supabase
      .from('receipt_vouchers')
      .select('voucher_date, student_name_snapshot, course_name, course_value, amount_received, payer_name, notes')
      .eq('id', id)
      .single()
    if (error || !data) {
      set({ error: 'تعذّر تحميل السند.' })
      return null
    }
    return {
      paymentDate: data.voucher_date as string,
      studentName: (data.student_name_snapshot as string) ?? '',
      courseName: (data.course_name as string) ?? '',
      courseValue: Number(data.course_value),
      amountReceived: Number(data.amount_received),
      payerName: (data.payer_name as string) ?? '',
      notes: (data.notes as string) ?? '',
    }
  },

  fetchPayment: async (id) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return null
    }
    const { data, error } = await supabase
      .from('payment_vouchers')
      .select('voucher_date, expense_type, amount, notes')
      .eq('id', id)
      .single()
    if (error || !data) {
      set({ error: 'تعذّر تحميل السند.' })
      return null
    }
    return {
      paymentDate: data.voucher_date as string,
      expenseType: (data.expense_type as string) ?? '',
      amount: Number(data.amount),
      notes: (data.notes as string) ?? '',
    }
  },

  // Only descriptive fields may change after posting. Financial fields remain the
  // original source-of-truth facts and are protected again by the database trigger.
  updateReceipt: async (id, values) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    set({ isBusy: true, error: null })
    const { error } = await supabase
      .from('receipt_vouchers')
      .update({
        payer_name: values.payerName.trim(),
        notes: values.notes.trim(),
      })
      .eq('id', id)
    set({ isBusy: false })
    if (error) {
      set({ error: 'تعذّر حفظ التعديل.' })
      return false
    }
    return true
  },

  updatePayment: async (id, values) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    set({ isBusy: true, error: null })
    const { error } = await supabase
      .from('payment_vouchers')
      .update({ notes: values.notes.trim() })
      .eq('id', id)
    set({ isBusy: false })
    if (error) {
      set({ error: 'تعذّر حفظ التعديل.' })
      return false
    }
    return true
  },
}))
