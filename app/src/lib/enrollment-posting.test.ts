import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260916120000_enrollment_posting_rpc.sql', import.meta.url),
  'utf8',
)

describe('Enrollment posting', () => {
  it('resolves the financial snapshot from the course catalog', () => {
    expect(migration).toContain('select c.name, c.base_fee')
    expect(migration).toContain('insert into public.enrollments')
    expect(migration).toContain('v_course_name, v_course_value')
  })

  it('enforces the student-course identity server-side', () => {
    expect(migration).toContain("raise exception 'ENROLLMENT_ALREADY_EXISTS'")
    expect(migration).toContain("if not public.is_owner() then raise exception 'OWNER_ONLY'; end if")
  })

  it('removes direct authenticated writes to financial identity tables', () => {
    expect(migration).toContain('revoke insert, update on public.enrollments from authenticated')
    expect(migration).toContain('revoke insert on public.fee_obligations from authenticated')
    expect(migration).toContain('revoke insert on public.receipt_vouchers from authenticated')
    expect(migration).toContain('revoke insert on public.payment_vouchers from authenticated')
  })
})
