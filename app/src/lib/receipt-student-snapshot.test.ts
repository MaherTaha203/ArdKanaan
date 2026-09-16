import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260916118000_receipt_student_snapshot_hardening.sql', import.meta.url),
  'utf8',
)

describe('Receipt student snapshot integrity', () => {
  it('binds the receipt snapshot to the canonical student name', () => {
    expect(migration).toContain('enforce_receipt_student_snapshot')
    expect(migration).toContain("raise exception 'STUDENT_NOT_FOUND'")
    expect(migration).toContain("raise exception 'STUDENT_NAME_SNAPSHOT_MISMATCH'")
  })

  it('does not expose the trigger helper as an RPC', () => {
    expect(migration).toContain('revoke all on function public.enforce_receipt_student_snapshot() from public, anon, authenticated')
  })
})
