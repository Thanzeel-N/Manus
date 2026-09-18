import { readSiteConfig } from "../lib/site-config.mjs";
export default function sitemap() {
  const site = readSiteConfig();
  return site.indexable
    ? [{ url: site.siteUrl, changeFrequency: "weekly", priority: 1 }]
    : [];
}
