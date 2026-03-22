param(
  [int]$Port = 4173
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$rootPrefix = [System.IO.Path]::GetFullPath($repoRoot).TrimEnd("\")

$mimeTypes = @{
  ".css"  = "text/css; charset=utf-8"
  ".html" = "text/html; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png"  = "image/png"
  ".svg"  = "image/svg+xml; charset=utf-8"
  ".webp" = "image/webp"
}

function Get-TargetPath {
  param(
    [string]$RequestPath
  )

  $relativePath = [System.Uri]::UnescapeDataString($RequestPath.TrimStart("/").Replace("/", "\"))
  if ([string]::IsNullOrWhiteSpace($relativePath)) {
    $relativePath = "index.html"
  } elseif ($RequestPath.EndsWith("/")) {
    $relativePath = Join-Path $relativePath "index.html"
  }

  $fullPath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $relativePath))
  if (-not $fullPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Forbidden"
  }

  return $fullPath
}

function Write-Response {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [string]$ReasonPhrase,
    [byte[]]$Body,
    [string]$ContentType = "text/plain; charset=utf-8"
  )

  $headers = @(
    "HTTP/1.1 $StatusCode $ReasonPhrase",
    "Content-Type: $ContentType",
    "Content-Length: $($Body.Length)",
    "Cache-Control: no-store",
    "Connection: close",
    "X-Tinnsi-Local-Server: true",
    "",
    ""
  )

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes(($headers -join "`r`n"))
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
  $Stream.Flush()
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()

Write-Host "Tinnsi local server listening on http://127.0.0.1:$Port/"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        continue
      }

      while (($line = $reader.ReadLine()) -ne "") {
        if ($null -eq $line) {
          break
        }
      }

      $parts = $requestLine.Split(" ")
      if ($parts.Length -lt 2) {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
        Write-Response -Stream $stream -StatusCode 400 -ReasonPhrase "Bad Request" -Body $body
        continue
      }

      $method = $parts[0].ToUpperInvariant()
      if ($method -ne "GET" -and $method -ne "HEAD") {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
        Write-Response -Stream $stream -StatusCode 405 -ReasonPhrase "Method Not Allowed" -Body $body
        continue
      }

      $requestPath = $parts[1].Split("?")[0]

      try {
        $targetPath = Get-TargetPath -RequestPath $requestPath
        if (-not (Test-Path -LiteralPath $targetPath -PathType Leaf)) {
          $body = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
          Write-Response -Stream $stream -StatusCode 404 -ReasonPhrase "Not Found" -Body $body
          continue
        }

        $extension = [System.IO.Path]::GetExtension($targetPath).ToLowerInvariant()
        $contentType = if ($mimeTypes.ContainsKey($extension)) {
          $mimeTypes[$extension]
        } else {
          "application/octet-stream"
        }

        $bytes = [System.IO.File]::ReadAllBytes($targetPath)
        $body = if ($method -eq "HEAD") { [byte[]]::new(0) } else { $bytes }
        Write-Response -Stream $stream -StatusCode 200 -ReasonPhrase "OK" -Body $body -ContentType $contentType
      } catch {
        $message = $_.Exception.Message
        if ($message -eq "Forbidden") {
          $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
          Write-Response -Stream $stream -StatusCode 403 -ReasonPhrase "Forbidden" -Body $body
        } else {
          $body = [System.Text.Encoding]::UTF8.GetBytes("Internal Server Error")
          Write-Response -Stream $stream -StatusCode 500 -ReasonPhrase "Internal Server Error" -Body $body
        }
      }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
