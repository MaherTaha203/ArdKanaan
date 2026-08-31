import { create } from 'zustand'

// Navigation + overlay state for the workspace shell — UI state only.
// Authentication now lives in use-auth-store (real Supabase Auth), and Postgres
// RLS is the security boundary; this store no longer models a "session".

export type ShellRoute = 'home' | 'students' | 'report' | 'settings'
export type ShellOverlay = 'receive' | 'expense' | 'student' | null
// The financial report has three lenses over the SAME derived movements — no view
// is a new source of truth. 'general' = full position, 'receipts'/'payments' = one side.
export type ReportView = 'general' | 'receipts' | 'payments'

type ShellStore = {
  route: ShellRoute
  reportView: ReportView
  selectedStudentId: string | null
  overlay: ShellOverlay
  receivePrefillName: string | null
  // When set, the open voucher overlay is editing this existing voucher (by id)
  // rather than creating a new one. Cleared whenever an overlay closes.
  editVoucherId: string | null
  // When set, the student overlay is editing this student's identity record.
  editStudentId: string | null
  navigate: (route: ShellRoute) => void
  navigateReport: (view: ReportView) => void
  selectStudent: (studentId: string) => void
  openOverlay: (overlay: Exclude<ShellOverlay, null | 'student'>) => void
  openReceiveFor: (studentName: string) => void
  openEditReceipt: (id: string) => void
  openEditPayment: (id: string) => void
  openEditStudent: (id: string) => void
  closeOverlay: () => void
}

// Every navigation/overlay transition clears BOTH edit targets so a stale id can
// never leak into the next overlay.
const CLEARED = { overlay: null, receivePrefillName: null, editVoucherId: null, editStudentId: null }

export const useShellStore = create<ShellStore>((set) => ({
  route: 'home',
  reportView: 'general',
  selectedStudentId: null,
  overlay: null,
  receivePrefillName: null,
  editVoucherId: null,
  editStudentId: null,
  navigate: (route) => set({ route, ...CLEARED }),
  navigateReport: (view) => set({ route: 'report', reportView: view, ...CLEARED }),
  selectStudent: (studentId) => set({ selectedStudentId: studentId, route: 'students', ...CLEARED }),
  openOverlay: (overlay) => set({ ...CLEARED, overlay }),
  openReceiveFor: (studentName) => set({ ...CLEARED, overlay: 'receive', receivePrefillName: studentName }),
  openEditReceipt: (id) => set({ ...CLEARED, overlay: 'receive', editVoucherId: id }),
  openEditPayment: (id) => set({ ...CLEARED, overlay: 'expense', editVoucherId: id }),
  openEditStudent: (id) => set({ ...CLEARED, overlay: 'student', editStudentId: id }),
  closeOverlay: () => set({ ...CLEARED }),
}))
