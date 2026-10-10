import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const base = process.env.SITE_URL || "http://localhost:3006";
mkdirSync("design-reference/result", { recursive: true });
try {
  await page.addInitScript(() => localStorage.setItem("manus-theme", "light"));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const route of [
      "/",
      "/cars",
      "/about",
      "/visit",
      "/contact",
    ]) {
      const response = await page.goto(base + route);
      expect(response.status()).toBe(200);
      await expect(page.locator("main h1")).toBeVisible();
      await page.waitForTimeout(250);
      await page
        .locator('img[loading="lazy"]')
        .evaluateAll((images) =>
          images.forEach((image) => (image.loading = "eager")),
        );
      await page.evaluate(() =>
        Promise.all(
          [...document.images].map((image) => image.decode().catch(() => {})),
        ),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `Overflow ${route} at ${width}`,
      ).toBeTruthy();
      await page.screenshot({
        path: `design-reference/result/redesign-${route === "/" ? "home" : route.slice(1)}-${width}.png`,
        fullPage: true,
      });
    }
  }
  await page.goto(base);
  const video = page.locator(".p-hero video");
  await expect
    .poll(() => video.evaluate((el) => el.currentTime), { timeout: 20000 })
    .toBeGreaterThan(0);
  expect(await page.locator(".p-video-control").count()).toBe(0);
  expect(await video.evaluate((el) => !el.paused)).toBeTruthy();
  await page.goto(base + "/contact");
  let submitted;
  await page.route("**/api/enquiries", async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ json: { reference: "UI-TEST" } });
  });
  await page
    .locator("main .p-contact-form")
    .getByLabel("Your name")
    .fill("Design Test");
  await page
    .locator("main .p-contact-form")
    .getByLabel("Phone number")
    .fill("9876543210");
  await page
    .locator("main .p-contact-form")
    .getByRole("button", { name: /Send.*enquiry/ })
    .click();
  await expect(page.getByRole("status")).toContainText("UI-TEST");
  expect(submitted.name).toBe("Design Test");
  await page.goto(base + '/cars');
  const detailHref = await page.locator('.stock-book').first().getAttribute('href');
  await page.locator('.save-car').first().click();
  await page.getByRole('button', { name: /Saved 1/ }).click();
  await expect(page.locator('.car-grid article')).toHaveCount(1);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto(base + detailHref);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.booking-panel')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
    await page.screenshot({ path: `design-reference/result/redesign-detail-dark-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base);
  expect(await page.locator("video").evaluate((el) => el.paused)).toBeTruthy();
  expect(errors).toEqual([]);
  console.log(
    "PASS: public pages at desktop/mobile, detail dark mode, saved cars, mobile menu, no overflow, video playback and pause, reduced motion, enquiry form (mock response).",
  );
} finally {
  await browser.close();
}
