import { useEffect, useState, type ComponentType } from 'react'

import { BookOpen, ChevronDown, GraduationCap, HandCoins, Home, Landmark, LogOut, Menu, SlidersHorizontal, UserPlus, Wallet, X } from 'lucide-react'

import { useApplyRootSettings, useIdleLogout } from '@/hooks/use-app-preferences'
import { ReceiptSheet } from '@/features/receipt-voucher/receipt-sheet'
import { PaymentSheet } from '@/features/payment-voucher/payment-sheet'
import { StudentEditSheet } from '@/features/students/student-edit-sheet'
import { StudentArchiveSheet } from '@/features/students/student-archive-sheet'
import { StudentFeeSheet } from '@/features/students/student-fee-sheet'
import { ArchivedStudentsWorkspace } from '@/features/students/archived-students-workspace'
import { CourseFormSheet } from '@/features/courses/course-form-sheet'
import { EnrollStudentSheet } from '@/features/courses/enroll-student-sheet'
import { EnrollmentFeeSheet } from '@/features/courses/enrollment-fee-sheet'
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
import { useShellStore, pageSection, type PageKey, type ReportView, type ShellRoute } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { WindowFrame } from '@/components/shell/window-frame'
import { TabStrip } from '@/components/shell/tab-strip'
import { PAGE_META, tabDomId } from '@/components/shell/page-registry'

// ── Alternative A — Operational dashboard shell ────────────────────────────
// A persistent vertical sidebar replaces the top-bar dropdown menus: every
// destination is one click away (no menu to open first), and the mobile drawer
// carries the full set — including settings + sign-out, which the old mobile
// bottom bar omitted. The tab engine, overlays, and the store contract are
// untouched; only the navigation chrome changes.

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

function reportViewOf(key: PageKey): ReportView {
  return key.slice('report:'.length) as ReportView
}

