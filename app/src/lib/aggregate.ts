import type { Course, Enrollment, FeeCategory, FeeObligation, FinancialMovement, Student, StudentStatementLine } from '@/types/domain'

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
  enrollmentId?: string
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
  const enrollmentsById = new Map(studentEnrollments.map((enrollment) => [enrollment.id, enrollment]))
  const enrollmentsByName = new Map<string, Enrollment[]>()
  for (const enrollment of studentEnrollments) {
    const bucket = enrollmentsByName.get(enrollment.courseName)
    if (bucket) bucket.push(enrollment)
    else enrollmentsByName.set(enrollment.courseName, [enrollment])
  }

  type Bucket = { enrollmentId?: string; courseName: string; paid: number; fee: number; remaining: number; latestKey: string }
  const byEnrollment = new Map<string, Bucket>()

  for (const line of studentLines) {
    const enrollment = line.enrollmentId ? enrollmentsById.get(line.enrollmentId) : undefined
    const fallbackMatches = enrollment ? [] : (enrollmentsByName.get(line.courseName) ?? [])
    const resolvedEnrollment = enrollment ?? (fallbackMatches.length === 1 ? fallbackMatches[0] : undefined)
    const key = resolvedEnrollment ? `enrollment:${resolvedEnrollment.id}` : `legacy:${line.courseName}`
    const chronologicalKey = `${line.voucherDate}#${String(line.voucherNumber).padStart(12, '0')}`
    const bucket = byEnrollment.get(key)
    if (!bucket) {
      byEnrollment.set(key, {
        enrollmentId: resolvedEnrollment?.id,
        courseName: resolvedEnrollment?.courseName ?? line.courseName,
        paid: line.amountReceived,
        fee: resolvedEnrollment?.courseValue ?? line.courseValue,
        remaining: line.remainingBalance,
        latestKey: chronologicalKey,
      })
    } else {
      bucket.paid += line.amountReceived
      if (chronologicalKey >= bucket.latestKey) {
        bucket.fee = resolvedEnrollment?.courseValue ?? line.courseValue
        bucket.remaining = line.remainingBalance
        bucket.latestKey = chronologicalKey
      }
    }
  }

  const result: StudentCourseBreakdown[] = []
  for (const bucket of byEnrollment.values()) {
    result.push({ enrollmentId: bucket.enrollmentId, courseName: bucket.courseName, fee: bucket.fee, paid: bucket.paid, remaining: bucket.remaining })
  }

  const seenEnrollmentIds = new Set(result.flatMap((entry) => entry.enrollmentId ? [entry.enrollmentId] : []))
  for (const enrollment of studentEnrollments) {
    if (seenEnrollmentIds.has(enrollment.id)) continue
    result.push({ enrollmentId: enrollment.id, courseName: enrollment.courseName, fee: enrollment.courseValue, paid: 0, remaining: enrollment.courseValue })
  }

  return result.sort((a, b) => a.courseName.localeCompare(b.courseName, 'ar') || (a.enrollmentId ?? '').localeCompare(b.enrollmentId ?? ''))
}

function feePaid(fee: FeeObligation, lines: StudentStatementLine[]): number {
  return lines
    .filter((line) => line.entryType === 'fee' && line.feeObligationId === fee.id)
    .reduce((sum, line) => sum + line.amountReceived, 0)
}

function feeRemaining(fee: FeeObligation, lines: StudentStatementLine[]) {
  return Math.max(0, fee.amount - feePaid(fee, lines))
}

function beneficiaryLabel(category: FeeCategory): string {
  return category === 'institute' ? 'للمعهد' : category === 'external' ? 'لجهة خارجية' : 'مشترك'
}
const dayOf = (value?: string | null): string => (value ? value.slice(0, 10) : '')

// One line of the running account statement (كشف حساب جاري): a debit (an obligation
// placed on the student — a course fee or a fee obligation, dated when incurred) or
// a credit (a receipt/payment, dated by the voucher), with the running balance =
// Σ debit − Σ credit up to and including this line. A pure read model over
// already-loaded data — it creates no financial fact.
export type LedgerEntry = {
  id: string
  date: string
  kind: 'debit' | 'credit'
  label: string
  meta: string
  debit: number
  credit: number
  balance: number
  voucherNumber?: number
}

