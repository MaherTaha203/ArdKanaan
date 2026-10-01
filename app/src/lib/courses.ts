import type { Course, Enrollment, Student, StudentStatementLine } from '@/types/domain'

// Pure derivations for the Courses feature. Nothing here is stored: fees come from
// the authoritative enrollment snapshot (course_value) and paid/remaining are
// derived from the voucher-sourced statement lines, exactly like the rest of the
// app. Never a second source of financial truth.

export type CourseStats = {
  studentCount: number
  totalFees: number
  totalPaid: number
  totalRemaining: number
}

export type CourseRosterEntry = {
  enrollment: Enrollment
  student: Student | null
  fee: number
  paid: number
  remaining: number
}

// An enrollment belongs to a course when it links by id, or — for a legacy
// enrollment created before catalog linking — when it shares the exact course name.
export function enrollmentBelongsToCourse(enrollment: Enrollment, course: Course): boolean {
  if (enrollment.courseId) return enrollment.courseId === course.id
  return enrollment.courseName === course.name
}

export function courseEnrollments(course: Course, enrollments: Enrollment[]): Enrollment[] {
  return enrollments.filter((enrollment) => enrollmentBelongsToCourse(enrollment, course))
}

function paidFor(lines: StudentStatementLine[], studentId: string, courseName: string): number {
  let paid = 0
  for (const line of lines) {
    if (line.studentId === studentId && line.courseName === courseName) {
      paid += line.amountReceived
    }
  }
  return paid
}

// The enrolled students of a course, each with fee (enrollment snapshot),
// paid (sum of receipts) and remaining (fee − paid; overpayment is impossible by
// the firewall, so this never goes negative). Sorted by student name (Arabic).
export function courseRoster(
  course: Course,
  enrollments: Enrollment[],
  students: Student[],
  lines: StudentStatementLine[],
): CourseRosterEntry[] {
  const byId = new Map(students.map((student) => [student.id, student]))
  return courseEnrollments(course, enrollments)
    .map((enrollment) => {
      const paid = paidFor(lines, enrollment.studentId, enrollment.courseName)
      return {
        enrollment,
        student: byId.get(enrollment.studentId) ?? null,
        fee: enrollment.courseValue,
        paid,
        remaining: enrollment.courseValue - paid,
      }
    })
    .sort((a, b) => (a.student?.name ?? '').localeCompare(b.student?.name ?? '', 'ar'))
}

export function courseStats(
  course: Course,
  enrollments: Enrollment[],
  students: Student[],
  lines: StudentStatementLine[],
): CourseStats {
  const roster = courseRoster(course, enrollments, students, lines)
  const studentIds = new Set<string>()
  let totalFees = 0
  let totalPaid = 0
  let totalRemaining = 0
  for (const entry of roster) {
    studentIds.add(entry.enrollment.studentId)
    totalFees += entry.fee
    totalPaid += entry.paid
    totalRemaining += entry.remaining
  }
  return { studentCount: studentIds.size, totalFees, totalPaid, totalRemaining }
}

export type CourseFinancialRow = {
  enrollmentId: string
  studentId: string
  courseId: string
  courseName: string
  courseValue: number
  paid: number
  remaining: number
}

export function courseRosterFromFinancialRows(
  course: Course,
  enrollments: Enrollment[],
  students: Student[],
  rows: CourseFinancialRow[],
): CourseRosterEntry[] {
  const byId = new Map(students.map((student) => [student.id, student]))
  const rowByEnrollment = new Map(rows.map((row) => [row.enrollmentId, row]))
  return courseEnrollments(course, enrollments)
    .map((enrollment) => {
      const row = rowByEnrollment.get(enrollment.id)
      return {
        enrollment,
        student: byId.get(enrollment.studentId) ?? null,
        fee: enrollment.courseValue,
        paid: row?.paid ?? 0,
        remaining: row?.remaining ?? enrollment.courseValue,
      }
    })
    .sort((a, b) => (a.student?.name ?? '').localeCompare(b.student?.name ?? '', 'ar'))
}

export function courseStatsFromFinancialRows(
  course: Course,
  enrollments: Enrollment[],
  students: Student[],
  rows: CourseFinancialRow[],
): CourseStats {
  const roster = courseRosterFromFinancialRows(course, enrollments, students, rows)
  return {
    studentCount: new Set(roster.map((entry) => entry.enrollment.studentId)).size,
    totalFees: roster.reduce((sum, entry) => sum + entry.fee, 0),
    totalPaid: roster.reduce((sum, entry) => sum + entry.paid, 0),
    totalRemaining: roster.reduce((sum, entry) => sum + entry.remaining, 0),
  }
}
