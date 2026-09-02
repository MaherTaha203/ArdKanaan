import { describe, expect, it } from 'vitest'

import { paymentVoucherFormSchema } from './schema'

describe('paymentVoucherFormSchema', () => {
  const valid = {
    paymentDate: '2026-09-02',
    expenseType: 'إيجار',
    amount: 500,
    notes: '',
  }

  it('accepts whole-shekel amounts', () => {
    expect(paymentVoucherFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects fractional amounts', () => {
    expect(
      paymentVoucherFormSchema.safeParse({ ...valid, amount: 500.5 }).success,
    ).toBe(false)
  })

  it('rejects zero and negative amounts', () => {
    expect(paymentVoucherFormSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
    expect(paymentVoucherFormSchema.safeParse({ ...valid, amount: -5 }).success).toBe(false)
  })
})
