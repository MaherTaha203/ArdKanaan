import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// ADR-0077: a fee can be added to a student directly, with the course optional.
// This covers the standalone (no-course) obligation — the case the old model made
// impossible — through the "إضافة رسم" action on the student statement.

async function openStatement(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'كشف الحساب' }).click()
}

test('adds a standalone (no-course) fee to a student from the statement', async ({ page }) => {
  await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'أحمد المستقل', id_number: null, phone: null, notes: null, status: 'active' }],
  })

  await login(page)
  await openStatement(page)

  await page.getByRole('button', { name: 'إضافة رسم', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  await dialog.getByPlaceholder('مثال: رسوم امتحان').fill('رسوم امتحان')
  await dialog.getByRole('spinbutton').first().fill('50')
  // The course select stays on "بدون دورة (رسم مستقل)" — a standalone obligation.
  await dialog.getByRole('button', { name: 'إضافة الرسم', exact: true }).click()

  await expect(dialog).toBeHidden()

  // The fee now shows on the student, labelled بدون دورة (no course context).
  await expect(page.getByText('رسوم امتحان')).toBeVisible()
  await expect(page.getByText('بدون دورة').first()).toBeVisible()
})
