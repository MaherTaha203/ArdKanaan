import { type ReactNode, useEffect, useId, useLayoutEffect, useRef } from 'react'

import { X } from 'lucide-react'

type ActionSheetProps = {
  title: string
  eyebrow?: string
  onClose: () => void
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Fields that keyboard "advance" (Enter) steps through, in DOM order: the form
// controls plus the submit button. Hidden inputs are excluded by the visibility filter.
const FIELDS = 'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button[type="submit"]:not([disabled])'

/**
 * A centered modal dialog for a single focused action (a voucher). Dimmed scrim,
 * rounded card, scrollable body. Traps focus while open, restores it on close, and
 * locks background scroll (a11y). Keyboard-first: Enter advances to the next field,
 * Ctrl/Cmd+Enter saves, Esc closes.
 */
export function ActionSheet({ title, eyebrow, onClose, children }: ActionSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  // Read onClose through a ref so the setup/teardown effect can run once (mount/
  // unmount) without re-arming — and losing the real pre-open focus target — if
  // the onClose identity ever changes while the sheet is open.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useLayoutEffect(() => {
    const panel = panelRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function visible(elements: HTMLElement[]): HTMLElement[] {
      return elements.filter((el) => el.offsetParent !== null)
    }
    function focusable(): HTMLElement[] {
      if (!panel) return []
      return visible(Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)))
    }
    function fields(): HTMLElement[] {
      if (!panel) return []
      return visible(Array.from(panel.querySelectorAll<HTMLElement>(FIELDS)))
    }

    // Move focus into the sheet on open — the first form field for keyboard-first
    // entry, falling back to any focusable element (or the panel) if none.
    ;(fields()[0] ?? focusable()[0] ?? panel)?.focus()

    function advance(from: EventTarget | null) {
      const list = fields()
      const index = list.indexOf(from as HTMLElement)
      const next = index >= 0 ? list[index + 1] : list[0]
      next?.focus()
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (event.key === 'Enter' && panel) {
        const target = event.target as HTMLElement | null
        const tag = target?.tagName
        // Ctrl/Cmd+Enter saves from anywhere in the form.
        if (event.ctrlKey || event.metaKey) {
          const form = panel.querySelector('form')
          if (form) {
            event.preventDefault()
            form.requestSubmit()
          }
          return
        }
        // Plain Enter in a multi-line field inserts a newline (default).
        if (tag === 'TEXTAREA') return
        // Plain Enter on the submit button saves (default click).
        if (tag === 'BUTTON') return
        // Plain Enter in a single-line field advances instead of submitting.
        if (tag === 'INPUT' || tag === 'SELECT') {
          event.preventDefault()
          advance(target)
        }
        return
      }

      if (event.key !== 'Tab' || !panel) return

      const items = focusable()
      if (items.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[rgba(15,23,42,0.4)] backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-[540px] flex-col overflow-hidden rounded-2xl border border-border bg-panel shadow-soft outline-none"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            {eyebrow ? (
              <div className="mb-1 text-[12px] font-bold tracking-wide text-olive">{eyebrow}</div>
            ) : null}
            <h2 id={titleId} className="editorial text-2xl text-foreground">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-highlight hover:text-foreground"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  )
}
