# Start the Vizy development server for another device on the same trusted Wi-Fi.
# Run from any PowerShell working directory: powershell -ExecutionPolicy Bypass -File scripts/vizy-lan-start.ps1
param([int]$Port=4197)
$ErrorActionPreference='Stop'
$project=Split-Path -Parent $PSScriptRoot
Set-Location $project
$ip=Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -and $_.IPv4Address } |
  ForEach-Object { $_.IPv4Address.IPAddress } | Select-Object -First 1
if(-not $ip) { Write-Error 'No active IPv4 Wi-Fi or LAN address detected.'; exit 1 }
Write-Output ('Open on the phone on the same Wi-Fi: http://'+$ip+':'+$Port+'/learn.html')
Write-Output 'This is a development server. Stop it with Ctrl+C after testing.'
Write-Output 'If another device cannot open it, check Windows network profile and the inbound firewall rule.'
& node '.\node_modules\vite\bin\vite.js' --host 0.0.0.0 --port $Port --strictPort
