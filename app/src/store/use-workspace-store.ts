import { create } from 'zustand'

import { fetchAllRows } from '@/lib/fetch-all'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import type {
  CancelledVoucher,
  Course,
  CourseStatus,
  Enrollment,
  FeeCategory,
  FeeObligation,
  FinancialMovement,
  Student,
  StudentStatementLine,
} from '@/types/domain'

type WorkspaceStore = {
  students: Student[]
  statementLines: StudentStatementLine[]
  movements: FinancialMovement[]
  cancelledVouchers: CancelledVoucher[]
  courses: Course[]
  enrollments: Enrollment[]
  feeObligations: FeeObligation[]
  isLoading: boolean
  loaded: boolean
  error: string | null
  load: () => Promise<void>
  clearError: () => void
}

type StudentRow = { id: string; name: string; id_number: string | null; phone: string | null; notes: string | null; status?: string | null; archived_at?: string | null; archive_reason?: string | null }
type StatementRow = { id: string; voucher_number: number; voucher_date: string; student_id: string; student_name: string; course_name: string; course_value: number | string; amount_received: number | string; remaining_balance: number | string; entry_type?: 'course' | 'fee' | null; fee_obligation_id?: string | null; enrollment_id?: string | null }
type MovementRow = { id: string; movement_type: 'receipt' | 'payment'; voucher_number: number; voucher_date: string; amount: number | string; party_name: string | null; context: string | null; external_share?: number | string | null }
function normalizeStudentStatus(value: string | null | undefined): Student['status'] {
  return value === 'archived' ? 'archived' : value === 'completed' ? 'completed' : 'active'
}
function normalizeStudent(row: StudentRow): Student { return { id: row.id, name: row.name, idNumber: row.id_number, phone: row.phone, notes: row.notes, status: normalizeStudentStatus(row.status), archivedAt: row.archived_at ?? null, archiveReason: row.archive_reason ?? null } }
function normalizeStatementLine(row: StatementRow): StudentStatementLine { return { id: row.id, voucherNumber: row.voucher_number, voucherDate: row.voucher_date, studentId: row.student_id, studentName: row.student_name, courseName: row.course_name, courseValue: Number(row.course_value), amountReceived: Number(row.amount_received), remainingBalance: Number(row.remaining_balance), entryType: row.entry_type ?? 'course', feeObligationId: row.fee_obligation_id ?? null, enrollmentId: row.enrollment_id ?? null } }
function normalizeMovement(row: MovementRow): FinancialMovement { return { id: row.id, movementType: row.movement_type, voucherNumber: row.voucher_number, voucherDate: row.voucher_date, amount: Number(row.amount), partyName: row.party_name, context: row.context, externalShare: Number(row.external_share ?? 0) } }
type CourseRow = { id: string; name: string; base_fee: number | string | null; start_date: string | null; end_date: string | null; status: string; notes: string | null }
function normalizeCourse(row: CourseRow): Course { return { id: row.id, name: row.name, baseFee: row.base_fee === null ? null : Number(row.base_fee), startDate: row.start_date, endDate: row.end_date, status: (row.status === 'ended' ? 'ended' : 'active') as CourseStatus, notes: row.notes ?? '' } }
type EnrollmentRow = { id: string; student_id: string; course_id: string; course_name: string; course_value: number | string }
function normalizeEnrollment(row: EnrollmentRow): Enrollment { return { id: row.id, studentId: row.student_id, courseId: row.course_id, courseName: row.course_name, courseValue: Number(row.course_value) } }
type FeeObligationRow = { id: string; student_id: string; enrollment_id: string; course_id: string; course_name: string; description: string; amount: number | string; fee_category: FeeCategory; external_share: number | string; cancelled_at: string | null; cancel_reason: string | null; created_at: string }
function normalizeFeeObligation(row: FeeObligationRow): FeeObligation { return { id: row.id, studentId: row.student_id, enrollmentId: row.enrollment_id, courseId: row.course_id, courseName: row.course_name, description: row.description, amount: Number(row.amount), feeCategory: row.fee_category, externalShare: Number(row.external_share), cancelledAt: row.cancelled_at, cancelReason: row.cancel_reason, createdAt: row.created_at } }
type CancelledRow = MovementRow & { cancelled_at: string; cancel_reason: string | null }
function normalizeCancelled(row: CancelledRow): CancelledVoucher { return { id: row.id, movementType: row.movement_type, voucherNumber: row.voucher_number, voucherDate: row.voucher_date, amount: Number(row.amount), partyName: row.party_name, context: row.context, cancelledAt: row.cancelled_at, cancelReason: row.cancel_reason } }

type SupabaseClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>

// Reads students with the lifecycle/archive columns, falling back to the base
// identity columns when the archive migration has not been applied yet — so the
// app stays backward-compatible whether or not `archived_at`/`archive_reason`
// exist. normalizeStudent defaults status to 'active' and archive fields to null.
async function loadStudents(supabase: SupabaseClient): Promise<{ data: StudentRow[]; error: unknown }> {
  const full = await fetchAllRows<StudentRow>((from, to) => supabase.from('students').select('id, name, id_number, phone, notes, status, archived_at, archive_reason').order('name', { ascending: true }).range(from, to))
  if (!full.error) return full
  return fetchAllRows<StudentRow>((from, to) => supabase.from('students').select('id, name, id_number, phone, notes').order('name', { ascending: true }).range(from, to))
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  students: [], statementLines: [], movements: [], cancelledVouchers: [], courses: [], enrollments: [], feeObligations: [], isLoading: false, loaded: false, error: null,
  clearError: () => set({ error: null }),
  load: async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) { set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.', loaded: true, isLoading: false }); return }
    set({ isLoading: true, error: null })
    try {
      const [studentsResult, statementResult, movementsResult, cancelledResult] = await Promise.all([
        loadStudents(supabase),
        fetchAllRows<StatementRow>((from, to) => supabase.from('student_statement_lines').select('id, voucher_number, voucher_date, student_id, student_name, course_name, course_value, amount_received, remaining_balance, entry_type, fee_obligation_id, enrollment_id').order('voucher_date', { ascending: true }).order('voucher_number', { ascending: true }).range(from, to)),
        fetchAllRows<MovementRow>((from, to) => supabase.from('financial_movements').select('id, movement_type, voucher_number, voucher_date, amount, party_name, context, external_share').order('voucher_date', { ascending: true }).order('created_at', { ascending: true }).range(from, to)),
        fetchAllRows<CancelledRow>((from, to) => supabase.from('cancelled_vouchers').select('id, movement_type, voucher_number, voucher_date, amount, party_name, context, cancelled_at, cancel_reason').order('cancelled_at', { ascending: false }).range(from, to)),
      ])
      if (studentsResult.error) throw studentsResult.error
      if (statementResult.error) throw statementResult.error
      if (movementsResult.error) throw movementsResult.error
      if (cancelledResult.error) throw cancelledResult.error
      set({ students: studentsResult.data.map(normalizeStudent), statementLines: statementResult.data.map(normalizeStatementLine), movements: movementsResult.data.map(normalizeMovement), cancelledVouchers: cancelledResult.data.map(normalizeCancelled) })

      const [coursesResult, enrollmentsResult, feesResult] = await Promise.all([
        fetchAllRows<CourseRow>((from, to) => supabase.from('courses').select('id, name, base_fee, start_date, end_date, status, notes').order('name', { ascending: true }).range(from, to)),
        fetchAllRows<EnrollmentRow>((from, to) => supabase.from('enrollments').select('id, student_id, course_id, course_name, course_value').range(from, to)),
        fetchAllRows<FeeObligationRow>((from, to) => supabase.from('fee_obligations').select('id, student_id, enrollment_id, course_id, course_name, description, amount, fee_category, external_share, cancelled_at, cancel_reason, created_at').order('created_at', { ascending: true }).range(from, to)),
      ])
      if (coursesResult.error || enrollmentsResult.error || feesResult.error) console.error('optional workspace load failed', { courses: coursesResult.error, enrollments: enrollmentsResult.error, feeObligations: feesResult.error })
      set({ courses: coursesResult.error ? [] : coursesResult.data.map(normalizeCourse), enrollments: enrollmentsResult.error ? [] : enrollmentsResult.data.map(normalizeEnrollment), feeObligations: feesResult.error ? [] : feesResult.data.map(normalizeFeeObligation), isLoading: false, loaded: true })
    } catch (error) {
      console.error('workspace load failed', error)
      set({ isLoading: false, loaded: true, error: 'تعذّر تحميل بيانات المركز. تحقّق من الاتصال وحاول تحديث الصفحة.' })
    }
  },
}))
