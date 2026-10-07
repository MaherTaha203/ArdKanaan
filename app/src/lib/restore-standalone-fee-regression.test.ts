import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260929132249_restore_financial_validation_hardening.sql', import.meta.url),
  'utf8',
)

describe('R2.2 restore compatibility contract', () => {
  it('accepts student-only and course-only fee obligations during restore validation', () => {
    expect(migration).toContain('Fee obligations are student-anchored; course/enrollment context is optional.')
    expect(migration).toContain("elsif v_course is not null then")
    expect(migration).toContain("elsif nullif(e->>'course_name', '') is not null then")
  })

  it('requires every restore section to be an array', () => {
    for (const key of ['students', 'courses', 'enrollments', 'fee_obligations', 'receipt_vouchers', 'receipt_allocations', 'payment_vouchers']) {
      expect(migration).toContain(`jsonb_typeof(payload->'${key}') is distinct from 'array'`)
    }
  })
})
