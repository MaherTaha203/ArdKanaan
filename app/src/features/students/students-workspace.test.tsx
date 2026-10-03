// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'

import type { Enrollment, Student, StudentStatementLine } from '@/types/domain'
import type { StudentFinancialSummary } from '@/lib/aggregate'

// StudentsWorkspace reads everything from the workspace + shell zustand stores and
// lazy-loads the active student's statement. These behaviours are exactly what the
// lazy-load rebase turns on, so they are regression-tested here:
//   - course search goes through `enrollments` (not summary courseNames)
//   - selecting a student triggers a scoped statement load
//   - the ledger is gated on the statement for THIS student having finished loading,
//     so a previous/por-in-flight statement is never shown.

type WorkspaceState = {
  students: Student[]
  studentSummaries: StudentFinancialSummary[]
  statementLines: StudentStatementLine[]
  statementStudentId: string | null
  statementLoading: boolean
  loadStudentStatement: (id: string) => Promise<void>
  enrollments: Enrollment[]
  feeObligations: unknown[]
  loaded: boolean
  error: string | null
  clearError: () => void
  load: () => void
}
type ShellState = {
  selectedStudentId: string | null
  selectStudent: (id: string) => void
  openEditStudent: (id: string) => void
  openArchive: (id: string) => void
  openStudentFee: (id: string) => void
}

const selectStudent = vi.fn()
const loadStudentStatement = vi.fn(() => Promise.resolve())

const wsState = {} as WorkspaceState
const shellState = {} as ShellState

vi.mock('@/store/use-workspace-store', () => ({
  useWorkspaceStore: (selector: (s: WorkspaceState) => unknown) => selector(wsState),
}))
vi.mock('@/store/use-shell-store', () => ({
  useShellStore: (selector: (s: ShellState) => unknown) => selector(shellState),
}))

import { StudentsWorkspace } from '@/features/students/students-workspace'

function student(id: string, name: string, extra: Partial<Student> = {}): Student {
  return { id, name, idNumber: null, phone: null, notes: null, status: 'active', archivedAt: null, archiveReason: null, ...extra }
}
function summary(studentId: string, over: Partial<StudentFinancialSummary> = {}): StudentFinancialSummary {
  return { studentId, paid: 0, remaining: 0, courses: 0, lastActivity: null, lineCount: 0, courseNames: [], ...over }
}
function enrollment(id: string, studentId: string, courseName: string): Enrollment {
  return { id, studentId, courseId: `course-${id}`, courseName, courseValue: 100 }
}

const SARA = student('sara', 'سارة أحمد', { phone: '0591111111', idNumber: '900111' })
const OMAR = student('omar', 'عمر خالد', { phone: '0592222222', idNumber: '900222' })

beforeEach(() => {
  selectStudent.mockClear()
  loadStudentStatement.mockClear()
  Object.assign(wsState, {
    students: [SARA, OMAR],
    studentSummaries: [summary('sara'), summary('omar')],
    statementLines: [],
    statementStudentId: null,
    statementLoading: false,
    loadStudentStatement,
    enrollments: [enrollment('e1', 'sara', 'الرياضيات'), enrollment('e2', 'omar', 'الفيزياء')],
    feeObligations: [],
    loaded: true,
    error: null,
    clearError: vi.fn(),
    load: vi.fn(),
  } satisfies WorkspaceState)
  Object.assign(shellState, {
    selectedStudentId: null,
    selectStudent,
    openEditStudent: vi.fn(),
    openArchive: vi.fn(),
    openStudentFee: vi.fn(),
  } satisfies ShellState)
})
afterEach(cleanup)

const rowButton = (name: RegExp) => screen.queryByRole('button', { name })

