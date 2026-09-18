import test from "node:test";
import assert from "node:assert/strict";
import { readSiteConfig } from "../lib/site-config.mjs";

test("unconfigured previews cannot be indexed", () => {
  assert.deepEqual(readSiteConfig({}), {
    email: "",
    siteUrl: undefined,
    indexable: false,
  });
});
test("indexing requires canonical domain and contact email", () => {
  assert.throws(() => readSiteConfig({ ALLOW_INDEXING: "true" }));
  const site = readSiteConfig({
    SITE_URL: "https://cars.example.com/",
    DEALERSHIP_EMAIL: "sales@example.com",
    ALLOW_INDEXING: "true",
  });
  assert.equal(site.siteUrl, "https://cars.example.com");
  assert.equal(site.indexable, true);
});
test("reject unsafe or malformed deployment configuration", () => {
  for (const SITE_URL of [
    "http://cars.example.com",
    "https://user:pass@example.com",
    "https://example.com/path",
    "https://example.com/?query=1",
    "not-a-url",
  ]) {
    assert.throws(() => readSiteConfig({ SITE_URL }));
  }
  for (const DEALERSHIP_EMAIL of [
    "not-an-email",
    "sales@example.com?bcc=bad@example.com",
    "sales@example.com\nBcc:bad@example.com",
  ]) {
    assert.throws(() => readSiteConfig({ DEALERSHIP_EMAIL }));
  }
});
