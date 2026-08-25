import { create } from 'zustand'

// A tiny transient-notification store, co-located with the Toaster component (kept
// out of src/store/, which is reserved for the financial stores). Presentation only —
// it carries a message confirming an action already completed; it performs no action
// and holds no financial state. Posted vouchers are immutable, so there is
// deliberately no "undo" here — a reversal is a separate, governed cancellation
// action, never a toast.

type ToastTone = 'success' | 'info'

type ToastState = {
  id: number
  message: string | null
  tone: ToastTone
  show: (message: string, tone?: ToastTone) => void
  dismiss: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  id: 0,
  message: null,
  tone: 'success',
  // id increments so the same message shown twice still re-triggers the timer.
  show: (message, tone = 'success') => set((state) => ({ id: state.id + 1, message, tone })),
  dismiss: () => set({ message: null }),
}))
