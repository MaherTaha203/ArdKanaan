import type { Page, Route } from '@playwright/test'

export type MockStudent = {
  id: string
  name: string
  id_number: string | null
  phone: string | null
  notes: string | null
  // Lifecycle (ADR-0076) — optional so existing fixtures stay valid; when absent
  // the app defaults status to 'active'.
  status?: 'active' | 'completed' | 'archived'
  archived_at?: string | null
  archive_reason?: string | null
}

export type MockEnrollment = {
  id: string
  student_id: string
  course_id: string | null
  course_name: string
  course_value: number
}

export type MockFeeObligation = {
  id: string
  student_id: string
  course_id: string | null
  course_name: string
  description: string
  amount: number
  fee_category: 'institute' | 'external' | 'shared'
  external_share: number
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
}

export type MockMovement = {
  id: string
  movement_type: 'receipt' | 'payment'
  voucher_number: number
  voucher_date: string
  amount: number
  party_name: string | null
  context: string | null
  external_share?: number
}

export type MockCancelledVoucher = MockMovement & { cancelled_at: string; cancel_reason: string | null }

export type MockReceiptVoucher = {
  id: string
  cancelled_at: string | null
  cancel_reason?: string | null
}

export type MockOptions = {
  students?: MockStudent[]
  courses?: Array<{ id: string; name: string; base_fee: number | null; start_date: string | null; end_date: string | null; status: 'active' | 'ended'; notes: string | null }>
  enrollments?: MockEnrollment[]
  feeObligations?: MockFeeObligation[]
  financialMovements?: MockMovement[]
  cancelledVouchers?: MockCancelledVoucher[]
  receiptVouchers?: MockReceiptVoucher[]
  receiptAllocations?: Array<Record<string, unknown>>
}

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }

export type MockHandle = {
  receiptInserts: Array<Record<string, unknown>>
  paymentInserts: Array<Record<string, unknown>>
  feeObligationInserts: Array<Record<string, unknown>[]>
  receiptAllocations: Array<Record<string, unknown>>
  studentInserts: Array<Record<string, unknown>>
  studentUpdates: Array<{ id: string | null; body: Record<string, unknown> }>
  cancellations: Array<{ table: 'receipt_vouchers' | 'payment_vouchers'; id: string | null; reason: string }>
  activeMovements: MockMovement[]
  statementReads: string[]
  cancelledVouchers: MockCancelledVoucher[]
  auditLog: Array<Record<string, unknown>>
  restoreCalls: Array<{ force: boolean; payload: Record<string, unknown> }>
  passwordResets: string[]
  passwordUpdates: string[]
}

function json(route: Route, body: unknown, status = 200, headers: Record<string, string> = {}) {
  return route.fulfill({ status, headers: { ...CORS, ...headers }, contentType: 'application/json', body: JSON.stringify(body) })
}

