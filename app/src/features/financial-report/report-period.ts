import { addDays, isoDate, WEEK_STARTS_ON } from '@/lib/calendar'

export type ReportPeriod =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'week'
  | 'last-week'
  | 'month'
  | 'last-month'
  | 'last-7'
  | 'last-30'
  | 'year'
  | 'custom'

export type ReportPeriodRange = {
  start: string | null
  end: string | null
}

function localIso(date: Date): string {
  return isoDate(date.getFullYear(), date.getMonth(), date.getDate())
}

export function reportPeriodRange(period: ReportPeriod, today = new Date()): ReportPeriodRange {
  const current = localIso(today)

  if (period === 'all') return { start: null, end: null }
  if (period === 'today') return { start: current, end: current }
  if (period === 'yesterday') {
    const date = addDays(current, -1)
    return { start: date, end: date }
  }
  if (period === 'week') {
    const daysSinceWeekStart = (today.getDay() - WEEK_STARTS_ON + 7) % 7
    return { start: addDays(current, -daysSinceWeekStart), end: current }
  }
  if (period === 'last-week') {
    const daysSinceWeekStart = (today.getDay() - WEEK_STARTS_ON + 7) % 7
    const thisWeekStart = addDays(current, -daysSinceWeekStart)
    return { start: addDays(thisWeekStart, -7), end: addDays(thisWeekStart, -1) }
  }
  if (period === 'month') {
    return { start: isoDate(today.getFullYear(), today.getMonth(), 1), end: current }
  }
  if (period === 'last-month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)
    return { start: localIso(start), end: localIso(end) }
  }
  if (period === 'last-7') return { start: addDays(current, -6), end: current }
  if (period === 'last-30') return { start: addDays(current, -29), end: current }
  if (period === 'year') return { start: isoDate(today.getFullYear(), 0, 1), end: current }

  return { start: null, end: null }
}

export function periodLabel(period: ReportPeriod): string {
  return {
    all: 'الكل',
    today: 'اليوم',
    yesterday: 'أمس',
    week: 'هذا الأسبوع',
    'last-week': 'الأسبوع الماضي',
    month: 'هذا الشهر',
    'last-month': 'الشهر الماضي',
    'last-7': 'آخر 7 أيام',
    'last-30': 'آخر 30 يومًا',
    year: 'هذه السنة',
    custom: 'مخصص',
  }[period]
}
