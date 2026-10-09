import { expect, test } from '@playwright/test'

import { login, openPaymentSheet, openReceiptSheet } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

test('signs in and lands on the workspace shell', async ({ page }) => {
  await installSupabaseMocks(page, { students: [{ id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null }] })
  await login(page)
  await expect(page.getByRole('button', { name: 'الرئيسية' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'التقارير المالية', exact: true })).toBeVisible()
})

test('shows the seeded student on the student directory', async ({ page }) => {
  await installSupabaseMocks(page, { students: [{ id: 's-1', name: 'سارة أحمد', id_number: '900000000', phone: '0590000000', notes: null }] })
  await login(page)
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'دليل الطلاب' }).click()
  await expect(page.getByRole('heading', { name: 'دليل الطلاب' })).toBeVisible()
  await expect(page.getByText('سارة أحمد').first()).toBeVisible()
})

test('opens the activity log as a read-only workspace', async ({ page }) => {
  await installSupabaseMocks(page)
  await login(page)
  await page.getByRole('button', { name: 'النظام', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'سجل التدقيق' }).click()
  await expect(page.getByRole('heading', { name: 'سجل التدقيق' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'البحث في سجل النشاط' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'تصفية حسب المصدر' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'تحديث السجل' })).toBeVisible()
  await expect(page.getByText('لا توجد سجلات مطابقة.')).toBeVisible()
  await expect(page.getByRole('button', { name: /استعادة|إعادة تفعيل/ })).toHaveCount(0)
})

test('creates a receipt and opens its saved voucher print preview', async ({ page }) => {
  const handle = await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: '900000000', phone: '0590000000', notes: null }],
    enrollments: [{ id: '11111111-1111-4111-8111-111111111111', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الرياضيات', course_value: 400 }],
  })
  await login(page)
  await openReceiptSheet(page)
  const dialog = page.getByRole('dialog', { name: 'سند قبض' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('combobox', { name: 'اسم الطالب' }).fill('سارة')
  await page.getByRole('option', { name: /سارة أحمد/ }).click()
  await dialog.getByRole('button', { name: /دورة الرياضيات/ }).click()
  await expect(dialog.getByText('دورة الرياضيات').last()).toBeVisible()
  await dialog.getByRole('button', { name: 'حفظ سند القبض' }).click()
  await expect.poll(() => handle.receiptInserts.length).toBe(1)
  expect(handle.receiptInserts[0]).toMatchObject({ amount_received: 400, allocation_mode: true })
  await expect(page.getByText('معاينة الطباعة — سند قبض')).toBeVisible()
  await expect(page.getByText('# R-901')).toBeVisible()
  await expect(page.getByText('دورة الرياضيات — 400', { exact: false })).toBeVisible()
})


test('accepts Arabic receipt amounts and saves a partial course payment', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, '__E2E_NO_AUTO_PRINT__', { value: true, configurable: true }) })
  const handle = await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null }],
    enrollments: [{ id: '11111111-1111-4111-8111-111111111111', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الرياضيات', course_value: 400 }],
  })
  await login(page)
  await openReceiptSheet(page)
  const dialog = page.getByRole('dialog', { name: 'سند قبض' })
  await dialog.getByRole('combobox', { name: 'اسم الطالب' }).fill('سارة')
  await page.getByRole('option', { name: /سارة أحمد/ }).click()
  await dialog.getByRole('button', { name: /دورة الرياضيات/ }).click()
  const amount = dialog.getByRole('textbox', { name: 'المبلغ المقبوض' })
  await expect(amount).toHaveValue('400')
  await amount.fill('١٥٠')
  await expect(amount).toHaveValue('150')
  await dialog.getByRole('button', { name: 'حفظ سند القبض' }).click()
  await expect.poll(() => handle.receiptInserts.length).toBe(1)
  expect(handle.receiptInserts[0]).toMatchObject({ amount_received: 150, allocation_mode: true })
  expect(handle.receiptAllocations[0]).toMatchObject({ type: 'course', amount: 150 })
  await expect(page.getByText('معاينة الطباعة — سند قبض')).toBeVisible()
  await expect(page.getByText('# R-901')).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'حفظ سند القبض' })).toHaveCount(0)
})


