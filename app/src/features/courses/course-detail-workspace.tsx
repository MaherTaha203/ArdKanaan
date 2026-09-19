import { useMemo, useState } from 'react'

import { ArrowRight, Plus } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { StatusBadge } from '@/features/courses/courses-workspace'
import { FeeObligationSheet } from '@/features/courses/fee-obligation-sheet'
import { courseRoster, courseStats } from '@/lib/courses'
import { formatDate, formatNumber } from '@/lib/format'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

export function CourseDetailWorkspace() {
  const selectedCourseId = useShellStore((state) => state.selectedCourseId)
  const navigateCourses = useShellStore((state) => state.navigateCourses)
  const openEnroll = useShellStore((state) => state.openEnroll)
  const openEditCourse = useShellStore((state) => state.openEditCourse)
  const selectStudent = useShellStore((state) => state.selectStudent)

  const courses = useWorkspaceStore((state) => state.courses)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const feeObligations = useWorkspaceStore((state) => state.feeObligations)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)
  const [addingFee, setAddingFee] = useState(false)

  const course = courses.find((item) => item.id === selectedCourseId) ?? null

  const roster = useMemo(
    () => (course ? courseRoster(course, enrollments, students, statementLines) : []),
    [course, enrollments, students, statementLines],
  )
  const stats = useMemo(
    () => (course ? courseStats(course, enrollments, students, statementLines) : null),
    [course, enrollments, students, statementLines],
  )

  const courseFees = useMemo(
    () => (course ? feeObligations.filter((fee) => fee.courseId === course.id) : []),
    [course, feeObligations],
  )

  if (!course) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => navigateCourses('directory')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive">
          <ArrowRight className="size-4" />
          الدورات
        </button>
        <p className="py-10 text-center text-sm text-faint">تعذّر العثور على الدورة.</p>
      </div>
    )
  }

  const period = [course.startDate, course.endDate].filter(Boolean).map((d) => formatDate(d as string)).join(' — ')

  return (
    <>
      <div className="space-y-6">
        <ConfigNotice />
        <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

        <button type="button" onClick={() => navigateCourses('directory')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive">
          <ArrowRight className="size-4" />
          الدورات
        </button>

        <header className="rounded-2xl border border-border bg-panel px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="editorial text-[clamp(1.4rem,3vw,1.9rem)] text-foreground">{course.name}</h1>
              <StatusBadge status={course.status} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="quiet" onClick={() => setAddingFee(true)}>
                <Plus className="size-4" />
                إضافة رسوم
              </Button>
              <Button variant="quiet" onClick={() => openEditCourse(course.id)}>تعديل</Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-muted-foreground">
            <span>
              الرسوم الأساسية{' '}
              {course.baseFee == null ? <span className="text-faint">—</span> : <Money value={course.baseFee} currency={false} className="font-semibold text-foreground" />}
            </span>
            {period ? <span className="figure">{period}</span> : null}
            {course.notes ? <span>{course.notes}</span> : null}
          </div>
        </header>

        {stats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryTile label="عدد الطلاب" value={formatNumber(stats.studentCount)} />
            <SummaryTile label="إجمالي رسوم الدورة" money={stats.totalFees} />
            <SummaryTile label="إجمالي المقبوضات" money={stats.totalPaid} tone="text-gold" />
            <SummaryTile label="إجمالي المستحقّ" money={stats.totalRemaining} tone="text-warn" />
          </div>
        ) : null}

        {courseFees.length > 0 ? (
          <section className="rounded-2xl border border-border bg-panel">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-bold text-foreground">الرسوم المضافة للدورة</h2>
            </div>
            <div className="divide-y divide-border">
              {courseFees.map((fee) => (
                <div key={fee.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 text-[13px]">
                  <span className="min-w-[160px] font-medium text-foreground">{fee.description}</span>
                  <span className="figure font-semibold">{formatNumber(fee.amount)}</span>
                  <span className="text-muted-foreground">{fee.feeCategory === 'institute' ? 'للمعهد' : fee.feeCategory === 'external' ? 'لجهة خارجية' : 'مشترك'}</span>
                  <span className="text-muted-foreground">{formatNumber(courseFees.filter((item) => item.description === fee.description).length)} استحقاق</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-border bg-panel">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-foreground">طلاب الدورة</h2>
            <Button variant="default" size="sm" onClick={() => openEnroll(course.id)}>
              <Plus className="size-4" />
              تسجيل طالب
            </Button>
          </div>
          <div className="overflow-x-auto">
            {roster.length > 0 ? (
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="text-[11px] tracking-wide text-faint">
                    <th className="border-b border-border px-4 py-2.5 text-start font-semibold">الطالب</th>
                    <th className="border-b border-border px-4 py-2.5 text-end font-semibold">الرسوم</th>
                    <th className="border-b border-border px-4 py-2.5 text-end font-semibold">المدفوع</th>
                    <th className="border-b border-border px-4 py-2.5 text-end font-semibold">المتبقّي</th>
                    <th className="border-b border-border px-4 py-2.5 text-start font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((entry) => (
                    <tr key={entry.enrollment.id}>
                      <td className="border-b border-border px-4 py-2.5">
                        {entry.student ? (
                          <button type="button" onClick={() => selectStudent(entry.student!.id)} className="font-medium text-olive hover:underline">
                            {entry.student.name}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="figure border-b border-border px-4 py-2.5 text-end">{formatNumber(entry.fee)}</td>
                      <td className="figure border-b border-border px-4 py-2.5 text-end text-gold">{formatNumber(entry.paid)}</td>
                      <td className={`figure border-b border-border px-4 py-2.5 text-end font-semibold ${entry.remaining > 0 ? 'text-warn' : 'text-muted-foreground'}`}>{formatNumber(entry.remaining)}</td>
                      <td className="border-b border-border px-4 py-2.5">
                        <span className="text-[12px] font-medium text-muted-foreground">
                          {entry.remaining > 0 ? 'عليه مستحقّ' : 'مكتمل السداد'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center gap-4 px-5 py-12 text-center">
                <p className="text-sm text-faint">لا يوجد طلاب مسجّلون في هذه الدورة بعد</p>
                <Button variant="default" size="sm" onClick={() => openEnroll(course.id)}>
                  <Plus className="size-4" />
                  تسجيل طالب
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
      {addingFee ? <FeeObligationSheet course={course} enrollments={enrollments} students={students} onClose={() => setAddingFee(false)} /> : null}
    </>
  )
}

function SummaryTile({ label, value, money, tone }: { label: string; value?: string; money?: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-panel px-4 py-4">
      <div className="text-[12px] text-muted-foreground">{label}</div>
      {money === undefined ? (
        <div className={`figure mt-1 text-xl font-semibold ${tone ?? 'text-foreground'}`}>{value}</div>
      ) : (
        <Money value={money} currency={false} className={`mt-1 block text-xl font-semibold ${tone ?? 'text-foreground'}`} />
      )}
    </div>
  )
}
