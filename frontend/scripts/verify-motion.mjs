import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const url = process.env.SITE_URL || "http://127.0.0.1:3010";
try {
  for (const reducedMotion of ["no-preference", "reduce"]) {
    const page = await browser.newPage({ reducedMotion });
    await page.goto(url);
    await expect(page.locator(".hero-title h1")).toBeVisible();
    if (reducedMotion === "no-preference") {
      await expect(page.locator(".exchange-photo")).toHaveClass(
        /motion-pending/,
      );
      await page.locator(".exchange-photo").scrollIntoViewIfNeeded();
      await expect(page.locator(".exchange-photo")).toHaveClass(
        /motion-visible/,
      );
      await expect(page.locator(".exchange-photo")).toHaveCSS("opacity", "1");
    } else {
      await expect(page.locator(".motion-pending")).toHaveCount(0);
      await expect(page.locator(".hero-title h1")).toHaveCSS(
        "animation-name",
        "none",
      );
    }
    const trigger = page.getByRole("button", {
      name: "Tell us about your car",
    });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.getByRole("button", { name: "Close enquiry" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await trigger.click();
    await page.mouse.click(4, 4);
    await expect(page.getByRole("dialog")).toBeHidden();
    if (reducedMotion === "no-preference") {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(page.locator(".motion-pending")).toHaveCount(0);
    }
    await page.close();
  }
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto(url);
  assert.equal(await page.locator(".motion-pending").count(), 0);
  await expect(page.locator(".exchange-photo")).toHaveCSS("opacity", "1");
  console.log(
    "PASS: scroll reveals, reduced motion, live preference changes, popup dismissal, focus restoration, and readable content without JavaScript.",
  );
} finally {
  await browser.close();
}
