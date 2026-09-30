import { describe, expect, it } from 'vitest'

import { periodLabel, reportPeriodRange } from '@/features/financial-report/report-period'

const TODAY = new Date(2026, 8, 30)

describe('report period ranges', () => {
  it('uses the full current day for today', () => {
    expect(reportPeriodRange('today', TODAY)).toEqual({
      start: '2026-09-30',
      end: '2026-09-30',
    })
  })

  it('uses Saturday as the week start', () => {
    expect(reportPeriodRange('week', TODAY)).toEqual({
      start: '2026-09-26',
      end: '2026-09-30',
    })
  })

  it('returns the current month through today', () => {
    expect(reportPeriodRange('month', TODAY)).toEqual({
      start: '2026-09-01',
      end: '2026-09-30',
    })
  })

  it('returns a complete previous month', () => {
    expect(reportPeriodRange('last-month', TODAY)).toEqual({
      start: '2026-08-01',
      end: '2026-08-31',
    })
  })

  it('returns rolling seven and thirty day periods including today', () => {
    expect(reportPeriodRange('last-7', TODAY)).toEqual({
      start: '2026-09-24',
      end: '2026-09-30',
    })
    expect(reportPeriodRange('last-30', TODAY)).toEqual({
      start: '2026-09-01',
      end: '2026-09-30',
    })
  })

  it('keeps all dates unrestricted', () => {
    expect(reportPeriodRange('all', TODAY)).toEqual({ start: null, end: null })
  })

  it('keeps labels stable for the UI', () => {
    expect(periodLabel('month')).toBe('هذا الشهر')
    expect(periodLabel('last-30')).toBe('آخر 30 يومًا')
    expect(periodLabel('custom')).toBe('مخصص')
  })
})
