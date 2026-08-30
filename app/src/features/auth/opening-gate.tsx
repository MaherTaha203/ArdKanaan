import { useState } from 'react'

import { ArrowLeft } from 'lucide-react'

import { FalconFrieze } from '@/components/brand/falcon-frieze'
import { useAuthStore } from '@/store/use-auth-store'

const EMBLEM_SRC = `${import.meta.env.BASE_URL}brand/emblem.jpg`

export function OpeningGate() {
  const signIn = useAuthStore((state) => state.signIn)
  const isSubmitting = useAuthStore((state) => state.isSubmitting)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    await signIn(email, password)
    // On success the session arrives via onAuthStateChange and App swaps in the shell.
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_0.9fr]">
      {/* Brand side — airy, light, blue-tinted, led by the emblem. */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-olive-weak px-8 py-12 sm:px-12 lg:px-16 lg:py-16">
        <div className="relative">
          <img
            src={EMBLEM_SRC}
            alt="شعار أرض كنعان — شجرة الحياة الكنعانيّة"
            className="w-[clamp(168px,22vw,288px)] rounded-2xl object-cover shadow-[0_24px_50px_-24px_rgba(15,23,42,0.35)] ring-1 ring-white/70"
          />
          <div className="mt-7 text-[12px] font-bold tracking-wide text-olive">بيئة العمل المالية</div>
          <div className="editorial mt-2 text-[clamp(2.4rem,5.5vw,4rem)] text-foreground">
            أرض كنعان
          </div>
          <p className="mt-4 max-w-[38ch] text-[15px] leading-8 text-muted-foreground">
            بيئةُ عملٍ ماليةٌ مبنيّةٌ لمركزٍ تدريبيّ — لا لوحةُ إدارة، بل مساحةٌ تُدار منها الحركةُ
            المالية كلها بوضوح.
          </p>
          <FalconFrieze color="#8a5a3c" height={20} className="mt-6 max-w-[300px] opacity-80" />
        </div>
        <div className="relative mt-10 border-t border-border pt-7 text-[12.5px] leading-6 text-muted-foreground">
          مركزٌ واحد · مشغّلٌ واحد · دخولٌ مؤمَّن عبر Supabase.
        </div>
      </section>

      {/* Form side — real sign-in. */}
      <section className="flex flex-col justify-center gap-5 bg-panel px-8 py-12 sm:px-12 lg:px-16">
        <div className="text-[12px] font-bold tracking-wide text-olive">الدخول إلى مساحة العمل</div>
        <h1 className="editorial text-3xl text-foreground">أهلًا بعودتك</h1>
        <p className="max-w-[38ch] text-[14px] leading-7 text-muted-foreground">
          ادخل ببريد المشغّل وكلمة المرور لمتابعة دفتر المركز.
        </p>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay"
          >
            {error}
          </div>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-muted-foreground">
              بريد المشغّل
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) clearError()
              }}
              placeholder="name@example.com"
              className="figure h-12 w-full rounded-xl border border-border-strong bg-panel px-4 text-[15px] text-foreground outline-none transition placeholder:text-faint focus:border-olive focus:ring-2 focus:ring-olive/20"
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-muted-foreground">
              كلمة المرور
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (error) clearError()
              }}
              className="h-12 w-full rounded-xl border border-border-strong bg-panel px-4 text-[15px] text-foreground outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-olive px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-olive-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'جارٍ الدخول…' : 'ادخل إلى مساحة العمل'}
            <ArrowLeft className="size-4" />
          </button>
        </form>

        <p className="text-[11px] text-faint">
          دخولٌ مؤمَّن بمصادقة حقيقيّة وسياسات وصولٍ على مستوى الصفوف (RLS).
        </p>
      </section>
    </div>
  )
}
