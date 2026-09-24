import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'

import { ArrowDownToLine, ArrowUpFromLine, BookOpen, ChevronDown, FileText, Home, LogOut, SlidersHorizontal, Users } from 'lucide-react'

import { useApplyRootSettings, useIdleLogout } from '@/hooks/use-app-preferences'
import { ReceiptSheet } from '@/features/receipt-voucher/receipt-sheet'
import { PaymentSheet } from '@/features/payment-voucher/payment-sheet'
import { StudentEditSheet } from '@/features/students/student-edit-sheet'
import { StudentArchiveSheet } from '@/features/students/student-archive-sheet'
import { StudentFeeSheet } from '@/features/students/student-fee-sheet'
import { ArchivedStudentsWorkspace } from '@/features/students/archived-students-workspace'
import { CourseFormSheet } from '@/features/courses/course-form-sheet'
import { EnrollStudentSheet } from '@/features/courses/enroll-student-sheet'
import { ActivityWorkspace } from '@/features/activity/activity-workspace'
import { GlanceWorkspace } from '@/features/glance/glance-workspace'
import { StudentDirectoryWorkspace } from '@/features/students/student-directory-workspace'
import { CoursesWorkspace } from '@/features/courses/courses-workspace'
import { CourseDetailWorkspace } from '@/features/courses/course-detail-workspace'
import { Toaster } from '@/components/ui/toast'
import { StudentsWorkspace } from '@/features/students/students-workspace'
import { FinancialReportWorkspace } from '@/features/financial-report/financial-report-workspace'
import { SettingsWorkspace } from '@/features/settings/settings-workspace'
import { BackupWorkspace } from '@/features/settings/backup-workspace'
import { useAuthStore } from '@/store/use-auth-store'
import { useShellStore, pageSection, type PageKey, type ReportView } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { WindowFrame } from '@/components/shell/window-frame'
import { TabStrip } from '@/components/shell/tab-strip'
import { PAGE_META, tabDomId } from '@/components/shell/page-registry'

// Each menu item opens its own named tab, so a menu is a list of PageKeys — navigation
// happens only from these menus (and the tab strip), never from links inside a page.
type MenuItem = { key: PageKey; label: string }

const STUDENT_MENU: MenuItem[] = [
  { key: 'students:directory', label: 'دليل الطلاب' },
  { key: 'students:statement', label: 'كشف الحساب' },
  { key: 'students:archived', label: 'المؤرشفون' },
]

const REPORT_MENU: MenuItem[] = [
  { key: 'report:general', label: 'كشف الحساب العام' },
  { key: 'report:receipts', label: 'تقرير المقبوضات' },
  { key: 'report:payments', label: 'تقرير المدفوعات' },
  { key: 'report:external', label: 'الجهات الخارجية' },
]

const SETTINGS_MENU: MenuItem[] = [
  { key: 'settings:system', label: 'الإعدادات' },
  { key: 'settings:backup', label: 'النسخ الاحتياطي' },
  { key: 'settings:activity', label: 'سجل التدقيق' },
]

// The report view a report PageKey renders (e.g. 'report:receipts' → 'receipts').
function reportViewOf(key: PageKey): ReportView {
  return key.slice('report:'.length) as ReportView
}

// The page shown inside a tab panel. One PageKey → one page; report views pass their
// view as a prop. The workspaces themselves are unchanged.
function PageView({ pageKey }: { pageKey: PageKey }) {
  switch (pageKey) {
    case 'home':
      return <GlanceWorkspace />
    case 'students:directory':
      return <StudentDirectoryWorkspace />
    case 'students:statement':
      return <StudentsWorkspace />
    case 'students:archived':
      return <ArchivedStudentsWorkspace />
    case 'courses:directory':
      return <CoursesWorkspace />
    case 'courses:detail':
      return <CourseDetailWorkspace />
    case 'report:general':
    case 'report:receipts':
    case 'report:payments':
    case 'report:external':
      return <FinancialReportWorkspace view={reportViewOf(pageKey)} />
    case 'settings:system':
      return <SettingsWorkspace />
    case 'settings:backup':
      return <BackupWorkspace />
    case 'settings:activity':
      return <ActivityWorkspace />
  }
}

