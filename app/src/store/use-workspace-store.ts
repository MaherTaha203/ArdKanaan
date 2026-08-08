import { create } from 'zustand'

import { getSupabaseBrowserClient } from '@/lib/supabase'
import type { FinancialMovement, Student, StudentStatementLine } from '@/types/domain'

// The workspace read model. It only READS the two sources of truth through their
// derived views; it never writes and never stores a balance. Writes stay in the
// dedicated voucher stores (use-money-in-store, use-money-out-store).

type WorkspaceStore = {
  students: Student[]
  statementLines: StudentStatementLine[]
  movements: FinancialMovement[]
  isLoading: boolean
  loaded: boolean
  error: string | null
  load: () => Promise<void>
  clearError: () => void
}

type StudentRow = {
  id: string
  name: string
  phone: string | null
  notes: string | null
}

type StatementRow = {
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

type MovementRow = {
  id: string
  movement_type: 'receipt' | 'payment'
  voucher_number: number
  voucher_date: string
  amount: number | string
  party_name: string | null
  context: string | null
}

function normalizeStudent(row: StudentRow): Student {
  return { id: row.id, name: row.name, phone: row.phone, notes: row.notes }
}

function normalizeStatementLine(row: StatementRow): StudentStatementLine {
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

function normalizeMovement(row: MovementRow): FinancialMovement {
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

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  students: [],
  statementLines: [],
  movements: [],
  isLoading: false,
  loaded: false,
  error: null,
  clearError: () => set({ error: null }),
  load: async () => {
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      set({
        error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.',
        loaded: true,
        isLoading: false,
      })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const [studentsResult, statementResult, movementsResult] = await Promise.all([
        supabase.from('students').select('id, name, phone, notes').order('name', { ascending: true }),
        supabase
          .from('student_statement_lines')
          .select(
            'id, voucher_number, voucher_date, student_id, student_name, course_name, course_value, amount_received, remaining_balance',
          )
          .order('voucher_date', { ascending: true })
          .order('voucher_number', { ascending: true }),
        supabase
          .from('financial_movements')
          .select('id, movement_type, voucher_number, voucher_date, amount, party_name, context')
          .order('voucher_date', { ascending: true })
          .order('created_at', { ascending: true }),
      ])

      if (studentsResult.error) throw studentsResult.error
      if (statementResult.error) throw statementResult.error
      if (movementsResult.error) throw movementsResult.error

      set({
        students: (studentsResult.data ?? []).map((row) => normalizeStudent(row as StudentRow)),
        statementLines: (statementResult.data ?? []).map((row) =>
          normalizeStatementLine(row as StatementRow),
        ),
        movements: (movementsResult.data ?? []).map((row) => normalizeMovement(row as MovementRow)),
        isLoading: false,
        loaded: true,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء تحميل بيانات المركز.'
      set({ isLoading: false, loaded: true, error: message })
    }
  },
}))