export async function installSupabaseMocks(page: Page, options: MockOptions = {}): Promise<MockHandle> {
  const students = options.students ?? []
  const courses = options.courses ?? []
  const enrollments = options.enrollments ?? []
  const feeObligations = options.feeObligations ?? []
  const activeMovements = [...(options.financialMovements ?? [])]
  const cancelledVouchers = [...(options.cancelledVouchers ?? [])]
  const initialReceiptVouchers = [...(options.receiptVouchers ?? [])]
  const handle: MockHandle = {

    receiptInserts: initialReceiptVouchers.map((receipt) => ({ ...receipt })), paymentInserts: [], feeObligationInserts: [], receiptAllocations: [...(options.receiptAllocations ?? [])], studentInserts: [], studentUpdates: [],
    cancellations: [], activeMovements, statementReads: [], cancelledVouchers, auditLog: [], restoreCalls: [], passwordResets: [], passwordUpdates: [],
  }

  await page.route('**/auth/v1/**', (route) => {
    const method = route.request().method()
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const url = route.request().url()
    if (url.includes('/token')) {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600
      return json(route, { access_token: 'stub-access', token_type: 'bearer', expires_in: 3600, expires_at: expiresAt, refresh_token: 'stub-refresh', user: { id: 'u-1', aud: 'authenticated', role: 'authenticated', email: 'owner@example.com', app_metadata: {}, user_metadata: {} } })
    }
    if (url.includes('/recover') && method === 'POST') {
      const payload = safeJson(route.request().postData()) as { email?: string }
      handle.passwordResets.push(String(payload.email ?? ''))
      return json(route, {})
    }
    if (url.includes('/user') && (method === 'PUT' || method === 'PATCH')) {
      const payload = safeJson(route.request().postData()) as { password?: string }
      handle.passwordUpdates.push(String(payload.password ?? ''))
      return json(route, { user: { id: 'u-1' } })
    }
    return json(route, {})
  })

  await page.route('**/rest/v1/**', (route) => {
    const request = route.request()
    const method = request.method()
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const url = new URL(request.url())
    const table = url.pathname.split('/rest/v1/')[1]?.split('?')[0]
    const arr = (body: unknown, status = 200) => json(route, body, status, { 'content-range': '0-0/*' })

    if (table?.startsWith('rpc/restore_center_data') && method === 'POST') {
      const payload = safeJson(request.postData()) as { payload?: Record<string, unknown>; force?: boolean }
      const backup = payload.payload ?? {}
      const restoredStudents = Array.isArray(backup.students) ? backup.students : []
      students.splice(0, students.length, ...restoredStudents.map((row) => ({ id: String((row as Record<string, unknown>).id ?? 'restored-student'), name: String((row as Record<string, unknown>).name ?? ''), id_number: ((row as Record<string, unknown>).id_number as string | null) ?? null, phone: ((row as Record<string, unknown>).phone as string | null) ?? null, notes: ((row as Record<string, unknown>).notes as string | null) ?? null })))
      handle.restoreCalls.push({ force: Boolean(payload.force), payload: backup })
      return json(route, { students: restoredStudents.length, receipt_vouchers: Array.isArray(backup.receipt_vouchers) ? backup.receipt_vouchers.length : 0, payment_vouchers: Array.isArray(backup.payment_vouchers) ? backup.payment_vouchers.length : 0 })
    }

    if (table?.startsWith('rpc/get_student_financial_summary_page') && method === 'POST') {
      const payload = safeJson(request.postData()) as { p_offset?: number; p_limit?: number }
      const offset = Math.max(0, Number(payload.p_offset ?? 0))
      const limit = Math.min(1000, Math.max(0, Number(payload.p_limit ?? 1000)))
      const orderedStudents = [...students].sort((a, b) => a.id.localeCompare(b.id))
      const pageStudents = orderedStudents.slice(offset, offset + limit)
      const activeReceipts = handle.receiptInserts.filter((receipt) => !receipt.cancelled_at)
      const activeReceiptIds = new Set(activeReceipts.map((receipt) => String(receipt.id ?? '')))
      return json(route, pageStudents.map((student) => {
        const studentReceipts = activeReceipts.filter((receipt) => String(receipt.student_id ?? '') === student.id)
        const studentAllocations = handle.receiptAllocations.filter((allocation) => activeReceiptIds.has(String(allocation.receipt_voucher_id ?? allocation.receipt_id ?? '')))
        const coursePaidByEnrollment = new Map<string, number>()
        const feePaidByObligation = new Map<string, number>()
        for (const allocation of studentAllocations) {
          const receipt = activeReceipts.find((item) => String(item.id ?? '') === String(allocation.receipt_voucher_id ?? allocation.receipt_id ?? ''))
          if (!receipt || String(receipt.student_id ?? '') !== student.id) continue
          const amount = Number(allocation.amount ?? 0)
          if (String(allocation.allocation_type ?? allocation.type ?? '') === 'course' && allocation.enrollment_id) {
            const id = String(allocation.enrollment_id)
            coursePaidByEnrollment.set(id, (coursePaidByEnrollment.get(id) ?? 0) + amount)
          }
          if (String(allocation.allocation_type ?? allocation.type ?? '') === 'fee' && allocation.fee_obligation_id) {
            const id = String(allocation.fee_obligation_id)
            feePaidByObligation.set(id, (feePaidByObligation.get(id) ?? 0) + amount)
          }
        }
        const legacyPaidByCourse = new Map<string, number>()
        for (const receipt of studentReceipts) {
          if (receipt.allocation_mode !== false || receipt.fee_category != null) continue
          const hasAllocation = handle.receiptAllocations.some((allocation) => String(allocation.receipt_voucher_id ?? allocation.receipt_id ?? '') === String(receipt.id ?? ''))
          if (hasAllocation) continue
          const key = String(receipt.course_name ?? '')
          legacyPaidByCourse.set(key, (legacyPaidByCourse.get(key) ?? 0) + Number(receipt.amount_received ?? 0))
        }
        const studentEnrollments = enrollments.filter((enrollment) => enrollment.student_id === student.id)
        const courseNames = [...new Set(studentEnrollments.map((enrollment) => enrollment.course_name).filter(Boolean))]
        const paid = studentReceipts.reduce((sum, receipt) => sum + Number(receipt.amount_received ?? 0), 0)
        const courseRemaining = studentEnrollments.reduce((sum, enrollment) => (
          sum + Math.max(0, enrollment.course_value - (coursePaidByEnrollment.get(enrollment.id) ?? 0) - (legacyPaidByCourse.get(enrollment.course_name) ?? 0))
        ), 0)
        const feeRows = feeObligations.filter((fee) => fee.student_id === student.id && !fee.cancelled_at)
        const feeRemaining = feeRows.reduce((sum, fee) => sum + Math.max(0, fee.amount - (feePaidByObligation.get(fee.id) ?? 0)), 0)
        const lineCount = studentReceipts.reduce((count, receipt) => {
          const allocationCount = handle.receiptAllocations.filter((allocation) => String(allocation.receipt_voucher_id ?? allocation.receipt_id ?? '') === String(receipt.id ?? '')).length
          return count + (allocationCount > 0 ? allocationCount : 1)
        }, 0)
        const lastActivity = studentReceipts.reduce<string | null>((latest, receipt) => {
          const date = receipt.voucher_date ? String(receipt.voucher_date) : null
          return !date || (latest && latest >= date) ? latest : date
        }, null)
        return {
          student_id: student.id,
          paid,
          remaining: Math.max(0, courseRemaining + feeRemaining),
          courses: studentEnrollments.length,
          last_activity: lastActivity,
          line_count: lineCount,
          course_names: courseNames,
        }
      }))
    }

    if (table?.startsWith('rpc/get_student_statement_lines') && method === 'POST') {
      const payload = safeJson(request.postData()) as { p_student_id?: string }
      const studentId = String(payload.p_student_id ?? '')
      handle.statementReads.push(studentId)
      const lines: Record<string, unknown>[] = []
      for (const receipt of handle.receiptInserts) {
        if (receipt.cancelled_at || String(receipt.student_id ?? '') !== studentId) continue
        const allocations = handle.receiptAllocations.filter((allocation) =>
          String(allocation.receipt_voucher_id ?? allocation.receipt_id ?? '') === String(receipt.id ?? ''),
        )
        if (allocations.length > 0) {
          for (const allocation of allocations) {
            const isFee = String(allocation.allocation_type ?? allocation.type ?? '') === 'fee'
            const fee = feeObligations.find((item) => item.id === allocation.fee_obligation_id)
            const enrollment = enrollments.find((item) => item.id === allocation.enrollment_id)
            const amount = Number(allocation.amount ?? 0)
            lines.push({
              id: String(allocation.id ?? ''),
              voucher_number: Number(receipt.voucher_number ?? 900),
              voucher_date: String(receipt.voucher_date ?? '2026-08-31'),
              student_id: studentId,
              student_name: String(receipt.student_name ?? receipt.student_name_snapshot ?? ''),
              course_name: isFee ? fee?.description ?? 'رسم' : enrollment?.course_name ?? String(receipt.course_name ?? 'دورة'),
              course_value: isFee ? fee?.amount ?? amount : enrollment?.course_value ?? Number(receipt.course_value ?? amount),
              amount_received: amount,
              remaining_balance: 0,
              entry_type: isFee ? 'fee' : 'course',
              fee_obligation_id: isFee ? fee?.id ?? null : null,
              enrollment_id: isFee ? null : enrollment?.id ?? null,
            })
          }
        } else {
          lines.push({
            id: String(receipt.id ?? `legacy-${lines.length}`),
            voucher_number: Number(receipt.voucher_number ?? 900),
            voucher_date: String(receipt.voucher_date ?? '2026-08-31'),
            student_id: studentId,
            student_name: String(receipt.student_name ?? receipt.student_name_snapshot ?? ''),
            course_name: String(receipt.course_name ?? 'دورة'),
            course_value: Number(receipt.course_value ?? 0),
            amount_received: Number(receipt.amount_received ?? 0),
            remaining_balance: Number(receipt.course_value ?? 0) - Number(receipt.amount_received ?? 0),
            entry_type: 'course',
            fee_obligation_id: null,
            enrollment_id: null,
          })
        }
      }
      lines.sort((a, b) =>
        String(a.voucher_date).localeCompare(String(b.voucher_date))
        || Number(a.voucher_number) - Number(b.voucher_number)
        || String(a.id).localeCompare(String(b.id)),
      )
      const bounds = request.headers()['range']?.match(/^(\d+)-(\d+)$/)
      const from = bounds ? Number(bounds[1]) : 0
      const to = bounds ? Number(bounds[2]) : lines.length - 1
      const pageRows = lines.slice(from, to + 1)
      const last = pageRows.length ? from + pageRows.length - 1 : from
      return json(route, pageRows, 200, { 'content-range': `${from}-${last}/${lines.length}` })
    }

    if (table?.startsWith('rpc/get_course_financial_roster') && method === 'POST') {
      const payload = safeJson(request.postData()) as { p_course_id?: string }
      const courseId = String(payload.p_course_id ?? '')
      const course = courses.find((item) => item.id === courseId)
      const targetEnrollments = enrollments.filter((enrollment) => (
        enrollment.course_id === courseId
        || (enrollment.course_id === null && enrollment.course_name === course?.name)
      ))
      const activeReceiptIds = new Set(
        handle.receiptInserts
          .filter((receipt) => !receipt.cancelled_at)
          .map((receipt) => String(receipt.id ?? '')),
      )
      const allocatedPaid = new Map<string, number>()
      for (const allocation of handle.receiptAllocations) {
        const enrollmentId = String(allocation.enrollment_id ?? '')
        if (!enrollmentId || !activeReceiptIds.has(String(allocation.receipt_voucher_id ?? allocation.receipt_id ?? ''))) continue
        if (String(allocation.allocation_type ?? allocation.type ?? '') !== 'course') continue
        allocatedPaid.set(enrollmentId, (allocatedPaid.get(enrollmentId) ?? 0) + Number(allocation.amount ?? 0))
      }
      const legacyPaid = new Map<string, number>()
      for (const receipt of handle.receiptInserts) {
        if (receipt.cancelled_at) continue
        if (receipt.allocation_mode !== false) continue
        if (receipt.fee_category != null) continue
        const hasAllocation = handle.receiptAllocations.some((allocation) => String(allocation.receipt_voucher_id ?? allocation.receipt_id ?? '') === String(receipt.id ?? ''))
        if (hasAllocation) continue
        const key = `${String(receipt.student_id ?? '')}|${String(receipt.course_name ?? '')}`
        legacyPaid.set(key, (legacyPaid.get(key) ?? 0) + Number(receipt.amount_received ?? 0))
      }
      return json(route, targetEnrollments.map((enrollment) => {
        const paid = (allocatedPaid.get(enrollment.id) ?? 0)
          + (legacyPaid.get(`${enrollment.student_id}|${enrollment.course_name}`) ?? 0)
        return {
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          course_id: enrollment.course_id ?? courseId,
          course_name: enrollment.course_name,
          course_value: enrollment.course_value,
          paid,
          remaining: Math.max(0, enrollment.course_value - paid),
        }
      }))
    }

    if (table?.startsWith('rpc/post_receipt_with_allocations') && method === 'POST') {
      const body = safeJson(request.postData()) as { payload?: Record<string, unknown> }
      const payload = body.payload ?? {}
      const allocations = Array.isArray(payload.allocations) ? payload.allocations as Array<Record<string, unknown>> : []
      const receiptId = `receipt-${handle.receiptInserts.length + 1}`
      handle.receiptInserts.push({ ...payload, id: receiptId, voucher_number: 900 + handle.receiptInserts.length + 1, allocation_mode: true })
      handle.receiptAllocations.push(...allocations.map((allocation, index) => ({ ...allocation, id: `${receiptId}-allocation-${index + 1}`, receipt_voucher_id: receiptId, allocation_type: allocation.type, receipt_id: receiptId })))
      const amount = Number(payload.amount_received ?? 0)
      activeMovements.push({ id: receiptId, movement_type: 'receipt', voucher_number: 900 + handle.receiptInserts.length, voucher_date: String(payload.voucher_date ?? '2026-08-31'), amount, party_name: String(payload.student_name ?? ''), context: String(payload.course_name ?? 'تحصيل متعدّد') })
      return json(route, { id: receiptId, voucher_number: 900 + handle.receiptInserts.length, amount_received: amount })
    }

    if (table?.startsWith('rpc/create_fee_obligations') && method === 'POST') {
      const body = safeJson(request.postData()) as { payload?: Record<string, unknown> }
      const payload = body.payload ?? {}
      const studentIds = Array.isArray(payload.student_ids) ? [...new Set(payload.student_ids.map(String))] : []
      const createdRows = studentIds.map((studentId, index) => {
        const enrollment = enrollments.find((item) => item.student_id === studentId && item.course_id === payload.course_id)
        return {
          id: `fee-${feeObligations.length + index + 1}`,
          student_id: studentId,
          enrollment_id: enrollment?.id ?? null,
          course_id: payload.course_id ?? null,
          course_name: enrollment?.course_name ?? courses.find((item) => item.id === payload.course_id)?.name ?? null,
          description: String(payload.description ?? ''),
          amount: Number(payload.amount ?? 0),
          fee_category: payload.fee_category,
          external_share: Number(payload.external_share ?? 0),
          cancelled_at: null,
          cancel_reason: null,
          created_at: new Date().toISOString(),
        } as Record<string, unknown>
      })
      handle.feeObligationInserts.push(createdRows)
      feeObligations.push(...createdRows as unknown as MockFeeObligation[])
      return json(route, { created: createdRows.length })
    }

    if (table?.startsWith('rpc/create_enrollment') && method === 'POST') {
      const body = safeJson(request.postData()) as { payload?: Record<string, unknown> }
      const payload = body.payload ?? {}
      const course = courses.find((item) => item.id === payload.course_id)
      const enrollment = {
        id: `enrollment-${enrollments.length + 1}`,
        student_id: String(payload.student_id ?? ''),
        course_id: String(payload.course_id ?? ''),
        course_name: course?.name ?? '',
        course_value: Number(course?.base_fee ?? 0),
      }
      enrollments.push(enrollment)
      return json(route, enrollment)
    }

    if (table?.startsWith('rpc/post_payment_voucher') && method === 'POST') {
      const body = safeJson(request.postData()) as { payload?: Record<string, unknown> }
      const payload = body.payload ?? {}
      const id = `payment-${handle.paymentInserts.length + 1}`
      const voucherNumber = 901 + handle.paymentInserts.length
      const payment = { ...payload, id, voucher_number: voucherNumber }
      handle.paymentInserts.push(payment)
      activeMovements.push({ id, movement_type: 'payment', voucher_number: voucherNumber, voucher_date: String(payload.voucher_date ?? '2026-08-31'), amount: Number(payload.amount ?? 0), party_name: null, context: String(payload.expense_type ?? 'مصروف') })
      return json(route, { id, voucher_number: voucherNumber, amount: Number(payload.amount ?? 0), idempotent_replay: false })
    }

    if (table?.startsWith('rpc/archive_student') && method === 'POST') {
      const payload = safeJson(request.postData()) as { p_student_id?: string; p_reason?: string | null }
      const target = students.find((item) => item.id === payload.p_student_id)
      if (target) { target.status = 'archived'; target.archived_at = new Date().toISOString(); target.archive_reason = payload.p_reason ?? null }
      return json(route, target ?? {})
    }

    if (table?.startsWith('rpc/unarchive_student') && method === 'POST') {
      const payload = safeJson(request.postData()) as { p_student_id?: string }
      const target = students.find((item) => item.id === payload.p_student_id)
      if (target) { target.status = 'active'; target.archived_at = null; target.archive_reason = null }
      return json(route, target ?? {})
    }

    // ADR-0078 — owner adjusts one enrollment's total fee (course_value). Mirrors
    // the RPC's contract for the browser flow: floor the new fee at the collected
    // total (course allocations on non-cancelled receipts) and reject below it.
    if (table?.startsWith('rpc/update_enrollment_fee') && method === 'POST') {
      const payload = safeJson(request.postData()) as { p_enrollment_id?: string; p_amount?: number; p_reason?: string }
      const target = enrollments.find((item) => item.id === payload.p_enrollment_id)
      if (!target) return json(route, { message: 'ENROLLMENT_NOT_FOUND' }, 400)
      const reason = String(payload.p_reason ?? '').trim()
      if (reason === '') return json(route, { message: 'FEE_ADJUSTMENT_REASON_REQUIRED' }, 400)
      const amount = Number(payload.p_amount ?? Number.NaN)
      if (!Number.isFinite(amount) || amount < 0 || amount !== Math.trunc(amount)) return json(route, { message: 'INVALID_FEE_AMOUNT' }, 400)
      if (amount > 100000000) return json(route, { message: 'FEE_AMOUNT_TOO_LARGE' }, 400)
      const activeReceiptIds = new Set(
        handle.receiptInserts
          .filter((receipt) => !receipt.cancelled_at)
          .map((receipt) => String(receipt.id ?? '')),
      )
      const collected = handle.receiptAllocations
        .filter((allocation) => String(allocation.enrollment_id ?? '') === String(target.id))
        .filter((allocation) => activeReceiptIds.has(String(allocation.receipt_voucher_id ?? allocation.receipt_id ?? '')))
        .reduce((sum, allocation) => sum + Number(allocation.amount ?? 0), 0)
      if (amount < collected) return json(route, { message: 'FEE_BELOW_COLLECTED' }, 400)
      const oldFee = target.course_value
      const changed = amount !== oldFee
      if (changed) {
        target.course_value = amount
        handle.auditLog.unshift({ id: `audit-${handle.auditLog.length + 1}`, entity: 'enrollment', entity_id: target.id, action: 'fee_adjustment', label: 'تعديل رسوم التسجيل', changed_by: 'u-1', actor_email: 'owner@example.com', changed_at: new Date().toISOString(), source: 'enrollment', description: reason, metadata: { enrollment_id: target.id, student_id: target.student_id, old_amount: oldFee, new_amount: amount, paid: collected } })
      }
      return json(route, { enrollment_id: target.id, fee: amount, paid: collected, remaining: amount - collected, old_fee: oldFee, changed, audit_id: changed ? 'audit-x' : null })
    }

    if (method === 'HEAD') {
      if (['students', 'courses', 'enrollments', 'receipt_vouchers', 'payment_vouchers', 'fee_obligations'].includes(table ?? '')) {
        const counts: Record<string, number> = { students: students.length, courses: courses.length, enrollments: enrollments.length, receipt_vouchers: handle.receiptInserts.length, payment_vouchers: handle.paymentInserts.length, fee_obligations: feeObligations.length }
        return route.fulfill({ status: 200, headers: { ...CORS, 'content-range': `0-${Math.max(counts[table ?? ''] - 1, 0)}/${counts[table ?? '']}` } })
      }
      return route.fulfill({ status: 200, headers: CORS })
    }

    if (method === 'GET') {
      if (table === 'students') return arr(applyEqFilters(students, url.searchParams))
      if (table === 'courses') return arr(applyEqFiltersLoose(courses, url.searchParams))
      if (table === 'enrollments') return arr(applyEqFiltersLoose(enrollments, url.searchParams))
      if (table === 'fee_obligations') return arr(applyEqFiltersLoose(feeObligations, url.searchParams))
      if (table === 'student_statement_lines') {
        const lines: Record<string, unknown>[] = []
        for (const receipt of handle.receiptInserts) {
          const receiptAllocations = handle.receiptAllocations.filter((allocation) => String(allocation.receipt_voucher_id ?? '') === String(receipt.id ?? ''))
          if (receiptAllocations.length > 0) {
            for (const allocation of receiptAllocations) {
              const isFee = allocation.allocation_type === 'fee'
              const fee = feeObligations.find((item) => item.id === allocation.fee_obligation_id)
              const enrollment = enrollments.find((item) => item.id === allocation.enrollment_id)
              const amount = Number(allocation.amount ?? 0)
              lines.push({ id: String(allocation.id), voucher_number: Number(receipt.voucher_number ?? 900), voucher_date: String(receipt.voucher_date ?? '2026-08-31'), student_id: String(receipt.student_id ?? ''), student_name: String(receipt.student_name ?? ''), course_name: isFee ? fee?.description ?? 'رسم' : enrollment?.course_name ?? String(receipt.course_name ?? 'دورة'), course_value: isFee ? fee?.amount ?? amount : enrollment?.course_value ?? Number(receipt.course_value ?? amount), amount_received: amount, remaining_balance: 0, entry_type: isFee ? 'fee' : 'course', fee_obligation_id: isFee ? fee?.id ?? null : null, enrollment_id: isFee ? null : enrollment?.id ?? null })
            }
          } else {
            lines.push({ id: String(receipt.id ?? `legacy-${lines.length}`), voucher_number: Number(receipt.voucher_number ?? 900), voucher_date: String(receipt.voucher_date ?? '2026-08-31'), student_id: String(receipt.student_id ?? ''), student_name: String(receipt.student_name ?? ''), course_name: String(receipt.course_name ?? 'دورة'), course_value: Number(receipt.course_value ?? 0), amount_received: Number(receipt.amount_received ?? 0), remaining_balance: Number(receipt.course_value ?? 0) - Number(receipt.amount_received ?? 0), entry_type: 'course', fee_obligation_id: null, enrollment_id: null })
          }
        }
        return arr(lines)
      }
      if (table === 'payment_vouchers') return arr(handle.paymentInserts.map((payment) => ({ id: String(payment.id ?? 'new-payment'), voucher_number: Number(payment.voucher_number ?? 901), voucher_date: String(payment.voucher_date ?? '2026-08-31'), expense_type: String(payment.expense_type ?? 'مصروف'), amount: Number(payment.amount ?? 0), notes: String(payment.notes ?? '') })))
      if (table === 'financial_movements') return arr(activeMovements)
      if (table === 'cancelled_vouchers') return arr(cancelledVouchers)
      if (table === 'audit_log') return arr(handle.auditLog)
      return arr([])
    }

    if (method === 'POST') {
      const payload = safeJson(request.postData())
      if (table === 'students') {
        handle.studentInserts.push(payload as Record<string, unknown>)
        const student = payload as Record<string, unknown>
        students.push({ id: 'new-student', name: String(student.name ?? ''), id_number: (student.id_number as string | null) ?? null, phone: (student.phone as string | null) ?? null, notes: (student.notes as string | null) ?? null })
        return json(route, { id: 'new-student', name: '', id_number: null, phone: null, notes: null, ...(payload as object) }, 201)
      }
      if (table === 'enrollments') return json(route, [{}], 201)
      if (table === 'fee_obligations') { handle.feeObligationInserts.push([payload as Record<string, unknown>]); return json(route, [payload], 201) }
      if (table === 'receipt_vouchers') { handle.receiptInserts.push(payload as Record<string, unknown>); return json(route, { id: 'new-receipt', voucher_number: 900, voucher_date: '2026-08-31', student_id: 'new-student', student_name_snapshot: 'x', course_name: 'دورة', course_value: 1000, amount_received: 400, payer_name: '', notes: '', ...(payload as object) }, 201) }
      if (table === 'payment_vouchers') { handle.paymentInserts.push(payload as Record<string, unknown>); return json(route, { id: 'new-payment', voucher_number: 901, voucher_date: '2026-08-31', expense_type: 'مصروف', amount: 0, notes: '', ...(payload as object) }, 201) }
      return json(route, [{}], 201)
    }

    if (method === 'PATCH') {
      const payload = safeJson(request.postData()) as Record<string, unknown>
      if (table === 'students') {
        const id = url.searchParams.get('id')?.replace('eq.', '') ?? null
        handle.studentUpdates.push({ id, body: payload })
        return json(route, [payload], 200)
      }
      if (table === 'receipt_vouchers' || table === 'payment_vouchers') {
        const id = url.searchParams.get('id')?.replace('eq.', '') ?? null
        const reason = String(payload.cancel_reason ?? '')
        const cancelledAt = String(payload.cancelled_at ?? '')
        if (cancelledAt) {
          const receipt = handle.receiptInserts.find((item) => String(item.id ?? '') === id)
          if (receipt) {
            receipt.cancelled_at = cancelledAt
            receipt.cancel_reason = reason || null
          }
          const index = activeMovements.findIndex((movement) => movement.id === id)
          if (index >= 0) {
            const [movement] = activeMovements.splice(index, 1)
            cancelledVouchers.unshift({ ...movement, cancelled_at: cancelledAt, cancel_reason: reason || null })
          }
          handle.cancellations.push({ table, id, reason })
          handle.auditLog.unshift({ id: `audit-${handle.auditLog.length + 1}`, entity: table, entity_id: id, action: 'cancel', label: 'إبطال سند', changed_by: 'u-1', actor_email: 'owner@example.com', changed_at: cancelledAt, source: 'web', description: reason, device_id: null, device_user_agent: null, ip_address: null, timezone: null })
        }
        return json(route, [{}], 200)
      }
      return json(route, [payload], 200)
    }
    return json(route, [{}])
  })

  return handle
}

function applyEqFilters(rows: MockStudent[], params: URLSearchParams): MockStudent[] {
  let result = rows
  for (const [key, raw] of params.entries()) {
    if (!raw.startsWith('eq.')) continue
    const value = raw.slice(3)
    if (key === 'id' || key === 'name' || key === 'id_number' || key === 'phone') result = result.filter((row) => String(row[key] ?? '') === value)
  }
  return result
}

function applyEqFiltersLoose<T extends Record<string, unknown>>(rows: T[], params: URLSearchParams): T[] {
  let result = rows
  for (const [key, raw] of params.entries()) {
    if (!raw.startsWith('eq.')) continue
    const value = raw.slice(3)
    result = result.filter((row) => String(row[key] ?? '') === value)
  }
  return result
}

function safeJson(text: string | null): unknown {
  if (!text) return {}
  try { return JSON.parse(text) } catch { return {} }
}