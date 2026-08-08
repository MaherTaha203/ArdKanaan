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
  phone: string | null
  notes: string | null
}

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
}

function normalizeStudent(row: StudentRow): Student {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    notes: row.notes,
  }
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
  }
}

async function fetchStatementLines(studentId: string) {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    throw new Error('عميل قاعدة البيانات غير مهيأ.')
  }

  const { data, error } = await supabase
    .from('student_statement_lines')
    .select(
      'id, voucher_number, voucher_date, student_id, student_name, course_name, course_value, amount_received, remaining_balance',
    )
    .eq('student_id', studentId)
    .order('voucher_date', { ascending: true })
    .order('voucher_number', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => normalizeStatementLine(row as StudentStatementRow))
}

export const useMoneyInStore = create<MoneyInStore>((set) => ({
  currentView: 'receipt-voucher',
  statementLines: [],
  activeStudent: null,
  isSaving: false,
  error: null,
  clearError: () => set({ error: null }),
  goToReceiptVoucher: () => set({ currentView: 'receipt-voucher' }),
  saveReceiptVoucher: async (values) => {
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.' })
      return false
    }

    set({ isSaving: true, error: null })

    try {
      const normalizedStudentName = values.studentName.trim()

      const { data: existingStudentRows, error: studentLookupError } = await supabase
        .from('students')
        .select('id, name, phone, notes')
        .eq('name', normalizedStudentName)
        .limit(1)

      if (studentLookupError) {
        throw studentLookupError
      }

      let activeStudent: Student | null = existingStudentRows?.[0]
        ? normalizeStudent(existingStudentRows[0] as StudentRow)
        : null

      if (!activeStudent) {
        const { data: studentRow, error: studentError } = await supabase
          .from('students')
          .insert({
            name: normalizedStudentName,
            phone: null,
            notes: null,
          })
          .select('id, name, phone, notes')
          .single()

        if (studentError) {
          throw studentError
        }

        activeStudent = normalizeStudent(studentRow as StudentRow)
      }

      if (!activeStudent) {
        throw new Error('تعذر تحديد الطالب المطلوب للسند.')
      }

      const { error: voucherError } = await supabase
        .from('receipt_vouchers')
        .insert({
          voucher_date: values.paymentDate,
          student_id: activeStudent.id,
          student_name_snapshot: activeStudent.name,
          course_name: values.courseName.trim(),
          course_value: values.courseValue,
          amount_received: values.amountReceived,
          payer_name: values.payerName.trim(),
          notes: values.notes.trim(),
        })
        .select(
          'id, voucher_number, voucher_date, student_id, student_name_snapshot, course_name, course_value, amount_received, payer_name, notes',
        )
        .single()

      if (voucherError) {
        throw voucherError
      }

      const statementLines = await fetchStatementLines(activeStudent.id)

      set({
        activeStudent,
        statementLines,
        currentView: 'student-statement',
        isSaving: false,
      })

      return true
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء حفظ السند.'

      set({ isSaving: false, error: message })
      return false
    }
  },
}))