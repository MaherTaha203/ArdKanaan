import type { Page, Route } from '@playwright/test'

export type MockStudent = {
  id: string
  name: string
  id_number: string | null
  phone: string | null
  notes: string | null
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

export type MockOptions = {
  students?: MockStudent[]
  courses?: Array<{ id: string; name: string; base_fee: number | null; start_date: string | null; end_date: string | null; status: 'active' | 'ended'; notes: string | null }>
  enrollments?: MockEnrollment[]
  feeObligations?: MockFeeObligation[]
  financialMovements?: MockMovement[]
  cancelledVouchers?: MockCancelledVoucher[]
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
  const handle: MockHandle = {
    receiptInserts: [], paymentInserts: [], feeObligationInserts: [], receiptAllocations: [], studentInserts: [], studentUpdates: [],
    cancellations: [], activeMovements, cancelledVouchers, auditLog: [], restoreCalls: [], passwordResets: [], passwordUpdates: [],
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
          course_name: enrollment?.course_name ?? String(payload.course_name ?? ''),
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
      feeObligations.push(...createdRows as MockFeeObligation[])
      return json(route, { created: createdRows.length })
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