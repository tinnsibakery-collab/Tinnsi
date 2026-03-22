param(
  [string[]]$PlaywrightArgs = @()
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$setupScript = Join-Path $PSScriptRoot "setup-playwright.ps1"
$nodeDir = Join-Path $repoRoot ".tools\\node-v20.20.1-win-x64"

if (-not (Test-Path -LiteralPath $nodeDir)) {
  & $setupScript
}

$env:PATH = "$nodeDir;$env:PATH"
$npx = Join-Path $nodeDir "npx.cmd"
Push-Location $repoRoot
try {
  & $npx playwright test @PlaywrightArgs
} finally {
  Pop-Location
}
