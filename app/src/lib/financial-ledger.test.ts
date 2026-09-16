import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260916114000_financial_ledger.sql', import.meta.url),
  'utf8',
)

describe('Financial ledger', () => {
  it('creates an append-only ledger with source identity', () => {
    expect(migration).toContain('create table if not exists public.financial_movement_ledger')
    expect(migration).toContain("source_type text not null check (source_type in ('receipt', 'payment'))")
    expect(migration).toContain("entry_kind text not null check (entry_kind in ('original', 'reversal'))")
    expect(migration).toContain('unique (source_type, source_id, entry_kind)')
    expect(migration).toContain('No UPDATE/DELETE policies are intentionally provided')
  })

  it('records reversals instead of deleting financial history', () => {
    expect(migration).toContain('record_receipt_cancellation_ledger')
    expect(migration).toContain('record_payment_cancellation_ledger')
    expect(migration).toContain("entry_kind, amount, external_share, voucher_number")
    expect(migration).toContain("'reversal'")
    expect(migration).toContain('reversal_of')
  })

  it('keeps the application-facing movements view stable', () => {
    expect(migration).toContain('create view public.financial_movements')
    expect(migration).toContain("where l.entry_kind = 'original'")
    expect(migration).toContain('and l.reversed_at is null')
    expect(migration).toContain('l.source_id as id')
    expect(migration).toContain('l.source_type::text as movement_type')
  })

  it('backfills existing receipts and payments', () => {
    expect(migration).toContain("select 'receipt', rv.id, 'original'")
    expect(migration).toContain("select 'payment', pv.id, 'original'")
    expect(migration).toContain("where rv.cancelled_at is not null")
    expect(migration).toContain("where pv.cancelled_at is not null")
  })
})
