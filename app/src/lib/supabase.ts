import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { appEnv } from './env'

let browserClient: SupabaseClient | null = null

function getDeviceId() {
  if (typeof window === 'undefined') return 'server'

  const key = 'ard-kanaan-device-id'
  try {
    const existing = window.localStorage.getItem(key)
    if (existing) return existing

    const generated = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(key, generated)
    return generated
  } catch {
    return 'browser-unknown'
  }
}

function getTimezone() {
  if (typeof Intl === 'undefined') return 'unknown'
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
  } catch {
    return 'unknown'
  }
}

export function getSupabaseBrowserClient() {
  if (!appEnv.isSupabaseConfigured) {
    console.error(appEnv.supabaseEnvErrorMessage)
    return null
  }

  if (!browserClient) {
    browserClient = createClient(appEnv.supabaseUrl, appEnv.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Must be true so the password-recovery link is consumed from the URL and
        // the PASSWORD_RECOVERY event fires (the recovery screen depends on it).
        // Default (implicit) flow puts the recovery token in the URL hash, which
        // matches urlHasRecovery()'s hash check in use-auth-store.
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-ardkanaan-device-id': getDeviceId(),
          'x-ardkanaan-timezone': getTimezone(),
        },
      },
    })
  }

  return browserClient
}