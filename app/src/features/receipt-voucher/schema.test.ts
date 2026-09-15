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
    entryType: 'course' as const,
    allocations: [],
  }

  it('accepts an ordinary course receipt without allocations', () => {
    expect(receiptVoucherFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects fractional course values', () => {
    expect(receiptVoucherFormSchema.safeParse({ ...valid, courseValue: 1000.5 }).success).toBe(false)
  })

  it('rejects fractional receipt amounts', () => {
    expect(receiptVoucherFormSchema.safeParse({ ...valid, amountReceived: 250.5 }).success).toBe(false)
  })

  it('rejects zero or negative receipts', () => {
    expect(receiptVoucherFormSchema.safeParse({ ...valid, amountReceived: 0 }).success).toBe(false)
    expect(receiptVoucherFormSchema.safeParse({ ...valid, amountReceived: -1 }).success).toBe(false)
  })

  describe('allocation receipts', () => {
    const allocations = [
      { type: 'course' as const, enrollmentId: '11111111-1111-4111-8111-111111111111', amount: 250 },
      { type: 'fee' as const, feeObligationId: '22222222-2222-4222-8222-222222222222', amount: 50 },
      { type: 'fee' as const, feeObligationId: '33333333-3333-4333-8333-333333333333', amount: 20 },
    ]

    it('accepts course + multiple fee allocations when the total matches', () => {
      expect(
        receiptVoucherFormSchema.safeParse({
          ...valid,
          amountReceived: 320,
          entryType: 'mixed',
          courseValue: undefined,
          allocations,
        }).success,
      ).toBe(true)
    })

    it('rejects allocation totals that do not equal the receipt total', () => {
      expect(
        receiptVoucherFormSchema.safeParse({
          ...valid,
          amountReceived: 319,
          entryType: 'mixed',
          courseValue: undefined,
          allocations,
        }).success,
      ).toBe(false)
    })

    it('rejects a fee receipt with no selected fee obligation', () => {
      expect(
        receiptVoucherFormSchema.safeParse({ ...valid, entryType: 'fee', courseValue: undefined, amountReceived: 50 }).success,
      ).toBe(false)
    })

    it('rejects zero or fractional allocation amounts', () => {
      expect(
        receiptVoucherFormSchema.safeParse({
          ...valid,
          amountReceived: 50,
          entryType: 'fee',
          courseValue: undefined,
          allocations: [{ type: 'fee' as const, feeObligationId: '22222222-2222-4222-8222-222222222222', amount: 0 }],
        }).success,
      ).toBe(false)
      expect(
        receiptVoucherFormSchema.safeParse({
          ...valid,
          amountReceived: 50,
          entryType: 'fee',
          courseValue: undefined,
          allocations: [{ type: 'fee' as const, feeObligationId: '22222222-2222-4222-8222-222222222222', amount: 20.5 }],
        }).success,
      ).toBe(false)
    })
  })
})
