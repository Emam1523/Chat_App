param(
    [string]$Authtoken = ""
)

$ngrokDir = Join-Path $PSScriptRoot "ngrok-v3-stable-windows-amd64"
$ngrokExe = Join-Path $ngrokDir "ngrok.exe"

if (-not (Test-Path $ngrokExe)) {
    Write-Error "ngrok.exe not found at $ngrokExe"
    exit 1
}

if ($Authtoken) {
    & $ngrokExe config add-authtoken $Authtoken
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to set authtoken"
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Starting ngrok tunnels..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Server   : http://localhost:5000" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""

& $ngrokExe start --all --config (Join-Path $PSScriptRoot "ngrok.yml")
