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

export function ErrorNotice({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  if (!message) return null

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-clay/25 bg-clay-weak px-5 py-4 text-sm text-clay sm:flex-row sm:items-center sm:justify-between">
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="self-start text-clay/80 underline-offset-2 hover:underline sm:self-auto"
      >
        إخفاء
      </button>
    </div>
  )
}
