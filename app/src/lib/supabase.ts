import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { appEnv } from './env'

let browserClient: SupabaseClient | null = null

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
    })
  }

  return browserClient
}