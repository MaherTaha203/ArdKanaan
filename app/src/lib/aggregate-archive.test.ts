import { describe, expect, it } from 'vitest'

import { aggregateStudents, attentionList, hasActiveCourse, isArchivedStudent, selectArchived, selectNonArchived } from '@/lib/aggregate'
import type { Course, Enrollment, Student, StudentStatementLine } from '@/types/domain'

function student(partial: Partial<Student> & Pick<Student, 'id' | 'name'>): Student {
  return { idNumber: null, phone: null, notes: null, status: 'active', archivedAt: null, archiveReason: null, ...partial }
}

function course(id: string, status: Course['status']): Course {
  return { id, name: `دورة ${id}`, baseFee: null, startDate: null, endDate: null, status, notes: '' }
}

function enrollment(id: string, studentId: string, courseId: string): Enrollment {
  return { id, studentId, courseId, courseName: `دورة ${courseId}`, courseValue: 1000 }
}

function line(partial: Partial<StudentStatementLine> & Pick<StudentStatementLine, 'id' | 'studentId'>): StudentStatementLine {
  return { voucherNumber: 1, voucherDate: '2026-01-01', studentName: 'x', courseName: 'دورة', courseValue: 1000, amountReceived: 0, remainingBalance: 0, ...partial }
}

const active = student({ id: 'a', name: 'نشط' })
const completed = student({ id: 'c', name: 'مكتمل', status: 'completed' })
const archived = student({ id: 'z', name: 'مؤرشف', status: 'archived', archivedAt: '2026-02-01' })

describe('selectNonArchived', () => {
  it('keeps active and completed students, drops archived', () => {
    const result = selectNonArchived([active, completed, archived])
    expect(result.map((s) => s.id)).toEqual(['a', 'c'])
  })
})

describe('selectArchived', () => {
  it('returns only archived students', () => {
    const result = selectArchived([active, completed, archived])
    expect(result.map((s) => s.id)).toEqual(['z'])
  })
})

describe('isArchivedStudent', () => {
  it('is true only for the archived status', () => {
    expect(isArchivedStudent(archived)).toBe(true)
    expect(isArchivedStudent(active)).toBe(false)
    expect(isArchivedStudent(completed)).toBe(false)
  })
})

describe('hasActiveCourse (archive eligibility)', () => {
  const courses = [course('act', 'active'), course('end', 'ended')]

  it('is true when the student is enrolled in an active course', () => {
    const enrollments = [enrollment('e1', 'a', 'act')]
    expect(hasActiveCourse('a', enrollments, courses)).toBe(true)
  })

  it('is false when the student is enrolled only in an ended course', () => {
    const enrollments = [enrollment('e1', 'a', 'end')]
    expect(hasActiveCourse('a', enrollments, courses)).toBe(false)
  })

  it('is false when the student has no enrollment', () => {
    expect(hasActiveCourse('a', [], courses)).toBe(false)
  })
})

describe('archived students remain financially visible', () => {
  // Archiving must NOT hide financial data: an archived student with an
  // outstanding balance still aggregates and still appears in the dues list.
  const lines = [line({ id: 'l1', studentId: 'z', amountReceived: 40, remainingBalance: 60, courseValue: 100 })]

  it('an archived student with a balance still aggregates', () => {
    const [agg] = aggregateStudents([archived], lines, [], [])
    expect(agg.remaining).toBe(60)
    expect(agg.paid).toBe(40)
  })

  it('an archived student with a balance still appears in the dues list', () => {
    const aggregates = aggregateStudents([active, archived], lines, [], [])
    const due = attentionList(aggregates)
    expect(due.map((a) => a.student.id)).toContain('z')
  })
})