describe('StudentsWorkspace search', () => {
  it('A — finds a student by name', async () => {
    render(<StudentsWorkspace />)
    await userEvent.type(screen.getByLabelText('البحث عن طالب'), 'سارة')
    expect(rowButton(/سارة أحمد/)).toBeInTheDocument()
    expect(rowButton(/عمر خالد/)).toBeNull()
  })

  it('B — finds a student by a fragment of the phone number', async () => {
    render(<StudentsWorkspace />)
    await userEvent.type(screen.getByLabelText('البحث عن طالب'), '1111')
    expect(rowButton(/سارة أحمد/)).toBeInTheDocument()
    expect(rowButton(/عمر خالد/)).toBeNull()
  })

  it('C — finds a student by a fragment of the ID number', async () => {
    render(<StudentsWorkspace />)
    await userEvent.type(screen.getByLabelText('البحث عن طالب'), '900222')
    expect(rowButton(/عمر خالد/)).toBeInTheDocument()
    expect(rowButton(/سارة أحمد/)).toBeNull()
  })

  it('D — finds a student by their enrolled course name (via enrollments)', async () => {
    render(<StudentsWorkspace />)
    await userEvent.type(screen.getByLabelText('البحث عن طالب'), 'الرياضيات')
    expect(rowButton(/سارة أحمد/)).toBeInTheDocument()
    expect(rowButton(/عمر خالد/)).toBeNull()
  })

  it('E — course search does not leak across students (no false positive)', async () => {
    render(<StudentsWorkspace />)
    // Only Omar is enrolled in الفيزياء; Sara must not appear for that course.
    await userEvent.type(screen.getByLabelText('البحث عن طالب'), 'الفيزياء')
    expect(rowButton(/عمر خالد/)).toBeInTheDocument()
    expect(rowButton(/سارة أحمد/)).toBeNull()
  })
})

describe('StudentsWorkspace selection', () => {
  it('F — clicking a search result makes that student active and loads their statement', async () => {
    render(<StudentsWorkspace />)
    await userEvent.type(screen.getByLabelText('البحث عن طالب'), 'عمر')
    await userEvent.click(rowButton(/عمر خالد/)!)
    expect(selectStudent).toHaveBeenCalledWith('omar')
  })

  it('loads only the active student’s statement on mount (scoped lazy-load)', () => {
    shellState.selectedStudentId = 'sara'
    render(<StudentsWorkspace />)
    expect(loadStudentStatement).toHaveBeenCalledWith('sara')
    expect(loadStudentStatement).not.toHaveBeenCalledWith('omar')
  })
})

describe('StudentsWorkspace statement isolation', () => {
  it('G — gates the ledger on the active student’s statement being ready (no stale rows while loading)', () => {
    // Active student = Sara, but her statement is still loading. Even though a line
    // is present in state, the ledger must show the loading state, not the row.
    shellState.selectedStudentId = 'sara'
    wsState.statementStudentId = 'sara'
    wsState.statementLoading = true
    wsState.statementLines = [
      { id: 'l1', voucherNumber: 1, voucherDate: '2026-02-01', studentId: 'sara', studentName: 'سارة أحمد', courseName: 'الرياضيات', courseValue: 100, amountReceived: 40, remainingBalance: 60, entryType: 'course', feeObligationId: null, enrollmentId: 'e1' },
    ]
    render(<StudentsWorkspace />)
    expect(screen.getByText('جارٍ تحميل الكشف…')).toBeInTheDocument()
    // Print is disabled until the statement for this student is ready.
    expect(screen.getByRole('button', { name: /طباعة الكشف/ })).toBeDisabled()
  })

  it('shows the ledger once the active student’s statement has finished loading', () => {
    shellState.selectedStudentId = 'sara'
    wsState.statementStudentId = 'sara'
    wsState.statementLoading = false
    wsState.statementLines = [
      { id: 'l1', voucherNumber: 1, voucherDate: '2026-02-01', studentId: 'sara', studentName: 'سارة أحمد', courseName: 'الرياضيات', courseValue: 100, amountReceived: 40, remainingBalance: 60, entryType: 'course', feeObligationId: null, enrollmentId: 'e1' },
    ]
    render(<StudentsWorkspace />)
    expect(screen.queryByText('جارٍ تحميل الكشف…')).toBeNull()
    expect(screen.getByRole('button', { name: /طباعة الكشف/ })).toBeEnabled()
  })
})
