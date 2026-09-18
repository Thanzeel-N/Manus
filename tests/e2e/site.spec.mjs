import { test, expect } from "@playwright/test";

test("production responses and discoverability", async ({ page, request }) => {
  const response = await page.goto("/");
  expect(response.status()).toBe(200);
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  const health = await request.get("/api/health");
  expect(await health.json()).toEqual({ status: "ok" });
  expect(health.headers()["cache-control"]).toBe("no-store");
  const hero = page.locator(".hero-photo img");
  await expect(hero).toHaveAttribute("loading", "eager");
  const image = await request.get(await hero.getAttribute("src"));
  expect(image.ok()).toBeTruthy();
  expect(image.headers()["cache-control"]).toContain("immutable");
  if (process.env.ALLOW_INDEXING !== "true") {
    expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    expect(await (await request.get("/robots.txt")).text()).toContain(
      "Disallow: /",
    );
  } else {
    expect(response.headers()["x-robots-tag"]).toBeUndefined();
    expect(response.headers()["strict-transport-security"]).toContain(
      "max-age=",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new URL(process.env.SITE_URL).origin,
    );
    expect(await (await request.get("/sitemap.xml")).text()).toContain(
      process.env.SITE_URL,
    );
  }
  expect((await request.get("/does-not-exist")).status()).toBe(404);
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: "Your privacy" }),
  ).toBeVisible();
});

test("filters, persistent favourites, empty results, and blocked storage", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".car-card")).toHaveCount(3);
  await page.getByRole("button", { name: "SUVs", exact: true }).click();
  await expect(page.locator(".car-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Save Audi Q5", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Saved 1", exact: true }).click();
  await expect(page.locator(".car-card")).toHaveCount(1);
  await page.getByLabel("Budget", { exact: true }).selectOption("30");
  await expect(page.getByText("No cars in this selection.")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.getByLabel("Budget", { exact: true }).selectOption("30");
  await expect(page.locator(".car-card")).toHaveCount(1);
  await expect(page.locator(".car-card")).toContainText(
    "Mercedes-Benz C-Class",
  );
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage denied");
      },
    });
  });
  await page.reload();
  await page.getByRole("button", { name: "Save Audi Q5", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Saved 1", exact: true }),
  ).toBeVisible();
});

test("enquiry validation, draft, reset, and keyboard dismissal", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Enquire about BMW 3 Series",
  });
  await trigger.click();
  await expect(page.getByLabel("Interested in")).toHaveValue("BMW 3 Series");
  await page.getByLabel("Your name").fill("Website test");
  await page.getByLabel("Phone number").fill("invalid");
  await page.getByRole("button", { name: "Download my enquiry" }).click();
  await expect(page.locator("#form-status")).toBeEmpty();
  await page.getByLabel("Phone number").fill("9876543210");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my enquiry" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("manus-car-world-enquiry.txt");
  const stream = await download.createReadStream();
  let text = "";
  for await (const chunk of stream) text += chunk.toString();
  expect(text).toContain("BMW 3 Series");
  expect(text).toContain("has not been sent");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByLabel("Your name")).toHaveValue("");
  if (process.env.DEALERSHIP_EMAIL) {
    await expect(
      page.getByRole("button", { name: "Open email enquiry" }),
    ).toBeVisible();
    await expect(page.locator("#dialog-description")).toContainText(
      process.env.DEALERSHIP_EMAIL,
    );
  }
});

test("navigation, carousel, FAQ and responsive layout", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) {
    await menu.click();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await menu.click();
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Our cars" })
      .click();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  }
  await page
    .getByRole("button", { name: "Show People to help you choose." })
    .click();
  await expect(
    page.getByRole("heading", { name: "People to help you choose." }),
  ).toBeVisible();
  await page
    .locator("summary")
    .filter({ hasText: "Can I book a test drive?" })
    .click();
  await expect(page.locator("details[open]")).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("homepage.png") });
  expect(errors).toEqual([]);
});
