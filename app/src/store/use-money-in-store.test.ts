import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'

// A mutable client the mocked supabase module hands back on every call.
const hoisted = vi.hoisted(() => ({ client: null as unknown }))
vi.mock('@/lib/supabase', () => ({
  getSupabaseBrowserClient: () => hoisted.client,
}))

// Imported after the mock is registered.
import { useMoneyInStore } from '@/store/use-money-in-store'

type QueryState = {
  table: string
  op: 'select' | 'insert'
  filters: Record<string, unknown>
  payload?: Record<string, unknown>
}

type Respond = (state: QueryState) => { data: unknown; error: unknown }

// A minimal chainable stand-in for the supabase query builder: every method returns
// the same builder, and awaiting it resolves to whatever `respond` computes from the
// accumulated table/op/filters. Enough to drive the store's real code paths.
function makeClient(respond: Respond) {
  return {
    from(table: string) {
      const state: QueryState = { table, op: 'select', filters: {} }
      const builder = {
        select: () => builder,
        insert: (payload: Record<string, unknown>) => {
          state.op = 'insert'
          state.payload = payload
          return builder
        },
        update: () => builder,
        eq: (col: string, val: unknown) => {
          state.filters[col] = val
          return builder
        },
        is: () => builder,
        order: () => builder,
        limit: () => builder,
        single: () => builder,
        then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
          Promise.resolve(respond(state)).then(resolve, reject),
      }
      return builder
    },
  }
}

function formValues(overrides: Partial<ReceiptVoucherFormValues> = {}): ReceiptVoucherFormValues {
  return {
    paymentDate: '2026-08-31',
    studentName: 'محمد علي',
    studentId: '',
    studentIdNumber: '',
    studentPhone: '',
    courseName: 'دورة الإنجليزية',
    courseValue: 1000,
    amountReceived: 400,
    payerName: '',
    notes: '',
    ...overrides,
  }
}

beforeEach(() => {
  useMoneyInStore.setState({
    currentView: 'receipt-voucher',
    statementLines: [],
    activeStudent: null,
    isSaving: false,
    error: null,
  })
})

describe('saveReceiptVoucher — student identity guard', () => {
  it('refuses to save when the typed name matches several students and none is picked', async () => {
    // Arrange: two students share the exact name; the operator did not pick one.
    hoisted.client = makeClient((state) => {
      if (state.table === 'students' && state.op === 'select' && state.filters.name) {
        return { data: [{ id: 's-1' }, { id: 's-2' }], error: null }
      }
      throw new Error(`unexpected query on ${state.table}`)
    })

    // Act
    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues())

    // Assert: no voucher written, a clear message, and we never reached the insert.
    expect(ok).toBe(false)
    expect(useMoneyInStore.getState().error).toContain('أكثر من طالب')
    expect(useMoneyInStore.getState().isSaving).toBe(false)
  })

  it('binds to the one match and saves when the name is unique', async () => {
    let receiptInserted = false
    hoisted.client = makeClient((state) => {
      const { table, op, filters } = state
      if (table === 'students' && op === 'select' && filters.name) {
        return { data: [{ id: 's-1', name: 'محمد علي', id_number: null, phone: null, notes: null }], error: null }
      }
      if (table === 'enrollments' && op === 'select') return { data: [], error: null }
      if (table === 'enrollments' && op === 'insert') return { data: null, error: null }
      if (table === 'receipt_vouchers' && op === 'insert') {
        receiptInserted = true
        return {
          data: {
            id: 'r-1',
            voucher_number: 900,
            voucher_date: '2026-08-31',
            student_id: 's-1',
            student_name_snapshot: 'محمد علي',
            course_name: 'دورة الإنجليزية',
            course_value: 1000,
            amount_received: 400,
            payer_name: '',
            notes: '',
          },
          error: null,
        }
      }
      if (table === 'student_statement_lines') return { data: [], error: null }
      throw new Error(`unexpected query on ${table}`)
    })

    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues())

    expect(ok).toBe(true)
    expect(receiptInserted).toBe(true)
    expect(useMoneyInStore.getState().activeStudent?.id).toBe('s-1')
    expect(useMoneyInStore.getState().currentView).toBe('student-statement')
  })

  it('reuses the enrollment fee and ignores the entered course value on a repeat course', async () => {
    let insertedCourseValue: unknown
    hoisted.client = makeClient((state) => {
      const { table, op, filters } = state
      if (table === 'students' && op === 'select' && filters.name) {
        return { data: [{ id: 's-1', name: 'محمد علي', id_number: null, phone: null, notes: null }], error: null }
      }
      // An enrollment already exists at 1000; the form entered 1500.
      if (table === 'enrollments' && op === 'select') return { data: [{ course_value: 1000 }], error: null }
      if (table === 'receipt_vouchers' && op === 'insert') {
        insertedCourseValue = state.payload?.course_value
        return { data: { id: 'r-2', voucher_number: 901, student_id: 's-1' }, error: null }
      }
      if (table === 'student_statement_lines') return { data: [], error: null }
      throw new Error(`unexpected query on ${table}`)
    })

    await useMoneyInStore.getState().saveReceiptVoucher(formValues({ courseValue: 1500 }))

    // The authoritative enrollment fee wins so the balance can never drift.
    expect(insertedCourseValue).toBe(1000)
  })
})
