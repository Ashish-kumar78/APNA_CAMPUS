# Apna Campus — College Management System (Monorepo)

> **Enterprise-grade, Autonomous College ERP & Academic Management System** built for Autonomous BPUT Institutions, featuring 14 dedicated role portals, biometric tracking, fee verification, digital clearance, examination cell, and AI assistance.

---

## 🏛️ Architecture Overview

c

### Monorepo Structure

```
CMS/
├── backend/                  # NestJS API Server
│   ├── prisma/
│   │   ├── migrations/       # Legacy PostgreSQL migrations (not used by Atlas)
│   │   ├── schema.prisma     # Canonical MongoDB Prisma data models
│   │   └── seed.ts           # Optional development-only sample domain data; no user accounts
│   ├── src/                  # NestJS modules (auth, students, marks, academics, fees, etc.)
│   ├── .env.example          # Backend environment template
│   └── package.json
├── frontend/                 # React + Vite Client Application
│   ├── src/                  # React components, pages, state stores, and API clients
│   ├── .env.example          # Frontend environment template
│   └── package.json
├── scripts/
│   └── setup-dev.ps1         # Automated Windows PowerShell onboarding script
├── .env.example              # Root monorepo environment template
├── .gitignore                # Production gitignore excluding .env and node_modules
├── package.json              # Monorepo orchestration scripts (concurrent dev, install, build)
└── README.md
```

---

## 📋 Prerequisites

Ensure the following are installed on your Windows machine:

1. **Node.js**: `v18.x` or higher (recommended: `v20.x` or `v22.x`)
   - Check with: `node -v`
2. **npm**: `v9.x` or `v10.x`
   - Check with: `npm -v`
3. **MongoDB Atlas**: a MongoDB cluster, database user, and an IP/network access rule for your development machine.
4. **PowerShell**: Windows PowerShell 5.1 or PowerShell 7+

---

## ⚡ Option A: Automated Developer Setup (Recommended)

Run the included PowerShell onboarding script from the repository root. It checks prerequisites, creates missing `.env` files without overwriting existing files, validates configuration keys, installs dependencies, and generates Prisma Client. It does not connect to Atlas or write database schema/data:

```powershell
# Open PowerShell in the project root:
.\scripts\setup-dev.ps1
```

Once complete, start the application:

```powershell
npm run dev
```

---

## 🛠️ Option B: Step-by-Step Manual Onboarding Guide

Follow these exact steps for a clean clone on Windows:

### Step 1: Clone the Repository

```powershell
git clone https://github.com/sahooprasadbishnu1234/CMS.git
cd CMS
```

### Step 2: Create Environment Configuration Files

Copy the provided environment templates:

