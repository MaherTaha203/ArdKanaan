import { expect, test } from '@playwright/test'

import { login, openPaymentSheet } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// The smart date field keeps keyboard typing but also offers a modern calendar popover.
// This covers the click path: open the calendar, step to the previous month, pick a day,
// and confirm the field reflects it. UI only — the value stays a YYYY-MM-DD ISO string.

test('picks a date from the calendar popover on a voucher sheet', async ({ page }) => {
  await installSupabaseMocks(page)
  await login(page)
  await openPaymentSheet(page)

  const dialog = page.getByRole('dialog', { name: 'سند صرف' })
  await dialog.getByRole('button', { name: 'فتح التقويم' }).click()

  const calendar = page.getByRole('dialog', { name: 'اختيار التاريخ' })
  await expect(calendar).toBeVisible()

  // Step to the previous month and choose the 15th — always a real, past day.
  await calendar.getByRole('button', { name: 'الشهر السابق' }).click()
  await calendar.getByRole('button', { name: '15', exact: true }).click()

  const now = new Date()
  const picked = new Date(now.getFullYear(), now.getMonth() - 1, 15)
  const expected = `${String(picked.getDate()).padStart(2, '0')}/${String(picked.getMonth() + 1).padStart(2, '0')}/${picked.getFullYear()}`

  await expect(calendar).toBeHidden()
  await expect(dialog.getByRole('textbox', { name: 'تاريخ الدفع' })).toHaveValue(expected)
})

test('typed quick entry still resolves a full date', async ({ page }) => {
  await installSupabaseMocks(page)
  await login(page)
  await openPaymentSheet(page)

  const dialog = page.getByRole('dialog', { name: 'سند صرف' })
  const field = dialog.getByRole('textbox', { name: 'تاريخ الدفع' })

  // A compact typed date (ddmmyyyy) resolves and is displayed in the operator's format.
  await field.fill('15032020')
  await field.blur()
  await expect(field).toHaveValue('15/03/2020')
})
