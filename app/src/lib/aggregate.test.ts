import { describe, expect, it } from 'vitest'

import {
  aggregateStudents,
  attentionList,
  financialTotals,
  movementsNewestFirst,
  paymentCount,
  receiptCount,
  statementFor,
  studentCourseBreakdown,
} from '@/lib/aggregate'
import type { Enrollment, FinancialMovement, Student, StudentStatementLine } from '@/types/domain'

function enrollment(partial: Partial<Enrollment> & Pick<Enrollment, 'id' | 'studentId'>): Enrollment {
  return { courseId: null, courseName: 'دورة', courseValue: 1000, ...partial }
}

function student(id: string, name: string): Student {
  return { id, name, idNumber: null, phone: null, notes: null, status: 'active', archivedAt: null, archiveReason: null }
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
    expect(financialTotals(movements)).toEqual({ totalIn: 500, totalOut: 120, net: 380, externalHeld: 0, instituteRevenue: 500 })
  })

  it('is all zero for no movements', () => {
    expect(financialTotals([])).toEqual({ totalIn: 0, totalOut: 0, net: 0, externalHeld: 0, instituteRevenue: 0 })
  })

  it('recognises only the institute share of a shared fee as revenue', () => {
    const totals = financialTotals([movement({ id: 'fee', movementType: 'receipt', amount: 50, externalShare: 20 })])
    expect(totals.totalIn).toBe(50)
    expect(totals.externalHeld).toBe(20)
    expect(totals.instituteRevenue).toBe(30)
  })

  it('counts a whole external fee as held-for-others, zero institute revenue', () => {
    const totals = financialTotals([movement({ id: 'ext', movementType: 'receipt', amount: 40, externalShare: 40 })])
    expect(totals.instituteRevenue).toBe(0)
    expect(totals.externalHeld).toBe(40)
  })

  it('counts a whole institute fee entirely as institute revenue', () => {
    const totals = financialTotals([movement({ id: 'inst', movementType: 'receipt', amount: 60, externalShare: 0 })])
    expect(totals.instituteRevenue).toBe(60)
    expect(totals.externalHeld).toBe(0)
  })
})

describe('aggregateStudents', () => {
  it('sums paid and takes remaining from the latest line per course', () => {
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
    expect(aggregateStudents(students, [ordered[1], ordered[0]])[0].remaining).toBe(300)
  })

  it('reports a student with no lines as zeroed', () => {
    const [aggregate] = aggregateStudents([student('s-1', 'سارة')], [])
    expect(aggregate.paid).toBe(0)
    expect(aggregate.remaining).toBe(0)
    expect(aggregate.courses).toBe(0)
    expect(aggregate.lastActivity).toBeNull()
  })

  it('does not let an overpaid legacy course net against real debt on another course', () => {
    const [aggregate] = aggregateStudents(
      [student('s-1', 'سارة')],
      [
        line({ id: 'l1', studentId: 's-1', courseName: 'أ', courseValue: 500, amountReceived: 700, remainingBalance: -200 }),
        line({ id: 'l2', studentId: 's-1', courseName: 'ب', courseValue: 1000, amountReceived: 700, remainingBalance: 300 }),
      ],
    )
    expect(aggregate.remaining).toBe(300)
  })

  it('counts a registered-but-unpaid course: full enrolment fee is due', () => {
    const [aggregate] = aggregateStudents(
      [student('s-1', 'سارة')],
      [],
      [enrollment({ id: 'en1', studentId: 's-1', courseName: 'رسم', courseValue: 300 })],
    )
    expect(aggregate.paid).toBe(0)
    expect(aggregate.remaining).toBe(300)
    expect(aggregate.courses).toBe(1)
  })

  it('keeps identical course names isolated by enrollment identity', () => {
    const students = [student('s-1', 'سارة')]
    const enrollments = [
      enrollment({ id: 'en-1', studentId: 's-1', courseName: 'محاسبة', courseValue: 500 }),
      enrollment({ id: 'en-2', studentId: 's-1', courseName: 'محاسبة', courseValue: 300 }),
    ]
    const lines = [
      line({ id: 'r1', studentId: 's-1', enrollmentId: 'en-1', courseName: 'محاسبة', courseValue: 500, amountReceived: 150, remainingBalance: 350 }),
    ]

    const breakdown = studentCourseBreakdown('s-1', lines, enrollments)

    expect(breakdown).toHaveLength(2)
    expect(breakdown.find((entry) => entry.enrollmentId === 'en-1')).toEqual({ enrollmentId: 'en-1', courseName: 'محاسبة', fee: 500, paid: 150, remaining: 350 })
    expect(breakdown.find((entry) => entry.enrollmentId === 'en-2')).toEqual({ enrollmentId: 'en-2', courseName: 'محاسبة', fee: 300, paid: 0, remaining: 300 })
    expect(aggregateStudents(students, lines, enrollments)[0].remaining).toBe(650)
  })
})

describe('studentCourseBreakdown', () => {
  it('gives fee/paid/remaining per course, incl. a registered-but-unpaid one', () => {
    const lines = [line({ id: 'l1', studentId: 's-1', courseName: 'رياضيات', courseValue: 200, amountReceived: 150, remainingBalance: 50 })]
    const enrollments = [
      enrollment({ id: 'en1', studentId: 's-1', courseName: 'رياضيات', courseValue: 200 }),
      enrollment({ id: 'en2', studentId: 's-1', courseName: 'إنجليزي', courseValue: 100 }),
    ]
    const breakdown = studentCourseBreakdown('s-1', lines, enrollments)
    const byCourse = Object.fromEntries(breakdown.map((entry) => [entry.courseName, entry]))
    expect(byCourse['رياضيات']).toEqual({ enrollmentId: 'en1', courseName: 'رياضيات', fee: 200, paid: 150, remaining: 50 })
    expect(byCourse['إنجليزي']).toEqual({ enrollmentId: 'en2', courseName: 'إنجليزي', fee: 100, paid: 0, remaining: 100 })
  })
})

describe('statementFor', () => {
  it('returns only the student lines, chronologically', () => {
    const lines = [
      line({ id: 'l2', studentId: 's-1', voucherNumber: 2, voucherDate: '2026-01-05' }),
      line({ id: 'l1', studentId: 's-1', voucherNumber: 1, voucherDate: '2026-01-01' }),
      line({ id: 'x', studentId: 's-2', voucherDate: '2026-01-02' }),
    ]
    expect(statementFor(lines, 's-1').map((l) => l.id)).toEqual(['l1', 'l2'])
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
    expect(attentionList(aggregates).map((a) => a.student.id)).toEqual(['s-1', 's-3'])
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