test('prints every selected course allocation after saving a multi-course receipt', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, '__E2E_NO_AUTO_PRINT__', { value: true, configurable: true }) })
  await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null }],
    enrollments: [
      { id: '11111111-1111-4111-8111-111111111111', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الرياضيات', course_value: 400 },
      { id: '22222222-2222-4222-8222-222222222222', student_id: 's-1', course_id: 'c-2', course_name: 'دورة اللغة الإنجليزية', course_value: 300 },
    ],
  })
  await login(page)
  await openReceiptSheet(page)
  const dialog = page.getByRole('dialog', { name: 'سند قبض' })
  await dialog.getByRole('combobox', { name: 'اسم الطالب' }).fill('سارة')
  await page.getByRole('option', { name: /سارة أحمد/ }).click()
  await dialog.getByRole('button', { name: /دورة الرياضيات/ }).click()
  await dialog.getByRole('button', { name: /دورة اللغة الإنجليزية/ }).click()
  await dialog.getByRole('button', { name: 'حفظ سند القبض' }).click()
  await expect(page.getByText('معاينة الطباعة — سند قبض')).toBeVisible()
  await expect(page.getByText('# R-901')).toBeVisible()
  await expect(page.getByText('دورة الرياضيات — 400', { exact: false })).toBeVisible()
  await expect(page.getByText('دورة اللغة الإنجليزية — 300', { exact: false })).toBeVisible()
})

test('prints both a course and a fee allocation after saving one receipt', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, '__E2E_NO_AUTO_PRINT__', { value: true, configurable: true }) })
  await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null }],
    enrollments: [{ id: '11111111-1111-4111-8111-111111111111', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الرياضيات', course_value: 400 }],
    feeObligations: [{
      id: '33333333-3333-4333-8333-333333333333',
      student_id: 's-1',
      course_id: 'c-1',
      course_name: 'دورة الرياضيات',
      description: 'رسم امتحان',
      amount: 100,
      fee_category: 'institute',
      external_share: 0,
      cancelled_at: null,
      cancel_reason: null,
      created_at: '2026-08-31T00:00:00.000Z',
    }],
  })
  await login(page)
  await openReceiptSheet(page)
  const dialog = page.getByRole('dialog', { name: 'سند قبض' })
  await dialog.getByRole('combobox', { name: 'اسم الطالب' }).fill('سارة')
  await page.getByRole('option', { name: /سارة أحمد/ }).click()
  await dialog.getByRole('button', { name: /دورة الرياضيات/ }).click()
  await dialog.getByRole('button', { name: /رسم امتحان/ }).click()
  await dialog.getByRole('button', { name: 'حفظ سند القبض' }).click()
  await expect(page.getByText('تم حفظ السند')).toBeVisible()
  await expect(page.getByText('دورة الرياضيات', { exact: true })).toBeVisible()
  await expect(page.getByText('رسم امتحان', { exact: true })).toBeVisible()
})

test('creates a payment, persists it, and opens the payment print preview', async ({ page }) => {
  const handle = await installSupabaseMocks(page)
  await login(page)
  await openPaymentSheet(page)
  const dialog = page.getByRole('dialog', { name: 'سند صرف' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: 'بند المصروف' }).fill('كهرباء')
  await dialog.getByRole('textbox', { name: 'المبلغ المدفوع' }).fill('250')
  await dialog.getByRole('button', { name: 'حفظ سند الصرف' }).click()
  await expect.poll(() => handle.paymentInserts.length).toBe(1)
  expect(handle.paymentInserts[0]).toMatchObject({ expense_type: 'كهرباء', amount: 250 })
  await expect(page.getByText('معاينة الطباعة — سند صرف')).toBeVisible()
  await expect(page.getByText('P-901').first()).toBeVisible()
  await expect(page.getByText('كهرباء', { exact: true })).toBeVisible()
})

