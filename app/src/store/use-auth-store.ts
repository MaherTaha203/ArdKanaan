import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

import { recordActivityEvent } from '@/lib/activity-log'
import { getSupabaseBrowserClient } from '@/lib/supabase'

// Real authentication state, backed by Supabase Auth. The app gates on a live
// session; every data request then carries the operator's JWT, so Postgres RLS
// (authenticated-only) is the true security boundary — not the UI gate.

type AuthStore = {
  session: Session | null
  ready: boolean
  isSubmitting: boolean
  error: string | null
  // True while the operator arrived via a password-recovery link and must set a
  // new password before using the app (even though a session already exists).
  isRecovering: boolean
  init: () => void
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<boolean>
  updatePassword: (password: string) => Promise<boolean>
  clearError: () => void
}

// Guard against double subscription (React StrictMode / repeated init calls).
let subscribed = false

// Supabase appends the recovery token in the URL hash (…#type=recovery&…) when the
// operator follows the reset email. Detect it synchronously so the recovery screen
// shows without a flash of the shell.
function urlHasRecovery(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hash.includes('type=recovery')
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  ready: false,
  isSubmitting: false,
  error: null,
  isRecovering: urlHasRecovery(),
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

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        set({ session, isRecovering: true })
        return
      }
      set({ session })
    })
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
    void recordActivityEvent({
      entity: 'authentication',
      action: 'login',
      label: 'تسجيل الدخول',
      description: 'تسجيل دخول ناجح إلى النظام',
    })
    return true
  },
  signOut: async () => {
    // Record the event while the authenticated session is still available.
    void recordActivityEvent({
      entity: 'authentication',
      action: 'logout',
      label: 'تسجيل الخروج',
      description: 'تسجيل الخروج من النظام',
    })
    const supabase = getSupabaseBrowserClient()
    await supabase?.auth.signOut()
    set({ session: null, isRecovering: false })
  },
  sendPasswordReset: async (email) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.' })
      return false
    }
    set({ isSubmitting: true, error: null })
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    })
    set({ isSubmitting: false })
    if (error) {
      set({ error: 'تعذّر إرسال رابط الاستعادة.' })
      return false
    }
    return true
  },
  updatePassword: async (password) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      set({ error: 'الاتصال بقاعدة البيانات غير مهيأ بعد.' })
      return false
    }
    set({ isSubmitting: true, error: null })
    const { error } = await supabase.auth.updateUser({ password })
    set({ isSubmitting: false })
    if (error) {
      set({ error: 'تعذّر تعيين كلمة المرور.' })
      return false
    }
    void recordActivityEvent({
      entity: 'authentication',
      action: 'password_change',
      label: 'تغيير كلمة المرور',
      description: 'تغيير كلمة مرور الحساب',
    })
    // New password set; leave recovery mode and clear the recovery token from the URL.
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    set({ isRecovering: false })
    return true
  },
}))