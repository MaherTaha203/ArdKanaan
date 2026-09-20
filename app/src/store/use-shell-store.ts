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

type ShellStore = {
  route: ShellRoute
  studentView: StudentView
  courseView: CourseView
  settingsView: SettingsView
  reportView: ReportView
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

export const useShellStore = create<ShellStore>((set) => ({
  route: 'home',
  studentView: 'directory',
  courseView: 'directory',
  settingsView: 'system',
  reportView: 'general',
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
  navigate: (route) => set({ route, ...CLEARED }),
  navigateStudents: (view) => set({ route: 'students', studentView: view, ...CLEARED }),
  navigateCourses: (view) => set({ route: 'courses', courseView: view, ...CLEARED }),
  navigateSettings: (view) => set({ route: 'settings', settingsView: view, ...CLEARED }),
  navigateReport: (view) => set({ route: 'report', reportView: view, ...CLEARED }),
  selectStudent: (studentId) => set({ selectedStudentId: studentId, route: 'students', studentView: 'statement', ...CLEARED }),
  selectCourse: (courseId) => set({ selectedCourseId: courseId, route: 'courses', courseView: 'detail', ...CLEARED }),
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
