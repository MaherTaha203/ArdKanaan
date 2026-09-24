import { create } from 'zustand'

// Navigation + overlay state for the workspace shell — UI state only.
// Authentication now lives in use-auth-store (real Supabase Auth), and Postgres
// RLS is the security boundary; this store no longer models a "session".

export type ShellRoute = 'home' | 'students' | 'courses' | 'report' | 'activity' | 'settings'
export type StudentView = 'directory' | 'statement' | 'archived'
export type CourseView = 'directory' | 'detail'
export type SettingsView = 'system' | 'activity' | 'backup'
export type ShellOverlay = 'receive' | 'expense' | 'student' | 'course' | 'enroll' | 'archive' | 'student-fee' | null
export type ReportView = 'general' | 'receipts' | 'payments' | 'external'

// Tabbed navigation (UI only). Every page a person can open is its own PageKey — a
// section plus its sub-view — so opening «الإعدادات» then «سجل التدقيق» keeps a named
// tab for each instead of collapsing them under one section. The home page is the
// permanent first tab and cannot be closed. `activeTab` is the visible page; `openTabs`
// is every open tab, kept mounted so each page's state survives while another is active.
// This changes no data, no financial logic, and no workspace behavior.
export type PageKey =
  | 'home'
  | 'students:directory'
  | 'students:statement'
  | 'students:archived'
  | 'courses:directory'
  | 'courses:detail'
  | 'report:general'
  | 'report:receipts'
  | 'report:payments'
  | 'report:external'
  | 'settings:system'
  | 'settings:backup'
  | 'settings:activity'

// The default page each top-bar section opens to.
const ROUTE_DEFAULT: Record<ShellRoute, PageKey> = {
  home: 'home',
  students: 'students:directory',
  courses: 'courses:directory',
  report: 'report:general',
  activity: 'settings:activity',
  settings: 'settings:system',
}

// The section (top-bar group) a page belongs to — drives nav highlighting. Both the
// system and audit pages live under the «النظام» (settings) group.
export function pageSection(key: PageKey): ShellRoute {
  if (key === 'home') return 'home'
  const prefix = key.slice(0, key.indexOf(':')) as 'students' | 'courses' | 'report' | 'settings'
  return prefix
}

type ShellStore = {
  activeTab: PageKey
  openTabs: PageKey[]
  selectedStudentId: string | null
  selectedCourseId: string | null
  overlay: ShellOverlay
  receivePrefillName: string | null
  editVoucherId: string | null
  editStudentId: string | null
  editCourseId: string | null
  enrollCourseId: string | null
  archiveStudentId: string | null
  feeStudentId: string | null
  // Tab controls (UI only).
  openTab: (key: PageKey) => void
  focusTab: (key: PageKey) => void
  closeTab: (key: PageKey) => void
  // Section navigation — kept for callers that open a page by its top-bar section.
  navigate: (route: ShellRoute) => void
  navigateStudents: (view: StudentView) => void
  navigateCourses: (view: CourseView) => void
  navigateSettings: (view: SettingsView) => void
  navigateReport: (view: ReportView) => void
  selectStudent: (studentId: string) => void
  selectCourse: (courseId: string) => void
  openOverlay: (overlay: Exclude<ShellOverlay, null | 'student' | 'course' | 'enroll' | 'student-fee'>) => void
  openReceiveFor: (studentName: string) => void
  openEditReceipt: (id: string) => void
  openEditPayment: (id: string) => void
  openEditStudent: (id: string) => void
  openAddStudent: () => void
  openAddCourse: () => void
  openEditCourse: (id: string) => void
  openEnroll: (courseId: string) => void
  openArchive: (studentId: string) => void
  openStudentFee: (studentId: string) => void
  closeOverlay: () => void
}

const CLEARED = {
  overlay: null,
  receivePrefillName: null,
  editVoucherId: null,
  editStudentId: null,
  editCourseId: null,
  enrollCourseId: null,
  archiveStudentId: null,
  feeStudentId: null,
} as const

// Open (or focus) a tab: make it active and ensure it is in the open list, order
// preserved. Home is always present as the first tab.
function withTab(openTabs: PageKey[], key: PageKey): { activeTab: PageKey; openTabs: PageKey[] } {
  return {
    activeTab: key,
    openTabs: openTabs.includes(key) ? openTabs : [...openTabs, key],
  }
}

export const useShellStore = create<ShellStore>((set) => ({
  activeTab: 'home',
  openTabs: ['home'],
  selectedStudentId: null,
  selectedCourseId: null,
  overlay: null,
  receivePrefillName: null,
  editVoucherId: null,
  editStudentId: null,
  editCourseId: null,
  enrollCourseId: null,
  archiveStudentId: null,
  feeStudentId: null,
  openTab: (key) => set((state) => ({ ...withTab(state.openTabs, key), ...CLEARED })),
  focusTab: (key) => set((state) => ({ ...withTab(state.openTabs, key), ...CLEARED })),
  closeTab: (key) =>
    set((state) => {
      if (key === 'home') return state
      const index = state.openTabs.indexOf(key)
      const openTabs = state.openTabs.filter((tab) => tab !== key)
      // When closing the active tab, fall back to the tab on its start side (or home).
      const activeTab = state.activeTab === key ? openTabs[index - 1] ?? 'home' : state.activeTab
      return { openTabs, activeTab, ...CLEARED }
    }),
  navigate: (route) => set((state) => ({ ...withTab(state.openTabs, ROUTE_DEFAULT[route]), ...CLEARED })),
  navigateStudents: (view) => set((state) => ({ ...withTab(state.openTabs, `students:${view}`), ...CLEARED })),
  navigateCourses: (view) => set((state) => ({ ...withTab(state.openTabs, `courses:${view}`), ...CLEARED })),
  navigateSettings: (view) => set((state) => ({ ...withTab(state.openTabs, `settings:${view}`), ...CLEARED })),
  navigateReport: (view) => set((state) => ({ ...withTab(state.openTabs, `report:${view}`), ...CLEARED })),
  selectStudent: (studentId) => set((state) => ({ selectedStudentId: studentId, ...withTab(state.openTabs, 'students:statement'), ...CLEARED })),
  selectCourse: (courseId) => set((state) => ({ selectedCourseId: courseId, ...withTab(state.openTabs, 'courses:detail'), ...CLEARED })),
  openOverlay: (overlay) => set({ ...CLEARED, overlay }),
  openReceiveFor: (studentName) => set({ ...CLEARED, overlay: 'receive', receivePrefillName: studentName }),
  openEditReceipt: (id) => set({ ...CLEARED, overlay: 'receive', editVoucherId: id }),
  openEditPayment: (id) => set({ ...CLEARED, overlay: 'expense', editVoucherId: id }),
  openEditStudent: (id) => set({ ...CLEARED, overlay: 'student', editStudentId: id }),
  openAddStudent: () => set({ ...CLEARED, overlay: 'student' }),
  openAddCourse: () => set({ ...CLEARED, overlay: 'course' }),
  openEditCourse: (id) => set({ ...CLEARED, overlay: 'course', editCourseId: id }),
  openEnroll: (courseId) => set({ ...CLEARED, overlay: 'enroll', enrollCourseId: courseId }),
  openArchive: (studentId) => set({ ...CLEARED, overlay: 'archive', archiveStudentId: studentId }),
  openStudentFee: (studentId) => set({ ...CLEARED, overlay: 'student-fee', feeStudentId: studentId }),
  closeOverlay: () => set({ ...CLEARED }),
}))
