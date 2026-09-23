import { useEffect, useRef, useState, type ComponentType } from 'react'

import { ArrowDownLeft, ArrowUpRight, BookOpen, ChevronDown, FileText, Home, LogOut, Settings, Users } from 'lucide-react'

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
import { useShellStore, type CourseView, type ReportView, type SettingsView, type StudentView } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { WindowFrame } from '@/components/shell/window-frame'
import { TabStrip } from '@/components/shell/tab-strip'
import { WINDOW_META, type WindowRoute } from '@/components/shell/window-registry'

type MenuItem<T> = { value: T; label: string }

const REPORT_MENU: MenuItem<ReportView>[] = [
  { value: 'general', label: 'كشف الحساب العام' },
  { value: 'receipts', label: 'تقرير المقبوضات' },
  { value: 'payments', label: 'تقرير المدفوعات' },
  { value: 'external', label: 'الجهات الخارجية' },
]

const STUDENT_MENU: MenuItem<StudentView>[] = [
  { value: 'directory', label: 'دليل الطلاب' },
  { value: 'statement', label: 'كشف الحساب' },
  { value: 'archived', label: 'المؤرشفون' },
]

const SETTINGS_MENU: MenuItem<SettingsView>[] = [
  { value: 'system', label: 'الإعدادات' },
  { value: 'backup', label: 'النسخ الاحتياطي' },
  { value: 'activity', label: 'سجل التدقيق' },
]

// The page shown inside a window. Mirrors the old single-view switch, minus 'home'
// (home is the permanent base layer). Reads sub-view state from the store exactly
// as before — the workspaces are unchanged.
function RouteView({ route }: { route: WindowRoute }) {
  const studentView = useShellStore((state) => state.studentView)
  const courseView = useShellStore((state) => state.courseView)
  const settingsView = useShellStore((state) => state.settingsView)
  switch (route) {
    case 'students':
      if (studentView === 'archived') return <ArchivedStudentsWorkspace />
      return studentView === 'directory' ? <StudentDirectoryWorkspace /> : <StudentsWorkspace />
    case 'courses':
      return courseView === 'detail' ? <CourseDetailWorkspace /> : <CoursesWorkspace />
    case 'report':
      return <FinancialReportWorkspace />
    case 'activity':
      return <ActivityWorkspace />
    case 'settings':
      if (settingsView === 'backup') return <BackupWorkspace />
      if (settingsView === 'activity') return <ActivityWorkspace />
      return <SettingsWorkspace />
  }
}

// Keyed by the active sub-view so switching sub-views remounts the page (matching
// the previous behaviour + entrance fade); minimizing/restoring keeps the same key,
// so the window stays mounted and its state survives.
function subviewKey(route: WindowRoute, studentView: StudentView, courseView: CourseView, settingsView: SettingsView, reportView: ReportView): string {
  switch (route) {
    case 'students':
      return `students:${studentView}`
    case 'courses':
      return `courses:${courseView}`
    case 'settings':
      return `settings:${settingsView}`
    case 'report':
      return `report:${reportView}`
    default:
      return route
  }
}

