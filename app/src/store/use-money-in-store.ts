import { create } from 'zustand'

import type { ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'
import { classifyNameMatches, findNameMatchIds } from '@/lib/student-identity'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { useWorkspaceStore } from '@/store/use-workspace-store'
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
  return { id: row.id, name: row.name, idNumber: row.id_number, phone: row.phone, notes: row.notes }
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
      const typedStudentName = values.studentName.trim()
      const pickedStudentId = values.studentId.trim()
      let activeStudent: Student | null = null

      if (pickedStudentId) {
        const { data: pickedRows, error: pickedError } = await supabase
          .from('students')
          .select(STUDENT_COLUMNS)
          .eq('id', pickedStudentId)
          .limit(1)
        if (pickedError) throw pickedError
        activeStudent = pickedRows?.[0] ? normalizeStudent(pickedRows[0] as StudentRow) : null
      }

      if (!activeStudent) {
        const roster = useWorkspaceStore.getState().students
        const resolution = classifyNameMatches(findNameMatchIds(roster, typedStudentName))
        if (resolution.kind === 'ambiguous') {
          set({ isSaving: false, error: 'يوجد أكثر من طالب بهذا الاسم. اختر الطالب المقصود من قائمة البحث قبل الحفظ.' })
          return false
        }
        if (resolution.kind === 'existing') activeStudent = roster.find((student) => student.id === resolution.id) ?? null
      }

      if (!activeStudent) {
        const idNumber = values.studentIdNumber.trim()
        const phone = values.studentPhone.trim()
        const { data: studentRow, error: studentError } = await supabase
          .from('students')
          .insert({ name: typedStudentName, id_number: idNumber || null, phone: phone || null, notes: null })
          .select(STUDENT_COLUMNS)
          .single()
        if (studentError) throw studentError
        activeStudent = normalizeStudent(studentRow as StudentRow)
      }

      if (!activeStudent) throw new Error('تعذّر تحديد الطالب المطلوب للسند.')

      const hasAllocations = values.allocations.length > 0
      if (hasAllocations || values.entryType === 'fee') {
        const allocations = values.allocations.map((allocation) => ({
          type: allocation.type,
          enrollment_id: allocation.enrollmentId ?? null,
          fee_obligation_id: allocation.feeObligationId ?? null,
          amount: allocation.amount,
        }))

        // A fee must always be tied to a real obligation created from the course.
        // Do not manufacture a fee obligation at payment time.
        if (values.entryType === 'fee' && allocations.length === 0) {
          set({ isSaving: false, error: 'اختر الرسم المستحق قبل حفظ سند القبض.' })
          return false
        }

        const allocationSum = allocations.reduce((sum, item) => sum + item.amount, 0)
        if (allocationSum !== values.amountReceived) {
          set({ isSaving: false, error: 'مجموع بنود التحصيل لا يساوي المبلغ المقبوض.' })
          return false
        }

        const { error: postError } = await supabase.rpc('post_receipt_with_allocations', {
          payload: {
            student_id: activeStudent.id,
            student_name: activeStudent.name,
            voucher_date: values.paymentDate,
            amount_received: values.amountReceived,
            payer_name: values.payerName.trim(),
            notes: values.notes.trim(),
            allocations,
          },
        })
        if (postError) throw postError
      } else {
        const courseName = values.courseName.trim()
        const enteredCourseValue = values.courseValue ?? 0
        const { data: existingEnrollment, error: enrollmentLookupError } = await supabase
          .from('enrollments')
          .select('course_value')
          .eq('student_id', activeStudent.id)
          .eq('course_name', courseName)
          .limit(1)
        if (enrollmentLookupError) throw enrollmentLookupError

        let courseValue = enteredCourseValue
        if (existingEnrollment?.[0]) {
          courseValue = Number(existingEnrollment[0].course_value)
        } else {
          const { error: enrollmentInsertError } = await supabase
            .from('enrollments')
            .insert({ student_id: activeStudent.id, course_name: courseName, course_value: enteredCourseValue })
          if (enrollmentInsertError) throw enrollmentInsertError
        }

        const { error: voucherError } = await supabase
          .from('receipt_vouchers')
          .insert({
            voucher_date: values.paymentDate,
            student_id: activeStudent.id,
            student_name_snapshot: activeStudent.name,
            course_name: courseName,
            course_value: courseValue,
            amount_received: values.amountReceived,
            payer_name: values.payerName.trim(),
            notes: values.notes.trim(),
            fee_category: null,
            external_share: 0,
            allocation_mode: false,
          })
        if (voucherError) throw voucherError
      }

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
