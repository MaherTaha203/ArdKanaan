import { useEffect, useMemo, useState } from 'react'

import { ArrowLeft } from 'lucide-react'

import { formatNumber } from '@/lib/format'
import { financialTotals } from '@/lib/aggregate'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

function FootStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[11px] font-medium tracking-wide text-muted-foreground">{label}</div>
      <div className="figure mt-1 text-2xl font-semibold text-foreground">{formatNumber(value)}</div>
    </div>
  )
}

export function OpeningGate() {
  const enter = useShellStore((state) => state.enter)
  const load = useWorkspaceStore((state) => state.load)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const movements = useWorkspaceStore((state) => state.movements)

  const [password, setPassword] = useState('demo')

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  const totals = useMemo(() => financialTotals(movements), [movements])

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_0.9fr]">
      {/* Brand side — airy, light, blue-tinted. */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-olive-weak px-8 py-12 sm:px-12 lg:px-16 lg:py-16">
        <div className="relative">
          <div className="text-[12px] font-bold tracking-wide text-olive">بيئة العمل المالية</div>
          <div className="editorial mt-4 text-[clamp(2.6rem,6vw,4.4rem)] text-foreground">
            أرض كنعان
          </div>
          <p className="mt-4 max-w-[38ch] text-[15px] leading-8 text-muted-foreground">
            بيئةُ عملٍ ماليةٌ مبنيّةٌ لمركزٍ تدريبيّ — لا لوحةُ إدارة، بل مساحةٌ تُدار منها الحركةُ
            المالية كلها بوضوح.
          </p>
        </div>
        <div className="relative mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-border pt-7">
          <FootStat label="الوارد" value={totals.totalIn} />
          <FootStat label="الصادر" value={totals.totalOut} />
          <FootStat label="الموقف" value={totals.net} />
        </div>
      </section>

      {/* Form side — white, clean. */}
      <section className="flex flex-col justify-center gap-5 bg-panel px-8 py-12 sm:px-12 lg:px-16">
        <div className="text-[12px] font-bold tracking-wide text-olive">الدخول إلى مساحة العمل</div>
        <h1 className="editorial text-3xl text-foreground">أهلًا بعودتك</h1>
        <p className="max-w-[38ch] text-[14px] leading-7 text-muted-foreground">
          مركزٌ واحد، مشغّلٌ واحد. ادخل لتتابع دفتر المركز.
        </p>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            enter()
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-muted-foreground">المشغّل</span>
            <input
              value="أمين المركز"
              readOnly
              className="h-12 w-full rounded-xl border border-border-strong bg-panel px-4 text-[15px] text-foreground outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-muted-foreground">كلمة المرور</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-xl border border-border-strong bg-panel px-4 text-[15px] text-foreground outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
            />
          </label>

          <button
            type="submit"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-olive px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-olive-ink"
          >
            ادخل إلى مساحة العمل
            <ArrowLeft className="size-4" />
          </button>
        </form>

        <p className="text-[11px] text-faint">
          عرض بصري فقط — لم تُفعَّل مصادقة حقيقية في هذه المرحلة.
        </p>
      </section>
    </div>
  )
}
