import { useMemo, useState } from 'react'

import { BookPlus, Search } from 'lucide-react'

import { ConfigNotice, ErrorNotice } from '@/components/shell/notices'
import { Button } from '@/components/ui/button'
import { Money } from '@/components/ui/money'
import { SkeletonRows } from '@/components/ui/skeleton'
import { courseStats } from '@/lib/courses'
import { formatNumber } from '@/lib/format'
import { normalizeArabic } from '@/lib/text'
import { useShellStore } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// The courses catalog: a calm list, not an ERP grid. Each row shows the course,
// how many students are enrolled, its base fee and status — click to open it.
export function CoursesWorkspace() {
  const courses = useWorkspaceStore((state) => state.courses)
  const enrollments = useWorkspaceStore((state) => state.enrollments)
  const students = useWorkspaceStore((state) => state.students)
  const statementLines = useWorkspaceStore((state) => state.statementLines)
  const loaded = useWorkspaceStore((state) => state.loaded)
  const error = useWorkspaceStore((state) => state.error)
  const clearError = useWorkspaceStore((state) => state.clearError)
  const reload = useWorkspaceStore((state) => state.load)

  const selectCourse = useShellStore((state) => state.selectCourse)
  const openAddCourse = useShellStore((state) => state.openAddCourse)

  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const term = normalizeArabic(query.trim())
    return courses
      .filter((course) => !term || normalizeArabic(course.name).includes(term))
      .map((course) => ({ course, stats: courseStats(course, enrollments, students, statementLines) }))
  }, [courses, enrollments, students, statementLines, query])

  return (
    <div className="space-y-4">
      <ConfigNotice />
      <ErrorNotice message={error} onDismiss={clearError} onRetry={reload} />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="editorial text-[clamp(1.2rem,1.9vw,1.45rem)] text-foreground">الدورات</h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex w-60 max-w-full items-center gap-2 rounded-lg border border-border-strong bg-panel px-3 py-2 focus-within:border-olive">
            <Search aria-hidden className="size-4 flex-none text-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="البحث عن دورة"
              placeholder="ابحث عن دورة بالاسم"
              className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-faint"
            />
          </label>
          <Button variant="default" onClick={openAddCourse}>
            <BookPlus className="size-4" />
            إضافة دورة
          </Button>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-panel">

        {!loaded ? (
          <div className="p-4">
            <SkeletonRows rows={4} />
          </div>
        ) : rows.length > 0 ? (
          <ul>
            {rows.map(({ course, stats }) => (
              <li key={course.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => selectCourse(course.id)}
                  className="flex w-full flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3.5 text-start hover:bg-highlight"
                >
                  <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">{course.name}</span>
                  <span className="text-[12.5px] text-muted-foreground">
                    عدد الطلاب <span className="figure font-semibold text-foreground">{formatNumber(stats.studentCount)}</span>
                  </span>
                  <span className="text-[12.5px] text-muted-foreground">
                    الرسوم الأساسية{' '}
                    {course.baseFee == null ? (
                      <span className="text-faint">—</span>
                    ) : (
                      <Money value={course.baseFee} currency={false} className="font-semibold text-foreground" />
                    )}
                  </span>
                  <StatusBadge status={course.status} />
                </button>
              </li>
            ))}
          </ul>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-5 py-12 text-center">
            <p className="text-sm text-faint">لا توجد دورات حاليًّا</p>
            <Button variant="default" onClick={openAddCourse}>
              <BookPlus className="size-4" />
              إضافة دورة
            </Button>
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-faint">لا توجد دورة تطابق البحث.</p>
        )}
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: 'active' | 'ended' }) {
  const active = status === 'active'
  return (
    <span
      className={`inline-flex border px-2.5 py-0.5 text-[11px] font-medium ${
        active ? 'border-gold/25 bg-gold-weak text-gold' : 'border-border bg-highlight text-muted-foreground'
      }`}
    >
      {active ? 'نشطة' : 'منتهية'}
    </span>
  )
}
