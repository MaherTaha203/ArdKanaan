import type { FinancialMovement, Student, StudentStatementLine } from '@/types/domain'

// Pure derivations over voucher-sourced data. Nothing here is a stored balance;
// every returned figure is computed on demand from the derived views
// (student_statement_lines, financial_movements) and therefore remains traceable
// to its originating voucher.

export type FinancialTotals = {
  totalIn: number
  totalOut: number
  net: number
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

  for (const movement of movements) {
    if (movement.movementType === 'receipt') {
      totalIn += movement.amount
    } else {
      totalOut += movement.amount
    }
  }

  return { totalIn, totalOut, net: totalIn - totalOut }
}

function chronological(lines: StudentStatementLine[]) {
  return lines.slice().sort((a, b) => {
    if (a.voucherDate < b.voucherDate) return -1
    if (a.voucherDate > b.voucherDate) return 1
    return a.voucherNumber - b.voucherNumber
  })
}

export function aggregateStudents(
  students: Student[],
  lines: StudentStatementLine[],
): StudentAggregate[] {
  const linesByStudent = new Map<string, StudentStatementLine[]>()

  for (const line of lines) {
    const bucket = linesByStudent.get(line.studentId)
    if (bucket) {
      bucket.push(line)
    } else {
      linesByStudent.set(line.studentId, [line])
    }
  }

  return students.map((student) => {
    const studentLines = chronological(linesByStudent.get(student.id) ?? [])

    let paid = 0
    let lastActivity: string | null = null
    // Current remaining per course = the remaining_balance on that course's latest line.
    const remainingByCourse = new Map<string, number>()

    for (const line of studentLines) {
      paid += line.amountReceived
      remainingByCourse.set(line.courseName, line.remainingBalance)
      if (!lastActivity || line.voucherDate > lastActivity) {
        lastActivity = line.voucherDate
      }
    }

    let remaining = 0
    for (const courseRemaining of remainingByCourse.values()) {
      remaining += courseRemaining
    }

    return {
      student,
      paid,
      remaining,
      courses: remainingByCourse.size,
      lastActivity,
      lineCount: studentLines.length,
    }
  })
}

export function attentionList(aggregates: StudentAggregate[]): StudentAggregate[] {
  return aggregates
    .filter((aggregate) => aggregate.remaining > 0.0001)
    .sort((a, b) => b.remaining - a.remaining)
}

export function statementFor(
  lines: StudentStatementLine[],
  studentId: string,
): StudentStatementLine[] {
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
