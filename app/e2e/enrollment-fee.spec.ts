import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// Legacy total-registration fee editing was removed. Keep a browser regression
// test to ensure the old action does not return to the course roster.
test('legacy enrollment registration-fee adjustment is not available', async ({ page }) => {
  const course = {
    id: 'c-1',
    name: 'دورة الإدارة',
    base_fee: null,
    monthly_fee: 250,
    start_date: '2026-09-01',
    end_date: '2026-10-01',
    status: 'active' as const,
    notes: null,
  }
  const student = {
    id: 's-1',
    name: 'سارة أحمد',
    id_number: null,
    phone: null,
    notes: null,
    status: 'active' as const,
  }
  const enrollment = {
    id: 'e-1',
    student_id: 's-1',
    course_id: 'c-1',
    course_name: 'دورة الإدارة',
    course_value: 300,
  }

  await installSupabaseMocks(page, {
    courses: [course],
    students: [student],
    enrollments: [enrollment],
  })

  await login(page)
  await page.getByRole('button', { name: 'الدورات', exact: true }).first().click()
  await page.getByRole('button', { name: /دورة الإدارة/ }).click()

  const row = page.getByRole('row', { name: /سارة أحمد/ })
  await expect(row).toBeVisible()
  await expect(row.getByRole('button', { name: 'تعديل الرسوم التاريخية' })).toHaveCount(0)
  await expect(page.getByText(/قيمة التسجيل الإجمالية القديمة/)).toHaveCount(0)
})
