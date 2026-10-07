# Showroom backend

## Start locally

With Python 3.12+ installed, from the repository root:

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python backend/manage.py migrate
backend/.venv/Scripts/python backend/manage.py seed_demo
backend/.venv/Scripts/python backend/manage.py createsuperuser
backend/.venv/Scripts/python backend/manage.py runserver 127.0.0.1:8017
```

This workspace also has a project-local runtime: substitute `.runtime/python/python.exe` for `backend/.venv/Scripts/python` in the commands above. It already has the dependencies installed and demo data migrated. The runtime and database are ignored by version control.

Set `DJANGO_API_URL=http://127.0.0.1:8017` in the root `.env.local`, then run `npm run dev`. Restart Next.js after changing backend URLs. Without this variable, the frontend displays labelled sample inventory and disables booking. If a configured backend fails, it displays an unavailable message instead of sample stock.

Open http://127.0.0.1:8017/admin/ and sign in with the account created by `createsuperuser`. No default password is installed.

## Manage stock

1. Add a car, specifications, description, price in lakh INR, and one feature per line.
2. Use **Photos** to select up to 20 images at once (JPG, PNG, WebP; 10 MB each). Individual gallery rows support captions, removal and ordering. The lowest position is the cover image.
3. Optionally upload a short walkaround under **Video** (MP4/WebM, up to 100 MB). No duration limit or transcoding is implemented; use a web-compatible, compressed clip.
4. Set status to **available** to publish. Drafts are private. Reserved/sold cars remain visible but cannot be booked.
5. Add slots under **Test drive slots**, or generate the next two weeks with:

```powershell
.runtime/python/python.exe backend/manage.py create_slots --days 14
```

Slots start hourly from 10:00 to 17:00 IST, excluding 13:00. Each car has independent capacity. Block individual slots for closures. The implementation assumes one showroom; staff/driver capacity across cars and multiple locations are not implemented.

## Bookings

Requests are stored as **pending**, with a reference shown to the customer. Pending and confirmed requests reserve the slot. Staff can confirm or cancel in Admin; cancellation releases it. A database uniqueness constraint prevents duplicate reservations, and the API rejects past/blocked slots or unavailable cars. Anonymous booking writes are rate-limited. Next.js currently shares one backend rate-limit identity, so configure a trusted proxy and shared cache before public deployment.

Contact customers manually for staff confirmation. Automated booking-confirmation email/SMS notifications are not connected. Email verification is implemented separately as described below. General enquiry/sell-or-exchange dialogs now save requests in the Enquiries table and dashboard; these do not reserve a test-drive slot.

## Admin and staff dashboard

