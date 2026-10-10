import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// End-to-end regression for the three everyday workflows affected by ADR-0080:
// create a course with a distinct monthly price, add/register a student, then
// collect that month's generated obligation through the existing receipt RPC.
test('creates a monthly course, adds and enrolls a student, then receipts the monthly obligation', async ({ page }) => {
  const handle = await installSupabaseMocks(page)
  await login(page)

  // A new course stores the monthly price separately; the old total price stays unset.
  await page.getByRole('button', { name: 'الدورات', exact: true }).first().click()
  await page.getByRole('button', { name: 'إضافة دورة', exact: true }).first().click()
  const courseDialog = page.getByRole('dialog', { name: 'إضافة دورة' })
  await courseDialog.getByLabel('اسم الدورة').fill('دورة اختبار الرسوم الشهرية')
  await courseDialog.getByLabel('الاشتراك الشهري').fill('250')
  await courseDialog.getByRole('button', { name: 'إضافة الدورة' }).click()
  await expect(page.getByText('تمت إضافة الدورة بنجاح')).toBeVisible()
  expect(handle.courseInserts).toHaveLength(1)
  expect(handle.courseInserts[0]).toMatchObject({ name: 'دورة اختبار الرسوم الشهرية', base_fee: null, monthly_fee: 250 })

  // Add a student through the normal student directory form.
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'دليل الطلاب' }).click()
  await page.getByRole('button', { name: 'إضافة طالب', exact: true }).click()
  const studentDialog = page.getByRole('dialog', { name: 'إضافة طالب' })
  await studentDialog.getByLabel('اسم الطالب').fill('طالب اختبار شهري')
  await studentDialog.getByRole('button', { name: 'إضافة الطالب' }).click()
  await expect(page.getByText('تمت إضافة الطالب بنجاح')).toBeVisible()
  expect(handle.studentInserts).toHaveLength(1)
  expect(handle.studentInserts[0]).toMatchObject({ name: 'طالب اختبار شهري' })

  // Register the student. Registration itself must not create a total-fee charge.
  await page.getByRole('button', { name: 'الدورات', exact: true }).first().click()
  await page.getByRole('button', { name: /دورة اختبار الرسوم الشهرية/ }).click()
  await page.getByRole('button', { name: 'تسجيل طالب', exact: true }).first().click()
  const enrollDialog = page.getByRole('dialog', { name: 'تسجيل طالب' })
  await enrollDialog.getByRole('combobox').fill('طالب اختبار شهري')
  await page.getByRole('option', { name: /طالب اختبار شهري/ }).click()
  await enrollDialog.getByRole('button', { name: 'تسجيل الطالب' }).click()
  await expect(page.getByText('تم تسجيل الطالب في الدورة بنجاح')).toBeVisible()
  expect(handle.receiptInserts).toHaveLength(0)

  // Generate the explicitly selected month, then verify it is available for receipt.
  await page.getByRole('button', { name: 'إنشاء اشتراكات شهرية', exact: true }).click()
  const monthlyDialog = page.getByRole('dialog', { name: 'إنشاء الاشتراكات الشهرية' })
  await monthlyDialog.getByLabel('شهر الاستحقاق').fill('2026-10')
  await monthlyDialog.getByRole('button', { name: 'معاينة الطلاب والاستحقاقات' }).click()
  await expect(monthlyDialog.getByText('طالب اختبار شهري')).toBeVisible()
  await expect(monthlyDialog.getByText('250', { exact: true }).first()).toBeVisible()
  await monthlyDialog.getByRole('button', { name: /تأكيد إنشاء 1 استحقاق/ }).click()
  await expect(page.getByText('تم إنشاء 1 استحقاق شهري')).toBeVisible()
  expect(handle.feeObligationInserts).toHaveLength(0)
  expect(handle.receiptInserts).toHaveLength(0)

  // Use the standard receipt sheet; it should allocate against the monthly fee row.
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'دليل الطلاب' }).click()
  await page.getByRole('button', { name: /طالب اختبار شهري/ }).click()
  await page.getByRole('button', { name: 'سند قبض', exact: true }).click()
  const receiptDialog = page.getByRole('dialog', { name: 'سند قبض' })
  await receiptDialog.getByRole('combobox', { name: 'اسم الطالب' }).fill('طالب اختبار شهري')
  await page.getByRole('option', { name: /طالب اختبار شهري/ }).click()
  await receiptDialog.getByRole('button', { name: /الاشتراك الشهري/ }).click()
  await expect(receiptDialog.getByText('250').last()).toBeVisible()
  await receiptDialog.getByRole('button', { name: 'حفظ سند القبض' }).click()

  await expect.poll(() => handle.receiptInserts.length).toBe(1)
  expect(handle.receiptInserts[0]).toMatchObject({ amount_received: 250, allocation_mode: true })
  expect(handle.receiptInserts[0].allocations).toEqual([
    expect.objectContaining({ type: 'fee', fee_obligation_id: expect.any(String), amount: 250 }),
  ])
  expect(handle.receiptAllocations).toEqual([
    expect.objectContaining({ allocation_type: 'fee', amount: 250 }),
  ])
})
