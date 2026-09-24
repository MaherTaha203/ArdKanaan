import type { ComponentType } from 'react'

import { Activity, Archive, BookOpen, ClipboardList, FileText, HardDriveDownload, Home, Settings, Users } from 'lucide-react'

import type { PageKey } from '@/store/use-shell-store'

// Title + icon for every page that can open as a tab. Each menu item is its own tab,
// so every PageKey carries the name that its tab shows — opening «الإعدادات» then
// «سجل التدقيق» keeps a distinct, correctly-named tab for each. Shared by the shell
// (which renders the panels) and the tab strip (which lists the tabs), so both agree.
// Presentation only.
export const PAGE_META: Record<PageKey, { title: string; icon: ComponentType<{ className?: string }> }> = {
  home: { title: 'الرئيسية', icon: Home },
  'students:directory': { title: 'دليل الطلاب', icon: Users },
  'students:statement': { title: 'كشف الحساب', icon: ClipboardList },
  'students:archived': { title: 'الطلاب المؤرشفون', icon: Archive },
  'courses:directory': { title: 'الدورات', icon: BookOpen },
  'courses:detail': { title: 'تفاصيل الدورة', icon: BookOpen },
  'report:general': { title: 'كشف الحساب العام', icon: FileText },
  'report:receipts': { title: 'تقرير المقبوضات', icon: FileText },
  'report:payments': { title: 'تقرير المدفوعات', icon: FileText },
  'report:external': { title: 'الجهات الخارجية', icon: FileText },
  'settings:system': { title: 'الإعدادات', icon: Settings },
  'settings:backup': { title: 'النسخ الاحتياطي', icon: HardDriveDownload },
  'settings:activity': { title: 'سجل التدقيق', icon: Activity },
}

// A DOM-safe id fragment for a page (the raw key carries a ':', which is awkward in
// query selectors). Used to pair each tab button with its panel via aria-controls.
export function tabDomId(key: PageKey): string {
  return key.replace(':', '-')
}
