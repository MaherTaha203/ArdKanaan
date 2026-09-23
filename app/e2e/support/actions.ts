import { expect, type Page } from '@playwright/test'

// Signs in through the real opening gate. Auth is mocked, so any credentials pass;
// success is confirmed by the shell chrome (the sign-out button) appearing.
export async function login(page: Page): Promise<void> {
  await page.goto('/')
  await page.getByPlaceholder('name@example.com').fill('owner@example.com')
  await page.locator('input[type="password"]').fill('secret123')
  await page.getByRole('button', { name: 'دخول' }).click()
  await expect(page.getByRole('button', { name: 'النظام', exact: true })).toBeVisible()
}

// Opens the financial reports page (vouchers are created from its header now).
export async function gotoReports(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'التقارير المالية', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'كشف الحساب العام' }).click()
  await expect(page.getByRole('heading', { name: 'كشف الحساب العام' })).toBeVisible()
}

// Opens the receipt (سند قبض) sheet from the reports header and waits for the dialog.
export async function openReceiptSheet(page: Page): Promise<void> {
  await gotoReports(page)
  await page.getByRole('button', { name: 'سند قبض', exact: true }).first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

// Opens the payment (سند صرف) sheet from the reports header and waits for the dialog.
export async function openPaymentSheet(page: Page): Promise<void> {
  await gotoReports(page)
  await page.getByRole('button', { name: 'سند صرف', exact: true }).first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
}
