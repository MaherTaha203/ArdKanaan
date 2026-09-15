import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

test('course page can assign a fee obligation to selected students', async ({ page }) => {
  const handle = await installSupabaseMocks(page, {
    students: [
      { id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null },
      { id: 's-2', name: 'محمد علي', id_number: null, phone: null, notes: null },
    ],
    courses: [{ id: 'c-1', name: 'دورة الإدارة', base_fee: 300, start_date: '2026-09-01', end_date: '2026-10-01', status: 'active', notes: null }],
    enrollments: [
      { id: 'e-1', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الإدارة', course_value: 300 },
      { id: 'e-2', student_id: 's-2', course_id: 'c-1', course_name: 'دورة الإدارة', course_value: 300 },
    ],
  })

  await login(page)
  await page.getByRole('button', { name: 'الدورات', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'الدورات', exact: true })).toBeVisible()
  await page.getByRole('button', { name: /دورة الإدارة/ }).click()
  await page.getByRole('button', { name: 'إضافة رسوم' }).click()
  const sheet = page.getByRole('dialog', { name: /إضافة رسوم/ })
  await expect(sheet).toBeVisible()
  await sheet.getByLabel('وصف الرسم').fill('رسوم تخريج')
  await sheet.getByLabel('قيمة الرسم للطالب').fill('50')
  await sheet.getByRole('button', { name: 'لجهة خارجية' }).click()
  await sheet.getByRole('button', { name: 'سارة أحمد' }).click()
  await sheet.getByRole('button', { name: /إضافة الرسم إلى 1 طالب/ }).click()

  await expect.poll(() => handle.feeObligationInserts.length).toBe(1)
  expect(handle.feeObligationInserts[0]).toMatchObject({ student_id: 's-1', course_id: 'c-1', description: 'رسوم تخريج', amount: 50, fee_category: 'external', external_share: 50 })
  expect(handle.receiptInserts.length).toBe(0)
  expect(handle.paymentInserts.length).toBe(0)
})

test('one receipt can cover course dues and multiple fee obligations', async ({ page }) => {
  const handle = await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null }],
    enrollments: [{ id: 'e-1', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الإدارة', course_value: 300 }],
    feeObligations: [
      { id: 'f-1', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الإدارة', description: 'رسوم تخريج', amount: 50, fee_category: 'external', external_share: 50, cancelled_at: null, cancel_reason: null, created_at: '2026-09-15T08:00:00Z' },
      { id: 'f-2', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الإدارة', description: 'رسوم شهادة', amount: 20, fee_category: 'institute', external_share: 0, cancelled_at: null, cancel_reason: null, created_at: '2026-09-15T08:05:00Z' },
    ],
  })

  await login(page)
  await page.getByRole('button', { name: 'سند قبض', exact: true }).first().click()
  const dialog = page.getByRole('dialog', { name: 'سند قبض' })
  await dialog.getByRole('combobox', { name: 'اسم الطالب' }).fill('سارة')
  await page.getByRole('option', { name: /سارة أحمد/ }).click()

  await dialog.getByRole('button', { name: /دورة الإدارة/ }).click()
  await dialog.getByRole('button', { name: /رسوم تخريج/ }).click()
  await dialog.getByRole('button', { name: /رسوم شهادة/ }).click()

  await expect(dialog.getByText('إجمالي البنود: 370')).toBeVisible()
  await dialog.getByRole('button', { name: 'حفظ سند القبض' }).click()

  await expect.poll(() => handle.receiptInserts.length).toBe(1)
  expect(handle.receiptAllocations).toHaveLength(3)
  expect(handle.paymentInserts).toHaveLength(0)
  expect(handle.receiptInserts[0]).toMatchObject({ amount_received: 370, allocation_mode: true })
  await expect(dialog.getByText('تم حفظ السند')).toBeVisible()
})
