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
│   ├── showroom/         # Car models, bookings, test-drive slots, enquiries, staff API
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

## 🛠️ Production Build

```powershell
# Build the frontend production bundle:
npm run build

# Start the production server:
npm start
```
