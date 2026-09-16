import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  new URL('../../supabase/migrations/20260916117000_security_advisor_cleanup.sql', import.meta.url),
  'utf8',
)

describe('Security advisor cleanup', () => {
  it('makes active_students security-invoker', () => {
    expect(migration).toContain('alter view public.active_students set (security_invoker = true)')
  })

  it('removes public RPC access to internal helpers', () => {
    expect(migration).toContain('revoke all on function public.resolve_fee_obligation_enrollment() from public, anon, authenticated')
    expect(migration).toContain('revoke all on function public.is_owner() from public, anon, authenticated')
  })
})
