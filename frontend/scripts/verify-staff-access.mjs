// UI contract test; server-side enforcement is covered by test_workspace.py.
import { chromium, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const base = process.env.SITE_URL || 'http://localhost:3006';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const staff = { id: 2, username: 'vehicle-staff', first_name: 'Sam', last_name: 'Wilson', email: 'sam@example.com', is_active: true, is_superuser: false, access: ['inventory.view', 'inventory.edit'] };
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.route('**/api/workspace/**', async route => {
    const url = new URL(route.request().url());
    let json;
    if (url.pathname.endsWith('/session/')) json = { csrf: 'ui-test', user: { id: 1, name: 'Owner', username: 'owner', is_admin: true, permissions: [] } };
    else if (url.pathname.endsWith('/overview/')) json = {};
    else if (url.pathname.endsWith('/staff/2/')) { const payload = route.request().postDataJSON(); expect([...payload.access].sort()).toEqual(['enquiries.edit', 'enquiries.view']); Object.assign(staff, payload); json = staff; }
    else if (url.pathname.endsWith('/staff/')) json = [staff];
    else throw new Error(`Unexpected API call: ${url.pathname}`);
    await route.fulfill({ json });
  });
  await page.goto(`${base}/dashboard?section=staff`);
  await page.getByRole('button', { name: 'Manage', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('checkbox', { name: 'Vehicles: edit' })).toBeChecked();
  await dialog.getByRole('button', { name: 'No access', exact: true }).click();
  await dialog.getByRole('checkbox', { name: 'Contact enquiries: edit' }).check();
  await expect(dialog.getByRole('checkbox', { name: 'Contact enquiries: view' })).toBeChecked();
  await expect(dialog.getByRole('checkbox', { name: 'Vehicles: view' })).not.toBeChecked();
  await dialog.getByRole('button', { name: 'Save staff member', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Staff account updated.');
  await page.getByRole('button', { name: 'Manage', exact: true }).click();
  await expect(dialog.getByRole('checkbox', { name: 'Contact enquiries: edit' })).toBeChecked();
  await expect(dialog.getByRole('checkbox', { name: 'Vehicles: edit' })).not.toBeChecked();
  await dialog.getByRole('checkbox', { name: 'Availability: add' }).check();
  await expect(dialog.getByRole('checkbox', { name: 'Vehicles: view' })).toBeChecked();
  await expect(dialog.getByRole('checkbox', { name: 'Availability: view' })).toBeChecked();
  await dialog.getByRole('checkbox', { name: 'Vehicles: view' }).uncheck();
  await expect(dialog.getByRole('checkbox', { name: 'Availability: add' })).not.toBeChecked();
  await page.setViewportSize({ width: 390, height: 844 });
  await dialog.locator('.ws-permissions').scrollIntoViewIfNeeded();
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  mkdirSync('design-reference/result', { recursive: true });
  await page.screenshot({ path: 'design-reference/result/staff-permissions-mobile.png' });
  expect(errors).toEqual([]);
  console.log('PASS: permission checkboxes, automatic view dependencies, saved access, mobile layout.');
} finally { await browser.close(); }