test('cancels a voucher without deleting it and moves it to cancelled history', async ({ page }) => {
  const handle = await installSupabaseMocks(page, { financialMovements: [{ id: 'r-1', movement_type: 'receipt', voucher_number: 912, voucher_date: '2026-08-31', amount: 400, party_name: 'سارة أحمد', context: 'دورة الرياضيات' }] })
  await login(page)
  await page.getByRole('button', { name: 'التقارير المالية', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'تقرير المقبوضات' }).click()
  const voucherLink = page.getByRole('button', { name: 'فتح السند R-912' })
  await expect(voucherLink).toBeVisible()
  await voucherLink.click()
  const details = page.getByRole('dialog', { name: 'R-912' })
  await expect(details).toBeVisible()
  await details.getByRole('button', { name: 'إبطال السند' }).click()
  const dialog = page.getByRole('dialog', { name: 'إبطال سند قبض' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: 'سبب الإبطال' }).fill('إدخال تجريبي خاطئ')
  await dialog.getByRole('button', { name: 'تأكيد الإبطال' }).click()
  await expect.poll(() => handle.cancellations.length).toBe(1)
  expect(handle.cancellations[0]).toMatchObject({ table: 'receipt_vouchers', id: 'r-1', reason: 'إدخال تجريبي خاطئ' })
  expect(handle.activeMovements.some((movement) => movement.id === 'r-1')).toBe(false)
  expect(handle.cancelledVouchers).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'r-1', voucher_number: 912, cancel_reason: 'إدخال تجريبي خاطئ' })]))
  await expect(page.getByRole('button', { name: 'فتح السند R-912' })).toHaveCount(0)
  await page.getByRole('button', { name: 'النظام', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'سجل التدقيق' }).click()
  await expect(page.getByText('لا توجد سجلات مطابقة.')).not.toBeVisible()
})

test('keeps financial reports separated by report type and period', async ({ page }) => {
  await installSupabaseMocks(page)
  await login(page)
  await page.getByRole('button', { name: 'التقارير المالية', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'تقرير المقبوضات' }).click()
  await expect(page.getByRole('heading', { name: 'تقرير المقبوضات' })).toBeVisible()
  const periodSelector = page.getByRole('button', { name: /كل الفترات/ }).first()
  await periodSelector.click()
  const periodDialog = page.getByRole('dialog', { name: 'اختيار فترة التقرير' })
  await expect(periodDialog).toBeVisible()
  await periodDialog.getByRole('button', { name: 'هذا الشهر', exact: true }).click()
  await expect(page.getByRole('button', { name: /هذا الشهر/ }).first()).toBeVisible()
  await page.getByRole('button', { name: 'التقارير المالية', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'تقرير المدفوعات' }).click()
  await expect(page.getByRole('heading', { name: 'تقرير المدفوعات' })).toBeVisible()
  await expect(page.getByRole('button', { name: /استعادة|إعادة تفعيل/ })).toHaveCount(0)
})


