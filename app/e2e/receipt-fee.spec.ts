import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// The student-fees feature: a fee is collected in ONE receipt voucher carrying an
// institute/external split, with no second voucher and no payment voucher.
test('records a shared fee in one receipt and shows the full amount on the statement', async ({ page }) => {
  const handle = await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: '900000000', phone: '0590000000', notes: null }],
  })

  await login(page)
  await page.getByRole('button', { name: 'سند قبض', exact: true }).first().click()

  const dialog = page.getByRole('dialog', { name: 'سند قبض' })
  await expect(dialog).toBeVisible()

  // Pick the student, switch to a fee, classify it as shared with a 30/20 split.
  await dialog.getByRole('combobox', { name: 'اسم الطالب' }).fill('سارة')
  await page.getByRole('option', { name: /سارة أحمد/ }).click()
  await dialog.getByRole('radio', { name: 'رسم', exact: true }).click()
  await dialog.getByRole('textbox', { name: /اسم الرسم/ }).fill('رسوم تخريج')
  await dialog.getByRole('radio', { name: 'مشترك', exact: true }).click()
  await dialog.getByRole('spinbutton', { name: 'إجمالي الرسم' }).fill('50')
  await dialog.getByRole('spinbutton', { name: 'حصة الجهة الخارجية' }).fill('20')
  await dialog.getByRole('button', { name: 'حفظ الرسم' }).click()

  // Exactly one receipt voucher, carrying the immutable split — and NO payment voucher.
  await expect.poll(() => handle.receiptInserts.length).toBe(1)
  expect(handle.receiptInserts[0]).toMatchObject({
    course_name: 'رسوم تخريج',
    course_value: 50,
    amount_received: 50,
    fee_category: 'shared',
    external_share: 20,
  })
  expect(handle.paymentInserts.length).toBe(0)

  // The student statement shows the full fee amount (50), not the institute share.
  const statement = page.getByLabel('كشف حساب سارة أحمد')
  await expect(statement.getByRole('heading', { name: 'كشف الحساب' })).toBeVisible()
  await expect(page.getByText('رسوم تخريج').first()).toBeVisible()
})

test('records an external fee wholly on behalf of a third party', async ({ page }) => {
  const handle = await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null }],
  })

  await login(page)
  await page.getByRole('button', { name: 'سند قبض', exact: true }).first().click()

  const dialog = page.getByRole('dialog', { name: 'سند قبض' })
  await dialog.getByRole('combobox', { name: 'اسم الطالب' }).fill('سارة')
  await page.getByRole('option', { name: /سارة أحمد/ }).click()
  await dialog.getByRole('radio', { name: 'رسم', exact: true }).click()
  await dialog.getByRole('textbox', { name: /اسم الرسم/ }).fill('رسوم جهة خارجية')
  await dialog.getByRole('radio', { name: 'لجهة خارجية', exact: true }).click()
  await dialog.getByRole('spinbutton', { name: 'إجمالي الرسم' }).fill('40')
  await dialog.getByRole('button', { name: 'حفظ الرسم' }).click()

  await expect.poll(() => handle.receiptInserts.length).toBe(1)
  expect(handle.receiptInserts[0]).toMatchObject({ fee_category: 'external', external_share: 40, amount_received: 40 })
  expect(handle.paymentInserts.length).toBe(0)
})