export type StudentLedger = {
  entries: LedgerEntry[]
  totalDebit: number
  totalCredit: number
  balance: number
}

export function studentLedger(
  studentId: string,
  lines: StudentStatementLine[],
  enrollments: Enrollment[],
  feeObligations: FeeObligation[],
): StudentLedger {
  const studentLines = lines.filter((line) => line.studentId === studentId)
  const enrollmentsById = new Map(enrollments.filter((enrollment) => enrollment.studentId === studentId).map((enrollment) => [enrollment.id, enrollment]))

  type Raw = LedgerEntry & { sort: string }
  const raw: Raw[] = []

  // Course dues (debits): one per course, dated by the enrolment (else the earliest
  // payment on it). Uses the authoritative breakdown so the total reconciles.
  for (const course of studentCourseBreakdown(studentId, studentLines, enrollments)) {
    const enrollment = course.enrollmentId ? enrollmentsById.get(course.enrollmentId) : undefined
    const earliestPayment = studentLines
      .filter((line) => (line.entryType ?? 'course') === 'course' && (course.enrollmentId ? line.enrollmentId === course.enrollmentId : line.courseName === course.courseName))
      .reduce<string>((min, line) => (!min || line.voucherDate < min ? line.voucherDate : min), '')
    const date = dayOf(enrollment?.createdAt) || earliestPayment || ''
    raw.push({ id: `d-course-${course.enrollmentId ?? course.courseName}`, date, kind: 'debit', label: course.courseName, meta: 'دورة', debit: course.fee, credit: 0, balance: 0, sort: `${date}#0#0` })
  }

  // Fee dues (debits).
  for (const fee of feeObligations) {
    if (fee.studentId !== studentId || fee.cancelledAt) continue
    const date = dayOf(fee.createdAt)
    raw.push({ id: `d-fee-${fee.id}`, date, kind: 'debit', label: fee.description, meta: `${fee.courseName ?? 'بدون دورة'} · ${beneficiaryLabel(fee.feeCategory)}`, debit: fee.amount, credit: 0, balance: 0, sort: `${date}#0#${fee.createdAt ?? ''}` })
  }

  // Payments (credits): one per receipt allocation line.
  for (const line of studentLines) {
    raw.push({ id: `c-${line.id}`, date: line.voucherDate, kind: 'credit', label: 'سند قبض', meta: line.entryType === 'fee' ? `رسم · ${line.courseName}` : line.courseName, debit: 0, credit: line.amountReceived, balance: 0, voucherNumber: line.voucherNumber, sort: `${line.voucherDate}#1#${String(line.voucherNumber).padStart(12, '0')}` })
  }

  raw.sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : a.id < b.id ? -1 : 1))

  let balance = 0
  const entries: LedgerEntry[] = raw.map((row) => {
    balance += row.debit - row.credit
    return { id: row.id, date: row.date, kind: row.kind, label: row.label, meta: row.meta, debit: row.debit, credit: row.credit, balance, voucherNumber: row.voucherNumber }
  })
  const totalDebit = raw.reduce((sum, row) => sum + row.debit, 0)
  const totalCredit = raw.reduce((sum, row) => sum + row.credit, 0)
  return { entries, totalDebit, totalCredit, balance: totalDebit - totalCredit }
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

// --- Student lifecycle helpers (ADR-0076) -------------------------------------
// Archiving is administrative only and has no financial effect; these are pure
// selectors over the already-loaded lifecycle status, never a financial rule.

export function isArchivedStudent(student: Student): boolean {
  return student.status === 'archived'
}

// The active roster: everyone except archived students (active + completed).
export function selectNonArchived(students: Student[]): Student[] {
  return students.filter((student) => student.status !== 'archived')
}

export function selectArchived(students: Student[]): Student[] {
  return students.filter((student) => student.status === 'archived')
}

// Archive eligibility (UI mirror of the archive_student RPC guard): a student
// cannot be archived while enrolled in any course whose status is 'active'.
export function hasActiveCourse(studentId: string, enrollments: Enrollment[], courses: Course[]): boolean {
  const activeCourseIds = new Set(courses.filter((course) => course.status === 'active').map((course) => course.id))
  return enrollments.some((enrollment) => enrollment.studentId === studentId && activeCourseIds.has(enrollment.courseId))
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