```powershell
if (-not (Test-Path backend\.env)) { Copy-Item backend\.env.example backend\.env }
if (-not (Test-Path frontend\.env)) { Copy-Item frontend\.env.example frontend\.env }
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

If an `.env` file already exists, keep it and edit only the required keys. See [Atlas setup after backend completion](docs/ATLAS_SETUP_AFTER_BACKEND.md) for the full safe Atlas process, including macOS steps.

Open `backend\.env` in your text editor and set `DATABASE_URL` to the Atlas connection string shown by Atlas under **Connect → Drivers**. Use a database user, not your Atlas website login. Keep the URI private and do not commit it:

```env
DATABASE_URL="mongodb+srv://<db_user>:<db_password>@<cluster-host>/apna_campus?retryWrites=true&w=majority"
```

Replace the placeholders locally. URL-encode special characters in the username/password. Atlas must allow the developer machine's IP (or the configured private network) and the database user needs only the permissions required by this application.

### Step 3: Install Dependencies

Install all dependencies across the root, backend, and frontend with a single command:

```powershell
npm run install:all
```

*Or install each directory individually:*
```powershell
npm install
npm install --prefix backend
npm install --prefix frontend
```

### Step 4: Generate Prisma Client

```powershell
npm run prisma:generate --prefix backend
```

> **Windows Note**: Stop a running backend dev server before regenerating Prisma Client because Windows can lock active native files.

### Step 5: Prepare the Atlas schema

Only after confirming `DATABASE_URL` points to a new/safe development database and reviewing the schema diff, push the schema and indexes:

```powershell
npm run prisma:db-push --prefix backend
```

MongoDB does not use Prisma Migrate. The committed SQL files under `backend/prisma/migrations` are retained as legacy PostgreSQL history and are not applied to Atlas. Do not run `db push` against a production cluster without a reviewed change and backup plan.

### Step 6: Add Institutional Data

The demo-data seed has been removed. Add verified departments, students, faculty, and other institutional records through the application workflows when they are ready. Do not import fabricated records into the real-data environment.

### Step 7: Start the Application

You can start both backend and frontend concurrently from the root directory:

```powershell
npm run dev
```

Alternatively, run them in two separate PowerShell terminal windows:

**Terminal 1 (Backend - NestJS):**
```powershell
cd backend
npm run start:dev
```
*Backend runs at: [http://localhost:4000/api](http://localhost:4000/api)*  
*Swagger API Docs: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)*

**Terminal 2 (Frontend - Vite + React):**
```powershell
cd frontend
npm run dev
```
*Frontend runs at: [http://localhost:5173](http://localhost:5173)*

---

## Account setup

There are no shared demo sign-in credentials. Create the first development Super Admin with `npm run admin:bootstrap` from `backend/`, then provision accounts through the authenticated Super Admin Portal. The optional development data seed does not create user accounts.

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Required? | Default / Example |
|---|---|---|---|
| `PORT` | NestJS server port | No | `4000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | No | `development` |
| `CLIENT_URL` | Allowed origin for frontend CORS requests | No | `http://localhost:5173` |
| `JWT_SECRET` | Secret key used to sign and verify authentication tokens | **Yes** (in prod) | `development-super-secret-jwt-key-min-32-chars-change-in-production` |
| `JWT_EXPIRES_IN`| Token lifespan string (e.g. `8h`, `7d`) | No | `8h` |
| `DATABASE_URL` | MongoDB Atlas connection string for Prisma ORM | **Yes** | `mongodb+srv://<user>:<password>@<cluster-host>/apna_campus?...` |
| `GEMINI_API_KEY`| Google Gemini AI API key for Chatbot | No | *(Optional — falls back to deterministic Campus Engine)* |

### Frontend (`frontend/.env`)

| Variable | Description | Required? | Default / Example |
|---|---|---|---|
| `VITE_API_URL` | Base URL of NestJS API with `/api` path | **Yes** | `http://localhost:4000/api` |

---

## 🩺 Windows Troubleshooting Guide

### 1. `EPERM: operation not permitted` on `query_engine-windows.dll.node`
- **Cause**: Windows locks loaded native binary files (`.node` DLLs) while the NestJS backend process is running.
- **Fix**: Stop the running backend dev server (`Ctrl + C` in the backend terminal), run `npm run prisma:generate --prefix backend`, and then restart the server.

### 2. `Environment variable not found: DATABASE_URL`
- **Cause**: `backend/.env` is missing or was named incorrectly.
- **Fix**: Ensure `backend/.env` exists and contains a valid Atlas `mongodb+srv://` URI. Confirm the database user and Atlas IP/network access rule.

### 3. Atlas connection timeout or authentication failure
- **Cause**: Atlas network access does not include your IP, credentials are wrong, or the URI is malformed.
- **Fix**: Check the Atlas project's Network Access list, database user, URI encoding, and cluster status. Never paste the connection string into issue reports or chat.

