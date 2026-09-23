import { useRef, type ComponentType, type KeyboardEvent } from 'react'

import { Home, X } from 'lucide-react'

import { useShellStore, type ShellRoute } from '@/store/use-shell-store'
import { WINDOW_META, type WindowRoute } from '@/components/shell/window-registry'

type TabItem = {
  route: ShellRoute
  label: string
  icon: ComponentType<{ className?: string }>
  closable: boolean
}

// The workspace tab strip: the home tab is always present and first, then one tab
// per open page. It is a second, additive navigation surface — pages still open from
// the top system bar; opening one adds (or focuses) its tab here. Switching tabs only
// toggles which mounted page is visible, so every open page keeps its state.
// Presentation + navigation only — no data, financial, or workspace logic.
export function TabStrip() {
  const route = useShellStore((state) => state.route)
  const openWindows = useShellStore((state) => state.openWindows)
  const navigate = useShellStore((state) => state.navigate)
  const focusWindow = useShellStore((state) => state.focusWindow)
  const closeWindow = useShellStore((state) => state.closeWindow)
  const listRef = useRef<HTMLDivElement>(null)

  const tabs: TabItem[] = [
    { route: 'home', label: 'الرئيسية', icon: Home, closable: false },
    ...(openWindows as WindowRoute[]).map((r) => ({
      route: r as ShellRoute,
      label: WINDOW_META[r].title,
      icon: WINDOW_META[r].icon,
      closable: true,
    })),
  ]

  const activate = (r: ShellRoute) => (r === 'home' ? navigate('home') : focusWindow(r as WindowRoute))

  // Manual-activation roving focus: arrows move focus between tabs; Enter/Space (native
  // button) activates the focused tab. Keeps focus stable across the route re-render.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const els = listRef.current ? Array.from(listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]')) : []
    const current = els.indexOf(document.activeElement as HTMLButtonElement)
    if (current < 0) return
    let next = -1
    if (event.key === 'ArrowRight') next = (current + 1) % els.length
    else if (event.key === 'ArrowLeft') next = (current - 1 + els.length) % els.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = els.length - 1
    if (next >= 0) {
      event.preventDefault()
      els[next].focus()
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="الصفحات المفتوحة"
      onKeyDown={onKeyDown}
      className="flex flex-none items-stretch gap-1 overflow-x-auto border-b border-border bg-background px-2 [-ms-overflow-style:none] [scrollbar-width:thin]"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = route === tab.route
        return (
          <div
            key={tab.route}
            className={`group relative -mb-px mt-1.5 flex flex-none items-center rounded-t-lg border text-[13px] font-semibold transition-colors ${
              active
                ? 'border-border border-b-transparent bg-panel text-foreground'
                : 'border-transparent text-muted-foreground hover:bg-highlight'
            }`}
          >
            {active ? <span aria-hidden className="pointer-events-none absolute inset-x-1.5 top-0 h-[2px] rounded-b bg-olive" /> : null}
            <button
              type="button"
              role="tab"
              id={`tab-${tab.route}`}
              aria-selected={active}
              aria-controls={`panel-${tab.route}`}
              tabIndex={active ? 0 : -1}
              onClick={() => activate(tab.route)}
              className={`flex items-center gap-2 rounded-t-lg py-2 ps-3.5 ${tab.closable ? 'pe-1.5' : 'pe-3.5'}`}
            >
              <Icon aria-hidden className={`size-[15px] ${active ? 'text-olive' : 'text-faint'}`} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
            {tab.closable ? (
              <button
                type="button"
                onClick={() => closeWindow(tab.route as WindowRoute)}
                aria-label={`إغلاق ${tab.label}`}
                title={`إغلاق ${tab.label}`}
                className="me-1.5 grid size-5 flex-none place-items-center rounded-md text-faint hover:bg-clay-weak hover:text-clay"
              >
                <X aria-hidden className="size-3.5" />
              </button>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
