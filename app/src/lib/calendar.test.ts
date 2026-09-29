import { describe, expect, test } from 'vitest'

import { addDays, addMonths, isoDate, monthMatrix, weekdayLabels, WEEK_STARTS_ON } from '@/lib/calendar'

describe('isoDate', () => {
  test('pads month and day to two digits', () => {
    expect(isoDate(2026, 0, 5)).toBe('2026-01-05')
    expect(isoDate(2026, 11, 31)).toBe('2026-12-31')
  })
})

describe('monthMatrix', () => {
  test('returns a full 6×7 grid', () => {
    const grid = monthMatrix(2026, 8) // September 2026
    expect(grid).toHaveLength(6)
    grid.forEach((week) => expect(week).toHaveLength(7))
  })

  test('first cell falls on the configured week start', () => {
    // Saturday start (Levant): the very first cell must be a Saturday.
    const grid = monthMatrix(2026, 8)
    const firstIso = grid[0][0].iso
    const [y, m, d] = firstIso.split('-').map(Number)
    expect(new Date(y, m - 1, d).getDay()).toBe(WEEK_STARTS_ON)
  })

  test('marks exactly the month days as inMonth', () => {
    const grid = monthMatrix(2026, 1) // February 2026 — 28 days, not a leap year
    const inMonth = grid.flat().filter((cell) => cell.inMonth)
    expect(inMonth).toHaveLength(28)
    expect(inMonth[0].iso).toBe('2026-02-01')
    expect(inMonth[inMonth.length - 1].iso).toBe('2026-02-28')
  })

  test('cells are consecutive calendar days', () => {
    const flat = monthMatrix(2026, 8).flat()
    for (let i = 1; i < flat.length; i += 1) {
      expect(flat[i].iso).toBe(addDays(flat[i - 1].iso, 1))
    }
  })
})

describe('addDays', () => {
  test('crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('addMonths', () => {
  test('clamps the day to the target month length', () => {
    expect(addMonths('2026-03-31', -1)).toBe('2026-02-28')
    expect(addMonths('2026-01-15', 1)).toBe('2026-02-15')
    expect(addMonths('2026-12-10', 1)).toBe('2027-01-10')
  })
})

describe('weekdayLabels', () => {
  test('are ordered from the week start', () => {
    const labels = weekdayLabels()
    expect(labels).toHaveLength(7)
    expect(labels[0]).toBe('سبت')
    expect(labels[6]).toBe('جمعة')
  })
})
