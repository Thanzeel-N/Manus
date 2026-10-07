import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const base = process.env.SITE_URL || "http://localhost:3003";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto(base);
  await expect(page.locator(".car-card")).toHaveCount(0);
  await page.getByRole('link', {name:'Our cars', exact:true}).first().click();
  await expect(page).toHaveURL(`${base}/cars`);
  await expect(page.locator(".car-card")).toHaveCount(3);
  await page.getByLabel("Search our cars").fill("bmw");
  await expect(page.locator(".car-card")).toHaveCount(1);
  assert.match(page.url(), /q=bmw/);
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.getByLabel("Fuel", { exact: true }).selectOption("Petrol");
  await expect(page.locator(".car-card")).toHaveCount(1);
  await expect(page.locator(".car-card h3")).toHaveText("Audi Q5");
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page
    .getByRole("button", { name: "Save BMW 3 Series", exact: true })
    .click();
  await page.getByRole("button", { name: "Saved 1", exact: true }).click();
  await expect(page.locator(".car-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.locator("#inventory").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "design-reference/result/commerce-inventory.png",
  });
  await page
    .getByRole("link", { name: "Details for BMW 3 Series", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "BMW 3 Series", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".gallery-main img")
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
  const date = page.getByLabel("Choose a date");
  await expect(date).toBeVisible();
  await date.fill(await date.getAttribute("min"));
  await page.getByRole("radio").first().check();
  await page.getByLabel("Your name").fill("Browser QA");
  await page
    .getByLabel("Email", { exact: true })
    .fill(`browser-qa-${Date.now()}@example.com`);
  await page.getByLabel("Phone number").fill("9876543210");
  const submit = page.getByRole('button', {name:'Verify email & request test drive'});
  await expect(submit).toBeDisabled();
  await page.getByRole('button', {name:'Send verification code', exact:true}).click();
  await expect(page.getByLabel('Verification code', {exact:true})).toBeVisible();
  const email = await page.getByLabel('Email', {exact:true}).inputValue();
  const messages = await Promise.all((await fs.readdir('.runtime/mail')).map(file => fs.readFile(`.runtime/mail/${file}`, 'utf8')));
  const message = messages.find(value => value.includes(`To: ${email}`));
  assert.ok(message, 'Local test email delivered');
  const code = message.match(/code is (\d{6})/)[1];
  await page.getByLabel('Verification code', {exact:true}).fill(code);
  await page.screenshot({
    path: "design-reference/result/commerce-detail.png",
  });
  await submit.click();
  await expect(
    page.getByText("Request received.", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/cars/audi`);
  await expect(page.getByLabel("Choose a date")).toBeVisible();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: "design-reference/result/commerce-mobile.png",
    fullPage: true,
  });
  await page.goto(`${base}/cars`);
  await expect(page.getByLabel("Search our cars")).toBeVisible();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: search, URL filters, fuel filter, saved cars, details, calendar, persisted booking, mobile layout, no browser errors.",
  );
} finally {
  await browser.close();
}
