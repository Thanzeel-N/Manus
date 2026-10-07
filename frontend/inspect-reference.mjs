import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

await fs.mkdir("design-reference", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("https://motorflowtemplate.webflow.io/home-pages/home-v3", {
  waitUntil: "networkidle",
});
await page.screenshot({ path: "design-reference/desktop-top.png" });
const info = await page.evaluate(() => ({
  title: document.title,
  headings: [...document.querySelectorAll("h1,h2,h3")].map((e) => ({
    text: e.textContent,
    class: e.className,
    font: getComputedStyle(e).font,
    color: getComputedStyle(e).color,
  })),
  body: {
    background: getComputedStyle(document.body).backgroundColor,
    font: getComputedStyle(document.body).font,
  },
  sections: [...document.querySelectorAll("section")].map((e) => ({
    class: e.className,
    background: getComputedStyle(e).backgroundColor,
    height: e.offsetHeight,
    padding: getComputedStyle(e).padding,
  })),
  images: [...document.images].map((e) => ({ alt: e.alt, src: e.currentSrc })),
  links: [...document.querySelectorAll("a")]
    .filter((e) => e.getBoundingClientRect().width > 0)
    .slice(0, 15)
    .map((e) => ({
      text: e.textContent,
      background: getComputedStyle(e).backgroundColor,
      borderRadius: getComputedStyle(e).borderRadius,
    })),
}));
await fs.writeFile(
  "design-reference/inspection.json",
  JSON.stringify(info, null, 2),
);
console.log(JSON.stringify(info, null, 2));
for (const y of [900, 1900, 3100, 4500, 6000]) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `design-reference/desktop-${y}.png` });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: "design-reference/mobile-top.png" });
await browser.close();
