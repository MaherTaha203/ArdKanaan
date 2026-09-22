import { X } from 'lucide-react'

import { useShellStore } from '@/store/use-shell-store'

import { WINDOW_META, type WindowRoute } from './window-registry'

// The dock: a floating strip of the currently minimized windows. Clicking a chip
// restores that window (with its state intact); the × closes it. It sits above the
// mobile bottom nav, and near the bottom on desktop. Presentation only.
export function WindowDock() {
  const openWindows = useShellStore((state) => state.openWindows)
  const route = useShellStore((state) => state.route)
  const focusWindow = useShellStore((state) => state.focusWindow)
  const closeWindow = useShellStore((state) => state.closeWindow)

  const minimized = openWindows.filter((r) => r !== route) as WindowRoute[]
  if (minimized.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-3 bottom-[calc(env(safe-area-inset-bottom,0px)+76px)] md:bottom-[calc(env(safe-area-inset-bottom,0px)+14px)]">
      <nav aria-label="النوافذ المخفية" className="dock-in pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-border-strong bg-panel/95 px-2 py-1.5 shadow-soft backdrop-blur">
        {minimized.map((r) => {
          const meta = WINDOW_META[r]
          const Icon = meta.icon
          return (
            <span key={r} className="flex flex-none items-center gap-1 rounded-full border border-border bg-panel py-1 pe-1 ps-3 text-[13px] font-semibold text-foreground shadow-card">
              <button type="button" onClick={() => focusWindow(r)} className="flex items-center gap-1.5">
                <Icon className="size-[15px] text-olive" />
                {meta.title}
              </button>
              <button type="button" onClick={() => closeWindow(r)} aria-label={`إغلاق ${meta.title}`} className="grid size-5 place-items-center rounded-full text-faint hover:bg-clay-weak hover:text-clay">
                <X className="size-3" />
              </button>
            </span>
          )
        })}
      </nav>
    </div>
  )
}
