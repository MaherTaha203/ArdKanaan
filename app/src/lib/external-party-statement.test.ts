import { describe, expect, it } from 'vitest'

import { externalPartyStatement } from '@/lib/aggregate'
import type { FinancialMovement } from '@/types/domain'

function receipt(partial: Partial<FinancialMovement> & Pick<FinancialMovement, 'id' | 'voucherNumber' | 'amount'>): FinancialMovement {
  return { movementType: 'receipt', voucherDate: '2026-01-01', partyName: 'طالب', context: 'رسوم', externalShare: 0, ...partial }
}

describe('externalPartyStatement', () => {
  it('splits a shared receipt into its institute and external portions', () => {
    // Arrange
    const movements = [receipt({ id: 'r-1', voucherNumber: 5, amount: 100, externalShare: 40 })]

    // Act
    const statement = externalPartyStatement(movements)

    // Assert
    expect(statement.lines).toHaveLength(1)
    expect(statement.lines[0]).toMatchObject({ amount: 100, externalShare: 40, instituteShare: 60 })
    expect(statement).toMatchObject({ totalAmount: 100, totalExternal: 40, totalInstitute: 60 })
  })

  it('keeps a fully external receipt with a zero institute share', () => {
    // Arrange
    const movements = [receipt({ id: 'r-1', voucherNumber: 1, amount: 250, externalShare: 250 })]

    // Act
    const statement = externalPartyStatement(movements)

    // Assert
    expect(statement.lines[0]).toMatchObject({ externalShare: 250, instituteShare: 0 })
    expect(statement.totalInstitute).toBe(0)
  })

  it('excludes institute-only receipts and every payment', () => {
    // Arrange
    const movements: FinancialMovement[] = [
      receipt({ id: 'r-1', voucherNumber: 1, amount: 100, externalShare: 0 }),
      receipt({ id: 'r-2', voucherNumber: 2, amount: 80, externalShare: 30 }),
      { id: 'p-1', movementType: 'payment', voucherNumber: 1, voucherDate: '2026-01-02', amount: 500, partyName: null, context: 'مصروف', externalShare: 0 },
    ]

    // Act
    const statement = externalPartyStatement(movements)

    // Assert
    expect(statement.lines.map((line) => line.id)).toEqual(['r-2'])
    expect(statement.totalExternal).toBe(30)
  })

  it('orders lines chronologically then by voucher number', () => {
    // Arrange
    const movements = [
      receipt({ id: 'r-late', voucherNumber: 9, amount: 20, externalShare: 20, voucherDate: '2026-03-01' }),
      receipt({ id: 'r-early-b', voucherNumber: 4, amount: 20, externalShare: 20, voucherDate: '2026-02-01' }),
      receipt({ id: 'r-early-a', voucherNumber: 3, amount: 20, externalShare: 20, voucherDate: '2026-02-01' }),
    ]

    // Act
    const statement = externalPartyStatement(movements)

    // Assert
    expect(statement.lines.map((line) => line.id)).toEqual(['r-early-a', 'r-early-b', 'r-late'])
  })
})
