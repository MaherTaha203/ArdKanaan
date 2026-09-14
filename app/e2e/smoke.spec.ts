import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

test('signs in and lands on the workspace shell', async ({ page }) => {
  await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null }],
  })

  await login(page)

  await expect(page.getByRole('button', { name: 'الرئيسية' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'سند قبض', exact: true }).first()).toBeVisible()
});

test('shows the seeded student on the student directory', async ({ page }) => {
  await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: '900000000', phone: '0590000000', notes: null }],
  })

  await login(page)
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'دليل الطلاب' }).click()

  await expect(page.getByRole('heading', { name: 'دليل الطلاب' })).toBeVisible()
  await expect(page.getByText('سارة أحمد').first()).toBeVisible()
});

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
});

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
  const statement = page.getByLabel('كشف حساب سارة أحمد')
  await expect(statement.getByRole('heading', { name: 'كشف الحساب' })).toBeVisible()
  await expect(page.getByText('دورة الرياضيات').first()).toBeVisible()
  await expect(page.getByText('R-900').first()).toBeVisible()

  await page.getByRole('button', { name: 'طباعة الكشف' }).click()
  await expect(page.getByText('معاينة الطباعة — كشف حساب الطالب')).toBeVisible()
  await expect(page.getByText('R-900').last()).toBeVisible()
});

test('creates a payment, persists it, and opens the payment print preview', async ({ page }) => {
  const handle = await installSupabaseMocks(page)

  await login(page)
  await page.getByRole('button', { name: 'سند صرف', exact: true }).first().click()

  const dialog = page.getByRole('dialog', { name: 'سند صرف' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: 'بند المصروف' }).fill('كهرباء')
  await dialog.getByRole('spinbutton', { name: 'المبلغ المدفوع' }).fill('250')
  await dialog.getByRole('button', { name: 'حفظ سند الصرف' }).click()

  await expect.poll(() => handle.paymentInserts.length).toBe(1)
  expect(handle.paymentInserts[0]).toMatchObject({ expense_type: 'كهرباء', amount: 250 })
  await expect(page.getByText('معاينة الطباعة — سند صرف')).toBeVisible()
  await expect(page.getByText('P-901').first()).toBeVisible()
  await expect(page.getByText('كهرباء')).toBeVisible()
});

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
});

test('persists center settings and reflects reset to defaults', async ({ page }) => {
  await installSupabaseMocks(page)

  await login(page)
  await page.getByRole('button', { name: 'إعدادات', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'الإعدادات', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'الإعدادات' })).toBeVisible()
  const centerName = page.locator('input').first()
  await expect(centerName).toHaveValue('أرض كنعان')
  await centerName.fill('مركز أرض كنعان التجريبي')
  await centerName.blur()

  await page.reload()
  await expect(page.locator('input').first()).toHaveValue('مركز أرض كنعان التجريبي')

  await page.getByRole('button', { name: 'إعادة كل الإعدادات إلى الافتراضي' }).click()
  await expect(page.locator('input').first()).toHaveValue('أرض كنعان')
});
