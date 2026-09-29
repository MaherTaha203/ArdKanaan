import type { ComponentType } from 'react'

import { Archive, BanknoteArrowDown, BanknoteArrowUp, BookOpen, BookOpenText, DatabaseBackup, GraduationCap, Handshake, History, Home, NotebookText, ScrollText, Settings } from 'lucide-react'

import type { PageKey } from '@/store/use-shell-store'

// Title + icon for every page that can open as a tab. Each menu item is its own tab,
// so every PageKey carries the name that its tab shows — opening «الإعدادات» then
// «سجل التدقيق» keeps a distinct, correctly-named tab for each. Shared by the shell
// (which renders the panels) and the tab strip (which lists the tabs), so both agree.
// Presentation only.
export const PAGE_META: Record<PageKey, { title: string; icon: ComponentType<{ className?: string }> }> = {
  home: { title: 'الرئيسية', icon: Home },
  'students:directory': { title: 'دليل الطلاب', icon: GraduationCap },
  'students:statement': { title: 'كشف الحساب', icon: ScrollText },
  'students:archived': { title: 'الطلاب المؤرشفون', icon: Archive },
  'courses:directory': { title: 'الدورات', icon: BookOpen },
  'courses:detail': { title: 'تفاصيل الدورة', icon: BookOpenText },
  'report:general': { title: 'كشف الحساب العام', icon: NotebookText },
  'report:receipts': { title: 'تقرير المقبوضات', icon: BanknoteArrowDown },
  'report:payments': { title: 'تقرير المدفوعات', icon: BanknoteArrowUp },
  'report:external': { title: 'الجهات الخارجية', icon: Handshake },
  'settings:system': { title: 'الإعدادات', icon: Settings },
  'settings:backup': { title: 'النسخ الاحتياطي', icon: DatabaseBackup },
  'settings:activity': { title: 'سجل التدقيق', icon: History },
}

// A DOM-safe id fragment for a page (the raw key carries a ':', which is awkward in
// query selectors). Used to pair each tab button with its panel via aria-controls.
export function tabDomId(key: PageKey): string {
  return key.replace(':', '-')
}