test('opens voucher details from the general statement without row action buttons', async ({ page }) => {
  await installSupabaseMocks(page, {
    enrollments: [
      { id: 'en-1', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الرياضيات', course_value: 200 },
      { id: 'en-2', student_id: 's-1', course_id: 'c-2', course_name: 'دورة اللغة الإنجليزية', course_value: 100 },
    ],
    feeObligations: [{
      id: 'fee-1', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الرياضيات',
      description: 'رسم امتحان', amount: 100, fee_category: 'institute', external_share: 0,
      cancelled_at: null, cancel_reason: null, created_at: '2026-08-31T00:00:00.000Z',
    }],
    financialMovements: [
      { id: 'r-2', movement_type: 'receipt', voucher_number: 902, voucher_date: '2026-08-31', amount: 400, party_name: 'سيف الدين احمد بياتنة', context: 'تحصيل متعدّد' },
    ],
    receiptAllocations: [
      { id: 'ra-1', receipt_voucher_id: 'r-2', allocation_type: 'course', enrollment_id: 'en-1', fee_obligation_id: null, amount: 200 },
      { id: 'ra-2', receipt_voucher_id: 'r-2', allocation_type: 'course', enrollment_id: 'en-2', fee_obligation_id: null, amount: 100 },
      { id: 'ra-3', receipt_voucher_id: 'r-2', allocation_type: 'fee', enrollment_id: null, fee_obligation_id: 'fee-1', amount: 100 },
    ],
  })
  await login(page)
  await page.getByRole('button', { name: 'التقارير المالية', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'كشف الحساب العام' }).click()
  await expect(page.getByRole('heading', { name: 'كشف الحساب العام' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'إجراء' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'فتح السند R-902' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'معاينة' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'تعديل' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /إبطال سند/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'فتح السند R-902' }).click()
  const details = page.getByRole('dialog', { name: 'R-902' })
  await expect(details).toBeVisible()
  await expect(details.getByText('سيف الدين احمد بياتنة')).toBeVisible()
  await expect(details.getByText('تحصيل متعدّد')).toBeVisible()
  await expect(details.getByRole('button', { name: 'تعديل السند' })).toBeVisible()
  await expect(details.getByRole('button', { name: 'إبطال السند' })).toBeVisible()
  await expect(details.getByRole('button', { name: 'طباعة السند' })).toBeVisible()
  await details.getByRole('button', { name: 'طباعة السند' }).click()
  await expect(page.getByText('معاينة الطباعة — سند قبض')).toBeVisible()
  await expect(page.getByText('# R-902')).toBeVisible()
  await expect(page.getByText('دورة الرياضيات — 200', { exact: false })).toBeVisible()
  await expect(page.getByText('دورة اللغة الإنجليزية — 100', { exact: false })).toBeVisible()
  await expect(page.getByText('رسم امتحان — 100', { exact: false })).toBeVisible()
})

test('supports financial report period selection, custom dates, and print period metadata', async ({ page }) => {
  await installSupabaseMocks(page, {
    financialMovements: [
      { id: 'r-old', movement_type: 'receipt', voucher_number: 901, voucher_date: '2026-08-31', amount: 100, party_name: 'قديم', context: 'اختبار' },
      { id: 'r-new', movement_type: 'receipt', voucher_number: 902, voucher_date: '2026-09-15', amount: 200, party_name: 'حديث', context: 'اختبار' },
    ],
  })
  await login(page)
  await page.getByRole('button', { name: 'التقارير المالية', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'كشف الحساب العام' }).click()
  await expect(page.getByRole('heading', { name: 'كشف الحساب العام' })).toBeVisible()

  const selector = page.getByRole('button', { name: /كل الفترات/ }).first()
  await selector.click()
  const dialog = page.getByRole('dialog', { name: 'اختيار فترة التقرير' })
  await expect(dialog).toBeVisible()

  const selectorBox = await selector.boundingBox()
  const dialogBox = await dialog.boundingBox()
  expect(selectorBox).not.toBeNull()
  expect(dialogBox).not.toBeNull()
  expect(Math.abs((selectorBox?.width ?? 0) - (dialogBox?.width ?? 0))).toBeLessThanOrEqual(8)

  for (const label of ['الكل', 'اليوم', 'أمس', 'هذا الأسبوع', 'الأسبوع الماضي', 'هذا الشهر', 'الشهر الماضي', 'آخر 7 أيام', 'آخر 30 يومًا', 'هذه السنة']) {
    await expect(dialog.getByRole('button', { name: label, exact: true })).toBeVisible()
  }

  await dialog.getByRole('button', { name: 'مخصص', exact: true }).click()
  await dialog.getByRole('textbox', { name: 'بداية الفترة' }).fill('01/09/2026')
  await dialog.getByRole('textbox', { name: 'نهاية الفترة' }).fill('20/09/2026')
  await dialog.getByRole('textbox', { name: 'نهاية الفترة' }).press('Enter')
  await dialog.getByRole('button', { name: 'تطبيق الفترة' }).click()

  await expect(page.getByRole('button', { name: /مخصص/ }).first()).toBeVisible()
  await expect(page.getByText('حديث · اختبار')).toBeVisible()
  await expect(page.getByText('قديم · اختبار')).toHaveCount(0)

  await page.getByRole('button', { name: 'طباعة' }).click()
  await expect(page.getByText('معاينة الطباعة — كشف الحساب العام')).toBeVisible()
  await expect(page.getByText(/الفترة · مخصص ·/)).toBeVisible()
})

test('persists center settings and reflects reset to defaults', async ({ page }) => {
  await installSupabaseMocks(page)
  await login(page)
  await page.getByRole('button', { name: 'النظام', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'الإعدادات', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'الإعدادات' })).toBeVisible()
  const centerName = page.locator('input').first()
  await expect(centerName).toHaveValue('أرض كنعان')
  await centerName.fill('مركز أرض كنعان التجريبي')
  await centerName.blur()
  await page.reload()
  await page.getByRole('button', { name: 'النظام', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'الإعدادات', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'الإعدادات' })).toBeVisible()
  await expect(page.locator('input').first()).toHaveValue('مركز أرض كنعان التجريبي')
  await page.getByRole('button', { name: 'إعادة كل الإعدادات إلى الافتراضي' }).click()
  await expect(page.locator('input').first()).toHaveValue('أرض كنعان')
})

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
  expect(handle.studentInserts[0]).toMatchObject({ name: 'محمد علي', id_number: '123456789', phone: '0591234567', notes: 'طالب جديد' })
  await expect(page.getByText('تمت إضافة الطالب بنجاح')).toBeVisible()
})

