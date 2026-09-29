import { beforeEach, describe, expect, it, vi } from 'vitest'

const hoisted = vi.hoisted(() => ({ client: null as unknown }))
vi.mock('@/lib/supabase', () => ({
  getSupabaseBrowserClient: () => hoisted.client,
}))

import { useEnrollmentFeeStore } from '@/store/use-enrollment-fee-store'

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
  useEnrollmentFeeStore.setState({ isBusy: false, error: null })
})

describe('updateFee (ADR-0078)', () => {
  it('calls update_enrollment_fee with id, amount and trimmed reason', async () => {
    const capture: RpcCapture = {}
    hoisted.client = makeClient(capture)

    const ok = await useEnrollmentFeeStore.getState().updateFee('e-1', 250, '  تصحيح الرسوم  ')

    expect(ok).toBe(true)
    expect(capture.fn).toBe('update_enrollment_fee')
    expect(capture.args).toEqual({ p_enrollment_id: 'e-1', p_amount: 250, p_reason: 'تصحيح الرسوم' })
    expect(useEnrollmentFeeStore.getState().isBusy).toBe(false)
  })

  it('maps FEE_BELOW_COLLECTED to a clear Arabic message and returns false', async () => {
    hoisted.client = makeClient({}, { message: 'FEE_BELOW_COLLECTED' })

    const ok = await useEnrollmentFeeStore.getState().updateFee('e-1', 80, 'خفض')

    expect(ok).toBe(false)
    expect(useEnrollmentFeeStore.getState().error).toContain('المحصّل')
    expect(useEnrollmentFeeStore.getState().isBusy).toBe(false)
  })

  it('maps OWNER_ONLY to an authorization message', async () => {
    hoisted.client = makeClient({}, { message: 'OWNER_ONLY' })

    const ok = await useEnrollmentFeeStore.getState().updateFee('e-1', 250, 'سبب')

    expect(ok).toBe(false)
    expect(useEnrollmentFeeStore.getState().error).toBe('غير مصرّح لك بتعديل رسوم التسجيل.')
  })

  it('maps the reason-required error', async () => {
    hoisted.client = makeClient({}, { message: 'FEE_ADJUSTMENT_REASON_REQUIRED' })

    await useEnrollmentFeeStore.getState().updateFee('e-1', 250, '')

    expect(useEnrollmentFeeStore.getState().error).toBe('يجب إدخال سبب التعديل.')
  })

  it('maps invalid-amount and too-large errors', async () => {
    hoisted.client = makeClient({}, { message: 'INVALID_FEE_AMOUNT' })
    await useEnrollmentFeeStore.getState().updateFee('e-1', -5, 'سبب')
    expect(useEnrollmentFeeStore.getState().error).toContain('غير صحيحة')

    hoisted.client = makeClient({}, { message: 'FEE_AMOUNT_TOO_LARGE' })
    await useEnrollmentFeeStore.getState().updateFee('e-1', 999999999, 'سبب')
    expect(useEnrollmentFeeStore.getState().error).toBe('قيمة الرسوم كبيرة جدًا.')
  })

  it('maps ENROLLMENT_NOT_FOUND', async () => {
    hoisted.client = makeClient({}, { message: 'ENROLLMENT_NOT_FOUND' })

    const ok = await useEnrollmentFeeStore.getState().updateFee('missing', 250, 'سبب')

    expect(ok).toBe(false)
    expect(useEnrollmentFeeStore.getState().error).toBe('تعذّر العثور على التسجيل.')
  })

  it('falls back to a safe generic message on an unknown error', async () => {
    hoisted.client = makeClient({}, { message: 'some_unexpected_db_error' })

    const ok = await useEnrollmentFeeStore.getState().updateFee('e-1', 250, 'سبب')

    expect(ok).toBe(false)
    expect(useEnrollmentFeeStore.getState().error).toBe('تعذّر تعديل رسوم التسجيل.')
  })

  it('reports a not-configured message when the client is unavailable', async () => {
    hoisted.client = null

    const ok = await useEnrollmentFeeStore.getState().updateFee('e-1', 250, 'سبب')

    expect(ok).toBe(false)
    expect(useEnrollmentFeeStore.getState().error).toContain('غير مهيأ')
  })
})
