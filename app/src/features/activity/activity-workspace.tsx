import { useCallback, useEffect, useMemo, useState } from 'react'

import { RefreshCw } from 'lucide-react'

import { RouteHeader } from '@/components/shell/route-header'
import { Input } from '@/components/ui/input'
import { fetchAllRows } from '@/lib/fetch-all'
import { getSupabaseBrowserClient } from '@/lib/supabase'


type ActivityRow = {
  id: string
  entity: string
  entity_id: string | null
  action: string
  label: string | null
  changed_by: string | null
  actor_email: string | null
  changed_at: string
  source: string | null
  description: string | null
  device_id: string | null
  device_user_agent: string | null
  ip_address: string | null
  timezone: string | null
}

const ACTION_LABELS: Record<string, string> = {
  create: 'إنشاء',
  edit: 'تعديل',
  cancel: 'إلغاء',
  uncancel: 'إعادة تفعيل',
  restore: 'استعادة',
  export: 'تصدير',
  login: 'تسجيل الدخول',
  logout: 'تسجيل الخروج',
  password_change: 'تغيير كلمة المرور',
}

function actionLabel(action: string) {
  return ACTION_LABELS[action] ?? action
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ar', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ar', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function locationLabel(row: ActivityRow) {
  return [row.timezone, row.ip_address].filter(Boolean).join(' · ') || '—'
}

export function ActivityWorkspace() {
  const [rows, setRows] = useState<ActivityRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('all')

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setError('الاتصال بقاعدة البيانات غير مهيأ بعد.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    const result = await fetchAllRows<ActivityRow>((from, to) =>
      supabase
        .from('audit_log')
        .select(
          'id, entity, entity_id, action, label, changed_by, actor_email, changed_at, source, description, device_id, device_user_agent, ip_address, timezone',
        )
        .order('changed_at', { ascending: false })
        .range(from, to),
    )

    if (result.error) {
      console.error('activity load failed', result.error)
      setError('تعذّر تحميل سجل النشاط. تحقّق من الاتصال وحاول تحديث الصفحة.')
      setRows([])
    } else {
      setRows(result.data)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(task)
  }, [load])

  const sources = useMemo(
    () => Array.from(new Set(rows.map((row) => row.source).filter((value): value is string => Boolean(value)))),
    [rows],
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ar')
    return rows.filter((row) => {
      if (source !== 'all' && row.source !== source) return false
      if (!normalizedQuery) return true
      const haystack = [
        row.actor_email,
        row.label,
        row.description,
        row.source,
        row.device_id,
        row.ip_address,
        row.timezone,
        actionLabel(row.action),
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('ar')
      return haystack.includes(normalizedQuery)
    })
  }, [query, rows, source])

  return (
    <div>
      <RouteHeader eyebrow="سجل النشاط" title="سجل العمل" />

      <section className="w-full">
        <div className="mb-5 flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث في المستخدم أو البيان أو الجهاز أو المكان…"
            aria-label="البحث في سجل النشاط"
            className="lg:max-w-[420px]"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>المصدر</span>
            <select
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="h-10 rounded-md border border-border-strong bg-panel px-3 text-sm text-foreground"
              aria-label="تصفية حسب المصدر"
            >
              <option value="all">الكل</option>
              {sources.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border-strong px-4 text-sm font-semibold text-muted-foreground disabled:opacity-50"
          >
            <RefreshCw className="size-4" />
            تحديث السجل
          </button>
        </div>

        {error ? (
          <p role="alert" className="border-y border-border py-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs font-semibold text-muted-foreground">
                <th scope="col" className="px-3 py-3 text-start">المستخدم</th>
                <th scope="col" className="px-3 py-3 text-start">التاريخ</th>
                <th scope="col" className="px-3 py-3 text-start">الوقت</th>
                <th scope="col" className="px-3 py-3 text-start">رقم الجهاز</th>
                <th scope="col" className="px-3 py-3 text-start">المكان / الشبكة</th>
                <th scope="col" className="px-3 py-3 text-start">المصدر</th>
                <th scope="col" className="px-3 py-3 text-start">العملية</th>
                <th scope="col" className="px-3 py-3 text-start">البيان</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">جارٍ تحميل السجل…</td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">لا توجد سجلات مطابقة.</td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-border align-top last:border-b-0">
                    <td className="px-3 py-3">
                      <div className="font-medium text-foreground">{row.actor_email ?? 'المالك'}</div>
                      {row.changed_by ? <div className="figure mt-1 text-[11px] text-muted-foreground" dir="ltr">{row.changed_by}</div> : null}
                    </td>
                    <td className="figure whitespace-nowrap px-3 py-3" dir="ltr">{formatDate(row.changed_at)}</td>
                    <td className="figure whitespace-nowrap px-3 py-3" dir="ltr">{formatTime(row.changed_at)}</td>
                    <td className="figure max-w-[190px] break-all px-3 py-3 text-xs text-muted-foreground" dir="ltr">{row.device_id ?? '—'}</td>
                    <td className="figure max-w-[220px] px-3 py-3 text-xs text-muted-foreground" dir="ltr">{locationLabel(row)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{row.source ?? 'النظام'}</td>
                    <td className="px-3 py-3 font-semibold text-foreground">{actionLabel(row.action)}</td>
                    <td className="max-w-[360px] px-3 py-3 text-foreground">{row.description ?? row.label ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          السجل للقراءة والمراجعة فقط، وترتيبه زمني تنازليًا. لا توجد فيه إجراءات لتعديل أو حذف الأحداث.
        </p>
      </section>
    </div>
  )
}
