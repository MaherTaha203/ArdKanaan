import { useEffect, useState, type ComponentType } from 'react'

import { BookOpen, GraduationCap, HandCoins, Home, Landmark, LogOut, Menu, SlidersHorizontal, Wallet, X } from 'lucide-react'

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
import { PAGE_META, tabDomId } from '@/components/shell/page-registry'

// ── Alternative C — Information-layout shell (two-tier nav) ─────────────────
// A clean light chrome built for scanning data: a primary section bar + a
// contextual sub-bar of that section's views, instead of the dark bar with
// dropdown menus and the browser-tab strip. Pages still persist (the openTabs
// engine and overlays are unchanged); only the navigation presentation changes.

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

const PRIMARY: { route: ShellRoute; label: string; icon: ComponentType<{ className?: string }>; defaultKey: PageKey }[] = [
  { route: 'home', label: 'الرئيسية', icon: Home, defaultKey: 'home' },
  { route: 'students', label: 'الطلاب', icon: GraduationCap, defaultKey: 'students:directory' },
  { route: 'courses', label: 'الدورات', icon: BookOpen, defaultKey: 'courses:directory' },
  { route: 'report', label: 'التقارير المالية', icon: Landmark, defaultKey: 'report:general' },
  { route: 'settings', label: 'النظام', icon: SlidersHorizontal, defaultKey: 'settings:system' },
]

const SECTION_VIEWS: Partial<Record<ShellRoute, MenuItem[]>> = {
  students: STUDENT_MENU,
  report: REPORT_MENU,
  settings: SETTINGS_MENU,
}

function reportViewOf(key: PageKey): ReportView {
  return key.slice('report:'.length) as ReportView
}

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
  const signOut = useAuthStore((state) => state.signOut)
  const load = useWorkspaceStore((state) => state.load)
  const loaded = useWorkspaceStore((state) => state.loaded)

  const section = pageSection(activeTab)
  const views = SECTION_VIEWS[section]
  const [drawerOpen, setDrawerOpen] = useState(false)

  useApplyRootSettings()
  useIdleLogout(signOut)

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  const pickInDrawer = (key: PageKey) => { openTab(key); setDrawerOpen(false) }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Primary bar — light, labelled sections. */}
      <header className="sticky top-0 z-40 flex flex-none items-center gap-2 border-b border-border bg-panel px-3 py-2.5 md:px-6">
        <button type="button" onClick={() => setDrawerOpen(true)} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-highlight md:hidden" aria-label="فتح القائمة">
          <Menu className="size-5" />
        </button>
        <button type="button" onClick={() => openTab('home')} className="editorial flex-none text-[18px] text-foreground">أرض كنعان</button>

        <nav aria-label="الأقسام" className="ms-4 hidden items-center gap-0.5 md:flex">
          {PRIMARY.map((item) => {
            const active = section === item.route
            return (
              <button key={item.route} type="button" onClick={() => openTab(item.defaultKey)} aria-current={active ? 'page' : undefined} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${active ? 'bg-highlight text-olive' : 'text-muted-foreground hover:bg-highlight hover:text-foreground'}`}>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="ms-auto flex flex-none items-center gap-1.5 md:gap-2">
          <button type="button" onClick={() => openOverlay('expense')} className="inline-flex items-center gap-1.5 rounded-full border border-clay/40 bg-clay-weak/50 px-3 py-1.5 text-xs font-semibold text-clay transition-colors hover:bg-clay-weak md:px-3.5 md:text-[13px]" aria-label="إنشاء سند صرف جديد">
            <Wallet className="size-4" />
            <span className="hidden sm:inline">سند </span>صرف
          </button>
          <button type="button" onClick={() => openOverlay('receive')} className="inline-flex items-center gap-1.5 rounded-full bg-olive px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-olive-ink md:px-3.5 md:text-[13px]" aria-label="إنشاء سند قبض جديد">
            <HandCoins className="size-4" />
            <span className="hidden sm:inline">سند </span>قبض
          </button>
          <button type="button" onClick={() => void signOut()} className="hidden size-9 place-items-center rounded-lg text-muted-foreground hover:bg-clay-weak hover:text-clay md:grid" aria-label="تسجيل الخروج">
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </header>

      {/* Contextual sub-bar — the active section's views. Hidden on the home dashboard. */}
      {views ? (
        <div className="flex flex-none items-center gap-1 overflow-x-auto border-b border-border bg-background px-3 py-1.5 md:px-6" role="tablist" aria-label="عرض القسم">
          {views.map((view) => {
            const active = activeTab === view.key
            return (
              <button key={view.key} type="button" role="tab" aria-selected={active} onClick={() => openTab(view.key)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${active ? 'bg-olive text-white' : 'text-muted-foreground hover:bg-highlight hover:text-foreground'}`}>
                {view.label}
              </button>
            )
          })}
        </div>
      ) : null}

      <main className="relative flex-1 overflow-hidden">
        {activeTab === 'home' ? (
          <section id="panel-home" role="tabpanel" aria-labelledby="tab-home" className="absolute inset-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-6">
              <GlanceWorkspace />
            </div>
          </section>
        ) : null}

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
      {overlay === 'edit-fee' ? <EnrollmentFeeSheet key={editFeeEnrollmentId ?? 'none'} /> : null}

      <Toaster />

      {/* Mobile drawer — the full grouped nav. */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="إغلاق القائمة" onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-[rgba(15,23,42,0.5)]" />
          <div className="menu-in absolute inset-y-0 end-0 flex w-[17rem] max-w-[85vw] flex-col overflow-y-auto border-s border-border bg-panel">
            <div className="flex flex-none items-center justify-between gap-2 border-b border-border px-4 py-3.5">
              <span className="editorial text-[18px] text-foreground">أرض كنعان</span>
              <button type="button" onClick={() => setDrawerOpen(false)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-highlight" aria-label="إغلاق القائمة"><X className="size-5" /></button>
            </div>
            <nav aria-label="التنقل" className="flex-1 px-2 py-3">
              {PRIMARY.map((item) => {
                const sectionViews = SECTION_VIEWS[item.route]
                const active = section === item.route
                return (
                  <div key={item.route} className="mb-1">
                    <button type="button" onClick={() => pickInDrawer(item.defaultKey)} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm font-semibold transition-colors ${active ? 'text-olive' : 'text-foreground hover:bg-highlight'}`}>
                      <item.icon className="size-[18px] flex-none" />
                      {item.label}
                    </button>
                    {sectionViews ? (
                      <div className="mt-0.5 space-y-0.5 ps-5">
                        {sectionViews.map((view) => (
                          <button key={view.key} type="button" onClick={() => pickInDrawer(view.key)} className={`flex w-full rounded-lg px-3 py-2 text-start text-[13px] ${activeTab === view.key ? 'bg-highlight font-semibold text-olive' : 'text-muted-foreground hover:bg-highlight'}`}>{view.label}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </nav>
            <div className="flex-none border-t border-border px-2 py-2">
              <button type="button" onClick={() => { setDrawerOpen(false); void signOut() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-start text-sm font-semibold text-clay hover:bg-clay-weak"><LogOut className="size-[18px]" />تسجيل الخروج</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
