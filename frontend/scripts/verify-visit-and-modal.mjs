import { chromium, expect } from "@playwright/test";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (err) => errors.push(err.message));
const base = process.env.SITE_URL || "http://localhost:3000";

try {
  console.log("1. Visiting /visit on desktop (1440px)...");
  await page.goto(base + "/visit");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("main h1")).toContainText("Visit our showroom");

  // Check no overflow
  const noOverflowDesktop = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1
  );
  expect(noOverflowDesktop).toBeTruthy();

  console.log("2. Verifying Showroom Spaces and photos component...");
  await expect(page.locator(".p-showroom-spaces-widget")).toBeVisible();

  // Test interactive tab switching
  const tabs = page.locator(".p-space-tab");
  expect(await tabs.count()).toBe(5);

  // Click VIP Lounge tab
  await tabs.nth(1).click();
  await expect(page.locator(".p-active-space-content h3")).toContainText("VIP Client Lounge");

  // Click Diagnostics Studio tab
  await tabs.nth(3).click();
  await expect(page.locator(".p-active-space-content h3")).toContainText("150-Point Diagnostics Studio");

  // Click Delivery Suite tab
  await tabs.nth(4).click();
  await expect(page.locator(".p-active-space-content h3")).toContainText("Ceremonial Delivery Suite");

  console.log("3. Testing Contact Pop-up Modal from Visit Intro button...");
  const heroBtn = page.locator(".p-visit-intro-actions button, .p-visit-hero-actions button", { hasText: "Plan your showroom visit" });
  await heroBtn.click();

  const dialog = page.locator("dialog.p-contact-modal-dialog");
  await expect(dialog).toBeVisible();

  // Mock enquiries API for submission test
  let submittedPayload = null;
  await page.route("**/api/enquiries", async (route) => {
    submittedPayload = route.request().postDataJSON();
    await route.fulfill({ json: { reference: "CONCIERGE-7788", status: "new" } });
  });

  // Test interest dropdown
  await dialog.locator('select[name="interest"]').selectOption("Book a test drive");
  await expect(dialog.locator('select[name="interest"]')).toHaveValue("Book a test drive");

  // Fill modal form
  await dialog.locator('input[name="name"]').fill("Vikram Malhotra");
  await dialog.locator('input[name="phone"]').fill("+919876543210");
  await dialog.locator('input[name="email"]').fill("vikram@example.com");
  await dialog.locator('textarea[name="message"]').fill("Interested in viewing the BMW and Audi models.");

  // Submit modal form
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog.locator(".p-form-feedback")).toContainText("CONCIERGE-7788");
  expect(submittedPayload.name).toBe("Vikram Malhotra");
  expect(submittedPayload.interest).toBe("Book a test drive");

  console.log("4. Testing modal dismissal via close button...");
  await dialog.locator("button.p-modal-close").click();
  await expect(dialog).toBeHidden();

  console.log("5. Testing modal trigger from Footer link...");
  const footerLink = page.locator(".p-footer a", { hasText: "Speak to our team" });
  await footerLink.click();
  await expect(dialog).toBeVisible();

  console.log("6. Testing modal dismissal via Escape key...");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  console.log("7. Verifying Header does NOT contain 'Book Visit' or 'Sell & exchange'...");
  await page.goto(base + "/visit");
  const headerText = await page.locator(".p-header").innerText();
  expect(headerText).not.toContain("Book Visit");
  expect(headerText).not.toContain("Sell & exchange");
  expect(headerText).not.toContain("Sell");

  console.log("8. Testing Visit Page Contact Section & Pop-up Trigger...");
  // Verify on-page contact form exists and has exact design
  await expect(page.locator(".p-contact-grid .p-contact-form")).toBeVisible();
  await expect(page.locator(".p-contact-grid .p-contact-form .p-form-heading h2")).toContainText("Send us a message");

  // Test Pop-up Trigger Card Button on /visit
  const popupBtn = page.locator(".p-popup-trigger-card button", { hasText: "Open Appointment Pop-up" });
  await popupBtn.scrollIntoViewIfNeeded();
  await popupBtn.click();
  await expect(dialog).toBeVisible();
  // Verify modal form has exact same design
  await expect(dialog.locator(".p-contact-form")).toBeVisible();
  await expect(dialog.locator(".p-contact-form .p-form-heading h2")).toContainText("Schedule a showroom appointment");
  await expect(dialog.locator('select[name="interest"]')).toHaveValue("Visiting the showroom");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  console.log("9. Testing mobile viewport (390px)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/visit");
  await expect(page.locator("main h1")).toBeVisible();

  const noOverflowMobile = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1
  );
  expect(noOverflowMobile).toBeTruthy();

  // Click modal trigger on mobile from intro
  await page.locator(".p-visit-intro-actions button, .p-visit-hero-actions button", { hasText: "Plan your showroom visit" }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  console.log("10. Testing dedicated /contact route...");
  await page.goto(base + "/contact");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator(".p-channels-grid")).toBeVisible();

  expect(errors).toEqual([]);
  console.log("✅ ALL CHECKS PASSED: Redesigned Showroom Visit page, spaces explorer, modal triggers, submission, dismissal, responsive design, and /contact page!");
} finally {
  await browser.close();
}
