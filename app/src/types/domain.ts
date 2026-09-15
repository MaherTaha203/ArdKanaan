export type Student = {
  id: string
  name: string
  // National/identity number — text, so leading zeros are preserved and it is
  // never treated as an amount. Part of the student's identity, not a financial field.
  idNumber: string | null
  phone: string | null
  notes: string | null
}

export type StudentStatementLine = {
  id: string
  voucherNumber: number
  voucherDate: string
  studentId: string
  studentName: string
  courseName: string
  courseValue: number
  amountReceived: number
  remainingBalance: number
  entryType?: 'course' | 'fee'
  feeObligationId?: string | null
  enrollmentId?: string | null
}

export type CourseStatus = 'active' | 'ended'

export type Course = {
  id: string
  name: string
  baseFee: number | null
  startDate: string | null
  endDate: string | null
  status: CourseStatus
  notes: string
}

export type Enrollment = {
  id: string
  studentId: string
  courseId: string
  courseName: string
  courseValue: number
}

export type FeeCategory = 'institute' | 'external' | 'shared'

export type FeeObligation = {
  id: string
  studentId: string
  enrollmentId: string
  courseId: string
  courseName: string
  description: string
  amount: number
  feeCategory: FeeCategory
  externalShare: number
  cancelledAt: string | null
  cancelReason: string | null
  createdAt: string
}

export type ReceiptAllocation = {
  id: string
  receiptVoucherId: string
  allocationType: 'course' | 'fee'
  enrollmentId: string | null
  feeObligationId: string | null
  amount: number
  createdAt: string
}

export type PaymentVoucherLine = {
  id: string
  voucherNumber: number
  voucherDate: string
  expenseType: string
  amount: number
  notes: string
}

export type FinancialMovement = {
  id: string
  movementType: 'receipt' | 'payment'
  voucherNumber: number
  voucherDate: string
  amount: number
  partyName: string | null
  context: string | null
  externalShare?: number
}

export type CancelledVoucher = {
  id: string
  movementType: 'receipt' | 'payment'
  voucherNumber: number
  voucherDate: string
  amount: number
  partyName: string | null
  context: string | null
  cancelledAt: string
  cancelReason: string | null
}
