import { create } from 'zustand'

// Navigation + overlay state for the workspace shell — UI state only.
// Authentication now lives in use-auth-store (real Supabase Auth), and Postgres
// RLS is the security boundary; this store no longer models a "session".

export type ShellRoute = 'home' | 'students' | 'report' | 'settings'
export type ShellOverlay = 'receive' | 'expense' | null
// The financial report has three lenses over the SAME derived movements — no view
// is a new source of truth. 'general' = full position, 'receipts'/'payments' = one side.
export type ReportView = 'general' | 'receipts' | 'payments'

type ShellStore = {
  route: ShellRoute
  reportView: ReportView
  selectedStudentId: string | null
  overlay: ShellOverlay
  receivePrefillName: string | null
  navigate: (route: ShellRoute) => void
  navigateReport: (view: ReportView) => void
  selectStudent: (studentId: string) => void
  openOverlay: (overlay: Exclude<ShellOverlay, null>) => void
  openReceiveFor: (studentName: string) => void
  closeOverlay: () => void
}

export const useShellStore = create<ShellStore>((set) => ({
  route: 'home',
  reportView: 'general',
  selectedStudentId: null,
  overlay: null,
  receivePrefillName: null,
  navigate: (route) => set({ route, overlay: null }),
  navigateReport: (view) => set({ route: 'report', reportView: view, overlay: null }),
  selectStudent: (studentId) =>
    set({ selectedStudentId: studentId, route: 'students', overlay: null }),
  openOverlay: (overlay) => set({ overlay, receivePrefillName: null }),
  openReceiveFor: (studentName) => set({ overlay: 'receive', receivePrefillName: studentName }),
  closeOverlay: () => set({ overlay: null, receivePrefillName: null }),
}))
