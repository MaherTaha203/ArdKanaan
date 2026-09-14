import type { Page, Route } from '@playwright/test'

// Installs a self-contained Supabase stand-in on a page: Auth accepts any login and
// returns a session; REST serves an in-memory dataset and accepts writes. No network
// leaves the browser. Enough surface to drive the app's real code paths in E2E.

export type MockStudent = {
  id: string
  name: string
  id_number: string | null
  phone: string | null
  notes: string | null
}

export type MockMovement = {
  id: string
  movement_type: 'receipt' | 'payment'
  voucher_number: number
  voucher_date: string
  amount: number
  party_name: string | null
  context: string | null
}

export type MockCancelledVoucher = MockMovement & {
  cancelled_at: string
  cancel_reason: string | null
}

export type MockOptions = {
  students?: MockStudent[]
  financialMovements?: MockMovement[]
  cancelledVouchers?: MockCancelledVoucher[]
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*',
}

export type MockHandle = {
  receiptInserts: Array<Record<string, unknown>>
  paymentInserts: Array<Record<string, unknown>>
  studentInserts: Array<Record<string, unknown>>
  studentUpdates: Array<{ id: string | null; body: Record<string, unknown> }>
  cancellations: Array<{ table: 'receipt_vouchers' | 'payment_vouchers'; id: string | null; reason: string }>
  activeMovements: MockMovement[]
  cancelledVouchers: MockCancelledVoucher[]
  restoreCalls: Array<{ force: boolean; payload: Record<string, unknown> }>
  passwordResets: string[]
  passwordUpdates: string[]
}

function json(route: Route, body: unknown, status = 200, headers: Record<string, string> = {}) {
  return route.fulfill({
    status,
    headers: { ...CORS, ...headers },
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

export async function installSupabaseMocks(page: Page, options: MockOptions = {}): Promise<MockHandle> {
  const students = options.students ?? []
  const activeMovements = [...(options.financialMovements ?? [])]
  const cancelledVouchers = [...(options.cancelledVouchers ?? [])]
  const handle: MockHandle = {
    receiptInserts: [],
    paymentInserts: [],
    studentInserts: [],
    studentUpdates: [],
    cancellations: [],
    activeMovements,
    cancelledVouchers,
    restoreCalls: [],
    passwordResets: [],
    passwordUpdates: [],
  }

  await page.route('**/auth/v1/**', (route) => {
    const method = route.request().method()
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const url = route.request().url()
    if (url.includes('/token')) {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600
      return json(route, {
        access_token: 'stub-access', token_type: 'bearer', expires_in: 3600, expires_at: expiresAt,
        refresh_token: 'stub-refresh',
        user: { id: 'u-1', aud: 'authenticated', role: 'authenticated', email: 'owner@example.com', app_metadata: {}, user_metadata: {} },
      })
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
      students.splice(0, students.length, ...restoredStudents.map((row) => ({
        id: String((row as Record<string, unknown>).id ?? 'restored-student'),
        name: String((row as Record<string, unknown>).name ?? ''),
        id_number: ((row as Record<string, unknown>).id_number as string | null) ?? null,
        phone: ((row as Record<string, unknown>).phone as string | null) ?? null,
        notes: ((row as Record<string, unknown>).notes as string | null) ?? null,
      })))
      handle.restoreCalls.push({ force: Boolean(payload.force), payload: backup })
      return json(route, {
        students: restoredStudents.length,
        receipt_vouchers: Array.isArray(backup.receipt_vouchers) ? backup.receipt_vouchers.length : 0,
        payment_vouchers: Array.isArray(backup.payment_vouchers) ? backup.payment_vouchers.length : 0,
      })
    }

    if (method === 'HEAD') {
      if (['students', 'courses', 'enrollments', 'receipt_vouchers', 'payment_vouchers'].includes(table ?? '')) {
        const counts: Record<string, number> = { students: students.length, courses: 0, enrollments: 0, receipt_vouchers: handle.receiptInserts.length, payment_vouchers: handle.paymentInserts.length }
        return route.fulfill({ status: 200, headers: { ...CORS, 'content-range': `0-${Math.max(counts[table ?? ''] - 1, 0)}/${counts[table ?? '']}` } })
      }
      return route.fulfill({ status: 200, headers: CORS })
    }

    if (method === 'GET') {
      if (table === 'students') return arr(applyEqFilters(students, url.searchParams))
      if (table === 'courses' || table === 'enrollments') return arr([])
      if (table === 'student_statement_lines') {
        const receipt = handle.receiptInserts.at(-1)
        if (!receipt) return arr([])
        const courseValue = Number(receipt.course_value ?? 0)
        const amountReceived = Number(receipt.amount_received ?? 0)
        const studentId = String(receipt.student_id ?? 'new-student')
        const student = students.find((row) => row.id === studentId)
        return arr([{ id: 'new-receipt', voucher_number: 900, voucher_date: '2026-08-31', student_id: studentId, student_name: student?.name ?? 'سارة أحمد', course_name: String(receipt.course_name ?? 'دورة'), course_value: courseValue, amount_received: amountReceived, remaining_balance: courseValue - amountReceived }])
      }
      if (table === 'payment_vouchers') return arr(handle.paymentInserts.map((payment) => ({ id: 'new-payment', voucher_number: 901, voucher_date: '2026-08-31', expense_type: String(payment.expense_type ?? 'مصروف'), amount: Number(payment.amount ?? 0), notes: String(payment.notes ?? '') })))
      if (table === 'financial_movements') return arr(handle.activeMovements)
      if (table === 'cancelled_vouchers') return arr(handle.cancelledVouchers)
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
      if (table === 'receipt_vouchers') {
        handle.receiptInserts.push(payload as Record<string, unknown>)
        return json(route, { id: 'new-receipt', voucher_number: 900, voucher_date: '2026-08-31', student_id: 'new-student', student_name_snapshot: 'x', course_name: 'دورة', course_value: 1000, amount_received: 400, payer_name: '', notes: '', ...(payload as object) }, 201)
      }
      if (table === 'payment_vouchers') {
        handle.paymentInserts.push(payload as Record<string, unknown>)
        return json(route, { id: 'new-payment', voucher_number: 901, voucher_date: '2026-08-31', expense_type: 'مصروف', amount: 0, notes: '', ...(payload as object) }, 201)
      }
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

function safeJson(text: string | null): unknown {
  if (!text) return {}
  try { return JSON.parse(text) } catch { return {} }
}
