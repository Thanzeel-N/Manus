# Manu’s Car World

A Next.js App Router project for a pre-owned car dealership, using Motorflow Home V3 as the design reference.

## Development

Requires Node.js 20.9 or newer. Run npm install, then npm run dev. Open the URL printed by Next.js. On Windows PowerShell, use npm.cmd if script execution is restricted.

## Production

Run npm run build, then npm start.

For a fast forwarded-port preview, run `npm run preview` and forward port **3000** in VS Code. This builds once and serves the production bundle on all interfaces. To use another port, run `npm run build`, then `npm start -- --hostname 0.0.0.0 --port 3001` and forward that port. Stop any existing server on the chosen port first. Rebuild after changing the site; use `npm run dev` while editing.

Images are generated at build time in responsive WebP sizes, with content-hashed filenames and long-lived caching. The hero loads eagerly; other sections load lazily. No remote image host or first-request image conversion is required. Run `npm run images:optimize` after replacing source photography. Generated scene sources live in `assets/section-*.png`; image prompts and placements are documented in `design-reference/section-images.md`.

## Structure

- app/page.jsx: server-rendered home page and dealership sections.
- app/layout.jsx: root layout and search metadata.
- app/globals.css: responsive styling.
- components/: React car filters, saved favourites, navigation, and enquiry dialog.
- public/assets/: locally stored car photography.

The site includes a Django backend for inventory, multiple photo uploads, optional short videos, saved contact enquiries and test-drive bookings. Open `/dashboard/` for the protected admin/staff workspace, with search, status filters, follow-up notes, booking confirmation and links to vehicle and staff management. See [backend setup and staff workflow](backend/README.md). The initial collection contains sample vehicles, prices and illustrative images. Saved favourites stay in the visitor’s browser.

`node scripts/verify-dashboard.mjs` checks public enquiry submission, login/logout, saved follow-up notes, the car editor, mobile layout and staff access restrictions. It expects running Next.js and Django servers, migrated data, the `Showroom staff` group (`manage.py setup_staff`) and installed Chrome. Set `SITE_URL` to the frontend origin; that origin must also be included in Django's `CSRF_TRUSTED_ORIGINS`. The test creates temporary accounts and one enquiry, then removes them in cleanup. Screenshots are saved to `design-reference/result/dashboard-desktop.png` and `dashboard-mobile.png`.

## Reference and verification

The live reference was inspected in Chrome at desktop and mobile widths before the dark redesign. See `design-reference/notes.md` for the findings and `design-reference/` for screenshots. Showcase imagery from the supplied reference is included for design preview; use the dealership’s own licensed photography before publication.

`node verify-site.mjs` checks the site at http://127.0.0.1:3002 using installed Chrome: inventory filters, favourites, enquiries, carousel, mobile navigation, FAQ, and horizontal overflow. Set SITE_URL to check another server. Screenshots are saved in `design-reference/result/`.
