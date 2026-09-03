import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

test('signs in and lands on the workspace shell', async ({ page }) => {
  await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null }],
  })

  await login(page)

  // The primary navigation and money actions are present.
  await expect(page.getByRole('button', { name: 'الإطلالة' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'سند قبض', exact: true }).first()).toBeVisible()
})

test('shows the seeded student on the student directory', async ({ page }) => {
  await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: '900000000', phone: '0590000000', notes: null }],
  })

  await login(page)
  await page.getByRole('button', { name: 'معلومات الطلاب' }).click()
  await page.getByRole('menuitemradio', { name: 'أسماء الطلاب' }).click()

  await expect(page.getByRole('heading', { name: 'أسماء الطلاب' })).toBeVisible()
  await expect(page.getByText('سارة أحمد').first()).toBeVisible()
})

test('opens the activity log as a read-only workspace', async ({ page }) => {
  await installSupabaseMocks(page)

  await login(page)
  await page.getByRole('button', { name: 'إعدادات', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'سجل العمل' }).click()

  await expect(page.getByRole('heading', { name: 'سجل العمل' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'البحث في سجل النشاط' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'تصفية حسب المصدر' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'تحديث السجل' })).toBeVisible()
  await expect(page.getByText('السجل للقراءة والمراجعة فقط')).toBeVisible()
  await expect(page.getByText('لا توجد سجلات مطابقة.')).toBeVisible()
  await expect(page.getByRole('button', { name: /استعادة|إعادة تفعيل/ })).toHaveCount(0)
})
