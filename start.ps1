Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Iniciando Sistema de Monitoreo de Servidores" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API: http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend UI: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Presione Ctrl+C para detener ambos servicios" -ForegroundColor Yellow
Write-Host ""

Set-Location $PSScriptRoot
npm start
