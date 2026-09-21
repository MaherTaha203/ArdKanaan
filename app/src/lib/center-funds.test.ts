import { describe, expect, it } from 'vitest'

import { financialTotals, studentLedger } from '@/lib/aggregate'
import type { Enrollment, FeeObligation, FinancialMovement, StudentStatementLine } from '@/types/domain'

// A single receipt of `amount` that carries `external` on behalf of an external party.
function receipt(amount: number, external: number): FinancialMovement {
  return { id: 'r-1', movementType: 'receipt', voucherNumber: 1, voucherDate: '2026-01-01', amount, partyName: 'طالب', context: 'رسوم', externalShare: external }
}

// --- The center-funds split (financial-reports layer only) --------------------
// Verifies that the external share is never counted as the center's money, while
// the gross figures (what physically came in) stay intact. This is the owner's
// mandated matrix: 100/0 → 100, 100/40 → 60+40, 100/100 → 0+100.
describe('financialTotals — center funds vs external share', () => {
  it('100 receipt, external 0 → center gets the whole 100', () => {
    const t = financialTotals([receipt(100, 0)])
    expect(t.totalIn).toBe(100)
    expect(t.instituteRevenue).toBe(100) // مقبوضات المركز
    expect(t.centerNet).toBe(100) // رصيد المركز
    expect(t.externalHeld).toBe(0)
  })

  it('100 receipt, external 40 → center 60, external 40, gross stays 100', () => {
    const t = financialTotals([receipt(100, 40)])
    expect(t.totalIn).toBe(100) // إجمالي ما دخل فعليًا — لم يتغيّر
    expect(t.instituteRevenue).toBe(60) // مقبوضات المركز
    expect(t.centerNet).toBe(60) // رصيد المركز (بلا مدفوعات)
    expect(t.externalHeld).toBe(40) // لصالح جهة خارجية
  })

  it('100 receipt, external 100 → center 0, external 100', () => {
    const t = financialTotals([receipt(100, 100)])
    expect(t.instituteRevenue).toBe(0)
    expect(t.centerNet).toBe(0)
    expect(t.externalHeld).toBe(100)
    expect(t.totalIn).toBe(100)
  })

  it('receipt without an external share behaves exactly as before (centerNet === net)', () => {
    const t = financialTotals([receipt(100, 0), { id: 'p', movementType: 'payment', voucherNumber: 1, voucherDate: '2026-01-02', amount: 30, partyName: null, context: 'مصروف', externalShare: 0 }])
    expect(t.net).toBe(70)
    expect(t.centerNet).toBe(70)
    expect(t.externalHeld).toBe(0)
  })

  // Note: the "external > receipt" rejection is a DATABASE guarantee, not a
  // read-model one, so it is proven at the real layer — not asserted here with a
  // Number.isFinite() proxy. See app/supabase/tests/external_share_layers.sh:
  // creating a fee with amount 100 / external 120 raises INVALID_FEE_PAYLOAD and
  // writes no row (fee_obligations CHECK external_share <= amount, and
  // post_receipt_with_allocations raises INVALID_EXTERNAL_SHARE if v_external > amount).
})

// --- Isolation / non-reversal proof ------------------------------------------
// The owner's non-negotiable: separating the external share out of the center's
// money must NOT change the student ledger. external_share is not an input to the
// student statement at all, so varying it leaves every student figure identical.
function enrollment(partial: Partial<Enrollment> & Pick<Enrollment, 'id' | 'studentId'>): Enrollment {
  return { courseId: 'c-1', courseName: 'محاسبة', courseValue: 500, createdAt: '2026-01-01T08:00:00Z', ...partial }
}

function fee(externalShare: number): FeeObligation {
  return { id: 'f-1', studentId: 's-1', enrollmentId: 'e-1', courseId: 'c-1', courseName: 'محاسبة', description: 'رسوم', amount: 100, feeCategory: 'shared', externalShare, cancelledAt: null, cancelReason: null, createdAt: '2026-01-05T08:00:00Z' }
}

function feePaymentLine(): StudentStatementLine {
  return { id: 'l-1', voucherNumber: 1, voucherDate: '2026-01-10', studentId: 's-1', studentName: 'طالب', courseName: 'رسوم', courseValue: 100, amountReceived: 100, remainingBalance: 0, entryType: 'fee', feeObligationId: 'f-1', enrollmentId: null }
}

describe('studentLedger — unaffected by external_share (non-reversal)', () => {
  it('produces an identical ledger whether external_share is 0 or 40', () => {
    const lines = [feePaymentLine()]
    const enrollments = [enrollment({ id: 'e-1', studentId: 's-1' })]

    const ledgerNoExternal = studentLedger('s-1', lines, enrollments, [fee(0)])
    const ledgerWithExternal = studentLedger('s-1', lines, enrollments, [fee(40)])

    // Every student-facing figure is byte-for-byte identical.
    expect(ledgerWithExternal).toEqual(ledgerNoExternal)
  })

  it('the student is credited the full 100 they paid, regardless of the external split', () => {
    const ledger = studentLedger('s-1', [feePaymentLine()], [enrollment({ id: 'e-1', studentId: 's-1' })], [fee(40)])
    const credit = ledger.entries.find((entry) => entry.kind === 'credit')
    expect(credit?.credit).toBe(100) // سند الطالب يبقى 100 — لا 60
    expect(ledger.totalCredit).toBe(100)
  })
})
