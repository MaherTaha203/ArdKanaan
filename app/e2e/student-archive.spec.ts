import { expect, test } from '@playwright/test'

import { login } from './support/actions'
import { installSupabaseMocks } from './support/mock-supabase'

// ADR-0076: archived students leave the active roster but keep their financial
// data. These browser tests cover the read-side filtering and the archive action.

async function openStudents(page: import('@playwright/test').Page, view: string): Promise<void> {
  await page.getByRole('button', { name: 'الطلاب', exact: true }).click()
  await page.getByRole('menuitemradio', { name: view }).click()
}

test('archived students are excluded from the directory and listed in the archive view', async ({ page }) => {
  await installSupabaseMocks(page, {
    students: [
      { id: 'a-1', name: 'سارة النشطة', id_number: null, phone: null, notes: null, status: 'active' },
      { id: 'z-1', name: 'خالد المؤرشف', id_number: null, phone: null, notes: null, status: 'archived', archived_at: '2026-02-01T00:00:00Z', archive_reason: 'انتهت علاقته بالمركز' },
    ],
  })

  await login(page)

  // Active roster (دليل الطلاب) shows the active student, not the archived one.
  await openStudents(page, 'دليل الطلاب')
  await expect(page.getByRole('button', { name: /سارة النشطة/ })).toBeVisible()
  await expect(page.getByText('خالد المؤرشف')).toHaveCount(0)

  // Archive view (المؤرشفون) lists the archived student. Each sub-view is now its own
  // tab, so the directory tab stays mounted alongside — scope the archive assertions to
  // the active archive panel rather than the whole page.
  await openStudents(page, 'المؤرشفون')
  const archivePanel = page.getByRole('tabpanel', { name: 'الطلاب المؤرشفون' })
  await expect(archivePanel.getByRole('heading', { name: 'الطلاب المؤرشفون' })).toBeVisible()
  await expect(archivePanel.getByText('خالد المؤرشف')).toBeVisible()
  await expect(archivePanel.getByText('سارة النشطة')).toHaveCount(0)
})

test('archiving an eligible student moves them out of the roster into the archive view', async ({ page }) => {
  await installSupabaseMocks(page, {
    // No enrollment on an active course → eligible for archiving.
    students: [{ id: 'a-1', name: 'سارة النشطة', id_number: null, phone: null, notes: null, status: 'active' }],
  })

  await login(page)
  await openStudents(page, 'دليل الطلاب')

  // Select the student to open the side preview, then archive from there.
  await page.getByRole('button', { name: /سارة النشطة/ }).click()
  await page.getByRole('button', { name: 'أرشفة', exact: true }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /أرشفة الطالب/ }).click()

  // Confirmed, and the student leaves the active roster.
  await expect(page.getByText('تمت أرشفة الطالب')).toBeVisible()
  await expect(page.getByText('سارة النشطة')).toHaveCount(0)

  // She now appears in the archive view.
  await openStudents(page, 'المؤرشفون')
  await expect(page.getByText('سارة النشطة')).toBeVisible()
})
