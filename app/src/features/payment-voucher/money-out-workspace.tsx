import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  paymentVoucherFormSchema,
  type PaymentVoucherFormValues,
} from '@/features/payment-voucher/schema'
import { appEnv } from '@/lib/env'
import { formatDate, formatNumber, todayIsoDate } from '@/lib/format'
import { useMoneyOutStore } from '@/store/use-money-out-store'

const defaultValues: PaymentVoucherFormValues = {
  paymentDate: todayIsoDate(),
  expenseType: '',
  amount: 0,
  notes: '',
}

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="mt-2 text-xs text-red-600">{message}</p>
}

export function MoneyOutWorkspace() {
  const {
    clearError,
    currentView,
    error,
    isSaving,
    goToPaymentVoucher,
    savePaymentVoucher,
    vouchers,
  } = useMoneyOutStore()

  const form = useForm<PaymentVoucherFormValues>({
    resolver: zodResolver(paymentVoucherFormSchema),
    defaultValues,
  })

  async function onSubmit(values: PaymentVoucherFormValues) {
    const result = await savePaymentVoucher(values)

    if (!result) {
      return
    }

    form.reset({
      ...defaultValues,
      paymentDate: todayIsoDate(),
    })
  }

  if (currentView === 'expense-record') {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <header className="mb-8 flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex w-fit rounded-full border border-border bg-panel px-3 py-1 text-xs tracking-[0.24em] text-muted-foreground">
                سجل المصاريف
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                الحركات المالية الصادرة
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                مصاريف المركز الصادرة بترتيب زمني. لا ترتبط بأي طالب أو دورة، ولا تؤثر على بيان أي طالب.
              </p>
            </div>

            <Button variant="outline" onClick={goToPaymentVoucher}>
              <ArrowRight className="size-4" />
              تسجيل سند صرف جديد
            </Button>
          </header>

          <Card className="bg-background">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">سجل الصرف الزمني</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    صندوق مالي واحد للمركز. كل سطر يمثل حركة مالية خارجة.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-panel px-4 py-3 text-xs text-muted-foreground">
                  {formatNumber(vouchers.length)} حركة/حركات
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-3xl border border-border bg-panel">
                <div className="grid grid-cols-[0.8fr_0.9fr_1.4fr_0.9fr_1.6fr] gap-2 border-b border-border/80 bg-highlight px-4 py-3 text-xs font-medium text-muted-foreground">
                  <span>رقم السند</span>
                  <span>التاريخ</span>
                  <span>نوع المصروف</span>
                  <span>المبلغ</span>
                  <span>ملاحظات</span>
                </div>

                {vouchers.length > 0 ? (
                  <div className="divide-y divide-border/80">
                    {vouchers.map((line) => (
                      <div
                        key={line.id}
                        className="grid grid-cols-[0.8fr_0.9fr_1.4fr_0.9fr_1.6fr] gap-2 px-4 py-4 text-sm text-foreground"
                      >
                        <span>{formatNumber(line.voucherNumber)}</span>
                        <span>{formatDate(line.voucherDate)}</span>
                        <span>{line.expenseType}</span>
                        <span>{formatNumber(line.amount)}</span>
                        <span className="text-muted-foreground">{line.notes || '—'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-12 text-center text-sm leading-7 text-muted-foreground">
                    لا توجد حركة صرف لعرضها.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/70 pb-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex w-fit rounded-full border border-border bg-panel px-3 py-1 text-xs tracking-[0.24em] text-muted-foreground">
              شريحة السندات الصادرة
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              سند صرف
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              تسجيل مصروف صادر للمركز. يُدخل المبلغ ونوع المصروف يدويًا، ثم يظهر ضمن سجل المصاريف مباشرة بعد الحفظ.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3 lg:min-w-[460px]">
            <div className="rounded-2xl border border-border bg-panel px-4 py-3">
              <div className="mb-1 text-xs tracking-[0.18em]">اللغة</div>
              <div className="font-medium text-foreground">العربية فقط</div>
            </div>
            <div className="rounded-2xl border border-border bg-panel px-4 py-3">
              <div className="mb-1 text-xs tracking-[0.18em]">الصندوق</div>
              <div className="font-medium text-foreground">صندوق واحد للمركز</div>
            </div>
            <div className="rounded-2xl border border-border bg-panel px-4 py-3">
              <div className="mb-1 text-xs tracking-[0.18em]">المخرجات</div>
              <div className="font-medium text-foreground">سند صرف + سجل المصاريف</div>
            </div>
          </div>
        </header>

        {!appEnv.isSupabaseConfigured ? (
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
            التطبيق جاهز تقنيًا لكن الاتصال بقاعدة البيانات يحتاج إلى استكمال بيانات البيئة المحلية
            قبل تشغيل الشريحة.
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button variant="ghost" className="justify-start text-red-700" onClick={clearError}>
              إخفاء
            </Button>
          </div>
        ) : null}

        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)]">
          <Card>
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">صفحة سند الصرف</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  حقول المصروف الصادر فقط، دون أي ربط بطالب أو دورة، ثم تنقلك إلى سجل المصاريف بعد الحفظ.
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      نوع المصروف
                    </label>
                    <Input placeholder="مثال: إيجار، كهرباء، رواتب" {...form.register('expenseType')} />
                    <FieldMessage message={form.formState.errors.expenseType?.message} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      تاريخ الصرف
                    </label>
                    <Input type="date" {...form.register('paymentDate')} />
                    <FieldMessage message={form.formState.errors.paymentDate?.message} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      المبلغ المصروف
                    </label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      {...form.register('amount', { valueAsNumber: true })}
                    />
                    <FieldMessage message={form.formState.errors.amount?.message} />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      الملاحظات
                    </label>
                    <Textarea placeholder="ملاحظات اختيارية" {...form.register('notes')} />
                    <FieldMessage message={form.formState.errors.notes?.message} />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm leading-7 text-muted-foreground">
                    عند الحفظ سيتم تسجيل حركة مالية صادرة للمركز، ثم إظهار سجل المصاريف المحدث مباشرة. لا يتأثر أي طالب.
                  </div>
                  <Button type="submit" size="lg" disabled={isSaving}>
                    <Wallet className="size-4" />
                    {isSaving ? 'جاري الحفظ...' : 'حفظ سند الصرف'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
