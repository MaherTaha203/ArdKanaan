import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'
import type { Student } from '@/types/domain'

const hoisted = vi.hoisted(() => ({ client: null as unknown }))
vi.mock('@/lib/supabase', () => ({ getSupabaseBrowserClient: () => hoisted.client }))

import { useMoneyInStore } from '@/store/use-money-in-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

type QueryState = { table: string; op: 'select' | 'insert'; filters: Record<string, unknown>; payload?: Record<string, unknown> }
type Respond = (state: QueryState) => { data: unknown; error: unknown }
type RpcPayload = {
  payload: {
    allocations: Array<{ type: string; enrollment_id: string | null; fee_obligation_id: string | null; amount: number }>
    amount_received: number
  }
}
type MockClient = ReturnType<typeof makeClient>

function makeClient(respond: Respond, rpcRespond?: () => { data: unknown; error: unknown }) {
  return {
    from(table: string) {
      const state: QueryState = { table, op: 'select', filters: {} }
      const builder = {
        select: () => builder,
        insert: (payload: Record<string, unknown>) => { state.op = 'insert'; state.payload = payload; return builder },
        update: () => builder,
        eq: (col: string, val: unknown) => { state.filters[col] = val; return builder },
        is: () => builder,
        order: () => builder,
        limit: () => builder,
        single: () => builder,
        then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) => Promise.resolve(respond(state)).then(resolve, reject),
      }
      return builder
    },
    rpc: () => Promise.resolve(rpcRespond ? rpcRespond() : { data: null, error: null }),
  }
}

function student(id: string, name: string): Student { return { id, name, idNumber: null, phone: null, notes: null } }
function seedRoster(students: Student[]) { useWorkspaceStore.setState({ students }) }

function formValues(overrides: Partial<ReceiptVoucherFormValues> = {}): ReceiptVoucherFormValues {
  return { paymentDate: '2026-08-31', studentName: 'محمد علي', studentId: '', studentIdNumber: '', studentPhone: '', courseName: 'دورة الإنجليزية', courseValue: 1000, amountReceived: 400, payerName: '', notes: '', entryType: 'course', feeCategory: undefined, externalShare: undefined, allocations: [], ...overrides }
}

const happyPathRespond: Respond = (state) => {
  const { table, op } = state
  if (table === 'students' && op === 'insert') return { data: { id: 'new-student', name: 'خالد', id_number: null, phone: null, notes: null }, error: null }
  if (table === 'enrollments' && op === 'select') return { data: [], error: null }
  if (table === 'enrollments' && op === 'insert') return { data: null, error: null }
  if (table === 'receipt_vouchers' && op === 'insert') return { data: { id: 'r-1', voucher_number: 900, student_id: 'x' }, error: null }
  if (table === 'student_statement_lines') return { data: [], error: null }
  throw new Error(`unexpected query on ${table}`)
}

beforeEach(() => {
  useMoneyInStore.setState({ currentView: 'receipt-voucher', statementLines: [], activeStudent: null, isSaving: false, error: null })
  useWorkspaceStore.setState({ students: [], statementLines: [], movements: [], cancelledVouchers: [], courses: [], enrollments: [], feeObligations: [], isLoading: false, loaded: false, error: null })
})

