# Guarda en GitHub las 2 claves que necesitan los agentes y lanza la primera jornada.
# Uso: clic derecho -> Ejecutar con PowerShell   (o: powershell -ExecutionPolicy Bypass -File prueba\claves-agentes.ps1)
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host ""
Write-Host "1) Clave de Anthropic" -ForegroundColor Yellow
Write-Host "   Recomendado: crea una clave NUEVA en https://console.anthropic.com/settings/keys llamada 'relatos-agentes'"
Write-Host "   (usa el mismo saldo de AUREN, pero la puedes borrar sola sin tocar AUREN). Los agentes gastan maximo USD 4 al mes."
$seg = Read-Host "   Pega la clave (no se ve al pegar) y pulsa Enter" -AsSecureString
$clave = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($seg))
if (-not $clave.StartsWith("sk-ant-")) { Write-Host "Eso no parece una clave de Anthropic (empieza con sk-ant-)." -ForegroundColor Red; exit 1 }
$clave | node scripts/secreto-github.mjs ANTHROPIC_API_KEY
$clave = $null

Write-Host ""
Write-Host "2) Clave de los agentes (se toma sola de esta PC)" -ForegroundColor Yellow
Get-Content "$HOME\.relatos-secretos\agente-clave.txt" -Raw | node scripts/secreto-github.mjs AGENTE_CLAVE

Write-Host ""
Write-Host "3) Primera jornada" -ForegroundColor Yellow
$tok = (("protocol=https`nhost=github.com`n`n" | git credential fill) | Select-String "^password=").ToString().Substring(9)
Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/amazonluiggi-design/relatos-mitad/actions/workflows/jornada.yml/dispatches" -Headers @{ Authorization = "Bearer $tok"; Accept = "application/vnd.github+json" } -Body '{"ref":"main"}' | Out-Null
Write-Host "Listo. La jornada ya empezo: miralo en el panel (Oficina) en 2-3 minutos." -ForegroundColor Green
Read-Host "Pulsa Enter para cerrar"
