export type Student = {
  id: string
  name: string
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