import { create } from 'zustand'

import type { ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { toWesternDigits } from '@/lib/numbers'
import type { Student, StudentStatementLine } from '@/types/domain'

export type SavedReceiptVoucher = {
  id: string
  voucherNumber: number
  amount: number
  voucherDate: string
  studentName: string
}

type MoneyInStore = {
  currentView: 'receipt-voucher' | 'student-statement'
  statementLines: StudentStatementLine[]
  activeStudent: Student | null
  isSaving: boolean
  error: string | null
  saveReceiptVoucher: (values: ReceiptVoucherFormValues) => Promise<SavedReceiptVoucher | null>
  goToReceiptVoucher: () => void
  clearError: () => void
}

type StudentRow = {
  id: string
  name: string
  id_number: string | null
  phone: string | null
  notes: string | null
}

const STUDENT_COLUMNS = 'id, name, id_number, phone, notes'

type StudentStatementRow = {
  id: string
  voucher_number: number
  voucher_date: string
  student_id: string
  student_name: string
  course_name: string
  course_value: number | string
  amount_received: number | string
  remaining_balance: number | string
  entry_type?: 'course' | 'fee' | null
  fee_obligation_id?: string | null
  enrollment_id?: string | null
}

function normalizeStudent(row: StudentRow): Student {
  // The receipt-flow picker deals with identity only, not the lifecycle; the
  // lifecycle fields are defaulted so the shared Student shape is satisfied.
  return { id: row.id, name: toWesternDigits(row.name), idNumber: row.id_number == null ? null : toWesternDigits(row.id_number), phone: row.phone == null ? null : toWesternDigits(row.phone), notes: row.notes == null ? null : toWesternDigits(row.notes), status: 'active', archivedAt: null, archiveReason: null }
}

function normalizeStatementLine(row: StudentStatementRow): StudentStatementLine {
  return {
    id: row.id,
    voucherNumber: row.voucher_number,
    voucherDate: row.voucher_date,
    studentId: row.student_id,
    studentName: toWesternDigits(row.student_name),
    courseName: toWesternDigits(row.course_name),
    courseValue: Number(row.course_value),
    amountReceived: Number(row.amount_received),
    remainingBalance: Number(row.remaining_balance),
    entryType: row.entry_type ?? 'course',
    feeObligationId: row.fee_obligation_id ?? null,
    enrollmentId: row.enrollment_id ?? null,
  }
}

async function fetchStatementLines(studentId: string) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) throw new Error('عميل قاعدة البيانات غير مهيأ.')

  const { data, error } = await supabase
    .rpc('get_student_statement_lines', { p_student_id: studentId })

  if (error) throw error
  const rows = (data ?? []) as StudentStatementRow[]
  return rows.map((row) => normalizeStatementLine(row))
}

export const useMoneyInStore = create<MoneyInStore>((set, get) => ({
  currentView: 'receipt-voucher',
  statementLines: [],
  activeStudent: null,
  isSaving: false,
  error: null,
  clearError: () => set({ error: null }),
  goToReceiptVoucher: () => set({ currentView: 'receipt-voucher' }),
  saveReceiptVoucher: async (values) => {
    if (get().isSaving) {
      set({ error: 'جارٍ حفظ سند القبض بالفعل.' })
      return null
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.' })
      return null
    }

    const pickedStudentId = values.studentId.trim()
    if (!pickedStudentId) {
      set({ error: 'اختر الطالب من قائمة الطلاب قبل إصدار سند القبض.' })
      return null
    }

    if (values.allocations.length === 0) {
      set({ error: 'اختر الدورة أو الرسم المستحق الذي سيتم تحصيله قبل حفظ سند القبض.' })
      return null
    }

    const allocationSum = values.allocations.reduce((sum, item) => sum + item.amount, 0)
    if (allocationSum !== values.amountReceived) {
      set({ error: 'مجموع بنود التحصيل لا يساوي المبلغ المقبوض.' })
      return null
    }

    set({ isSaving: true, error: null })
    const idempotencyKey = crypto.randomUUID()

    try {
      const { data: pickedRows, error: pickedError } = await supabase
        .from('students')
        .select(STUDENT_COLUMNS)
        .eq('id', pickedStudentId)
        .limit(1)
      if (pickedError) throw pickedError

      const activeStudent = pickedRows?.[0] ? normalizeStudent(pickedRows[0] as StudentRow) : null
      if (!activeStudent) {
        set({ isSaving: false, error: 'الطالب المحدد غير موجود. أعد اختيار الطالب ثم حاول مرة أخرى.' })
        return null
      }

      const allocations = values.allocations.map((allocation) => ({
        type: allocation.type,
        enrollment_id: allocation.enrollmentId ?? null,
        fee_obligation_id: allocation.feeObligationId ?? null,
        amount: allocation.amount,
      }))

      const { data: postedReceipt, error: postError } = await supabase.rpc('post_receipt_with_allocations', {
        payload: {
          student_id: activeStudent.id,
          student_name: activeStudent.name,
          voucher_date: values.paymentDate,
          amount_received: values.amountReceived,
          payer_name: values.payerName.trim(),
          notes: values.notes.trim(),
          idempotency_key: idempotencyKey,
          allocations,
        },
      })
      if (postError) throw postError

      const posted = postedReceipt as { id?: string; voucher_number?: number; amount_received?: number } | null
      if (!posted?.id || posted.voucher_number == null) throw new Error('INVALID_RECEIPT_POST_RESULT')

      // The receipt RPC has committed successfully at this point. A subsequent
      // statement refresh is a read-after-write convenience and must not make a
      // committed receipt look like a failed save if that read temporarily fails.
      let statementLines = get().statementLines
      try {
        statementLines = await fetchStatementLines(activeStudent.id)
      } catch (refreshError) {
        console.error('Receipt saved, but statement refresh failed', refreshError)
      }
      set({ activeStudent, statementLines, currentView: 'student-statement', isSaving: false })
      return {
        id: posted.id,
        voucherNumber: Number(posted.voucher_number),
        amount: Number(posted.amount_received ?? values.amountReceived),
        voucherDate: values.paymentDate,
        studentName: activeStudent.name,
      }
    } catch (error) {
      console.error('saveReceiptVoucher failed', error)
      set({ isSaving: false, error: 'تعذّر حفظ السند. تحقّق من البيانات وحاول مرّة أخرى.' })
      return null
    }
  },
}))
