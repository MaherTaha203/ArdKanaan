import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260919130000_allow_standalone_fee_obligations.sql', import.meta.url),
  'utf8',
)

describe('Standalone fee obligations migration (ADR-0077)', () => {
  it('makes the course/enrollment context optional', () => {
    expect(migration).toContain('alter column enrollment_id drop not null')
    expect(migration).toContain('alter column course_name drop not null')
  })

  it('drops the mandatory enrollment requirement from create_fee_obligations', () => {
    expect(migration).toContain('create or replace function public.create_fee_obligations(payload jsonb)')
    expect(migration).not.toContain("raise exception 'ENROLLMENT_REQUIRED_FOR_SELECTED_STUDENTS'")
  })

  it('still validates a named course exists when a course is supplied', () => {
    expect(migration).toContain("raise exception 'COURSE_NOT_FOUND'")
  })

  it('allows a standalone obligation (no course, no enrollment) in the resolve trigger', () => {
    expect(migration).toContain('if new.course_id is null and new.enrollment_id is null then')
    expect(migration).toContain('return new;')
  })

  it('never invents a missing enrollment, but validates any linked one', () => {
    expect(migration).not.toContain("raise exception 'ENROLLMENT_REQUIRED_FOR_FEE_OBLIGATION'")
    expect(migration).toContain("raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH'")
  })

  it('preserves the financial-identity firewall (immutability + no delete assumptions)', () => {
    // Obligations stay immutable after creation and the restore bypass is kept.
    expect(migration).toContain("raise exception 'FEE_OBLIGATION_FINANCIAL_FIELDS_IMMUTABLE'")
    expect(migration).toContain("current_setting('app.restoring', true) = 'on'")
  })

  it('runs the security-definer functions with a hardened empty search_path', () => {
    expect(migration.match(/security definer/g)?.length).toBe(3)
    expect(migration.match(/set search_path = ''/g)?.length).toBe(3)
  })

  it('keeps owner-only authorization and the authenticated-only grant', () => {
    expect(migration).toContain("raise exception 'OWNER_ONLY'")
    expect(migration).toContain('grant execute on function public.create_fee_obligations(jsonb) to authenticated')
    expect(migration).toContain('revoke all on function public.create_fee_obligations(jsonb) from public, anon')
  })

  it('never writes to a cash/ledger table — obligations move no money', () => {
    for (const table of ['receipt_vouchers', 'receipt_allocations', 'payment_vouchers', 'financial_movement_ledger']) {
      const dml = new RegExp(`(insert\\s+into|update|delete\\s+from)\\s+public\\.${table}`, 'i')
      expect(migration).not.toMatch(dml)
    }
  })
})
