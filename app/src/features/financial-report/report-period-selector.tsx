import { useEffect, useRef, useState } from 'react'
import { CalendarRange, Check, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SmartDateInput } from '@/components/ui/smart-date-input'
import { formatDate } from '@/lib/format'
import { periodLabel, reportPeriodRange, type ReportPeriod } from '@/features/financial-report/report-period'

type ReportPeriodSelectorProps = {
  value: ReportPeriod
  customStart: string
  customEnd: string
  onPresetChange: (period: Exclude<ReportPeriod, 'custom'>) => void
  onCustomApply: (start: string, end: string) => void
}

const PRESETS: { id: Exclude<ReportPeriod, 'custom'>; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'today', label: 'اليوم' },
  { id: 'yesterday', label: 'أمس' },
  { id: 'week', label: 'هذا الأسبوع' },
  { id: 'last-week', label: 'الأسبوع الماضي' },
  { id: 'month', label: 'هذا الشهر' },
  { id: 'last-month', label: 'الشهر الماضي' },
  { id: 'last-7', label: 'آخر 7 أيام' },
  { id: 'last-30', label: 'آخر 30 يومًا' },
  { id: 'year', label: 'هذه السنة' },
]

export function ReportPeriodSelector({
  value,
  customStart,
  customEnd,
  onPresetChange,
  onCustomApply,
}: ReportPeriodSelectorProps) {
  const [open, setOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(customStart)
  const [draftEnd, setDraftEnd] = useState(customEnd)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    setDraftStart(customStart)
    setDraftEnd(customEnd)
  }, [open, customStart, customEnd])

  const activeRange = value === 'custom'
    ? { start: customStart, end: customEnd }
    : reportPeriodRange(value)

  const rangeText = activeRange.start && activeRange.end
    ? `${formatDate(activeRange.start)} — ${formatDate(activeRange.end)}`
    : value === 'all'
      ? 'كل الفترات'
      : 'اختر الفترة'

  function choosePreset(period: Exclude<ReportPeriod, 'custom'>) {
    onPresetChange(period)
    setOpen(false)
  }

  function chooseCustom() {
    setDraftStart(customStart)
    setDraftEnd(customEnd)
  }

  function applyCustom() {
    if (!draftStart || !draftEnd || draftStart > draftEnd) return
    onCustomApply(draftStart, draftEnd)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1" dir="rtl">
      <Button
        type="button"
        variant="outline"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="h-10 w-full justify-between gap-3 px-3"
      >
        <span className="flex min-w-0 items-center gap-2 text-start">
          <CalendarRange className="size-4 flex-none text-olive" />
          <span className="min-w-0 truncate">
            <span className="text-[11px] text-faint">{periodLabel(value)} · </span>
            <span className="figure text-[13px] font-semibold text-foreground">{rangeText}</span>
          </span>
        </span>
        <ChevronDown className={`size-4 flex-none text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-label="اختيار فترة التقرير"
          className="menu-in absolute end-0 top-[calc(100%+6px)] z-50 w-[min(360px,calc(100vw-24px))] rounded-2xl border border-border-strong bg-panel p-2.5 shadow-lg"
        >
          <div className="mb-2 px-2 py-1">
            <div className="text-[11px] font-semibold text-faint">فترة التقرير</div>
            <div className="mt-0.5 text-sm font-bold text-foreground">{rangeText}</div>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => choosePreset(preset.id)}
                className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-start text-[12.5px] font-semibold transition-colors hover:bg-highlight ${value === preset.id ? 'bg-brand-weak text-olive' : 'text-foreground'}`}
              >
                {preset.label}
                {value === preset.id ? <Check className="size-3.5" /> : null}
              </button>
            ))}
          </div>

          <div className={`mt-2 rounded-xl border p-2.5 ${value === 'custom' ? 'border-olive/40 bg-highlight/30' : 'border-border'}`}>
            <button
              type="button"
              onClick={chooseCustom}
              className={`mb-2 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[12.5px] font-semibold ${value === 'custom' ? 'text-olive' : 'text-foreground hover:bg-highlight'}`}
            >
              <span>مخصص</span>
              {value === 'custom' ? <Check className="size-3.5" /> : null}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <SmartDateInput aria-label="بداية الفترة" placeholder="من" value={draftStart} onChange={setDraftStart} className="h-9 w-full" />
              <SmartDateInput aria-label="نهاية الفترة" placeholder="إلى" value={draftEnd} onChange={(next) => { if (!draftStart || next >= draftStart) setDraftEnd(next) }} className="h-9 w-full" />
            </div>

            <div className="mt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-muted-foreground hover:bg-highlight">
                إلغاء
              </button>
              <Button type="button" size="sm" disabled={!draftStart || !draftEnd || draftStart > draftEnd} onClick={applyCustom}>
                تطبيق الفترة
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
