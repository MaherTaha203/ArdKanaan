import { create } from 'zustand'

import type { PaymentVoucherFormValues } from '@/features/payment-voucher/schema'
import type { ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'
import { getSupabaseBrowserClient } from '@/lib/supabase'

// Administrative voucher actions: cancel (never delete) and edit. Every UPDATE is
// recorded server-side in voucher_audit_log by a trigger; the voucher_number is
// GENERATED ALWAYS and never changes. These operate on the source-of-truth tables;
// balances re-derive automatically from the views afterwards.

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
    const table = type === 'receipt' ? 'receipt_vouchers' : 'payment_vouchers'
    set({ isBusy: true, error: null })
    const trimmed = reason.trim()
    const { error } = await supabase
      .from(table)
      .update({ cancelled_at: new Date().toISOString(), cancel_reason: trimmed || null })
      .eq('id', id)
      .is('cancelled_at', null) // never re-cancel an already-cancelled voucher
    set({ isBusy: false })
    if (error) {
      set({ error: 'تعذّر إلغاء السند.' })
      return false
    }
    return true
  },

  restoreVoucher: async (type, id) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: NOT_CONFIGURED })
      return false
    }
    const table = type === 'receipt' ? 'receipt_vouchers' : 'payment_vouchers'
    set({ isBusy: true, error: null })
    const { error } = await supabase
      .from(table)
      .update({ cancelled_at: null, cancel_reason: null })
      .eq('id', id)
    set({ isBusy: false })
    if (error) {
      set({ error: 'تعذّر استعادة السند.' })
      return false
    }
    return true
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

  // Edit keeps the voucher attached to its original student (student_id and the
  // number are untouched); only the financial fields change.
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
        voucher_date: values.paymentDate,
        course_name: values.courseName.trim(),
        course_value: values.courseValue,
        amount_received: values.amountReceived,
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
      .update({
        voucher_date: values.paymentDate,
        expense_type: values.expenseType.trim(),
        amount: values.amount,
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
}))