export function AppShell() {
  const activeTab = useShellStore((state) => state.activeTab)
  const openTabs = useShellStore((state) => state.openTabs)
  const overlay = useShellStore((state) => state.overlay)
  const editVoucherId = useShellStore((state) => state.editVoucherId)
  const editStudentId = useShellStore((state) => state.editStudentId)
  const editCourseId = useShellStore((state) => state.editCourseId)
  const enrollCourseId = useShellStore((state) => state.enrollCourseId)
  const archiveStudentId = useShellStore((state) => state.archiveStudentId)
  const feeStudentId = useShellStore((state) => state.feeStudentId)
  const receivePrefillName = useShellStore((state) => state.receivePrefillName)
  const openTab = useShellStore((state) => state.openTab)
  const openOverlay = useShellStore((state) => state.openOverlay)
  const signOut = useAuthStore((state) => state.signOut)
  const load = useWorkspaceStore((state) => state.load)
  const loaded = useWorkspaceStore((state) => state.loaded)

  const section = pageSection(activeTab)

  useApplyRootSettings()
  useIdleLogout(signOut)

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex flex-none items-center gap-2 border-b border-white/10 bg-[#0f172a] px-4 py-2.5 text-white shadow-[0_10px_28px_-20px_rgba(15,23,42,0.9)] md:gap-4 md:px-8">
        <button type="button" onClick={() => openTab('home')} className="flex items-baseline gap-2">
          <span className="editorial text-[19px] text-white">أرض كنعان</span>
        </button>

        <nav aria-label="التنقل" className="ms-6 hidden items-center gap-1 md:flex">
          <NavLink label="الرئيسية" icon={Home} active={activeTab === 'home'} onClick={() => openTab('home')} />
          <GroupNav label="الطلاب" icon={Users} activeKey={activeTab} items={STUDENT_MENU} onPick={openTab} />
          <NavLink label="الدورات" icon={BookOpen} active={section === 'courses'} onClick={() => openTab('courses:directory')} />
          <ReportNav activeKey={activeTab} onPick={openTab} onNewVoucher={openOverlay} />
        </nav>

        <div className="ms-auto flex items-center gap-1.5 md:gap-2">
          <GroupNav
            label="النظام"
            icon={SlidersHorizontal}
            activeKey={activeTab}
            items={SETTINGS_MENU}
            onPick={openTab}
            menuAlign="end"
            footer={(close) => (
              <>
                <div className="my-1 h-px bg-border" />
                <button type="button" role="menuitem" onClick={() => { close(); void signOut() }} className="flex w-full items-center gap-2 px-3.5 py-2 text-start text-sm font-semibold text-clay hover:bg-clay-weak">
                  <LogOut className="size-4" />
                  تسجيل الخروج
                </button>
              </>
            )}
          />
        </div>
      </header>

      <TabStrip />

      <main className="relative flex-1 overflow-hidden">
        {/* Home — the permanent first tab. It carries no user input to preserve, so it
            mounts only while it is the active tab; the other pages are the ones kept
            mounted for their state. */}
        {activeTab === 'home' ? (
          <section id="panel-home" role="tabpanel" aria-labelledby="tab-home" className="absolute inset-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-6">
              <GlanceWorkspace />
            </div>
          </section>
        ) : null}

        {/* Open pages — each a chrome-free panel filling the content area, kept mounted
            so its state survives while another tab is active. Only the active one shows. */}
        {openTabs.filter((key) => key !== 'home').map((key) => {
          const domId = tabDomId(key)
          return (
            <WindowFrame key={key} active={activeTab === key} label={PAGE_META[key].title} panelId={`panel-${domId}`} labelledBy={`tab-${domId}`}>
              <div className={`mx-auto w-full px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-6 ${key.startsWith('report:') ? 'max-w-[1760px]' : 'max-w-[1440px]'}`}>
                <div className="route-fade">
                  <PageView pageKey={key} />
                </div>
              </div>
            </WindowFrame>
          )
        })}
      </main>

      {overlay === 'receive' ? <ReceiptSheet key={editVoucherId ?? receivePrefillName ?? 'new'} /> : null}
      {overlay === 'expense' ? <PaymentSheet key={editVoucherId ?? 'new'} /> : null}
      {overlay === 'student' ? <StudentEditSheet key={editStudentId ?? 'new'} /> : null}
      {overlay === 'course' ? <CourseFormSheet key={editCourseId ?? 'new'} /> : null}
      {overlay === 'enroll' ? <EnrollStudentSheet key={enrollCourseId ?? 'new'} /> : null}
      {overlay === 'archive' ? <StudentArchiveSheet key={archiveStudentId ?? 'none'} /> : null}
      {overlay === 'student-fee' ? <StudentFeeSheet key={feeStudentId ?? 'none'} /> : null}

      <Toaster />

      <nav aria-label="التنقل" className="fixed inset-x-0 bottom-0 z-20 flex flex-none items-stretch justify-around border-t border-border bg-panel/95 px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] md:hidden">
        <MobileNavButton active={activeTab === 'home'} icon={Home} label="الرئيسية" onClick={() => openTab('home')} />
        <MobileGroupNav label="الطلاب" icon={Users} activeKey={activeTab} items={STUDENT_MENU} onPick={openTab} />
        <MobileNavButton active={section === 'courses'} icon={BookOpen} label="الدورات" onClick={() => openTab('courses:directory')} />
        <MobileGroupNav label="التقرير" icon={FileText} activeKey={activeTab} items={REPORT_MENU} onPick={openTab} />
        <MobileNavButton icon={ArrowDownToLine} label="قبض" accent onClick={() => openOverlay('receive')} />
        <MobileNavButton icon={ArrowUpFromLine} label="صرف" onClick={() => openOverlay('expense')} />
      </nav>
    </div>
  )
}

