import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260916116000_backfill_legacy_receipt_allocations.sql', import.meta.url),
  'utf8',
)

describe('Legacy receipt allocation backfill', () => {
  it('only backfills unambiguous receipt-to-enrollment matches', () => {
    expect(migration).toContain('count(*) over (partition by rv.id) as enrollment_matches')
    expect(migration).toContain('where enrollment_matches = 1')
    expect(migration).toContain('not exists (')
  })

  it('does not over-allocate an enrollment', () => {
    expect(migration).toContain('cumulative_paid <= course_value')
  })

  it('preserves the original receipt and creates a course allocation', () => {
    expect(migration).toContain('insert into public.receipt_allocations')
    expect(migration).toContain("select receipt_id, 'course', enrollment_id, null, amount_received")
  })
})
