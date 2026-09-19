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

function student(id: string, name: string): Student { return { id, name, idNumber: null, phone: null, notes: null, status: 'active', archivedAt: null, archiveReason: null } }
function seedRoster(students: Student[]) { useWorkspaceStore.setState({ students }) }

function formValues(overrides: Partial<ReceiptVoucherFormValues> = {}): ReceiptVoucherFormValues {
  return {
    paymentDate: '2026-08-31',
    studentName: 'محمد علي',
    studentId: 's-1',
    studentIdNumber: '',
    studentPhone: '',
    courseName: 'دورة الإنجليزية',
    courseValue: 1000,
    amountReceived: 400,
    payerName: '',
    notes: '',
    entryType: 'course',
    feeCategory: undefined,
    externalShare: undefined,
    allocations: [{ type: 'course', enrollmentId: 'e-1', amount: 400 }],
    ...overrides,
  }
}

beforeEach(() => {
  useMoneyInStore.setState({ currentView: 'receipt-voucher', statementLines: [], activeStudent: null, isSaving: false, error: null })
  useWorkspaceStore.setState({ students: [], statementLines: [], movements: [], cancelledVouchers: [], courses: [], enrollments: [], feeObligations: [], isLoading: false, loaded: false, error: null })
})

describe('saveReceiptVoucher — financial workflow guard', () => {
  it('requires an explicitly selected existing student', async () => {
    hoisted.client = makeClient(() => { throw new Error('no query should run') })
    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues({ studentId: '', allocations: [] }))
    expect(ok).toBe(false)
    expect(useMoneyInStore.getState().error).toContain('اختر الطالب')
  })

  it('requires at least one enrollment-scoped allocation', async () => {
    hoisted.client = makeClient(() => { throw new Error('no query should run') })
    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues({ allocations: [] }))
    expect(ok).toBe(false)
    expect(useMoneyInStore.getState().error).toContain('الدورة أو الرسم المستحق')
  })

  it('requires allocation totals to equal the receipt amount', async () => {
    hoisted.client = makeClient(() => { throw new Error('no query should run') })
    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues({ amountReceived: 500 }))
    expect(ok).toBe(false)
    expect(useMoneyInStore.getState().error).toContain('مجموع بنود التحصيل')
  })
})

describe('saveReceiptVoucher — allocation posting', () => {
  it('sends course + multiple fee allocations to one atomic RPC', async () => {
    seedRoster([student('s-1', 'محمد علي')])
    let rpcName = ''
    let rpcArgs: RpcPayload | null = null
    const client: MockClient = makeClient((state) => {
      if (state.table === 'students' && state.op === 'select') return { data: [{ id: 's-1', name: 'محمد علي', id_number: null, phone: null, notes: null }], error: null }
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
