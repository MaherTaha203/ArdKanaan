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
}

// A course in the catalog. base_fee is only the DEFAULT fee proposed at
// registration; the authoritative fee per student lives on the Enrollment.
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

// A student's enrolment in a course. This is the authoritative financial link:
// (studentId + courseName) carries the snapshot fee (courseValue) the firewall
// enforces. courseId links to the catalog Course when one exists (null for legacy).
export type Enrollment = {
  id: string
  studentId: string
  courseId: string | null
  courseName: string
  courseValue: number
}

// Money Out — an outgoing center expense. Never linked to a student or course.
export type PaymentVoucherLine = {
  id: string
  voucherNumber: number
  voucherDate: string
  expenseType: string
  amount: number
  notes: string
}

// Financial Report — a derived movement. Never a source of truth.
// party_name = student name (receipts); context = course (receipts) or expense type (payments).
export type FinancialMovement = {
  id: string
  movementType: 'receipt' | 'payment'
  voucherNumber: number
  voucherDate: string
  amount: number
  partyName: string | null
  context: string | null
}

// A cancelled voucher — excluded from every active total, kept for review. Derived
// from the cancelled_vouchers view; never counted anywhere.
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