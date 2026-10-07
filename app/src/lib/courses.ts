import { studentCourseBreakdown } from '@/lib/aggregate'
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
  const courseRows = courseEnrollments(course, enrollments)

  const enrollmentsByStudent = new Map<string, Enrollment[]>()
  for (const enrollment of enrollments) {
    const bucket = enrollmentsByStudent.get(enrollment.studentId)
    if (bucket) bucket.push(enrollment)
    else enrollmentsByStudent.set(enrollment.studentId, [enrollment])
  }

  // Use the same enrollment-aware financial derivation as the Student Statement.
  // This prevents fee lines from being counted as course payments and keeps
  // same-named enrollments isolated by enrollmentId.
  const breakdownByStudent = new Map<string, ReturnType<typeof studentCourseBreakdown>>()
  for (const enrollment of courseRows) {
    if (!breakdownByStudent.has(enrollment.studentId)) {
      breakdownByStudent.set(
        enrollment.studentId,
        studentCourseBreakdown(
          enrollment.studentId,
          lines,
          enrollmentsByStudent.get(enrollment.studentId) ?? [],
        ),
      )
    }
  }

  return courseRows
    .map((enrollment) => {
      const breakdown = breakdownByStudent.get(enrollment.studentId) ?? []
      const entry = breakdown.find((item) => item.enrollmentId === enrollment.id)
      const paid = entry?.paid ?? 0
      const remaining = entry?.remaining ?? enrollment.courseValue
      return {
        enrollment,
        student: byId.get(enrollment.studentId) ?? null,
        fee: enrollment.courseValue,
        paid,
        remaining,
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
