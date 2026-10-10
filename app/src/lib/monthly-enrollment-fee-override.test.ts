import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20261010160000_student_monthly_fee_override.sql', import.meta.url),
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

  it('applies the override only when generating future monthly obligations', () => {
    expect(migration).toContain("'amount', coalesce(e.monthly_fee_override, v_amount)")
    expect(migration).toContain("coalesce(e.monthly_fee_override, v_amount), p_fee_category")
    expect(migration).toContain("'applies_to','future_monthly_obligations_only'")
    expect(migration).not.toMatch(/update\s+public\.(fee_obligations|receipt_vouchers|receipt_allocations|financial_movement_ledger)/i)
  })

  it('preserves the override in backup restore and validates imported values', () => {
    expect(migration).toContain('monthly_fee_override, monthly_fee_override_reason, created_at')
    expect(migration).toContain('INVALID_MONTHLY_FEE_OVERRIDE_BACKUP')
    expect(migration).toContain("nullif(src->>'monthly_fee_override', '')::numeric")
  })
})
