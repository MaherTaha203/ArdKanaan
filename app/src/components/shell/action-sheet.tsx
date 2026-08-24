import { type ReactNode, useEffect, useId, useRef } from 'react'

import { X } from 'lucide-react'

type ActionSheetProps = {
  title: string
  eyebrow?: string
  onClose: () => void
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A focused action surface that slides in from the start edge over the workspace
 * canvas — deliberately not a centered modal dialog. Full-height, scrollable,
 * with a dimmed scrim behind it. Traps focus while open, restores it on close,
 * and locks background scroll (a11y).
 */
export function ActionSheet({ title, eyebrow, onClose, children }: ActionSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    const panel = panelRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function focusable(): HTMLElement[] {
      if (!panel) return []
      return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
    }

    // Move focus into the sheet on open.
    ;(focusable()[0] ?? panel)?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
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
  }, [onClose])

  return (
    <div
      className="absolute inset-0 z-30 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[rgba(28,25,16,0.32)]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-[440px] flex-col overflow-y-auto border-e border-border bg-panel shadow-soft outline-none"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            {eyebrow ? (
              <div className="mb-1 text-[11px] tracking-[0.2em] text-faint">{eyebrow}</div>
            ) : null}
            <h2 id={titleId} className="editorial text-2xl text-foreground">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-highlight hover:text-foreground"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}
