import { describe, expect, it } from 'vitest'

import { courseEnrollments, courseRoster, courseStats, enrollmentBelongsToCourse } from '@/lib/courses'
import type { Course, Enrollment, Student, StudentStatementLine } from '@/types/domain'

const course: Course = {
  id: 'c1',
  name: 'رياضيات',
  baseFee: 200,
  startDate: null,
  endDate: null,
  status: 'active',
  notes: '',
}

const students: Student[] = [
  { id: 's1', name: 'محمد أحمد', idNumber: null, phone: null, notes: null, status: 'active', archivedAt: null, archiveReason: null },
  { id: 's2', name: 'زيد سالم', idNumber: null, phone: null, notes: null, status: 'active', archivedAt: null, archiveReason: null },
]

const enrollments: Enrollment[] = [
  { id: 'e1', studentId: 's1', courseId: 'c1', courseName: 'رياضيات', courseValue: 200 },
  // Legacy enrollment: no course_id, linked to the course by exact name.
  { id: 'e2', studentId: 's2', courseId: null, courseName: 'رياضيات', courseValue: 150 },
  // A different course — must not be counted for c1.
  { id: 'e3', studentId: 's1', courseId: 'c2', courseName: 'إنجليزي', courseValue: 100 },
]

const lines: StudentStatementLine[] = [
  { id: 'l1', voucherNumber: 1, voucherDate: '2026-09-01', studentId: 's1', studentName: 'محمد أحمد', courseName: 'رياضيات', courseValue: 200, amountReceived: 120, remainingBalance: 80 },
  { id: 'l2', voucherNumber: 2, voucherDate: '2026-09-02', studentId: 's2', studentName: 'زيد سالم', courseName: 'رياضيات', courseValue: 150, amountReceived: 150, remainingBalance: 0 },
  { id: 'l3', voucherNumber: 3, voucherDate: '2026-09-03', studentId: 's1', studentName: 'محمد أحمد', courseName: 'إنجليزي', courseValue: 100, amountReceived: 40, remainingBalance: 60 },
]

describe('enrollmentBelongsToCourse', () => {
  it('links by course_id when present', () => {
    expect(enrollmentBelongsToCourse(enrollments[0], course)).toBe(true)
  })

  it('links a legacy enrollment by exact course name when course_id is null', () => {
    expect(enrollmentBelongsToCourse(enrollments[1], course)).toBe(true)
  })

  it('excludes an enrollment of a different course', () => {
    expect(enrollmentBelongsToCourse(enrollments[2], course)).toBe(false)
  })
})

describe('courseEnrollments', () => {
  it('returns only the course’s enrollments (by id or legacy name)', () => {
    expect(courseEnrollments(course, enrollments).map((entry) => entry.id)).toEqual(['e1', 'e2'])
  })
})

describe('courseStats', () => {
  it('sums fees, receipts and remaining, and counts distinct students', () => {
    const stats = courseStats(course, enrollments, students, lines)
    expect(stats).toEqual({
      studentCount: 2,
      totalFees: 350, // 200 + 150
      totalPaid: 270, // 120 + 150
      totalRemaining: 80, // (200-120) + (150-150)
    })
  })
})

describe('courseRoster', () => {
  it('lists each enrolled student with fee, paid and remaining', () => {
    const roster = courseRoster(course, enrollments, students, lines)
    const byStudent = Object.fromEntries(roster.map((entry) => [entry.enrollment.studentId, entry]))
    expect(byStudent.s1.fee).toBe(200)
    expect(byStudent.s1.paid).toBe(120)
    expect(byStudent.s1.remaining).toBe(80)
    expect(byStudent.s2.remaining).toBe(0)
  })

  it('does not count another course’s receipts toward this course', () => {
    const roster = courseRoster(course, enrollments, students, lines)
    const s1 = roster.find((entry) => entry.enrollment.studentId === 's1')
    // s1 paid 40 toward إنجليزي — it must not leak into رياضيات's paid (120).
    expect(s1?.paid).toBe(120)
  })
})
