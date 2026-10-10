import { useEffect, useRef, useState, type ComponentType } from 'react'

import { HandCoins, Home, LogOut, Search, SlidersHorizontal, Wallet } from 'lucide-react'

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
import { CommandPalette } from '@/components/shell/command-palette'
import { useAuthStore } from '@/store/use-auth-store'
import { useShellStore, type PageKey, type ReportView } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import { WindowFrame } from '@/components/shell/window-frame'
import { TabStrip } from '@/components/shell/tab-strip'
import { PAGE_META, tabDomId } from '@/components/shell/page-registry'

// ── Alternative B — Fast-workflow shell (search-first) ─────────────────────
// Navigation collapses onto one command/search surface (⌘/Ctrl-K or the big
// top-bar search): jump to any student or run any action without walking a
// menu. The many top-bar dropdowns become a single "الأقسام" list; the two
// most-used actions stay one tap away. The tab engine, overlays, and the store
// contract are untouched.

type MenuItem = { key: PageKey; label: string }

const SECTIONS: { heading: string; items: MenuItem[] }[] = [
  { heading: 'عام', items: [{ key: 'home', label: 'الرئيسية' }] },
  { heading: 'الطلاب', items: [
    { key: 'students:directory', label: 'دليل الطلاب' },
    { key: 'students:statement', label: 'كشف الحساب' },
    { key: 'students:archived', label: 'المؤرشفون' },
  ] },
  { heading: 'الدورات', items: [{ key: 'courses:directory', label: 'الدورات' }] },
  { heading: 'التقارير المالية', items: [
    { key: 'report:general', label: 'كشف الحساب العام' },
    { key: 'report:receipts', label: 'تقرير المقبوضات' },
    { key: 'report:payments', label: 'تقرير المدفوعات' },
    { key: 'report:external', label: 'الجهات الخارجية' },
  ] },
  { heading: 'النظام', items: [
    { key: 'settings:system', label: 'الإعدادات' },
    { key: 'settings:backup', label: 'النسخ الاحتياطي' },
    { key: 'settings:activity', label: 'سجل التدقيق' },
  ] },
]

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

  const [paletteOpen, setPaletteOpen] = useState(false)

  useApplyRootSettings()
  useIdleLogout(signOut)

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  // ⌘/Ctrl-K toggles the command palette from anywhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === 'K')) {
        event.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex flex-none items-center gap-2 border-b border-white/10 bg-[#0f172a] px-3 py-2.5 text-white md:gap-4 md:px-6">
        <button type="button" onClick={() => openTab('home')} className="editorial flex-none text-[19px] text-white">أرض كنعان</button>

        {/* The search is the primary navigation surface. */}
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="mx-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-start text-white/60 transition-colors hover:bg-white/10 md:mx-3 md:max-w-xl"
          aria-label="بحث وإجراءات سريعة"
        >
          <Search className="size-4 flex-none" />
          <span className="min-w-0 flex-1 truncate text-[13px]">ابحث عن طالب أو إجراء…</span>
          <kbd className="figure hidden flex-none rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/50 sm:block">⌘K</kbd>
        </button>

        <div className="flex flex-none items-center gap-1.5 md:gap-2">
          <button type="button" onClick={() => openOverlay('receive')} className="inline-flex items-center gap-1.5 rounded-full bg-olive px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-olive-ink md:px-3.5 md:text-sm" aria-label="إنشاء سند قبض جديد">
            <HandCoins className="size-4" />
            <span className="hidden sm:inline">قبض</span>
          </button>
          <button type="button" onClick={() => openOverlay('expense')} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 md:px-3.5 md:text-sm" aria-label="إنشاء سند صرف جديد">
            <Wallet className="size-4" />
            <span className="hidden sm:inline">صرف</span>
          </button>
          <SectionsMenu activeKey={activeTab} onPick={openTab} onSignOut={signOut} />
        </div>
      </header>

      <TabStrip />

      <main className="relative flex-1 overflow-hidden">
        {activeTab === 'home' ? (
          <section id="panel-home" role="tabpanel" aria-labelledby="tab-home" className="absolute inset-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-6">
              <GlanceWorkspace onOpenSearch={() => setPaletteOpen(true)} />
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

      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
      <Toaster />

      {/* Mobile bottom bar — search stays front-and-centre. */}
      <nav aria-label="التنقل" className="fixed inset-x-0 bottom-0 z-20 flex flex-none items-stretch justify-around border-t border-border bg-panel/95 px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] md:hidden">
        <MobileButton active={activeTab === 'home'} icon={Home} label="الرئيسية" onClick={() => openTab('home')} />
        <MobileButton icon={Search} label="بحث" accent onClick={() => setPaletteOpen(true)} />
        <MobileButton icon={HandCoins} label="قبض" onClick={() => openOverlay('receive')} />
        <MobileButton icon={Wallet} label="صرف" onClick={() => openOverlay('expense')} />
      </nav>
    </div>
  )
}

// A single consolidated sections menu — all pages grouped, plus sign-out. The
// search palette is the fast path; this stays for discoverable browsing.
function SectionsMenu({ activeKey, onPick, onSignOut }: { activeKey: PageKey; onPick: (key: PageKey) => void; onSignOut: () => void }) {
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
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} className={`grid size-9 place-items-center rounded-full transition-colors ${open ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`} aria-label="الأقسام">
        <SlidersHorizontal className="size-5" />
      </button>
      {open ? (
        <div className="menu-in absolute end-0 z-30 mt-1.5 max-h-[70vh] w-60 overflow-y-auto rounded-xl border border-border-strong bg-panel py-1.5 shadow-[0_20px_44px_-18px_rgba(15,23,42,0.45)]" role="menu">
          {SECTIONS.map((group) => (
            <div key={group.heading} className="px-1">
              <div className="px-3 pb-0.5 pt-2 text-[11px] font-bold text-faint">{group.heading}</div>
              {group.items.map((item) => (
                <button key={item.key} type="button" role="menuitemradio" aria-checked={activeKey === item.key} onClick={() => { onPick(item.key); setOpen(false) }} className={`flex w-full rounded-lg px-3 py-2 text-start text-sm ${activeKey === item.key ? 'bg-highlight font-semibold text-olive' : 'text-muted-foreground hover:bg-highlight'}`}>{item.label}</button>
              ))}
            </div>
          ))}
          <div className="my-1 h-px bg-border" />
          <button type="button" role="menuitem" onClick={() => { setOpen(false); void onSignOut() }} className="mx-1 flex items-center gap-2 rounded-lg px-3 py-2 text-start text-sm font-semibold text-clay hover:bg-clay-weak">
            <LogOut className="size-4" />
            تسجيل الخروج
          </button>
        </div>
      ) : null}
    </div>
  )
}

function MobileButton({ icon: Icon, label, active, accent, onClick }: { icon: ComponentType<{ className?: string }>; label: string; active?: boolean; accent?: boolean; onClick: () => void }) {
  const color = accent || active ? 'text-olive' : 'text-muted-foreground'
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${color}`}>
      <span className={`grid size-8 place-items-center rounded-full ${active || accent ? 'bg-olive-weak' : ''}`}><Icon className="size-[18px]" /></span>
      {label}
    </button>
  )
}
