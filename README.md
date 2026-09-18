# Manu’s Car World

Next.js dealership website with filters, local favourites, enquiry drafts, and configurable email enquiries.

## Development

Use Node.js 22. Run `npm ci --include=dev`, then `npm run dev`. On Windows use npm.cmd if PowerShell restricts scripts. Responsive WebP assets are generated before development and production builds; do not omit development dependencies during builds.

## Deployment

Deploy as a Next.js app: `npm ci --include=dev`, `npm run build`, `npm start`. Behind a reverse proxy use `npm start -- --hostname 0.0.0.0`. Terminate HTTPS at the host/proxy. Deploy .next, public, and runtime dependencies together. This is not a static export. Monitor GET /api/health for a 200 response.

Copy .env.example to .env.local or configure these values on the host BEFORE building:

| Variable | Purpose |
| --- | --- |
| DEALERSHIP_EMAIL | Real public recipient; empty enables downloads only. |
| SITE_URL | Canonical HTTPS origin, without path, query, fragment, or credentials. |
| ALLOW_INDEXING | Defaults false; set exactly true only after completing launch requirements. |

Rebuild when settings change: pages and metadata are prerendered. Invalid configuration fails the build. Indexing requires a domain and contact email. Previews send noindex/nofollow, disallow robots and omit sitemap entries. Robots directives are not access control; use hosting authentication for private previews.

Security headers block framing and MIME sniffing, restrict device permissions and referrers, and apply a baseline CSP for objects, framing, form actions and base URLs. This is not a complete script/XSS policy. HSTS is enabled with an HTTPS canonical URL. See [Next.js headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers).

## Enquiries

A configured email enables a prefilled draft in the visitor’s email app. The visitor must send it. Opening the app does not verify delivery or confirm a booking. Download is available as a fallback. There is no backend inbox, database, or automated email service.

Personal form details are not submitted to this server. They remain in the form, downloaded file, or email app. Reopening the form clears personal fields. Favourites use optional local storage. The /privacy page explains these behaviours; review it when adding analytics, CRM or backend features.

## Verification

```sh
npm test
npm run format:check
npm audit --audit-level=high
npx playwright install chromium
npm run build
npm run test:e2e
```

Playwright starts a production server on port 3100 and checks desktop/mobile layouts, headers, health, image caching, privacy/404 pages, filters, persisted and blocked storage, form validation/downloads, keyboard dismissal, navigation, and FAQs. Set PLAYWRIGHT_CHANNEL=chrome to use installed Chrome. Test artifacts are in ignored test-results/.

GitHub Actions runs checks on pushes and pull requests, including a second build with contact and canonical domain configured. Enable the verify job in branch protection if needed. Dependabot proposes dependency updates. Roll back by redeploying a previously verified commit with matching configuration.

## Launch requirements

- Replace sample vehicles/prices in components/inventory.jsx with verified inventory, update enquiry options and FAQ, and remove sample labels only when accurate.
- Supply real dealership email, address, hours, and domain. No business contact details have been invented.
- Replace preview photography with images you may publish. Existing rights have not been verified; generated scenes are illustrative. Unused reference-site photography is excluded from this repository.
- Send an enquiry from the deployed site and verify actual receipt.
- Review privacy copy for actual operations, enable indexing, rebuild, and verify HTTPS and headers on the deployed hostname. Configure uptime monitoring.

The code is deployable; current business content remains a labelled preview until the above details are supplied.
