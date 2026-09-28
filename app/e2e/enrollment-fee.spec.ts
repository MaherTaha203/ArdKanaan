import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// ADR-0078: the owner adjusts the total registration fee (course_value) for one
// enrollment. Historical receipts/allocations/ledger are never touched; the new
// fee may never fall below what has already been collected. These browser tests
// cover the owner-facing edit flow and the client-side guards.

const COURSE = { id: 'c-1', name: 'دورة الإدارة', base_fee: 300, start_date: '2026-09-01', end_date: '2026-10-01', status: 'active' as const, notes: null }
const STUDENT = { id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null, status: 'active' as const }
const ENROLLMENT = { id: 'e-1', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الإدارة', course_value: 300 }

async function openCourseDetail(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'الدورات', exact: true }).first().click()
  await page.getByRole('button', { name: /دورة الإدارة/ }).click()
}

test('owner edits an enrollment fee and the roster reflects the new total', async ({ page }) => {
  await installSupabaseMocks(page, { courses: [COURSE], students: [STUDENT], enrollments: [{ ...ENROLLMENT }] })

  await login(page)
  await openCourseDetail(page)

  // The roster row starts at the base fee.
  const row = page.getByRole('row', { name: /سارة أحمد/ })
  await expect(row).toContainText('300')

  await row.getByRole('button', { name: 'تعديل الرسوم' }).click()

  const dialog = page.getByRole('dialog', { name: 'تعديل رسوم التسجيل' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('السعر الأساسي للدورة', { exact: true })).toBeVisible()
  await expect(dialog.getByText('المحصّل', { exact: true })).toBeVisible()

  await dialog.getByLabel('الرسوم الجديدة').fill('250')
  await dialog.getByLabel('سبب التعديل').fill('تصحيح رسوم التسجيل')
  await expect(dialog.getByText('مراجعة:')).toBeVisible()

  await dialog.getByRole('button', { name: /تأكيد تعديل الرسوم/ }).click()

  await expect(page.getByText('تم تعديل رسوم التسجيل')).toBeVisible()
  await expect(dialog).toHaveCount(0)

  // Roster now shows the adjusted fee (250) and the new remaining (250, paid 0).
  const updatedRow = page.getByRole('row', { name: /سارة أحمد/ })
  await expect(updatedRow).toContainText('250')
})

test('the confirm action stays disabled until a valid amount and reason are entered', async ({ page }) => {
  await installSupabaseMocks(page, { courses: [COURSE], students: [STUDENT], enrollments: [{ ...ENROLLMENT }] })

  await login(page)
  await openCourseDetail(page)
  await page.getByRole('row', { name: /سارة أحمد/ }).getByRole('button', { name: 'تعديل الرسوم' }).click()

  const dialog = page.getByRole('dialog', { name: 'تعديل رسوم التسجيل' })
  const confirm = dialog.getByRole('button', { name: /تأكيد تعديل الرسوم/ })

  // No input yet → disabled.
  await expect(confirm).toBeDisabled()

  // Amount without a reason → still disabled.
  await dialog.getByLabel('الرسوم الجديدة').fill('250')
  await expect(confirm).toBeDisabled()

  // A fractional amount is rejected client-side even with a reason.
  await dialog.getByLabel('سبب التعديل').fill('سبب')
  await dialog.getByLabel('الرسوم الجديدة').fill('250.5')
  await expect(confirm).toBeDisabled()

  // Whole amount + reason → enabled.
  await dialog.getByLabel('الرسوم الجديدة').fill('250')
  await expect(confirm).toBeEnabled()
})