// One PageKey → one page; report views pass their view as a prop. Unchanged.
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
  const editFeeEnrollmentId = useShellStore((state) => state.editFeeEnrollmentId)
  const receivePrefillName = useShellStore((state) => state.receivePrefillName)
  const openTab = useShellStore((state) => state.openTab)
  const openOverlay = useShellStore((state) => state.openOverlay)
  const openAddStudent = useShellStore((state) => state.openAddStudent)
  const signOut = useAuthStore((state) => state.signOut)
  const load = useWorkspaceStore((state) => state.load)
  const loaded = useWorkspaceStore((state) => state.loaded)

  const section = pageSection(activeTab)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useApplyRootSettings()
  useIdleLogout(signOut)

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar — the primary navigation surface. */}
      <aside className="hidden w-64 flex-none md:flex">
        <SidebarContent activeTab={activeTab} section={section} onNavigate={openTab} onSignOut={signOut} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="إغلاق القائمة" onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-[rgba(15,23,42,0.5)]" />
          <div className="menu-in absolute inset-y-0 end-0 flex w-[17rem] max-w-[85vw]">
            <SidebarContent activeTab={activeTab} section={section} onNavigate={(key) => { openTab(key); setDrawerOpen(false) }} onSignOut={signOut} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Slim light top bar: context + always-visible quick actions. */}
        <header className="sticky top-0 z-30 flex flex-none items-center gap-2 border-b border-border bg-panel px-3 py-2.5 md:px-6">
          <button type="button" onClick={() => setDrawerOpen(true)} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-highlight md:hidden" aria-label="فتح القائمة">
            <Menu className="size-5" />
          </button>
          <button type="button" onClick={() => openTab('home')} className="editorial text-[17px] text-foreground md:hidden">أرض كنعان</button>

          <div className="ms-auto flex items-center gap-1.5 md:gap-2">
            <button type="button" onClick={() => openAddStudent()} className="hidden items-center gap-1.5 rounded-full border border-border-strong bg-panel px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-highlight hover:text-foreground sm:inline-flex">
              <UserPlus className="size-4" />
              إضافة طالب
            </button>
            <button type="button" onClick={() => openOverlay('expense')} className="inline-flex items-center gap-1.5 rounded-full border border-clay/40 bg-clay-weak/50 px-3.5 py-2 text-[13px] font-semibold text-clay transition-colors hover:bg-clay-weak">
              <Wallet className="size-4" />
              <span className="hidden sm:inline">سند </span>صرف
            </button>
            <button type="button" onClick={() => openOverlay('receive')} className="inline-flex items-center gap-1.5 rounded-full bg-olive px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-olive-ink" aria-label="إنشاء سند قبض جديد">
              <HandCoins className="size-4" />
              <span className="hidden sm:inline">سند </span>قبض
            </button>
          </div>
        </header>

        <TabStrip />

        <main className="relative flex-1 overflow-hidden">
          {activeTab === 'home' ? (
            <section id="panel-home" role="tabpanel" aria-labelledby="tab-home" className="absolute inset-0 overflow-y-auto">
              <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-5 md:px-8 md:pt-6">
                <GlanceWorkspace />
              </div>
            </section>
          ) : null}

          {openTabs.filter((key) => key !== 'home').map((key) => {
            const domId = tabDomId(key)
            return (
              <WindowFrame key={key} active={activeTab === key} label={PAGE_META[key].title} panelId={`panel-${domId}`} labelledBy={`tab-${domId}`}>
                <div className={`mx-auto w-full px-4 pb-12 pt-5 md:px-8 md:pt-6 ${key.startsWith('report:') ? 'max-w-[1760px]' : 'max-w-[1440px]'}`}>
                  <div className="route-fade">
                    <PageView pageKey={key} />
                  </div>
                </div>
              </WindowFrame>
            )
          })}
        </main>
      </div>

      {overlay === 'receive' ? <ReceiptSheet key={editVoucherId ?? receivePrefillName ?? 'new'} /> : null}
      {overlay === 'expense' ? <PaymentSheet key={editVoucherId ?? 'new'} /> : null}
      {overlay === 'student' ? <StudentEditSheet key={editStudentId ?? 'new'} /> : null}
      {overlay === 'course' ? <CourseFormSheet key={editCourseId ?? 'new'} /> : null}
      {overlay === 'enroll' ? <EnrollStudentSheet key={enrollCourseId ?? 'new'} /> : null}
      {overlay === 'archive' ? <StudentArchiveSheet key={archiveStudentId ?? 'none'} /> : null}
      {overlay === 'student-fee' ? <StudentFeeSheet key={feeStudentId ?? 'none'} /> : null}
      {overlay === 'edit-fee' ? <EnrollmentFeeSheet key={editFeeEnrollmentId ?? 'none'} /> : null}

      <Toaster />
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
// Dark brand rail (slate-900). Single links + collapsible groups. Shared by the
// desktop aside and the mobile drawer.
function SidebarContent({
  activeTab,
  section,
  onNavigate,
  onSignOut,
  onClose,
}: {
  activeTab: PageKey
  section: ShellRoute
  onNavigate: (key: PageKey) => void
  onSignOut: () => void
  onClose?: () => void
}) {
  return (
    <div className="flex h-full w-full flex-col border-e border-white/10 bg-[#0f172a] text-white">
      <div className="flex flex-none items-center justify-between gap-2 px-5 py-4">
        <span className="editorial text-[19px] text-white">أرض كنعان</span>
        {onClose ? (
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 md:hidden" aria-label="إغلاق القائمة">
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <nav aria-label="التنقل" className="flex-1 overflow-y-auto px-3 pb-4">
        <SidebarLink label="الرئيسية" icon={Home} active={activeTab === 'home'} onClick={() => onNavigate('home')} />
        <SidebarGroup label="الطلاب" icon={GraduationCap} items={STUDENT_MENU} activeKey={activeTab} sectionActive={section === 'students'} onNavigate={onNavigate} />
        <SidebarLink label="الدورات" icon={BookOpen} active={section === 'courses'} onClick={() => onNavigate('courses:directory')} />
        <SidebarGroup label="التقارير المالية" icon={Landmark} items={REPORT_MENU} activeKey={activeTab} sectionActive={section === 'report'} onNavigate={onNavigate} />
        <SidebarGroup label="النظام" icon={SlidersHorizontal} items={SETTINGS_MENU} activeKey={activeTab} sectionActive={section === 'settings'} onNavigate={onNavigate} />
      </nav>

      <div className="flex-none border-t border-white/10 px-3 py-3">
        <button type="button" onClick={() => { onClose?.(); void onSignOut() }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm font-medium text-white/80 transition-colors hover:bg-clay/20 hover:text-white">
          <LogOut className="size-[18px]" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )
}

function SidebarLink({ label, icon: Icon, active, onClick }: { label: string; icon: ComponentType<{ className?: string }>; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={`mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm font-medium transition-colors ${active ? 'bg-white text-olive' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
      <Icon className="size-[18px] flex-none" />
      {label}
    </button>
  )
}

function SidebarGroup({ label, icon: Icon, items, activeKey, sectionActive, onNavigate }: { label: string; icon: ComponentType<{ className?: string }>; items: MenuItem[]; activeKey: PageKey; sectionActive: boolean; onNavigate: (key: PageKey) => void }) {
  const [open, setOpen] = useState(sectionActive)
  // Always expanded while one of its pages is active; otherwise the operator's
  // manual open/close choice applies.
  const expanded = open || sectionActive

  return (
    <div className="mb-1">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={expanded} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm font-medium transition-colors ${sectionActive ? 'text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
        <Icon className="size-[18px] flex-none" />
        <span className="flex-1">{label}</span>
        <ChevronDown className={`size-4 flex-none transition-transform ${expanded ? '-rotate-180' : ''}`} />
      </button>
      {expanded ? (
        <div className="mb-1 mt-0.5 space-y-0.5 ps-5">
          {items.map((item) => {
            const active = activeKey === item.key
            return (
              <button key={item.key} type="button" onClick={() => onNavigate(item.key)} aria-current={active ? 'page' : undefined} className={`flex w-full items-center gap-2 rounded-lg border-s border-white/10 px-3 py-2 text-start text-[13px] transition-colors ${active ? 'bg-white/10 font-semibold text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/90'}`}>
                {item.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
