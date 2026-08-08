import { type ReactNode, useEffect } from 'react'

import { X } from 'lucide-react'

type ActionSheetProps = {
  title: string
  eyebrow?: string
  onClose: () => void
  children: ReactNode
}

/**
 * A focused action surface that slides in from the start edge over the workspace
 * canvas — deliberately not a centered modal dialog. Full-height, scrollable,
 * with a dimmed scrim behind it.
 */
export function ActionSheet({ title, eyebrow, onClose, children }: ActionSheetProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-30 flex" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[rgba(28,25,16,0.32)]"
      />
      <div className="relative flex h-full w-full max-w-[440px] flex-col overflow-y-auto border-e border-border bg-panel shadow-soft">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            {eyebrow ? (
              <div className="mb-1 text-[11px] tracking-[0.2em] text-faint">{eyebrow}</div>
            ) : null}
            <h2 className="editorial text-2xl text-foreground">{title}</h2>
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
