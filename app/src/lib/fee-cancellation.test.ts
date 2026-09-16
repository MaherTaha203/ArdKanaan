import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260916121000_fee_cancellation_rpc.sql', import.meta.url),
  'utf8',
)

describe('Fee cancellation', () => {
  it('requires an explicit reason and owner authorization', () => {
    expect(migration).toContain("if not public.is_owner() then raise exception 'OWNER_ONLY'; end if")
    expect(migration).toContain("raise exception 'FEE_CANCELLATION_REASON_REQUIRED'")
  })

  it('does not cancel an obligation that already has collected money', () => {
    expect(migration).toContain('v_paid > 0')
    expect(migration).toContain("raise exception 'PAID_FEE_REQUIRES_REVERSAL_BEFORE_CANCELLATION'")
  })

  it('uses the cancellation fields instead of deleting the obligation', () => {
    expect(migration).toContain('set cancelled_at = now(), cancel_reason = btrim(p_reason)')
    expect(migration).not.toContain('delete from public.fee_obligations')
  })
})
