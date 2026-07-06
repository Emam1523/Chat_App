Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  ngrok Setup" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "You need a free ngrok account to use this feature." -ForegroundColor White
Write-Host ""
Write-Host "Step 1: Sign up at https://dashboard.ngrok.com/signup" -ForegroundColor Cyan
Write-Host "Step 2: Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Cyan
Write-Host ""
$token = Read-Host "Paste your ngrok authtoken here (or press Enter to skip)"

if ($token) {
    $ngrokDir = Join-Path $PSScriptRoot "ngrok-v3-stable-windows-amd64"
    $ngrokExe = Join-Path $ngrokDir "ngrok.exe"
    
    if (-not (Test-Path $ngrokExe)) {
        Write-Error "ngrok.exe not found at $ngrokExe"
        exit 1
    }
    
    & $ngrokExe config add-authtoken $token
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Authtoken configured successfully!" -ForegroundColor Green
        Write-Host "You can now run .\start-ngrok.ps1" -ForegroundColor Cyan
    } else {
        Write-Error "Failed to configure authtoken"
    }
} else {
    Write-Host "Skipped. Run this script again when you have your token." -ForegroundColor Yellow
}
