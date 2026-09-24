import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// UI/navigation only. Exercises the tabbed workspace: opening pages as tabs, no
// duplicate tabs, switching, closing, the permanent home tab, and — critically —
// that a page stays mounted (keeps its state) while another tab is active.

test('opens pages as tabs, prevents duplicates, switches, closes, and keeps home', async ({ page }) => {
  await installSupabaseMocks(page, { students: [{ id: 's-1', name: 'سارة أحمد', id_number: '900000000', phone: '0590000000', notes: null }] })
  await login(page)

  const tablist = page.getByRole('tablist', { name: 'الصفحات المفتوحة' })
  await expect(tablist).toBeVisible()

  // Home is the first tab, active, and cannot be closed.
  await expect(page.getByRole('tab', { name: 'الرئيسية' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('button', { name: 'إغلاق الرئيسية' })).toHaveCount(0)
  await expect(tablist.getByRole('tab')).toHaveCount(1)

  // Open the students page → a students tab appears and becomes active.
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'دليل الطلاب' }).click()
  await expect(page.getByRole('tab', { name: 'دليل الطلاب' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tab', { name: 'الرئيسية' })).toHaveAttribute('aria-selected', 'false')

  // Open a second page → a courses tab; now three tabs are open.
  await page.getByRole('button', { name: 'الدورات', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'الدورات' })).toHaveAttribute('aria-selected', 'true')
  await expect(tablist.getByRole('tab')).toHaveCount(3)

  // Re-opening students does NOT create a second tab — it re-focuses the existing one.
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'دليل الطلاب' }).click()
  await expect(page.getByRole('tab', { name: 'دليل الطلاب' })).toHaveCount(1)
  await expect(tablist.getByRole('tab')).toHaveCount(3)
  await expect(page.getByRole('tab', { name: 'دليل الطلاب' })).toHaveAttribute('aria-selected', 'true')

  // The home tab is always reachable and never disappears.
  await page.getByRole('tab', { name: 'الرئيسية' }).click()
  await expect(page.getByRole('tab', { name: 'الرئيسية' })).toHaveAttribute('aria-selected', 'true')
  await expect(tablist.getByRole('tab')).toHaveCount(3)

  // Closing a tab removes it; home + students remain.
  await page.getByRole('button', { name: 'إغلاق الدورات' }).click()
  await expect(page.getByRole('tab', { name: 'الدورات' })).toHaveCount(0)
  await expect(tablist.getByRole('tab')).toHaveCount(2)
})

test('keeps a page mounted with its state when switching tabs', async ({ page }) => {
  await installSupabaseMocks(page, { students: [{ id: 's-1', name: 'سارة أحمد', id_number: '900000000', phone: '0590000000', notes: null }] })
  await login(page)

  // Open the student directory and type a search term.
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'دليل الطلاب' }).click()
  const search = page.getByRole('searchbox', { name: 'البحث عن طالب' })
  await search.fill('سارة')
  await expect(search).toHaveValue('سارة')

  // Move to another tab, then back — the typed value survives (the page stayed mounted).
  await page.getByRole('button', { name: 'الدورات', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'الدورات' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('tab', { name: 'دليل الطلاب' }).click()
  await expect(page.getByRole('searchbox', { name: 'البحث عن طالب' })).toHaveValue('سارة')
})
