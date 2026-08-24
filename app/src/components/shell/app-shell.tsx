import { useEffect, type ComponentType } from 'react'

import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'

import { ReceiptSheet } from '@/features/receipt-voucher/receipt-sheet'
import { PaymentSheet } from '@/features/payment-voucher/payment-sheet'
import { HomeWorkspace } from '@/features/home/home-workspace'
import { StudentsWorkspace } from '@/features/students/students-workspace'
import { FinancialReportWorkspace } from '@/features/financial-report/financial-report-workspace'
import { SettingsWorkspace } from '@/features/settings/settings-workspace'
import { useShellStore, type ShellRoute } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

type NavItem = {
  route: ShellRoute
  label: string
  icon: ComponentType<{ className?: string }>
}

const NAV: NavItem[] = [
  { route: 'home', label: 'مساحة العمل', icon: Home },
  { route: 'students', label: 'الطلاب', icon: Users },
  { route: 'report', label: 'التقرير المالي', icon: FileText },
  { route: 'settings', label: 'الإعدادات', icon: Settings },
]

const ROUTE_TITLES: Record<ShellRoute, string> = {
  home: 'مساحة العمل',
  students: 'الطلاب',
  report: 'التقرير المالي',
  settings: 'الإعدادات',
}

function RouteView({ route }: { route: ShellRoute }) {
  switch (route) {
    case 'home':
      return <HomeWorkspace />
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop rail — the identity spine of the environment */}
      <aside className="hidden w-56 flex-none flex-col bg-olive px-4 py-6 text-[#e9ece2] md:flex">
        <div className="border-b border-white/15 px-2 pb-5">
          <div className="editorial text-2xl text-white">أرض كنعان</div>
          <div className="mt-1 text-[10.5px] tracking-[0.1em] text-[#aeb8a4]">بيئة العمل المالية</div>
        </div>

        <nav className="mt-5 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = item.route === route
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => navigate(item.route)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm transition ${
                  active
                    ? 'bg-background font-semibold text-olive-ink'
                    : 'text-[#cdd3c5] hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="size-[18px]" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => openOverlay('receive')}
            className="flex items-center justify-center gap-2 rounded-md bg-gold px-3 py-2.5 text-[13.5px] font-semibold text-[#2a2008] transition hover:brightness-95"
          >
            <ArrowDownLeft className="size-4" />
            استلام مبلغ
          </button>
          <button
            type="button"
            onClick={() => openOverlay('expense')}
            className="flex items-center justify-center gap-2 rounded-md border border-[rgba(173,126,39,0.5)] px-3 py-2.5 text-[13.5px] text-[#e0d5b6] transition hover:bg-white/5"
          >
            <ArrowUpRight className="size-4" />
            تسجيل مصروف
          </button>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-white/15 pt-4">
          <span className="grid size-8 flex-none place-items-center rounded-full bg-gold-weak font-bold text-olive-ink">
            أ
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px]">أمين المركز</div>
            <div className="text-[10.5px] text-[#aeb8a4]">مشغّل واحد</div>
          </div>
          <button
            type="button"
            onClick={leave}
            aria-label="خروج"
            className="rounded-md p-1.5 text-[#cdd3c5] transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* Canvas */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between bg-olive px-4 py-3 text-white md:hidden">
          <span className="editorial text-xl">أرض كنعان</span>
          <div className="flex items-center gap-1 text-[13px] text-[#cdd3c5]">
            <span>{ROUTE_TITLES[route]}</span>
            <button
              type="button"
              onClick={() => navigate('settings')}
              aria-label="الإعدادات"
              className="ms-2 rounded-md p-1.5 hover:bg-white/10"
            >
              <Settings className="size-4" />
            </button>
            <button
              type="button"
              onClick={leave}
              aria-label="خروج"
              className="rounded-md p-1.5 hover:bg-white/10"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-6 md:px-8 md:pb-10 md:pt-8">
            <RouteView route={route} />
          </div>
        </div>

        {/* Action overlay (receipt / payment) */}
        {overlay === 'receive' ? <ReceiptSheet /> : null}
        {overlay === 'expense' ? <PaymentSheet /> : null}

        {/* Mobile bottom navigation */}
        <nav className="absolute inset-x-0 bottom-0 z-20 flex items-stretch justify-around bg-olive px-1 py-1.5 md:hidden">
          <MobileNavButton
            active={route === 'home'}
            icon={Home}
            label="العمل"
            onClick={() => navigate('home')}
          />
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
      </main>
    </div>
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
        active ? 'bg-white/12 text-white' : 'text-[#cdd3c5] hover:text-white'
      }`}
    >
      <Icon className="size-5" />
      {label}
    </button>
  )
}
