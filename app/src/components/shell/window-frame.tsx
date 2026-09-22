import type { ComponentType, ReactNode } from 'react'

import { Minus, X } from 'lucide-react'

type WindowFrameProps = {
  title: string
  icon: ComponentType<{ className?: string }>
  active: boolean
  onMinimize: () => void
  onClose: () => void
  children: ReactNode
}

// A full-screen page window layered over the home base. It is always mounted while
// open (so its content keeps its state); the `active` flag only toggles visibility,
// it never unmounts. Pure presentation — the page inside is an existing workspace,
// rendered unchanged.
export function WindowFrame({ title, icon: Icon, active, onMinimize, onClose, children }: WindowFrameProps) {
  return (
    <section
      className={`app-window ${active ? 'is-active' : ''}`}
      role="region"
      aria-label={title}
      aria-hidden={!active}
      inert={!active}
    >
      <div className="flex flex-none items-center gap-2.5 border-b border-border bg-panel px-4 py-2.5 md:px-6">
        <span className="grid size-7 place-items-center rounded-lg bg-olive-weak text-olive">
          <Icon className="size-[15px]" />
        </span>
        <span className="text-[15px] font-bold text-foreground">{title}</span>
        <div className="ms-auto flex items-center gap-1">
          <button type="button" onClick={onMinimize} aria-label="إخفاء" title="إخفاء" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-highlight hover:text-foreground">
            <Minus className="size-[18px]" />
          </button>
          <button type="button" onClick={onClose} aria-label="إغلاق" title="إغلاق" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-clay-weak hover:text-clay">
            <X className="size-[18px]" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </section>
  )
}
