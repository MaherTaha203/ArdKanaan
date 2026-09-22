import type { ComponentType } from 'react'

import { Activity, BookOpen, FileText, Settings, Users } from 'lucide-react'

import type { ShellRoute } from '@/store/use-shell-store'

export type WindowRoute = Exclude<ShellRoute, 'home'>

// Title + icon for each page that can open as a window. Shared by the shell (which
// renders the frames) and the dock (which lists the minimized ones), so both always
// agree. Presentation only.
export const WINDOW_META: Record<WindowRoute, { title: string; icon: ComponentType<{ className?: string }> }> = {
  students: { title: 'الطلاب', icon: Users },
  courses: { title: 'الدورات', icon: BookOpen },
  report: { title: 'التقارير المالية', icon: FileText },
  settings: { title: 'الإعدادات', icon: Settings },
  activity: { title: 'سجل التدقيق', icon: Activity },
}
