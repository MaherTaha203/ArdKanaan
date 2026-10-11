import { beforeEach, describe, expect, it, vi } from 'vitest'

const hoisted = vi.hoisted(() => ({ client: null as unknown }))
vi.mock('@/lib/supabase', () => ({
  getSupabaseBrowserClient: () => hoisted.client,
}))
// The store reloads the workspace after a successful write; stub it so the unit
// test stays focused on the RPC payload and error mapping.
vi.mock('@/store/use-workspace-store', () => ({
  useWorkspaceStore: { getState: () => ({ load: async () => {}, loadStudentStatement: async () => {}, statementStudentId: 's-1' }) },
}))

import { useFeeObligationStore } from '@/store/use-fee-obligation-store'

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
  useFeeObligationStore.setState({ isSaving: false, isCancelling: false, error: null })
})

describe('addFeeObligations', () => {
  it('creates a STANDALONE fee — no course_id / enrollment_id in the payload', async () => {
    const capture: RpcCapture = {}
    hoisted.client = makeClient(capture)

    const ok = await useFeeObligationStore.getState().addFeeObligations({
      studentIds: ['s-1'],
      description: '  رسوم امتحان ',
      amount: 50,
      feeCategory: 'institute',
      externalShare: 0,
    })

    expect(ok).toBe(true)
    expect(capture.fn).toBe('create_fee_obligations')
    const payload = capture.args?.payload as Record<string, unknown>
    expect(payload.student_ids).toEqual(['s-1'])
    expect(payload.description).toBe('رسوم امتحان')
    expect('course_id' in payload).toBe(false)
    expect('enrollment_id' in payload).toBe(false)
  })

  it('includes course_id when a course context is given', async () => {
    const capture: RpcCapture = {}
    hoisted.client = makeClient(capture)

    await useFeeObligationStore.getState().addFeeObligations({
      studentIds: ['s-1', 's-1', ''],
      courseId: 'c-1',
      description: 'رسوم الدورة',
      amount: 300,
      feeCategory: 'external',
      externalShare: 300,
    })

    const payload = capture.args?.payload as Record<string, unknown>
    expect(payload.course_id).toBe('c-1')
    expect(payload.student_ids).toEqual(['s-1']) // de-duplicated, blanks removed
  })

  it('rejects invalid input before calling the RPC', async () => {
    const capture: RpcCapture = {}
    hoisted.client = makeClient(capture)

    const ok = await useFeeObligationStore.getState().addFeeObligations({
      studentIds: ['s-1'],
      description: '   ',
      amount: 50,
      feeCategory: 'institute',
      externalShare: 0,
    })

    expect(ok).toBe(false)
    expect(capture.fn).toBeUndefined()
    expect(useFeeObligationStore.getState().error).toBeTruthy()
  })

  it('maps a missing-course error to a clear message', async () => {
    hoisted.client = makeClient({}, { message: 'COURSE_NOT_FOUND' })

    const ok = await useFeeObligationStore.getState().addFeeObligations({
      studentIds: ['s-1'],
      courseId: 'c-x',
      description: 'رسم',
      amount: 10,
      feeCategory: 'institute',
      externalShare: 0,
    })

    expect(ok).toBe(false)
    expect(useFeeObligationStore.getState().error).toContain('الدورة')
  })

  it('maps an authorization error and falls back safely otherwise', async () => {
    hoisted.client = makeClient({}, { message: 'OWNER_ONLY' })
    await useFeeObligationStore.getState().addFeeObligations({ studentIds: ['s-1'], description: 'x', amount: 5, feeCategory: 'institute', externalShare: 0 })
    expect(useFeeObligationStore.getState().error).toContain('مصرّح')

    hoisted.client = makeClient({}, { message: 'some_unexpected_error' })
    await useFeeObligationStore.getState().addFeeObligations({ studentIds: ['s-1'], description: 'x', amount: 5, feeCategory: 'institute', externalShare: 0 })
    expect(useFeeObligationStore.getState().error).toContain('تعذّر')
  })
})

describe('cancelFeeObligation', () => {
  it('calls cancel_fee_obligation with the fee id and a trimmed reason', async () => {
    const capture: RpcCapture = {}
    hoisted.client = makeClient(capture)

    const ok = await useFeeObligationStore.getState().cancelFeeObligation('fee-1', '  أُدخل مرّتين  ')

    expect(ok).toBe(true)
    expect(capture.fn).toBe('cancel_fee_obligation')
    expect(capture.args).toEqual({ p_fee_id: 'fee-1', p_reason: 'أُدخل مرّتين' })
  })

  it('requires a reason before calling the RPC', async () => {
    const capture: RpcCapture = {}
    hoisted.client = makeClient(capture)

    const ok = await useFeeObligationStore.getState().cancelFeeObligation('fee-1', '   ')

    expect(ok).toBe(false)
    expect(capture.fn).toBeUndefined()
    expect(useFeeObligationStore.getState().error).toContain('سبب')
  })

  it('guides the owner to void the receipt first when the fee is already paid', async () => {
    hoisted.client = makeClient({}, { message: 'PAID_FEE_REQUIRES_REVERSAL_BEFORE_CANCELLATION' })

    const ok = await useFeeObligationStore.getState().cancelFeeObligation('fee-1', 'خطأ')

    expect(ok).toBe(false)
    expect(useFeeObligationStore.getState().error).toContain('سند القبض')
  })

  it('maps authorization, already-cancelled, and unexpected errors', async () => {
    hoisted.client = makeClient({}, { message: 'OWNER_ONLY' })
    await useFeeObligationStore.getState().cancelFeeObligation('fee-1', 'خطأ')
    expect(useFeeObligationStore.getState().error).toContain('مصرّح')

    hoisted.client = makeClient({}, { message: 'FEE_ALREADY_CANCELLED' })
    await useFeeObligationStore.getState().cancelFeeObligation('fee-1', 'خطأ')
    expect(useFeeObligationStore.getState().error).toContain('ملغى')

    hoisted.client = makeClient({}, { message: 'some_unexpected_error' })
    await useFeeObligationStore.getState().cancelFeeObligation('fee-1', 'خطأ')
    expect(useFeeObligationStore.getState().error).toContain('تعذّر')
  })
})