### 4. `Port 4000 or 5173 is already in use`
- **Cause**: An orphaned Node process is holding the port.
- **Fix**: Find and terminate the process holding the port:
  ```powershell
  # Find PID on port 4000:
  Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | Select-Object OwningProcess
  # Stop the process (replace PID):
  Stop-Process -Id <PID> -Force
  ```

### 5. `Vite Frontend cannot connect to Backend (Network Error)`
- **Cause**: `VITE_API_URL` is pointing to the wrong URL or backend CORS is blocking.
- **Fix**:
  1. Verify `frontend/.env` has `VITE_API_URL=http://localhost:4000/api`.
  2. Verify backend is running by opening [http://localhost:4000/api/docs](http://localhost:4000/api/docs) in your browser.

---

## 🧪 Testing and Verification

Run the automated test suites:

```powershell
# Run backend TypeScript compilation check
npm run lint --prefix backend

# Run frontend Vitest test suite (62+ tests)
npm test --prefix frontend

# Test production builds
npm run build
```

---

## 📜 Available NPM Scripts

From the repository root:

- `npm run dev` — Starts both NestJS Backend and Vite Frontend concurrently with colored output.
- `npm run dev:backend` — Starts NestJS backend in watch mode.
- `npm run dev:frontend` — Starts Vite frontend in dev mode.
- `npm run install:all` — Installs dependencies across root, backend, and frontend.
- `npm run build` — Builds both backend (`nest build`) and frontend (`vite build`) for production.
- `npm run prisma:generate` — Generates backend Prisma Client.
- `npm run prisma:db-push` — Applies the Prisma MongoDB schema/indexes. Run only after checking the URI and confirming a safe target.
- `npm run setup:db` — Generates Prisma Client and pushes the schema. This writes to the configured database; verify the URI first.
- `npm run test:frontend` — Runs the frontend Vitest suite.

---

## 🚀 Cloud Deployment Guide (Backend on Render + Frontend on Vercel)

### Part 1: Deploy Backend on Render

Deploy the backend with a MongoDB Atlas cluster configured separately:

#### Method A: Using Render Blueprint (`render.yaml`) — Recommended
1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Connect your repository (`https://github.com/sahooprasadbishnu1234/CMS.git`) and branch (`backend`).
4. Render will detect [`render.yaml`](render.yaml) and automatically create:
   - **Web Service**: `apna-campus-backend` with all required build and start commands.
5. In the blueprint review:
   - Set `CLIENT_URL` to your Vercel URL (or `*` during initial setup).
6. Click **Apply**.
7. Once deployed, note your backend URL: `https://<your-backend-service>.onrender.com`.

#### Method B: Manual Web Service on Render
If configuring manually:
1. Create/configure a MongoDB Atlas cluster. Set its Network Access rules to allow the backend deployment's outbound connection, or use an appropriate private networking setup.
2. Click **New +** > **Web Service**.
3. Connect the GitHub repository and branch `backend`.
4. Configure settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: your private `mongodb+srv://...` Atlas connection string
   - `JWT_SECRET`: A long random secret string (32+ characters)
   - `JWT_EXPIRES_IN`: `8h`
   - `CLIENT_URL`: `https://<your-frontend-app>.vercel.app`
6. Click **Create Web Service**.
7. Test the health endpoint: `https://<your-backend>.onrender.com/api` should return `{"message":"..."}`.
8. Before first launch, run the reviewed Prisma `db push` explicitly against the intended Atlas database. Do not run a seed on production; use a dedicated development/test database for demo data.

---

### Part 2: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository (`CMS`).
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`.
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (or leave default)
5. Expand **Environment Variables**:
   - Add `VITE_API_URL`: `https://<your-backend>.onrender.com/api` *(Make sure to include `/api`!)*
6. Click **Deploy**.
7. Once deployment finishes, Vercel gives you a live production URL (e.g., `https://cms-frontend-xxxx.vercel.app`).
8. Copy this URL, go back to Render, and set `CLIENT_URL` to this Vercel URL in your backend environment variables.

