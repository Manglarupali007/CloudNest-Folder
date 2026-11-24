# CloudNest All-in-One Startup Script

Write-Host "CloudNest Development Environment Starting..." -ForegroundColor Cyan

# 1. Start MongoDB if not already running on port 27017
$mongoProc = Get-Process mongod -ErrorAction SilentlyContinue
if (-not $mongoProc) {
    Write-Host "Starting MongoDB Server..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "data\db" -Force | Out-Null
    Start-Process -FilePath "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" -ArgumentList "--dbpath data\db --port 27017" -WindowStyle Hidden
    Start-Sleep -Seconds 2
    Write-Host "MongoDB Server started on port 27017" -ForegroundColor Green
} else {
    Write-Host "MongoDB already running on port 27017" -ForegroundColor Green
}

# 2. Start Backend API in a dedicated background window
Write-Host "Launching Backend API on http://localhost:5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start"

# 3. Start Frontend Vite Dev Server in a dedicated background window
Write-Host "Launching React Client on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"

Write-Host "`nCloudNest is now running!" -ForegroundColor Green
Write-Host "Open http://localhost:5173 in your browser." -ForegroundColor White
Write-Host "Click Demo Account to test immediately.`n" -ForegroundColor Yellow
