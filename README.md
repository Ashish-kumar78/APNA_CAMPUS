# Apna Campus — College Management System (Monorepo)

> **Enterprise-grade, Autonomous College ERP & Academic Management System** built for Autonomous BPUT Institutions, featuring 14 dedicated role portals, biometric tracking, fee verification, digital clearance, examination cell, and AI assistance.

---

## 🏛️ Architecture Overview

The repository is structured as a full-stack monorepo:

| Layer | Technology | Default Port | Description |
|---|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons | `5173` | Responsive web portals for all campus roles |
| **Backend** | NestJS 10, TypeScript, Passport JWT, Swagger | `4000` | REST API with global validation, RBAC guards, and filters |
| **Database** | PostgreSQL, Prisma ORM 5.22 | `5432` | Relational schema with migrations and idempotent seed scripts |

### Monorepo Structure

```
CMS/
├── backend/                  # NestJS API Server
│   ├── prisma/
│   │   ├── migrations/       # Committed version-controlled Prisma migrations
│   │   ├── schema.prisma     # Active PostgreSQL Prisma data models
│   │   └── seed.ts           # Comprehensive seed script (14 roles, departments, subjects)
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
3. **PostgreSQL**: `v14` or higher (running locally or in Docker)
   - Check with: `psql --version`
4. **PowerShell**: Windows PowerShell 5.1 or PowerShell 7+

---

## ⚡ Option A: Automated Developer Setup (Recommended)

Run the included PowerShell onboarding script from the repository root. It checks prerequisites, copies `.env` templates without overwriting existing files, validates configuration keys, installs dependencies, and verifies database connectivity:

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
# 1. Create Backend environment file
Copy-Item backend\.env.example backend\.env

# 2. Create Frontend environment file
Copy-Item frontend\.env.example frontend\.env

# 3. Create Root environment file (optional for root scripts)
Copy-Item .env.example .env
```

Open `backend\.env` in your text editor and adjust `DATABASE_URL` with your local PostgreSQL password:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/college_management?schema=public"
```

### Step 3: Set Up Local PostgreSQL Database

Ensure PostgreSQL is running on your machine:

```powershell
# Check PostgreSQL Windows Service
Get-Service -Name postgresql* | Start-Service

# Create the database using PostgreSQL CLI (psql)
psql -U postgres -c "CREATE DATABASE college_management;"
```

*(If prompted, enter your PostgreSQL superuser password).*

### Step 4: Install Dependencies

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

### Step 5: Generate Prisma Client

Generate the Prisma Client types and query engine for the backend:

```powershell
npm run prisma:generate --prefix backend
```

> **Windows Note**: Always ensure any running backend dev servers are stopped before regenerating the Prisma client, as Windows locks active DLL files (`query_engine-windows.dll.node`).

### Step 6: Apply Database Migrations

Apply the committed version-controlled Prisma migrations to your new local database:

```powershell
npm run prisma:migrate --prefix backend
```

This creates all database tables, enums, indexes, and foreign keys.

### Step 7: Seed Initial Autonomous ERP Records (Optional but Recommended)

Populate default demo users across all 14 roles, departments (CSE, AIML, ECE, EEE, MECH, CIVIL, MBA, MCA), subjects, and initial campus configurations:

```powershell
npm run prisma:seed --prefix backend
```

### Step 8: Start the Application

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

## 🔑 Default Demo Accounts

After running `npm run prisma:seed --prefix backend`, the following accounts are available for instant testing (default password for all demo accounts: `gift123`):

| Role | Username / Identifier | Email | Portal Access |
|---|---|---|---|
| **Super Admin** | `superadmin` / `SA-001` | `superadmin@gift.edu.in` | Full System Governance & Security |
| **Principal** | `principal` / `PRN-001` | `principal@gift.edu.in` | Executive Institution Dashboard |
| **HOD (CSE)** | `hod` / `HOD-CSE-001` | `hod.cse@gift.edu.in` | Department Analytics & Mark Verification |
| **Faculty** | `faculty` / `FAC-CSE-001` | `faculty@gift.edu.in` | Attendance, Marks Entry & Notes Moderation |
| **Student** | `student` / `2305201001` | `student@gift.edu.in` | Student Academic Portal & Gate Pass |
| **Accounts** | `accounts` / `ACC-001` | `accounts@gift.edu.in` | Fee Receipts & Payment Proof Approvals |
| **Hostel Warden** | `warden` / `HSTL-001` | `warden.demo@gift.edu.in` | Hostel Allotment, Rooms & Night Passes |
| **Smart Canteen**| `canteen` / `CAN-001` | `canteen.demo@gift.edu.in` | Token Verification & Food Orders |

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
| `DATABASE_URL` | PostgreSQL connection string for Prisma ORM | **Yes** | `postgresql://postgres:postgres@localhost:5432/college_management?schema=public` |
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
- **Fix**: Ensure `backend/.env` exists. Run `Copy-Item backend\.env.example backend\.env` and configure your PostgreSQL password.

### 3. `Can't reach database server at localhost:5432`
- **Cause**: PostgreSQL service is stopped or listening on a different port.
- **Fix**:
  1. Open PowerShell as Administrator and run: `Get-Service -Name postgresql* | Start-Service`
  2. Verify PostgreSQL is listening: `Test-NetConnection -ComputerName localhost -Port 5432`
  3. Verify username and password: `psql -U postgres -d college_management`

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
- `npm run prisma:migrate` — Deploys Prisma migrations to the configured PostgreSQL database.
- `npm run prisma:seed` — Runs the idempotent database seed script.
- `npm run setup:db` — Runs Prisma generate, migrate, and seed in sequence.
- `npm run test:frontend` — Runs the frontend Vitest suite.
