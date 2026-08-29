import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

import { getSupabaseBrowserClient } from '@/lib/supabase'

// Real authentication state, backed by Supabase Auth. The app gates on a live
// session; every data request then carries the operator's JWT, so Postgres RLS
// (authenticated-only) is the true security boundary — not the UI gate.

type AuthStore = {
  session: Session | null
  ready: boolean
  isSubmitting: boolean
  error: string | null
  init: () => void
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
}

// Guard against double subscription (React StrictMode / repeated init calls).
let subscribed = false

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  ready: false,
  isSubmitting: false,
  error: null,
  clearError: () => set({ error: null }),
  init: () => {
    if (subscribed) return
    subscribed = true

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ ready: true })
      return
    }

    void supabase.auth
      .getSession()
      .then(({ data }) => set({ session: data.session, ready: true }))
      .catch(() => set({ ready: true }))

    supabase.auth.onAuthStateChange((_event, session) => set({ session }))
  },
  signIn: async (email, password) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.' })
      return false
    }

    set({ isSubmitting: true, error: null })
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      set({ isSubmitting: false, error: 'تعذّر الدخول — تحقّق من البريد وكلمة المرور.' })
      return false
    }

    // The session arrives via onAuthStateChange; nothing else to set here.
    set({ isSubmitting: false })
    return true
  },
  signOut: async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase?.auth.signOut()
    set({ session: null })
  },
}))
