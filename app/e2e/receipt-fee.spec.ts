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
      { id: '11111111-1111-4111-8111-111111111111', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الإدارة', course_value: 300 },
      { id: '33333333-3333-4333-8333-333333333333', student_id: 's-2', course_id: 'c-1', course_name: 'دورة الإدارة', course_value: 300 },
    ],
  })

  await login(page)
  await page.getByRole('button', { name: 'الدورات', exact: true }).first().click()
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
  expect(handle.feeObligationInserts[0][0][0]).toMatchObject({ student_id: 's-1', course_id: 'c-1', description: 'رسوم تخريج', amount: 50, fee_category: 'external', external_share: 50 })
  expect(handle.receiptInserts.length).toBe(0)
  expect(handle.paymentInserts.length).toBe(0)
})

test('one receipt can cover course dues and multiple fee obligations', async ({ page }) => {
  const consoleErrors: string[] = []
  const requests: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('request', (request) => { if (request.url().includes('/rest/v1/')) requests.push(`${request.method()} ${request.url()}`) })

  const handle = await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'سارة أحمد', id_number: null, phone: null, notes: null }],
    enrollments: [{ id: '11111111-1111-4111-8111-111111111111', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الإدارة', course_value: 300 }],
    feeObligations: [
      { id: '22222222-2222-4222-8222-222222222222', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الإدارة', description: 'رسوم تخريج', amount: 50, fee_category: 'external', external_share: 50, cancelled_at: null, cancel_reason: null, created_at: '2026-09-15T08:00:00Z' },
      { id: '44444444-4444-4444-8444-444444444444', student_id: 's-1', course_id: 'c-1', course_name: 'دورة الإدارة', description: 'رسوم شهادة', amount: 20, fee_category: 'institute', external_share: 0, cancelled_at: null, cancel_reason: null, created_at: '2026-09-15T08:05:00Z' },
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

  await expect(dialog.getByText('إجمالي البنود').last()).toBeVisible()
  await expect(dialog.getByText('370').last()).toBeVisible()
  await expect(dialog.getByLabel('المبلغ المقبوض')).toHaveValue('370')
  await dialog.getByRole('button', { name: 'حفظ سند القبض' }).click()

  await expect.poll(
    () => handle.receiptInserts.length,
    { timeout: 5000, message: `receipt count=0; console=${consoleErrors.join(' | ')}; requests=${requests.join(' | ')}; invalid=${await dialog.locator('[aria-invalid="true"]').evaluateAll((nodes) => nodes.map((node) => ({ name: node.getAttribute('name'), ariaLabel: node.getAttribute('aria-label'), value: (node as HTMLInputElement).value, describedBy: node.getAttribute('aria-describedby') })))}` },
  ).toBe(1)
  expect(handle.receiptAllocations).toHaveLength(3)
  expect(handle.receiptAllocations).toEqual(expect.arrayContaining([
    expect.objectContaining({ allocation_type: 'course', amount: 300 }),
    expect.objectContaining({ allocation_type: 'fee', amount: 50 }),
    expect.objectContaining({ allocation_type: 'fee', amount: 20 }),
  ]))
  expect(handle.paymentInserts).toHaveLength(0)
  expect(handle.receiptInserts[0]).toMatchObject({ amount_received: 370, allocation_mode: true })
  await expect(dialog.getByText('تم حفظ السند')).toBeVisible()
})
