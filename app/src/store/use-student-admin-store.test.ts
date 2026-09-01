import { beforeEach, describe, expect, it, vi } from 'vitest'

const hoisted = vi.hoisted(() => ({ client: null as unknown }))
vi.mock('@/lib/supabase', () => ({
  getSupabaseBrowserClient: () => hoisted.client,
}))

import { useStudentAdminStore } from '@/store/use-student-admin-store'

type UpdateCapture = { table?: string; payload?: Record<string, unknown>; id?: unknown }

function makeClient(capture: UpdateCapture, error: unknown = null) {
  return {
    from(table: string) {
      capture.table = table
      const builder = {
        update(payload: Record<string, unknown>) {
          capture.payload = payload
          return builder
        },
        eq(_col: string, val: unknown) {
          capture.id = val
          return Promise.resolve({ error })
        },
      }
      return builder
    },
  }
}

beforeEach(() => {
  useStudentAdminStore.setState({ isBusy: false, error: null })
})

describe('updateStudent', () => {
  it('writes the identity fields and blanks become null', async () => {
    const capture: UpdateCapture = {}
    hoisted.client = makeClient(capture)

    const ok = await useStudentAdminStore
      .getState()
      .updateStudent('s-1', { name: '  سارة  ', idNumber: '', phone: '0590000000', notes: '' })

    expect(ok).toBe(true)
    expect(capture.table).toBe('students')
    expect(capture.id).toBe('s-1')
    expect(capture.payload).toEqual({
      name: 'سارة',
      id_number: null,
      phone: '0590000000',
      notes: null,
    })
  })

  it('surfaces a friendly error and returns false on failure', async () => {
    hoisted.client = makeClient({}, { message: 'boom' })

    const ok = await useStudentAdminStore
      .getState()
      .updateStudent('s-1', { name: 'سارة', idNumber: '', phone: '', notes: '' })

    expect(ok).toBe(false)
    expect(useStudentAdminStore.getState().error).toBe('تعذّر حفظ بيانات الطالب.')
    expect(useStudentAdminStore.getState().isBusy).toBe(false)
  })
})