describe('saveReceiptVoucher — student identity guard', () => {
  it('refuses ambiguous unpicked names before any I/O', async () => {
    seedRoster([student('s-1', 'محمد علي'), student('s-2', 'محمد علي')])
    hoisted.client = makeClient(() => { throw new Error('no query should run for an ambiguous name') })
    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues())
    expect(ok).toBe(false)
    expect(useMoneyInStore.getState().error).toContain('أكثر من طالب')
    expect(useMoneyInStore.getState().isSaving).toBe(false)
  })

  it('folds an orthographic variant onto the same student', async () => {
    seedRoster([student('s-1', 'أحمد')])
    let studentInserted = false
    hoisted.client = makeClient((state) => {
      if (state.table === 'students' && state.op === 'insert') { studentInserted = true; return { data: { id: 'dup', name: 'احمد', id_number: null, phone: null, notes: null }, error: null } }
      return happyPathRespond(state)
    })
    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues({ studentName: 'احمد' }))
    expect(ok).toBe(true)
    expect(studentInserted).toBe(false)
    expect(useMoneyInStore.getState().activeStudent?.id).toBe('s-1')
  })

  it('binds to one unique match and saves', async () => {
    seedRoster([student('s-1', 'محمد علي')])
    let receiptInserted = false
    hoisted.client = makeClient((state) => {
      if (state.table === 'receipt_vouchers' && state.op === 'insert') { receiptInserted = true; return { data: { id: 'r-1', voucher_number: 900, student_id: 's-1' }, error: null } }
      return happyPathRespond(state)
    })
    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues())
    expect(ok).toBe(true)
    expect(receiptInserted).toBe(true)
    expect(useMoneyInStore.getState().activeStudent?.id).toBe('s-1')
  })

  it('creates a new student when the name matches no one', async () => {
    seedRoster([student('s-1', 'سارة')])
    let studentInserted = false
    hoisted.client = makeClient((state) => {
      if (state.table === 'students' && state.op === 'insert') { studentInserted = true; return { data: { id: 'new-student', name: 'خالد', id_number: null, phone: null, notes: null } , error: null } }
      return happyPathRespond(state)
    })
    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues({ studentName: 'خالد' }))
    expect(ok).toBe(true)
    expect(studentInserted).toBe(true)
    expect(useMoneyInStore.getState().activeStudent?.id).toBe('new-student')
  })

  it('reuses the enrollment fee on a repeat course', async () => {
    seedRoster([student('s-1', 'محمد علي')])
    let insertedCourseValue: unknown
    hoisted.client = makeClient((state) => {
      if (state.table === 'enrollments' && state.op === 'select') return { data: [{ course_value: 1000 }], error: null }
      if (state.table === 'receipt_vouchers' && state.op === 'insert') { insertedCourseValue = state.payload?.course_value; return { data: { id: 'r-2', voucher_number: 901, student_id: 's-1' }, error: null } }
      if (state.table === 'student_statement_lines') return { data: [], error: null }
      throw new Error(`unexpected query on ${state.table}`)
    })
    await useMoneyInStore.getState().saveReceiptVoucher(formValues({ courseValue: 1500 }))
    expect(insertedCourseValue).toBe(1000)
  })
})

describe('saveReceiptVoucher — allocation posting', () => {
  it('sends course + multiple fee allocations to one atomic RPC', async () => {
    seedRoster([student('s-1', 'محمد علي')])
    let rpcName = ''
    let rpcArgs: RpcPayload | null = null
    const client: MockClient = makeClient((state) => {
      if (state.table === 'student_statement_lines') return { data: [], error: null }
      throw new Error(`unexpected query on ${state.table}`)
    }, () => ({ data: { id: 'r-atomic', voucher_number: 901, amount_received: 320 }, error: null }))
    client.rpc = (name: string, args: unknown) => {
      rpcName = name
      rpcArgs = args as RpcPayload
      return Promise.resolve({ data: { id: 'r-atomic', voucher_number: 901, amount_received: 320 }, error: null })
    }
    hoisted.client = client

    const allocations = [
      { type: 'course' as const, enrollmentId: '11111111-1111-4111-8111-111111111111', amount: 250 },
      { type: 'fee' as const, feeObligationId: '22222222-2222-4222-8222-222222222222', amount: 50 },
      { type: 'fee' as const, feeObligationId: '33333333-3333-4333-8333-333333333333', amount: 20 },
    ]
    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues({ studentId: 's-1', entryType: 'mixed', courseValue: undefined, amountReceived: 320, allocations }))
    expect(ok).toBe(true)
    expect(rpcName).toBe('post_receipt_with_allocations')
    expect(rpcArgs?.payload.allocations).toEqual([
      { type: 'course', enrollment_id: '11111111-1111-4111-8111-111111111111', fee_obligation_id: null, amount: 250 },
      { type: 'fee', enrollment_id: null, fee_obligation_id: '22222222-2222-4222-8222-222222222222', amount: 50 },
      { type: 'fee', enrollment_id: null, fee_obligation_id: '33333333-3333-4333-8333-333333333333', amount: 20 },
    ])
    expect(rpcArgs?.payload.amount_received).toBe(320)
  })
})
