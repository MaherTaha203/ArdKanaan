import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// P1-7: an existing student's identity record can be corrected (never deleted).
test('edits a student and persists the change through an UPDATE', async ({ page }) => {
  const handle = await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: '900000000', phone: '0590000000', notes: null }],
  })

  await login(page)
  await page.getByRole('button', { name: 'معلومات الطلاب' }).click()
  await page.getByRole('menuitemradio', { name: 'أسماء الطلاب' }).click()
  await page.getByRole('button', { name: /سارة أحمد/ }).click()

  // Open the edit sheet for the active student and correct the name.
  await page.getByRole('button', { name: 'تعديل الطالب' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  const nameField = dialog.getByLabel('اسم الطالب')
  await nameField.fill('سارة أحمد الحسن')
  await dialog.getByRole('button', { name: /حفظ بيانات الطالب/ }).click()

  // The change is confirmed and reached the database as an UPDATE, not a new row.
  await expect(page.getByText('تم حفظ بيانات الطالب')).toBeVisible()
  expect(handle.studentUpdates).toHaveLength(1)
  expect(handle.studentUpdates[0].body).toMatchObject({ name: 'سارة أحمد الحسن' })
})
