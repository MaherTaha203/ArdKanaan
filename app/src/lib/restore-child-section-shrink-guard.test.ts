import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20261007130000_restore_child_section_shrink_guard.sql', import.meta.url),
  'utf8',
)

describe('R2.2 restore shrink guard', () => {
  it('rejects non-forced restores that shrink any restore section', () => {
    expect(migration).toContain("if not force and (")
    for (const expression of [
      's_in < s_cur',
      "jsonb_array_length(courses) < (select count(*) from public.courses)",
      "jsonb_array_length(enrollments) < (select count(*) from public.enrollments)",
      "jsonb_array_length(fee_obligations) < (select count(*) from public.fee_obligations)",
      'r_in < r_cur',
      "jsonb_array_length(receipt_allocations) < (select count(*) from public.receipt_allocations)",
      'p_in < p_cur',
    ]) {
      expect(migration).toContain(expression)
    }
    expect(migration).toContain("raise exception 'RESTORE_SHRINKS'")
  })
})
