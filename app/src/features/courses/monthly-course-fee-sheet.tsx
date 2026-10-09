import { useState } from 'react'
import type { ReactNode } from 'react'

import { Check, Eye } from 'lucide-react'

import { ActionSheet } from '@/components/shell/action-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Money } from '@/components/ui/money'
import { useToastStore } from '@/components/ui/use-toast-store'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { useWorkspaceStore } from '@/store/use-workspace-store'
import type { Course } from '@/types/domain'

type PreviewStudent = {
  student_id: string
  student_name: string
  enrollment_id: string
  amount: number
  due_month: string
  already_exists: boolean
}
type PreviewResult = {
  course_id: string
  course_name: string
  due_month: string
  monthly_amount: number
  fee_category: 'institute' | 'external' | 'shared'
  external_share: number
  eligible_count: number
  already_exists_count: number
  to_create_count: number
  students: PreviewStudent[]
}

export function MonthlyCourseFeeSheet({ course, onClose }: { course: Course; onClose: () => void }) {
  const reloadWorkspace = useWorkspaceStore((state) => state.load)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [feeCategory, setFeeCategory] = useState<'institute' | 'external' | 'shared'>('institute')
  const [externalShare, setExternalShare] = useState('0')
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadPreview() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setError('الاتصال بقاعدة البيانات غير مهيأ بعد.')
      return
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      setError('اختر الشهر المطلوب.')
      return
    }
    const amount = course.monthlyFee ?? 0
    const external = feeCategory === 'institute' ? 0 : feeCategory === 'external' ? amount : Number(externalShare)
    if (feeCategory === 'shared' && (!/^[0-9]+$/.test(externalShare) || external <= 0 || external >= amount)) {
      setError('في الرسوم المشتركة أدخل حصة الجهة الخارجية بأرقام إنجليزية، كعدد صحيح أكبر من 0 وأقل من الرسوم الشهرية.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc('preview_monthly_course_obligations', {
        p_course_id: course.id,
        p_due_month: `${month}-01`,
        p_fee_category: feeCategory,
        p_external_share: external,
      })
      if (rpcError) throw rpcError
      setPreview(data as PreviewResult)
    } catch (cause) {
      const message = cause && typeof cause === 'object' && 'message' in cause ? String((cause as { message: unknown }).message) : ''
      setError(message.includes('COURSE_MONTHLY_FEE_REQUIRED')
        ? 'حدّد رسومًا شهرية صحيحة للدورة أولًا.'
        : message.includes('INVALID_MONTHLY_FEE_RECIPIENT_SPLIT')
          ? 'حصة الجهة المستحقة لا تتوافق مع نوع التوزيع المختار.'
          : message.includes('COURSE_NOT_FOUND_OR_INACTIVE')
            ? 'الدورة غير نشطة أو غير موجودة.'
            : 'تعذّر إعداد معاينة الرسوم الشهرية.')
    } finally {
      setBusy(false)
    }
  }

  async function createFees() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !preview || preview.to_create_count === 0) return
    const amount = course.monthlyFee ?? 0
    const external = feeCategory === 'institute' ? 0 : feeCategory === 'external' ? amount : Number(externalShare)
    if (feeCategory === 'shared' && (!/^[0-9]+$/.test(externalShare) || external <= 0 || external >= amount)) {
      setError('في الرسوم المشتركة أدخل حصة الجهة الخارجية بأرقام إنجليزية، كعدد صحيح أكبر من 0 وأقل من الرسوم الشهرية.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc('create_monthly_course_obligations', {
        p_course_id: course.id,
        p_due_month: `${month}-01`,
        p_fee_category: feeCategory,
        p_external_share: external,
      })
      if (rpcError) throw rpcError
      const result = data as { created?: number }
      await reloadWorkspace()
      useToastStore.getState().show(`تم إنشاء ${result.created ?? 0} استحقاق شهري`)
      onClose()
    } catch {
      setError('تعذّر إنشاء الرسوم. لم تُحفظ عملية جزئية؛ أعد المعاينة ثم حاول مجددًا.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ActionSheet title="إنشاء الرسوم الشهرية" eyebrow={course.name} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          تُحتسب الرسوم الشهرية كاملة لكل طالب نشط مسجّل قبل نهاية الشهر المختار. لا تُعدّل هذه العملية رسوم التسجيل التاريخية أو سندات القبض أو التخصيصات.
        </p>
        {course.monthlyFee == null || course.monthlyFee <= 0 ? (
          <p role="alert" className="rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">حدّد الرسوم الشهرية في إعدادات الدورة أولًا. لن تُستخدم قيمة التسجيل الإجمالية القديمة بدلًا منها.</p>
        ) : null}
        {error ? <div role="alert" className="rounded-xl border border-clay/25 bg-clay-weak px-4 py-3 text-sm text-clay">{error}</div> : null}
        <label className="block text-[13px] font-medium text-muted-foreground">
          شهر الاستحقاق
          <Input className="mt-1.5 figure" type="text" inputMode="numeric" autoComplete="off" placeholder="YYYY-MM" value={month} onChange={(event) => { setMonth(event.target.value.replace(/[^0-9-]/g, '')); setPreview(null) }} />
        </label>
        <label className="block text-[13px] font-medium text-muted-foreground">
          الجهة المستحقة
          <select className="mt-1.5 h-11 w-full rounded-xl border border-border-strong bg-panel px-3 text-sm text-foreground" value={feeCategory} onChange={(event) => { setFeeCategory(event.target.value as 'institute' | 'external' | 'shared'); setPreview(null) }}>
            <option value="institute">للمركز / المعهد</option>
            <option value="external">لجهة خارجية</option>
            <option value="shared">مشتركة بين المركز وجهة خارجية</option>
          </select>
        </label>
        {feeCategory === 'shared' ? (
          <label className="block text-[13px] font-medium text-muted-foreground">
            حصة الجهة الخارجية من كل طالب (بالأرقام الإنجليزية)
            <Input className="mt-1.5 figure" type="text" inputMode="numeric" autoComplete="off" placeholder="0" value={externalShare} onChange={(event) => { setExternalShare(event.target.value.replace(/[^0-9]/g, '')); setPreview(null) }} />
          </label>
        ) : feeCategory === 'external' ? (
          <p className="text-xs text-muted-foreground">تُسند الرسوم الشهرية كاملة إلى الجهة الخارجية.</p>
        ) : null}
        <Button type="button" variant="quiet" className="w-full" disabled={busy || !month || course.monthlyFee == null || course.monthlyFee <= 0} onClick={loadPreview}>
          <Eye className="size-4" />
          {busy ? 'جارٍ التحضير…' : 'معاينة الطلاب والاستحقاقات'}
        </Button>
        {preview ? (
          <section className="space-y-3 rounded-xl border border-border p-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Summary label="الرسوم لكل طالب" value={<Money value={preview.monthly_amount} currency={false} />} />
              <Summary label="الجهة المستحقة" value={preview.fee_category === 'institute' ? 'المركز / المعهد' : preview.fee_category === 'external' ? 'جهة خارجية' : 'مشتركة'} />
              <Summary label="حصة الجهة الخارجية" value={<Money value={preview.external_share} currency={false} />} />
              <Summary label="الطلاب المؤهلون" value={String(preview.eligible_count)} />
              <Summary label="استحقاقات موجودة" value={String(preview.already_exists_count)} />
              <Summary label="استحقاقات جديدة" value={String(preview.to_create_count)} />
            </div>
            <div className="max-h-64 overflow-auto rounded-lg border border-border">
              {preview.students.length ? preview.students.map((student) => (
                <div key={student.enrollment_id} className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 last:border-b-0">
                  <span className="text-sm">{student.student_name}</span>
                  <span className={student.already_exists ? 'text-xs text-muted-foreground' : 'figure text-sm font-semibold'}>
                    {student.already_exists ? 'موجود مسبقًا' : <Money value={student.amount} currency={false} />}
                  </span>
                </div>
              )) : <p className="p-4 text-center text-sm text-muted-foreground">لا يوجد طلاب مؤهلون لهذا الشهر.</p>}
            </div>
            <Button type="button" className="w-full" disabled={busy || preview.to_create_count === 0} onClick={createFees}>
              <Check className="size-4" />
              {busy ? 'جارٍ الإنشاء…' : `تأكيد إنشاء ${preview.to_create_count} استحقاق`}
            </Button>
          </section>
        ) : null}
      </div>
    </ActionSheet>
  )
}

function Summary({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-lg bg-highlight p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 font-semibold text-foreground">{value}</div></div>
}
