import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260914184841_enrollment_financial_firewall.sql', import.meta.url),
  'utf8',
)

describe('Enrollment Financial Firewall migration contract', () => {
  it('installs a database-enforced UPDATE trigger on enrollments', () => {
    expect(migration).toContain('create or replace function public.enforce_enrollment_financial_firewall()')
    expect(migration).toContain('create trigger enrollments_financial_firewall')
    expect(migration).toContain('before update on public.enrollments')
  })

  it('freezes the enrollment financial identity and fee snapshot', () => {
    for (const field of ['id', 'student_id', 'course_name', 'course_value', 'created_at']) {
      expect(migration).toContain(`new.${field} is distinct from old.${field}`)
    }

    expect(migration).toContain("raise exception 'ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE'")
  })

  it('keeps catalog linkage outside the financial firewall', () => {
    expect(migration).not.toContain('new.course_id is distinct from old.course_id')
  })

  it('uses a hardened security-definer function', () => {
    expect(migration).toContain('language plpgsql')
    expect(migration).toContain('security definer')
    expect(migration).toContain("set search_path = ''")
    expect(migration).toContain(
      'revoke all on function public.enforce_enrollment_financial_firewall() from public, anon, authenticated',
    )
  })
})
