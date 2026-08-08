import { useEffect, useMemo, useState } from 'react'

import { ArrowLeft } from 'lucide-react'

import { formatNumber } from '@/lib/format'
import { financialTotals } from '@/lib/aggregate'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

function FootStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[11px] tracking-[0.14em] text-[#b9c2ad]">{label}</div>
      <div className="editorial figure mt-0.5 text-2xl text-[#f2efe4]">{formatNumber(value)}</div>
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
    <div className="grid min-h-screen bg-highlight lg:grid-cols-[1.2fr_0.8fr]">
      <section className="relative flex flex-col justify-between overflow-hidden bg-olive px-8 py-12 text-[#f2efe4] sm:px-12 lg:px-16 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[30%] end-[-10%] h-[70%] w-3/5 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(173,126,39,0.35), transparent 65%)' }}
        />
        <div className="relative">
          <div className="editorial text-[clamp(2.6rem,6vw,4.4rem)] leading-none">أرض كنعان</div>
          <p className="mt-3 max-w-[34ch] text-[#cfd6c6]">
            بيئةُ عملٍ ماليةٌ مبنيّةٌ لمركزٍ تدريبيّ — لا لوحةُ إدارة، بل مساحةٌ تُدار منها الحركةُ
            المالية كلها.
          </p>
        </div>
        <div className="relative flex flex-wrap gap-x-10 gap-y-4 border-t border-white/20 pt-6">
          <FootStat label="الوارد" value={totals.totalIn} />
          <FootStat label="الصادر" value={totals.totalOut} />
          <FootStat label="الموقف" value={totals.net} />
        </div>
      </section>

      <section className="flex flex-col justify-center gap-5 bg-panel px-8 py-12 sm:px-12 lg:px-14">
        <div className="text-xs tracking-[0.2em] text-faint">الدخول إلى مساحة العمل</div>
        <h1 className="editorial text-3xl text-foreground">أهلًا بعودتك</h1>
        <p className="max-w-[34ch] text-[13.5px] leading-6 text-muted-foreground">
          مركزٌ واحد، مشغّلٌ واحد. ادخل لتتابع دفتر المركز.
        </p>

        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            enter()
          }}
        >
          <label className="block">
            <span className="mb-1 block text-xs text-faint">المشغّل</span>
            <input
              value="أمين المركز"
              readOnly
              className="w-full border-0 border-b-[1.5px] border-border-strong bg-transparent py-2.5 text-lg text-foreground outline-none focus:border-olive"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-faint">كلمة المرور</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border-0 border-b-[1.5px] border-border-strong bg-transparent py-2.5 text-lg text-foreground outline-none focus:border-olive"
            />
          </label>

          <button
            type="submit"
            className="mt-1 inline-flex w-fit items-center gap-2 rounded-sm bg-olive px-6 py-3 text-[#f2efe4] transition hover:bg-olive-ink"
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
