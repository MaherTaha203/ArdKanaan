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
  // When set, the open voucher overlay is editing this existing voucher (by id)
  // rather than creating a new one. Cleared whenever an overlay closes.
  editVoucherId: string | null
  navigate: (route: ShellRoute) => void
  navigateReport: (view: ReportView) => void
  selectStudent: (studentId: string) => void
  openOverlay: (overlay: Exclude<ShellOverlay, null>) => void
  openReceiveFor: (studentName: string) => void
  openEditReceipt: (id: string) => void
  openEditPayment: (id: string) => void
  closeOverlay: () => void
}

export const useShellStore = create<ShellStore>((set) => ({
  route: 'home',
  reportView: 'general',
  selectedStudentId: null,
  overlay: null,
  receivePrefillName: null,
  editVoucherId: null,
  navigate: (route) => set({ route, overlay: null, editVoucherId: null }),
  navigateReport: (view) =>
    set({ route: 'report', reportView: view, overlay: null, editVoucherId: null }),
  selectStudent: (studentId) =>
    set({ selectedStudentId: studentId, route: 'students', overlay: null, editVoucherId: null }),
  openOverlay: (overlay) => set({ overlay, receivePrefillName: null, editVoucherId: null }),
  openReceiveFor: (studentName) =>
    set({ overlay: 'receive', receivePrefillName: studentName, editVoucherId: null }),
  openEditReceipt: (id) => set({ overlay: 'receive', receivePrefillName: null, editVoucherId: id }),
  openEditPayment: (id) => set({ overlay: 'expense', receivePrefillName: null, editVoucherId: id }),
  closeOverlay: () => set({ overlay: null, receivePrefillName: null, editVoucherId: null }),
}))
