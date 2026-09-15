import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260915093000_receipt_fee_distribution.sql', import.meta.url),
  'utf8',
)

describe('Receipt fee distribution migration contract', () => {
  it('adds the fee snapshot columns to receipt_vouchers', () => {
    expect(migration).toContain('add column if not exists fee_category text')
    expect(migration).toContain('add column if not exists external_share numeric(12, 2) not null default 0')
  })

  it('enforces whole-shekel, non-negative, within-amount external shares', () => {
    expect(migration).toContain('receipt_vouchers_external_share_whole_shekel')
    expect(migration).toContain('check (external_share = trunc(external_share))')
    expect(migration).toContain('check (external_share >= 0)')
    expect(migration).toContain('check (external_share <= amount_received)')
  })

  it('conserves the split per category (institute + external = amount)', () => {
    expect(migration).toContain('receipt_vouchers_fee_distribution_valid')
    // NULL and institute => nothing held for others; external => the whole amount;
    // shared => a strict split between the two.
    expect(migration).toContain("when fee_category is null then external_share = 0")
    expect(migration).toContain("when fee_category = 'institute' then external_share = 0")
    expect(migration).toContain("when fee_category = 'external' then external_share = amount_received")
    expect(migration).toContain("when fee_category = 'shared' then external_share > 0 and external_share < amount_received")
  })

  it('lets a fee bypass the enrolment guards but keeps everything else', () => {
    expect(migration).toContain('create or replace function public.enforce_financial_firewall()')
    // The fee short-circuit sits AFTER the cancellation-reason guard and BEFORE the
    // enrolment lookup, so fees skip ENROLLMENT_REQUIRED / COURSE_VALUE_MUST_MATCH.
    expect(migration).toContain('if new.fee_category is not null then')
    expect(migration).toContain("raise exception 'ENROLLMENT_REQUIRED'")
    expect(migration).toContain("raise exception 'COURSE_VALUE_MUST_MATCH_ENROLLMENT'")
    // A course's remaining balance never counts fee receipts.
    expect(migration).toContain('and rv.fee_category is null')
  })

  it('freezes the fee snapshot on update (immutable after posting)', () => {
    expect(migration).toContain('new.fee_category is distinct from old.fee_category')
    expect(migration).toContain('new.external_share is distinct from old.external_share')
    expect(migration).toContain("raise exception 'FINANCIAL_FIELDS_IMMUTABLE'")
  })

  it('exposes the third-party share on the financial-movements read model', () => {
    expect(migration).toContain('create or replace view public.financial_movements')
    expect(migration).toContain('rv.external_share as external_share')
  })
})
