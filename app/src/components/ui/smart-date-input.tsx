import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'

import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { addDays, addMonths, monthMatrix, weekdayLabels } from '@/lib/calendar'
import { formatDate, todayIsoDate } from '@/lib/format'
import { parseSmartDate } from '@/lib/smart-date'

type SmartDateInputProps = {
  // Current value as a YYYY-MM-DD ISO string ('' when empty).
  value: string
  onChange: (iso: string) => void
  // Optional upper bound as ISO; a date beyond it is rejected (e.g. the "block future
  // date" guard passes today). Days after it are disabled in the calendar.
  max?: string
} & Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'onBlur' | 'type'>

const MONTH_LABEL = new Intl.DateTimeFormat('ar', { month: 'long' })

function monthYearLabel(year: number, month0: number): string {
  // Month name in Arabic, year appended by hand so its digits stay Western (0-9).
  return `${MONTH_LABEL.format(new Date(year, month0, 1))} ${year}`
}

// A keyboard-first date field with a modern calendar popover. The operator can type the
// day (or day/month, or a full date) — it resolves against today on blur/Enter — or open
// the calendar and click a day. Either way the value stays a YYYY-MM-DD ISO string, so
// nothing downstream (records, reports, calculations) changes.
export function SmartDateInput({ value, onChange, max, className, ...inputProps }: SmartDateInputProps) {
  const [buffer, setBuffer] = useState(value ? formatDate(value) : '')
  const [lastValue, setLastValue] = useState(value)
  const [open, setOpen] = useState(false)
  const today = todayIsoDate()

  // The month shown in the calendar and the keyboard-focused day (an ISO string).
  const [view, setView] = useState(() => value || today)
  const [focusIso, setFocusIso] = useState(() => value || today)

  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  // Keep the typed buffer in sync when the value changes from outside (e.g. reset).
  if (value !== lastValue) {
    setLastValue(value)
    setBuffer(value ? formatDate(value) : '')
  }

  function commit() {
    const trimmed = buffer.trim()
    if (!trimmed) {
      onChange('')
      return
    }
    const iso = parseSmartDate(trimmed)
    if (iso && (!max || iso <= max)) {
      onChange(iso)
      setBuffer(formatDate(iso))
    } else {
      setBuffer(value ? formatDate(value) : '')
    }
  }

  function openCalendar() {
    const anchor = value || today
    setView(anchor)
    setFocusIso(anchor)
    setOpen(true)
  }

  function select(iso: string) {
    if (max && iso > max) return
    onChange(iso)
    setBuffer(formatDate(iso))
    setLastValue(iso)
    setOpen(false)
    inputRef.current?.focus()
  }

  function moveFocus(iso: string) {
    setFocusIso(iso)
    setView(iso)
  }

  // Empty the field in one action (the operator asked for an easy clear).
  function clearValue() {
    setBuffer('')
    onChange('')
    setLastValue('')
    setOpen(false)
    inputRef.current?.focus()
  }

  // Position the popover under (or above) the field, in fixed coordinates so it is never
  // clipped inside a scrolling dialog. Recomputed while open on scroll/resize.
  useLayoutEffect(() => {
    if (!open) return
    function place() {
      const anchor = anchorRef.current
      const pop = popoverRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const popHeight = pop?.offsetHeight ?? 340
      const popWidth = pop?.offsetWidth ?? 300
      const below = rect.bottom + 6
      const top = below + popHeight <= window.innerHeight ? below : Math.max(6, rect.top - popHeight - 6)
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - popWidth - 8)
      setCoords({ top, left })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  // Close on a click outside the field and the popover.
  useEffect(() => {
    if (!open) return
    function onDown(event: MouseEvent) {
      const target = event.target as Node
      if (anchorRef.current?.contains(target) || popoverRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Keep DOM focus on the currently-focused day so arrow-key navigation is visible.
  useLayoutEffect(() => {
    if (!open) return
    popoverRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${focusIso}"]`)?.focus()
  }, [open, focusIso])

  function onCalendarKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        event.stopPropagation() // don't let the surrounding dialog close too
        setOpen(false)
        inputRef.current?.focus()
        return
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(addDays(focusIso, -7))
        return
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(addDays(focusIso, 7))
        return
      // RTL grid: the visual left is the later day.
      case 'ArrowLeft':
        event.preventDefault()
        moveFocus(addDays(focusIso, 1))
        return
      case 'ArrowRight':
        event.preventDefault()
        moveFocus(addDays(focusIso, -1))
        return
      case 'PageUp':
        event.preventDefault()
        moveFocus(addMonths(focusIso, -1))
        return
      case 'PageDown':
        event.preventDefault()
        moveFocus(addMonths(focusIso, 1))
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        select(focusIso)
        return
      default:
    }
  }

  const [viewYear, viewMonth] = [Number(view.slice(0, 4)), Number(view.slice(5, 7)) - 1]
  const weeks = monthMatrix(viewYear, viewMonth)
  const headings = weekdayLabels()

  return (
    <div ref={anchorRef} className="relative">
      <Input
        ref={inputRef}
        inputMode="numeric"
        className={`figure ${buffer ? 'pe-[4.5rem]' : 'pe-10'} ${className ?? ''}`}
        dir="ltr"
        placeholder={formatDate(today)}
        value={buffer}
        // Select the whole value on focus so typing replaces it instead of appending.
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setBuffer(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          } else if (event.key === 'ArrowDown' && !open) {
            event.preventDefault()
            openCalendar()
          }
        }}
        {...inputProps}
      />
      <div className="absolute inset-y-0 end-0 flex items-center">
        {buffer ? (
          <button
            type="button"
            aria-label="مسح التاريخ"
            // Keep input focus (don't let the commit-on-blur re-fill the value).
            onMouseDown={(event) => event.preventDefault()}
            onClick={clearValue}
            className="grid size-8 place-items-center rounded-lg text-faint hover:text-clay"
          >
            <X className="size-4" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={open ? 'إغلاق التقويم' : 'فتح التقويم'}
          aria-haspopup="dialog"
          aria-expanded={open}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => (open ? setOpen(false) : openCalendar())}
          className="grid h-full w-10 place-items-center rounded-e-xl text-muted-foreground hover:text-olive"
        >
          <CalendarDays className="size-[18px]" />
        </button>
      </div>

      {open
        ? createPortal(
            <div
              ref={popoverRef}
              role="dialog"
              aria-label="اختيار التاريخ"
              onKeyDown={onCalendarKeyDown}
              style={{ top: coords?.top ?? -9999, left: coords?.left ?? -9999 }}
              className="menu-in fixed z-50 w-[300px] rounded-2xl border border-border-strong bg-panel p-3 shadow-lg"
            >
              <div className="mb-2 flex items-center justify-between">
                <button type="button" aria-label="الشهر التالي" onClick={() => setView(addMonths(view, 1))} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-highlight hover:text-foreground">
                  <ChevronRight className="size-4" />
                </button>
                <div className="figure text-sm font-bold text-foreground">{monthYearLabel(viewYear, viewMonth)}</div>
                <button type="button" aria-label="الشهر السابق" onClick={() => setView(addMonths(view, -1))} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-highlight hover:text-foreground">
                  <ChevronLeft className="size-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-faint">
                {headings.map((label) => (
                  <div key={label} className="py-1">{label}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {weeks.flat().map((cell) => {
                  const disabled = max ? cell.iso > max : false
                  const selected = value === cell.iso
                  const isToday = cell.iso === today
                  const focused = focusIso === cell.iso
                  const tone = selected
                    ? 'bg-olive text-white font-bold'
                    : cell.inMonth
                      ? 'text-foreground hover:bg-highlight'
                      : 'text-faint hover:bg-highlight'
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      data-iso={cell.iso}
                      disabled={disabled}
                      tabIndex={focused ? 0 : -1}
                      aria-current={isToday ? 'date' : undefined}
                      aria-selected={selected}
                      onClick={() => select(cell.iso)}
                      onMouseEnter={() => setFocusIso(cell.iso)}
                      className={`figure grid h-9 place-items-center rounded-lg text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent ${tone} ${isToday && !selected ? 'ring-1 ring-olive/40' : ''}`}
                    >
                      {String(cell.day)}
                    </button>
                  )
                })}
              </div>

              <div className="mt-2 flex justify-center border-t border-border pt-2">
                <button type="button" onClick={() => select(today)} className="rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-olive hover:bg-brand-weak">
                  اليوم
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
