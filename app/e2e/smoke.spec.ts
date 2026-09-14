import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

test('signs in and lands on the workspace shell', async ({ page }) => {
  await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null }],
  })

  await login(page)

  // The primary navigation and money actions are present.
  await expect(page.getByRole('button', { name: 'الرئيسية' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'سند قبض', exact: true }).first()).toBeVisible()
})

test('shows the seeded student on the student directory', async ({ page }) => {
  await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: '900000000', phone: '0590000000', notes: null }],
  })

  await login(page)
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'دليل الطلاب' }).click()

  await expect(page.getByRole('heading', { name: 'دليل الطلاب' })).toBeVisible()
  await expect(page.getByText('سارة أحمد').first()).toBeVisible()
})

test('opens the activity log as a read-only workspace', async ({ page }) => {
  await installSupabaseMocks(page)

  await login(page)
  await page.getByRole('button', { name: 'إعدادات', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'سجل التدقيق' }).click()

  await expect(page.getByRole('heading', { name: 'سجل التدقيق' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'البحث في سجل النشاط' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'تصفية حسب المصدر' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'تحديث السجل' })).toBeVisible()
  await expect(page.getByText('لا توجد سجلات مطابقة.')).toBeVisible()
  await expect(page.getByRole('button', { name: /استعادة|إعادة تفعيل/ })).toHaveCount(0)
})

test('creates a receipt, reaches the student statement, then opens its print preview', async ({ page }) => {
  const handle = await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: '900000000', phone: '0590000000', notes: null }],
  })

  await login(page)
  await page.getByRole('button', { name: 'سند قبض', exact: true }).first().click()

  const dialog = page.getByRole('dialog', { name: 'سند قبض' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('combobox', { name: 'اسم الطالب' }).fill('سارة')
  await page.getByRole('option', { name: /سارة أحمد/ }).click()
  await dialog.getByRole('textbox', { name: /اسم الدورة/ }).fill('دورة الرياضيات')
  await dialog.getByRole('spinbutton', { name: 'قيمة الدورة' }).fill('1000')
  await dialog.getByRole('spinbutton', { name: 'المبلغ المقبوض' }).fill('400')
  await dialog.getByRole('button', { name: 'حفظ سند القبض' }).click()

  await expect.poll(() => handle.receiptInserts.length).toBe(1)
  await expect(page.getByRole('heading', { name: 'كشف الحساب' })).toBeVisible()
  await expect(page.getByText('دورة الرياضيات').first()).toBeVisible()
  await expect(page.getByText('R-900').first()).toBeVisible()

  await page.getByRole('button', { name: 'طباعة الكشف' }).click()
  await expect(page.getByText('معاينة الطباعة — كشف حساب الطالب')).toBeVisible()
  await expect(page.getByText('R-900').last()).toBeVisible()
})

test('keeps financial reports separated by report type and period', async ({ page }) => {
  await installSupabaseMocks(page)

  await login(page)
  await page.getByRole('button', { name: 'التقارير المالية', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'تقرير المقبوضات' }).click()

  await expect(page.getByRole('heading', { name: 'تقرير المقبوضات' })).toBeVisible()
  await page.getByRole('button', { name: 'هذا الشهر', exact: true }).click()
  await expect(page.getByRole('button', { name: 'هذا الشهر', exact: true })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'التقارير المالية', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'تقرير المدفوعات' }).click()
  await expect(page.getByRole('heading', { name: 'تقرير المدفوعات' })).toBeVisible()
  await expect(page.getByRole('button', { name: /استعادة|إعادة تفعيل/ })).toHaveCount(0)
})
