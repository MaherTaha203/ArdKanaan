import { describe, expect, it } from 'vitest'

import { receiptVoucherFormSchema } from './schema'

describe('receiptVoucherFormSchema', () => {
  const valid = {
    paymentDate: '2026-09-02',
    studentName: 'طالب تجريبي',
    studentId: 'student-1',
    studentIdNumber: '',
    studentPhone: '',
    courseName: 'دورة تجريبية',
    courseValue: 1000,
    amountReceived: 250,
    payerName: '',
    notes: '',
  }

  it('accepts whole-shekel financial values', () => {
    expect(receiptVoucherFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects fractional course values', () => {
    expect(
      receiptVoucherFormSchema.safeParse({ ...valid, courseValue: 1000.5 }).success,
    ).toBe(false)
  })

  it('rejects fractional receipt amounts', () => {
    expect(
      receiptVoucherFormSchema.safeParse({ ...valid, amountReceived: 250.5 }).success,
    ).toBe(false)
  })

  it('rejects zero or negative receipts', () => {
    expect(
      receiptVoucherFormSchema.safeParse({ ...valid, amountReceived: 0 }).success,
    ).toBe(false)
    expect(
      receiptVoucherFormSchema.safeParse({ ...valid, amountReceived: -1 }).success,
    ).toBe(false)
  })
})
