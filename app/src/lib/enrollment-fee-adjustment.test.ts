import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

// ADR-0078 — owner-adjustable per-enrollment registration price. File-pinned
// contract test: it asserts the migration text encodes the exact, narrow database
// guarantees the owner authorised, so the firewall exception can never silently
// widen beyond course_value or beyond the owner-only RPC.
const migration = readFileSync(
  new URL('../../supabase/migrations/20260928120000_owner_edit_enrollment_fee.sql', import.meta.url),
  'utf8',
)

describe('Owner-adjustable enrollment fee migration contract (ADR-0078)', () => {
  it('re-defines the enrollment firewall as a hardened security-definer trigger', () => {
    expect(migration).toContain('create or replace function public.enforce_enrollment_financial_firewall()')
    expect(migration).toContain('language plpgsql')
    expect(migration).toContain('security definer')
    expect(migration).toContain("set search_path = ''")
    expect(migration).toContain(
      'revoke all on function public.enforce_enrollment_financial_firewall() from public, anon, authenticated',
    )
  })

  it('keeps every enrollment identity field permanently immutable', () => {
    for (const field of ['id', 'student_id', 'course_id', 'course_name', 'created_at']) {
      expect(migration).toContain(`new.${field} is distinct from old.${field}`)
    }
    expect(migration).toContain("raise exception 'ENROLLMENT_FINANCIAL_FIELDS_IMMUTABLE'")
  })

  it('permits course_value edits ONLY under the transaction-local owner-RPC GUC', () => {
    // The exception is narrow and non-forgeable: course_value may change only when
    // app.enrollment_fee_editing = 'on', which only the owner RPC sets. NULL-safe.
    expect(migration).toContain('new.course_value is distinct from old.course_value')
    expect(migration).toContain("current_setting('app.enrollment_fee_editing', true) is distinct from 'on'")
  })

  it('still enforces the base-fee snapshot at creation time', () => {
    // Fee divergence is a post-creation owner action only; a new enrollment must
    // still be created at the course base_fee.
    expect(migration).toContain("raise exception 'ENROLLMENT_FINANCIAL_SNAPSHOT_MISMATCH'")
  })

  it('exposes an owner-only update_enrollment_fee RPC granted only to authenticated', () => {
    expect(migration).toContain('create or replace function public.update_enrollment_fee(')
    expect(migration).toContain('if not public.is_owner() then')
    expect(migration).toContain("raise exception 'OWNER_ONLY'")
    expect(migration).toContain('revoke all on function public.update_enrollment_fee(uuid, numeric, text) from public, anon')
    expect(migration).toContain('grant execute on function public.update_enrollment_fee(uuid, numeric, text) to authenticated')
  })

  it('requires a non-empty adjustment reason and a whole, bounded amount', () => {
    expect(migration).toContain("raise exception 'FEE_ADJUSTMENT_REASON_REQUIRED'")
    expect(migration).toContain("raise exception 'INVALID_FEE_AMOUNT'")
    expect(migration).toContain("raise exception 'FEE_AMOUNT_TOO_LARGE'")
    expect(migration).toContain('p_amount <> trunc(p_amount)')
  })

  it('floors the new fee at the valid collected total (course allocations, non-cancelled)', () => {
    expect(migration).toContain('from public.receipt_allocations ra')
    expect(migration).toContain('join public.receipt_vouchers rv on rv.id = ra.receipt_voucher_id')
    expect(migration).toContain('where ra.enrollment_id = p_enrollment_id')
    expect(migration).toContain('rv.cancelled_at is null')
    expect(migration).toContain('if p_amount < v_paid then')
    expect(migration).toContain("raise exception 'FEE_BELOW_COLLECTED'")
  })

  it('is atomic and concurrency-safe with receipt posting on the same enrollment key', () => {
    expect(migration).toContain("hashtextextended('enrollment:' || p_enrollment_id::text, 0)")
    expect(migration).toContain('perform pg_advisory_xact_lock(v_lock)')
    expect(migration).toContain('for update')
  })

  it('sets the firewall GUC only inside the RPC, around the single course_value UPDATE', () => {
    expect(migration).toContain("perform set_config('app.enrollment_fee_editing', 'on', true)")
    expect(migration).toContain('update public.enrollments')
    expect(migration).toContain('set course_value = p_amount')
    expect(migration).toContain("perform set_config('app.enrollment_fee_editing', 'off', true)")
  })

  it('writes an immutable audit row via the owner-guarded sink, only on real change', () => {
    expect(migration).toContain('v_changed := p_amount is distinct from v_old_fee')
    expect(migration).toContain('if v_changed then')
    expect(migration).toContain('public.record_activity_event(')
    expect(migration).toContain("'fee_adjustment'")
    expect(migration).toContain("'old_amount', v_old_fee")
    expect(migration).toContain("'new_amount', p_amount")
  })

  it('never touches receipts, allocations, fee obligations or the ledger', () => {
    // The RPC's ONLY write to financial state is enrollments.course_value. Assert on
    // the update_enrollment_fee body alone (the restore function legitimately rewrites
    // idempotency hashes elsewhere in the same migration).
    const rpcStart = migration.indexOf('create or replace function public.update_enrollment_fee(')
    const rpcEnd = migration.indexOf('revoke all on function public.update_enrollment_fee(')
    expect(rpcStart).toBeGreaterThan(-1)
    expect(rpcEnd).toBeGreaterThan(rpcStart)
    const rpcBody = migration.slice(rpcStart, rpcEnd)

    expect(rpcBody).toContain('update public.enrollments')
    for (const forbidden of [
      'update public.receipt_vouchers',
      'update public.receipt_allocations',
      'update public.fee_obligations',
      'delete from public.receipt_allocations',
      'delete from public.receipt_vouchers',
      'delete from public.fee_obligations',
    ]) {
      expect(rpcBody).not.toContain(forbidden)
    }
  })

  it('relaxes restore so an owner-adjusted fee round-trips without a base-fee match', () => {
    // Restore must accept course_value diverging from base_fee, validating only the
    // course-name identity, and must resolve the loop/alias name collision safely.
    expect(migration).toContain('create or replace function public.restore_center_data(payload jsonb, force boolean default false)')
    expect(migration).toContain('#variable_conflict use_column')
    expect(migration).toContain("if e->>'course_name' is distinct from v_course_name then")
    // The old combined course_name/course_value equality gate must be gone.
    expect(migration).not.toContain("(e->>'course_value')::numeric is distinct from v_course_value")
  })
})
