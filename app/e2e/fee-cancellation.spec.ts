import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// BC-005: an erroneous fee (e.g. a subscription entered twice) is corrected by
// cancellation — never deletion — with a mandatory reason. This covers the owner
// cancelling one standalone fee obligation from the statement's الالتزامات tab,
// after which it drops out of the running obligations WHILE the student's other
// obligations remain (guarding against a statement-refresh blank-out).

async function openStatement(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'كشف الحساب' }).click()
}

function fee(id: string, description: string, amount: number) {
  return {
    id,
    student_id: 's-1',
    course_id: null,
    enrollment_id: null,
    course_name: '',
    description,
    notes: null,
    amount,
    fee_category: 'institute' as const,
    external_share: 0,
    cancelled_at: null,
    cancel_reason: null,
    created_at: '2026-10-01T00:00:00.000Z',
  }
}

test('owner cancels one duplicated fee with a reason while other obligations remain', async ({ page }) => {
  await installSupabaseMocks(page, {
    students: [{ id: 's-1', name: 'أحمد المستقل', id_number: null, phone: null, notes: null, status: 'active' }],
    // The subscription was entered twice; a separate exam fee must survive the cancel.
    feeObligations: [fee('fee-1', 'الاشتراك الشهري', 150), fee('fee-2', 'رسوم امتحان', 100)],
  })

  await login(page)
  await openStatement(page)

  await page.getByRole('tab', { name: /الالتزامات/ }).click()
  await expect(page.getByText('الاشتراك الشهري', { exact: true })).toBeVisible()
  await expect(page.getByText('رسوم امتحان', { exact: true })).toBeVisible()

  // Cancel the duplicated subscription specifically (scope the action to its row).
  await page.getByRole('row', { name: /الاشتراك الشهري/ }).getByRole('button', { name: 'إلغاء', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  // A reason is mandatory — confirm stays disabled until one is typed.
  const confirm = dialog.getByRole('button', { name: 'تأكيد إلغاء الرسم', exact: true })
  await expect(confirm).toBeDisabled()
  await dialog.getByPlaceholder('مثال: أُدخل الاشتراك مرّتين بالخطأ').fill('أُدخل الاشتراك مرّتين بالخطأ')
  await confirm.click()

  await expect(dialog).toBeHidden()

  // The cancelled obligation drops out (cancel-not-delete), and — critically — the
  // other obligation is STILL visible, proving the statement was not blanked.
  await expect(page.getByText('الاشتراك الشهري', { exact: true })).toHaveCount(0)
  await expect(page.getByText('رسوم امتحان', { exact: true })).toBeVisible()
})
