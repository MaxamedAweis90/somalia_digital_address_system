# Somalia Digital Address System (SDAS) — Production Deployment Guide

This guide provides step-by-step instructions for deploying the **Somalia Digital Address System (SDAS)** to production using the industry-standard cloud architecture:

* **Frontend:** [Vercel](https://vercel.com) (Global Edge CDN, automatic HTTPS, continuous deployment)
* **Backend:** [Railway](https://railway.app) (Dedicated Node.js container runtime, continuous deployment)
* **Database:** [Neon](https://neon.tech) (Serverless PostgreSQL with PostGIS extension support)

---

## 1. System Architecture

```mermaid
flowchart LR
    subgraph Users [End Users & Officials]
        Citizen[Citizen / Public Lookup]
        Admin[Sys Admin / Data Officer]
        Collector[Field Data Collector]
    end

    subgraph Vercel [Frontend Layer - Vercel Edge CDN]
        SPA[React 19 / Vite SPA]
        Router[Client-side React Router]
        Static[Static Assets & Maps]
    end

    subgraph Railway [Backend Layer - Railway Cloud]
        API[Express 5 REST API]
        Auth[JWT & Cookie Authentication]
        GIS[PostGIS Spatial Validation]
        Prisma[Prisma 7 ORM Engine]
    end

    subgraph Neon [Database Layer - Neon Serverless]
        PG[(PostgreSQL Database)]
        PostGIS[(PostGIS Spatial Engine)]
    end

    Citizen --> SPA
    Admin --> SPA
    Collector --> SPA
    SPA -->|HTTPS REST API / Cookies| API
    API --> Prisma
    Prisma --> PG
    Prisma --> PostGIS
```

---

## 2. Prerequisites

Before beginning, ensure you have active accounts for:
1. **GitHub** ([github.com](https://github.com)) — with access to the `somalia_digital_address_system` repository.
2. **Neon Database** ([neon.tech](https://neon.tech)) — for PostgreSQL with PostGIS.
3. **Railway** ([railway.app](https://railway.app)) — for hosting the Node.js API.
4. **Vercel** ([vercel.com](https://vercel.com)) — for hosting the React frontend.

---

## 3. Step 1: Database Setup (Neon PostgreSQL)

1. Log into your [Neon Console](https://console.neon.tech).
2. Open your project (or create a new project named `sdas-production`).
3. Ensure **PostGIS** extension is installed by opening the **SQL Editor** in Neon and running:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
4. In the Neon Dashboard, copy both connection strings from the **Connection Details** widget:
   * **Pooled Connection URL** (used for `DATABASE_URL`)
     ```
     postgresql://neondb_owner:PASSWORD@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   * **Direct Connection URL** (used for `DIRECT_URL`)
     ```
     postgresql://neondb_owner:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

---

## 4. Step 2: Backend Deployment (Railway)

### A. Create the Railway Project
1. Log into [railway.app](https://railway.app).
2. Click **"+ New Project"** → **"Deploy from GitHub repo"**.
3. Select your repository: `MaxamedAweis90/somalia_digital_address_system`.
4. Click **"Deploy Now"**.

### B. Configure Service Settings
1. Click on the newly created service in your Railway canvas.
2. Go to the **"Settings"** tab:
   * **Service Name:** `sdas-backend`
   * **Root Directory:** `/backend`
   * **Build Command:** `npm run build` *(runs `npx prisma generate`)*
   * **Start Command:** `npm start` *(runs `node server.js`)*
3. Go to the **"Networking"** section:
   * Click **"Generate Domain"** (e.g. `sdas-backend-production.up.railway.app`).
   * Note this URL for the frontend configuration.

### C. Set Environment Variables
Go to the **"Variables"** tab and add the following:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production cookie security & performance |
| `PORT` | `5000` | Port for Express server (Railway automatically binds) |
| `DATABASE_URL` | `postgresql://...-pooler.neon.tech/neondb?sslmode=require` | Neon pooled connection string |
| `DIRECT_URL` | `postgresql://...neon.tech/neondb?sslmode=require` | Neon direct connection string (migrations & CLI) |
| `JWT_SECRET` | *(Generate a random 64-char string)* | Secret for signing auth tokens |
| `JWT_EXPIRES_IN` | `7d` | Session expiration duration |
| `FRONTEND_URL` | `https://your-sdas-frontend.vercel.app` | Allowed CORS origin (update once Vercel is created) |

> [!TIP]
> Generate a secure `JWT_SECRET` using PowerShell:
> ```powershell
> [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
> ```

### D. Sync Database Schema & Initial Seed
Once Railway deploys the service:
1. In Railway, click the service → open the **"CLI"** / **"Command Palette"** tab (or connect via Railway CLI).
2. Run database migration and seed default admin accounts:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
3. Verify the logs indicate:
   ```
   ✅ Admin user seeded: admin@somalia.gov.so
   ✅ Data Officer user seeded: officer@somalia.gov.so
   ✅ 18 official Somali regions successfully seeded.
   ```

---

## 5. Step 3: Frontend Deployment (Vercel)

### A. Import Project to Vercel
1. Log into [vercel.com](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Import your GitHub repository: `somalia_digital_address_system`.

### B. Configure Project Settings
In the Vercel project configuration screen:
* **Project Name:** `sdas-portal`
* **Framework Preset:** `Vite`
* **Root Directory:** Click **Edit** and select `frontend`.
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Install Command:** `npm install`

### C. Set Environment Variables
Under **Environment Variables**, add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://sdas-backend-production.up.railway.app/api/v1` | **Must include `/api/v1` suffix** and use your Railway domain |

### D. Deploy
1. Click **"Deploy"**.
2. Vercel will build the frontend in ~1-2 minutes and generate a production URL (e.g. `https://sdas-portal.vercel.app`).

---

## 6. Step 4: Final Connection Handshake

Now connect the two services so cross-origin cookies and API calls communicate securely:

1. Copy your live Vercel URL (e.g. `https://sdas-portal.vercel.app`).
2. Go back to **Railway** → `sdas-backend` → **Variables**.
3. Update `FRONTEND_URL` to match your Vercel URL:
   ```env
   FRONTEND_URL=https://sdas-portal.vercel.app
   ```
4. Railway will automatically redeploy with the updated CORS policy.

---

## 7. Step 5: Post-Deployment Verification

Verify the end-to-end functionality of your production system:

### 1. API Health Check
Open your backend URL in the browser:
```
https://sdas-backend-production.up.railway.app/
```
**Expected response:** `API is running...`

### 2. Portal Access & Authentication
1. Navigate to your Vercel URL: `https://sdas-portal.vercel.app/login`.
2. Verify the branded **SDAS Loading Screen** with animated progress bar renders smoothly.
3. Log in with the default seeded administrator:
   * **Email:** `admin@somalia.gov.so`
   * **Password:** `Password123!`
4. Verify redirection to `/admin/dashboard`.

### 3. Core Feature Tests
- [ ] **Admin Dashboard:** KPI cards load counts for regions, districts, zones, and addresses.
- [ ] **18 Official Regions:** Open `/admin/regions` and confirm the 18 official Somali regions are listed.
- [ ] **Map & Spatial Polygon:** Open `/admin/zones` and verify polygon rendering on the interactive Leaflet map.
- [ ] **Address Generation:** Create a test address and verify DAC (Digital Address Code) format generation.
- [ ] **Audit Logging:** Check `/admin/audit-logs` to confirm administrative actions are recorded in real-time.

---

## 8. Step 6: Custom Domain Setup (Optional)

To connect an official government or organizational domain (e.g. `somalia.gov.so`):

### Frontend (`portal.somalia.gov.so`):
1. In Vercel: Project Settings → **Domains** → Add `portal.somalia.gov.so`.
2. In your DNS provider (Cloudflare / Namecheap / GoDaddy):
   * Add a `CNAME` record:
     * **Name:** `portal`
     * **Target:** `cname.vercel-dns.com`

### Backend (`api.somalia.gov.so`):
1. In Railway: Service Settings → **Networking** → **Custom Domain** → Add `api.somalia.gov.so`.
2. In your DNS provider:
   * Add a `CNAME` record pointing `api` to your Railway target DNS (e.g. `xxx.up.railway.app`).
3. Update environment variables:
   * In Vercel: `VITE_API_URL` = `https://api.somalia.gov.so/api/v1`
   * In Railway: `FRONTEND_URL` = `https://portal.somalia.gov.so`

---

## 9. Troubleshooting & FAQ

### Q1: `CORS error` or `Network Error` when making requests
* **Fix:** Ensure `FRONTEND_URL` in Railway matches your Vercel domain exactly (including `https://` with no trailing slash).
* Check that `VITE_API_URL` on Vercel contains `/api/v1` at the end.

### Q2: User is redirected to `/login` immediately after successful login
* **Fix:** Verify `NODE_ENV=production` is set in Railway. In production, cookies use `sameSite: "none"` and `secure: true`, which allows cross-domain authentication between Vercel and Railway over HTTPS.

### Q3: 404 on page refresh on Vercel (e.g. refreshing `/admin/dashboard`)
* **Fix:** Ensure [`frontend/vercel.json`](file:///c:/Users/HP/Desktop/WorkPlace/Dev_Place/somalia_digital_address_system/frontend/vercel.json) is present with the rewrite rule:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

### Q4: Database connection timeouts during cold starts
* **Fix:** Neon free-tier compute instances auto-pause after inactivity. The connection pooler (`-pooler` in `DATABASE_URL`) and retry handlers inside `db.js` handle reconnection automatically.

---

## 10. Summary Checklist

- [x] Backend `package.json` configured with `start` and `build` scripts.
- [x] Frontend `vercel.json` configured with SPA client-side rewrite rules.
- [x] PostGIS extension enabled on Neon PostgreSQL.
- [x] Backend deployed to Railway with `DATABASE_URL`, `DIRECT_URL`, and `FRONTEND_URL`.
- [x] Database synced and seeded (`npx prisma db push && npm run db:seed`).
- [x] Frontend deployed to Vercel with `VITE_API_URL`.
- [x] CORS handshake verified between Vercel and Railway.
