import { chromium, expect } from "@playwright/test";
import { strict as assert } from "node:assert";
import fs from "node:fs/promises";

await fs.mkdir("design-reference/result", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
let page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(process.env.SITE_URL || "http://127.0.0.1:3002", {
  waitUntil: "networkidle",
});
const hero = page.locator(".hero-photo img");
assert.equal(await hero.getAttribute("loading"), "eager");
assert.equal(await hero.getAttribute("fetchpriority"), "high");
assert.match(await hero.getAttribute("srcset"), /480w/);
const sectionImages = await page
  .locator(
    ".hero-photo img, .experience-image img, .interior > img, .exchange-photo img",
  )
  .evaluateAll((images) => images.map((image) => image.getAttribute("src")));
assert.equal(new Set(sectionImages).size, 4);
const imageResponse = await page.request.get(
  new URL(await hero.getAttribute("src"), page.url()).href,
);
assert.equal(imageResponse.status(), 200);
assert.match(imageResponse.headers()["cache-control"], /immutable/);
await page.screenshot({ path: "design-reference/result/desktop.png" });
assert.equal(
  await page.locator("h1").textContent(),
  "Your next car.One trusted destination.",
);
assert.equal(await page.locator(".car-card").count(), 3);
await page.getByRole("button", { name: "SUVs", exact: true }).click();
assert.equal(await page.locator(".car-card").count(), 1);
await page.getByRole("button", { name: "Save Audi Q5", exact: true }).click();
await page.getByRole("button", { name: "Saved 1", exact: true }).click();
assert.equal(await page.locator(".car-card").count(), 1);
await page.getByRole("button", { name: "Reset filters" }).click();
await page.getByLabel("Budget", { exact: true }).selectOption("30");
assert.match(
  await page.locator(".car-card").textContent(),
  /Mercedes-Benz C-Class/,
);
await page.getByRole("button", { name: "Reset filters" }).click();
await page.getByRole("button", { name: "Enquire about BMW 3 Series" }).click();
assert.equal(await page.getByRole("dialog").isVisible(), true);
assert.equal(
  await page.getByLabel("Interested in").inputValue(),
  "BMW 3 Series",
);
await page.getByLabel("Your name").fill("Website test");
await page.getByLabel("Phone number").fill("9876543210");
await page.getByLabel("Preferred visit or callback date").fill("2027-01-20");
const download = page.waitForEvent("download");
await page.getByRole("button", { name: "Download my enquiry" }).click();
assert.equal(
  (await download).suggestedFilename(),
  "manus-car-world-enquiry.txt",
);
await page.keyboard.press("Escape");
await page.getByRole("dialog").waitFor({ state: "hidden" });
assert.equal(await page.getByRole("dialog").isVisible(), false);
await page
  .getByRole("button", { name: "Show People to help you choose." })
  .click();
assert.equal(
  await page
    .getByRole("heading", { name: "People to help you choose." })
    .isVisible(),
  true,
);
await page
  .getByRole("button", { name: "Show More choice, under one roof." })
  .click();
await page.locator("#about").scrollIntoViewIfNeeded();
await page.screenshot({ path: "design-reference/result/experience.png" });
await page.locator("#inventory").scrollIntoViewIfNeeded();
await page.screenshot({ path: "design-reference/result/inventory.png" });
await page
  .getByRole("button", { name: "Plan a showroom visit", exact: false })
  .click();
await expect(page.getByLabel("Interested in")).toHaveValue(
  "Visiting the showroom",
);
await page.keyboard.press("Escape");
await page.getByRole("dialog").waitFor({ state: "hidden" });
await page
  .getByRole("button", { name: "Tell us about your car", exact: false })
  .click();
await expect(page.getByLabel("Interested in")).toHaveValue(
  "Selling or exchanging my car",
);
await page.keyboard.press("Escape");
await page.getByRole("dialog").waitFor({ state: "hidden" });
await page.locator("#visit").scrollIntoViewIfNeeded();
await page.screenshot({ path: "design-reference/result/showroom-visit.png" });
await page.locator("#exchange").scrollIntoViewIfNeeded();
await page.locator("#exchange img").evaluate((image) => image.decode());
await page.screenshot({ path: "design-reference/result/exchange.png" });
assert.equal(await page.locator('img[src*="showcase-"]').count(), 0);
const siteUrl = page.url();
await page.close();
page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(siteUrl, { waitUntil: "networkidle" });
const mobileHero = await page.locator(".hero-photo img").evaluate((image) => ({
  src: image.currentSrc,
  loaded: image.complete && image.naturalWidth > 0,
}));
assert.equal(mobileHero.loaded, true);
assert.match(mobileHero.src, /hero-480-/);
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: "design-reference/result/mobile.png" });
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  true,
);
await page.getByRole("button", { name: "Open navigation" }).click();
await page
  .getByRole("navigation")
  .getByRole("link", { name: "Our cars" })
  .click();
assert.equal(
  await page
    .getByRole("button", { name: "Open navigation" })
    .getAttribute("aria-expanded"),
  "false",
);
await page
  .locator("summary")
  .filter({ hasText: "Can I book a test drive?" })
  .click();
assert.equal(await page.locator("details[open]").count(), 1);
assert.deepEqual(errors, []);
console.log(
  "PASS: desktop and mobile, filters, saved cars, enquiry download, dialog, carousel, navigation, FAQ, no overflow or runtime errors.",
);
await browser.close();
