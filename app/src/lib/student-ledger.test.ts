import { describe, expect, it } from 'vitest'

import { studentLedger } from '@/lib/aggregate'
import type { Enrollment, FeeObligation, StudentStatementLine } from '@/types/domain'

function enrollment(partial: Partial<Enrollment> & Pick<Enrollment, 'id' | 'studentId'>): Enrollment {
  return { courseId: 'c-1', courseName: 'محاسبة', courseValue: 500, createdAt: '2026-01-01T08:00:00Z', ...partial }
}

function fee(partial: Partial<FeeObligation> & Pick<FeeObligation, 'id' | 'studentId' | 'description' | 'amount'>): FeeObligation {
  return { enrollmentId: null, courseId: null, courseName: null, feeCategory: 'institute', externalShare: 0, cancelledAt: null, cancelReason: null, createdAt: '2026-01-05T08:00:00Z', ...partial }
}

function courseLine(partial: Partial<StudentStatementLine> & Pick<StudentStatementLine, 'id' | 'studentId' | 'voucherDate' | 'amountReceived'>): StudentStatementLine {
  return { voucherNumber: 1, studentName: 'x', courseName: 'محاسبة', courseValue: 500, remainingBalance: 0, entryType: 'course', enrollmentId: 'e-1', feeObligationId: null, ...partial }
}

describe('studentLedger', () => {
  it('interleaves debits and credits by date with a running balance', () => {
    const ledger = studentLedger(
      's-1',
      [courseLine({ id: 'l-1', studentId: 's-1', voucherDate: '2026-01-10', amountReceived: 200, remainingBalance: 300 })],
      [enrollment({ id: 'e-1', studentId: 's-1' })],
      [fee({ id: 'f-1', studentId: 's-1', description: 'رسوم امتحان', amount: 50 })],
    )

    expect(ledger.entries.map((entry) => [entry.date, entry.kind, entry.debit, entry.credit, entry.balance])).toEqual([
      ['2026-01-01', 'debit', 500, 0, 500],
      ['2026-01-05', 'debit', 50, 0, 550],
      ['2026-01-10', 'credit', 0, 200, 350],
    ])
    expect(ledger.entries[1].label).toBe('رسوم امتحان')
    expect(ledger.entries[1].meta).toContain('بدون دورة')
    expect(ledger).toMatchObject({ totalDebit: 550, totalCredit: 200, balance: 350 })
  })

  it('excludes cancelled fees and reconciles the final balance to debit − credit', () => {
    const ledger = studentLedger(
      's-1',
      [],
      [enrollment({ id: 'e-1', studentId: 's-1', courseValue: 300 })],
      [fee({ id: 'f-1', studentId: 's-1', description: 'ملغى', amount: 40, cancelledAt: '2026-02-01' })],
    )
    expect(ledger.entries).toHaveLength(1)
    expect(ledger.entries[0]).toMatchObject({ kind: 'debit', label: 'محاسبة', debit: 300, balance: 300 })
    expect(ledger.balance).toBe(ledger.totalDebit - ledger.totalCredit)
  })

  it('orders a course debit before its payment even without an enrolment date', () => {
    const ledger = studentLedger(
      's-1',
      [courseLine({ id: 'l-1', studentId: 's-1', voucherDate: '2026-03-04', amountReceived: 100, remainingBalance: 400 })],
      [enrollment({ id: 'e-1', studentId: 's-1', createdAt: undefined })],
      [],
    )
    expect(ledger.entries[0].kind).toBe('debit')
    expect(ledger.entries[1].kind).toBe('credit')
    expect(ledger.entries[1].balance).toBe(400)
  })
})
