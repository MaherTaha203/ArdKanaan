import { describe, expect, it } from 'vitest'

import {
  aggregateStudents,
  attentionList,
  financialTotals,
  movementsNewestFirst,
  paymentCount,
  receiptCount,
  statementFor,
} from '@/lib/aggregate'
import type { FinancialMovement, Student, StudentStatementLine } from '@/types/domain'

function student(id: string, name: string): Student {
  return { id, name, idNumber: null, phone: null, notes: null }
}

// A statement line mirrors the DB view: remainingBalance is the running
// (fee - cumulative paid) the view already computed for that receipt.
function line(
  partial: Partial<StudentStatementLine> & Pick<StudentStatementLine, 'id' | 'studentId'>,
): StudentStatementLine {
  return {
    voucherNumber: 1,
    voucherDate: '2026-01-01',
    studentName: 'x',
    courseName: 'دورة',
    courseValue: 1000,
    amountReceived: 0,
    remainingBalance: 0,
    ...partial,
  }
}

function movement(partial: Partial<FinancialMovement> & Pick<FinancialMovement, 'id'>): FinancialMovement {
  return {
    movementType: 'receipt',
    voucherNumber: 1,
    voucherDate: '2026-01-01',
    amount: 0,
    partyName: null,
    context: null,
    ...partial,
  }
}

describe('financialTotals', () => {
  it('sums receipts and payments into in/out/net', () => {
    const movements = [
      movement({ id: 'a', movementType: 'receipt', amount: 400 }),
      movement({ id: 'b', movementType: 'receipt', amount: 100 }),
      movement({ id: 'c', movementType: 'payment', amount: 120 }),
    ]

    expect(financialTotals(movements)).toEqual({ totalIn: 500, totalOut: 120, net: 380 })
  })

  it('is all zero for no movements', () => {
    expect(financialTotals([])).toEqual({ totalIn: 0, totalOut: 0, net: 0 })
  })
})

describe('aggregateStudents', () => {
  it('sums paid and takes remaining from the latest line per course', () => {
    // One course, fee 1000, two receipts: 400 then 300 → remaining 600 then 300.
    const students = [student('s-1', 'سارة')]
    const lines = [
      line({ id: 'l1', studentId: 's-1', voucherNumber: 1, voucherDate: '2026-01-01', amountReceived: 400, remainingBalance: 600 }),
      line({ id: 'l2', studentId: 's-1', voucherNumber: 2, voucherDate: '2026-01-05', amountReceived: 300, remainingBalance: 300 }),
    ]

    const [aggregate] = aggregateStudents(students, lines)

    expect(aggregate.paid).toBe(700)
    expect(aggregate.remaining).toBe(300)
    expect(aggregate.courses).toBe(1)
    expect(aggregate.lastActivity).toBe('2026-01-05')
    expect(aggregate.lineCount).toBe(2)
  })

  it('sums remaining across several courses', () => {
    const students = [student('s-1', 'سارة')]
    const lines = [
      line({ id: 'l1', studentId: 's-1', courseName: 'أ', amountReceived: 400, remainingBalance: 600 }),
      line({ id: 'l2', studentId: 's-1', courseName: 'ب', amountReceived: 500, remainingBalance: 250 }),
    ]

    const [aggregate] = aggregateStudents(students, lines)

    expect(aggregate.courses).toBe(2)
    expect(aggregate.paid).toBe(900)
    expect(aggregate.remaining).toBe(850)
  })

  it('ignores the order lines arrive in when picking the latest per course', () => {
    const students = [student('s-1', 'سارة')]
    const ordered = [
      line({ id: 'l1', studentId: 's-1', voucherNumber: 1, voucherDate: '2026-01-01', amountReceived: 400, remainingBalance: 600 }),
      line({ id: 'l2', studentId: 's-1', voucherNumber: 2, voucherDate: '2026-01-05', amountReceived: 300, remainingBalance: 300 }),
    ]
    const shuffled = [ordered[1], ordered[0]]

    expect(aggregateStudents(students, shuffled)[0].remaining).toBe(300)
  })

  it('reports a student with no lines as zeroed', () => {
    const [aggregate] = aggregateStudents([student('s-1', 'سارة')], [])

    expect(aggregate.paid).toBe(0)
    expect(aggregate.remaining).toBe(0)
    expect(aggregate.courses).toBe(0)
    expect(aggregate.lastActivity).toBeNull()
  })
})

describe('statementFor', () => {
  it('returns only the student lines, chronologically', () => {
    const lines = [
      line({ id: 'l2', studentId: 's-1', voucherNumber: 2, voucherDate: '2026-01-05' }),
      line({ id: 'l1', studentId: 's-1', voucherNumber: 1, voucherDate: '2026-01-01' }),
      line({ id: 'x', studentId: 's-2', voucherDate: '2026-01-02' }),
    ]

    const result = statementFor(lines, 's-1')

    expect(result.map((l) => l.id)).toEqual(['l1', 'l2'])
  })
})

describe('attentionList', () => {
  it('keeps only students who still owe, largest first', () => {
    const aggregates = aggregateStudents(
      [student('s-1', 'أ'), student('s-2', 'ب'), student('s-3', 'ج')],
      [
        line({ id: 'l1', studentId: 's-1', amountReceived: 100, remainingBalance: 900 }),
        line({ id: 'l2', studentId: 's-2', amountReceived: 100, remainingBalance: 0 }),
        line({ id: 'l3', studentId: 's-3', amountReceived: 100, remainingBalance: 300 }),
      ],
    )

    const result = attentionList(aggregates)

    expect(result.map((a) => a.student.id)).toEqual(['s-1', 's-3'])
  })
})

describe('movement counts and ordering', () => {
  const movements = [
    movement({ id: 'a', movementType: 'receipt', voucherNumber: 1, voucherDate: '2026-01-01' }),
    movement({ id: 'b', movementType: 'payment', voucherNumber: 2, voucherDate: '2026-01-03' }),
    movement({ id: 'c', movementType: 'receipt', voucherNumber: 3, voucherDate: '2026-01-02' }),
  ]

  it('counts receipts and payments', () => {
    expect(receiptCount(movements)).toBe(2)
    expect(paymentCount(movements)).toBe(1)
  })

  it('orders newest first by date then number', () => {
    expect(movementsNewestFirst(movements).map((m) => m.id)).toEqual(['b', 'c', 'a'])
  })
})
