import { chromium, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const base = process.env.SITE_URL || 'http://127.0.0.1:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw Error('Run against the local development database only.');
const email = `signup-check-${Date.now()}@example.com`;
const password = 'Browser-road-trip!2026';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/login?next=%2Fcars%3Fbody%3DSUV', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  const form = page.getByRole('form', { name: 'Create a customer account' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const overflow = await form.locator('input, button').evaluateAll(elements => elements.some(el => {
      const box = el.getBoundingClientRect();
      return box.x < 0 || box.right > innerWidth + 1;
    }));
    expect(overflow).toBe(false);
    if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(root, `.runtime/signup-${width}.png`), fullPage: true });
  }
  await form.getByLabel('Full name', { exact: true }).fill('Signup browser check');
  await form.getByLabel('Email address', { exact: true }).fill(email);
  await form.getByLabel('Password', { exact: true }).fill(password);
  await form.getByLabel('Confirm password', { exact: true }).fill('Mismatch-password!');
  await form.getByRole('button', { name: 'Create my account' }).click();
  await expect(page.locator('.ws-error')).toContainText('passwords do not match');
  await form.getByLabel('Confirm password', { exact: true }).fill(password);
  await form.getByRole('button', { name: 'Create my account' }).click();
  await expect(page).toHaveURL(base + '/cars?body=SUV');
  const session = await (await page.request.get(base + '/api/customer/session')).json();
  expect(session.account.role).toBe('customer');
  expect(session.account.email).toBe(email);
  expect([401, 403]).toContain((await page.request.get(base + '/api/workspace/overview/')).status());
  await page.goto(base + '/login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  const login = page.getByRole('form', { name: 'Sign in with password' });
  await login.getByLabel('Email or username', { exact: true }).fill(email.toUpperCase());
  await login.getByLabel('Password', { exact: true }).fill(password);
  await login.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(base + '/cars');
  expect((await (await page.request.get(base + '/api/customer/session')).json()).account.role).toBe('customer');
  expect(errors).toEqual([]);
  console.log('PASS: responsive sign-up, password mismatch, live registration, return URL, customer permissions, logout and email sign-in.');
} finally {
  await browser.close();
  execFileSync(path.join(root, '.runtime/python/python.exe'), [path.join(root, 'backend/manage.py'), 'shell', '-c',
    `from django.contrib.auth import get_user_model; get_user_model().objects.filter(email=${JSON.stringify(email)}, first_name='Signup browser check', is_staff=False, is_superuser=False).delete()`], { cwd: root, stdio: 'pipe' });
}
