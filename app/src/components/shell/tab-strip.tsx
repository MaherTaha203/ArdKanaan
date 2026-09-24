import { useRef, type KeyboardEvent } from 'react'

import { X } from 'lucide-react'

import { useShellStore } from '@/store/use-shell-store'
import { PAGE_META, tabDomId } from '@/components/shell/page-registry'

// The workspace tab strip: the home tab is always present and first, then one tab per
// open page — each named for its own page and kept until closed. It is a second,
// additive navigation surface; pages open from the top system-bar menus, and opening
// one adds (or focuses) its tab here. Switching tabs only toggles which mounted page is
// visible, so every open page keeps its state.
// Presentation + navigation only — no data, financial, or workspace logic.
export function TabStrip() {
  const activeTab = useShellStore((state) => state.activeTab)
  const openTabs = useShellStore((state) => state.openTabs)
  const focusTab = useShellStore((state) => state.focusTab)
  const closeTab = useShellStore((state) => state.closeTab)
  const listRef = useRef<HTMLDivElement>(null)

  // Manual-activation roving focus: arrows move focus between tabs; Enter/Space (native
  // button) activates the focused tab. Keeps focus stable across the re-render.
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
      {openTabs.map((key) => {
        const meta = PAGE_META[key]
        const Icon = meta.icon
        const active = activeTab === key
        const closable = key !== 'home'
        const domId = tabDomId(key)
        return (
          <div
            key={key}
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
              id={`tab-${domId}`}
              aria-selected={active}
              aria-controls={`panel-${domId}`}
              tabIndex={active ? 0 : -1}
              onClick={() => focusTab(key)}
              className={`flex items-center gap-2 rounded-t-lg py-2 ps-3.5 ${closable ? 'pe-1.5' : 'pe-3.5'}`}
            >
              <Icon aria-hidden className={`size-[15px] ${active ? 'text-olive' : 'text-faint'}`} />
              <span className="whitespace-nowrap">{meta.title}</span>
            </button>
            {closable ? (
              <button
                type="button"
                onClick={() => closeTab(key)}
                aria-label={`إغلاق ${meta.title}`}
                title={`إغلاق ${meta.title}`}
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
