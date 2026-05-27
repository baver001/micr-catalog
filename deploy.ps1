# Deploy script for micr.fun (PowerShell)
# This script deploys both Worker and Frontend

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying micr.fun..." -ForegroundColor Cyan

# Check if wrangler is installed
if (!(Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Wrangler is not installed. Install it with: npm install -g wrangler" -ForegroundColor Red
    exit 1
}

# Check if netlify is installed
if (!(Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Netlify CLI is not installed. Install it with: npm install -g netlify-cli" -ForegroundColor Red
    exit 1
}

# Deploy Worker
Write-Host "📦 Deploying Cloudflare Worker..." -ForegroundColor Blue
wrangler deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Worker deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Worker deployment failed!" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Deploy to Netlify
Write-Host "📤 Deploying to Netlify..." -ForegroundColor Blue
netlify deploy --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Check your sites:"
Write-Host "  🌐 Frontend: https://micr.fun"
Write-Host "  🔌 API: https://api.micr.fun/api/apps"
