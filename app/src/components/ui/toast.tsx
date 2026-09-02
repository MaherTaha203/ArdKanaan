import { useEffect } from 'react'

import { CheckCircle2, Info, X } from 'lucide-react'

import { useToastStore } from '@/components/ui/use-toast-store'

const TOAST_DURATION_MS = 4000

export function Toaster() {
  const id = useToastStore((state) => state.id)
  const message = useToastStore((state) => state.message)
  const tone = useToastStore((state) => state.tone)
  const dismiss = useToastStore((state) => state.dismiss)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(dismiss, TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [id, message, dismiss])

  if (!message) return null

  const Icon = tone === 'success' ? CheckCircle2 : Info

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex max-w-[90vw] items-center gap-3 rounded-full bg-foreground px-5 py-3 text-[13px] font-medium text-white shadow-soft"
      >
        <Icon
          className={`size-4 flex-none ${tone === 'success' ? 'text-emerald-400' : 'text-sky-300'}`}
          aria-hidden
        />
        <span className="truncate">{message}</span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="إغلاق الإشعار"
          className="-me-1 rounded-full p-1 text-white/60"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
