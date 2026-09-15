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

  describe('fee entries', () => {
    const fee = {
      paymentDate: '2026-09-02',
      studentName: 'طالب تجريبي',
      studentId: 'student-1',
      studentIdNumber: '',
      studentPhone: '',
      courseName: 'رسوم تخريج',
      amountReceived: 50,
      payerName: '',
      notes: '',
      entryType: 'fee' as const,
    }

    it('accepts an institute fee with no external share', () => {
      expect(receiptVoucherFormSchema.safeParse({ ...fee, feeCategory: 'institute' }).success).toBe(true)
    })

    it('accepts an external fee', () => {
      expect(receiptVoucherFormSchema.safeParse({ ...fee, feeCategory: 'external' }).success).toBe(true)
    })

    it('accepts a shared fee split within the total', () => {
      expect(receiptVoucherFormSchema.safeParse({ ...fee, feeCategory: 'shared', externalShare: 20 }).success).toBe(true)
    })

    it('rejects a fee with no category', () => {
      expect(receiptVoucherFormSchema.safeParse(fee).success).toBe(false)
    })

    it('rejects a shared fee whose external share reaches or exceeds the total', () => {
      expect(receiptVoucherFormSchema.safeParse({ ...fee, feeCategory: 'shared', externalShare: 50 }).success).toBe(false)
      expect(receiptVoucherFormSchema.safeParse({ ...fee, feeCategory: 'shared', externalShare: 60 }).success).toBe(false)
    })

    it('rejects a shared fee with a zero or fractional external share', () => {
      expect(receiptVoucherFormSchema.safeParse({ ...fee, feeCategory: 'shared', externalShare: 0 }).success).toBe(false)
      expect(receiptVoucherFormSchema.safeParse({ ...fee, feeCategory: 'shared', externalShare: 20.5 }).success).toBe(false)
    })

    it('does not require a course value for a fee', () => {
      // courseValue omitted entirely — a fee derives it from the amount.
      const parsed = receiptVoucherFormSchema.safeParse({ ...fee, feeCategory: 'institute' })
      expect(parsed.success).toBe(true)
    })
  })
})
