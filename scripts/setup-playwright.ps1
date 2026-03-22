Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$repoRoot = Split-Path -Parent $PSScriptRoot
$toolsRoot = Join-Path $repoRoot ".tools"
$nodeVersion = "v20.20.1"
$nodeFolderName = "node-$nodeVersion-win-x64"
$nodeDir = Join-Path $toolsRoot $nodeFolderName
$zipPath = Join-Path $toolsRoot "$nodeFolderName.zip"

if (-not (Test-Path -LiteralPath $nodeDir)) {
  New-Item -ItemType Directory -Force -Path $toolsRoot | Out-Null
  Invoke-WebRequest -Uri "https://nodejs.org/dist/$nodeVersion/$nodeFolderName.zip" -OutFile $zipPath
  Expand-Archive -Path $zipPath -DestinationPath $toolsRoot -Force
}

$npm = Join-Path $nodeDir "npm.cmd"
Push-Location $repoRoot
try {
  & $npm install
} finally {
  Pop-Location
}
