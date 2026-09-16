import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260916113000_payment_posting_hardening.sql', import.meta.url),
  'utf8',
)

describe('Payment posting hardening', () => {
  it('requires the payment posting RPC for normal inserts', () => {
    expect(migration).toContain("raise exception 'PAYMENT_POSTING_RPC_REQUIRED'")
    expect(migration).toContain("current_setting('app.payment_posting', true) <> 'on'")
  })

  it('adds idempotency protection', () => {
    expect(migration).toContain('payment_vouchers_idempotency_key_uidx')
    expect(migration).toContain("raise exception 'IDEMPOTENCY_KEY_REUSE_MISMATCH'")
    expect(migration).toContain("'idempotent_replay', true")
  })

  it('freezes financial fields and requires cancellation for reversal', () => {
    expect(migration).toContain("raise exception 'FINANCIAL_FIELDS_IMMUTABLE'")
    expect(migration).toContain("raise exception 'CANCELLATION_REASON_REQUIRED'")
    expect(migration).toContain("raise exception 'PAYMENT_DELETE_FORBIDDEN'")
  })
})
