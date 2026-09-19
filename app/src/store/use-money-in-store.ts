import { create } from 'zustand'

import type { ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { Student, StudentStatementLine } from '@/types/domain'

type MoneyInStore = {
  currentView: 'receipt-voucher' | 'student-statement'
  statementLines: StudentStatementLine[]
  activeStudent: Student | null
  isSaving: boolean
  error: string | null
  saveReceiptVoucher: (values: ReceiptVoucherFormValues) => Promise<boolean>
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
  return { id: row.id, name: row.name, idNumber: row.id_number, phone: row.phone, notes: row.notes, status: 'active', archivedAt: null, archiveReason: null }
}

function normalizeStatementLine(row: StudentStatementRow): StudentStatementLine {
  return {
    id: row.id,
    voucherNumber: row.voucher_number,
    voucherDate: row.voucher_date,
    studentId: row.student_id,
    studentName: row.student_name,
    courseName: row.course_name,
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
    .from('student_statement_lines')
    .select('id, voucher_number, voucher_date, student_id, student_name, course_name, course_value, amount_received, remaining_balance, entry_type, fee_obligation_id, enrollment_id')
    .eq('student_id', studentId)
    .order('voucher_date', { ascending: true })
    .order('voucher_number', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => normalizeStatementLine(row as StudentStatementRow))
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
      return false
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.' })
      return false
    }

    const pickedStudentId = values.studentId.trim()
    if (!pickedStudentId) {
      set({ error: 'اختر الطالب من قائمة الطلاب قبل إصدار سند القبض.' })
      return false
    }

    if (values.allocations.length === 0) {
      set({ error: 'اختر الدورة أو الرسم المستحق الذي سيتم تحصيله قبل حفظ سند القبض.' })
      return false
    }

    const allocationSum = values.allocations.reduce((sum, item) => sum + item.amount, 0)
    if (allocationSum !== values.amountReceived) {
      set({ error: 'مجموع بنود التحصيل لا يساوي المبلغ المقبوض.' })
      return false
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
        return false
      }

      const allocations = values.allocations.map((allocation) => ({
        type: allocation.type,
        enrollment_id: allocation.enrollmentId ?? null,
        fee_obligation_id: allocation.feeObligationId ?? null,
        amount: allocation.amount,
      }))

      const { error: postError } = await supabase.rpc('post_receipt_with_allocations', {
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

      const statementLines = await fetchStatementLines(activeStudent.id)
      set({ activeStudent, statementLines, currentView: 'student-statement', isSaving: false })
      return true
    } catch (error) {
      console.error('saveReceiptVoucher failed', error)
      set({ isSaving: false, error: 'تعذّر حفظ السند. تحقّق من البيانات وحاول مرّة أخرى.' })
      return false
    }
  },
}))
