import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { appEnv } from './env'

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowserClient() {
  if (!appEnv.isSupabaseConfigured) {
    console.error(appEnv.supabaseEnvErrorMessage)
    return null
  }

  if (!browserClient) {
    browserClient = createClient(appEnv.supabaseUrl, appEnv.supabaseAnonKey)
  }

  return browserClient
}