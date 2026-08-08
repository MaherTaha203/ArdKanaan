import { create } from 'zustand'

// Navigation + session state for the workspace shell. This is UI state only.
// The "session" here is a visual boundary — it is NOT a security mechanism.
// Real authentication / RLS is a separate, owner-authorized decision.

export type ShellRoute = 'home' | 'students' | 'report' | 'settings'
export type ShellOverlay = 'receive' | 'expense' | null

type ShellStore = {
  authed: boolean
  route: ShellRoute
  selectedStudentId: string | null
  overlay: ShellOverlay
  receivePrefillName: string | null
  enter: () => void
  leave: () => void
  navigate: (route: ShellRoute) => void
  selectStudent: (studentId: string) => void
  openOverlay: (overlay: Exclude<ShellOverlay, null>) => void
  openReceiveFor: (studentName: string) => void
  closeOverlay: () => void
}

export const useShellStore = create<ShellStore>((set) => ({
  authed: false,
  route: 'home',
  selectedStudentId: null,
  overlay: null,
  receivePrefillName: null,
  enter: () => set({ authed: true, route: 'home' }),
  leave: () => set({ authed: false, overlay: null }),
  navigate: (route) => set({ route, overlay: null }),
  selectStudent: (studentId) =>
    set({ selectedStudentId: studentId, route: 'students', overlay: null }),
  openOverlay: (overlay) => set({ overlay, receivePrefillName: null }),
  openReceiveFor: (studentName) => set({ overlay: 'receive', receivePrefillName: studentName }),
  closeOverlay: () => set({ overlay: null, receivePrefillName: null }),
}))
