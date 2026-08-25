import { useEffect, type ComponentType } from 'react'

import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Home,
  LogOut,
  PanelsTopLeft,
  Settings,
  Users,
} from 'lucide-react'

import { ReceiptSheet } from '@/features/receipt-voucher/receipt-sheet'
import { PaymentSheet } from '@/features/payment-voucher/payment-sheet'
import { GlanceWorkspace } from '@/features/glance/glance-workspace'
import { StudentsWorkspace } from '@/features/students/students-workspace'
import { FinancialReportWorkspace } from '@/features/financial-report/financial-report-workspace'
import { SettingsWorkspace } from '@/features/settings/settings-workspace'
import { useShellStore, type ShellRoute } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// The B+ shell. A calm wide "glance" is the landing (route 'home'); the "cockpit"
// (routes students / report / settings) is a persistent working surface reached by
// a lens rail. The store's route model is reused unchanged: 'home' → glance,
// everything else → the cockpit with that route as the active lens.

type LensItem = {
  route: Exclude<ShellRoute, 'home'>
  label: string
  icon: ComponentType<{ className?: string }>
}

const LENSES: LensItem[] = [
  { route: 'students', label: 'الطلاب', icon: Users },
  { route: 'report', label: 'التقرير المالي', icon: FileText },
  { route: 'settings', label: 'الإعدادات', icon: Settings },
]

function CockpitView({ route }: { route: Exclude<ShellRoute, 'home'> }) {
  switch (route) {
    case 'students':
      return <StudentsWorkspace />
    case 'report':
      return <FinancialReportWorkspace />
    case 'settings':
      return <SettingsWorkspace />
  }
}

export function AppShell() {
  const route = useShellStore((state) => state.route)
  const overlay = useShellStore((state) => state.overlay)
  const navigate = useShellStore((state) => state.navigate)
  const openOverlay = useShellStore((state) => state.openOverlay)
  const leave = useShellStore((state) => state.leave)

  const load = useWorkspaceStore((state) => state.load)
  const loaded = useWorkspaceStore((state) => state.loaded)

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  const isGlance = route === 'home'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar — always present. Brand → glance; centre mode toggle; utilities. */}
      <header className="flex flex-none items-center gap-3 border-b border-border bg-panel px-4 py-2.5 md:px-6">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="editorial text-lg text-olive-ink transition hover:opacity-80"
        >
          أرض كنعان
        </button>
        <span className="hidden text-[11px] tracking-[0.08em] text-faint sm:inline">
          بيئة العمل المالية
        </span>

        <div className="mx-auto flex items-center gap-1 rounded-full bg-highlight p-1">
          <ModeChip active={isGlance} icon={Home} label="الإطلالة" onClick={() => navigate('home')} />
          <ModeChip
            active={!isGlance}
            icon={PanelsTopLeft}
            label="القُمرة"
            onClick={() => navigate('students')}
          />
        </div>

        <button
          type="button"
          onClick={() => navigate('settings')}
          aria-label="الإعدادات"
          aria-current={route === 'settings' ? 'page' : undefined}
          className="rounded-md p-2 text-muted-foreground transition hover:bg-highlight hover:text-foreground md:hidden"
        >
          <Settings className="size-[18px]" />
        </button>
        <button
          type="button"
          onClick={leave}
          aria-label="خروج"
          className="rounded-md p-2 text-muted-foreground transition hover:bg-highlight hover:text-foreground"
        >
          <LogOut className="size-[18px]" />
        </button>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isGlance ? (
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-8 md:px-8 md:pb-10">
              <GlanceWorkspace />
            </div>
          </main>
        ) : (
          <>
            {/* Lens rail — the persistent cockpit chrome (desktop). */}
            <nav
              aria-label="عدسات القُمرة"
              className="hidden w-16 flex-none flex-col items-center gap-1 border-e border-border bg-panel py-4 md:flex"
            >
              {LENSES.map((lens) => (
                <RailButton
                  key={lens.route}
                  icon={lens.icon}
                  label={lens.label}
                  active={route === lens.route}
                  onClick={() => navigate(lens.route)}
                />
              ))}
              <div className="mt-auto flex flex-col items-center gap-1 border-t border-border pt-3">
                <RailButton
                  icon={ArrowDownLeft}
                  label="سند قبض"
                  tone="gold"
                  onClick={() => openOverlay('receive')}
                />
                <RailButton
                  icon={ArrowUpRight}
                  label="سند صرف"
                  tone="clay"
                  onClick={() => openOverlay('expense')}
                />
              </div>
            </nav>

            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-6 md:px-8 md:pb-10 md:pt-8">
                <CockpitView route={route} />
              </div>
            </main>
          </>
        )}
      </div>

      {/* Action overlays (receipt / payment). */}
      {overlay === 'receive' ? <ReceiptSheet /> : null}
      {overlay === 'expense' ? <PaymentSheet /> : null}

      {/* Mobile bottom navigation — always present. */}
      <nav
        aria-label="التنقل"
        className="flex flex-none items-stretch justify-around border-t border-border bg-panel px-1 py-1.5 md:hidden"
      >
        <MobileNavButton active={route === 'home'} icon={Home} label="الإطلالة" onClick={() => navigate('home')} />
        <MobileNavButton
          active={route === 'students'}
          icon={Users}
          label="الطلاب"
          onClick={() => navigate('students')}
        />
        <MobileNavButton icon={ArrowDownLeft} label="قبض" onClick={() => openOverlay('receive')} />
        <MobileNavButton icon={ArrowUpRight} label="صرف" onClick={() => openOverlay('expense')} />
        <MobileNavButton
          active={route === 'report'}
          icon={FileText}
          label="التقرير"
          onClick={() => navigate('report')}
        />
      </nav>
    </div>
  )
}

function ModeChip({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
        active
          ? 'bg-panel text-olive-ink shadow-[0_1px_2px_rgba(40,34,18,0.12)]'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

function RailButton({
  icon: Icon,
  label,
  active,
  tone,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  active?: boolean
  tone?: 'gold' | 'clay'
  onClick: () => void
}) {
  const toneClass = tone === 'gold' ? 'text-gold' : tone === 'clay' ? 'text-clay' : ''
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`grid size-11 place-items-center rounded-lg transition ${
        active
          ? 'bg-olive-weak text-olive-ink'
          : `hover:bg-highlight ${toneClass || 'text-muted-foreground'}`
      }`}
    >
      <Icon className="size-[19px]" />
    </button>
  )
}

function MobileNavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-[10px] transition ${
        active ? 'text-olive-ink' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="size-5" />
      {label}
    </button>
  )
}
