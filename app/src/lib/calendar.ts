// Pure calendar helpers for the date-picker UI. These only build a month grid and
// shift ISO dates for keyboard navigation — they never touch stored values, financial
// data, or how a chosen date is persisted (always a YYYY-MM-DD string).

// The week starts on Saturday in the Levant (getDay: 0=Sun … 6=Sat).
export const WEEK_STARTS_ON = 6

export type CalendarDay = {
  iso: string
  day: number
  // True when the cell belongs to the grid's own month (vs a leading/trailing filler).
  inMonth: boolean
}

// A YYYY-MM-DD string from calendar parts (month0 is 0-based, as Date uses).
export function isoDate(year: number, month0: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month0 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// A fixed 6-row × 7-column grid for the given month, with leading/trailing days from
// the neighbouring months so every week is full. Days run in real calendar order.
export function monthMatrix(year: number, month0: number, weekStartsOn: number = WEEK_STARTS_ON): CalendarDay[][] {
  const firstWeekday = new Date(year, month0, 1).getDay()
  const lead = (firstWeekday - weekStartsOn + 7) % 7
  const cursor = new Date(year, month0, 1 - lead)

  const weeks: CalendarDay[][] = []
  for (let w = 0; w < 6; w += 1) {
    const week: CalendarDay[] = []
    for (let d = 0; d < 7; d += 1) {
      week.push({
        iso: isoDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()),
        day: cursor.getDate(),
        inMonth: cursor.getMonth() === month0 && cursor.getFullYear() === year,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

// Shift an ISO date by whole days, staying a valid calendar date across month/year
// boundaries.
export function addDays(iso: string, delta: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day + delta)
  return isoDate(date.getFullYear(), date.getMonth(), date.getDate())
}

// Shift an ISO date by whole months, clamping the day to the target month's length
// (e.g. 31 Jan − 1 month → 31 Dec, but 31 Mar − 1 month → 28/29 Feb).
export function addMonths(iso: string, delta: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const target = new Date(year, month - 1 + delta, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return isoDate(target.getFullYear(), target.getMonth(), Math.min(day, lastDay))
}

// Short Arabic weekday headers, ordered to match the grid's first column.
export function weekdayLabels(weekStartsOn: number = WEEK_STARTS_ON): string[] {
  const byDayIndex = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
  return Array.from({ length: 7 }, (_, i) => byDayIndex[(weekStartsOn + i) % 7])
}
