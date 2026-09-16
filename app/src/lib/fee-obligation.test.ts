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
const finalReceipt = readFileSync(
  new URL('../../supabase/migrations/20260916111000_receipt_posting_idempotency_and_split.sql', import.meta.url),
  'utf8',
)
const receiptFirewall = readFileSync(
  new URL('../../supabase/migrations/20260916100000_receipt_posting_integrity_hardening.sql', import.meta.url),
  'utf8',
)
const finalFeeLifecycle = readFileSync(
  new URL('../../supabase/migrations/20260916110000_financial_operation_hardening.sql', import.meta.url),
  'utf8',
)

describe('student fee architecture contracts', () => {
  it('creates obligations separately from receipt allocations', () => {
    expect(migration).toContain('create table if not exists public.fee_obligations')
    expect(migration).toContain('create table if not exists public.receipt_allocations')
    expect(migration).toContain('fee_obligation_id uuid')
  })

  it('supports one receipt with multiple course/fee allocations', () => {
    expect(finalReceipt).toContain('create or replace function public.post_receipt_with_allocations(payload jsonb)')
    expect(finalReceipt).toContain("raise exception 'RECEIPT_ALLOCATION_TOTAL_MISMATCH'")
    expect(finalReceipt).toContain("raise exception 'DUPLICATE_FEE_ALLOCATION'")
  })

  it('allows partial and repeated fee payments without allowing overpayment', () => {
    expect(finalReceipt).toContain('v_fee_total - v_fee_paid')
    expect(finalReceipt).toContain("raise exception 'FEE_ALLOCATION_EXCEEDS_REMAINING_BALANCE'")
    expect(finalReceipt).not.toContain("raise exception 'FEE_MUST_BE_SETTLED_IN_FULL'")
  })

  it('keeps external share out of institute revenue while preserving total cash', () => {
    expect(migration).toContain('external_share')
    expect(hardening).toContain('external_share')
    expect(finalReceipt).toContain('v_allocation_external')
    expect(finalReceipt).toContain('v_external := v_external + v_allocation_external')
  })

  it('requires fee receipts to use allocation mode', () => {
    expect(strictReceipt).toContain('fee_category is null or allocation_mode = true')
    expect(receiptFirewall).toContain("raise exception 'RECEIPT_POSTING_RPC_REQUIRED'")
  })

  it('freezes the fee obligation financial identity after creation', () => {
    expect(finalFeeLifecycle).toContain("raise exception 'FEE_OBLIGATION_FINANCIAL_FIELDS_IMMUTABLE'")
    expect(finalFeeLifecycle).toContain("raise exception 'FINANCIAL_OBLIGATION_DELETE_FORBIDDEN'")
  })

  it('restores fee obligations and receipt allocations for backup fidelity', () => {
    expect(hardening).toContain("payload->'fee_obligations'")
    expect(hardening).toContain("payload->'receipt_allocations'")
  })
})
