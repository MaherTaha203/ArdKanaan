import type { ReactNode } from 'react'

type WindowFrameProps = {
  active: boolean
  label: string
  panelId: string
  labelledBy: string
  children: ReactNode
}

// The mounted panel for one open page in the tabbed workspace. It fills the content
// area and is always mounted while its tab is open (so the page keeps its state); the
// `active` flag only toggles visibility, it never unmounts. The tab strip carries the
// title, active indicator, and close control — this frame is now chrome-free so the
// page's own header sits directly under the tab strip. Pure presentation.
export function WindowFrame({ active, label, panelId, labelledBy, children }: WindowFrameProps) {
  return (
    <section
      id={panelId}
      role="tabpanel"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-hidden={!active}
      inert={!active}
      className={`app-window ${active ? 'is-active' : ''}`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </section>
  )
}
