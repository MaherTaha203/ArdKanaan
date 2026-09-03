import { useEffect, useRef, useState, type ComponentType } from 'react'

import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'

import { ReceiptSheet } from '@/features/receipt-voucher/receipt-sheet'
import { PaymentSheet } from '@/features/payment-voucher/payment-sheet'
import { StudentEditSheet } from '@/features/students/student-edit-sheet'
import { ActivityWorkspace } from '@/features/activity/activity-workspace'
import { GlanceWorkspace } from '@/features/glance/glance-workspace'
import { Toaster } from '@/components/ui/toast'
import { StudentsWorkspace } from '@/features/students/students-workspace'
import { FinancialReportWorkspace } from '@/features/financial-report/financial-report-workspace'
import { SettingsWorkspace } from '@/features/settings/settings-workspace'
import { useAuthStore } from '@/store/use-auth-store'
import { useShellStore, type ReportView, type ShellRoute } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

type NavItem = {
  route: ShellRoute
  label: string
  icon: ComponentType<{ className?: string }>
}

const NAV: NavItem[] = [
  { route: 'home', label: 'الإطلالة', icon: Home },
  { route: 'students', label: 'الطلاب', icon: Users },
  { route: 'activity', label: 'سجل العمل', icon: Activity },
]

const REPORT_MENU: { view: ReportView; label: string }[] = [
  { view: 'general', label: 'التقرير العام' },
  { view: 'receipts', label: 'تقرير القبض' },
  { view: 'payments', label: 'تقرير الصرف' },
]

function CurrentView({ route }: { route: ShellRoute }) {
  switch (route) {
    case 'home':
      return <GlanceWorkspace />
    case 'students':
      return <StudentsWorkspace />
    case 'report':
      return <FinancialReportWorkspace />
    case 'activity':
      return <ActivityWorkspace />
    case 'settings':
      return <SettingsWorkspace />
  }
}

export function AppShell() {
  const route = useShellStore((state) => state.route)
  const reportView = useShellStore((state) => state.reportView)
  const overlay = useShellStore((state) => state.overlay)
  const editVoucherId = useShellStore((state) => state.editVoucherId)
  const editStudentId = useShellStore((state) => state.editStudentId)
  const receivePrefillName = useShellStore((state) => state.receivePrefillName)
  const navigate = useShellStore((state) => state.navigate)
  const navigateReport = useShellStore((state) => state.navigateReport)
  const openOverlay = useShellStore((state) => state.openOverlay)
  const signOut = useAuthStore((state) => state.signOut)

  const load = useWorkspaceStore((state) => state.load)
  const loaded = useWorkspaceStore((state) => state.loaded)

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 flex flex-none items-center gap-2 border-b border-border bg-panel/95 px-4 py-3 backdrop-blur md:gap-4 md:px-8">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="flex items-baseline gap-2"
        >
          <span className="editorial text-[19px] text-foreground">أرض كنعان</span>
        </button>

        <nav aria-label="التنقل" className="ms-6 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.route}
              label={item.label}
              active={route === item.route}
              onClick={() => navigate(item.route)}
            />
          ))}
          <ReportNav active={route === 'report'} reportView={reportView} onPick={navigateReport} />
        </nav>

        <div className="ms-auto flex items-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={() => openOverlay('receive')}
            className="hidden items-center gap-2 rounded-full bg-olive px-4 py-2 text-[13px] font-semibold text-white shadow-sm sm:inline-flex"
          >
            <ArrowDownLeft className="size-4" />
            سند قبض
          </button>
          <button
            type="button"
            onClick={() => openOverlay('expense')}
            className="hidden items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-[13px] font-semibold text-muted-foreground sm:inline-flex"
          >
            <ArrowUpRight className="size-4" />
            سند صرف
          </button>
          <button
            type="button"
            onClick={() => navigate('settings')}
            aria-label="الإعدادات"
            aria-current={route === 'settings' ? 'page' : undefined}
            className={`rounded-full p-2 ${route === 'settings' ? 'text-olive' : 'text-muted-foreground'}`}
          >
            <Settings className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="خروج"
            className="rounded-full p-2 text-muted-foreground"
          >
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-clip">
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-8 md:px-8 md:pb-14 md:pt-10">
          <CurrentView route={route} />
        </div>
      </main>

      {overlay === 'receive' ? <ReceiptSheet key={editVoucherId ?? receivePrefillName ?? 'new'} /> : null}
      {overlay === 'expense' ? <PaymentSheet key={editVoucherId ?? 'new'} /> : null}
      {overlay === 'student' ? <StudentEditSheet key={editStudentId ?? 'new'} /> : null}

      <Toaster />

      <nav
        aria-label="التنقل"
        className="fixed inset-x-0 bottom-0 z-20 flex flex-none items-stretch justify-around border-t border-border bg-panel/95 px-1 py-1.5 backdrop-blur md:hidden"
      >
        <MobileNavButton active={route === 'home'} icon={Home} label="الإطلالة" onClick={() => navigate('home')} />
        <MobileNavButton
          active={route === 'students'}
          icon={Users}
          label="الطلاب"
          onClick={() => navigate('students')}
        />
        <MobileNavButton
          active={route === 'activity'}
          icon={Activity}
          label="سجل العمل"
          onClick={() => navigate('activity')}
        />
        <MobileNavButton icon={ArrowDownLeft} label="قبض" accent onClick={() => openOverlay('receive')} />
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

function NavLink({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
        active ? 'bg-olive-weak text-olive' : 'text-muted-foreground'
      }`}
    >
      {label}
    </button>
  )
}

function ReportNav({
  active,
  reportView,
  onPick,
}: {
  active: boolean
  reportView: ReportView
  onPick: (view: ReportView) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-current={active ? 'page' : undefined}
        className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium ${
          active ? 'bg-olive-weak text-olive' : 'text-muted-foreground'
        }`}
      >
        التقرير المالي
        <ChevronDown className={`size-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute start-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-border-strong bg-panel py-1 shadow-lg"
        >
          {REPORT_MENU.map((item) => (
            <button
              key={item.view}
              type="button"
              role="menuitemradio"
              aria-checked={active && reportView === item.view}
              onClick={() => {
                onPick(item.view)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 px-3.5 py-2 text-start text-sm ${
                active && reportView === item.view ? 'font-semibold text-olive' : 'text-muted-foreground'
              }`}
            >
              <FileText className="size-4 flex-none opacity-70" />
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function MobileNavButton({
  icon: Icon,
  label,
  active,
  accent,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  active?: boolean
  accent?: boolean
  onClick: () => void
}) {
  const color = accent ? 'text-olive' : active ? 'text-olive' : 'text-muted-foreground'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${color}`}
    >
      <span className={`grid size-8 place-items-center rounded-full ${active || accent ? 'bg-olive-weak' : ''}`}>
        <Icon className="size-[18px]" />
      </span>
      {label}
    </button>
  )
}
