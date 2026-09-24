import type { StudentView } from '@/store/use-shell-store'

const STUDENT_TABS: { id: StudentView; label: string }[] = [
  { id: 'directory', label: 'دليل الطلاب' },
  { id: 'statement', label: 'كشف الحساب' },
  { id: 'archived', label: 'المؤرشفون' },
]

// The students sub-view selector, shared by the directory, statement and archived
// pages so they present one compact segmented control instead of a separate tab band.
// Presentation + navigation only.
export function StudentTabs({ active, onPick }: { active: StudentView; onPick: (view: StudentView) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-highlight p-1">
      {STUDENT_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onPick(tab.id)}
          aria-pressed={active === tab.id}
          className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${active === tab.id ? 'bg-panel text-olive shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
