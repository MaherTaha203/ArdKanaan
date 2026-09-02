import { appEnv } from '@/lib/env'

export function ConfigNotice() {
  if (appEnv.isSupabaseConfigured) return null

  return (
    <div className="mb-6 rounded-2xl border border-warn/25 bg-warn-weak px-5 py-4 text-sm leading-6 text-warn">
      التطبيق جاهز تقنيًا، لكن الاتصال بقاعدة البيانات يحتاج إلى استكمال بيانات البيئة المحلية
      (<span className="figure">VITE_SUPABASE_URL</span> و <span className="figure">VITE_SUPABASE_ANON_KEY</span>)
      قبل عرض البيانات الحقيقية.
    </div>
  )
}

export function ErrorNotice({
  message,
  onDismiss,
  onRetry,
}: {
  message: string | null
  onDismiss: () => void
  // When provided (e.g. a failed data load), offer an explicit retry alongside dismiss.
  onRetry?: () => void
}) {
  if (!message) return null

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-clay/25 bg-clay-weak px-5 py-4 text-sm text-clay sm:flex-row sm:items-center sm:justify-between">
      <span>{message}</span>
      <div className="flex items-center gap-4 self-start sm:self-auto">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="font-medium text-clay underline-offset-2"
          >
            أعد المحاولة
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          className="text-clay/80 underline-offset-2"
        >
          إخفاء
        </button>
      </div>
    </div>
  )
}