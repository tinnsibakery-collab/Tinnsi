param(
  [int]$Port = 4173,
  [switch]$OpenStorefront
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$serverScript = Join-Path $PSScriptRoot "serve-local.ps1"
$adminUrl = "http://127.0.0.1:$Port/admin/"
$frontUrl = "http://127.0.0.1:$Port/"

function Test-TinnsiServer {
  param(
    [int]$CheckPort
  )

  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$CheckPort/admin/" -UseBasicParsing -TimeoutSec 2
    return $response.Headers["X-Tinnsi-Local-Server"] -eq "true"
  } catch {
    return $false
  }
}

if (-not (Test-TinnsiServer -CheckPort $Port)) {
  Start-Process -FilePath "powershell.exe" -WindowStyle Hidden -ArgumentList @(
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    "`"$serverScript`"",
    "-Port",
    "$Port"
  ) | Out-Null

  $serverReady = $false
  for ($attempt = 0; $attempt -lt 20; $attempt += 1) {
    Start-Sleep -Milliseconds 500
    if (Test-TinnsiServer -CheckPort $Port) {
      $serverReady = $true
      break
    }
  }

  if (-not $serverReady) {
    throw "The local admin server did not start on port $Port."
  }
}

Start-Process $adminUrl | Out-Null
if ($OpenStorefront) {
  Start-Process $frontUrl | Out-Null
}
