#!/usr/bin/env pwsh
# SkillTwin — Start all services
# Usage: ./start.ps1

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        SkillTwin — Starting Up           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

# ── Step 1: Check .env ──────────────────────────────────────────────────
$envFile = Join-Path $root "apps\api\.env"
$envContent = Get-Content $envFile -Raw
if ($envContent -match "USERNAME:PASSWORD") {
    Write-Host "❌  ERROR: Please update apps/api/.env with your real MongoDB Atlas URL first!" -ForegroundColor Red
    Write-Host "    DATABASE_URL=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/skilltwin?retryWrites=true&w=majority" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# ── Step 2: Generate Prisma client ──────────────────────────────────────
Write-Host "⚙  Generating Prisma client..." -ForegroundColor Yellow
Set-Location (Join-Path $root "apps\api")
& pnpm exec prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "❌  Prisma generate failed" -ForegroundColor Red; exit 1 }
Write-Host "✅  Prisma client ready" -ForegroundColor Green

# ── Step 3: Push schema to MongoDB ──────────────────────────────────────
Write-Host "⚙  Pushing schema to MongoDB..." -ForegroundColor Yellow
& pnpm exec prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) { Write-Host "❌  DB push failed — check your MongoDB URL" -ForegroundColor Red; exit 1 }
Write-Host "✅  Schema synced to MongoDB" -ForegroundColor Green

# ── Step 4: Seed database ───────────────────────────────────────────────
Write-Host "⚙  Seeding database..." -ForegroundColor Yellow
& pnpm run prisma:seed
Write-Host "✅  Database seeded" -ForegroundColor Green

# ── Step 5: Launch API + Web in parallel ────────────────────────────────
Write-Host ""
Write-Host "🚀  Starting API (port 4000) and Web (port 5173)..." -ForegroundColor Cyan
Write-Host ""

Set-Location $root

$api = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Join-Path $root 'apps\api')'; npm run dev" -PassThru
$web = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Join-Path $root 'apps\web')'; npx vite --port 5173" -PassThru

Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  🌐 Frontend:  http://localhost:5173     ║" -ForegroundColor Green
Write-Host "║  🔌 API:       http://localhost:4000     ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop." -ForegroundColor Gray
Write-Host ""

# Keep this window open
Wait-Process -Id $api.Id, $web.Id
