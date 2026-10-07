import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20261007143000_security_lifecycle_rpc_guards.sql', import.meta.url),
  'utf8',
)

describe('SEC-001 student lifecycle RPC guards', () => {
  it('uses SECURITY DEFINER and empty search_path twice', () => {
    expect(migration.split('security definer').length - 1).toBe(2)
    expect(migration.split("set search_path = ''").length - 1).toBe(2)
  })

  it('checks the owner before each mutation', () => {
    expect(migration.split('if not public.is_owner() then').length - 1).toBe(2)
    expect(migration.split("raise exception 'OWNER_ONLY'").length - 1).toBe(2)
  })

  it('restricts execution to authenticated', () => {
    expect(migration).toContain('revoke all on function public.complete_student(uuid, text) from public, anon')
    expect(migration).toContain('revoke all on function public.reactivate_student(uuid) from public, anon')
    expect(migration).toContain('grant execute on function public.complete_student(uuid, text) to authenticated')
    expect(migration).toContain('grant execute on function public.reactivate_student(uuid) to authenticated')
  })

  it('preserves the lifecycle update scope', () => {
    expect(migration).toContain("set status = 'completed'")
    expect(migration).toContain("set status = 'active'")
    expect(migration).toContain('update public.students')
    expect(migration).not.toContain('update public.receipt_vouchers')
    expect(migration).not.toContain('update public.receipt_allocations')
    expect(migration).not.toContain('update public.fee_obligations')
    expect(migration).not.toContain('update public.payment_vouchers')
  })
})
