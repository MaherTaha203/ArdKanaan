import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260915133000_receipt_allocation_duplicate_guard.sql', import.meta.url),
  'utf8',
)

describe('Receipt allocation integrity migration contract', () => {
  it('prevents the same receipt from allocating the same target more than once', () => {
    expect(migration).toContain('create unique index if not exists receipt_allocations_receipt_target_unique')
    expect(migration).toContain('receipt_voucher_id')
    expect(migration).toContain('allocation_type')
    expect(migration).toContain('coalesce(enrollment_id')
    expect(migration).toContain('coalesce(fee_obligation_id')
  })
})
