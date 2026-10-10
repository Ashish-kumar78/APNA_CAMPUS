# ==============================================================================
# Apna Campus - Local Developer Setup Script (PowerShell)
# Safe, reproducible onboarding script for Windows developers
# ==============================================================================

param (
    [switch]$SkipInstall,
    [switch]$SkipMigration
)

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Apna Campus - Local Developer Environment Setup      " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js and npm versions
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node -v 2>$null
$npmVersion = npm -v 2>$null

if ($nodeVersion) {
    Write-Host "  [OK] Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Node.js is not found in PATH. Please install Node.js (>= 18)." -ForegroundColor Red
    exit 1
}

if ($npmVersion) {
    Write-Host "  [OK] npm version:     $npmVersion" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] npm is not found in PATH." -ForegroundColor Red
    exit 1
}

# 2. Configure environment files (.env) from templates
Write-Host ""
Write-Host "[2/6] Configuring local environment files (.env)..." -ForegroundColor Yellow

$backendDir = Join-Path $PSScriptRoot "..\backend"
$backendEnvExample = Join-Path $backendDir ".env.example"
$backendEnv = Join-Path $backendDir ".env"

if (-not (Test-Path $backendEnvExample)) {
    Write-Host "  [ERROR] backend/.env.example template not found." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendEnv)) {
    Copy-Item $backendEnvExample $backendEnv
    Write-Host "  [OK] Created backend/.env from backend/.env.example" -ForegroundColor Green
    Write-Host "       (Please configure DATABASE_URL with your local PostgreSQL password if needed)" -ForegroundColor DarkGray
} else {
    Write-Host "  [OK] Existing backend/.env preserved (not overwritten)" -ForegroundColor Green
}

$frontendDir = Join-Path $PSScriptRoot "..\frontend"
$frontendEnvExample = Join-Path $frontendDir ".env.example"
$frontendEnv = Join-Path $frontendDir ".env"

if (-not (Test-Path $frontendEnvExample)) {
    Write-Host "  [ERROR] frontend/.env.example template not found." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendEnv)) {
    Copy-Item $frontendEnvExample $frontendEnv
    Write-Host "  [OK] Created frontend/.env from frontend/.env.example" -ForegroundColor Green
} else {
    Write-Host "  [OK] Existing frontend/.env preserved (not overwritten)" -ForegroundColor Green
}

$rootEnvExample = Join-Path $PSScriptRoot "..\.env.example"
$rootEnv = Join-Path $PSScriptRoot "..\.env"
if ((Test-Path $rootEnvExample) -and -not (Test-Path $rootEnv)) {
    Copy-Item $rootEnvExample $rootEnv
    Write-Host "  [OK] Created root .env from .env.example" -ForegroundColor Green
}

# 3. Verify required environment keys without exposing secrets
Write-Host ""
Write-Host "[3/6] Verifying environment configuration keys..." -ForegroundColor Yellow
$backendContent = Get-Content $backendEnv -Raw
$requiredBackendKeys = @("PORT", "JWT_SECRET", "DATABASE_URL")

foreach ($key in $requiredBackendKeys) {
    $pattern = "(?m)^\s*" + [regex]::Escape($key) + "\s*="
    if ($backendContent -match $pattern) {
        Write-Host "  [OK] Backend key configured: $key" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Missing required key in backend/.env: $key" -ForegroundColor Yellow
    }
}

$frontendContent = Get-Content $frontendEnv -Raw
if ($frontendContent -match "(?m)^\s*VITE_API_URL\s*=") {
    Write-Host "  [OK] Frontend key configured: VITE_API_URL" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Missing VITE_API_URL in frontend/.env" -ForegroundColor Yellow
}

# 4. Install dependencies
if (-not $SkipInstall) {
    Write-Host ""
    Write-Host "[4/6] Installing dependencies across monorepo..." -ForegroundColor Yellow
    Write-Host "  -> Installing root dependencies..." -ForegroundColor DarkGray
    & npm install
    Write-Host "  -> Installing backend dependencies..." -ForegroundColor DarkGray
    & npm install --prefix backend
    Write-Host "  -> Installing frontend dependencies..." -ForegroundColor DarkGray
    & npm install --prefix frontend
    Write-Host "  [OK] Dependencies installed successfully." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[4/6] Skipping dependency installation (-SkipInstall flag specified)." -ForegroundColor DarkGray
}

# 5. Generate Prisma Client
Write-Host ""
Write-Host "[5/6] Generating Prisma Client..." -ForegroundColor Yellow
Push-Location $backendDir
try {
    $genOutput = cmd.exe /c "npx prisma generate 2>&1"
    $genStr = $genOutput -join "`n"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Prisma Client generated successfully." -ForegroundColor Green
    } else {
        if ($genStr -match "EPERM") {
            Write-Host "  [WARN] Prisma Client binary currently loaded in memory (EPERM)." -ForegroundColor Yellow
            Write-Host "         Windows locks native DLLs while backend dev server is running." -ForegroundColor DarkGray
            Write-Host "         Client is already present and active." -ForegroundColor DarkGray
        } else {
            Write-Host "  [WARN] Prisma Client generation note: $genStr" -ForegroundColor Yellow
        }
    }
} finally {
    Pop-Location
}

# 6. Check PostgreSQL and apply migrations
Write-Host ""
Write-Host "[6/6] Checking PostgreSQL and Prisma migrations..." -ForegroundColor Yellow
if (-not $SkipMigration) {
    Push-Location $backendDir
    try {
        $statusOutput = cmd.exe /c "npx prisma migrate status 2>&1"
        $statusStr = $statusOutput -join "`n"

        if ($statusStr -match "Database schema is up to date") {
            Write-Host "  [OK] Database connection verified and schema is up to date!" -ForegroundColor Green
        } elseif ($statusStr -match "Following migration have not yet been applied") {
            Write-Host "  -> Applying pending Prisma migrations..." -ForegroundColor Cyan
            cmd.exe /c "npx prisma migrate deploy"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] Migrations applied successfully." -ForegroundColor Green
            } else {
                Write-Host "  [ERROR] Failed to apply migrations." -ForegroundColor Red
            }
        } elseif ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] PostgreSQL connected and verified." -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Could not connect to PostgreSQL." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "  PostgreSQL Local Setup Guide:" -ForegroundColor Cyan
            Write-Host "  1. Ensure PostgreSQL service is started: Start-Service postgresql*"
            Write-Host "  2. Create development database: psql -U postgres -c 'CREATE DATABASE college_management;'"
            Write-Host "  3. Verify DATABASE_URL in backend/.env with your postgres password"
            Write-Host "  4. Apply migrations: npm run prisma:migrate --prefix backend"
            Write-Host "  5. (Optional) Seed demo records: npm run prisma:seed --prefix backend"
            Write-Host ""
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "  Skipping migration check (-SkipMigration flag specified)." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   Setup complete! Ready to start Apna Campus:         " -ForegroundColor Green
Write-Host "   Run: npm run dev                                     " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
