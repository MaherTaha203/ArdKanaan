import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260916114000_financial_ledger.sql', import.meta.url),
  'utf8',
)
const cleanupMigration = readFileSync(
  new URL('../../supabase/migrations/20260916115000_financial_ledger_append_only_cleanup.sql', import.meta.url),
  'utf8',
)
const hardLockMigration = readFileSync(
  new URL('../../supabase/migrations/20260916123000_financial_ledger_hard_lock.sql', import.meta.url),
  'utf8',
)
const restoreConsistencyMigration = readFileSync(
  new URL('../../supabase/migrations/20260916131000_restore_ledger_consistency.sql', import.meta.url),
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
    expect(cleanupMigration).toContain('record_receipt_cancellation_ledger')
    expect(cleanupMigration).toContain('record_payment_cancellation_ledger')
    expect(cleanupMigration).toContain("'reversal'")
    expect(cleanupMigration).toContain('reversal_of')
    expect(cleanupMigration).not.toContain('set reversed_at =')
  })

  it('enforces append-only behavior at the database boundary', () => {
    expect(hardLockMigration).toContain('before update or delete on public.financial_movement_ledger')
    expect(hardLockMigration).toContain("raise exception 'FINANCIAL_LEDGER_APPEND_ONLY'")
  })

  it('keeps restore as the only controlled ledger replacement path', () => {
    expect(restoreConsistencyMigration).toContain("current_setting('app.restoring', true) = 'on'")
    expect(restoreConsistencyMigration).toContain('purge_receipt_ledger_on_restore')
    expect(restoreConsistencyMigration).toContain('purge_payment_ledger_on_restore')
    expect(restoreConsistencyMigration).toContain('before delete on public.receipt_vouchers')
    expect(restoreConsistencyMigration).toContain('before delete on public.payment_vouchers')
  })

  it('keeps the application-facing movements view stable', () => {
    expect(cleanupMigration).toContain('create view public.financial_movements')
    expect(cleanupMigration).toContain("where l.entry_kind = 'original'")
    expect(cleanupMigration).toContain("r.entry_kind = 'reversal'")
    expect(cleanupMigration).toContain('l.source_id as id')
    expect(cleanupMigration).toContain('l.source_type::text as movement_type')
  })

  it('backfills existing receipts and payments', () => {
    expect(migration).toContain("select 'receipt', rv.id, 'original'")
    expect(migration).toContain("select 'payment', pv.id, 'original'")
    expect(migration).toContain("where rv.cancelled_at is not null")
    expect(migration).toContain("where pv.cancelled_at is not null")
  })
})