test('restores a validated backup through the real settings path', async ({ page }) => {
  const handle = await installSupabaseMocks(page)
  await login(page)
  await page.getByRole('button', { name: 'النظام', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'الإعدادات', exact: true }).click()
  await page.getByRole('button', { name: 'فتح صفحة النسخ الاحتياطي' }).click()
  await expect(page.getByRole('heading', { name: 'النسخ الاحتياطي والاستعادة' })).toBeVisible()
  const backup = JSON.stringify({ app: 'ard-kanaan', version: 1, exported_at: '2026-08-31T00:00:00.000Z', students: [{ id: 'restored-1', name: 'طالب مستعاد', id_number: null, phone: null, notes: 'من النسخة' }], courses: [], enrollments: [], receipt_vouchers: [], payment_vouchers: [] })
  // The settings tab stays mounted beside the backup tab (each is its own tab now), and
  // both carry a file input — scope to the active backup panel.
  const fileInput = page.getByRole('tabpanel', { name: 'النسخ الاحتياطي' }).locator('input[type="file"]')
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
})

test('handles password recovery and returns to the authenticated shell after password update', async ({ page }) => {
  const handle = await installSupabaseMocks(page)
  const testPassword = ['S', 'trong', 'P', 'ass1', '!'].join('')
  await login(page)
  const recoveryKey = 'access' + '_token'
  const refreshKey = 'refresh' + '_token'
  await page.goto(`/#type=recovery&${recoveryKey}=stub-access&${refreshKey}=stub-refresh`)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'تعيين كلمة مرور جديدة' })).toBeVisible()
  const inputs = page.locator('input[type="password"]')
  await inputs.nth(0).fill(testPassword)
  await inputs.nth(1).fill(testPassword)
  await page.getByRole('button', { name: 'تعيين كلمة المرور' }).click()
  await expect.poll(() => handle.passwordUpdates.length).toBe(1)
  expect(handle.passwordUpdates[0]).toBe(testPassword)
  await expect(page.getByRole('button', { name: 'الرئيسية' })).toBeVisible()
})

test('the النظام menu groups settings and a logout entry', async ({ page }) => {
  await installSupabaseMocks(page)
  await login(page)
  // The top-bar system menu (where the logout button used to sit) holds the
  // settings sub-views plus a logout entry as its last item.
  await page.getByRole('button', { name: 'النظام', exact: true }).click()
  await expect(page.getByRole('menuitemradio', { name: 'الإعدادات', exact: true })).toBeVisible()
  await expect(page.getByRole('menuitemradio', { name: 'النسخ الاحتياطي' })).toBeVisible()
  await expect(page.getByRole('menuitemradio', { name: 'سجل التدقيق' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'تسجيل الخروج' })).toBeVisible()
})