import { describe, expect, it } from 'vitest'

import { aggregateStudents } from '@/lib/aggregate'
import type { FeeObligation, Student, StudentStatementLine } from '@/types/domain'

function student(id: string): Student {
  return { id, name: 'سارة', idNumber: null, phone: null, notes: null }
}

function fee(partial: Partial<FeeObligation>): FeeObligation {
  return {
    id: 'f-1',
    studentId: 's-1',
    courseId: 'c-1',
    courseName: 'دورة الإدارة',
    description: 'رسوم تخريج',
    amount: 50,
    feeCategory: 'external',
    externalShare: 50,
    cancelledAt: null,
    cancelReason: null,
    createdAt: '2026-09-15T08:00:00Z',
    ...partial,
  }
}

function line(partial: Partial<StudentStatementLine>): StudentStatementLine {
  return {
    id: 'l-1',
    voucherNumber: 1,
    voucherDate: '2026-09-15',
    studentId: 's-1',
    studentName: 'سارة',
    courseName: 'رسوم تخريج',
    courseValue: 50,
    amountReceived: 50,
    remainingBalance: 0,
    entryType: 'fee',
    feeObligationId: 'f-1',
    enrollmentId: null,
    ...partial,
  }
}

describe('fee obligations in student aggregates', () => {
  it('adds an unpaid fee obligation to the student amount due', () => {
    const [aggregate] = aggregateStudents([student('s-1')], [], [], [fee({})])
    expect(aggregate.paid).toBe(0)
    expect(aggregate.remaining).toBe(50)
  })

  it('reduces the fee balance by its full receipt amount while keeping paid total full', () => {
    const [aggregate] = aggregateStudents([student('s-1')], [line({})], [], [fee({})])
    expect(aggregate.paid).toBe(50)
    expect(aggregate.remaining).toBe(0)
  })

  it('ignores cancelled fee obligations', () => {
    const [aggregate] = aggregateStudents([student('s-1')], [], [], [fee({ cancelledAt: '2026-09-15T09:00:00Z', cancelReason: 'أُلغي' })])
    expect(aggregate.remaining).toBe(0)
  })
})
