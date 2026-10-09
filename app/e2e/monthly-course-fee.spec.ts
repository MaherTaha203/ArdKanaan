import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

const COURSE = { id: 'c-monthly', name: 'دورة شهرية', base_fee: 700, monthly_fee: 250, start_date: '2026-09-01', end_date: null, status: 'active' as const, notes: null }
const STUDENTS = [
  { id: 's-monthly-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null, status: 'active' as const },
  { id: 's-monthly-2', name: 'محمد علي', id_number: null, phone: null, notes: null, status: 'active' as const },
]
const ENROLLMENTS = [
  { id: 'e-monthly-1', student_id: 's-monthly-1', course_id: 'c-monthly', course_name: 'دورة شهرية', course_value: 0, billing_model: 'monthly' as const },
  { id: 'e-monthly-2', student_id: 's-monthly-2', course_id: 'c-monthly', course_name: 'دورة شهرية', course_value: 0, billing_model: 'monthly' as const },
]

test('owner previews and confirms monthly course fees without duplicating a month', async ({ page }) => {
  await installSupabaseMocks(page, { courses: [COURSE], students: STUDENTS, enrollments: ENROLLMENTS })
  await login(page)
  await page.getByRole('button', { name: 'الدورات', exact: true }).first().click()
  await page.getByRole('button', { name: /دورة شهرية/ }).click()
  await page.getByRole('button', { name: 'رسوم شهرية' }).click()

  const dialog = page.getByRole('dialog', { name: 'إنشاء الرسوم الشهرية' })
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('شهر الاستحقاق').fill('2026-10')
  await dialog.getByRole('button', { name: 'معاينة الطلاب والاستحقاقات' }).click()

  await expect(dialog.getByText('سارة أحمد')).toBeVisible()
  await expect(dialog.getByText('محمد علي')).toBeVisible()
  await expect(dialog.getByText('استحقاقات جديدة')).toBeVisible()
  await expect(dialog.getByRole('button', { name: /تأكيد إنشاء 2 استحقاق/ })).toBeEnabled()
  await dialog.getByRole('button', { name: /تأكيد إنشاء 2 استحقاق/ }).click()

  await expect(page.getByText('تم إنشاء 2 استحقاق شهري')).toBeVisible()
  await expect(page.getByText('2026-10-01').first()).toBeVisible()
})

test('monthly fee type and recipient split remain independent', async ({ page }) => {
  await installSupabaseMocks(page, { courses: [COURSE], students: STUDENTS, enrollments: ENROLLMENTS })
  await login(page)
  await page.getByRole('button', { name: 'الدورات', exact: true }).first().click()
  await page.getByRole('button', { name: /دورة شهرية/ }).click()
  await page.getByRole('button', { name: 'رسوم شهرية' }).click()

  const dialog = page.getByRole('dialog', { name: 'إنشاء الرسوم الشهرية' })
  await dialog.getByLabel('شهر الاستحقاق').fill('2026-11')
  await dialog.getByLabel('الجهة المستحقة').selectOption('shared')
  await dialog.getByLabel(/حصة الجهة الخارجية/).fill('50')
  await dialog.getByRole('button', { name: 'معاينة الطلاب والاستحقاقات' }).click()

  await expect(dialog.getByText('مشتركة', { exact: true })).toBeVisible()
  await expect(dialog.getByText('50', { exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: /تأكيد إنشاء 2 استحقاق/ }).click()
  await expect(page.getByText('تم إنشاء 2 استحقاق شهري')).toBeVisible()
});
