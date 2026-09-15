import { describe, expect, it } from 'vitest'

import { studentCourseBreakdown } from '@/lib/aggregate'
import type { Enrollment, StudentStatementLine } from '@/types/domain'

function enrollment(id: string, courseName: string, courseValue: number): Enrollment {
  return { id, studentId: 's-1', courseId: id, courseName, courseValue }
}

function line(partial: Partial<StudentStatementLine> & Pick<StudentStatementLine, 'id' | 'enrollmentId' | 'amountReceived' | 'remainingBalance'>): StudentStatementLine {
  return {
    voucherNumber: 1,
    voucherDate: '2026-01-01',
    studentId: 's-1',
    studentName: 'سارة',
    courseName: 'محاسبة',
    courseValue: 500,
    entryType: 'course',
    feeObligationId: null,
    ...partial,
  }
}

describe('studentCourseBreakdown enrollment identity', () => {
  it('keeps two enrollments with the same course name financially separate', () => {
    const enrollments = [
      enrollment('en-1', 'محاسبة', 500),
      enrollment('en-2', 'محاسبة', 300),
    ]
    const lines = [
      line({ id: 'r-1', enrollmentId: 'en-1', amountReceived: 150, remainingBalance: 350 }),
      line({ id: 'r-2', enrollmentId: 'en-2', amountReceived: 100, remainingBalance: 200 }),
    ]

    const result = studentCourseBreakdown('s-1', lines, enrollments)
    const byEnrollment = Object.fromEntries(result.map((entry) => [entry.enrollmentId, entry]))

    expect(byEnrollment['en-1']).toEqual({ enrollmentId: 'en-1', courseName: 'محاسبة', fee: 500, paid: 150, remaining: 350 })
    expect(byEnrollment['en-2']).toEqual({ enrollmentId: 'en-2', courseName: 'محاسبة', fee: 300, paid: 100, remaining: 200 })
    expect(result).toHaveLength(2)
  })

  it('uses the enrollment price as the receivable even when statement line price is stale', () => {
    const enrollments = [enrollment('en-1', 'محاسبة', 500)]
    const lines = [line({ id: 'r-1', enrollmentId: 'en-1', courseValue: 999, amountReceived: 150, remainingBalance: 350 })]

    expect(studentCourseBreakdown('s-1', lines, enrollments)).toEqual([
      { enrollmentId: 'en-1', courseName: 'محاسبة', fee: 500, paid: 150, remaining: 350 },
    ])
  })
})
