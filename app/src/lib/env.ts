import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
})

const parsedEnv = envSchema.safeParse(import.meta.env)

const supabaseUrl = parsedEnv.success ? parsedEnv.data.VITE_SUPABASE_URL ?? '' : ''
const supabaseAnonKey = parsedEnv.success
  ? parsedEnv.data.VITE_SUPABASE_ANON_KEY ?? ''
  : ''

const envErrorMessage = parsedEnv.success
  ? !supabaseUrl || !supabaseAnonKey
    ? 'Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to app/.env.local before using the shared Supabase client.'
    : null
  : 'Supabase environment variables are invalid. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in app/.env.local.'

export const appEnv = {
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  supabaseEnvErrorMessage: envErrorMessage,
}