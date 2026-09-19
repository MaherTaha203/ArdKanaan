import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260919120000_student_archive_lifecycle.sql', import.meta.url),
  'utf8',
)

describe('Student archive lifecycle migration (ADR-0076)', () => {
  it('adds the archive metadata columns additively', () => {
    expect(migration).toContain('add column if not exists archived_at timestamptz')
    expect(migration).toContain('add column if not exists archive_reason text')
  })

  it('widens the status domain to include archived (keeping active and completed)', () => {
    expect(migration).toContain("check (status = any (array['active', 'completed', 'archived']))")
  })

  it('defines dedicated archive_student and unarchive_student functions', () => {
    expect(migration).toContain('function public.archive_student(p_student_id uuid, p_reason text')
    expect(migration).toContain('function public.unarchive_student(p_student_id uuid)')
  })

  it('does not modify complete_student or reactivate_student', () => {
    expect(migration).not.toContain('function public.complete_student')
    expect(migration).not.toContain('function public.reactivate_student')
  })

  it('enforces owner-only authorization inside the functions', () => {
    expect(migration).toContain('if not public.is_owner() then')
    expect(migration).toContain("raise exception 'not_authorized'")
  })

  it('blocks archiving a student who has an active course', () => {
    expect(migration).toContain("where e.student_id = p_student_id and c.status = 'active'")
    expect(migration).toContain("raise exception 'student_has_active_course'")
  })

  it('runs as SECURITY DEFINER with a hardened empty search_path', () => {
    expect(migration.match(/security definer/g)?.length).toBe(2)
    expect(migration.match(/set search_path = ''/g)?.length).toBe(2)
  })

  it('grants execute to authenticated and revokes from anon/public', () => {
    expect(migration).toContain('revoke all on function public.archive_student(uuid, text) from public, anon')
    expect(migration).toContain('grant execute on function public.archive_student(uuid, text) to authenticated')
    expect(migration).toContain('revoke all on function public.unarchive_student(uuid) from public, anon')
    expect(migration).toContain('grant execute on function public.unarchive_student(uuid) to authenticated')
  })

  it('never writes to a financial table (financial firewall — zero impact)', () => {
    // The migration may NAME financial tables in its comments (to say it leaves
    // them alone); what matters is that it issues no DML/DDL against them.
    for (const table of ['receipt_vouchers', 'receipt_allocations', 'fee_obligations', 'payment_vouchers', 'financial_movement_ledger']) {
      const dml = new RegExp(`(insert\\s+into|update|delete\\s+from|alter\\s+table|drop\\s+table|truncate)\\s+public\\.${table}`, 'i')
      expect(migration).not.toMatch(dml)
    }
  })

  it('only ever writes the three lifecycle columns on students', () => {
    // The single UPDATE in archive/unarchive sets status/archived_at/archive_reason only.
    expect(migration).toContain("set status = 'archived'")
    expect(migration).toContain("set status = 'active'")
    // The only statements touching public.students are the lifecycle DDL/UPDATEs.
    const financialUpdate = /update\s+public\.(receipt_vouchers|receipt_allocations|fee_obligations|payment_vouchers|financial_movement_ledger)/i
    expect(migration).not.toMatch(financialUpdate)
  })
})
