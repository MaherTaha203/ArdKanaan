import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'

import { BookOpen, CornerDownLeft, GraduationCap, HandCoins, Landmark, Search, SlidersHorizontal, User, UserPlus, Wallet } from 'lucide-react'

import { Money } from '@/components/ui/money'
import { normalizeArabic } from '@/lib/text'
import { useShellStore, type PageKey } from '@/store/use-shell-store'
import { useWorkspaceStore } from '@/store/use-workspace-store'

// ── Alternative B — global command / search palette ────────────────────────
// The fast-workflow centerpiece: ⌘/Ctrl-K (or the top-bar search) opens one
// surface to jump to any student or run any action without walking a menu. It
// only calls existing shell-store actions — no new navigation state.

type PaletteItem = {
  id: string
  icon: ComponentType<{ className?: string }>
  label: string
  keywords: string
  sub?: string
  remaining?: number
  run: () => void
}

const STUDENT_RESULT_LIMIT = 8

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const students = useWorkspaceStore((state) => state.students)
  const studentSummaries = useWorkspaceStore((state) => state.studentSummaries)

  const selectStudent = useShellStore((state) => state.selectStudent)
  const openTab = useShellStore((state) => state.openTab)
  const openOverlay = useShellStore((state) => state.openOverlay)
  const openAddStudent = useShellStore((state) => state.openAddStudent)
  const openAddCourse = useShellStore((state) => state.openAddCourse)

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Focus the input on mount (the palette is mounted only while open, so each
  // open is a fresh instance with empty query / first result selected).
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 20)
    return () => window.clearTimeout(id)
  }, [])

  const remainingByStudent = useMemo(() => {
    const map = new Map<string, number>()
    for (const summary of studentSummaries) map.set(summary.studentId, summary.remaining)
    return map
  }, [studentSummaries])

  // Static action + navigation commands (each wraps an existing shell action).
  const commands = useMemo<PaletteItem[]>(() => {
    const go = (key: PageKey, label: string, icon: ComponentType<{ className?: string }>): PaletteItem => ({
      id: `go:${key}`, icon, label, keywords: normalizeArabic(label), run: () => openTab(key),
    })
    return [
      { id: 'act:receive', icon: HandCoins, label: 'سند قبض جديد', keywords: normalizeArabic('سند قبض جديد تحصيل مقبوضات'), run: () => openOverlay('receive') },
      { id: 'act:expense', icon: Wallet, label: 'سند صرف جديد', keywords: normalizeArabic('سند صرف جديد مدفوعات'), run: () => openOverlay('expense') },
      { id: 'act:add-student', icon: UserPlus, label: 'إضافة طالب', keywords: normalizeArabic('إضافة طالب جديد تسجيل'), run: () => openAddStudent() },
      { id: 'act:add-course', icon: BookOpen, label: 'إضافة دورة', keywords: normalizeArabic('إضافة دورة جديدة'), run: () => openAddCourse() },
      go('students:directory', 'دليل الطلاب', GraduationCap),
      go('students:statement', 'كشف حساب الطلاب', GraduationCap),
      go('students:archived', 'الطلاب المؤرشفون', GraduationCap),
      go('courses:directory', 'الدورات', BookOpen),
      go('report:general', 'كشف الحساب العام', Landmark),
      go('report:receipts', 'تقرير المقبوضات', Landmark),
      go('report:payments', 'تقرير المدفوعات', Landmark),
      go('report:external', 'الجهات الخارجية', Landmark),
      go('settings:system', 'الإعدادات', SlidersHorizontal),
      go('settings:backup', 'النسخ الاحتياطي', SlidersHorizontal),
      go('settings:activity', 'سجل التدقيق', SlidersHorizontal),
    ]
  }, [openTab, openOverlay, openAddStudent, openAddCourse])

  const results = useMemo<PaletteItem[]>(() => {
    const trimmed = query.trim()
    const term = normalizeArabic(trimmed)
    const digits = trimmed.replace(/\D/g, '')

    const matchedCommands = term ? commands.filter((item) => item.keywords.includes(term)) : commands

    const studentItems: PaletteItem[] = term || digits
      ? students
          .filter((student) => {
            if (term && normalizeArabic(student.name).includes(term)) return true
            if (digits) {
              const phoneHit = student.phone ? student.phone.replace(/\D/g, '').includes(digits) : false
              const idHit = student.idNumber ? student.idNumber.replace(/\D/g, '').includes(digits) : false
              return phoneHit || idHit
            }
            return false
          })
          .slice(0, STUDENT_RESULT_LIMIT)
          .map((student) => ({
            id: `student:${student.id}`,
            icon: User,
            label: student.name,
            keywords: normalizeArabic(student.name),
            remaining: remainingByStudent.get(student.id) ?? 0,
            run: () => selectStudent(student.id),
          }))
      : []

    return [...studentItems, ...matchedCommands]
  }, [query, commands, students, remainingByStudent, selectStudent])

  // Clamp the active index during render instead of in an effect.
  const safeActive = results.length ? Math.min(active, results.length - 1) : 0

  const runItem = (item: PaletteItem | undefined) => {
    if (!item) return
    item.run()
    onClose()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(results.length ? (safeActive + 1) % results.length : 0)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(results.length ? (safeActive - 1 + results.length) % results.length : 0)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runItem(results[safeActive])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4" role="dialog" aria-modal="true" aria-label="البحث والإجراءات السريعة">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="absolute inset-0 bg-[rgba(15,23,42,0.45)] backdrop-blur-[2px]" />
      <div className="menu-in relative mt-[10vh] flex w-[min(640px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border-strong bg-panel shadow-soft">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search aria-hidden className="size-5 flex-none text-faint" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="ابحث عن طالب بالاسم أو الرقم، أو اكتب إجراءً…"
            className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-faint"
            aria-label="بحث"
          />
          <kbd className="figure hidden flex-none rounded border border-border-strong bg-highlight px-1.5 py-0.5 text-[11px] text-faint sm:block">Esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[min(60vh,420px)] overflow-y-auto py-1.5">
          {results.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-faint">لا نتائج مطابقة.</p>
          ) : (
            results.map((item, index) => {
              const Icon = item.icon
              const isStudent = item.id.startsWith('student:')
              const selected = index === safeActive
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => runItem(item)}
                  aria-selected={selected}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-start ${selected ? 'bg-highlight' : ''}`}
                >
                  <span aria-hidden className={`grid size-8 flex-none place-items-center rounded-lg ${isStudent ? 'bg-olive-weak text-olive' : 'bg-highlight text-muted-foreground'}`}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{item.label}</span>
                  {isStudent && item.remaining && item.remaining > 0.0001 ? (
                    <Money value={item.remaining} currency={false} className="figure flex-none text-[13px] font-bold text-warn" />
                  ) : !isStudent ? (
                    <span className="flex-none text-[11px] text-faint">إجراء</span>
                  ) : null}
                  {selected ? <CornerDownLeft aria-hidden className="size-4 flex-none text-faint" /> : null}
                </button>
              )
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-faint">
          <span className="flex items-center gap-1"><kbd className="rounded border border-border-strong bg-highlight px-1">↑</kbd><kbd className="rounded border border-border-strong bg-highlight px-1">↓</kbd> تنقّل</span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-border-strong bg-highlight px-1">↵</kbd> فتح</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