export function AppShell() {
  const route = useShellStore((state) => state.route)
  const studentView = useShellStore((state) => state.studentView)
  const courseView = useShellStore((state) => state.courseView)
  const settingsView = useShellStore((state) => state.settingsView)
  const reportView = useShellStore((state) => state.reportView)
  const openWindows = useShellStore((state) => state.openWindows)
  const overlay = useShellStore((state) => state.overlay)
  const editVoucherId = useShellStore((state) => state.editVoucherId)
  const editStudentId = useShellStore((state) => state.editStudentId)
  const editCourseId = useShellStore((state) => state.editCourseId)
  const enrollCourseId = useShellStore((state) => state.enrollCourseId)
  const archiveStudentId = useShellStore((state) => state.archiveStudentId)
  const feeStudentId = useShellStore((state) => state.feeStudentId)
  const receivePrefillName = useShellStore((state) => state.receivePrefillName)
  const navigate = useShellStore((state) => state.navigate)
  const navigateStudents = useShellStore((state) => state.navigateStudents)
  const navigateCourses = useShellStore((state) => state.navigateCourses)
  const navigateSettings = useShellStore((state) => state.navigateSettings)
  const navigateReport = useShellStore((state) => state.navigateReport)
  const openOverlay = useShellStore((state) => state.openOverlay)
  const signOut = useAuthStore((state) => state.signOut)
  const load = useWorkspaceStore((state) => state.load)
  const loaded = useWorkspaceStore((state) => state.loaded)

  useApplyRootSettings()
  useIdleLogout(signOut)

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex flex-none items-center gap-2 border-b border-white/10 bg-[#0f172a] px-4 py-2.5 text-white shadow-[0_10px_28px_-20px_rgba(15,23,42,0.9)] md:gap-4 md:px-8">
        <button type="button" onClick={() => navigate('home')} className="flex items-baseline gap-2">
          <span className="editorial text-[19px] text-white">أرض كنعان</span>
        </button>

        <nav aria-label="التنقل" className="ms-6 hidden items-center gap-1 md:flex">
          <NavLink label="الرئيسية" icon={Home} active={route === 'home'} onClick={() => navigate('home')} />
          <GroupNav label="الطلاب" icon={Users} active={route === 'students'} value={studentView} items={STUDENT_MENU} onPick={navigateStudents} />
          <NavLink label="الدورات" icon={BookOpen} active={route === 'courses'} onClick={() => navigateCourses('directory')} />
          <ReportNav active={route === 'report'} reportView={reportView} onPick={navigateReport} />
          <GroupNav label="إعدادات" icon={Settings} active={route === 'settings' || route === 'activity'} value={settingsView} items={SETTINGS_MENU} onPick={navigateSettings} />
        </nav>

        <div className="ms-auto flex items-center gap-1.5 md:gap-2">
          <button type="button" onClick={() => openOverlay('receive')} className="hidden items-center gap-2 rounded-full bg-olive px-4 py-2 text-[13px] font-semibold text-white shadow-sm sm:inline-flex">
            <ArrowDownLeft className="size-4" />
            سند قبض
          </button>
          <button type="button" onClick={() => openOverlay('expense')} className="hidden items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-[13px] font-semibold text-white/90 hover:bg-white/10 sm:inline-flex">
            <ArrowUpRight className="size-4" />
            سند صرف
          </button>
          <button type="button" onClick={() => void signOut()} aria-label="خروج" className="rounded-full p-2 text-white/80 hover:text-white">
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </header>

      <TabStrip />

      <main className="relative flex-1 overflow-hidden">
        {/* Home — the first tab, always available. It is shown when it is the active
            tab; home carries no user input to preserve, so it mounts when active while
            the other pages are the ones kept mounted for their state. */}
        {route === 'home' ? (
          <section id="panel-home" role="tabpanel" aria-labelledby="tab-home" className="absolute inset-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-6">
              <GlanceWorkspace />
            </div>
          </section>
        ) : null}

        {/* Open pages — each a chrome-free panel filling the content area, kept mounted
            so its state survives while another tab is active. Only the active one shows. */}
        {(openWindows as WindowRoute[]).map((r) => (
          <WindowFrame key={r} active={route === r} label={WINDOW_META[r].title} panelId={`panel-${r}`} labelledBy={`tab-${r}`}>
            <div className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-6">
              <div key={subviewKey(r, studentView, courseView, settingsView, reportView)} className="route-fade">
                <RouteView route={r} />
              </div>
            </div>
          </WindowFrame>
        ))}
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
        <MobileNavButton active={route === 'home'} icon={Home} label="الرئيسية" onClick={() => navigate('home')} />
        <MobileGroupNav label="الطلاب" icon={Users} active={route === 'students'} value={studentView} items={STUDENT_MENU} onPick={navigateStudents} />
        <MobileNavButton active={route === 'courses'} icon={BookOpen} label="الدورات" onClick={() => navigateCourses('directory')} />
        <MobileGroupNav label="التقرير" icon={FileText} active={route === 'report'} value={reportView} items={REPORT_MENU} onPick={navigateReport} />
        <MobileGroupNav label="إعدادات" icon={Settings} active={route === 'settings' || route === 'activity'} value={settingsView} items={SETTINGS_MENU} onPick={navigateSettings} />
        <MobileNavButton icon={ArrowDownLeft} label="قبض" accent onClick={() => openOverlay('receive')} />
        <MobileNavButton icon={ArrowUpRight} label="صرف" onClick={() => openOverlay('expense')} />
      </nav>
    </div>
  )
}

function NavLink({ label, icon: Icon, active, onClick }: { label: string; icon: ComponentType<{ className?: string }>; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium ${active ? 'bg-white text-olive' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
      <Icon className="size-4" />
      {label}
    </button>
  )
}

function GroupNav<T extends string>({ label, icon: Icon, active, value, items, onPick }: { label: string; icon: ComponentType<{ className?: string }>; active: boolean; value: T; items: MenuItem<T>[]; onPick: (value: T) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
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
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-current={active ? 'page' : undefined} className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium ${active ? 'bg-white text-olive' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
        <Icon className="size-4" />
        {label}
        <ChevronDown className="size-4" />
      </button>
      {open ? <div role="menu" className="menu-in absolute start-0 z-30 mt-1 w-48 overflow-hidden rounded-xl border border-border-strong bg-panel py-1 shadow-lg">
        {items.map((item) => <button key={item.value} type="button" role="menuitemradio" aria-checked={active && value === item.value} onClick={() => { onPick(item.value); setOpen(false) }} className={`flex w-full px-3.5 py-2 text-start text-sm ${active && value === item.value ? 'font-semibold text-olive' : 'text-muted-foreground'}`}>{item.label}</button>)}
      </div> : null}
    </div>
  )
}

function ReportNav({ active, reportView, onPick }: { active: boolean; reportView: ReportView; onPick: (view: ReportView) => void }) {
  return <GroupNav label="التقارير المالية" icon={FileText} active={active} value={reportView} items={REPORT_MENU} onPick={onPick} />
}

function MobileGroupNav<T extends string>({ label, icon: Icon, active, value, items, onPick }: { label: string; icon: ComponentType<{ className?: string }>; active: boolean; value: T; items: MenuItem<T>[]; onPick: (value: T) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
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
        {items.map((item) => <button key={item.value} type="button" role="menuitemradio" aria-checked={active && value === item.value} onClick={() => { onPick(item.value); setOpen(false) }} className={`flex w-full px-4 py-3 text-start text-sm ${active && value === item.value ? 'font-semibold text-olive' : 'text-foreground'}`}>{item.label}</button>)}
      </div> : null}
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${active ? 'text-olive' : 'text-muted-foreground'}`}>
        <span className={`grid size-8 place-items-center rounded-full ${active ? 'bg-olive-weak' : ''}`}><Icon className="size-[18px]" /></span>
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
