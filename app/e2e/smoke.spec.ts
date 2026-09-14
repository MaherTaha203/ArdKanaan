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

test('cancels a voucher without deleting it and moves it to cancelled history', async ({ page }) => {
  const handle = await installSupabaseMocks(page, {
    financialMovements: [{
      id: 'r-1', movement_type: 'receipt', voucher_number: 912, voucher_date: '2026-08-31', amount: 400,
      party_name: 'سارة أحمد', context: 'دورة الرياضيات',
    }],
  })

  await login(page)
  await page.getByRole('button', { name: 'التقارير المالية', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'تقرير المقبوضات' }).click()

  const cancelButton = page.getByRole('button', { name: /إبطال سند القبض رقم R-912/ })
  await expect(cancelButton).toBeVisible()
  await cancelButton.click()

  const dialog = page.getByRole('dialog', { name: 'إبطال سند قبض' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: 'سبب الإبطال' }).fill('إدخال تجريبي خاطئ')
  await dialog.getByRole('button', { name: 'تأكيد الإبطال' }).click()

  await expect.poll(() => handle.cancellations.length).toBe(1)
  expect(handle.cancellations[0]).toMatchObject({ table: 'receipt_vouchers', id: 'r-1', reason: 'إدخال تجريبي خاطئ' })
  expect(handle.activeMovements.some((movement) => movement.id === 'r-1')).toBe(false)
  expect(handle.cancelledVouchers).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'r-1', voucher_number: 912, cancel_reason: 'إدخال تجريبي خاطئ' }),
  ]))

  await expect(page.getByRole('button', { name: /إبطال سند القبض رقم R-912/ })).toHaveCount(0)

  await page.getByRole('button', { name: 'إعدادات', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'سجل التدقيق' }).click()
  await expect(page.getByText('لا توجد سجلات مطابقة.')).not.toBeVisible()
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
  await page.getByRole('button', { name: 'إعدادات', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'الإعدادات', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'الإعدادات' })).toBeVisible()
  await expect(page.locator('input').first()).toHaveValue('مركز أرض كنعان التجريبي')

  await page.getByRole('button', { name: 'إعادة كل الإعدادات إلى الافتراضي' }).click()
  await expect(page.locator('input').first()).toHaveValue('أرض كنعان')
});

test('adds a student through the real student form path', async ({ page }) => {
  const handle = await installSupabaseMocks(page)

  await login(page)
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'دليل الطلاب' }).click()
  await page.getByRole('button', { name: 'إضافة طالب', exact: true }).click()

  const dialog = page.getByRole('dialog', { name: 'إضافة طالب' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: 'اسم الطالب' }).fill('محمد علي')
  await dialog.getByRole('textbox', { name: 'الرقم التعريفي' }).fill('123456789')
  await dialog.getByRole('textbox', { name: 'الهاتف' }).fill('0591234567')
  await dialog.getByRole('textbox', { name: 'الملاحظات' }).fill('طالب جديد')
  await dialog.getByRole('button', { name: 'إضافة الطالب' }).click()

  await expect.poll(() => handle.studentInserts.length).toBe(1)
  expect(handle.studentInserts[0]).toMatchObject({
    name: 'محمد علي',
    id_number: '123456789',
    phone: '0591234567',
    notes: 'طالب جديد',
  })
  await expect(page.getByText('تمت إضافة الطالب بنجاح')).toBeVisible()
});

test('restores a validated backup through the real settings path', async ({ page }) => {
  const handle = await installSupabaseMocks(page)

  await login(page)
  await page.getByRole('button', { name: 'إعدادات', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'الإعدادات', exact: true }).click()
  await page.getByRole('button', { name: 'فتح صفحة النسخ الاحتياطي' }).click()

  await expect(page.getByRole('heading', { name: 'النسخ الاحتياطي والاستعادة' })).toBeVisible()
  const backup = JSON.stringify({
    app: 'ard-kanaan',
    version: 1,
    exported_at: '2026-08-31T00:00:00.000Z',
    students: [{ id: 'restored-1', name: 'طالب مستعاد', id_number: null, phone: null, notes: 'من النسخة' }],
    courses: [],
    enrollments: [],
    receipt_vouchers: [],
    payment_vouchers: [],
  })

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(backup) })
  const dialog = page.getByRole('dialog', { name: 'تأكيد الاستعادة' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox').fill('استعادة')
  await dialog.getByRole('button', { name: 'تأكيد الاستعادة' }).click()

  await expect.poll(() => handle.restoreCalls.length).toBe(1)
  expect(handle.restoreCalls[0]).toMatchObject({ force: false })
  await expect(page.getByText('تمت الاستعادة بنجاح')).toBeVisible()

  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'دليل الطلاب' }).click()
  await expect(page.getByText('طالب مستعاد')).toBeVisible()
});

test('handles password recovery and returns to the authenticated shell after password update', async ({ page }) => {
  const handle = await installSupabaseMocks(page)

  await login(page)
  await page.goto('/#type=recovery&access_token=stub-access&refresh_token=stub-refresh')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'تعيين كلمة مرور جديدة' })).toBeVisible()
  const inputs = page.locator('input[type="password"]')
  await inputs.nth(0).fill('StrongPass1!')
  await inputs.nth(1).fill('StrongPass1!')
  await page.getByRole('button', { name: 'تعيين كلمة المرور' }).click()

  await expect.poll(() => handle.passwordUpdates.length).toBe(1)
  expect(handle.passwordUpdates[0]).toBe('StrongPass1!')
  await expect(page.getByRole('button', { name: 'الرئيسية' })).toBeVisible()
});
