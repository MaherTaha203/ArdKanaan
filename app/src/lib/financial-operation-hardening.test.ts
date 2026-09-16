import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const feeDistributionMigration = readFileSync(
  new URL('../../supabase/migrations/20260915093000_receipt_fee_distribution.sql', import.meta.url),
  'utf8',
)
const operationMigration = readFileSync(
  new URL('../../supabase/migrations/20260916110000_financial_operation_hardening.sql', import.meta.url),
  'utf8',
)
const receiptIntegrityMigration = readFileSync(
  new URL('../../supabase/migrations/20260916100000_receipt_posting_integrity_hardening.sql', import.meta.url),
  'utf8',
)
const receiptMigration = readFileSync(
  new URL('../../supabase/migrations/20260916111000_receipt_posting_idempotency_and_split.sql', import.meta.url),
  'utf8',
)
const enrollmentMigration = readFileSync(
  new URL('../../supabase/migrations/20260916112000_enrollment_identity_insert_delete_hardening.sql', import.meta.url),
  'utf8',
)

describe('Financial operation hardening', () => {
  it('allows fractional derived external shares on receipts', () => {
    expect(feeDistributionMigration).toContain('add column if not exists external_share numeric(12, 2) not null default 0')
    expect(operationMigration).toContain('drop constraint if exists receipt_vouchers_external_share_whole_shekel')
  })

  it('stores the external split at allocation level', () => {
    expect(operationMigration).toContain('receipt_allocations_external_share_nonnegative')
    expect(operationMigration).toContain('receipt_allocations_external_share_within_amount')
    expect(operationMigration).toContain('receipt_allocations_external_share_course_zero')
  })

  it('freezes fee obligations and requires cancellation instead of editing', () => {
    expect(operationMigration).toContain("raise exception 'FEE_OBLIGATION_FINANCIAL_FIELDS_IMMUTABLE'")
    expect(operationMigration).toContain("raise exception 'FINANCIAL_OBLIGATION_DELETE_FORBIDDEN'")
    expect(operationMigration).toContain("raise exception 'FEE_CANCELLATION_REASON_REQUIRED'")
  })

  it('creates fees from the existing enrollment identity', () => {
    expect(operationMigration).toContain('create or replace function public.create_fee_obligations(payload jsonb)')
    expect(operationMigration).toContain("raise exception 'ENROLLMENT_REQUIRED_FOR_SELECTED_STUDENTS'")
    expect(operationMigration).toContain('insert into public.fee_obligations')
    expect(operationMigration).toContain('enrollment_id, course_id, course_name')
  })

  it('makes receipt posting idempotent', () => {
    expect(operationMigration).toContain('add column if not exists idempotency_key uuid')
    expect(operationMigration).toContain('receipt_vouchers_idempotency_key_uidx')
    expect(receiptMigration).toContain("raise exception 'IDEMPOTENCY_KEY_REUSE_MISMATCH'")
    expect(receiptMigration).toContain("'idempotent_replay', true")
  })

  it('prevents duplicate allocation targets in one receipt', () => {
    expect(receiptMigration).toContain("raise exception 'DUPLICATE_ENROLLMENT_ALLOCATION'")
    expect(receiptMigration).toContain("raise exception 'DUPLICATE_FEE_ALLOCATION'")
  })

  it('preserves exact fee external share across partial payments', () => {
    expect(receiptMigration).toContain('v_prior_external')
    expect(receiptMigration).toContain('v_remaining_external')
    expect(receiptMigration).toContain('v_amount = (v_fee_total - v_fee_paid)')
    expect(receiptMigration).toContain('v_fee_external - v_prior_external')
    expect(receiptMigration).toContain('round(v_amount * v_fee_external / v_fee_total, 2)')
  })

  it('freezes receipt allocations and prevents hard deletion of receipts', () => {
    expect(operationMigration).toContain("raise exception 'RECEIPT_ALLOCATION_IMMUTABLE'")
    expect(operationMigration).toContain("raise exception 'RECEIPT_DELETE_FORBIDDEN'")
  })

  it('enforces the enrollment financial snapshot at creation time', () => {
    expect(enrollmentMigration).toContain('before insert or update on public.enrollments')
    expect(enrollmentMigration).toContain("raise exception 'ENROLLMENT_FINANCIAL_SNAPSHOT_MISMATCH'")
    expect(enrollmentMigration).toContain("raise exception 'ENROLLMENT_DELETE_FORBIDDEN'")
  })
})
