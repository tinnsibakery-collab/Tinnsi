param(
  [int]$Port = 4173
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$startupPath = [Environment]::GetFolderPath("Startup")
$launcherPath = Join-Path $PSScriptRoot "launch-admin.ps1"
$startupWrapperPath = Join-Path $startupPath "Tinnsi Admin Startup.ps1"
$startupScriptPath = Join-Path $startupPath "Tinnsi Admin Startup.cmd"
$legacyVbsPath = Join-Path $startupPath "Tinnsi Admin Startup.vbs"

if (Test-Path -LiteralPath $legacyVbsPath) {
  Remove-Item -LiteralPath $legacyVbsPath -Force
}

$wrapperContent = @"
& "$launcherPath" -Port $Port
"@

$cmdContent = @"
@echo off
start "" powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0Tinnsi Admin Startup.ps1"
"@

Set-Content -LiteralPath $startupWrapperPath -Value $wrapperContent -Encoding Unicode
Set-Content -LiteralPath $startupScriptPath -Value $cmdContent -Encoding ASCII
Write-Host "Startup launcher installed at $startupScriptPath"
