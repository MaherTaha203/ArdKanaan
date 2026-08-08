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