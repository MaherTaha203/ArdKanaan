import { create } from 'zustand'

import { fetchAllRows } from '@/lib/fetch-all'
import { toWesternDigits } from '@/lib/numbers'
import type { StudentFinancialSummary } from '@/lib/aggregate'
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
  statementStudentId: string | null
  statementLoading: boolean
  studentSummaries: StudentFinancialSummary[]
  movements: FinancialMovement[]
  cancelledVouchers: CancelledVoucher[]
  courses: Course[]
  enrollments: Enrollment[]
  feeObligations: FeeObligation[]
  isLoading: boolean
  loaded: boolean
  error: string | null
  load: () => Promise<void>
  loadStudentStatement: (studentId: string) => Promise<void>
  clearError: () => void
}

type StudentRow = { id: string; name: string; id_number: string | null; phone: string | null; notes: string | null; status?: string | null; archived_at?: string | null; archive_reason?: string | null }
type StatementRow = { id: string; voucher_number: number; voucher_date: string; student_id: string; student_name: string; course_name: string; course_value: number | string; amount_received: number | string; remaining_balance: number | string; entry_type?: 'course' | 'fee' | null; fee_obligation_id?: string | null; enrollment_id?: string | null }
type StudentSummaryRow = { student_id: string; paid: number | string; remaining: number | string; courses: number; last_activity: string | null; line_count: number | string; course_names: string[] | null }
type MovementRow = { id: string; movement_type: 'receipt' | 'payment'; voucher_number: number; voucher_date: string; amount: number | string; party_name: string | null; context: string | null; external_share?: number | string | null }
function normalizeStudentStatus(value: string | null | undefined): Student['status'] {
  return value === 'archived' ? 'archived' : value === 'completed' ? 'completed' : 'active'
}
function normalizeStudent(row: StudentRow): Student { return { id: row.id, name: toWesternDigits(row.name), idNumber: row.id_number == null ? null : toWesternDigits(row.id_number), phone: row.phone == null ? null : toWesternDigits(row.phone), notes: row.notes == null ? null : toWesternDigits(row.notes), status: normalizeStudentStatus(row.status), archivedAt: row.archived_at ?? null, archiveReason: row.archive_reason == null ? null : toWesternDigits(row.archive_reason) } }
function normalizeStatementLine(row: StatementRow): StudentStatementLine { return { id: row.id, voucherNumber: row.voucher_number, voucherDate: row.voucher_date, studentId: row.student_id, studentName: toWesternDigits(row.student_name), courseName: toWesternDigits(row.course_name), courseValue: Number(row.course_value), amountReceived: Number(row.amount_received), remainingBalance: Number(row.remaining_balance), entryType: row.entry_type ?? 'course', feeObligationId: row.fee_obligation_id ?? null, enrollmentId: row.enrollment_id ?? null } }
function normalizeStudentSummary(row: StudentSummaryRow): StudentFinancialSummary { return { studentId: row.student_id, paid: Number(row.paid), remaining: Number(row.remaining), courses: Number(row.courses), lastActivity: row.last_activity, lineCount: Number(row.line_count), courseNames: (row.course_names ?? []).map(toWesternDigits) } }
function normalizeMovement(row: MovementRow): FinancialMovement { return { id: row.id, movementType: row.movement_type, voucherNumber: row.voucher_number, voucherDate: row.voucher_date, amount: Number(row.amount), partyName: row.party_name == null ? null : toWesternDigits(row.party_name), context: row.context == null ? null : toWesternDigits(row.context), externalShare: Number(row.external_share ?? 0) } }
type CourseRow = { id: string; name: string; base_fee: number | string | null; start_date: string | null; end_date: string | null; status: string; notes: string | null }
function normalizeCourse(row: CourseRow): Course { return { id: row.id, name: toWesternDigits(row.name), baseFee: row.base_fee === null ? null : Number(row.base_fee), startDate: row.start_date, endDate: row.end_date, status: (row.status === 'ended' ? 'ended' : 'active') as CourseStatus, notes: row.notes == null ? '' : toWesternDigits(row.notes) } }
type EnrollmentRow = { id: string; student_id: string; course_id: string; course_name: string; course_value: number | string; billing_model?: 'legacy_total' | 'monthly' | null; created_at?: string | null }
function normalizeEnrollment(row: EnrollmentRow): Enrollment { return { id: row.id, studentId: row.student_id, courseId: row.course_id, courseName: toWesternDigits(row.course_name), courseValue: Number(row.course_value), billingModel: row.billing_model === 'monthly' ? 'monthly' : 'legacy_total', createdAt: row.created_at ?? undefined } }
type FeeObligationRow = { id: string; student_id: string; enrollment_id: string | null; course_id: string | null; course_name: string | null; description: string; amount: number | string; fee_category: FeeCategory; external_share: number | string; fee_kind?: 'additional' | 'monthly_course' | null; due_month?: string | null; cancelled_at: string | null; cancel_reason: string | null; created_at: string }
function normalizeFeeObligation(row: FeeObligationRow): FeeObligation { return { id: row.id, studentId: row.student_id, enrollmentId: row.enrollment_id, courseId: row.course_id, courseName: row.course_name == null ? null : toWesternDigits(row.course_name), description: toWesternDigits(row.description), amount: Number(row.amount), feeCategory: row.fee_category, externalShare: Number(row.external_share), feeKind: row.fee_kind === 'monthly_course' ? 'monthly_course' : 'additional', dueMonth: row.due_month ?? null, cancelledAt: row.cancelled_at, cancelReason: row.cancel_reason == null ? null : toWesternDigits(row.cancel_reason), createdAt: row.created_at } }
type CancelledRow = MovementRow & { cancelled_at: string; cancel_reason: string | null }
function normalizeCancelled(row: CancelledRow): CancelledVoucher { return { id: row.id, movementType: row.movement_type, voucherNumber: row.voucher_number, voucherDate: row.voucher_date, amount: Number(row.amount), partyName: row.party_name == null ? null : toWesternDigits(row.party_name), context: row.context == null ? null : toWesternDigits(row.context), cancelledAt: row.cancelled_at, cancelReason: row.cancel_reason == null ? null : toWesternDigits(row.cancel_reason) } }

type SupabaseClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>

let statementRequestSequence = 0

// Reads students with the lifecycle/archive columns, falling back to the base
// identity columns when the archive migration has not been applied yet — so the
// app stays backward-compatible whether or not `archived_at`/`archive_reason`
// exist. normalizeStudent defaults status to 'active' and archive fields to null.
async function loadStudents(supabase: SupabaseClient): Promise<{ data: StudentRow[]; error: unknown }> {
  const full = await fetchAllRows<StudentRow>((from, to) => supabase.from('students').select('id, name, id_number, phone, notes, status, archived_at, archive_reason').order('name', { ascending: true }).range(from, to))
  if (!full.error) return full
  return fetchAllRows<StudentRow>((from, to) => supabase.from('students').select('id, name, id_number, phone, notes').order('name', { ascending: true }).range(from, to))
}

// A request can fail with 401 when the access token expires mid-session (e.g. the
// tab slept past the proactive refresh). That is recoverable: refresh the session
// and retry once, so a transient expiry never surfaces as a hard load error.
function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const record = error as { status?: unknown; code?: unknown; message?: unknown }
  if (record.status === 401) return true
  if (record.code === 'PGRST301' || record.code === '401') return true
  const message = typeof record.message === 'string' ? record.message.toLowerCase() : ''
  return message.includes('jwt') || message.includes('token is expired') || message.includes('unauthorized')
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  students: [], statementLines: [], statementStudentId: null, statementLoading: false, studentSummaries: [], movements: [], cancelledVouchers: [], courses: [], enrollments: [], feeObligations: [], isLoading: false, loaded: false, error: null,
  clearError: () => set({ error: null }),
  load: async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) { set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.', loaded: true, isLoading: false }); return }
    statementRequestSequence += 1
    set({ isLoading: true, error: null, statementLines: [], statementStudentId: null, statementLoading: false })

    // One load pass. Returns 'ok' on success (state already set), 'auth' when a
    // request failed with an expired/invalid token (recoverable), or 'error'.
    const attempt = async (): Promise<'ok' | 'auth' | 'error'> => {
      try {
        const [studentsResult, statementResult, movementsResult, cancelledResult] = await Promise.all([
          loadStudents(supabase),
          fetchAllRows<StudentSummaryRow>((from, to) => supabase.from('student_financial_summary').select('student_id, paid, remaining, courses, last_activity, line_count, course_names').order('student_id', { ascending: true }).range(from, to)),
          fetchAllRows<MovementRow>((from, to) => supabase.from('financial_movements').select('id, movement_type, voucher_number, voucher_date, amount, party_name, context, external_share').order('voucher_date', { ascending: true }).order('created_at', { ascending: true }).range(from, to)),
          fetchAllRows<CancelledRow>((from, to) => supabase.from('cancelled_vouchers').select('id, movement_type, voucher_number, voucher_date, amount, party_name, context, cancelled_at, cancel_reason').order('cancelled_at', { ascending: false }).range(from, to)),
        ])
        if (studentsResult.error) throw studentsResult.error
        if (statementResult.error) throw statementResult.error
        if (movementsResult.error) throw movementsResult.error
        if (cancelledResult.error) throw cancelledResult.error
        set({ students: studentsResult.data.map(normalizeStudent), studentSummaries: statementResult.data.map(normalizeStudentSummary), statementLines: [], statementStudentId: null, statementLoading: false, movements: movementsResult.data.map(normalizeMovement), cancelledVouchers: cancelledResult.data.map(normalizeCancelled) })

        const [coursesResult, enrollmentsResult, feesResult] = await Promise.all([
          fetchAllRows<CourseRow>((from, to) => supabase.from('courses').select('id, name, base_fee, start_date, end_date, status, notes').order('name', { ascending: true }).range(from, to)),
          fetchAllRows<EnrollmentRow>((from, to) => supabase.from('enrollments').select('id, student_id, course_id, course_name, course_value, billing_model, created_at').range(from, to)),
          fetchAllRows<FeeObligationRow>((from, to) => supabase.from('fee_obligations').select('id, student_id, enrollment_id, course_id, course_name, description, amount, fee_category, external_share, fee_kind, due_month, cancelled_at, cancel_reason, created_at').order('created_at', { ascending: true }).range(from, to)),
        ])
        if (coursesResult.error || enrollmentsResult.error || feesResult.error) console.error('optional workspace load failed', { courses: coursesResult.error, enrollments: enrollmentsResult.error, feeObligations: feesResult.error })
        set({ courses: coursesResult.error ? [] : coursesResult.data.map(normalizeCourse), enrollments: enrollmentsResult.error ? [] : enrollmentsResult.data.map(normalizeEnrollment), feeObligations: feesResult.error ? [] : feesResult.data.map(normalizeFeeObligation), isLoading: false, loaded: true })
        return 'ok'
      } catch (error) {
        if (isAuthError(error)) return 'auth'
        console.error('workspace load failed', error)
        return 'error'
      }
    }

    let outcome = await attempt()
    if (outcome === 'auth') {
      // Access token expired mid-session; refresh it and retry the load once.
      try { await supabase.auth.refreshSession() } catch (error) { console.error('session refresh failed', error) }
      outcome = await attempt()
    }
    if (outcome !== 'ok') {
      set({ isLoading: false, loaded: true, error: 'تعذّر تحميل بيانات المركز. تحقّق من الاتصال وحاول تحديث الصفحة.' })
    }
  },
  loadStudentStatement: async (studentId) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ statementLines: [], statementStudentId: studentId, statementLoading: false, error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.' })
      return
    }
    if (get().statementStudentId === studentId && !get().statementLoading) return

    const requestId = ++statementRequestSequence
    set({ statementLines: [], statementStudentId: studentId, statementLoading: true, error: null })
    try {
      const result = await fetchAllRows<StatementRow>((from, to) =>
        supabase
          .from('student_statement_lines')
          .select('id, voucher_number, voucher_date, student_id, student_name, course_name, course_value, amount_received, remaining_balance, entry_type, fee_obligation_id, enrollment_id')
          .eq('student_id', studentId)
          .order('voucher_date', { ascending: true })
          .order('voucher_number', { ascending: true })
          .range(from, to),
      )
      if (requestId !== statementRequestSequence) return
      if (result.error) throw result.error
      set({ statementLines: result.data.map(normalizeStatementLine), statementStudentId: studentId, statementLoading: false })
    } catch (error) {
      if (requestId !== statementRequestSequence) return
      if (isAuthError(error)) {
        try { await supabase.auth.refreshSession() } catch (refreshError) { console.error('session refresh failed', refreshError) }
        if (requestId !== statementRequestSequence) return
        try {
          const retry = await fetchAllRows<StatementRow>((from, to) =>
            supabase
              .from('student_statement_lines')
              .select('id, voucher_number, voucher_date, student_id, student_name, course_name, course_value, amount_received, remaining_balance, entry_type, fee_obligation_id, enrollment_id')
              .eq('student_id', studentId)
              .order('voucher_date', { ascending: true })
              .order('voucher_number', { ascending: true })
              .range(from, to),
          )
          if (requestId !== statementRequestSequence) return
          if (retry.error) throw retry.error
          set({ statementLines: retry.data.map(normalizeStatementLine), statementStudentId: studentId, statementLoading: false })
          return
        } catch (retryError) {
          if (requestId !== statementRequestSequence) return
          console.error('student statement retry failed', retryError)
        }
      }
      console.error('student statement load failed', error)
      set({ statementLines: [], statementStudentId: studentId, statementLoading: false, error: 'تعذّر تحميل كشف حساب الطالب. تحقّق من الاتصال وحاول مرة أخرى.' })
    }
  },
}))
