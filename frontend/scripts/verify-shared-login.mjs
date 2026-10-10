import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = process.env.SITE_URL || 'http://localhost:3006';
try {
  for (const role of ['admin', 'staff', 'customer']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    let signedIn = false;
    const account = { name: 'Test account', role, destination: role === 'customer' ? '/cars' : '/dashboard' };
    await page.route('**/api/customer/session', route => route.fulfill({ json: { account: null, user: signedIn && role === 'customer' ? { name: 'Test customer', email: 'test@example.com' } : null, csrf: 'ui-test', client_id: '' } }));
    await page.route('**/api/customer/password', async route => {
      expect(route.request().postDataJSON()).toEqual({ username: 'test-account', password: 'test-password' });
      expect(route.request().headers()['x-csrftoken']).toBe('ui-test');
      signedIn = true;
      await route.fulfill({ json: { account } });
    });
    await page.route('**/api/workspace/**', route => route.fulfill({ json: new URL(route.request().url()).pathname.endsWith('/session/') ? { user: signedIn ? { name: 'Test staff', username: 'test-account', is_admin: role === 'admin', permissions: [] } : null, csrf: 'ui-test' } : {} }));
    await page.goto(base + '/login?next=%2Fcars%2Fbmw%23test-drive');
    await page.getByLabel('Email or username', { exact: true }).fill('test-account');
    await page.locator('input[name="password"]').fill('test-password');
    await page.getByRole('form', { name: 'Sign in with password' }).getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(base + (role === 'customer' ? '/cars/bmw#test-drive' : '/dashboard'));
    if (role !== 'customer') await expect(page.locator('.ws-sidebar')).toBeVisible();
    await page.close();
  }
  console.log('PASS: shared login sends admin/staff to dashboard and customers back to their selected car. UI responses mocked; backend role checks covered by Django tests.');
} finally { await browser.close(); }
