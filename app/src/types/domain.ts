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