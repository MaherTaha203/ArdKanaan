import { expect, test } from '@playwright/test'

import { login, openReceiptSheet } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// P1-6: a receipt must never bind to the wrong student when a name is shared.
test('warns and refuses to save a receipt for an ambiguous student name', async ({ page }) => {
  const handle = await installSupabaseMocks(page, {
    students: [
      { id: 's-1', name: 'محمد علي', id_number: null, phone: null, notes: null },
      { id: 's-2', name: 'محمد علي', id_number: null, phone: null, notes: null },
    ],
  })

  await login(page)
  await openReceiptSheet(page)

  // Typing the shared name (without picking from the list) raises an inline warning.
  await page.getByPlaceholder('ابحث بالاسم أو الهاتف أو رقم الهوية').fill('محمد علي')
  await expect(page.getByText('يوجد أكثر من طالب بهذا الاسم').first()).toBeVisible()

  // Fill the rest and try to save anyway.
  await page.getByLabel('اسم الدورة').fill('دورة الإنجليزية')
  await page.getByLabel('قيمة الدورة').fill('1000')
  await page.locator('input[type="number"]').last().fill('400')
  await page.getByRole('button', { name: /حفظ سند القبض/ }).click()

  // The save is refused with the specific, actionable message — and no receipt was written.
  await expect(page.getByRole('alert')).toContainText('اختر المقصود من القائمة لتفادي ربط السند بالطالب الخطأ')
  expect(handle.receiptInserts).toHaveLength(0)
})

// A unique student can be explicitly picked and saved normally.
test('saves a receipt for a unique student name', async ({ page }) => {
  await installSupabaseMocks(page, {
    students: [
      { id: 's-unique', name: 'خالد سمير', id_number: null, phone: null, notes: null },
    ],
  })

  await login(page)
  await openReceiptSheet(page)

  await page.getByPlaceholder('ابحث بالاسم أو الهاتف أو رقم الهوية').fill('خالد سمير')
  await page.getByRole('option', { name: 'خالد سمير' }).click()
  await page.getByLabel('اسم الدورة').fill('دورة الرياضيّات')
  await page.getByLabel('قيمة الدورة').fill('1200')
  await page.locator('input[type="number"]').last().fill('500')
  await page.getByRole('button', { name: /حفظ سند القبض/ }).click()

  // The sheet closes only after the real save path succeeds; this avoids synchronizing on a transient toast.
  await expect(page.getByRole('button', { name: /حفظ سند القبض/ })).toBeHidden()
})
