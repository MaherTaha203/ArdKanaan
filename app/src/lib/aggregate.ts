import type { Enrollment, FeeObligation, FinancialMovement, Student, StudentStatementLine } from '@/types/domain'

export type FinancialTotals = {
  totalIn: number
  totalOut: number
  net: number
  externalHeld: number
  instituteRevenue: number
}

export type StudentAggregate = {
  student: Student
  paid: number
  remaining: number
  courses: number
  lastActivity: string | null
  lineCount: number
}

export function financialTotals(movements: FinancialMovement[]): FinancialTotals {
  let totalIn = 0
  let totalOut = 0
  let externalHeld = 0

  for (const movement of movements) {
    if (movement.movementType === 'receipt') {
      totalIn += movement.amount
      externalHeld += movement.externalShare ?? 0
    } else {
      totalOut += movement.amount
    }
  }

  return { totalIn, totalOut, net: totalIn - totalOut, externalHeld, instituteRevenue: totalIn - externalHeld }
}

function chronological(lines: StudentStatementLine[]) {
  return lines.slice().sort((a, b) => {
    if (a.voucherDate < b.voucherDate) return -1
    if (a.voucherDate > b.voucherDate) return 1
    return a.voucherNumber - b.voucherNumber
  })
}

export type StudentCourseBreakdown = {
  courseName: string
  fee: number
  paid: number
  remaining: number
}

function groupByStudent<T extends { studentId: string }>(rows: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const row of rows) {
    const bucket = map.get(row.studentId)
    if (bucket) bucket.push(row)
    else map.set(row.studentId, [row])
  }
  return map
}

export function studentCourseBreakdown(
  studentId: string,
  lines: StudentStatementLine[],
  enrollments: Enrollment[],
): StudentCourseBreakdown[] {
  const studentLines = lines.filter((line) => line.studentId === studentId && (line.entryType ?? 'course') === 'course')
  const studentEnrollments = enrollments.filter((enrollment) => enrollment.studentId === studentId)

  type Bucket = { paid: number; fee: number; remaining: number; latestKey: string }
  const byCourse = new Map<string, Bucket>()
  for (const line of studentLines) {
    const key = `${line.voucherDate}#${String(line.voucherNumber).padStart(12, '0')}`
    const bucket = byCourse.get(line.courseName)
    if (!bucket) {
      byCourse.set(line.courseName, { paid: line.amountReceived, fee: line.courseValue, remaining: line.remainingBalance, latestKey: key })
    } else {
      bucket.paid += line.amountReceived
      if (key >= bucket.latestKey) {
        bucket.fee = line.courseValue
        bucket.remaining = line.remainingBalance
        bucket.latestKey = key
      }
    }
  }

  const result: StudentCourseBreakdown[] = []
  const seen = new Set<string>()
  for (const [courseName, bucket] of byCourse) {
    seen.add(courseName)
    result.push({ courseName, fee: bucket.fee, paid: bucket.paid, remaining: bucket.remaining })
  }
  for (const enrollment of studentEnrollments) {
    if (seen.has(enrollment.courseName)) continue
    seen.add(enrollment.courseName)
    result.push({ courseName: enrollment.courseName, fee: enrollment.courseValue, paid: 0, remaining: enrollment.courseValue })
  }
  return result.sort((a, b) => a.courseName.localeCompare(b.courseName, 'ar'))
}

function feeRemaining(fee: FeeObligation, lines: StudentStatementLine[]) {
  const paid = lines
    .filter((line) => line.entryType === 'fee' && line.feeObligationId === fee.id)
    .reduce((sum, line) => sum + line.amountReceived, 0)
  return Math.max(0, fee.amount - paid)
}

export function aggregateStudents(
  students: Student[],
  lines: StudentStatementLine[],
  enrollments: Enrollment[] = [],
  feeObligations: FeeObligation[] = [],
): StudentAggregate[] {
  const linesByStudent = groupByStudent(lines)
  const enrollmentsByStudent = groupByStudent(enrollments)
  const feesByStudent = groupByStudent(feeObligations.filter((fee) => !fee.cancelledAt))

  return students.map((student) => {
    const studentLines = chronological(linesByStudent.get(student.id) ?? [])
    const studentEnrollments = enrollmentsByStudent.get(student.id) ?? []
    const breakdown = studentCourseBreakdown(student.id, studentLines, studentEnrollments)
    const feeRows = feesByStudent.get(student.id) ?? []

    let paid = 0
    let lastActivity: string | null = null
    for (const line of studentLines) {
      paid += line.amountReceived
      if (!lastActivity || line.voucherDate > lastActivity) lastActivity = line.voucherDate
    }

    let remaining = 0
    for (const course of breakdown) remaining += Math.max(0, course.remaining)
    for (const fee of feeRows) remaining += feeRemaining(fee, studentLines)

    return {
      student,
      paid,
      remaining,
      courses: breakdown.length,
      lastActivity,
      lineCount: studentLines.length,
    }
  })
}

export function attentionList(aggregates: StudentAggregate[]): StudentAggregate[] {
  return aggregates.filter((aggregate) => aggregate.remaining > 0.0001).sort((a, b) => b.remaining - a.remaining)
}

export function statementFor(lines: StudentStatementLine[], studentId: string): StudentStatementLine[] {
  return chronological(lines.filter((line) => line.studentId === studentId))
}

export function movementsNewestFirst(movements: FinancialMovement[]): FinancialMovement[] {
  return movements.slice().sort((a, b) => {
    if (a.voucherDate < b.voucherDate) return 1
    if (a.voucherDate > b.voucherDate) return -1
    return b.voucherNumber - a.voucherNumber
  })
}

export function receiptCount(movements: FinancialMovement[]) {
  return movements.filter((movement) => movement.movementType === 'receipt').length
}

export function paymentCount(movements: FinancialMovement[]) {
  return movements.filter((movement) => movement.movementType === 'payment').length
}
