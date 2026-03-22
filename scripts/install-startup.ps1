param(
  [int]$Port = 4173
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$startupPath = [Environment]::GetFolderPath("Startup")
$launcherPath = Join-Path $PSScriptRoot "launch-admin.ps1"
$startupScriptPath = Join-Path $startupPath "Tinnsi Admin Startup.vbs"

$command = "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File ""$launcherPath"" -Port $Port"
$escapedCommand = $command.Replace("""", """""")

$vbsContent = @"
Set shell = CreateObject("WScript.Shell")
shell.Run "$escapedCommand", 0, False
"@

Set-Content -LiteralPath $startupScriptPath -Value $vbsContent -Encoding Unicode
Write-Host "Startup launcher installed at $startupScriptPath"
