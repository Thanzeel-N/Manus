import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = process.env.SITE_URL || 'http://localhost:3006';
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400 && new URL(response.url()).pathname.startsWith('/_next/')) errors.push(`Failed asset ${response.status()}`); });
try {
  for (const path of ['/', '/cars', '/about', '/exchange', '/visit', '/contact', '/dashboard', '/login']) {
    const response = await page.goto(base + path);
    expect(response.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  }
  await page.goto(base + '/cars');
  const detail = await page.locator('.stock-book').first().getAttribute('href');
  await page.goto(base + detail);
  await expect(page.getByRole('link', { name: 'Sign in to book' })).toBeVisible();
  await expect(page.locator('.booking-form')).toHaveCount(0);
  const response = await page.evaluate(async () => (await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status);
  expect(response).toBe(401);
  await page.getByRole('link', { name: 'Sign in to book' }).click();
  expect(new URL(page.url()).searchParams.get('next')).toBe(detail);
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeDisabled();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  }
  // UI-only successful-session and booking checks. Backend identity/CSRF tests use Django.
  await page.route('**/api/customer/session', route => route.fulfill({ json: { user: { name: 'Customer', email: 'customer@example.com' }, csrf: 'ui-csrf' } }));
  const starts = new Date(Date.now() + 86400000).toISOString();
  await page.route('**/slots/', route => route.fulfill({ json: [{ id: 999, starts_at: starts }] }));
  let payload;
  await page.route('**/api/bookings', async route => {
    expect(route.request().headers()['x-csrftoken']).toBe('ui-csrf');
    payload = route.request().postDataJSON();
    await route.fulfill({ json: { reference: 'TEST-UI', status: 'pending' } });
  });
  await page.goto(base + detail);
  const form = page.locator('.booking-form');
  await expect(form.getByLabel('Your name')).toHaveValue('Customer');
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date(starts));
  await form.getByLabel('Choose a date').fill(date);
  await form.getByRole('radio').first().check();
  await form.getByLabel('Phone number').fill('9876543210');
  await form.getByRole('button', { name: /Request test drive/ }).click();
  await expect(page.getByRole('status')).toContainText('TEST-UI');
  expect(payload).toEqual({ slot: 999, name: 'Customer', phone: '9876543210' });
  expect(errors).toEqual([]);
  console.log('PASS: all public pages and dashboard load without chunk errors; logged-out booking blocked; login return path; mobile layout; signed-in booking form with mocked session and booking.');
} finally { await browser.close(); }
