import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260916100000_receipt_posting_integrity_hardening.sql', import.meta.url),
  'utf8',
)

describe('Receipt posting integrity hardening', () => {
  it('forbids direct receipt inserts outside the atomic posting RPC', () => {
    expect(migration).toContain("raise exception 'RECEIPT_POSTING_RPC_REQUIRED'")
    expect(migration).toContain("current_setting('app.receipt_posting', true) <> 'on'")
  })

  it('allows mixed receipts', () => {
    expect(migration).toContain("when fee_category = 'mixed' then external_share > 0 and external_share < amount_received")
    expect(migration).toContain("v_fee_category := 'mixed'")
  })

  it('allows partial and repeated fee payments', () => {
    expect(migration).toContain("if v_amount > (v_fee_total - v_fee_paid) then")
    expect(migration).toContain("raise exception 'FEE_ALLOCATION_EXCEEDS_REMAINING_BALANCE'")
    expect(migration).not.toContain("raise exception 'FEE_MUST_BE_SETTLED_IN_FULL'")
  })

  it('calculates third-party share from the amount actually paid', () => {
    expect(migration).toContain('round(v_amount * v_fee_external / v_fee_total, 2)')
    expect(migration).toContain('v_external := v_external +')
  })

  it('keeps fee identity bound to enrollment on insert and update', () => {
    expect(migration).toContain('create or replace function public.enforce_fee_obligation_financial_identity()')
    expect(migration).toContain("raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH'")
    expect(migration).toContain('before insert or update on public.fee_obligations')
  })

  it('keeps course overpayment protection allocation-scoped', () => {
    expect(migration).toContain("raise exception 'COURSE_ALLOCATION_EXCEEDS_REMAINING_BALANCE'")
    expect(migration).toContain('where ra.enrollment_id = v_enrollment_id')
  })
})
