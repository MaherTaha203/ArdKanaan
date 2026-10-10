import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20261010192356_student_monthly_fee_override.sql', import.meta.url),
  'utf8',
)
const recalculation = readFileSync(
  new URL('../../supabase/migrations/20261010210000_recalculate_monthly_fee_balances.sql', import.meta.url),
  'utf8',
)

describe('Per-student monthly subscription fee override', () => {
  it('stores a per-enrollment override and requires an audited owner-only RPC', () => {
    expect(migration).toContain('monthly_fee_override numeric')
    expect(migration).toContain('monthly_fee_override_reason text')
    expect(migration).toContain('public.update_monthly_enrollment_fee')
    expect(migration).toContain("if not public.is_owner() then raise exception 'OWNER_ONLY'; end if")
    expect(migration).toContain('public.record_activity_event')
    expect(migration).toContain('MONTHLY_ENROLLMENT_FEE_OVERRIDE_RPC_REQUIRED')
  })

  it('recalculates existing monthly obligations so balances and statements reflect the new price', () => {
    expect(recalculation).toContain('set amount = p_amount')
    expect(recalculation).toContain("current_setting('app.monthly_fee_obligation_editing', true)")
    expect(recalculation).toContain('MONTHLY_FEE_BELOW_ALREADY_PAID')
    expect(recalculation).toContain('MONTHLY_FEE_BELOW_EXTERNAL_SHARE')
    expect(recalculation).toContain('public.record_activity_event')
    expect(recalculation).toContain("'existing_obligations_updated', v_updated_count")
  })

  it('does not rewrite receipts, allocations, or ledger history', () => {
    expect(recalculation).not.toMatch(/update\s+public\.(receipt_vouchers|receipt_allocations|financial_movement_ledger)/i)
    expect(recalculation).toContain("and fo.fee_kind = 'monthly_course'")
    expect(recalculation).toContain('fo.cancelled_at is null')
  })

  it('preserves the override in backup restore and validates imported values', () => {
    expect(migration).toContain('monthly_fee_override, monthly_fee_override_reason, created_at')
    expect(migration).toContain('INVALID_MONTHLY_FEE_OVERRIDE_BACKUP')
    expect(migration).toContain("nullif(src->>'monthly_fee_override', '')::numeric")
  })
})
