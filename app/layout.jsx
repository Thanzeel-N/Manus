import "./globals.css";
import { readSiteConfig } from "../lib/site-config.mjs";

const site = readSiteConfig();

export const metadata = {
  metadataBase: site.siteUrl ? new URL(site.siteUrl) : undefined,
  alternates: site.siteUrl ? { canonical: "/" } : undefined,
  robots: { index: site.indexable, follow: site.indexable },
  title: "Manu’s Car World — Pre-owned Car Dealership",
  description:
    "Browse pre-owned cars at Manu’s Car World. Compare stock, plan a showroom visit, or discuss selling and exchanging your current car with our team.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
