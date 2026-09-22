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

// Windowed navigation (UI only). The home page is a permanent base layer; every
// other page opens as a full-screen window over it. `route` is the ACTIVE view:
// 'home' means the base is showing (no window on top), any other value means that
// route's window is active/visible. `openWindows` is every page currently open as
// a window — each is kept mounted so its state survives minimizing; the windows
// that are not the active route are the minimized ones shown in the dock.
// This changes no data, no financial logic, and no workspace behavior: windows
// render the existing workspaces unchanged.

type ShellStore = {
  route: ShellRoute
  studentView: StudentView
  courseView: CourseView
  settingsView: SettingsView
  reportView: ReportView
  openWindows: ShellRoute[]
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
  navigate: (route: ShellRoute) => void
  navigateStudents: (view: StudentView) => void
  navigateCourses: (view: CourseView) => void
  navigateSettings: (view: SettingsView) => void
  navigateReport: (view: ReportView) => void
  selectStudent: (studentId: string) => void
  selectCourse: (courseId: string) => void
  // Window controls (UI only).
  minimizeActive: () => void
  focusWindow: (route: ShellRoute) => void
  closeWindow: (route: ShellRoute) => void
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

// Add a route to the open-windows list (idempotent, order preserved).
function opened(list: ShellRoute[], route: ShellRoute): ShellRoute[] {
  return list.includes(route) ? list : [...list, route]
}

export const useShellStore = create<ShellStore>((set) => ({
  route: 'home',
  studentView: 'directory',
  courseView: 'directory',
  settingsView: 'system',
  reportView: 'general',
  openWindows: [],
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
  navigate: (route) =>
    set((state) =>
      route === 'home'
        ? { route: 'home', ...CLEARED }
        : { route, openWindows: opened(state.openWindows, route), ...CLEARED },
    ),
  navigateStudents: (view) => set((state) => ({ route: 'students', studentView: view, openWindows: opened(state.openWindows, 'students'), ...CLEARED })),
  navigateCourses: (view) => set((state) => ({ route: 'courses', courseView: view, openWindows: opened(state.openWindows, 'courses'), ...CLEARED })),
  navigateSettings: (view) => set((state) => ({ route: 'settings', settingsView: view, openWindows: opened(state.openWindows, 'settings'), ...CLEARED })),
  navigateReport: (view) => set((state) => ({ route: 'report', reportView: view, openWindows: opened(state.openWindows, 'report'), ...CLEARED })),
  selectStudent: (studentId) => set((state) => ({ selectedStudentId: studentId, route: 'students', studentView: 'statement', openWindows: opened(state.openWindows, 'students'), ...CLEARED })),
  selectCourse: (courseId) => set((state) => ({ selectedCourseId: courseId, route: 'courses', courseView: 'detail', openWindows: opened(state.openWindows, 'courses'), ...CLEARED })),
  minimizeActive: () => set({ route: 'home', ...CLEARED }),
  focusWindow: (route) => set({ route, ...CLEARED }),
  closeWindow: (route) =>
    set((state) => ({
      openWindows: state.openWindows.filter((r) => r !== route),
      route: state.route === route ? 'home' : state.route,
      ...CLEARED,
    })),
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
