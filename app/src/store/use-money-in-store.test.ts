import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ReceiptVoucherFormValues } from '@/features/receipt-voucher/schema'
import type { Student } from '@/types/domain'

// A mutable client the mocked supabase module hands back on every call.
const hoisted = vi.hoisted(() => ({ client: null as unknown }))
vi.mock('@/lib/supabase', () => ({
  getSupabaseBrowserClient: () => hoisted.client,
}))

// Imported after the mock is registered.
import { useMoneyInStore } from '@/store/use-money-in-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

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

function student(id: string, name: string): Student {
  return { id, name, idNumber: null, phone: null, notes: null }
}

function seedRoster(students: Student[]) {
  useWorkspaceStore.setState({ students })
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

// Resolves the money-in flow after an existing/new student is settled: no enrollment
// yet, then the receipt insert and the statement reload.
const happyPathRespond: Respond = (state) => {
  const { table, op } = state
  if (table === 'students' && op === 'insert') {
    return { data: { id: 'new-student', name: 'خالد', id_number: null, phone: null, notes: null }, error: null }
  }
  if (table === 'enrollments' && op === 'select') return { data: [], error: null }
  if (table === 'enrollments' && op === 'insert') return { data: null, error: null }
  if (table === 'receipt_vouchers' && op === 'insert') {
    return { data: { id: 'r-1', voucher_number: 900, student_id: 'x' }, error: null }
  }
  if (table === 'student_statement_lines') return { data: [], error: null }
  throw new Error(`unexpected query on ${table}`)
}

beforeEach(() => {
  useMoneyInStore.setState({
    currentView: 'receipt-voucher',
    statementLines: [],
    activeStudent: null,
    isSaving: false,
    error: null,
  })
  seedRoster([])
})

describe('saveReceiptVoucher — student identity guard', () => {
  it('refuses to save when the typed name matches several students and none is picked', async () => {
    // Arrange: two students share the exact name; the operator did not pick one.
    seedRoster([student('s-1', 'محمد علي'), student('s-2', 'محمد علي')])
    hoisted.client = makeClient(() => {
      throw new Error('no query should run for an ambiguous name')
    })

    // Act
    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues())

    // Assert: no voucher written, a clear message, guard resolved before any I/O.
    expect(ok).toBe(false)
    expect(useMoneyInStore.getState().error).toContain('أكثر من طالب')
    expect(useMoneyInStore.getState().isSaving).toBe(false)
  })

  it('folds an orthographic variant onto the same student (no duplicate created)', async () => {
    // The roster stores "أحمد"; the operator types plain-alef "احمد".
    seedRoster([student('s-1', 'أحمد')])
    let studentInserted = false
    hoisted.client = makeClient((state) => {
      if (state.table === 'students' && state.op === 'insert') {
        studentInserted = true
        return { data: { id: 'dup', name: 'احمد', id_number: null, phone: null, notes: null }, error: null }
      }
      return happyPathRespond(state)
    })

    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues({ studentName: 'احمد' }))

    expect(ok).toBe(true)
    expect(studentInserted).toBe(false) // reused s-1, did not create a duplicate
    expect(useMoneyInStore.getState().activeStudent?.id).toBe('s-1')
  })

  it('binds to the one match and saves when the name is unique', async () => {
    seedRoster([student('s-1', 'محمد علي')])
    let receiptInserted = false
    hoisted.client = makeClient((state) => {
      if (state.table === 'receipt_vouchers' && state.op === 'insert') {
        receiptInserted = true
        return { data: { id: 'r-1', voucher_number: 900, student_id: 's-1' }, error: null }
      }
      return happyPathRespond(state)
    })

    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues())

    expect(ok).toBe(true)
    expect(receiptInserted).toBe(true)
    expect(useMoneyInStore.getState().activeStudent?.id).toBe('s-1')
    expect(useMoneyInStore.getState().currentView).toBe('student-statement')
  })

  it('creates a genuinely new student when the name matches no one', async () => {
    seedRoster([student('s-1', 'سارة')])
    let studentInserted = false
    hoisted.client = makeClient((state) => {
      if (state.table === 'students' && state.op === 'insert') {
        studentInserted = true
        return { data: { id: 'new-student', name: 'خالد', id_number: null, phone: null, notes: null }, error: null }
      }
      return happyPathRespond(state)
    })

    const ok = await useMoneyInStore.getState().saveReceiptVoucher(formValues({ studentName: 'خالد' }))

    expect(ok).toBe(true)
    expect(studentInserted).toBe(true)
    expect(useMoneyInStore.getState().activeStudent?.id).toBe('new-student')
  })

  it('reuses the enrollment fee and ignores the entered course value on a repeat course', async () => {
    seedRoster([student('s-1', 'محمد علي')])
    let insertedCourseValue: unknown
    hoisted.client = makeClient((state) => {
      const { table, op } = state
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
