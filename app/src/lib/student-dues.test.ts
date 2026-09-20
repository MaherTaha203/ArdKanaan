import { describe, expect, it } from 'vitest'

import { studentDues } from '@/lib/aggregate'
import type { Enrollment, FeeObligation, StudentStatementLine } from '@/types/domain'

function enrollment(partial: Partial<Enrollment> & Pick<Enrollment, 'id' | 'studentId'>): Enrollment {
  return { courseId: 'c-1', courseName: 'دورة المحاسبة', courseValue: 500, ...partial }
}

function fee(partial: Partial<FeeObligation> & Pick<FeeObligation, 'id' | 'studentId' | 'description' | 'amount'>): FeeObligation {
  return {
    enrollmentId: null,
    courseId: null,
    courseName: null,
    feeCategory: 'institute',
    externalShare: 0,
    cancelledAt: null,
    cancelReason: null,
    createdAt: '2026-01-01',
    ...partial,
  }
}

function feeLine(partial: Partial<StudentStatementLine> & Pick<StudentStatementLine, 'id' | 'studentId' | 'feeObligationId' | 'amountReceived'>): StudentStatementLine {
  return { voucherNumber: 1, voucherDate: '2026-02-01', studentName: 'x', courseName: 'رسم', courseValue: 0, remainingBalance: 0, entryType: 'fee', enrollmentId: null, ...partial }
}

describe('studentDues', () => {
  it('lists a standalone fee (no course) with paid and remaining', () => {
    const { courseDues, fees } = studentDues(
      's-1',
      [],
      [],
      [fee({ id: 'f-1', studentId: 's-1', description: 'رسوم امتحان', amount: 50 })],
    )
    expect(courseDues).toEqual([])
    expect(fees).toEqual([
      { id: 'f-1', description: 'رسوم امتحان', courseName: null, feeCategory: 'institute', amount: 50, paid: 0, remaining: 50 },
    ])
  })

  it('reduces remaining by the fee payments recorded in the statement', () => {
    const { fees } = studentDues(
      's-1',
      [feeLine({ id: 'l-1', studentId: 's-1', feeObligationId: 'f-1', amountReceived: 20 })],
      [],
      [fee({ id: 'f-1', studentId: 's-1', description: 'رسوم شهادة', amount: 50, feeCategory: 'external', externalShare: 50, courseName: 'دورة' })],
    )
    expect(fees[0]).toMatchObject({ id: 'f-1', paid: 20, remaining: 30, courseName: 'دورة', feeCategory: 'external' })
  })

  it('excludes cancelled fees but keeps course dues from enrolments', () => {
    const { courseDues, fees } = studentDues(
      's-1',
      [],
      [enrollment({ id: 'e-1', studentId: 's-1', courseName: 'دورة المحاسبة', courseValue: 500 })],
      [fee({ id: 'f-1', studentId: 's-1', description: 'ملغى', amount: 10, cancelledAt: '2026-03-01' })],
    )
    expect(fees).toEqual([])
    expect(courseDues).toHaveLength(1)
    expect(courseDues[0]).toMatchObject({ courseName: 'دورة المحاسبة', fee: 500, paid: 0, remaining: 500 })
  })
})