function NavLink({ label, icon: Icon, active, onClick }: { label: string; icon: ComponentType<{ className?: string }>; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${active ? 'bg-white text-olive' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
      <Icon className="size-4" />
      {label}
    </button>
  )
}

function GroupNav({ label, icon: Icon, activeKey, items, onPick, footer, menuAlign = 'start' }: { label: string; icon: ComponentType<{ className?: string }>; activeKey: PageKey; items: MenuItem[]; onPick: (key: PageKey) => void; footer?: (close: () => void) => ReactNode; menuAlign?: 'start' | 'end' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const sectionActive = items.some((item) => item.key === activeKey)
  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false) }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-current={sectionActive ? 'page' : undefined} className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${sectionActive ? 'bg-white text-olive' : open ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
        <Icon className="size-4" />
        {label}
        <ChevronDown className={`size-4 transition-transform ${open ? '-rotate-180' : ''}`} />
      </button>
      {/* The menu drops flush from its button with a small caret bridging the gap, so it
          reads as one connected surface rather than a detached card. */}
      {open ? (
        <div className={`menu-in absolute z-30 mt-1.5 w-52 ${menuAlign === 'end' ? 'end-0' : 'start-0'}`}>
          <span aria-hidden className={`absolute -top-1.5 size-3 rotate-45 border-l border-t border-border-strong bg-panel ${menuAlign === 'end' ? 'end-6' : 'start-6'}`} />
          <div role="menu" className="relative overflow-hidden rounded-xl border border-border-strong bg-panel py-1 shadow-[0_20px_44px_-18px_rgba(15,23,42,0.45)]">
            {items.map((item) => <button key={item.key} type="button" role="menuitemradio" aria-checked={activeKey === item.key} onClick={() => { onPick(item.key); setOpen(false) }} className={`flex w-full px-3.5 py-2 text-start text-sm ${activeKey === item.key ? 'font-semibold text-olive' : 'text-muted-foreground'} hover:bg-highlight`}>{item.label}</button>)}
            {footer ? footer(() => setOpen(false)) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ReportNav({ activeKey, onPick, onNewVoucher }: { activeKey: PageKey; onPick: (key: PageKey) => void; onNewVoucher: (kind: 'receive' | 'expense') => void }) {
  return (
    <GroupNav
      label="التقارير المالية"
      icon={FileText}
      activeKey={activeKey}
      items={REPORT_MENU}
      onPick={onPick}
      footer={(close) => (
        <>
          <div className="my-1 h-px bg-border" />
          <button type="button" role="menuitem" onClick={() => { close(); onNewVoucher('receive') }} className="flex w-full items-center gap-2 px-3.5 py-2 text-start text-sm font-medium text-foreground hover:bg-highlight">
            <ArrowDownToLine className="size-4 text-olive" />
            سند قبض
          </button>
          <button type="button" role="menuitem" onClick={() => { close(); onNewVoucher('expense') }} className="flex w-full items-center gap-2 px-3.5 py-2 text-start text-sm font-medium text-foreground hover:bg-highlight">
            <ArrowUpFromLine className="size-4 text-clay" />
            سند صرف
          </button>
        </>
      )}
    />
  )
}

function MobileGroupNav({ label, icon: Icon, activeKey, items, onPick }: { label: string; icon: ComponentType<{ className?: string }>; activeKey: PageKey; items: MenuItem[]; onPick: (key: PageKey) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const sectionActive = items.some((item) => item.key === activeKey)
  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false) }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <div ref={ref} className="relative flex flex-1 justify-center">
      {/* Menu is centred on-screen above the bar and width-clamped to the viewport,
          so a group button near the screen edge never has its menu clipped. */}
      {open ? <div role="menu" className="menu-fade fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] z-40 mx-auto w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border-strong bg-panel py-1 shadow-lg">
        {items.map((item) => <button key={item.key} type="button" role="menuitemradio" aria-checked={activeKey === item.key} onClick={() => { onPick(item.key); setOpen(false) }} className={`flex w-full px-4 py-3 text-start text-sm ${activeKey === item.key ? 'font-semibold text-olive' : 'text-foreground'}`}>{item.label}</button>)}
      </div> : null}
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${sectionActive ? 'text-olive' : 'text-muted-foreground'}`}>
        <span className={`grid size-8 place-items-center rounded-full ${sectionActive ? 'bg-olive-weak' : ''}`}><Icon className="size-[18px]" /></span>
        {label}
      </button>
    </div>
  )
}

function MobileNavButton({ icon: Icon, label, active, accent, onClick }: { icon: ComponentType<{ className?: string }>; label: string; active?: boolean; accent?: boolean; onClick: () => void }) {
  const color = accent ? 'text-olive' : active ? 'text-olive' : 'text-muted-foreground'
  return <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${color}`}>
    <span className={`grid size-8 place-items-center rounded-full ${active || accent ? 'bg-olive-weak' : ''}`}><Icon className="size-[18px]" /></span>
    {label}
  </button>
}
