import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = process.env.SITE_URL || 'http://localhost:3011';
let owner = true;
let staffSave;
try {
  await page.route('**/api/workspace/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let json;
    if (path.endsWith('/session/')) json = { csrf: 'test', user: { id: 1, name: 'Owner', username: 'owner', is_admin: true, is_owner: owner, permissions: [], phone: '' } };
    else if (path.endsWith('/overview/')) json = {};
    else if (path.endsWith('/inventory/')) json = { results: [], page: 1, pages: 1, count: 0 };
    else if (path.endsWith('/staff/2/')) { staffSave = route.request().postDataJSON(); json = { id: 2, ...staffSave }; }
    else if (path.endsWith('/staff/')) json = [{ id: 2, username: 'sam', first_name: 'Sam', last_name: '', email: '', is_active: true, is_superuser: false, is_admin: false, access: [] }];
    else if (path.endsWith('/notifications/1/')) json = { id: 1, read_at: new Date().toISOString() };
    else if (path.endsWith('/notifications/')) json = { unread: 1, page: 1, pages: 1, sms_enabled: false, results: [{ id: 1, message: 'Sam updated car #1. Fields: price.', created_at: new Date().toISOString(), sms_status: 'no_phone' }] };
    else throw new Error(`Unexpected API request ${path}`);
    await route.fulfill({ json });
  });
  await page.goto(`${base}/dashboard?section=inventory`);
  await page.getByRole('button', { name: 'Add a car', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.ws-field', { has: page.locator('input[name="name"]') })).toContainText('Required');
  await expect(dialog.locator('.ws-field', { has: page.locator('input[name="price"]') })).toContainText('Required');
  await expect(dialog.locator('.ws-field', { has: page.locator('input[name="variant"]') })).toContainText('Optional');
  await expect(dialog.locator('input[name="variant"]')).not.toHaveAttribute('required');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  mkdirSync('../.runtime/owner-alerts', { recursive: true });
  await page.screenshot({ path: '../.runtime/owner-alerts/car-mobile.png' });
  await page.getByRole('button', { name: 'Close details' }).click();
  await page.goto(`${base}/dashboard?section=staff`);
  await page.getByRole('button', { name: 'Manage', exact: true }).click();
  await dialog.getByRole('checkbox', { name: 'Administrator: full showroom access and staff management' }).check();
  await dialog.locator('input[name="phone"]').fill('+919876543210');
  await dialog.getByRole('button', { name: 'Save staff member' }).click();
  await expect(page.getByRole('status')).toContainText('Staff account updated.');
  expect(staffSave.is_admin).toBe(true);
  expect(staffSave.phone).toBe('+919876543210');
  owner = false;
  await page.reload();
  await page.getByRole('button', { name: 'Manage', exact: true }).click();
  await expect(dialog.getByRole('checkbox', { name: 'Administrator: full showroom access and staff management' })).toHaveCount(0);
  await page.goto(`${base}/dashboard?section=notifications`);
  await expect(page.getByText('Sam updated car #1. Fields: price.')).toBeVisible();
  await expect(page.getByText('Phone delivery is not enabled.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Mark as read' }).click();
  await expect(page.getByText('0 unread')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../.runtime/owner-alerts/alerts-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
  console.log('PASS: required/optional fields, owner promotion, admin restrictions, alert read state, mobile layout.');
} finally {
  await browser.close();
}
