import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const feeMigration = readFileSync(
  new URL('../../supabase/migrations/20260915093000_receipt_fee_distribution.sql', import.meta.url),
  'utf8',
)
const operationMigration = readFileSync(
  new URL('../../supabase/migrations/20260916110000_financial_operation_hardening.sql', import.meta.url),
  'utf8',
)
const receiptMigration = readFileSync(
  new URL('../../supabase/migrations/20260916111000_receipt_posting_idempotency_and_split.sql', import.meta.url),
  'utf8',
)
const receiptFirewall = readFileSync(
  new URL('../../supabase/migrations/20260916100000_receipt_posting_integrity_hardening.sql', import.meta.url),
  'utf8',
)

describe('Receipt fee distribution migration contract', () => {
  it('keeps the fee snapshot columns and category constraints', () => {
    expect(feeMigration).toContain('add column if not exists fee_category text')
    expect(feeMigration).toContain('add column if not exists external_share numeric(12, 2) not null default 0')
    expect(feeMigration).toContain('receipt_vouchers_external_share_nonnegative')
    expect(feeMigration).toContain('receipt_vouchers_external_share_within_amount')
  })

  it('allows fractional derived external shares for partial payments', () => {
    expect(receiptFirewall).toContain('drop constraint if exists receipt_vouchers_external_share_whole_shekel')
    expect(receiptMigration).toContain('round(v_amount * v_fee_external / v_fee_total, 2)')
  })

  it('conserves the split per category', () => {
    expect(receiptFirewall).toContain('receipt_vouchers_fee_distribution_valid')
    expect(receiptFirewall).toContain("when fee_category is null then external_share = 0")
    expect(receiptFirewall).toContain("when fee_category = 'institute' then external_share = 0")
    expect(receiptFirewall).toContain("when fee_category = 'external' then external_share = amount_received")
    expect(receiptFirewall).toContain("when fee_category = 'shared' then external_share > 0 and external_share < amount_received")
    expect(receiptFirewall).toContain("when fee_category = 'mixed' then external_share >= 0 and external_share <= amount_received")
  })

  it('keeps fee payments separate from course balances', () => {
    expect(receiptMigration).toContain('where ra.fee_obligation_id = v_fee_id')
    expect(receiptMigration).toContain('where ra.enrollment_id = v_enrollment_id')
  })

  it('freezes fee obligations after creation and uses cancellation for reversal', () => {
    expect(operationMigration).toContain("raise exception 'FEE_OBLIGATION_FINANCIAL_FIELDS_IMMUTABLE'")
    expect(operationMigration).toContain("raise exception 'FINANCIAL_OBLIGATION_DELETE_FORBIDDEN'")
    expect(operationMigration).toContain("raise exception 'FEE_CANCELLATION_REASON_REQUIRED'")
  })

  it('preserves third-party share in the financial movements read model', () => {
    expect(feeMigration).toContain('create or replace view public.financial_movements')
    expect(feeMigration).toContain('rv.external_share as external_share')
  })
})
