Write-Host "Building frontend..." -ForegroundColor Cyan
Set-Location -LiteralPath "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed"
    exit 1
}

Write-Host "Starting server..." -ForegroundColor Cyan
Set-Location -LiteralPath "$PSScriptRoot\server"
$serverProc = Start-Process -FilePath "node" -ArgumentList "src/index.js" -NoNewWindow -PassThru

Start-Sleep -Seconds 2

Write-Host "Starting ngrok..." -ForegroundColor Cyan
$ngrokDir = Join-Path $PSScriptRoot "ngrok-v3-stable-windows-amd64"
$ngrokExe = Join-Path $ngrokDir "ngrok.exe"
$ngrokProc = Start-Process -FilePath $ngrokExe -ArgumentList "start --all --config `"$PSScriptRoot\ngrok.yml`"" -NoNewWindow -PassThru

Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  App is running!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Server: http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Ngrok:  Check terminal output for URL" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Yellow

try {
    Wait-Process -Id $serverProc.Id
} finally {
    Stop-Process -Id $ngrokProc.Id -Force -ErrorAction SilentlyContinue
}
