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
4. Set status to **available** to publish. Reserved cars remain visible but cannot be booked. Draft and sold cars stay private to the workspace.
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

Set `DJANGO_DEBUG=0`, a unique `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, and `CSRF_TRUSTED_ORIGINS`. Configure `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_HOST` and optionally `MYSQL_PORT` to use MySQL. SQLite is used only for local development and current tests.

Deploy Django behind an HTTPS-capable application server and reverse proxy. Run migrations and `collectstatic`; serve static files and uploaded media via durable storage and a web server (Django only serves media directly with DEBUG enabled). The Next.js `/media/` rewrite assumes the Django origin can serve media. Enforce upload limits at the proxy and use a shared cache for throttling. Replace demo inventory and illustrative photos before launch; verify MySQL and actual production storage in staging.

Admin upload handling follows [Django’s admin documentation](https://docs.djangoproject.com/en/5.2/ref/contrib/admin/).


## Set individual staff permissions

In the frontend, sign in as an administrator and open **Staff & access > Manage > Dashboard permissions**. Choose **View**, **Add**, and **Edit** separately for Vehicles, Contact enquiries, Test drives and Availability, then save the staff member. New frontend accounts begin with no selected access; choose their permissions before saving. Existing accounts keep their current access until an administrator changes it.

Examples: a stock editor needs Vehicles View + Edit (and Add to create listings); a customer service employee needs Contact enquiries View + Edit and Test drives View + Edit. Editing vehicles includes photo uploads. View-only staff cannot save changes. Selecting Add or Edit also grants View; adding availability also grants vehicle viewing so the employee can select a car. Unchecking View removes that section's Add/Edit access. The presets are No access, View only, and All daily operations. Account and permission management remain administrator-only.

Access is enforced on each backend request, including direct API requests. Staff should refresh their dashboard after a change to update visible menus. Turning off Active account blocks sign-in. This editor replaces the employee's default Showroom staff group with individual showroom permissions; unrelated permissions remain unchanged. If a custom group grants access that conflicts with a restriction, saving is rejected with instructions to adjust that group in advanced administration rather than falsely claiming access was removed.

Verification: `manage.py test showroom.test_workspace` covers revocation, role escalation, new accounts, inactive accounts, dependencies and custom-group conflicts. From `frontend`, `node scripts/verify-staff-access.mjs` verifies the permission editor with mocked API responses; set `SITE_URL` to a running frontend (default port 3006).

## Customer email and password accounts

The shared `/login` page offers Google first, followed by **Sign in** and **Create account**. Customers can register with their name, email, password and password confirmation. Registration creates a customer account, signs them in, and returns them to their selected car (or `/cars`). Returning customers sign in with email and password; staff continue using their existing username and password.

`POST /api/customer/register/` uses CSRF protection, the existing login throttle and Django password validation. Passwords are hashed; public registration cannot grant staff status or permissions. Duplicate emails are rejected without linking or modifying an existing Google, staff or customer account. Customer email sign-in is case-insensitive and rejects ambiguous matches. Registration does not verify inbox ownership; bookings from password sessions keep `email_verified_at` empty. Password recovery currently directs customers to the showroom team.

Verification: `python backend/manage.py test showroom.test_customer_auth --noinput` and `node frontend/scripts/verify-customer-signup.mjs`. The browser check uses the local backend, creates one temporary customer, and removes that customer afterward.
## Owner/admin alerts and delegated administrators

Run `python manage.py migrate` and `python manage.py setup_staff` before starting the updated app.
For production, also run `python manage.py createcachetable` to provision the shared database-backed throttle cache.
Production requires a random `DJANGO_SECRET_KEY` of at least 50 characters and enables HTTPS redirects and one-hour HSTS.
Behind a trusted TLS-terminating proxy that overwrites `X-Forwarded-Proto`, set `DJANGO_TRUST_PROXY_HTTPS=1`.
Configure the Next.js proxy to preserve that trusted header; verify secure login and CSRF in staging.
Run `python manage.py check --deploy` with your production environment before launch.
Existing superusers are owners. In **Staff & access**, an owner can enable **Administrator** on an employee.
Administrators have full showroom workspace access and can create, edit, deactivate and set permissions for ordinary staff.
Only owners can grant/revoke administrator status or edit another administrator. Owner accounts remain protected;
use **My account** for your own phone and password. Delegated administrators are not Django superusers.

**My account > Your alert phone** sets the owner's/admin's number. Owners can also set employee numbers in the staff editor.
Use E.164 format (`+919876543210`). Car details/photos and enquiry/test-drive status changes create durable alerts for
every active owner and administrator, including the person who made the change. Customers and ordinary staff receive no phone alerts.
Unchanged records do not generate duplicate alerts. Changes through the workspace, legacy dashboard and Django admin are tracked.
Maintenance scripts and bulk ORM updates do not have a staff request actor and are not tracked.

To enable SMS, configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` and set `SMS_ENABLED=1`.
Use a Twilio sender enabled for your destination countries. Schedule **one** worker every minute:

```sh
python manage.py deliver_alerts
```

The command submits up to 100 queued messages per run. Web requests never wait for SMS delivery.
Run it under your scheduler's single-instance/overlap protection. Credentials must remain in the server environment.
No live messages are sent by tests. Before launch, verify an alert on a real owner/admin phone in staging.

The **Alerts** page refreshes every 30 seconds and shows per-recipient SMS submission state.
`submitted` means the provider accepted the request, not confirmed handset delivery; see the
[Twilio message lifecycle](https://www.twilio.com/docs/messaging/guides/outbound-message-status-in-status-callbacks).
Rate limits retry on subsequent runs (maximum five attempts). `unknown`, `failed`, or stale `submitting` entries need
operator review in Twilio before retrying, to avoid duplicate messages after a network timeout/process crash.
After reconciling the provider result, an operator can update the corresponding `workspace.Alert` status using Django shell;
reset to `pending` only when the provider has confirmed no message was accepted. Monitor these states and queue age in production.
Demotion, deactivation or a changed phone cancels queued delivery to the old recipient/number. Alerts created without a phone
remain dashboard-only; saving a phone affects future alerts. Set a retention policy for alert records appropriate to your business.

Validation: `python manage.py test --noinput`; `python manage.py verify_r2_media`; and `npm.cmd run build` from `frontend`.
Configure HTTPS, MySQL, shared throttling cache, SMTP and durable storage as described above before deployment.
HSTS for all subdomains and browser preloading remain disabled until the deployment domain and all its subdomains have been verified for HTTPS;
the deployment check reports those two domain-specific warnings. The local development environment intentionally keeps DEBUG enabled.
Browser coverage: from `frontend`, run `node scripts/verify-owner-alerts.mjs` against `SITE_URL` (default `http://localhost:3011`).
