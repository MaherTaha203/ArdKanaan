import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20261009150000_monthly_course_fee_obligations.sql', import.meta.url),
  'utf8',
)

describe('Monthly course fee migration (ADR-0080)', () => {
  it('separates obligation kind from recipient category and snapshots the month', () => {
    expect(migration).toContain("fee_kind text not null default 'additional'")
    expect(migration).toContain('due_month date')
    expect(migration).toContain("fee_kind = 'monthly_course'")
    expect(migration).toContain("fee_category, external_share, fee_kind, due_month")
  })

  it('prevents duplicate month obligations at the database boundary', () => {
    expect(migration).toContain('fee_obligations_monthly_enrollment_month_unique')
    expect(migration).toContain('on conflict (enrollment_id, due_month) where fee_kind = \'monthly_course\' do nothing')
  })

  it('keeps generation owner-only and exposes read-only preview separately', () => {
    expect(migration).toContain('public.preview_monthly_course_obligations')
    expect(migration).toContain('public.create_monthly_course_obligations')
    expect(migration).toContain("if not public.is_owner() then raise exception 'OWNER_ONLY'; end if")
  })

  it('does not eagerly update historical enrollment or receipt rows', () => {
    expect(migration).toContain("values (p_student_id, p_course_id, v_course_name, 0, 'monthly')")
    expect(migration).toContain("add column if not exists billing_model text not null default 'legacy_total'")
    expect(migration).toContain("coalesce(nullif(src->>'billing_model', ''), 'legacy_total')")
    expect(migration).toContain('INVALID_ENROLLMENT_BILLING_MODEL_BACKUP')
    expect(migration).not.toMatch(/update\s+public\.(enrollments|receipt_allocations|financial_movement_ledger)/i)
    expect(migration).toContain("current_setting('app.restoring', true) = 'on'")
    expect(migration).toContain("coalesce(nullif(src->>'fee_kind', ''), 'additional')")
  })

  it('preserves month identity across backup and restore while supporting old backups', () => {
    expect(migration).toContain("coalesce(e->>'fee_kind', 'additional')")
    expect(migration).toContain("nullif(src->>'due_month', '')::date")
    expect(migration).toContain('INVALID_MONTHLY_COURSE_FEE_BACKUP')
  })
})
