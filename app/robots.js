import { readSiteConfig } from "../lib/site-config.mjs";
export default function robots() {
  const site = readSiteConfig();
  return {
    rules: {
      userAgent: "*",
      ...(site.indexable ? { allow: "/" } : { disallow: "/" }),
    },
    ...(site.indexable ? { sitemap: `${site.siteUrl}/sitemap.xml` } : {}),
  };
}
