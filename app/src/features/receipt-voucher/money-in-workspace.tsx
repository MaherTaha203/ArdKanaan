import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, ReceiptText } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  receiptVoucherFormSchema,
  type ReceiptVoucherFormValues,
} from '@/features/receipt-voucher/schema'
import { appEnv } from '@/lib/env'
import { formatDate, formatNumber, todayIsoDate } from '@/lib/format'
import { useMoneyInStore } from '@/store/use-money-in-store'

const defaultValues: ReceiptVoucherFormValues = {
  paymentDate: todayIsoDate(),
  studentName: '',
  courseName: '',
  courseValue: 0,
  amountReceived: 0,
  payerName: '',
  notes: '',
}

function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="mt-2 text-xs text-red-600">{message}</p>
}

export function MoneyInWorkspace() {
  const {
    activeStudent,
    clearError,
    currentView,
    error,
    isSaving,
    goToReceiptVoucher,
    saveReceiptVoucher,
    statementLines,
  } = useMoneyInStore()

  const form = useForm<ReceiptVoucherFormValues>({
    resolver: zodResolver(receiptVoucherFormSchema),
    defaultValues,
  })

  async function onSubmit(values: ReceiptVoucherFormValues) {
    const result = await saveReceiptVoucher(values)

    if (!result) {
      return
    }

    form.reset({
      ...defaultValues,
      paymentDate: todayIsoDate(),
    })
  }

  if (currentView === 'student-statement') {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <header className="mb-8 flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex w-fit rounded-full border border-border bg-panel px-3 py-1 text-xs tracking-[0.24em] text-muted-foreground">
                 بيان الطالب
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                بيان الطالب
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                تم تحديث البيان مباشرة بعد حفظ سند القبض، بترتيب زمني وبقابلية تتبع كاملة إلى السند الأصلي.
              </p>
            </div>

            <Button variant="outline" onClick={goToReceiptVoucher}>
              <ArrowRight className="size-4" />
              تسجيل سند قبض جديد
            </Button>
          </header>

          <Card className="bg-background">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">البيان الزمني المحدّث</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {activeStudent
                      ? `الطالب الحالي: ${activeStudent.name}`
                      : 'لا يوجد طالب محدد حاليًا.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-panel px-4 py-3 text-xs text-muted-foreground">
                  {formatNumber(statementLines.length)} حركة/حركات
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-3xl border border-border bg-panel">
                <div className="grid grid-cols-[1fr_0.9fr_1.15fr_1fr_0.9fr_0.9fr_1fr] gap-2 border-b border-border/80 bg-highlight px-4 py-3 text-xs font-medium text-muted-foreground">
                  <span>اسم الطالب</span>
                  <span>التاريخ</span>
                  <span>الوصف</span>
                  <span>الدورة</span>
                  <span>قيمة الدورة</span>
                  <span>المدفوع</span>
                  <span>المتبقي</span>
                </div>

                {statementLines.length > 0 ? (
                  <div className="divide-y divide-border/80">
                    {statementLines.map((line) => (
                      <div
                        key={line.id}
                        className="grid grid-cols-[1fr_0.9fr_1.15fr_1fr_0.9fr_0.9fr_1fr] gap-2 px-4 py-4 text-sm text-foreground"
                      >
                        <span>{line.studentName}</span>
                        <span>{formatDate(line.voucherDate)}</span>
                        <span>{`سند قبض رقم ${formatNumber(line.voucherNumber)}`}</span>
                        <span>{line.courseName}</span>
                        <span>{formatNumber(line.courseValue)}</span>
                        <span>{formatNumber(line.amountReceived)}</span>
                        <span>{formatNumber(line.remainingBalance)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-12 text-center text-sm leading-7 text-muted-foreground">
                    لا توجد حركة لعرضها لهذا الطالب.
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
                شريحة السندات الواردة
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              سند قبض
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              إدخال حقائق سند القبض، إنشاء الطالب عند الحاجة، ثم عرض بيان الطالب المشتق زمنيًا مباشرة بعد الحفظ.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3 lg:min-w-[460px]">
            <div className="rounded-2xl border border-border bg-panel px-4 py-3">
              <div className="mb-1 text-xs tracking-[0.18em]">اللغة</div>
              <div className="font-medium text-foreground">العربية فقط</div>
            </div>
            <div className="rounded-2xl border border-border bg-panel px-4 py-3">
              <div className="mb-1 text-xs tracking-[0.18em]">الاتجاه</div>
                <div className="font-medium text-foreground">من اليمين إلى اليسار</div>
            </div>
            <div className="rounded-2xl border border-border bg-panel px-4 py-3">
              <div className="mb-1 text-xs tracking-[0.18em]">المخرجات</div>
              <div className="font-medium text-foreground">سند قبض + بيان الطالب</div>
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
                <h2 className="text-xl font-semibold text-foreground">صفحة سند القبض</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  تحتوي الصفحة على حقول سند القبض فقط، ثم تنقلك مباشرة إلى بيان الطالب بعد الحفظ.
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      اسم الطالب
                    </label>
                    <Input placeholder="اكتب اسم الطالب" {...form.register('studentName')} />
                    <FieldMessage message={form.formState.errors.studentName?.message} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">اسم الدورة</label>
                    <Input placeholder="نص حر" {...form.register('courseName')} />
                    <FieldMessage message={form.formState.errors.courseName?.message} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">قيمة الدورة</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register('courseValue', { valueAsNumber: true })}
                    />
                    <FieldMessage message={form.formState.errors.courseValue?.message} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      تاريخ الدفع
                    </label>
                    <Input type="date" {...form.register('paymentDate')} />
                    <FieldMessage message={form.formState.errors.paymentDate?.message} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      المبلغ المقبوض
                    </label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      {...form.register('amountReceived', { valueAsNumber: true })}
                    />
                    <FieldMessage message={form.formState.errors.amountReceived?.message} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">اسم الدافع</label>
                    <Input placeholder="الاسم المدفوع باسمه" {...form.register('payerName')} />
                    <FieldMessage message={form.formState.errors.payerName?.message} />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      الملاحظات
                    </label>
                    <Textarea placeholder="أدخل الملاحظات" {...form.register('notes')} />
                    <FieldMessage message={form.formState.errors.notes?.message} />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm leading-7 text-muted-foreground">
                    عند الحفظ سيتم البحث عن الطالب بالاسم، وإنشاؤه تلقائيًا إن لم يوجد، ثم إنشاء سند القبض وإظهار البيان المحدث مباشرة.
                  </div>
                  <Button type="submit" size="lg" disabled={isSaving}>
                    <ReceiptText className="size-4" />
                    {isSaving ? 'جاري الحفظ...' : 'حفظ سند القبض'}
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