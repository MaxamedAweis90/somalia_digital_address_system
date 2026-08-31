# Somalia Digital Address System (SDAS)

A full-stack digital address registry for Somalia. The system manages regions, districts, neighborhoods, zones, and addresses with role-based access for system administrators and data officers.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite, Tailwind CSS, Axios, React Router |
| Backend | Node.js, Express 5, Prisma 7, PostgreSQL |
| Auth | JWT (httpOnly cookies) |

## Project Structure

```
somalia_digital_address_system/
├── backend/          # Express API + Prisma
│   ├── prisma/       # Schema, migrations, seed
│   ├── prisma.config.ts
│   └── src/          # Routes, controllers, services
└── frontend/         # React app
```

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** 14+ (local or hosted, e.g. Neon)
- **npm**

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd somalia_digital_address_system
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory. Choose **local PostgreSQL** or **Neon** below.

#### Option A: Local PostgreSQL

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sdas?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@localhost:5432/sdas?schema=public"

# Auth
JWT_SECRET="your-long-random-secret"

# App
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Create the database before running Prisma:

```bash
createdb sdas
```

#### Option B: Neon (hosted PostgreSQL)

1. Create a free project at [neon.tech](https://neon.tech).
2. In the Neon dashboard, open your project → **Connect**.
3. Copy both connection strings:
   - **Pooled connection** → use as `DATABASE_URL` (hostname contains `-pooler`)
   - **Direct connection** → use as `DIRECT_URL` (hostname does **not** contain `-pooler`)

```env
# Database (Neon)
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Auth
JWT_SECRET="your-long-random-secret"

# App
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled connection — used by the running API |
| `DIRECT_URL` | Direct connection — used by Prisma CLI (`db push`, `db seed`, migrations) |

> **Note:** Prisma 7 reads database URLs from `prisma.config.ts`, not from `schema.prisma`. When using Neon, always set **both** URLs. Using the pooler URL for `DIRECT_URL` can cause timeouts during seeding and migrations.

> **Neon free tier:** The database may pause after inactivity. The first request after a pause can take a few seconds — the seed script retries automatically on timeout.

#### Sync the database schema

```bash
npx prisma generate
npx prisma db push
```

#### Seed the database

The seed script creates a default system admin user:

| Field | Value |
|-------|-------|
| Email | `admin@somalia.gov.so` |
| Password | `Password123!` |
| Role | `SYS_ADMIN` |

Run either:

```bash
npm run db:seed
```

or:

```bash
npx prisma db seed
```

#### Start the API server

```bash
npm run server
```

The API runs at **http://localhost:5000**.

After changing `prisma/schema.prisma`, always run `npx prisma generate` and restart the server.

### 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**. `/login` is the sole public entry point; unauthenticated users visiting `/` or any unknown route are redirected to `/login`.

The Vite dev server proxies `/api` requests to the backend at `http://localhost:5000`, so cookies work correctly in development.

## Docker Hub publishing and server deployment

The GitHub Actions workflow in `.github/workflows/docker-publish.yml` builds and publishes the two application images:

```text
<dockerhub-username>/sdas-backend
<dockerhub-username>/sdas-frontend
```

The PostgreSQL service uses the official `postgres:16-alpine` image directly and does not need a project Dockerfile.

Add these GitHub Actions secrets in the repository settings:

- `DOCKERHUB_USERNAME` — your Docker Hub username
- `DOCKERHUB_TOKEN` — a Docker Hub access token, not your account password

Application images are published automatically for pushes to `main` and `dev`, and for version tags such as `v1.0.0`. On the server, create a `.env` file beside `docker-compose.yml`:

```env
DOCKERHUB_USERNAME=your-dockerhub-username
IMAGE_TAG=dev
```

Then pull and start the published images without rebuilding:

```bash
docker compose pull
docker compose up -d --no-build
```

Use `IMAGE_TAG=latest` for the default branch image or a version tag for a release. The PostgreSQL data remains in the `pgdata` volume when containers are updated.

## User Roles

| Role | Access |
|------|--------|
| `SYS_ADMIN` | Full admin panel — regions, districts, neighborhoods |
| `DATA_OFFICER` | Data registry operations |

After login, users are redirected based on role:

- `SYS_ADMIN` → `/admin/dashboard`
- `DATA_OFFICER` → `/officer/dashboard`

## API Overview

Base URL: `http://localhost:5000/api/v1`

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Sign in |
| `POST` | `/auth/logout` | Sign out |
| `GET` | `/auth/me` | Current user (protected) |

### Admin (SYS_ADMIN only)

All routes under `/admin` require authentication and the `SYS_ADMIN` role.

| Resource | Base path |
|----------|-----------|
| Regions | `/admin/regions` |
| Districts | `/admin/districts` |
| Neighborhoods | `/admin/neighborhoods` |

Each resource supports full CRUD: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`.

**Hierarchy:** Region → District → Neighborhood

Example — create a district:

```bash
# Login and save cookie
curl -c cookies.txt -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@somalia.gov.so","password":"Password123!"}'

# Create a region
curl -b cookies.txt -X POST http://localhost:5000/api/v1/admin/regions \
  -H "Content-Type: application/json" \
  -d '{"name":"Banadir","code":"BND"}'

# Create a district (use region id from response)
curl -b cookies.txt -X POST http://localhost:5000/api/v1/admin/districts \
  -H "Content-Type: application/json" \
  -d '{"regionId":"<region-id>","name":"Hodan","code":"HOD"}'
```

## Common Commands

### Backend

```bash
npm run server          # Start API with hot reload
npm run db:seed         # Seed admin user
npx prisma db push      # Sync schema to database
npx prisma generate     # Regenerate Prisma client
npx prisma studio       # Open database GUI
```

### Frontend

```bash
npm run dev             # Start dev server
npm run build           # Production build
npm run preview         # Preview production build
```

## Troubleshooting

**Seed or API fails with connection errors**
- Confirm `DATABASE_URL` in `.env` is correct.
- **Local:** Confirm PostgreSQL is running (`pg_isready`) and the `sdas` database exists.
- **Neon:** Confirm both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) are set. The direct URL must not contain `-pooler` in the hostname.
- **Neon:** If the project was paused, wake it from the Neon dashboard or wait for the first connection to complete.

**Seed times out on Neon (`ETIMEDOUT`)**
- Use the **direct** connection string for `DIRECT_URL`.
- Re-run the seed — it retries up to 3 times on timeout.
- Ensure your network allows outbound connections to `*.neon.tech`.

**`prisma.region` or schema field errors after a schema change**
- Run `npx prisma generate` and restart the backend server.

**Login works but admin routes return 403**
- Ensure the user has the `SYS_ADMIN` role. Re-run the seed to update the admin user.

**Frontend cannot reach the API**
- Confirm the backend is running on port 5000.
- Confirm `FRONTEND_URL=http://localhost:5173` is set in backend `.env`.

## License

ISC
