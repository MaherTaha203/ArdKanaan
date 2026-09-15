import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260915120000_fee_obligations_receipt_allocations.sql', import.meta.url),
  'utf8',
)

const hardening = readFileSync(
  new URL('../../supabase/migrations/20260915123000_fee_statement_restore_hardening.sql', import.meta.url),
  'utf8',
)

const strictReceipt = readFileSync(
  new URL('../../supabase/migrations/20260915124500_enforce_fee_obligation_receipts.sql', import.meta.url),
  'utf8',
)

describe('student fee architecture contracts', () => {
  it('creates obligations separately from receipt allocations', () => {
    expect(migration).toContain('create table if not exists public.fee_obligations')
    expect(migration).toContain('create table if not exists public.receipt_allocations')
    expect(migration).toContain('fee_obligation_id uuid')
  })

  it('supports one receipt with multiple course/fee allocations', () => {
    expect(migration).toContain('create or replace function public.post_receipt_with_allocations(payload jsonb)')
    expect(migration).toContain("raise exception 'RECEIPT_ALLOCATION_TOTAL_MISMATCH'")
    expect(migration).toContain("raise exception 'FEE_MUST_BE_SETTLED_IN_FULL'")
  })

  it('keeps external share out of institute revenue while preserving total cash', () => {
    expect(hardening).toContain("v_external := v_external + v_fee_external")
  })

  it('requires fee receipts to use allocation mode', () => {
    expect(strictReceipt).toContain('fee_category is null or allocation_mode = true')
  })

  it('restores fee obligations and receipt allocations for backup fidelity', () => {
    expect(hardening).toContain("payload->'fee_obligations'")
    expect(hardening).toContain("payload->'receipt_allocations'")
  })
})
