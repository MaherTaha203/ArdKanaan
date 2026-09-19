import { beforeEach, describe, expect, it, vi } from 'vitest'

const hoisted = vi.hoisted(() => ({ client: null as unknown }))
vi.mock('@/lib/supabase', () => ({
  getSupabaseBrowserClient: () => hoisted.client,
}))

import { useStudentArchiveStore } from '@/store/use-student-archive-store'

type RpcCapture = { fn?: string; args?: Record<string, unknown> }

function makeClient(capture: RpcCapture, error: unknown = null) {
  return {
    rpc(fn: string, args: Record<string, unknown>) {
      capture.fn = fn
      capture.args = args
      return Promise.resolve({ error })
    },
  }
}

beforeEach(() => {
  useStudentArchiveStore.setState({ isBusy: false, error: null })
})

describe('archiveStudent', () => {
  it('calls archive_student with the id and trimmed reason', async () => {
    const capture: RpcCapture = {}
    hoisted.client = makeClient(capture)

    const ok = await useStudentArchiveStore.getState().archiveStudent('s-1', '  انتهت العلاقة  ')

    expect(ok).toBe(true)
    expect(capture.fn).toBe('archive_student')
    expect(capture.args).toEqual({ p_student_id: 's-1', p_reason: 'انتهت العلاقة' })
    expect(useStudentArchiveStore.getState().isBusy).toBe(false)
  })

  it('sends a null reason when the reason is blank', async () => {
    const capture: RpcCapture = {}
    hoisted.client = makeClient(capture)

    await useStudentArchiveStore.getState().archiveStudent('s-1', '   ')

    expect(capture.args).toEqual({ p_student_id: 's-1', p_reason: null })
  })

  it('maps the active-course block to a clear message and returns false', async () => {
    hoisted.client = makeClient({}, { message: 'student_has_active_course' })

    const ok = await useStudentArchiveStore.getState().archiveStudent('s-1', '')

    expect(ok).toBe(false)
    expect(useStudentArchiveStore.getState().error).toContain('دورة نشطة')
    expect(useStudentArchiveStore.getState().isBusy).toBe(false)
  })

  it('maps a not_authorized error', async () => {
    hoisted.client = makeClient({}, { message: 'not_authorized' })

    const ok = await useStudentArchiveStore.getState().archiveStudent('s-1', '')

    expect(ok).toBe(false)
    expect(useStudentArchiveStore.getState().error).toBe('غير مخوَّل لتنفيذ هذه العملية.')
  })

  it('falls back to a safe generic message on an unknown error', async () => {
    hoisted.client = makeClient({}, { message: 'some_unexpected_db_error' })

    const ok = await useStudentArchiveStore.getState().archiveStudent('s-1', '')

    expect(ok).toBe(false)
    expect(useStudentArchiveStore.getState().error).toBe('تعذّرت أرشفة الطالب.')
  })
})

describe('unarchiveStudent', () => {
  it('calls unarchive_student with the id', async () => {
    const capture: RpcCapture = {}
    hoisted.client = makeClient(capture)

    const ok = await useStudentArchiveStore.getState().unarchiveStudent('s-2')

    expect(ok).toBe(true)
    expect(capture.fn).toBe('unarchive_student')
    expect(capture.args).toEqual({ p_student_id: 's-2' })
  })

  it('surfaces a friendly error and returns false on failure', async () => {
    hoisted.client = makeClient({}, { message: 'boom' })

    const ok = await useStudentArchiveStore.getState().unarchiveStudent('s-2')

    expect(ok).toBe(false)
    expect(useStudentArchiveStore.getState().error).toBe('تعذّرت إعادة تفعيل الطالب.')
  })
})
