# Manu’s Car World — Showroom Platform

A dealership platform for certified pre-owned cars, split into independent `frontend` and `backend` applications.

---

## 📁 Repository Structure

```
showroom/
├── frontend/             # Next.js 16 (App Router) + Turbopack + Vanilla CSS
│   ├── app/              # Multi-page routes (/, /cars, /about, /exchange, /visit, /contact, /dashboard)
│   ├── components/       # UI components (Header, Footer, Valuation Calculator, Enquiry, Inventory, etc.)
│   ├── public/           # Static assets, brand logos, optimized WebP images
│   ├── lib/              # Stock data fetching and demo car models
│   ├── scripts/          # Image optimization and verification scripts
│   ├── package.json      # Frontend dependencies & Next.js scripts
│   └── next.config.mjs   # Next.js configuration & image caching
│
├── backend/              # Python Django + Django REST Framework
│   ├── config/           # Django project settings, URLs, WSGI/ASGI
│   ├── inventory/        # Cars, CarImages, media validation, catalog API (/api/cars/)
│   ├── bookings/         # Test drive slots, slot scheduling, booking workflow (/api/bookings/)
│   ├── enquiries/        # Customer purchase/sale enquiry leads (/api/enquiries/)
│   ├── verification/     # Email OTP challenge-response & throttling (/api/verification/send/)
│   ├── workspace/        # Protected staff workspace, session auth, overview stats & CRUD
│   ├── showroom/         # Backward-compatibility layer, admin site branding & test suite
│   ├── manage.py         # Django management script
│   ├── requirements.txt  # Python dependencies (Django 5, DRF, Pillow)
│   └── db.sqlite3        # SQLite development database
│
└── package.json          # Top-level workspace runner scripts
```

---

## 🚀 Quick Start

### 1. Frontend (Next.js)

```powershell
# From the repository root:
npm run dev

# Or directly in the frontend directory:
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Multi-Page Routes:
- `/` — Homepage: Hero, brand strip, trust badges, live inventory, showroom preview, FAQs
- `/cars` — Full pre-owned car catalog with multi-facet filters (make, budget, body, fuel, transmission, year)
- `/cars/[slug]` — Individual vehicle details: specifications grid, walkaround video, verified email booking
- `/about` — Why Manu’s: 150+ point technical inspection breakdown, customer reviews, leadership team
- `/exchange` — Sell & Exchange: Interactive instant car valuation calculator & 4-step handover guide
- `/visit` — Showroom Visit: Climate-controlled bays, test-drive circuit route, hours, and directions
- `/contact` — Contact Showroom: Departmental contacts, opening hours, interactive enquiry modal
- `/dashboard` — Showroom Workspace: Protected admin & staff dashboard

---

### 2. Backend (Django REST Framework)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

The Django REST API runs on [http://localhost:8000/api/](http://localhost:8000/api/).

---

## ☁️ Cloudflare R2 Image & Media Storage

The backend supports **Cloudflare R2** (S3-compatible object storage with zero egress fees) for all uploaded car photos, gallery images, and walkaround videos.

### Setup Steps:
1. Copy `backend/.env.example` to `backend/.env`:
   ```powershell
   copy backend\.env.example backend\.env
   ```
2. Fill in your Cloudflare R2 API credentials:
   ```ini
   CLOUDFLARE_R2_ENABLED=1
   CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_account_id
   CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
   CLOUDFLARE_R2_BUCKET_NAME=your_r2_bucket_name
   CLOUDFLARE_R2_CUSTOM_DOMAIN=pub-xxxxxxxxxxxxxxxx.r2.dev
   CLOUDFLARE_R2_QUERYSTRING_AUTH=0
   ```
3. Test your R2 connectivity and verify public media URLs:
   ```powershell
   cd backend
   python manage.py test_r2
   ```

*Note: If R2 credentials are omitted, the backend automatically defaults to local `media/` folder storage.*

---

## 🛠️ Production Build

```powershell
# Build the frontend production bundle:
npm run build

# Start the production server:
npm start
```
