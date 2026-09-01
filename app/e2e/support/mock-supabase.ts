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

export type MockOptions = {
  students?: MockStudent[]
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*',
}

export type MockHandle = {
  receiptInserts: Array<Record<string, unknown>>
  studentUpdates: Array<{ id: string | null; body: Record<string, unknown> }>
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
  const handle: MockHandle = { receiptInserts: [], studentUpdates: [] }

  await page.route('**/auth/v1/**', (route) => {
    const method = route.request().method()
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const url = route.request().url()
    if (url.includes('/token')) {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600
      return json(route, {
        access_token: 'stub-access',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: expiresAt,
        refresh_token: 'stub-refresh',
        user: {
          id: 'u-1',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'owner@example.com',
          app_metadata: {},
          user_metadata: {},
        },
      })
    }
    return json(route, {})
  })

  await page.route('**/rest/v1/**', (route) => {
    const request = route.request()
    const method = request.method()
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })

    const url = new URL(request.url())
    const table = url.pathname.split('/rest/v1/')[1]?.split('?')[0]
    const arr = (body: unknown, status = 200) =>
      json(route, body, status, { 'content-range': '0-0/*' })

    if (method === 'GET') {
      if (table === 'students') return arr(applyEqFilters(students, url.searchParams))
      if (table === 'student_statement_lines') return arr([])
      if (table === 'financial_movements') return arr([])
      if (table === 'cancelled_vouchers') return arr([])
      if (table === 'enrollments') return arr([])
      return arr([])
    }

    if (method === 'POST') {
      const payload = safeJson(request.postData())
      if (table === 'students') {
        return json(route, { id: 'new-student', name: '', id_number: null, phone: null, notes: null, ...(payload as object) }, 201)
      }
      if (table === 'enrollments') return json(route, [{}], 201)
      if (table === 'receipt_vouchers') {
        handle.receiptInserts.push(payload as Record<string, unknown>)
        return json(
          route,
          {
            id: 'new-receipt',
            voucher_number: 900,
            voucher_date: '2026-08-31',
            student_id: 'new-student',
            student_name_snapshot: 'x',
            course_name: 'دورة',
            course_value: 1000,
            amount_received: 400,
            payer_name: '',
            notes: '',
            ...(payload as object),
          },
          201,
        )
      }
      return json(route, [{}], 201)
    }

    if (method === 'PATCH') {
      const payload = safeJson(request.postData()) as Record<string, unknown>
      if (table === 'students') {
        const id = url.searchParams.get('id')?.replace('eq.', '') ?? null
        handle.studentUpdates.push({ id, body: payload })
      }
      return json(route, [payload], 200)
    }

    return json(route, [{}])
  })

  return handle
}

// Honor PostgREST `?field=eq.value` filters so a dropped/incorrect server-side
// filter in the app is actually caught by the E2E, not masked by "return everything".
function applyEqFilters(rows: MockStudent[], params: URLSearchParams): MockStudent[] {
  let result = rows
  for (const [key, raw] of params.entries()) {
    if (!raw.startsWith('eq.')) continue
    const value = raw.slice(3)
    if (key === 'id' || key === 'name' || key === 'id_number' || key === 'phone') {
      result = result.filter((row) => String(row[key] ?? '') === value)
    }
  }
  return result
}

function safeJson(text: string | null): unknown {
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}