Open `/dashboard` on the Next.js website (normally http://localhost:3000/dashboard) and sign in with your existing staff account. This is a dedicated React frontend, with its own login, navigation, overview and editors. It uses live records through the session-authenticated `/api/workspace/` API. Daily tasks stay inside the frontend: create/edit cars, upload photos and walkaround videos, review customer contact details and notes, confirm/cancel bookings, create/block slots, add or deactivate staff, and change your own password. Search, status filters, pagination, mobile layouts, loading states and recoverable error messages are included. The original Django admin remains available at `/admin/` for advanced administration.

For a new installation, run:

```powershell
.runtime/python/python.exe backend/manage.py migrate
.runtime/python/python.exe backend/manage.py setup_staff
.runtime/python/python.exe backend/manage.py createsuperuser
```

The first two commands have already been applied to this workspace. No default password is stored in code. Use the existing administrator account, or create one with `createsuperuser` on a new installation. In the frontend **Staff & access**, choose **Add staff member**, enter their details and initial password, and leave **Active account** enabled. New accounts automatically receive Staff status and the **Showroom staff** group. The group may view/change cars, photos, slots, bookings and enquiries, and add cars/photos/slots; it cannot delete records or manage users. Only superusers can manage accounts in this frontend, and it cannot promote users to superuser or modify existing superuser accounts. Staff can change their own password through **My account**. Administrators can adjust individual permissions in Django admin. Every API operation enforces its permissions on the server.

The frontend proxies `/api/workspace/`, `/admin/`, `/static/` and `/media/` to `DJANGO_API_URL`; `/dashboard` is rendered by Next.js. Restart Next.js after changing its config, and restart Django after backend changes when running without auto-reload. Django must trust the browser-facing origin through `CSRF_TRUSTED_ORIGINS` (defaults cover localhost/127.0.0.1 on port 3000; add the exact origin when using another port). Production requires the same HTTPS/security and static/media serving configuration described below. Private API responses are never cached; the frontend shell contains no customer data or secrets. Session and login writes require CSRF tokens. Login failures are rate-limited; configure a shared cache for multi-process production deployments.

`node scripts/verify-workspace.mjs` verifies the complete frontend workflow against running servers, using temporary accounts, a vehicle/photo, enquiry, slot and booking that it removes afterward. Set `SITE_URL` when using a port other than 3000. Screenshots are saved under `design-reference/result/workspace-*.png`. `verify-dashboard.mjs` delegates to this test for compatibility. Run `manage.py test showroom` for backend access-control, CSRF, validation and booking-conflict coverage.

The public enquiry endpoint accepts contact details, interest, preferred date and message; it validates inputs and rate-limits submissions. It never exposes the enquiry list to anonymous users. Staff notes and workflow status cannot be set from public forms. Contact details remain unverified unless a customer completes the separate test-drive email verification flow.

## Customer email verification

The public site has separate Home (`/`), Our cars (`/cars`), and car-detail (`/cars/<slug>`) pages. Booking requires a six-digit email code. The backend checks the code and creates the booking together; frontend state alone cannot authorize a booking. A code is bound to its email address, expires after 10 minutes, permits five attempts, and is consumed by a successful booking. Requests have a 60-second resend cooldown and a five-emails-per-address hourly limit, plus anonymous endpoint throttling. Staff can see `Email verified at` in bookings. Changing the email in Admin clears that evidence. This verifies inbox access, not identity or buying intent; phone numbers are not verified.

In local development, messages are written to `.runtime/mail/` and the UI explicitly says no inbox email was sent. With `DJANGO_DEBUG=1` (the local default), successfully sent codes are also printed in the Django server console as `[DEV OTP] email: code`. Read the console or latest mail file to test the code. Codes are not exposed in API responses or stored in plaintext in the database. Do not publish this private folder. The browser test reads only its own local test message.

For live delivery, configure these environment variables **in the Django server environment**, then restart Django (Next.js `.env.local` does not configure Django):

```text
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_HOST_USER=your-smtp-username
EMAIL_HOST_PASSWORD=your-smtp-password
EMAIL_USE_TLS=1
EMAIL_USE_SSL=0
DEFAULT_FROM_EMAIL=Showroom <verified-sender@your-domain.com>
```

Use the sender authorized by your mail provider and configure its domain authentication. For port 465, set SSL to 1 and TLS to 0. Production refuses local-only email backends; missing SMTP configuration or delivery failure blocks verification instead of accepting unverified bookings. SMTP integration follows [Django’s email configuration](https://docs.djangoproject.com/en/5.2/topics/email/). Live deliverability must be tested after credentials are supplied. Periodically purge expired verification records according to your retention policy.

## Verification

```powershell
.runtime/python/python.exe backend/manage.py test showroom
npm run build
node scripts/verify-commerce.mjs
```

The browser check expects Next.js at localhost port 3003, a running backend with demo cars/slots and local file-based email delivery, and installed Chrome. Set `SITE_URL` for another port. It creates a booking for a unique `browser-qa-<timestamp>@example.com` address; cancel/remove that test booking afterward.

## Production configuration

Set `DJANGO_DEBUG=0`, a unique `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, and `CSRF_TRUSTED_ORIGINS`. Configure `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST` and optionally `POSTGRES_PORT` to use PostgreSQL. SQLite is used only for local development and current tests.

Deploy Django behind an HTTPS-capable application server and reverse proxy. Run migrations and `collectstatic`; serve static files and uploaded media via durable storage and a web server (Django only serves media directly with DEBUG enabled). The Next.js `/media/` rewrite assumes the Django origin can serve media. Enforce upload limits at the proxy and use a shared cache for throttling. Replace demo inventory and illustrative photos before launch; verify PostgreSQL and actual production storage in staging.

Admin upload handling follows [Django’s admin documentation](https://docs.djangoproject.com/en/5.2/ref/contrib/admin/).
